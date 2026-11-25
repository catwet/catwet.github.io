# Guide for Requesting Catweb Projects from an AI Model

This file provides project context for a model that will create a Catweb
website. Also attach `README.md`, `info.md`, and relevant examples from
`files.json`, `styling.json`, and `script/`. The game is the final authority:
these references do not prove import or execution.

## Recommended Workflow

1. Describe the website and desired behavior in natural language.
2. For logic, request `.cat` source using the syntax in
   [`CATWEB_SCRIPT_LANGUAGE.md`](CATWEB_SCRIPT_LANGUAGE.md), not expanded JSON
   blocks.
3. Compile the `.cat` file in the main Studio (`index.html`) or with
   `python catweb_script.py` to produce a `files.json`-style output based on
   catalog blocks.
4. To adjust visual objects, open the JSON in the secondary editor
   (`studio/index.html`) to inspect the tree and its properties.
5. Test the file in the game. If it fails, share the error and `.cat` source
   with the model to fix it.

## Base Instructions for the Model

Copy this block and fill in the details in brackets:

> Create Catweb behavior for this request: [describe the project and desired
> outcome]. Use the text-based language defined in
> `CATWEB_SCRIPT_LANGUAGE.md`. Return a `.cat` file with the necessary events
> and actions. Use events such as `on load:` and semantic named calls such as
> `console.log("Hello")` and `visits = 1`, backed by `script/`. The legacy
> syntax `top category/id [...]` and `block category/id [...]` remains available
> for compatibility. Do not invent statements, events, or fields; preserve
> catalog types and ordering. Write event actions without indentation; indent
> only nested block bodies, and leave a blank line before each new event.
> If a capability is missing from the catalog, list it separately and do not
> pretend it has been implemented.
> Keep the source short and easy to modify. Separate code from any explanation.

If the request also includes a visual interface, ask for JSON backed by
`files.json` and `styling.json`. The Visual Editor can import a complete project
or JSON containing only a script; select the `script` object to inspect or edit
its CSL, then export the complete project.

## Current Contract Limitations

- Optional properties depend on the object type; there is not yet a
  comprehensive schema derived from the game.
- CSL can emit templates from every category listed in
  `script/catalog-index.json` using `top` and `block`; the available catalog
  does not prove that these are all capabilities in the game.
- In events and blocks, `text`, `actions`, `id`, `globalid`, and
  `variable_overrides` have specific shapes. Copy a block from the relevant
  category and modify only fields you understand based on evidence.
- Preserve `actions` order, including `else` and `end` when present.
- Preserve values as strings when the reference shows them as strings, even if
  they resemble booleans, numbers, colors, or structures.
- Do not claim the website works until it has been tested in Catweb.

## Expected Report

When delivering the project, the model should state:

- Which pages and objects it included.
- Which behaviors it implemented and which catalog blocks it used.
- Which parts remain pending due to missing references.
- That final acceptance must be confirmed by importing it into the game.
