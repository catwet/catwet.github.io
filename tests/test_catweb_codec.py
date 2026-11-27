import copy
import unittest

from catweb_codec import CatwebCodecError, decode_project, encode_project
from catweb_script import BlockCatalog, compile_script, decompile_script


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

    def test_unsupported_characters_fail_instead_of_silently_changing(self):
        project = compile_script('on load:\n    console.log("ñ")', catalog=self.catalog)
        with self.assertRaisesRegex(CatwebCodecError, "ENCODE.json does not support"):
            encode_project(project, self.catalog)

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


if __name__ == "__main__":
    unittest.main()
