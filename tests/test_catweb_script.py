import json
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from catweb_raw import folder, save, text_label
from catweb_script import BlockCatalog, compile_script, decompile_script


ROOT = Path(__file__).resolve().parents[1]


class CatwebScriptTests(unittest.TestCase):
    def test_generic_blocks_cover_each_catalog_category(self):
        catalog = BlockCatalog()
        categories = set(catalog.sources) - {"catalog-index"}
        self.assertEqual(len(categories), 17)

        for category in categories:
            templates = [item for item in catalog.by_key.values()
                         if item.scope == "block" and item.category == category]
            if not templates:
                continue
            template = templates[0]
            args = []
            for field in template.node.get("text", []):
                if not isinstance(field, dict):
                    continue
                if "value" in field:
                    args.append(field["value"])
                elif field.get("t") == "number":
                    args.append(1)
                elif field.get("t") == "boolean":
                    args.append(True)
                else:
                    args.append("test")
            source = f"on load:\nblock {template.key} {json.dumps(args)}"
            result = compile_script(source, catalog=catalog)
            script = result[0]["children"][0]
            self.assertEqual(script["content"][0]["actions"][0]["id"], template.block_id)

    def test_generic_events_and_nested_if_compile_with_catalog_closures(self):
        source = (
            'top events/1 ["button01"]\n'
            'block looks/8 ["button01"]\n\n'
            'top events/0 []\n'
            'if logic/18 ["left","right"]:\n'
            '    block network/32 ["message"]\n'
            'else:\n'
            '    block strings/69 ["input","result"]'
        )
        result = compile_script(source)
        content = result[0]["children"][0]["content"]

        self.assertEqual([block["id"] for block in content], ["1", "0"])
        self.assertEqual([block["id"] for block in content[0]["actions"]], ["8"])
        self.assertEqual([block["id"] for block in content[1]["actions"]], ["18", "32", "112", "69", "25"])

    def test_raw_action_is_preserved(self):
        raw = {"id": "future", "globalid": "raw01", "text": ["Future block"],
               "x": "125", "y": "210", "custom": ["keep"]}
        result = compile_script("on load:\nraw " + json.dumps(raw))
        self.assertEqual(result[0]["children"][0]["content"][0]["actions"][0], raw)

    def test_unknown_top_block_round_trips_with_raw_actions(self):
        unknown = {
            "id": "future-top",
            "globalid": "top001",
            "x": "500",
            "y": "700",
            "text": ["Future event"],
            "actions": [{"id": "future-action", "globalid": "act001", "text": ["Keep me"]}],
        }
        source = decompile_script([unknown])
        result = compile_script(source)[0]["children"][0]["content"]
        expected = {**unknown, "x": "0", "y": "0"}
        self.assertEqual(result, [expected])

    def test_nested_scope_decompiles_and_recompiles_with_metadata(self):
        source = (
            'on load:\n'
            'if logic/18 ["left","right"]:\n'
            '    block network/32 ["message"]\n'
            'else:\n'
            '    block strings/69 ["input","result"]'
        )
        content = compile_script(source)[0]["children"][0]["content"]
        content[0]["actions"][-1]["future_metadata"] = {"keep": True}
        decompiled = decompile_script(content)
        self.assertIn('if logic.equals("left", "right"):', decompiled)
        self.assertIn('network.send_page(', decompiled)
        self.assertNotIn('block logic/18', decompiled)
        result = compile_script(decompiled)[0]["children"][0]["content"]
        self.assertEqual(content, result)

    def test_api_v2_uses_canonical_order_and_legacy_aliases_keep_catalog_order(self):
        canonical = compile_script(
            'on button_press("button01"):\n'
            'tables.set("items", "entry", "value")\n'
            'tables.insert("items", 2, "new")'
        )[0]["children"][0]["content"]
        event, = canonical
        self.assertEqual(event["id"], "1")
        set_block, insert_block, = event["actions"]
        self.assertEqual(set_block["id"], "55")
        self.assertEqual([field["value"] for field in set_block["text"] if isinstance(field, dict)],
                         ["entry", "items", "value"])
        self.assertEqual(insert_block["id"], "89")
        self.assertEqual([field["value"] for field in insert_block["text"] if isinstance(field, dict)],
                         ["new", 2, "items"])

        legacy = compile_script(
            'on button_pressed("button01"):\n'
            'tables.set_entry_of_to("entry", "items", "value")'
        )[0]["children"][0]["content"]
        self.assertEqual(legacy[0]["id"], "1")
        legacy_set = legacy[0]["actions"][0]
        self.assertEqual(legacy_set["id"], set_block["id"])
        self.assertEqual([field["value"] for field in legacy_set["text"] if isinstance(field, dict)],
                         ["entry", "items", "value"])
        self.assertIn('on button_press("button01"):', decompile_script(legacy))

    def test_api_reference_covers_all_named_catalog_entries_and_aliases(self):
        reference = json.loads((ROOT / "API_REFERENCE.json").read_text(encoding="utf-8"))
        catalog = BlockCatalog()
        functions = [entry for module in reference["modules"] for entry in module["functions"]]

        self.assertEqual(reference["version"], 2)
        self.assertEqual(len(functions), 126)
        self.assertEqual(len(reference["events"]), 11)
        self.assertEqual(len(reference["languageConstructs"]), 1)
        self.assertEqual(len(catalog.named_templates), 138)
        self.assertEqual(len({entry["qualifiedName"] for entry in functions}), len(functions))
        old_names = {
            entry["legacyName"]
            for entry in functions + reference["events"] + reference["languageConstructs"]
        }
        inventory_names = set(re.findall(
            r"^FUNCTION: (.+)$",
            (ROOT / "CATWEB_FUNCTIONS.txt").read_text(encoding="utf-8"),
            re.MULTILINE,
        ))
        self.assertEqual(old_names, inventory_names)

        for module in reference["modules"]:
            for entry in module["functions"]:
                canonical = catalog.get_named("block", entry["qualifiedName"], 1)
                for alias in entry["legacyAliases"]:
                    self.assertIs(catalog.get_named("block", alias, 1), canonical)
        for entry in reference["events"]:
            canonical = catalog.get_named("top", entry["name"], 1)
            for alias in entry["legacyAliases"]:
                self.assertIs(catalog.get_named("top", alias, 1), canonical)

    def test_python_like_calls_assignments_and_events_compile(self):
        source = (
            'on button_pressed("button01"):\n'
            '    visitas = 1\n'
            '    console.log("Pulsado")'
        )
        content = compile_script(source)[0]["children"][0]["content"]
        self.assertEqual(content[0]["id"], "1")
        self.assertEqual(content[0]["text"][1]["value"], "button01")
        self.assertEqual([action["id"] for action in content[0]["actions"]], ["11", "0"])
        self.assertIn('visitas = "1"', decompile_script(content))

    def test_function_header_uses_python_definition_syntax(self):
        content = compile_script('def bienvenida():\n    console.log("Hola")')[0]["children"][0]["content"]
        self.assertIn("def bienvenida():", decompile_script(content))

    def test_event_actions_are_unindented_and_only_scopes_indent(self):
        source = (
            'on load:\n'
            'console.log("inicio")\n'
            'if logic.is_equal_to("a", "b"):\n'
            '    console.log("dentro")\n'
            'console.warn("fuera")\n\n'
            'on button_pressed("boton"):\n'
            'console.log("otro evento")'
        )
        content = compile_script(source)[0]["children"][0]["content"]
        decompiled = decompile_script(content)
        lines = [line.partition("  # ")[0] for line in decompiled.splitlines()]
        self.assertEqual(lines, [
            "on load:", 'console.log("inicio")', 'if logic.equals("a", "b"):',
            '    console.log("dentro")', 'console.warn("fuera")', "",
            'on button_press("boton"):', 'console.log("otro evento")',
        ])

    def test_compiled_top_level_blocks_reset_positions_without_changing_actions(self):
        content = compile_script(
            'on load:\nconsole.log("hola")'
        )[0]["children"][0]["content"]
        content[0]["x"], content[0]["y"] = "500", "700"
        content[0]["actions"][0]["x"], content[0]["actions"][0]["y"] = "35", "60"
        recompiled = compile_script(decompile_script(content))[0]["children"][0]["content"]
        self.assertEqual((recompiled[0]["x"], recompiled[0]["y"]), ("0", "0"))
        self.assertEqual((recompiled[0]["actions"][0]["x"], recompiled[0]["actions"][0]["y"]), ("35", "60"))

    def test_cli_writes_compact_json_by_default(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "sample.cat"
            output = Path(directory) / "sample.json"
            source.write_text('on load:\nlog "compact"\n', encoding="utf-8")
            subprocess.run(
                [sys.executable, str(ROOT / "catweb_script.py"), str(source), "-o", str(output)],
                check=True,
                capture_output=True,
                text=True,
            )
            text = output.read_text(encoding="utf-8")
            self.assertEqual(text, json.dumps(json.loads(text), ensure_ascii=False, separators=(",", ":")) + "\n")

    def test_raw_api_writes_compact_json_by_default(self):
        project = [folder(text_label("Catweb", globalid="label01"), globalid="root01")]
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "raw.json"
            save(project, output)
            text = output.read_text(encoding="utf-8")
            self.assertEqual(text, json.dumps(project, ensure_ascii=False, separators=(",", ":")) + "\n")


if __name__ == "__main__":
    unittest.main()
