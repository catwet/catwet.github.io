(() => {
  async function generateChatCompletion({ endpoint, model, apiKey, messages, signal }) {
    let url;
    try {
      url = new URL(endpoint);
    } catch {
      throw new Error('Enter a valid provider endpoint URL.');
    }
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('The provider endpoint must use HTTP or HTTPS.');
    }
    if (!model.trim()) throw new Error('Enter a model name.');

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
      headers,
      body: JSON.stringify({ model: model.trim(), messages }),
      signal
    });

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error(`Provider returned HTTP ${response.status} with a non-JSON response.`);
    }
    if (!response.ok) {
      const detail = result && result.error && typeof result.error.message === 'string'
        ? `: ${result.error.message}`
        : '';
      throw new Error(`Provider returned HTTP ${response.status}${detail}`);
    }

    const content = result && result.choices && result.choices[0]
      && result.choices[0].message && result.choices[0].message.content;
    const text = typeof content === 'string'
      ? content
      : Array.isArray(content)
        ? content.map((part) => part && typeof part.text === 'string' ? part.text : '').join('')
        : '';
    if (!text.trim()) throw new Error('Provider response did not contain assistant text in choices[0].message.content.');
    return text.trim();
  }

  window.CatwebAI = Object.freeze({ generateChatCompletion });
})();
