"""Compatibility entry point; the maintained compiler lives in ``catweb.script``."""

from catweb.script import BlockCatalog, CompileError, compile_script, decompile_script, main

__all__ = ["BlockCatalog", "CompileError", "compile_script", "decompile_script", "main"]


if __name__ == "__main__":
    raise SystemExit(main())
