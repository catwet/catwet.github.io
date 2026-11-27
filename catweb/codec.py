"""Field-aware Catweb project serialization for identifiers and string values."""

from __future__ import annotations

import copy
import json
import re
import warnings
from pathlib import Path
from typing import Any

from .encoder_v2py import decode_text, encode_text

ROOT = Path(__file__).resolve().parents[1]
_ENCODE_TABLE_PATH = ROOT / "data" / "ENCODE.json"
_ENCODE_TABLE: dict[str, str] = json.loads(_ENCODE_TABLE_PATH.read_text(encoding="utf-8"))
if not isinstance(_ENCODE_TABLE, dict) or not all(
    key.isdecimal() and isinstance(value, str) and len(value) == 1
    for key, value in _ENCODE_TABLE.items()
):
    raise RuntimeError(f"{_ENCODE_TABLE_PATH} must map numeric indices to single characters.")
_STRING_TO_CODE = {value: key for key, value in _ENCODE_TABLE.items()}
if len(_STRING_TO_CODE) != len(_ENCODE_TABLE):
    raise RuntimeError(f"{_ENCODE_TABLE_PATH} contains duplicate character values.")

_VARIABLE_LABELS = {"variable", "variable?"}
_IDENTIFIER_PATTERN = re.compile(r"[A-Za-z_][\w-]*\Z")
_NUMERIC_IDENTIFIER_PATTERN = re.compile(r"(?:[0-9]{2})+\Z")
_ENCODED_STRING_PATTERN = re.compile(r"(?:\{[0-9]+\})*\Z")
_SCOPED_VARIABLE_REFERENCE = re.compile(r"\{[lo]![A-Za-z_][\w-]*\}\Z")


class CatwebCodecError(ValueError):
    """Raised when a project field cannot be encoded without data loss."""


class CatwebCodecWarning(UserWarning):
    """Warns when an unsupported string must be preserved without encoding."""


def _encode_string(value: str, path: str) -> str:
    encoded: list[str] = []
    for index, character in enumerate(value):
        code = _STRING_TO_CODE.get(character)
        if code is None:
            warnings.warn(
                f"{path}: ENCODE.json does not support character {character!r} at index {index}; "
                "the complete string was preserved literally.",
                CatwebCodecWarning,
                stacklevel=2,
            )
            return value
        encoded.append(f"{{{code}}}")
    return "".join(encoded)


def _decode_string(value: str) -> str:
    if not _ENCODED_STRING_PATTERN.fullmatch(value):
        return value
    tokens = re.findall(r"\{([0-9]+)\}", value)
    if any(token not in _ENCODE_TABLE for token in tokens):
        return value
    return "".join(_ENCODE_TABLE[token] for token in tokens)


def _encode_identifier(value: str, path: str) -> str:
    try:
        return encode_text(value)
    except (TypeError, ValueError) as exc:
        raise CatwebCodecError(f"{path}: cannot encode identifier: {exc}") from exc


def _decode_identifier(value: str) -> str:
    if not _NUMERIC_IDENTIFIER_PATTERN.fullmatch(value):
        return value
    try:
        decoded = decode_text(value)
    except (TypeError, ValueError):
        return value
    if not _IDENTIFIER_PATTERN.fullmatch(decoded) or encode_text(decoded) != value:
        return value
    return decoded


def _transform_typed_value(field: dict[str, Any], path: str, decode: bool) -> None:
    value = field.get("value")
    if isinstance(value, str):
        if field.get("l") == "comment":
            return
        if field.get("l") in _VARIABLE_LABELS:
            if not _SCOPED_VARIABLE_REFERENCE.fullmatch(value):
                field["value"] = _decode_identifier(value) if decode else _encode_identifier(value, path)
        elif field.get("t") in {"string", "any"}:
            field["value"] = _decode_string(value) if decode else _encode_string(value, path)
    elif isinstance(value, (list, dict)):
        field["value"] = _transform_nested_value(value, path, decode)


def _transform_nested_value(value: Any, path: str, decode: bool) -> Any:
    if isinstance(value, str):
        return _decode_string(value) if decode else _encode_string(value, path)
    if isinstance(value, list):
        return [
            _transform_nested_value(item, f"{path}[{index}]", decode)
            for index, item in enumerate(value)
        ]
    if isinstance(value, dict):
        if "value" in value and ("t" in value or "l" in value):
            _transform_typed_value(value, f"{path}.value", decode)
        else:
            for key, item in value.items():
                value[key] = _transform_nested_value(item, f"{path}.{key}", decode)
    return value


def _transform_block(node: dict[str, Any], scope: str, catalog: Any, path: str, decode: bool) -> None:
    template = catalog.match_existing(scope, node)
    if template:
        fields = [part for part in node.get("text", []) if isinstance(part, dict)]
        for index, field in enumerate(fields):
            field_path = f"{path}.text[field {index}]"
            _transform_typed_value(field, field_path, decode)
        if decode:
            for index, part in enumerate(node.get("text", [])):
                if isinstance(part, str) and index < len(template.node.get("text", [])):
                    original = template.node["text"][index]
                    if isinstance(original, str):
                        node["text"][index] = original
        elif (
            scope == "top"
            and template.category == "events"
            and str(node.get("id")) == "0"
            and "".join(part for part in node.get("text", []) if isinstance(part, str)).strip()
            == "When website loaded..."
        ):
            node["text"] = ["" if isinstance(part, str) else part for part in node.get("text", [])]
    for index, action in enumerate(node.get("actions", [])):
        if isinstance(action, dict):
            _transform_block(action, "block", catalog, f"{path}.actions[{index}]", decode)


def transform_project(project: Any, catalog: Any, *, decode: bool) -> Any:
    """Transform known Catweb argument fields while preserving project structure."""
    transformed = copy.deepcopy(project)
    roots = transformed if isinstance(transformed, list) else [transformed]

    def visit(node: Any, path: str) -> None:
        if not isinstance(node, dict):
            return
        if node.get("class") == "script":
            content = node.get("content", [])
            if isinstance(content, list):
                for index, top in enumerate(content):
                    if isinstance(top, dict):
                        _transform_block(top, "top", catalog, f"{path}.content[{index}]", decode)
        for index, child in enumerate(node.get("children", [])):
            visit(child, f"{path}.children[{index}]")

    for index, root in enumerate(roots):
        visit(root, f"project[{index}]")
    return transformed


def encode_project(project: Any, catalog: Any) -> Any:
    """Encode variable identifiers and ordinary string arguments in a project."""
    return transform_project(project, catalog, decode=False)


def decode_project(project: Any, catalog: Any) -> Any:
    """Auto-decode canonical numeric identifiers and ENCODE string tokens."""
    return transform_project(project, catalog, decode=True)


def decode_content(content: list[dict[str, Any]], catalog: Any) -> list[dict[str, Any]]:
    """Decode a script content list before converting it to readable CSL."""
    transformed = copy.deepcopy(content)
    for index, top in enumerate(transformed):
        if isinstance(top, dict):
            _transform_block(top, "top", catalog, f"content[{index}]", True)
    return transformed
