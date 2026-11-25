"""Small, dependency-free helpers for building Catweb JSON in Python.

Values passed to ``props`` are kept exactly as supplied. Use strings for fields
whose Catweb examples use strings (for example ``size`` and ``font_size``).
This module checks the document's basic tree shape; only Catweb can confirm that
the game accepts a particular object or property.
"""

from __future__ import annotations

import json
import secrets
from pathlib import Path
from typing import Any


def _globalid() -> str:
    """Return a short opaque identifier, unique within a generated document."""
    return secrets.token_hex(4)


def object_(class_name: str, /, *, globalid: str | None = None,
            children: list[dict[str, Any]] | None = None,
            **props: Any) -> dict[str, Any]:
    """Create a Catweb tree object without coercing property values."""
    if not class_name:
        raise ValueError("class_name cannot be empty")
    result: dict[str, Any] = {"class": class_name,
                              "globalid": globalid or _globalid()}
    result.update(props)
    if class_name != "script" or children is not None:
        result["children"] = list(children or [])
    return result


def folder(*children: dict[str, Any], globalid: str | None = None) -> dict[str, Any]:
    """Create the required array-root folder used by files.json."""
    return object_("Folder", globalid=globalid, children=list(children))


def frame(*children: dict[str, Any], **props: Any) -> dict[str, Any]:
    return object_("Frame", children=list(children), **props)


def text_label(text: str, **props: Any) -> dict[str, Any]:
    return object_("TextLabel", text=text, children=[], **props)


def text_button(text: str, **props: Any) -> dict[str, Any]:
    return object_("TextButton", text=text, children=[], **props)


def script(*content: dict[str, Any], globalid: str | None = None) -> dict[str, Any]:
    """Wrap raw catalog blocks; block schemas and ordering remain caller-owned."""
    return object_("script", globalid=globalid, content=list(content))


def validate(document: Any) -> list[str]:
    """Return structural issues without guessing undocumented Catweb rules."""
    issues: list[str] = []
    if not isinstance(document, list) or not document:
        return ["Document must be a non-empty JSON array."]
    if len(document) != 1 or not isinstance(document[0], dict):
        return ["Expected one root object inside the JSON array."]
    if document[0].get("class") != "Folder":
        issues.append('Root object must have class "Folder".')
    seen: set[str] = set()

    def visit_block(block: Any, path: str) -> None:
        if not isinstance(block, dict):
            issues.append(f"{path} must be a block object.")
            return
        actions = block.get("actions", [])
        if not isinstance(actions, list):
            issues.append(f"{path}.actions must be an array.")
            return
        for index, action in enumerate(actions):
            visit_block(action, f"{path}.actions[{index}]")

    def visit(node: Any, path: str) -> None:
        if not isinstance(node, dict):
            issues.append(f"{path} must be an object.")
            return
        if not isinstance(node.get("class"), str) or not node["class"]:
            issues.append(f"{path}.class must be a non-empty string.")
        gid = node.get("globalid")
        if not isinstance(gid, str) or not gid:
            issues.append(f"{path}.globalid must be a non-empty string.")
        elif gid in seen:
            issues.append(f"{path}.globalid duplicates {gid!r}.")
        else:
            seen.add(gid)
        children = node.get("children", [])
        if not isinstance(children, list):
            issues.append(f"{path}.children must be an array.")
        else:
            for index, child in enumerate(children):
                visit(child, f"{path}.children[{index}]")
        if node.get("class") == "script":
            content = node.get("content")
            if not isinstance(content, list):
                issues.append(f"{path}.content must be an array.")
            else:
                for index, block in enumerate(content):
                    visit_block(block, f"{path}.content[{index}]")

    visit(document[0], "root[0]")
    return issues


def save(document: list[dict[str, Any]], path: str | Path, *, pretty: bool = False) -> Path:
    """Validate and write compact importable JSON (or readable JSON with pretty=True)."""
    issues = validate(document)
    if issues:
        raise ValueError("Invalid Catweb document:\n- " + "\n- ".join(issues))
    output = Path(path)
    output.parent.mkdir(parents=True, exist_ok=True)
    options = {"indent": 4} if pretty else {"separators": (",", ":")}
    output.write_text(json.dumps(document, ensure_ascii=False, **options) + "\n",
                      encoding="utf-8")
    return output
