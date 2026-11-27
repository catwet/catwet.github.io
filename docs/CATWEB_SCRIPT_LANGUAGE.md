# Catweb Script Language (CSL)

CSL provides a Python-like way to write Catweb scripts. The compiler resolves
names against the actual catalog templates and preserves the structure required
by Catweb. The Python compiler is in
[`catweb/script.py`](../catweb/script.py); the browser compiler is in
[`studio/catweb-csl.js`](../studio/catweb-csl.js).

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

`../data/API_REFERENCE.json` maps API v2 names onto the unchanged templates in
`../data/catalog/catalog-index.json`. Every previous function and event name remains a
legacy alias and keeps its original argument order. The Script Lab block panel
shows the canonical calls and their arguments; click one to insert it.
Arguments use simple literals:
strings, numbers, `True`, `False`, `None`, lists, dictionaries, and `...` for
an undefined value. Values are converted to the format expected by each
template. For example, if a Catweb template defines a value as a string, `1` is
stored as `"1"` to match that schema.

## Variable References in Strings

Use Catweb's native brace form to insert a variable into a string:

```text
visits = 1
console.log("Visits: {visits}")
```

The editor highlights `{name}` references (and `{l!name}` / `{o!name}` scoped
references) inside strings. When typing after `{`, its compact suggestion menu
offers assigned variables; select one, press Enter/Tab, or use the arrow keys.
The editor inserts the closing brace when needed.

Outside strings, typing a catalog call prefix such as `col` suggests matching
CSL calls. Selecting one inserts its call template and focuses the first
placeholder. While the cursor is inside a known call, the suggestion panel
shows each argument's API name, position, template type, Catweb field label,
and input/output direction. These details come from `API_REFERENCE.json` and
the block catalog.

## Variable Scope

Plain assignments use Catweb's global variable behavior:

```text
visits = 1
```

The catalog contains no separate local/object declaration blocks, so CSL does
not emit custom scope properties in Catweb JSON. Catweb's `{l!name}` and
`{o!name}` references are used in supported fields for local and object values;
they are not standalone assignment statements. Scoped references are also
accepted in numeric-typed fields such as `loops.repeat("{l!count}")`; ordinary
non-numeric strings are still rejected there. `global name = value` is
accepted as an explicit spelling of the ordinary assignment and decompiles to
that native form.

The editor uses two separate project-serialization codecs. Variable fields
(`l: variable` and `l: variable?`) are encoded using the fixed-width numeric
identifier table from [`catweb/encoder_v2py.py`](../catweb/encoder_v2py.py).
Other string argument fields use [`data/ENCODE.json`](../data/ENCODE.json), producing
tokens such as `{7}{14}{11}{0}` for `hola`. The editor decodes these fields
when importing so CSL remains readable. Catweb comment fields remain plain
text, matching their native JSON representation. Static text labels on known
blocks are only blanked when confirmed nonessential (the `When website loaded...`
event label). Action and control-block labels stay unchanged. Block IDs,
object properties, and unknown raw blocks are not transformed.

The codecs support only their documented character tables. If a string contains
unsupported characters, the complete value is preserved literally and export
shows a warning with the field path; it is never partially encoded or replaced.
Import auto-detects canonical numeric identifiers and complete `{index}` token
sequences. As a result, pre-existing numeric names or literal strings matching
those patterns can be interpreted as encoded; use readable identifiers and
ordinary strings for unencoded projects.

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
compact project JSON in a copyable modal; it does not download a file or compile
source implicitly. If a script has uncompiled edits, a notice explains that
the export contains its last compiled blocks. Compile the script first to
include those edits. Script and object aliases can be edited in the inspector
and are preserved in project JSON.
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
uses that metadata. `.cat` import/export remains disabled; the stored metadata
prototype is intended to support it when that format is re-enabled.

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

## Function Results

Blocks with output fields put their destinations after the call, using `=`.
Their output fields are omitted from the parentheses; multiple outputs follow
the catalog's output order:

```text
on load:
text.split("hola", "") = partes
functions.run("sumar", 5, 5) = resultado
console.log("Resultado: {resultado}")
```

`functions.run` takes the function name first. The remaining call arguments are
packed into Catweb's argument tuple. To call a function without arguments, use
`functions.run("valor_fijo") = resultado`. A block with multiple outputs can
assign each one in order, for example
`functions.run_protected("procesar", "dato") = exito, resultado`.

The same suffix applies to any named catalog block whose API metadata marks
fields as outputs. Existing calls that still include output fields inside the
parentheses remain importable; the editor decompiles them to the suffix form.
This is a CSL notation change only: compilation still fills the original
Catweb output fields, and `functions.return(value)` continues to return from
inside a function.

## Compatibility and Compilation

The legacy syntax `top category/id [...]` and `block category/id [...]` is
still supported for existing projects, but the editor generates Python-like
syntax for known templates. Comments start with `#`; a blank line separates
top-level events.

```console
python -m catweb.script examples/scripts/welcome.cat
```

Output is compact by default; use `--pretty` for indented JSON.
`-o path.json` chooses a different destination, and `--name "My Brand"` sets
the generated folder alias.

The app must be served over HTTP to load the catalogs:

```console
python -m http.server 8000
```

Open <http://localhost:8000/> to start the main Studio. The previous route,
`studio/script.html`, redirects to the main entry point.

Test the output in Catweb to verify real behavior; successful compilation only
confirms that it matches the available templates.
