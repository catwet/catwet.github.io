# Contributor and Agent Guide

## Read in this order

1. `README.md` for the project purpose and local run instructions.
2. `docs/REPOSITORY_MAP.md` for architecture and data flow.
3. The relevant source, tests, and documentation listed in that map.

## Where changes belong

- Browser editor and shared browser compiler: `studio/`.
- Python compiler, codecs, and project helpers: `catweb/`.
- Shared block templates, API signatures, and encoding map: `data/`.
- Tests: `tests/`.
- Editable CSL/Python examples: `examples/scripts/`.
- Importable project JSON: `examples/projects/`.
- Documentation: `docs/`.
- Keep `index.html`, `studio/`, and `data/` at their current public paths;
  GitHub Pages serves this repository as a static site.

Use the `catweb` package as the maintained Python API. Root-level
`catweb_*.py` modules are compatibility wrappers; keep them working for existing
scripts and imports.

## Validation

Run the Python tests with `python -m unittest discover -s tests`. Check both
CLI entry points when changing the Python compiler:

```console
python catweb_script.py examples/scripts/welcome.cat
python -m catweb.script examples/scripts/welcome.cat
```

For browser changes, serve the repository root with `python -m http.server 8000`
and verify the affected flow at `http://localhost:8000/`. Do not add build tools
or runtime dependencies unless a feature requires them.
