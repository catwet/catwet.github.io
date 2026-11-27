# AI Chat in Catweb Studio

Catweb Studio includes a conversational assistant that can send a chat history
to a user-configured, OpenAI-compatible Chat Completions endpoint. The AI may
return CSL source; the existing Catweb compiler validates it and creates a
local JSON preview. The AI does not execute code in Roblox or Catweb.

## Configure a Provider

Open **AI Chat**, expand **Connect or change model**, and enter:

- The provider's Chat Completions endpoint URL.
- The model ID expected by that endpoint.
- An API key, if the endpoint requires one.

Choose **Save connection** to keep the endpoint and model in this browser.
The API key is never saved; it remains in page memory only until the AI panel
closes or the page reloads.

The endpoint must accept browser-originated CORS requests and the
`Authorization: Bearer` header when a key is supplied. This is a direct browser
connection: a provider that uses another protocol needs a small adapter in
`studio/ai-provider.js`.

The chat history exists only in memory and is not restored after a page
reload. Each request includes up to the latest 24 user/assistant messages,
plus the public CSL documentation and catalog call signatures. Messages are
sent to the selected provider when you choose **Send**. The project JSON and
active script are not added automatically. A key entered into the page can
still be inspected by browser tools or extensions; use only a provider and
environment you trust.

## Generate, Compile, Test

1. Describe the desired Catweb behavior and use **Send**. Continue the
   conversation to clarify or revise the request.
2. Review and, if needed, edit the CSL shown in the generated-code section.
3. Use **Compile & Preview JSON** to run the repository compiler locally.
4. Add valid output as a new project script, then export/import the project to
   test it in Catweb.

Generated source is not automatically executed. Successful compilation only
checks the repository's available templates; final behavior must be tested in
Catweb. `.cat` downloads remain disabled.
