"""Compatibility imports; identifier codec implementation lives in ``catweb.encoder_v2py``."""

from catweb.encoder_v2py import ALPHABET, decode_text, encode_text

__all__ = ["ALPHABET", "decode_text", "encode_text"]
