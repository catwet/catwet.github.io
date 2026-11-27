# CatWet Studio: Catweb JSON Format Reference

## Project Goals

Catweb is a Roblox game where players create fictional websites with domains
ending in `.rbx`. This repository's main goal is to provide a web Studio for
creating and inspecting projects, with a text-based language for writing
scripts and translating them into the game's JSON blocks. Python provides an
equivalent compiler for command-line use.

The format is based on references and examples; no exhaustive official
specification is available. CatWet Studio's Visual Editor lets you manage the
project tree and preview it approximately, while the AI guide helps request
content backed by the catalog. **Format validity and execution must be verified
in Catweb.**

## Repository Contents

| Path | Description |
| --- | --- |
| [`index.html`](index.html) | Main entry point: Script Lab, project import, and CSL compilation. |
| [`files.json`](files.json) | Example tree of website objects: folder, UI, controls, and a script. |
| [`styling.json`](styling.json) | UI object with nested style components. |
| [`script/`](script/) | Event and block examples organized by category. |
| [`info.md`](info.md) | Original notes on variables, objects, events, properties, and known limitations. |
| [`examples/`](examples/) | Python/CSL source files and sample JSON outputs. |
| [`catweb_script.py`](catweb_script.py) | Python CSL compiler with generic blocks backed by the available catalog. |
| [`catweb_encoder_v2py.py`](catweb_encoder_v2py.py) | Fixed-width numeric encoder for Catweb variable identifiers. |
| [`catweb_codec.py`](catweb_codec.py) | Field-aware project serialization using separate identifier and string codecs. |
| [`studio/catweb-codec.js`](studio/catweb-codec.js) | Browser-side codec matching Python project import/export behavior. |
| [`API_REFERENCE.json`](API_REFERENCE.json) | Shared API v2 names, signatures, aliases, and block argument mappings. |
| [`API_V2.md`](API_V2.md) | Complete API v2 function, event, parameter, and example reference. |
| [`API_MIGRATION.md`](API_MIGRATION.md) | Legacy-name and parameter-order migration table. |
| [`CATWEB_SCRIPT_LANGUAGE.md`](CATWEB_SCRIPT_LANGUAGE.md) | Supported syntax, mappings, and rules for extending the language. |
| [`studio/catweb-csl.js`](studio/catweb-csl.js) | CSL compiler and decompiler shared by the web editors. |
| [`examples/welcome.cat`](examples/welcome.cat) | Catweb language source example. |
| [`studio/index.html`](studio/index.html) | Secondary visual editor for adding objects and editing project properties. |
| [`studio/script.html`](studio/script.html) | Compatibility route that redirects to the main entry point. |
| [`AI_PROJECT_GUIDE.md`](AI_PROJECT_GUIDE.md) | Contract and base prompt for generating websites with AI models. |
| [`AI_PROVIDER_GUIDE.md`](AI_PROVIDER_GUIDE.md) | Configure an AI provider for local CSL generation and compilation. |
| [`studio/ai-provider.js`](studio/ai-provider.js) | Browser adapter for OpenAI-compatible Chat Completions endpoints. |

Script category names are: `audio`, `color`, `console`,
`cookies`, `events`, `functions`, `hierarchy`, `input`, `logic`, `looks`,
`loops`, `math-variables`, `navigation`, `network`, `strings`, `tables`, and
`time`.

## Initial Project Generation with Python

[`catweb_raw.py`](catweb_raw.py) is an initial dependency-free Python API to
create the JSON tree directly. Its helpers preserve values as provided; use
strings for properties represented as strings in the references. `validate()`
checks the basic tree structure and identifiers, but cannot confirm acceptance
in the game. `save()` writes compact JSON by default; `pretty=True` creates an
indented version for inspection.

From the project root, run:

```console
python examples/hello_catweb.py
```

This creates [`examples/hello_catweb.json`](examples/hello_catweb.json), an
output in the array format used by `files.json`. The Python example remains
editable source; the generated JSON is the file to import and test in Catweb.
For scripting, `script(*content)` accepts raw catalog JSON blocks and preserves
their content and order; blocks should still be copied from verified references.

## Numeric Catweb Project Encoding

The project compiler and browser editor keep readable CSL internally and encode
Catweb argument fields only when producing JSON. Variable fields (`l: variable`
or `variable?`) use the fixed-width identifier codec in
[`catweb_encoder_v2py.py`](catweb_encoder_v2py.py). Other string arguments use
the character map in [`ENCODE.json`](ENCODE.json), serialized as tokens such as
`{7}{14}{11}{0}`. The confirmed nonessential `When website loaded...` label is
blanked on export; action and control-block labels remain intact. Matching
numeric identifiers and token-only string values are decoded automatically;
unrelated object properties, block IDs, and unknown blocks remain unchanged.

The two codecs are intentionally separate. The identifier codec emits two
ASCII digits per character and retains the legacy alphabet's duplicate `%`;
`ENCODE.json` uses its own numeric indices. Unsupported characters cause an
explicit encoding error instead of being silently replaced. Automatic import
decoding can reinterpret a pre-existing numeric variable name or literal string
that exactly matches one of these encoded patterns.

The legacy text-codec import remains available as a compatibility module:

```python
from catweb_text_codec import decode_text, encode_text

payload = encode_text("variable_name")
original = decode_text(payload)
```

The compiler CLI emits encoded JSON by default; pass `--plain` to preserve
readable argument values in its output.

## Text-Based Script Language

[`catweb_script.py`](catweb_script.py) compiles CSL using templates copied from
all categories listed in `script/catalog-index.json`. Common statements have
short aliases:

```text
on load:
console.log("Welcome")
visits = 1

on button_pressed("main-button"):
console.warn("Button pressed")
```

Compile it from the repository root:

```console
python catweb_script.py examples/welcome.cat
```

Known blocks use semantic named calls and parentheses. The legacy syntax
`top category/id [arguments]` and `block category/id [arguments]` is still
supported; `raw` preserves JSON blocks without a recognized CSL form. See
[`API_V2.md`](API_V2.md) for the complete canonical function and event API, and
[`API_MIGRATION.md`](API_MIGRATION.md) for legacy names and argument-order
compatibility. [`CATWEB_SCRIPT_LANGUAGE.md`](CATWEB_SCRIPT_LANGUAGE.md)
describes scopes, end markers, metadata, and generic catalog syntax.

The command creates `examples/welcome.json`, a `files.json`-style array with a
folder, `script` object, top-level blocks, and ordered actions. JSON is compact
by default to reduce its size; use `--pretty` to inspect an indented version.
Having a block in the catalog lets the compiler build its JSON, but does not
confirm permissions or acceptance/execution by Catweb.

## Web Studio

The main entry point is [`index.html`](index.html), which opens CatWet Script
Lab. To work with an object preview, open the secondary CatWet Visual Editor at
[`studio/index.html`](studio/index.html). Both editors import JSON projects; the
Visual Editor lets you add objects, navigate the tree, and edit properties.
The preview is approximate and does not execute scripts.

## Run Locally or on GitHub Pages

Start a web server from the project root:

```console
python -m http.server 8000
```

Open <http://localhost:8000/>. Write your code and use **Compile** or
`Ctrl+Enter` to compile it locally. **Export JSON** opens the compact project
JSON in a modal for copying; it does not download automatically. `.cat` source
downloads remain disabled. The editable project name/brand is exported as the
folder `alias`.

The project is static and requires no build step or web dependencies.
For GitHub Pages, publish the project root and keep `index.html`, `studio/`, and
`script/` together. Resource and catalog paths are relative, so they also work
under a Pages repository path. Opening the app by double-clicking may prevent
the browser from loading catalogs due to security restrictions.

## Generation with AI Models

The **AI Builder** in the main Studio can connect directly to a user-configured,
OpenAI-compatible Chat Completions endpoint. It generates CSL, compiles it in
the browser using the local Catweb catalog, previews JSON, and can add the
compiled result as a new script. See [`AI_PROVIDER_GUIDE.md`](AI_PROVIDER_GUIDE.md)
for provider setup and privacy details. For external AI workflows, use
[`AI_PROJECT_GUIDE.md`](AI_PROJECT_GUIDE.md) as base instructions and do not
invent unsupported Catweb behavior. Generated scripts still need testing in
Catweb.

## How to Read the JSON

The main reference files begin with a **JSON array** (`[...]`), which currently
contains one root object. Do not assume the format is always a single object
without an array: preserving the array and the observed structure avoids
incompatibilities with the game.

The examples contain three groups of data:

1. **Object tree** (`files.json`): objects with `class`, `globalid`, and usually
   `children`. The children represent the hierarchy.
2. **Style tree** (`styling.json`): an object with style components in
   `children`; those components can also have children.
3. **Script content** (`script/*.json`): a `class: "script"` object with a
   `content` list of blocks and events; blocks include actions.

The JSON does not use a conventional typed schema for every value. For example,
sizes, coordinates, booleans, and numbers in several examples are written as
**strings** (`"true"`, `"350"`, `"{0.1, 0},{0.1, 0}"`). Do not automatically
convert them to booleans, numbers, or objects: preserve the exact type and
representation shown by the relevant field and example. Size and position
structures contain strings with Catweb-specific syntax; they are not JSON arrays.

### Identifiers

- `globalid` appears in objects, style components, scripts, and blocks. The
  project notes describe it as an identifier the game uses to relate elements,
  for example in parent-child relationships or from scripts.
- Observed values are short, opaque strings. This repository does not document
  a generation algorithm or a verified global uniqueness rule.
- When creating a document, assign consistent identifiers and avoid collisions
  between elements that must be distinct. If a block or script references an
  object, preserve the relationship between them.
- `id` appears in blocks and seems to be another identifier, distinct from
  `globalid`. The examples do not fully specify its namespace or rules; do not
  interchange these fields.

## Website Objects: `files.json`

The root example is a folder:

```json
[
  {
    "class": "Folder",
    "globalid": "tq",
    "children": []
  }
]
```

In the actual file, `children` contains the page objects. Observed types:

- `Frame`: visual container.
- `TextLabel`: text.
- `ImageLabel`: image.
- `TextButton`: button; observed variants are `TextButton?link`,
  `TextButton?transfer`, and `TextButton?avataritem`.
- `ImageButton`: image button.
- `TextBox`: input field; the example includes `editable`.
- `ScrollingFrame`: scrollable container; the example includes `canvassize`.
- `script` (lowercase): object with `content`, separate from UI objects in the
  tree.

The variant is part of the literal `class`: preserve capitalization and the
`?` suffix. The notes describe the variants as a link, donation, and avatar
item purchase, but this repository does not implement or verify those behaviors.

Fields seen in the object example:

| Field | Observed use |
| --- | --- |
| `class` | Literal object type. |
| `globalid` | Object identifier. |
| `children` | List of child objects; empty for the example's leaf elements. |
| `content` | Content of the `script` object. |
| `size` | Size represented as a Catweb-formatted string. |
| `canvassize` | `ScrollingFrame` canvas size, also represented as a string. |
| `text`, `placeholder` | Text or helper text for controls. |
| `image`, `image_id` | Distinct image values that appear together in the example; do not treat them as equivalent. |
| `background_color`, `font_color`, `placeholder_color` | Colors represented as hexadecimal strings. |
| `background_transparency`, `font_size`, `align_x`, `align_y`, `rich`, `auto_color`, `multiline`, `editable` | Properties represented as strings in the example. |

The full list of collected conceptual properties is in [`info.md`](info.md).
Serialized JSON names may use `snake_case` (for example `background_color`),
so do not replace them with readable English labels without evidence that the
game accepts them.

## Style Components: `styling.json`

The example shows a `Frame` with `children` of type `UIStroke`, `UICorner`,
`UIShadow`, `UIListLayout`, `UIGridLayout`, `UIAspectRatioConstraint`,
`UISizeConstraint`, `UIGradient`, `UIPadding`, and `UIFlexItem`.

These components are nested inside the objects they affect; in the example,
they are not independent files or sibling page objects. Some observed fields
are `radius`, `radius_top_left`, `radius_bottom_left`,
`radius_bottom_right`, `radius_top_right`, `padding`, `sort`, `size`, and
`gradient_color`. For example, `gradient_color` contains a string that appears
to encode a list of color stops:
`"[[0,\"ff0000\"],[0.498,\"00ff39\"],[1,\"000cff\"]]"`. Although this value
resembles JSON, its outer type is a JSON string; do not convert it to an array
without confirming what the game expects.

## Scripts and Blocks: `script/*.json`

The files in `script/` are **block catalog samples**, organized by topic. They
are not executable source code modules. The general observed structure is:

```json
[
  {
    "class": "script",
    "content": [
      {
        "id": "0",
        "globalid": "g_",
        "x": "4740.720703125",
        "y": "4524",
        "width": "350",
        "text": ["When website loaded..."],
        "actions": []
      }
    ],
    "globalid": "QE"
  }
]
```

This snippet is only a structural guide, not a guaranteed template for every
block. In particular:

- `content` contains top-level blocks, usually events or function definitions.
- `text` is a mixed list: it combines visible literal fragments (such as
  `"Set"` or `"to"`) with objects describing editable fields.
- `actions` is an ordered list of associated blocks. In the samples, order
  matters; blocks such as `If`, `Repeat`, and `Iterate through` appear alongside
  their instructions and an `"end"` block; `else` is also represented as a
  block. Preserve the full sequence: do not reorder or discard closing blocks.
- The `x`, `y`, and `width` coordinates appear as numeric strings in the files.
- Some blocks include `variable_overrides`; preserve it when present.
- Not all blocks have the same fields, and not every field appears in every
  category.

Field objects inside `text` use metadata such as:

| Field | Meaning in the examples |
| --- | --- |
| `t` | Field type, for example `string`, `number`, `any`, `object`, `key`, `id`, `tuple`, or `array`. |
| `l` | Field label/role, for example `variable`, `property`, `table`, `function`, `comment`, `input`, `button`, or `cookie`. |
| `value` | Example or default value; may be a string or another JSON type. |
| `assetbrowser` | Asset selector, such as `audio` or `image`. |
| `href` | Metadata observed in destination/link fields. |

The letters `t` and `l` are actual keys in the sample format; do not rename
them. Values of `l` such as `variable?`, `id?`, or `success_variable?` must
also be preserved literally. `value` may be absent, so do not assume it is
required.

### Observed Categories and Capabilities

The filenames indicate catalog topics, and the samples include blocks such as:

- `events.json`: load events, object interaction, keyboard, input, messages,
  and purchases.
- `logic.json`, `loops.json`: conditions, logical operators, repetition,
  iteration, `break`, `else`, and `end` markers.
- `math-variables.json`, `strings.json`, `tables.json`, `time.json`,
  `color.json`: variable, math, text, table, time, and color operations.
- `looks.json`, `hierarchy.json`, `input.json`: object properties and actions,
  hierarchy, and input/interaction.
- `functions.json`: function definition, call, return, and protected call.
- `audio.json`, `console.json`, `cookies.json`, `navigation.json`, and
  `network.json`: the block groups indicated by their names.

This list summarizes repository samples; it does not guarantee that it is the
game's complete catalog or specify effects that are not demonstrated by the
reference JSON.

## Variables and Events

The notes in [`info.md`](info.md) describe variable interpolation in strings
using braces, for example `{variable}`. They also document these scope
prefixes:

- `{var}`: global variable, according to the notes.
- `{l!var}`: variable local to the block/event that creates it.
- `{o!var}`: variable associated with the object/script.

The iteration example in `tables.json` exposes `{l!index}` and `{l!value}`.
Event samples and notes also associate local variables with some events, such
as `l.changedProperty`, donation data (`l.identifier`, `l.robuxAmount`,
`l.purchasedNow`), and received-message data. Use the exact name and scope
available for the chosen event; do not invent local variables.

The notes indicate that some functions in the cookies category are paid.
Before generating a script that depends on them, verify that the user has
access to those functions. The repository has no mechanism to verify
permissions.

## Roblox, Messages, and Known Limitations

Some Catweb users have observed long text being censored, especially when
transferred between sites. Roblox's
[text-filtering documentation](https://create.roblox.com/docs/ui/text-filtering)
describes filtering of user-provided or displayed text, not JSON structure
validation. This repository has no evidence that JSON whitespace, block
syntax, or coordinates alone cause censorship.
AI-generated scripts should follow the numeric-first guidance in
[`AI_PROJECT_GUIDE.md`](AI_PROJECT_GUIDE.md): retain the original input as the
only unrestricted long text, use compact numeric-pattern identifiers and
reversible tokens for derived payloads, and preserve catalog-required strings.
The current catalog has no documented general character-to-number conversion,
so do not claim a complete numeric encoding for arbitrary Unicode without
implementing and testing one in Catweb.

## Guide for Building a Compatible Generator

A model or tool implementing the project's goal should:

1. Read `info.md` and the relevant examples in `files.json`, `styling.json`,
   and `script/` first.
2. Build the object tree using the exact observed types for `class`, `children`,
   `globalid`, and serialized properties.
3. Represent scripts with catalog blocks, preserving list structure, field
   metadata, and `actions` order.
4. Preserve JSON types and original format strings; do not automatically
   normalize booleans, numbers, nested strings, or field names.
5. Serialize valid JSON and at least verify that it can be parsed again and
   that required objects, fields, and block end markers are present.
6. Test the output in Catweb. Valid JSON syntax does not prove that the game
   accepts or executes the content.

The main Studio opens from `index.html`; the secondary Visual Editor is at
`studio/index.html`. The Python API has no external dependencies; run
`python examples/hello_catweb.py` from the root to regenerate its example.
Syntactically valid output does not guarantee that the game accepts or executes
the content; each deliverable must be tested in Catweb.
