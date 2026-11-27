"""Compile Catweb Script Language (CSL) using the repository's block catalog."""

from __future__ import annotations

import argparse
import ast
import copy
import json
import re
import secrets
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .codec import CatwebCodecError, decode_content, encode_project

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "data" / "catalog"
MISSING = {"$missing": True}


class CompileError(ValueError):
    """A source error with a line number suitable for the editor or CLI."""


@dataclass
class Template:
    scope: str
    category: str
    block_id: str
    key: str
    node: dict[str, Any]
    signature: tuple[Any, ...]
    opens_scope: bool = False
    end_template: Template | None = None
    else_template: Template | None = None
    call_name: str | None = None
    parameters: list[dict[str, Any]] = field(default_factory=list)


def _gid() -> str:
    return secrets.token_hex(5)


def _stable(value: Any) -> Any:
    if isinstance(value, dict):
        return tuple(sorted((key, _stable(item)) for key, item in value.items()))
    if isinstance(value, (list, tuple)):
        return tuple(_stable(item) for item in value)
    return value


def _text_signature(node: dict[str, Any], *, blank_labels: bool = False) -> tuple[Any, ...]:
    result = []
    for part in node.get("text", []):
        if isinstance(part, str):
            result.append(("text", "" if blank_labels else part))
        elif isinstance(part, dict):
            field = {key: value for key, value in part.items() if key != "value"}
            result.append(("field", _stable(field)))
        else:
            result.append(("literal", repr(part)))
    return tuple(result)


def _label(node: dict[str, Any]) -> str:
    return "".join(part for part in node.get("text", []) if isinstance(part, str)).strip()


_NAMESPACES = {
    "audio": "audio",
    "color": "color",
    "console": "console",
    "cookies": "cookies",
    "functions": "functions",
    "hierarchy": "objects",
    "input": "input",
    "logic": "logic",
    "looks": "ui",
    "loops": "loops",
    "math-variables": "variables",
    "navigation": "navigation",
    "network": "network",
    "strings": "text",
    "tables": "tables",
    "time": "time",
}
_EVENT_NAMES = {
    "0": "load",
    "1": "button_pressed",
    "2": "key_pressed",
    "3": "mouse_enters",
    "7": "avatar_item_bought",
    "8": "input_submitted",
    "9": "message_received",
    "10": "object_changed",
    "11": "mouse_down_on",
    "14": "cross_site_message_received",
    "15": "donation_completed",
}
_MATH_VARIABLE_NAMES = {
    "11": ("variables", "set"),
    "12": ("variables", "increase_by"),
    "13": ("variables", "decrease_by"),
    "14": ("variables", "multiply_by"),
    "15": ("variables", "divide_by"),
    "16": ("math", "round"),
    "17": ("math", "floor"),
    "27": ("variables", "set_random"),
    "40": ("math", "power"),
    "41": ("math", "modulo"),
    "78": ("math", "ceil"),
    "96": ("variables", "delete"),
    "114": ("math", "apply"),
}
_FRIENDLY_NAMES = {
    ("color", "121"): "color.hex_from_rgb",
    ("color", "122"): "color.hex_from_hsv",
    ("looks", "31"): "ui.set_property",
    ("looks", "39"): "ui.get_property",
    ("looks", "138"): "ui.set_attribute",
    ("looks", "139"): "ui.get_attribute",
}


def _call_name(template: Template) -> str | None:
    if template.scope == "top":
        if template.category == "events":
            return _EVENT_NAMES.get(template.block_id)
        if template.category == "functions" and template.block_id == "6":
            return "functions.define_function"
        return None
    if template.scope != "block":
        return None
    fields = _argument_fields(template.node)
    if any(field.get("l") == "comment" for field in fields):
        return None
    label = _label(template.node).lower()
    if label in {"end", "else"}:
        return None
    special = _FRIENDLY_NAMES.get((template.category, template.block_id))
    if special:
        return special
    namespace = _NAMESPACES.get(template.category, template.category.replace("-", "_"))
    if template.category == "math-variables" and template.block_id in _MATH_VARIABLE_NAMES:
        namespace, method = _MATH_VARIABLE_NAMES[template.block_id]
        return f"{namespace}.{method}"
    raw = " ".join(part for part in template.node.get("text", []) if isinstance(part, str))
    raw = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", raw)
    words = re.findall(r"[a-z0-9]+", raw.lower())
    if words and words[0] == "if":
        words.pop(0)
    method = "_".join(words)
    if not method:
        return None
    return f"{namespace}.{method}"


class BlockCatalog:
    """Indexes all content and action templates, deduplicated by argument shape."""

    def __init__(self, directory: Path = CATALOG, api_reference: Path | None = None):
        grouped: dict[tuple[str, str, str], list[tuple[tuple[Any, ...], dict[str, Any]]]] = {}
        self.sources: dict[str, list[dict[str, Any]]] = {}
        for path in sorted(directory.glob("*.json")):
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError) as exc:
                raise RuntimeError(f"Cannot read block catalog {path}: {exc}") from exc
            if not isinstance(data, list):
                continue
            category = path.stem
            self.sources[category] = data
            for example in data:
                for top in example.get("content", []):
                    self._add(grouped, "top", category, top)
                    for action in top.get("actions", []):
                        self._add(grouped, "block", category, action)

        self.by_key: dict[str, Template] = {}
        self.by_base: dict[tuple[str, str, str], list[Template]] = {}
        self.by_signature: dict[tuple[str, str, tuple[Any, ...]], list[Template]] = {}
        self.by_blanked_signature: dict[tuple[str, str, tuple[Any, ...]], list[Template]] = {}
        for (scope, category, block_id), variants in grouped.items():
            entries = self.by_base.setdefault((scope, category, block_id), [])
            for index, (signature, node) in enumerate(variants, 1):
                key = f"{category}/{block_id}" + (f"~{index}" if len(variants) > 1 else "")
                item = Template(scope, category, block_id, key, copy.deepcopy(node), signature)
                entries.append(item)
                self.by_key[f"{scope}/{key}"] = item
                self.by_signature.setdefault((scope, block_id, signature), []).append(item)
                blanked_signature = _text_signature(node, blank_labels=True)
                self.by_blanked_signature.setdefault(
                    (scope, block_id, blanked_signature), []
                ).append(item)

        self.comment_template = next(
            (item for item in self.by_key.values()
             if item.scope == "block"
             and any(field.get("l") == "comment" for field in _argument_fields(item.node))),
            None,
        )
        self._link_scopes()
        self.by_call: dict[tuple[str, str], Template] = {}
        self.by_alias: dict[tuple[str, str], Template] = {}
        self.argument_orders: dict[tuple[str, str], list[int]] = {}
        self.named_templates: list[Template] = []
        for item in self.by_key.values():
            item.call_name = _call_name(item)
        reference_path = api_reference
        if reference_path is None and directory.resolve() == CATALOG.resolve():
            reference_path = ROOT / "data" / "API_REFERENCE.json"
        if reference_path is not None and reference_path.is_file():
            self._apply_api_reference(reference_path)
        else:
            for item in self.by_key.values():
                if item.call_name is None:
                    continue
                call_key = (item.scope, item.call_name)
                if call_key in self.by_call:
                    other = self.by_call[call_key]
                    raise RuntimeError(f"Duplicate readable name {item.call_name!r}: {other.key}, {item.key}")
                self.by_call[call_key] = item
                self.argument_orders[call_key] = list(range(len(_argument_fields(item.node))))
                self.named_templates.append(item)

    @staticmethod
    def _add(grouped: dict, scope: str, category: str, node: dict[str, Any]) -> None:
        if not isinstance(node, dict) or "id" not in node:
            return
        block_id = str(node["id"])
        key = (scope, category, block_id)
        signature = _text_signature(node)
        variants = grouped.setdefault(key, [])
        if all(existing_signature != signature for existing_signature, _ in variants):
            variants.append((signature, copy.deepcopy(node)))

    def _apply_api_reference(self, path: Path) -> None:
        try:
            reference = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise RuntimeError(f"Cannot read API reference {path}: {exc}") from exc
        if reference.get("version") != 2:
            raise RuntimeError(f"Unsupported API reference version in {path}")

        registered: set[tuple[str, str]] = set()

        def register(entry: dict[str, Any], scope: str, name: str) -> Template:
            source = entry["source"]
            template = self.by_key.get(f"{scope}/{source['key']}")
            if template is None or template.scope != scope:
                raise RuntimeError(f"API reference source not found: {source}")
            call_key = (scope, name)
            if call_key in registered or call_key in self.by_alias:
                raise RuntimeError(f"Duplicate API v2 name {name!r} in {scope} scope")
            fields = _argument_fields(template.node)
            order = entry.get("sourceArgumentOrder", list(range(len(fields))))
            if len(order) != len(fields) or sorted(order) != list(range(len(fields))):
                raise RuntimeError(f"Invalid source argument order for {name!r}")
            if len(entry.get("parameters", [])) != len(fields):
                raise RuntimeError(f"API parameter count does not match {name!r}")
            template.call_name = name
            template.parameters = copy.deepcopy(entry["parameters"])
            self.by_call[call_key] = template
            self.argument_orders[call_key] = order
            registered.add(call_key)
            self.named_templates.append(template)
            return template

        for module in reference.get("modules", []):
            for entry in module.get("functions", []):
                template = register(entry, "block", entry["qualifiedName"])
                alias_names = entry.get("legacyAliases", [])
                for alias in alias_names:
                    alias_key = ("block", alias)
                    if alias_key in registered or alias_key in self.by_alias:
                        raise RuntimeError(f"Duplicate legacy API name {alias!r}")
                    self.by_alias[alias_key] = template

        for entry in reference.get("events", []):
            template = register(entry, "top", entry["name"])
            for alias in entry.get("legacyAliases", []):
                alias_key = ("top", alias)
                if alias_key in registered or alias_key in self.by_alias:
                    raise RuntimeError(f"Duplicate legacy event name {alias!r}")
                self.by_alias[alias_key] = template

        for alias in reference.get("extraAliases", []):
            alias_key = (alias["scope"], alias["name"])
            target_key = (alias["scope"], alias["qualifiedName"])
            template = self.by_call.get(target_key)
            if template is None or alias_key in registered or alias_key in self.by_alias:
                raise RuntimeError(f"Invalid extra API alias: {alias}")
            self.by_alias[alias_key] = template

        for construct in reference.get("languageConstructs", []):
            source = construct["source"]
            template = self.by_key.get(f"{source['scope']}/{source['key']}")
            if template is None:
                raise RuntimeError(f"Language construct source not found: {source}")
            template.call_name = "functions.define"
            self.named_templates.append(template)

        expected = {
            ("block", entry["qualifiedName"])
            for module in reference.get("modules", [])
            for entry in module.get("functions", [])
        } | {("top", entry["name"]) for entry in reference.get("events", [])}
        if expected != registered:
            raise RuntimeError("API reference registration is incomplete")

    def _link_scopes(self) -> None:
        for item in self.by_key.values():
            if item.scope != "block":
                continue
            label = _label(item.node).lower()
            if not (label.startswith("if") or label.startswith("repeat") or label.startswith("iterate through")):
                continue
            candidates = self.by_base.get(("block", item.category, "25"), [])
            end = next((entry for entry in candidates if _label(entry.node).lower() == "end"), None)
            if end:
                item.opens_scope = True
                item.end_template = end
                item.else_template = next((entry for entry in self.by_key.values()
                                           if entry.scope == "block" and entry.category == item.category
                                           and _label(entry.node).lower() == "else"), None)

    def get(self, scope: str, key: str, line: int) -> Template:
        item = self.by_key.get(f"{scope}/{key}")
        if item:
            return item
        if re.fullmatch(r"[A-Za-z0-9_-]+/[^/]+", key):
            category, block_id = key.split("/", 1)
            variants = self.by_base.get((scope, category, block_id), [])
            if len(variants) == 1:
                return variants[0]
            if variants:
                choices = ", ".join(entry.key for entry in variants)
                raise CompileError(f"line {line}: choose one of these catalog shapes: {choices}")
        raise CompileError(f"line {line}: catalog entry {key!r} was not found in the {scope} catalog")

    def get_named(self, scope: str, name: str, line: int) -> Template:
        item = self.by_call.get((scope, name)) or self.by_alias.get((scope, name))
        if item:
            return item
        raise CompileError(f"line {line}: unknown {scope} name {name!r}; choose a name from the block catalog")

    def resolve_named(self, scope: str, name: str, arguments: list[Any],
                      line: int) -> tuple[Template, list[Any]]:
        call_key = (scope, name)
        template = self.by_call.get(call_key)
        if template is not None:
            order = self.argument_orders[call_key]
        else:
            template = self.by_alias.get(call_key)
            if template is None:
                raise CompileError(f"line {line}: unknown {scope} name {name!r}; choose a name from the block catalog")
            order = list(range(len(_argument_fields(template.node))))
        expected = len(_argument_fields(template.node))
        if len(arguments) != expected:
            raise CompileError(f"line {line}: {name} expects {expected} arguments; received {len(arguments)}")
        return template, [arguments[index] for index in order]

    def canonical_arguments(self, template: Template, arguments: list[Any]) -> list[Any]:
        order = self.argument_orders.get(
            (template.scope, template.call_name or ""),
            list(range(len(arguments))),
        )
        canonical = [MISSING] * len(order)
        for source_index, canonical_index in enumerate(order):
            canonical[canonical_index] = arguments[source_index]
        return canonical

    def match_existing(self, scope: str, node: dict[str, Any]) -> Template | None:
        block_id = str(node.get("id", ""))
        matches = self.by_signature.get((scope, block_id, _text_signature(node)), [])
        if not matches and scope == "block" and block_id == "87":
            matches = self.by_signature.get(("block", "132", _text_signature(node)), [])
        labels = [part for part in node.get("text", []) if isinstance(part, str)]
        if not matches and labels and all(not label for label in labels):
            matches = self.by_blanked_signature.get(
                (scope, block_id, _text_signature(node, blank_labels=True)), []
            )
        if not matches:
            return None
        preference = {"events": 0, "functions": 1, "console": 2, "logic": 3}
        return sorted(matches, key=lambda item: (preference.get(item.category, 10), item.category, item.key))[0]

def _argument_fields(node: dict[str, Any]) -> list[dict[str, Any]]:
    return [part for part in node.get("text", []) if isinstance(part, dict)]


def _read_call(rest: str, line: int) -> tuple[str, list[Any], dict[str, Any]]:
    match = re.match(r"([^\s]+)(?:\s+(.*))?$", rest.strip())
    if not match:
        raise CompileError(f"line {line}: expected a catalog key such as console/0")
    key, tail = match.group(1), (match.group(2) or "").strip()
    arguments: list[Any] = []
    metadata: dict[str, Any] = {}
    if tail.startswith("["):
        try:
            arguments, end = json.JSONDecoder().raw_decode(tail)
        except json.JSONDecodeError as exc:
            raise CompileError(f"line {line}: arguments must be a JSON array") from exc
        if not isinstance(arguments, list):
            raise CompileError(f"line {line}: arguments must be a JSON array")
        tail = tail[end:].strip()
    if tail:
        if not tail.startswith("@"):
            raise CompileError(f"line {line}: unexpected text after arguments")
        try:
            metadata = json.loads(tail[1:])
        except json.JSONDecodeError as exc:
            raise CompileError(f"line {line}: metadata after @ must be a JSON object") from exc
        if not isinstance(metadata, dict):
            raise CompileError(f"line {line}: metadata after @ must be a JSON object")
    return key, arguments, metadata


def _read_named_call(source: str, line: int) -> tuple[str, list[Any]]:
    match = re.fullmatch(r"([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\s*\((.*)\)", source.strip())
    if not match:
        raise CompileError(f"line {line}: expected a named function call such as console.log(\"message\")")
    name, arguments_source = match.groups()
    if not arguments_source.strip():
        return name, []
    try:
        arguments = ast.literal_eval(f"[{arguments_source}]")
    except (SyntaxError, ValueError) as exc:
        raise CompileError(f"line {line}: use simple Python literals inside function parentheses") from exc
    if not isinstance(arguments, list):
        raise CompileError(f"line {line}: function arguments must be comma-separated values")
    return name, [MISSING if value is Ellipsis else value for value in arguments]


def _split_output_assignment(source: str) -> tuple[str, str] | None:
    quote: str | None = None
    escaped = False
    depth = 0
    for index, character in enumerate(source):
        if quote:
            if escaped:
                escaped = False
            elif character == "\\":
                escaped = True
            elif character == quote:
                quote = None
        elif character in {"'", '"'}:
            quote = character
        elif character in "([{":
            depth += 1
        elif character in ")]}":
            depth -= 1
        elif character == "=" and depth == 0:
            call, outputs = source[:index].strip(), source[index + 1:].strip()
            if call.endswith(")") and outputs:
                return call, outputs
    return None


def _read_output_targets(source: str, line: int) -> list[Any]:
    try:
        expression = ast.parse(source, mode="eval").body
    except SyntaxError as exc:
        raise CompileError(f"line {line}: output targets must be variable names") from exc
    elements = expression.elts if isinstance(expression, ast.Tuple) else [expression]
    targets = []
    for element in elements:
        if isinstance(element, ast.Name):
            targets.append(element.id)
        elif isinstance(element, ast.Constant) and (
            isinstance(element.value, str) or element.value is Ellipsis
        ):
            targets.append(MISSING if element.value is Ellipsis else element.value)
        else:
            raise CompileError(f"line {line}: output targets must be variable names or ...")
    return targets


def _output_arguments(template: Template, arguments: list[Any], targets: list[Any],
                      line: int, *, legacy_order: bool = False) -> list[Any]:
    parameters = template.parameters
    if not parameters:
        raise CompileError(f"line {line}: {template.call_name} has no output parameter")
    position_key = "sourcePosition" if legacy_order else "position"
    ordered = sorted(
        enumerate(parameters),
        key=lambda pair: pair[1].get(position_key, pair[0] + 1),
    )
    outputs = [parameter for _, parameter in ordered if parameter.get("direction") == "output"]
    inputs = [parameter for _, parameter in ordered if parameter.get("direction") != "output"]
    if not outputs:
        raise CompileError(f"line {line}: {template.call_name} has no output parameter")
    if len(targets) != len(outputs):
        raise CompileError(
            f"line {line}: {template.call_name} needs {len(outputs)} output target"
            f"{'' if len(outputs) == 1 else 's'} after '='; received {len(targets)}"
        )

    input_values = arguments
    if (len(inputs) > 1 and inputs[-1].get("type") == "tuple"):
        tuple_index = len(inputs) - 1
        if len(arguments) == tuple_index:
            input_values = [*arguments, []]
        elif len(arguments) == len(inputs) and isinstance(arguments[-1], (list, tuple)):
            input_values = arguments
        elif len(arguments) >= tuple_index:
            input_values = [*arguments[:tuple_index], arguments[tuple_index:]]

    if len(input_values) != len(inputs):
        raise CompileError(
            f"line {line}: {template.call_name} expects {len(inputs)} input argument"
            f"{'' if len(inputs) == 1 else 's'} before '='; received {len(input_values)}"
        )

    result = [MISSING] * len(parameters)
    input_index = 0
    output_index = 0
    for fallback_index, parameter in ordered:
        position = parameter.get(position_key, fallback_index + 1)
        if not isinstance(position, int) or not 1 <= position <= len(result):
            raise CompileError(f"line {line}: invalid API parameter position for {template.call_name}")
        if parameter.get("direction") == "output":
            result[position - 1] = targets[output_index]
            output_index += 1
        else:
            result[position - 1] = input_values[input_index]
            input_index += 1
    return result


def _named_call_source(template: Template, arguments: list[Any]) -> str:
    parameters = template.parameters
    if not parameters or not any(parameter.get("direction") == "output" for parameter in parameters):
        return f"{template.call_name}{_format_arguments(arguments)}"

    ordered = sorted(parameters, key=lambda parameter: parameter.get("position", 0))
    inputs = [parameter for parameter in ordered if parameter.get("direction") != "output"]
    outputs = [parameter for parameter in ordered if parameter.get("direction") == "output"]
    input_arguments = [
        arguments[parameter["position"] - 1]
        for parameter in inputs
    ]
    if inputs and inputs[-1].get("type") == "tuple":
        tuple_value = input_arguments[-1]
        if isinstance(tuple_value, (list, tuple)):
            input_arguments = [*input_arguments[:-1], *tuple_value]
    output_targets = [
        arguments[parameter["position"] - 1]
        for parameter in outputs
    ]
    return (
        f"{template.call_name}{_format_arguments(input_arguments)} = "
        + ", ".join(_format_output_target(value) for value in output_targets)
    )


def _metadata_comment(line: str, line_number: int) -> tuple[str, dict[str, Any]]:
    quote: str | None = None
    escaped = False
    for index, character in enumerate(line):
        if quote:
            if escaped:
                escaped = False
            elif character == "\\":
                escaped = True
            elif character == quote:
                quote = None
            continue
        if character in {"'", '"'}:
            quote = character
        elif character == "#":
            code, comment = line[:index], line[index + 1:].strip()
            if not comment.startswith("@"):
                return code, {}
            if comment.startswith("@{"):
                raw_metadata = comment[1:].strip()
                try:
                    metadata = json.loads(raw_metadata)
                except json.JSONDecodeError as exc:
                    raise CompileError(f"line {line_number}: metadata comment must contain a JSON object") from exc
                if not isinstance(metadata, dict):
                    raise CompileError(f"line {line_number}: metadata comment must contain a JSON object")
                return code, metadata
            matches = re.findall(r"@(id|end)=(\"(?:\\.|[^\"])*\")", comment)
            if matches and re.sub(r"@(id|end)=\"(?:\\.|[^\"])*\"", "", comment).strip() == "":
                metadata = {}
                for key, raw_value in matches:
                    metadata["globalid" if key == "id" else "end_globalid"] = json.loads(raw_value)
                return code, metadata
            try:
                metadata = json.loads(comment[1:].strip())
            except json.JSONDecodeError as exc:
                raise CompileError(f"line {line_number}: metadata comment must contain a JSON object") from exc
            if not isinstance(metadata, dict):
                raise CompileError(f"line {line_number}: metadata comment must contain a JSON object")
            return code, metadata
    return line, {}


def _format_literal(value: Any) -> str:
    if value is MISSING:
        return "..."
    if value is None:
        return "None"
    if value is True:
        return "True"
    if value is False:
        return "False"
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False)
    if isinstance(value, list):
        return "[" + ", ".join(_format_literal(item) for item in value) + "]"
    if isinstance(value, tuple):
        return "(" + ", ".join(_format_literal(item) for item in value) + ("," if len(value) == 1 else "") + ")"
    if isinstance(value, dict):
        return "{" + ", ".join(f"{_format_literal(key)}: {_format_literal(item)}"
                               for key, item in value.items()) + "}"
    return repr(value)


def _format_arguments(values: list[Any]) -> str:
    return "(" + ", ".join(_format_literal(value) for value in values) + ")"


def _format_output_target(value: Any) -> str:
    if isinstance(value, str) and re.fullmatch(r"[A-Za-z_]\w*", value):
        return value
    return _format_literal(value)


def _metadata_suffix(metadata: dict[str, Any]) -> str:
    if not metadata:
        return ""
    if set(metadata).issubset({"globalid", "end_globalid"}):
        parts = []
        if "globalid" in metadata:
            parts.append(f"@id={json.dumps(metadata['globalid'], ensure_ascii=False)}")
        if "end_globalid" in metadata:
            parts.append(f"@end={json.dumps(metadata['end_globalid'], ensure_ascii=False)}")
        return "  # " + " ".join(parts)
    return "  # @" + json.dumps(metadata, ensure_ascii=False, separators=(",", ":"))


def _instantiate(template: Template, arguments: list[Any], metadata: dict[str, Any], line: int) -> dict[str, Any]:
    node = copy.deepcopy(template.node)
    fields = _argument_fields(node)
    if len(fields) != len(arguments):
        raise CompileError(f"line {line}: {template.key} expects {len(fields)} arguments, got {len(arguments)}")
    for field, value in zip(fields, arguments):
        if value is MISSING:
            field.pop("value", None)
        else:
            if field.get("t") == "string" and isinstance(value, (int, float, bool)):
                value = str(value)
            elif field.get("t") == "number" and isinstance(value, str) \
                    and not re.fullmatch(r"\{[lo]![A-Za-z_][\w-]*\}", value):
                try:
                    value = float(value) if "." in value else int(value)
                except ValueError as exc:
                    raise CompileError(f"line {line}: {value!r} is not a number") from exc
            field["value"] = value
    if template.scope == "top":
        node["actions"] = []
        top_position = (metadata.pop("x", "0"), metadata.pop("y", "0"))
    else:
        top_position = None
    node["globalid"] = metadata.pop("globalid", None) or _gid()
    for key, value in metadata.items():
        if key not in {"id", "text"}:
            node[key] = value
    if top_position is not None:
        node["x"], node["y"] = top_position
    return node


def _metadata_for(node: dict[str, Any], template: Template | None) -> dict[str, Any]:
    meta: dict[str, Any] = {}
    baseline = template.node if template else {}
    for key, value in node.items():
        if key in {"id", "text", "actions", "variable_scope"}:
            continue
        if key == "globalid" or key not in baseline or baseline.get(key) != value:
            meta[key] = value
    return meta


def _args_for(node: dict[str, Any]) -> list[Any]:
    return [field.get("value", MISSING) for field in _argument_fields(node)]


def _function_parameter_names(node: dict[str, Any], template: Template) -> list[str] | None:
    overrides = node.get("variable_overrides", [])
    if overrides == template.node.get("variable_overrides") or overrides == []:
        return []
    if not isinstance(overrides, list):
        return None
    names = []
    for override in overrides:
        if (not isinstance(override, dict) or set(override) != {"value"}
                or not isinstance(override["value"], str)
                or not re.fullmatch(r"[A-Za-z_]\w*", override["value"])):
            return None
        names.append(override["value"])
    return names if len(names) == len(set(names)) else None


def _raw_line(kind: str, node: dict[str, Any], indent: int) -> str:
    raw = json.dumps(node, ensure_ascii=False, separators=(",", ":"))
    return " " * indent + kind + " " + raw


def _decompile_actions(actions: list[dict[str, Any]], catalog: BlockCatalog,
                       indent: int = 0) -> list[str]:
    entries: list[dict[str, Any]] = []
    stack: list[dict[str, Any]] = []

    def add_line(text: str, metadata: dict[str, Any] | None = None) -> dict[str, Any]:
        entry = {"text": " " * indent + text, "metadata": metadata or {}}
        entries.append(entry)
        return entry

    def close_scope(end_node: dict[str, Any] | None = None) -> None:
        scope = stack.pop()
        if end_node:
            end_metadata = _metadata_for(end_node, scope["template"].end_template)
            end_globalid = end_metadata.pop("globalid", None)
            if end_globalid:
                scope["entry"]["metadata"]["end_globalid"] = end_globalid
            if end_metadata:
                scope["entry"]["metadata"]["end_metadata"] = end_metadata

    for action in actions:
        indent = 4 * len(stack)
        template = catalog.match_existing("block", action)
        comment_field = next(
            (field for field in _argument_fields(action) if field.get("l") == "comment"),
            None,
        ) if template else None
        if (comment_field is not None and isinstance(comment_field.get("value"), str)
                and "\n" not in comment_field["value"] and "\r" not in comment_field["value"]):
            add_line(f"# {comment_field['value']}")
            continue
        if stack:
            scope = stack[-1]
            end_template = scope["template"].end_template
            is_end = (end_template is not None
                      and str(action.get("id", "")) == end_template.block_id
                      and _text_signature(action) == end_template.signature)
            if is_end:
                close_scope(action)
                continue
            else_template = scope["template"].else_template
            is_else = (else_template is not None
                       and str(action.get("id", "")) == else_template.block_id
                       and _text_signature(action) == else_template.signature)
            if is_else and scope["kind"] == "if":
                indent = scope["indent"]
                add_line("else:", _metadata_for(action, else_template))
                scope["in_else"] = True
                continue
        if not template or not template.call_name:
            add_line(_raw_line("raw", action, 0).lstrip())
            continue
        arguments = catalog.canonical_arguments(template, _args_for(action))
        metadata = _metadata_for(action, template)
        if template.category == "math-variables" and template.block_id == "11" and len(arguments) == 2:
            variable = arguments[0]
            if isinstance(variable, str) and re.fullmatch(r"[A-Za-z_]\w*", variable):
                entry = add_line(f"{variable} = {_format_literal(arguments[1])}", metadata)
                continue
        assignment_operators = {"12": "+=", "13": "-=", "14": "*=", "15": "/="}
        operator = assignment_operators.get(template.block_id) if template.category == "math-variables" else None
        if operator and len(arguments) == 2 and isinstance(arguments[0], str) and re.fullmatch(r"[A-Za-z_]\w*", arguments[0]):
            add_line(f"{arguments[0]} {operator} {_format_literal(arguments[1])}", metadata)
            continue
        is_scope = template.opens_scope and template.end_template is not None
        kind = "if" if _label(template.node).lower().startswith("if") else "for"
        call_source = _named_call_source(template, arguments)
        prefix = f"{kind} {call_source}:" if is_scope else call_source
        entry = add_line(prefix, metadata)
        if is_scope:
            stack.append({
                "template": template,
                "kind": kind,
                "indent": indent,
                "entry": entry,
                "in_else": False,
            })
    while stack:
        close_scope()
    return [entry["text"] + _metadata_suffix(entry["metadata"]) for entry in entries]


def decompile_script(content: list[dict[str, Any]], catalog: BlockCatalog | None = None) -> str:
    """Convert a script content list to CSL, retaining unknown blocks as raw lines."""
    catalog = catalog or BlockCatalog()
    content = decode_content(content, catalog)
    sections: list[str] = []
    for node in content:
        template = catalog.match_existing("top", node)
        metadata = _metadata_for(node, template)
        arguments = (_args_for(node) if not template else
                     catalog.canonical_arguments(template, _args_for(node)))
        if template and template.call_name == "load" and not _argument_fields(node):
            header = "on load:"
        elif template and template.scope == "top" and template.category == "events" and template.call_name:
            header = f"on {template.call_name}{_format_arguments(arguments)}:"
        elif (template and template.category == "functions" and template.block_id == "6"
              and len(arguments) == 1 and isinstance(arguments[0], str)
              and re.fullmatch(r"[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*", arguments[0])):
            parameters = _function_parameter_names(node, template)
            if parameters is not None:
                metadata.pop("variable_overrides", None)
                header = f"def {arguments[0]}({', '.join(parameters)}):"
            else:
                header = f"top {template.key} {_format_arguments(arguments)}"
        elif template:
            header = f"top {template.key} {_format_arguments(arguments)}"
        else:
            raw_top = {key: value for key, value in node.items() if key != "actions"}
            sections.append(_raw_line("topraw", raw_top, 0))
            sections[-1] += "\n" + "\n".join(_decompile_actions(node.get("actions", []), catalog))
            continue
        header += _metadata_suffix(metadata)
        body: list[str] = [header]
        nested = _decompile_actions(node.get("actions", []), catalog)
        body.extend(nested)
        sections.append("\n".join(body))
    return "\n\n".join(sections)


def _indent_of(line: str) -> int:
    return len(line) - len(line.lstrip(" \t"))


def compile_script(source: str, *, folder_alias: str = "CatWet Script Lab",
                   catalog: BlockCatalog | None = None, encoded: bool = False) -> list[dict[str, Any]]:
    """Compile readable Python-like Catweb calls into an importable project.

    Named calls are preferred; legacy ``top``/``block`` catalog calls remain accepted.
    """
    catalog = catalog or BlockCatalog()
    content: list[dict[str, Any]] = []
    current_top: dict[str, Any] | None = None
    current_top_line = 0
    body_indent: int | None = None
    stack: list[dict[str, Any]] = []
    previous_blank = False

    def close_scope() -> None:
        scope = stack.pop()
        metadata = dict(scope["end_metadata"])
        if scope["end_globalid"]:
            metadata["globalid"] = scope["end_globalid"]
        current_top["actions"].append(_instantiate(scope["end"], [], metadata, scope["line"]))

    def finish_scopes(target_indent: int) -> None:
        while stack and target_indent <= stack[-1]["indent"]:
            close_scope()

    def start_top(template: Template, args: list[Any], meta: dict[str, Any], line_number: int) -> None:
        nonlocal current_top, current_top_line, body_indent
        if current_top is not None:
            if not previous_blank:
                raise CompileError(f"line {line_number}: leave a blank line before the next top-level block")
            finish_scopes(0)
            content.append(current_top)
        has_function_overrides = "variable_overrides" in meta
        current_top = _instantiate(template, args, meta, line_number)
        if (template.category == "functions" and template.block_id == "6"
                and not has_function_overrides):
            current_top["variable_overrides"] = []
        current_top_line = line_number
        body_indent = None

    def append_action(template: Template, args: list[Any], metadata: dict[str, Any],
                      line_number: int, indent: int, mode: str, explicit_scope: bool = False) -> None:
        nonlocal body_indent
        if mode == "block" and not explicit_scope and not template.opens_scope and stack and indent <= stack[-1]["indent"]:
            scope = stack[-1]
            if template.signature == scope["end"].signature and template.category == scope["end"].category:
                stack.pop()
                return
        finish_scopes(indent)
        if stack and indent <= stack[-1]["indent"]:
            raise CompileError(f"line {line_number}: indent the statement inside its scope")
        if not stack:
            if body_indent is None:
                body_indent = indent
            elif indent != body_indent:
                raise CompileError(f"line {line_number}: unexpected indentation outside a scope")
        if mode in {"if", "for", "scope"} and not explicit_scope:
            raise CompileError(f"line {line_number}: {mode} must end with a colon")
        if explicit_scope and not template.opens_scope:
            raise CompileError(f"line {line_number}: {template.call_name or template.key} cannot open a scope")
        label = _label(template.node).lower()
        if mode == "if" and not label.startswith("if"):
            raise CompileError(f"line {line_number}: use if with a condition block")
        if mode in {"for", "scope"} and label.startswith("if"):
            raise CompileError(f"line {line_number}: use if with a condition block")
        metadata = dict(metadata)
        end_globalid = metadata.pop("end_globalid", None)
        end_metadata = metadata.pop("end_metadata", {})
        current_top["actions"].append(_instantiate(template, args, metadata, line_number))
        if explicit_scope:
            stack.append({
                "indent": indent,
                "template": template,
                "end": template.end_template,
                "else": template.else_template,
                "kind": mode,
                "in_else": False,
                "line": line_number,
                "end_globalid": end_globalid,
                "end_metadata": end_metadata if isinstance(end_metadata, dict) else {},
            })

    for line_number, original in enumerate(source.splitlines(), 1):
        code, inline_metadata = _metadata_comment(original, line_number)
        stripped = code.strip()
        if not stripped:
            comment_source = original.lstrip(" \t")
            if comment_source.startswith("#") and not inline_metadata and current_top is not None:
                comment_text = comment_source[1:]
                if comment_text.startswith(" "):
                    comment_text = comment_text[1:]
                template = catalog.comment_template
                if template is None:
                    raise CompileError(f"line {line_number}: the catalog does not contain a comment block")
                append_action(template, [comment_text], {}, line_number, _indent_of(original.expandtabs(4)), "call")
                previous_blank = False
            elif not original.strip().startswith("#"):
                previous_blank = True
            continue
        indent = _indent_of(original.expandtabs(4))

        load_header = re.fullmatch(r"on\s+load\s*:\s*(?:@(\{.*\}))?", stripped, re.IGNORECASE)
        if indent == 0 and load_header:
            metadata = dict(inline_metadata)
            if load_header.group(1):
                try:
                    metadata.update(json.loads(load_header.group(1)))
                except json.JSONDecodeError as exc:
                    raise CompileError(f"line {line_number}: metadata after on load: must be a JSON object") from exc
            template, args = catalog.resolve_named("top", "load", [], line_number)
            start_top(template, args, metadata, line_number)
            previous_blank = False
            continue

        event_header = re.fullmatch(r"on\s+([A-Za-z_]\w*)\s*(?:\((.*)\))?\s*:", stripped)
        if indent == 0 and event_header:
            event_name, arguments_source = event_header.groups()
            name, args = _read_named_call(f"{event_name}({arguments_source or ''})", line_number)
            template, args = catalog.resolve_named("top", name, args, line_number)
            if template.category != "events":
                raise CompileError(f"line {line_number}: {event_name!r} is not a Catweb event")
            start_top(template, args, dict(inline_metadata), line_number)
            previous_blank = False
            continue

        function_header = re.fullmatch(
            r"def\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\s*(?:\(([^()]*)\))?\s*:",
            stripped,
        )
        if indent == 0 and function_header:
            parameter_source = function_header.group(2) or ""
            parameters = [parameter.strip() for parameter in parameter_source.split(",") if parameter.strip()]
            if (parameter_source.strip()
                    and (len(parameters) != len(parameter_source.split(","))
                         or any(not re.fullmatch(r"[A-Za-z_]\w*", parameter) for parameter in parameters))):
                raise CompileError(f"line {line_number}: function parameters must be simple variable names")
            if len(parameters) != len(set(parameters)):
                raise CompileError(f"line {line_number}: function parameter names must be unique")
            template = catalog.get("top", "functions/6", line_number)
            start_top(template, [function_header.group(1)], dict(inline_metadata), line_number)
            if "variable_overrides" not in inline_metadata:
                current_top["variable_overrides"] = [{"value": parameter} for parameter in parameters]
            previous_blank = False
            continue

        if indent == 0 and stripped.startswith("top "):
            key, args, metadata = _read_call(stripped[4:], line_number)
            metadata.update(inline_metadata)
            start_top(catalog.get("top", key, line_number), args, metadata, line_number)
            previous_blank = False
            continue

        if indent == 0 and stripped.startswith("topraw "):
            finish_scopes(0)
            if current_top is not None:
                if not previous_blank:
                    raise CompileError(f"line {line_number}: leave a blank line before the next top-level block")
                content.append(current_top)
            try:
                current_top = json.loads(stripped[7:])
            except json.JSONDecodeError as exc:
                raise CompileError(f"line {line_number}: topraw must contain a JSON object") from exc
            if not isinstance(current_top, dict):
                raise CompileError(f"line {line_number}: topraw must contain a JSON object")
            current_top.update(inline_metadata)
            current_top.setdefault("x", "0")
            current_top.setdefault("y", "0")
            if "actions" not in current_top:
                current_top["actions"] = []
            elif not isinstance(current_top["actions"], list):
                raise CompileError(f"line {line_number}: topraw actions must be an array")
            current_top_line = line_number
            body_indent = None
            previous_blank = False
            continue

        if current_top is None:
            raise CompileError(f"line {line_number}: start with 'on load:' or a named Catweb event")

        if stripped == "else:":
            while stack and indent < stack[-1]["indent"]:
                close_scope()
            if not stack or stack[-1]["else"] is None or stack[-1]["kind"] != "if" or indent != stack[-1]["indent"]:
                raise CompileError(f"line {line_number}: else must align with an if block that supports it")
            if stack[-1]["in_else"]:
                raise CompileError(f"line {line_number}: an if block can only have one else section")
            current_top["actions"].append(_instantiate(stack[-1]["else"], [], dict(inline_metadata), line_number))
            stack[-1]["in_else"] = True
            previous_blank = False
            continue

        if stripped.startswith("raw "):
            finish_scopes(indent)
            try:
                node = json.loads(stripped[4:])
            except json.JSONDecodeError as exc:
                raise CompileError(f"line {line_number}: raw must contain a JSON object") from exc
            if not isinstance(node, dict):
                raise CompileError(f"line {line_number}: raw must contain a JSON object")
            node.update(inline_metadata)
            current_top["actions"].append(node)
            previous_blank = False
            continue

        named_scope = re.fullmatch(r"(if|for)\s+(.+\))\s*:", stripped)
        if named_scope:
            mode, call_source = named_scope.groups()
            name, args = _read_named_call(call_source, line_number)
            template, args = catalog.resolve_named("block", name, args, line_number)
            append_action(template, args, dict(inline_metadata), line_number, indent, mode, True)
            previous_blank = False
            continue

        legacy = re.fullmatch(r"(block|if|scope)\s+(.+)", stripped)
        if legacy:
            mode, rest = legacy.groups()
            opens = rest.endswith(":")
            if opens:
                rest = rest[:-1].rstrip()
            key, args, metadata = _read_call(rest, line_number)
            metadata.update(inline_metadata)
            template = catalog.get("block", key, line_number)
            append_action(template, args, metadata, line_number, indent, mode, opens)
            previous_blank = False
            continue

        message = re.fullmatch(r"(log|warn|error)\s+(.+)", stripped, re.IGNORECASE)
        if message:
            operation, raw_value = message.groups()
            try:
                value = ast.literal_eval(raw_value)
            except (SyntaxError, ValueError) as exc:
                raise CompileError(f"line {line_number}: message must be a quoted string") from exc
            if not isinstance(value, str):
                raise CompileError(f"line {line_number}: {operation} expects a quoted string")
            template, args = catalog.resolve_named(
                "block", f"console.{operation.lower()}", [value], line_number
            )
            append_action(template, args, dict(inline_metadata), line_number, indent, "call")
            previous_blank = False
            continue

        legacy_set = re.fullmatch(r"set\s+([A-Za-z_]\w*)\s*=\s*(.+)", stripped)
        if legacy_set:
            name, raw_value = legacy_set.groups()
            try:
                value = ast.literal_eval(raw_value)
            except (SyntaxError, ValueError) as exc:
                raise CompileError(f"line {line_number}: set requires a quoted string or Python literal") from exc
            template = catalog.get("block", "math-variables/11", line_number)
            append_action(template, [name, value], dict(inline_metadata), line_number, indent, "call")
            previous_blank = False
            continue

        scoped_declaration = re.fullmatch(r"(local|global|obj)\s+([A-Za-z_]\w*)\s*=\s*(.+)", stripped)
        if scoped_declaration:
            scope, variable, raw_value = scoped_declaration.groups()
            if scope != "global":
                raise CompileError(
                    f"line {line_number}: Catweb does not define {scope} variable declaration blocks; "
                    "local/object variables are referenced through supported {l!name}/{o!name} fields"
                )
            try:
                value = ast.literal_eval(raw_value)
            except (SyntaxError, ValueError) as exc:
                raise CompileError(f"line {line_number}: declaration value must be a Python literal") from exc
            template = catalog.get("block", "math-variables/11", line_number)
            append_action(template, [variable, value], dict(inline_metadata), line_number, indent, "call")
            previous_blank = False
            continue

        output_assignment = _split_output_assignment(stripped)
        if output_assignment:
            call_source, targets_source = output_assignment
            name, arguments = _read_named_call(call_source, line_number)
            template = catalog.get_named("block", name, line_number)
            legacy_order = ("block", name) not in catalog.by_call
            targets = _read_output_targets(targets_source, line_number)
            arguments = _output_arguments(
                template, arguments, targets, line_number, legacy_order=legacy_order
            )
            template, arguments = catalog.resolve_named("block", name, arguments, line_number)
            append_action(template, arguments, dict(inline_metadata), line_number, indent, "call")
            previous_blank = False
            continue

        assignment = re.fullmatch(r"([A-Za-z_]\w*)\s*(\+=|-=|\*=|/=|=(?!=))\s*(.+)", stripped)
        if assignment:
            variable, operator, raw_value = assignment.groups()
            try:
                value = ast.literal_eval(raw_value)
            except (SyntaxError, ValueError) as exc:
                raise CompileError(f"line {line_number}: assignment value must be a Python literal") from exc
            block_id = {"=": "11", "+=": "12", "-=": "13", "*=": "14", "/=": "15"}[operator]
            template = catalog.get("block", f"math-variables/{block_id}", line_number)
            append_action(template, [variable, value], dict(inline_metadata), line_number, indent, "call")
            previous_blank = False
            continue

        try:
            name, args = _read_named_call(stripped, line_number)
        except CompileError as exc:
            raise CompileError(f"line {line_number}: unrecognized statement; use a named function such as console.log(\"message\")") from exc
        if name in {"log", "warn", "error"}:
            name = f"console.{name}"
        template, args = catalog.resolve_named("block", name, args, line_number)
        append_action(template, args, dict(inline_metadata), line_number, indent, "call")
        previous_blank = False

    while stack:
        close_scope()
    if current_top is not None:
        content.append(current_top)
    if not content:
        raise CompileError("no top-level event or function was found")
    script = {"class": "script", "globalid": _gid(), "content": content}
    root = {"class": "Folder", "globalid": _gid(), "alias": folder_alias, "children": [script]}
    project = [root]
    return encode_project(project, catalog) if encoded else project


def main() -> int:
    parser = argparse.ArgumentParser(description="Compile CSL into compact Catweb project JSON.")
    parser.add_argument("source", type=Path, help="CSL source file")
    parser.add_argument("-o", "--output", type=Path, help="Output JSON path (default: source with .json extension)")
    parser.add_argument("--name", default="CatWet Script Lab", help="Folder alias/mark in the generated document")
    parser.add_argument("--pretty", action="store_true", help="Write readable indented JSON instead of compact JSON")
    parser.add_argument("--plain", action="store_true", help="Do not encode string values or variable identifiers")
    args = parser.parse_args()
    output = args.output or args.source.with_suffix(".json")
    try:
        result = compile_script(
            args.source.read_text(encoding="utf-8"),
            folder_alias=args.name,
            encoded=not args.plain,
        )
        if args.pretty:
            serialized = json.dumps(result, ensure_ascii=False, indent=4)
        else:
            serialized = json.dumps(result, ensure_ascii=False, separators=(",", ":"))
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(serialized + "\n", encoding="utf-8")
    except (OSError, CompileError, RuntimeError, CatwebCodecError) as exc:
        parser.error(str(exc))
    print(f"Created {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
