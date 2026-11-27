import unittest

from catweb_text_codec import ALPHABET, decode_text, encode_text


class CatwebTextCodecTests(unittest.TestCase):
    def test_legacy_alphabet_preserves_indices_and_duplicate(self):
        self.assertEqual(len(ALPHABET), 97)
        self.assertEqual(len(set(ALPHABET)), 96)
        self.assertEqual(encode_text(" %□"), "000596")
        self.assertEqual(decode_text("95"), "%")
        self.assertEqual(decode_text("96"), "□")
        self.assertEqual(decode_text(encode_text(ALPHABET)), ALPHABET)

    def test_empty_and_supported_text_round_trip(self):
        for text in ("", "Hello, Catweb!", "  09~`□%"):
            with self.subTest(text=text):
                self.assertEqual(decode_text(encode_text(text)), text)

    def test_unsupported_unicode_fails_instead_of_being_replaced(self):
        for text in ("ñ", "é", "😀"):
            with self.subTest(text=text):
                with self.assertRaisesRegex(ValueError, "Unsupported character"):
                    encode_text(text)

    def test_malformed_numeric_data_is_rejected(self):
        for encoded in ("0", "0a", "97", "99", "９０"):
            with self.subTest(encoded=encoded):
                with self.assertRaises(ValueError):
                    decode_text(encoded)


if __name__ == "__main__":
    unittest.main()
