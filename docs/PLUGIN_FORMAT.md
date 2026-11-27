# Catweb Studio Plugin Manifest

Catweb Studio plugins are declarative JSON files that provide CSL snippets.
They do not load or execute JavaScript. A snippet is inserted into the editor
only after the user chooses it, and should be reviewed before compiling.

## Manifest

Each manifest must be a JSON object containing only these required fields:

| Field | Type | Limit |
| --- | --- | --- |
| `id` | string | 2–64 letters, numbers, `.`, `_`, or `-`; starts with a letter or number |
| `name` | string | 1–100 characters |
| `version` | string | 1–100 characters |
| `author` | string | 1–100 characters |
| `description` | string | 1–280 characters |
| `snippets` | array | 1–30 snippets |

Each snippet is an object containing only a non-empty `label` (up to 80
characters) and non-empty `code` (up to 5,000 characters).

```json
{
  "id": "example.hello",
  "name": "Hello CSL",
  "version": "1.0.0",
  "author": "Example Author",
  "description": "A small greeting snippet.",
  "snippets": [
    {
      "label": "Log a greeting",
      "code": "on load:\n    console.log(\"Hello from Catweb\")"
    }
  ]
}
```

## Install and storage

Install a manifest from a local `.json` file or an HTTP/HTTPS URL in the
Plugins panel. The maximum manifest size is 1 MB. URL installation depends on
the host allowing browser CORS requests; requests do not send credentials and
redirects are rejected.

Installed manifests are cached in this browser's local storage. They are not
synced between devices and there is no remote marketplace. Removing a plugin
only removes its cached manifest; code already inserted into a project remains
part of that project. Export a project as Catweb JSON to back it up or share it.
