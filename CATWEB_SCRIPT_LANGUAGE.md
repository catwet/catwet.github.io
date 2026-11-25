# Catweb Script Language (CSL)

CSL provides a Python-like way to write Catweb scripts. The compiler resolves
names against the actual catalog templates and preserves the structure required
by Catweb. The Python compiler is in
[`catweb_script.py`](catweb_script.py); the browser compiler is in
[`studio/catweb-csl.js`](studio/catweb-csl.js).

## Events and Actions

Each script is organized into events or functions. Actions are written as
semantic named calls:

```text
on load:
console.log("Welcome")
visits = 1
visits += 1

on button_pressed("main-button"):
console.warn("Button pressed")
```

Available names are derived from the templates in
`script/catalog-index.json`, with short names for events, variables,
conditions, and common blocks. The Script Lab block panel shows valid calls and
their arguments; click one to insert it. Arguments use simple literals:
strings, numbers, `True`, `False`, `None`, lists, dictionaries, and `...` for
an undefined value. Values are converted to the format expected by each
template. For example, if a Catweb template defines a value as a string, `1` is
stored as `"1"` to match that schema.

Control blocks with end markers in the catalog are written with indentation:

```text
on load:
if logic.is_equal_to("status", "ready"):
    console.log("Continue")
else:
    console.warn("Waiting")

for loops.repeat_times(3):
    console.log("Repeat")
```

Specific names and arguments depend on the available Catweb catalog. CSL
covers the templates included in this repository; it cannot generate functions
not described there or guarantee permissions or execution in the game.

## Importing and Preserving Scripts

In Script Lab, you can import a complete Catweb project, a script, or a list of
scripts. The explorer lets you select scripts and objects; selecting a script
decompiles its content to CSL. When compiled, the result replaces that script's
content in the imported project. Download exports the project as compact JSON,
the reduced format accepted by Catweb.
Project objects retain their positions. `raw` actions and unknown data are
preserved to prevent information loss.

CSL preserves `globalid` and other metadata in comments. Positions do not need
to be specified: top-level blocks are placed at `(0, 0)` when compiled. For
example:

```text
console.log("Hello")  # @{"globalid":"abc123","width":"350"}
```

Blocks without an interpretable name are represented as `raw` to preserve
their data unchanged. An unrecognized top-level block is preserved as
`topraw`. You can edit these forms directly to preserve a future or
Catweb-specific template.

## Compatibility and Compilation

The legacy syntax `top category/id [...]` and `block category/id [...]` is
still supported for existing projects, but the editor generates Python-like
syntax for known templates. Comments start with `#`; a blank line separates
top-level events.

```console
python catweb_script.py examples/welcome.cat
```

Output is compact by default; use `--pretty` for indented JSON.
`-o path.json` chooses a different destination, and `--name "My Brand"` sets
the generated folder alias. Script Lab also downloads compact JSON.

The app must be served over HTTP to load the catalogs:

```console
python -m http.server 8000
```

Open <http://localhost:8000/> to start the main Studio. The previous route,
`studio/script.html`, redirects to the main entry point.

Test the output in Catweb to verify real behavior; successful compilation only
confirms that it matches the available templates.
