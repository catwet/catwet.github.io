"""Fixed-width numeric identifier codec ported from the Catweb Conn table.

Each supported character maps to the first zero-based, two-digit decimal code
in the original Catweb character table. That legacy table contains '%' twice;
the later duplicate remains decodable but encoding uses its first code. This
codec is used for identifier fields, separately from ENCODE.json string values.
"""

from __future__ import annotations

ALPHABET = (
    " !\"#$%&'()"
    "*+,-./"
    "0123456789"
    ":;<=>?@"
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "[\\]^_"
    "abcdefghijklmnopqrstuvwxyz"
    "}{|~`%□"
)

if len(ALPHABET) != 97 or len(set(ALPHABET)) != 96:
    raise RuntimeError("The legacy Catweb codec table must contain 97 entries and 96 unique characters.")

_CHAR_TO_CODE: dict[str, str] = {}
for _index, _character in enumerate(ALPHABET):
    _CHAR_TO_CODE.setdefault(_character, f"{_index:02d}")


def encode_text(text: str) -> str:
    """Encode supported characters as adjacent two-digit decimal codes.

    Raises:
        TypeError: If ``text`` is not a string.
        ValueError: If ``text`` contains a character outside the legacy table.
    """
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    codes: list[str] = []
    for index, character in enumerate(text):
        try:
            codes.append(_CHAR_TO_CODE[character])
        except KeyError as exc:
            raise ValueError(f"Unsupported character at index {index}: {character!r}") from exc
    return "".join(codes)


def decode_text(encoded: str) -> str:
    """Decode adjacent two-digit decimal codes produced by :func:`encode_text`.

    Raises:
        TypeError: If ``encoded`` is not a string.
        ValueError: If the input has an odd length, non-ASCII digits, or a code
            outside the supported alphabet.
    """
    if not isinstance(encoded, str):
        raise TypeError("encoded must be a string")
    if len(encoded) % 2:
        raise ValueError("encoded text must contain an even number of digits")
    if any(character < "0" or character > "9" for character in encoded):
        raise ValueError("encoded text must contain ASCII digits only")

    decoded: list[str] = []
    for index in range(0, len(encoded), 2):
        code = int(encoded[index:index + 2])
        if code >= len(ALPHABET):
            raise ValueError(f"Unsupported numeric code at offset {index}: {code:02d}")
        decoded.append(ALPHABET[code])
    return "".join(decoded)
