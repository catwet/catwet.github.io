# Connecting an AI Provider to Catweb Studio

Catweb Studio can send a prompt to a user-configured, OpenAI-compatible
Chat Completions endpoint. The AI returns CSL source; the existing Catweb
compiler validates it and creates a local JSON preview. The AI does not execute
code in Roblox or Catweb.

## Configure a Provider

Open **AI Builder** and enter:

- The provider's Chat Completions endpoint URL.
- The model ID expected by that endpoint.
- An API key, if the endpoint requires one.

The endpoint must accept browser-originated CORS requests and the
`Authorization: Bearer` header when a key is supplied. This is a direct browser
connection: a provider that uses another protocol needs a small adapter in
`studio/ai-provider.js`.

The API key is held only in page memory, never saved to local storage or the
project JSON, and cleared when the AI panel closes or the page reloads. A key
entered into the page can still be inspected by browser tools or extensions;
use only a provider and environment you trust.

No request is made until **Generate CSL** is clicked. At that point the
configured provider receives the prompt, the public `CATWEB_SCRIPT_LANGUAGE.md`
and `AI_PROJECT_GUIDE.md` documentation, and names/signatures of the available
catalog calls. The current project JSON and active script are not sent
automatically. CSL compilation and JSON preview happen locally in the browser.

## Generate, Compile, Test

1. Describe the desired Catweb behavior in the prompt.
2. Generate CSL and review/edit the returned source.
3. Use **Compile & Preview JSON** to run the repository compiler locally.
4. Add valid output as a new project script, then export/import the project to
   test it in Catweb.

Generated source is not automatically executed. Successful compilation only
checks the repository's available templates; final behavior must be tested in
Catweb. `.cat` downloads remain disabled.
