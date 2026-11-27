(function (root) {
  'use strict';

  const ALPHABET = " !\"#$%&'()"
    + '*+,-./'
    + '0123456789'
    + ':;<=>?@'
    + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    + '[\\]^_'
    + 'abcdefghijklmnopqrstuvwxyz'
    + '}{|~`%□';
  const VARIABLE_LABELS = new Set(['variable', 'variable?']);
  const IDENTIFIER_PATTERN = /^[A-Za-z_]\w*$/;
  const NUMERIC_IDENTIFIER_PATTERN = /^(?:[0-9]{2})+$/;
  const ENCODED_STRING_PATTERN = /^(?:\{[0-9]+\})*$/;
  const clone = (value) => JSON.parse(JSON.stringify(value));

  function create(table) {
    if (!table || Array.isArray(table) || typeof table !== 'object') {
      throw new Error('ENCODE.json must contain a numeric-index character map.');
    }
    const stringToCode = new Map();
    Object.entries(table).forEach(([code, character]) => {
      if (!/^[0-9]+$/.test(code) || typeof character !== 'string' || character.length !== 1) {
        throw new Error('ENCODE.json must map numeric indices to single characters.');
      }
      if (stringToCode.has(character)) throw new Error('ENCODE.json contains duplicate character values.');
      stringToCode.set(character, code);
    });

    function encodeIdentifier(value, path) {
      let output = '';
      for (let index = 0; index < value.length; index += 1) {
        const code = ALPHABET.indexOf(value[index]);
        if (code < 0) throw new Error(`${path}: Catweb identifier codec does not support ${JSON.stringify(value[index])} at index ${index}.`);
        output += String(code).padStart(2, '0');
      }
      return output;
    }

    function decodeIdentifier(value) {
      if (!NUMERIC_IDENTIFIER_PATTERN.test(value)) return value;
      let decoded = '';
      for (let index = 0; index < value.length; index += 2) {
        const code = Number(value.slice(index, index + 2));
        if (code >= ALPHABET.length) return value;
        decoded += ALPHABET[code];
      }
      if (!IDENTIFIER_PATTERN.test(decoded) || encodeIdentifier(decoded, 'identifier') !== value) return value;
      return decoded;
    }

    function encodeString(value, path) {
      let output = '';
      for (let index = 0; index < value.length; index += 1) {
        const code = stringToCode.get(value[index]);
        if (code === undefined) {
          throw new Error(`${path}: ENCODE.json does not support ${JSON.stringify(value[index])} at index ${index}.`);
        }
        output += `{${code}}`;
      }
      return output;
    }

    function decodeString(value) {
      if (!ENCODED_STRING_PATTERN.test(value)) return value;
      const tokens = [...value.matchAll(/\{([0-9]+)\}/g)].map((match) => match[1]);
      if (tokens.some((code) => !Object.prototype.hasOwnProperty.call(table, code))) return value;
      return tokens.map((code) => table[code]).join('');
    }

    function transformBlock(node, scope, catalog, path, decode) {
      const template = catalog.matchExisting(scope, node);
      if (template) {
        const fields = (node.text || []).filter((part) => part && typeof part === 'object' && !Array.isArray(part));
        fields.forEach((field, index) => {
          if (typeof field.value !== 'string') return;
          const fieldPath = `${path}.text[field ${index}]`;
          if (VARIABLE_LABELS.has(field.l)) {
            field.value = decode ? decodeIdentifier(field.value) : encodeIdentifier(field.value, fieldPath);
          } else if (field.t === 'string' || field.t === 'any') {
            field.value = decode ? decodeString(field.value) : encodeString(field.value, fieldPath);
          }
        });
        if (decode) {
          node.text = node.text.map((part, index) => typeof part === 'string'
            && typeof template.node.text[index] === 'string' ? template.node.text[index] : part);
        } else if (scope === 'top' && template.category === 'events' && String(node.id) === '0'
          && (node.text || []).filter((part) => typeof part === 'string').join('').trim() === 'When website loaded...') {
          node.text = node.text.map((part) => typeof part === 'string' ? '' : part);
        }
      }
      (Array.isArray(node.actions) ? node.actions : []).forEach((action, index) => {
        if (action && typeof action === 'object') {
          transformBlock(action, 'block', catalog, `${path}.actions[${index}]`, decode);
        }
      });
    }

    function transformProject(project, catalog, decode) {
      const transformed = clone(project);
      const roots = Array.isArray(transformed) ? transformed : [transformed];
      function visit(node, path) {
        if (!node || typeof node !== 'object' || Array.isArray(node)) return;
        if (node.class === 'script' && Array.isArray(node.content)) {
          node.content.forEach((top, index) => {
            if (top && typeof top === 'object') transformBlock(top, 'top', catalog, `${path}.content[${index}]`, decode);
          });
        }
        (Array.isArray(node.children) ? node.children : []).forEach((child, index) => visit(child, `${path}.children[${index}]`));
      }
      roots.forEach((node, index) => visit(node, `project[${index}]`));
      return transformed;
    }

    return {
      encodeProject: (project, catalog) => transformProject(project, catalog, false),
      decodeProject: (project, catalog) => transformProject(project, catalog, true),
    };
  }

  async function load(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Could not load ${url}.`);
    return create(await response.json());
  }

  root.CatwebCodec = { create, load };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.CatwebCodec;
})(globalThis);
