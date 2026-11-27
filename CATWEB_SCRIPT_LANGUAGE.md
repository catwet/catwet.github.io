# Catweb Script Language (CSL)

CSL provides a Python-like way to write Catweb scripts. The compiler resolves
names against the actual catalog templates and preserves the structure required
by Catweb. The Python compiler is in
[`catweb_script.py`](catweb_script.py); the browser compiler is in
[`studio/catweb-csl.js`](studio/catweb-csl.js).

## Events and Actions

Each script is organized into events or functions. Actions use the canonical
names and parameter order in [`API_V2.md`](API_V2.md):

```text
on load:
console.log("Welcome")
visits = 1
visits += 1

on button_press("main-button"):
console.warn("Button pressed")
```

`API_REFERENCE.json` maps API v2 names onto the unchanged templates in
`script/catalog-index.json`. Every previous function and event name remains a
legacy alias and keeps its original argument order. The Script Lab block panel
shows the canonical calls and their arguments; click one to insert it.
Arguments use simple literals:
strings, numbers, `True`, `False`, `None`, lists, dictionaries, and `...` for
an undefined value. Values are converted to the format expected by each
template. For example, if a Catweb template defines a value as a string, `1` is
stored as `"1"` to match that schema.

## Variable Scope

Plain assignments use Catweb's global variable behavior:

```text
visits = 1
```

The catalog contains no separate local/object declaration blocks, so CSL does
not emit custom scope properties in Catweb JSON. Catweb's `{l!name}` and
`{o!name}` references are used in supported fields for local and object values;
they are not standalone assignment statements. `global name = value` is
accepted as an explicit spelling of the ordinary assignment and decompiles to
that native form.

For Roblox-filtered or transmitted text, prefer compact numeric-pattern
identifiers such as `v0`, `v1`, and `f0`; CSL identifiers must start with a
letter or underscore. Keep the initial user input as the only unrestricted
long text value, and use reversible numeric tokens for derived payloads where
the algorithm supports it. Preserve Catweb-required API and object IDs exactly.
The catalog does not document general character-code conversion, so arbitrary
Unicode cannot be assumed to have a numeric-only encoding. For Python-side
processing, [`catweb_text_codec.py`](catweb_text_codec.py) implements the
repository's fixed Conn character table, but it is not an executable Catweb
block and rejects characters outside that table.

Control blocks with end markers in the catalog are written with indentation:

```text
on load:
if logic.equals("status", "ready"):
    console.log("Continue")
else:
    console.warn("Waiting")

for loops.repeat(3):
    console.log("Repeat")
```

Specific names and arguments depend on the available Catweb catalog. CSL
covers the templates included in this repository; it cannot generate functions
not described there or guarantee permissions or execution in the game. See
[`API_MIGRATION.md`](API_MIGRATION.md) for all old-to-new names and parameter
order mappings.

## Importing and Preserving Scripts

In CatWet Script Lab, you can import a complete Catweb project, a script, or a
list of scripts. The explorer lets you select scripts and objects; selecting a
script decompiles its content to CSL. When compiled, the result replaces that
script's content in the imported project. **Export JSON** opens the final
compact project JSON in a copyable modal; it does not download a file.
Downloading `.cat` source is disabled while `.cat` compatibility remains a
future prototype for the planned Script and 2D Viewer editor stages.
Project objects retain their positions. `raw` actions and unknown data are
preserved to prevent information loss.

CSL preserves `globalid` and other block metadata in inline comments. These are
ordinary source comments (they begin with `#`), but the CSL compiler recognizes
the `@{...}` JSON object and restores its fields when you compile. For example:

```text
console.log("Hello")  # @{"globalid":"abc123","width":"350"}
```

The `globalid` is Catweb's identifier for that block; `width` and similar
properties are retained when present in the imported JSON. For an `if` or loop,
the metadata can also preserve the identifier and extra properties of its
implicit end block. They are not errors or text executed by Catweb. Keep them
when editing imported scripts if you want to preserve those identifiers and
properties. Positions do not need to be specified: top-level blocks are placed
at `(0, 0)` when newly created. Imported top-level `x` and `y` coordinates are
preserved through hidden metadata when the script is compiled.

When a project is imported into CatWet Studio, metadata is separated from the
editable source and kept internally by line. The code therefore contains no
visible `# @...` comments, while an `i` in the line-number gutter indicates
preserved metadata; hover over it or click it to inspect the fields. Compilation
uses that metadata, and saving a `.cat` source file writes it back as inline
comments for compatibility with Catweb and other CSL tools.

Blocks without an interpretable name are represented as `raw` to preserve
their data unchanged. An unrecognized top-level block is preserved as
`topraw`. You can edit these forms directly to preserve a future or
Catweb-specific template. A named call is instantiated from the repository's
current catalog, so it may produce a different block ID from an older imported
template; keep `raw` or the legacy category/ID form when exact block identity
matters. The project JSON remains unchanged until compilation replaces the
script content. Top-level `x` and `y` are kept out of the editable CSL text,
but appear in the hidden metadata indicator and are restored on compilation.
Unrecognized `topraw` blocks retain their full original top-level fields.

## Function Return Values

Use `functions.return(value)` inside a function to return a value. To capture
that value, pass the destination variable name to the `functions.run_function`
block:

```text
def valor_fijo():
    functions.return(10)

on load:
functions.run("valor_fijo", [], "resultado")
console.log("Resultado: {resultado}")
```

The third argument, `"resultado"`, is the output variable. The empty list means
the function takes no arguments. The current CSL compiler accepts literals in
arguments and assignments; it does not support a nested call such as
`resultado = sumar(5 + 5)`. Use the catalog's blocks and output-variable field
instead. Confirm the result in Catweb, since this repository only documents
the observed block format.

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
