import copy
import unittest
import warnings

from catweb.codec import CatwebCodecError, CatwebCodecWarning, decode_project, encode_project
from catweb.script import BlockCatalog, compile_script, decompile_script


class CatwebProjectCodecTests(unittest.TestCase):
    def setUp(self):
        self.catalog = BlockCatalog()

    def test_identifier_and_string_fields_use_separate_codecs(self):
        source = 'on load:\n    hello = "hola"\n    console.log("hola")'
        plain = compile_script(source, catalog=self.catalog)
        encoded = encode_project(plain, self.catalog)
        actions = encoded[0]["children"][0]["content"][0]["actions"]
        top = encoded[0]["children"][0]["content"][0]
        set_fields = [field for field in actions[0]["text"] if isinstance(field, dict)]
        log_fields = [field for field in actions[1]["text"] if isinstance(field, dict)]

        self.assertEqual(top["text"], [""])
        self.assertEqual(actions[0]["text"][0], "Set")
        self.assertEqual(actions[1]["text"][0], "Log")
        self.assertEqual(set_fields[0]["value"], "7168757578")  # Catweb identifier table
        self.assertEqual(set_fields[1]["value"], "{7}{14}{11}{0}")
        self.assertEqual(log_fields[0]["value"], "{7}{14}{11}{0}")
        original_fields = [
            field for field in plain[0]["children"][0]["content"][0]["actions"][0]["text"]
            if isinstance(field, dict)
        ]
        self.assertEqual([field["value"] for field in original_fields], ["hello", "hola"])

        decoded = decode_project(encoded, self.catalog)
        restored = decompile_script(decoded[0]["children"][0]["content"], self.catalog)
        self.assertIn('hello = "hola"', restored)
        self.assertIn('console.log("hola")', restored)

    def test_non_script_data_and_unknown_blocks_are_preserved(self):
        project = compile_script('on load:\n    console.log("hola")', catalog=self.catalog)
        project[0]["alias"] = "Mi proyecto"
        project[0]["children"][0]["content"][0]["actions"].append(
            {"id": "future", "globalid": "future01", "text": ["Future", {"t": "string", "value": "hola"}]}
        )
        encoded = encode_project(project, self.catalog)
        self.assertEqual(encoded[0]["alias"], "Mi proyecto")
        self.assertEqual(
            encoded[0]["children"][0]["content"][0]["actions"][1]["text"][1]["value"],
            "hola",
        )
        self.assertEqual(decode_project(encoded, self.catalog), project)

    def test_unsupported_string_characters_are_preserved_with_a_warning(self):
        project = compile_script('on load:\n    console.log("ñ")', catalog=self.catalog)
        with warnings.catch_warnings(record=True) as caught:
            warnings.simplefilter("always", CatwebCodecWarning)
            encoded = encode_project(project, self.catalog)

        value = encoded[0]["children"][0]["content"][0]["actions"][0]["text"][1]["value"]
        self.assertEqual(value, "ñ")
        self.assertTrue(any("preserved literally" in str(warning.message) for warning in caught))
        self.assertEqual(decode_project(encoded, self.catalog), project)

    def test_comment_text_is_preserved_without_string_value_encoding(self):
        project = compile_script('on load:\n# ●●● Conn ● 1.1.3 ●●●', catalog=self.catalog)

        encoded = encode_project(project, self.catalog)

        comment = encoded[0]["children"][0]["content"][0]["actions"][0]["text"][0]
        self.assertEqual(comment["value"], "●●● Conn ● 1.1.3 ●●●")
        self.assertEqual(decode_project(encoded, self.catalog), project)

    def test_control_labels_are_preserved_and_previous_blank_labels_restore(self):
        source = (
            'on load:\n'
            'if logic.equals("left", "right"):\n'
            '    console.log("yes")\n'
            'else:\n'
            '    console.log("no")'
        )
        project = compile_script(source, catalog=self.catalog)
        encoded = encode_project(project, self.catalog)
        actions = encoded[0]["children"][0]["content"][0]["actions"]
        self.assertEqual(actions[0]["text"][0], "If")
        self.assertEqual(actions[2]["text"][0], "else")
        self.assertEqual(actions[-1]["text"][0], "end")

        old_all_blank = copy.deepcopy(encoded)
        for action in old_all_blank[0]["children"][0]["content"][0]["actions"]:
            action["text"] = ["" if isinstance(part, str) else part for part in action["text"]]
        self.assertEqual(decode_project(old_all_blank, self.catalog), project)

    def test_encoded_compiler_output_can_be_decompiled(self):
        source = 'on load:\n    visits = "1"\n    console.log("Welcome")'
        encoded = compile_script(source, catalog=self.catalog, encoded=True)
        restored = decompile_script(encoded[0]["children"][0]["content"], self.catalog)
        self.assertIn('visits = "1"', restored)
        self.assertIn('console.log("Welcome")', restored)

    def test_nested_function_values_encode_and_scoped_names_survive(self):
        source = (
            'on load:\n'
            'functions.run("sumar", "valor", "otro") = "{l!result}"\n'
            'variables.set("{l!let}", "{l!value}")\n'
            'text.split("hola", "") = resultado\n'
            'variables.set("local-long", "96")'
        )
        plain = compile_script(source, catalog=self.catalog)
        encoded = encode_project(plain, self.catalog)
        actions = encoded[0]["children"][0]["content"][0]["actions"]
        run_tuple = next(field for field in actions[0]["text"] if isinstance(field, dict) and field.get("t") == "tuple")
        self.assertTrue(all(value.startswith("{") and value.endswith("}") for value in run_tuple["value"]))
        scoped_variable = next(field for field in actions[1]["text"] if isinstance(field, dict) and field.get("l") == "variable")
        self.assertEqual(scoped_variable["value"], "{l!let}")
        run_output = next(field for field in actions[0]["text"] if isinstance(field, dict) and field.get("l") == "variable?")
        self.assertEqual(run_output["value"], "{l!result}")

        decoded = decode_project(encoded, self.catalog)
        self.assertEqual(decoded, plain)
        local_hyphen = next(field for field in actions[3]["text"] if isinstance(field, dict) and field.get("l") == "variable")
        decoded_hyphen = next(
            field for field in decoded[0]["children"][0]["content"][0]["actions"][3]["text"]
            if isinstance(field, dict) and field.get("l") == "variable"
        )
        self.assertNotEqual(local_hyphen["value"], "local-long")
        self.assertEqual(decoded_hyphen["value"], "local-long")


if __name__ == "__main__":
    unittest.main()
