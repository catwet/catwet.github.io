# Repository Map

This project is a static GitHub Pages site with two browser editors and a
dependency-free Python toolchain. The browser and Python CSL implementations
are separate; they share the catalog and API data.

## Structure

| Path | Responsibility |
| --- | --- |
| `index.html` | Public entry point for CatWet Script Lab and its browser-local project picker. Keep at the repository root. |
| `studio/` | Browser editor, visual editor, JavaScript CSL compiler/decompiler, codecs, styles, and AI provider adapter. |
| `catweb/` | Maintained Python package: CSL compiler, project codecs, numeric codec, and raw project helpers. |
| `data/catalog/` | Block templates by category plus `catalog-index.json`. This is the source of block IDs and field shapes. |
| `data/API_REFERENCE.json` | Semantic API names, signatures, aliases, and mappings to catalog fields. |
| `data/ENCODE.json` | Shared character map for string values. |
| `examples/projects/` | Example Catweb JSON projects, including object and style trees. |
| `examples/scripts/` | Editable `.cat` source and Python example generator. |
| `examples/reference/` | Legacy reference inputs retained for compatibility work. |
| `tests/` | Python tests for compiler, serialization, and text-codec behavior. |
| `docs/` | Language, project format, API, migration, AI provider, and plugin manifest references. |
| `catweb_*.py` | Root compatibility wrappers for earlier Python imports and CLI usage. |

## Runtime data flow

### Browser

`index.html` loads the Script Lab from `studio/`. Browser code requests block
templates from `data/catalog/`, the semantic API from `data/API_REFERENCE.json`,
and the string map from `data/ENCODE.json`. `studio/catweb-csl.js` compiles and
decompiles CSL; `studio/catweb-codec.js` transforms project JSON fields.
`studio/studio.js` uses the same catalog/compiler for the Visual Editor.
The Script Lab stores project records, provider endpoint/model settings, and
declarative plugin manifests in browser local storage. Provider API keys and
chat history are memory-only; plugin JavaScript is never executed.

Keep URLs relative to the application entry points so GitHub Pages subpath
deployments continue to work. A site change that moves public assets must update
all runtime URLs and links together.

### Python

`catweb/script.py` uses `data/catalog/` and `data/API_REFERENCE.json`.
`catweb/codec.py` uses `data/ENCODE.json`; the identifier and string codecs
remain separate. Root scripts such as `catweb_script.py` only forward to the
package and preserve old CLI/import paths.

## Change workflow

- Changing a block template or API signature: inspect the matching catalog JSON,
  update the shared API reference only when needed, and run compiler tests.
- Changing serialized field behavior: update both Python and browser codecs and
  run the codec tests plus browser import/export checks.
- Changing CSL syntax: update both compilers, language documentation, and
  focused tests. Do not invent Catweb fields absent from the catalog.
- Adding a JSON fixture: put it in `examples/projects/`; put source used to
  generate it in `examples/scripts/`.
- Adding documentation: put it in `docs/` and use paths relative to that file.

The `.cat` format is deliberately not downloadable/exportable in the current
editor. Its future compatibility prototype belongs with the Script and planned
2D Viewer architecture; do not treat this repository reorganization as
implementing the split editor.
