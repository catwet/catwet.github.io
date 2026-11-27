"""Compatibility imports; codec implementation lives in ``catweb.codec``."""

from catweb.codec import (
    CatwebCodecError,
    CatwebCodecWarning,
    decode_content,
    decode_project,
    encode_project,
)

__all__ = [
    "CatwebCodecError",
    "CatwebCodecWarning",
    "decode_content",
    "decode_project",
    "encode_project",
]
