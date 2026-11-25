(function (root) {
  'use strict';

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const MISSING = Object.freeze({ cslMissing: true });
  const fieldValues = (node) => (node.text || []).filter((part) => part && typeof part === 'object' && !Array.isArray(part));
  const labelOf = (node) => (node.text || []).filter((part) => typeof part === 'string').join('').trim();
  function stable(value) {
    if (Array.isArray(value)) return value.map(stable);
    if (value && typeof value === 'object') {
      return Object.keys(value).sort().reduce((result, key) => {
        result[key] = stable(value[key]);
        return result;
      }, {});
    }
    return value;
  }

  function signature(node) {
    return JSON.stringify((node.text || []).map((part) => {
      if (typeof part === 'string') return ['text', part];
      if (part && typeof part === 'object' && !Array.isArray(part)) {
        const field = clone(part);
        delete field.value;
        return ['field', stable(field)];
      }
      return ['literal', part];
    }));
  }

  function createCatalog(sources, reference) {
    const groups = new Map();
    Object.entries(sources).forEach(([category, examples]) => {
      (Array.isArray(examples) ? examples : []).forEach((example) => {
        (example && Array.isArray(example.content) ? example.content : []).forEach((top) => {
          add('top', category, top);
          (Array.isArray(top.actions) ? top.actions : []).forEach((action) => add('block', category, action));
        });
      });
    });

    function add(scope, category, node) {
      if (!node || typeof node !== 'object' || !Object.prototype.hasOwnProperty.call(node, 'id')) return;
      const key = `${scope}/${category}/${node.id}`;
      const shape = signature(node);
      const variants = groups.get(key) || [];
      if (!variants.some((variant) => variant.signature === shape)) variants.push({ signature: shape, node: clone(node) });
      groups.set(key, variants);
    }

    const byKey = new Map();
    const byBase = new Map();
    const bySignature = new Map();
    groups.forEach((variants, groupKey) => {
      const [scope, category, id] = groupKey.split('/');
      const base = `${scope}/${category}/${id}`;
      const entries = variants.map((variant, index) => {
        const key = base + (variants.length > 1 ? `~${index + 1}` : '');
        const item = { scope, category, id, key, node: clone(variant.node), signature: variant.signature,
          opensScope: false, endTemplate: null, elseTemplate: null };
        byKey.set(key, item);
        const signatureKey = `${scope}/${id}/${item.signature}`;
        const matches = bySignature.get(signatureKey) || [];
        matches.push(item);
        bySignature.set(signatureKey, matches);
        return item;
      });
      byBase.set(base, entries);
    });

    byKey.forEach((item) => {
      if (item.scope !== 'block') return;
      const label = labelOf(item.node).toLowerCase();
      if (!label.startsWith('if') && !label.startsWith('repeat') && !label.startsWith('iterate through')) return;
      const end = (byBase.get(`block/${item.category}/25`) || []).find((entry) => labelOf(entry.node).toLowerCase() === 'end');
      if (!end) return;
      item.opensScope = true;
      item.endTemplate = end;
      item.elseTemplate = [...byKey.values()].find((entry) => entry.scope === 'block'
        && entry.category === item.category && labelOf(entry.node).toLowerCase() === 'else') || null;
    });

    const byCall = new Map();
    const byAlias = new Map();
    const argumentOrders = new Map();
    const named = [];
    const registered = new Set();
    const register = (entry, scope, name) => {
      const item = byKey.get(`${scope}/${entry.source.key}`);
      if (!item || item.scope !== scope) throw new Error(`API reference source was not found: ${entry.source.key}.`);
      const callKey = `${scope}/${name}`;
      if (registered.has(callKey) || byAlias.has(callKey)) throw new Error(`The API v2 name ${name} is duplicated.`);
      const fields = fieldValues(item.node);
      const order = entry.sourceArgumentOrder || fields.map((_, index) => index);
      if (order.length !== fields.length || [...order].sort().some((value, index) => value !== index)
          || !Array.isArray(entry.parameters) || entry.parameters.length !== fields.length) {
        throw new Error(`The API reference signature does not match ${name}.`);
      }
      item.callName = name;
      byCall.set(callKey, item);
      argumentOrders.set(callKey, order);
      registered.add(callKey);
      named.push(item);
      (entry.legacyAliases || []).forEach((alias) => {
        const aliasKey = `${scope}/${alias}`;
        if (registered.has(aliasKey) || byAlias.has(aliasKey)) throw new Error(`The legacy API name ${alias} is duplicated.`);
        byAlias.set(aliasKey, item);
      });
    };
    if (!reference || reference.version !== 2) throw new Error('API_REFERENCE.json must describe API version 2.');
    (reference.modules || []).forEach((module) => {
      (module.functions || []).forEach((entry) => register(entry, 'block', entry.qualifiedName));
    });
    (reference.events || []).forEach((entry) => register(entry, 'top', entry.name));
    (reference.extraAliases || []).forEach((alias) => {
      const aliasKey = `${alias.scope}/${alias.name}`;
      const target = byCall.get(`${alias.scope}/${alias.qualifiedName}`);
      if (!target || registered.has(aliasKey) || byAlias.has(aliasKey)) {
        throw new Error(`The extra API alias ${alias.name} is invalid.`);
      }
      byAlias.set(aliasKey, target);
    });
    (reference.languageConstructs || []).forEach((construct) => {
      const item = byKey.get(`${construct.source.scope}/${construct.source.key}`);
      if (!item) throw new Error(`Language construct source was not found: ${construct.source.key}.`);
      item.callName = 'functions.define';
      named.push(item);
    });

    function get(scope, key, line) {
      const exact = byKey.get(`${scope}/${key}`);
      if (exact) return exact;
      const match = key.match(/^([A-Za-z0-9_-]+)\/([^/]+)$/);
      if (match) {
        const variants = byBase.get(`${scope}/${match[1]}/${match[2]}`) || [];
        if (variants.length === 1) return variants[0];
        if (variants.length) throw new Error(`Line ${line}: choose a catalog variant: ${variants.map((item) => item.key.replace(`${scope}/`, '')).join(', ')}`);
      }
      throw new Error(`Line ${line}: ${key} was not found in the ${scope === 'top' ? 'event/top-level block' : 'action'} catalog.`);
    }

    function matchExisting(scope, node) {
      const found = bySignature.get(`${scope}/${node.id}/${signature(node)}`) || [];
      const preference = { events: 0, functions: 1, console: 2, logic: 3 };
      return found.sort((a, b) => (preference[a.category] ?? 10) - (preference[b.category] ?? 10)
        || a.category.localeCompare(b.category))[0] || null;
    }

    function getNamed(scope, name, line) {
      const item = byCall.get(`${scope}/${name}`) || byAlias.get(`${scope}/${name}`);
      if (!item) throw new Error(`Line ${line}: the name ${name} was not found in the ${scope} catalog.`);
      return item;
    }

    function resolveNamed(scope, name, args, line) {
      const callKey = `${scope}/${name}`;
      const item = getNamed(scope, name, line);
      const fields = fieldValues(item.node);
      if (args.length !== fields.length) {
        throw new Error(`Line ${line}: ${name} expects ${fields.length} arguments; received ${args.length}.`);
      }
      const order = byCall.has(callKey) ? argumentOrders.get(callKey) : fields.map((_, index) => index);
      return { item, args: order.map((index) => args[index]) };
    }

    function canonicalArguments(item, args) {
      const order = argumentOrders.get(`${item.scope}/${item.callName}`);
      if (!order) return args;
      const canonical = new Array(order.length);
      order.forEach((canonicalIndex, sourceIndex) => { canonical[canonicalIndex] = args[sourceIndex]; });
      return canonical;
    }

    return { byKey, byBase, byCall, named, get, getNamed, resolveNamed, canonicalArguments, matchExisting };
  }

  async function loadCatalog(base = '../script/') {
    const catalogUrl = new URL(base, document.baseURI);
    const indexResponse = await fetch(new URL('catalog-index.json', catalogUrl));
    if (!indexResponse.ok) throw new Error('Could not load script/catalog-index.json.');
    const index = await indexResponse.json();
    if (!index || !Array.isArray(index.categories)) throw new Error('The catalog index does not contain valid categories.');
    const pairs = await Promise.all(index.categories.map(async (category) => {
      const response = await fetch(new URL(`${encodeURIComponent(category)}.json`, catalogUrl));
      if (!response.ok) throw new Error(`Could not load script/${category}.json.`);
      return [category, await response.json()];
    }));
    const referenceResponse = await fetch(new URL('../API_REFERENCE.json', catalogUrl));
    if (!referenceResponse.ok) throw new Error('Could not load API_REFERENCE.json.');
    return createCatalog(Object.fromEntries(pairs), await referenceResponse.json());
  }

  function instantiate(template, args, metadata, line) {
    const node = clone(template.node);
    const fields = fieldValues(node);
    if (fields.length !== args.length) throw new Error(`Line ${line}: ${template.key.replace(`${template.scope}/`, '')} expects ${fields.length} arguments; received ${args.length}.`);
    fields.forEach((field, index) => {
      const value = args[index];
      if (value === MISSING || value && typeof value === 'object' && value.$missing === true) {
        delete field.value;
      } else if (field.t === 'string' && ['number', 'boolean'].includes(typeof value)) {
        field.value = String(value);
      } else if (field.t === 'number' && typeof value === 'string') {
        const number = Number(value);
        if (!Number.isFinite(number)) throw new Error(`Line ${line}: ${value} is not a number.`);
        field.value = number;
      } else field.value = value;
    });
    if (template.scope === 'top') node.actions = [];
    node.globalid = metadata.globalid || randomId();
    Object.entries(metadata).forEach(([key, value]) => {
      if (!['globalid', 'id', 'text'].includes(key) && !(template.scope === 'top' && ['x', 'y'].includes(key))) {
        node[key] = value;
      }
    });
    if (template.scope === 'top') {
      node.x = '0';
      node.y = '0';
    }
    return node;
  }

  function readCall(rest, line) {
    const match = rest.trim().match(/^([^\s]+)(?:\s+([\s\S]*))?$/);
    if (!match) throw new Error(`Line ${line}: expected a catalog key, such as console/0.`);
    const key = match[1];
    let tail = (match[2] || '').trim();
    let args = [];
    let metadata = {};
    if (tail.startsWith('[')) {
      let end = -1;
      let depth = 0;
      let inString = false;
      let escaped = false;
      for (let index = 0; index < tail.length; index += 1) {
        const character = tail[index];
        if (inString) {
          if (escaped) escaped = false;
          else if (character === '\\') escaped = true;
          else if (character === '"') inString = false;
        } else if (character === '"') inString = true;
        else if (character === '[') depth += 1;
        else if (character === ']') {
          depth -= 1;
          if (depth === 0) { end = index + 1; break; }
        }
      }
      if (end < 0) throw new Error(`Line ${line}: arguments must be a valid JSON array.`);
      let parsed;
      try { parsed = JSON.parse(tail.slice(0, end)); }
      catch { throw new Error(`Line ${line}: arguments must be a valid JSON array.`); }
      if (!Array.isArray(parsed)) throw new Error(`Line ${line}: arguments must be a JSON array.`);
      args = parsed;
      tail = tail.slice(end).trim();
    }
    if (tail) {
      if (!tail.startsWith('@')) throw new Error(`Line ${line}: unexpected text after the arguments.`);
      try { metadata = JSON.parse(tail.slice(1)); }
      catch { throw new Error(`Line ${line}: metadata after @ must be a JSON object.`); }
      if (!metadata || Array.isArray(metadata) || typeof metadata !== 'object') {
        throw new Error(`Line ${line}: metadata after @ must be a JSON object.`);
      }
    }
    return { key, args, metadata };
  }

  function splitTopLevel(source, line) {
    const parts = [];
    let start = 0;
    let quote = null;
    let escaped = false;
    const stack = [];
    const pairs = { ')':'(', ']':'[', '}':'{' };
    for (let index = 0; index < source.length; index += 1) {
      const character = source[index];
      if (quote) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === quote) quote = null;
        continue;
      }
      if (character === '"' || character === "'") quote = character;
      else if (character === '(' || character === '[' || character === '{') stack.push(character);
      else if (Object.prototype.hasOwnProperty.call(pairs, character)) {
        if (stack.pop() !== pairs[character]) throw new Error(`Line ${line}: unbalanced parentheses or brackets.`);
      } else if (character === ',' && stack.length === 0) {
        parts.push(source.slice(start, index).trim());
        start = index + 1;
      }
    }
    if (quote || stack.length) throw new Error(`Line ${line}: an opening string, list, or dictionary is not closed.`);
    const last = source.slice(start).trim();
    if (last || parts.length) parts.push(last);
    if (parts.some((part) => !part)) throw new Error(`Line ${line}: an argument is empty.`);
    return parts;
  }

  function parseSingleQuoted(source, line) {
    let json = '"';
    for (let index = 1; index < source.length - 1; index += 1) {
      const character = source[index];
      if (character === '\\') {
        index += 1;
        if (index >= source.length - 1) throw new Error(`Line ${line}: incomplete escape sequence in string.`);
        const escaped = source[index];
        const replacements = { "'":"'", '"':'\\"', '\\':'\\\\', n:'\\n', r:'\\r', t:'\\t', b:'\\b', f:'\\f' };
        if (escaped === 'u') {
          const digits = source.slice(index + 1, index + 5);
          if (!/^[0-9a-fA-F]{4}$/.test(digits)) throw new Error(`Line ${line}: invalid Unicode escape.`);
          json += `\\u${digits}`;
          index += 4;
        } else if (Object.prototype.hasOwnProperty.call(replacements, escaped)) {
          json += replacements[escaped];
        } else {
          throw new Error(`Line ${line}: invalid escape \\${escaped}.`);
        }
      } else if (character === '"') json += '\\"';
      else json += character;
    }
    json += '"';
    try { return JSON.parse(json); }
    catch { throw new Error(`Line ${line}: invalid quoted string.`); }
  }

  function parseLiteral(source, line) {
    const value = source.trim();
    if (value === '...') return MISSING;
    if (value === 'None') return null;
    if (value === 'True') return true;
    if (value === 'False') return false;
    if (value.startsWith('"') && value.endsWith('"')) {
      try { return JSON.parse(value); }
      catch { throw new Error(`Line ${line}: invalid JSON string.`); }
    }
    if (value.startsWith("'") && value.endsWith("'")) return parseSingleQuoted(value, line);
    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim();
      return inner ? splitTopLevel(inner, line).map((part) => parseLiteral(part, line)) : [];
    }
    if (value.startsWith('(') && value.endsWith(')')) {
      const inner = value.slice(1, -1).trim();
      if (!inner) return [];
      const values = splitTopLevel(inner, line).map((part) => parseLiteral(part, line));
      return values.length === 1 && !inner.endsWith(',') ? values[0] : values;
    }
    if (value.startsWith('{') && value.endsWith('}')) {
      const inner = value.slice(1, -1).trim();
      if (!inner) return {};
      const object = {};
      splitTopLevel(inner, line).forEach((part) => {
        const pair = splitTopLevelColon(part, line);
        const key = parseLiteral(pair[0], line);
        if (typeof key !== 'string') throw new Error(`Line ${line}: dictionary keys must be strings.`);
        object[key] = parseLiteral(pair[1], line);
      });
      return object;
    }
    if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)) {
      const number = Number(value);
      if (!Number.isFinite(number)) throw new Error(`Line ${line}: number is out of range.`);
      return number;
    }
    throw new Error(`Line ${line}: ${value || 'empty argument'} is not a simple Python literal.`);
  }

  function splitTopLevelColon(source, line) {
    let quote = null;
    let escaped = false;
    const stack = [];
    for (let index = 0; index < source.length; index += 1) {
      const character = source[index];
      if (quote) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === quote) quote = null;
        continue;
      }
      if (character === '"' || character === "'") quote = character;
      else if (character === '(' || character === '[' || character === '{') stack.push(character);
      else if (character === ')' || character === ']' || character === '}') stack.pop();
      else if (character === ':' && stack.length === 0) {
        return [source.slice(0, index).trim(), source.slice(index + 1).trim()];
      }
    }
    throw new Error(`Line ${line}: dictionary entries must be key: value pairs.`);
  }

  function readNamedCall(source, line) {
    const match = source.trim().match(/^([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\s*\(([\s\S]*)\)$/);
    if (!match) throw new Error(`Line ${line}: expected a call such as console.log("message").`);
    const args = match[2].trim();
    return { name:match[1], args:args ? splitTopLevel(args, line).map((part) => parseLiteral(part, line)) : [] };
  }

  function readMetadataComment(source, line) {
    let quote = null;
    let escaped = false;
    for (let index = 0; index < source.length; index += 1) {
      const character = source[index];
      if (quote) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === quote) quote = null;
        continue;
      }
      if (character === '"' || character === "'") quote = character;
      else if (character === '#') {
        const code = source.slice(0, index);
        const comment = source.slice(index + 1).trim();
        if (!comment.startsWith('@')) return { code, metadata:{} };
        if (comment.startsWith('@{')) {
          try {
            const metadata = JSON.parse(comment.slice(1));
            if (!metadata || Array.isArray(metadata) || typeof metadata !== 'object') throw new Error();
            return { code, metadata };
          } catch {
            throw new Error(`Line ${line}: the metadata comment must contain a JSON object.`);
          }
        }
        const matches = [...comment.matchAll(/@(id|end)=("(?:\\.|[^"])*")/g)];
        const remainder = comment.replace(/@(id|end)="(?:\\.|[^"])*"/g, '').trim();
        if (matches.length && !remainder) {
          const metadata = {};
          matches.forEach((match) => { metadata[match[1] === 'id' ? 'globalid' : 'end_globalid'] = JSON.parse(match[2]); });
          return { code, metadata };
        }
        throw new Error(`Line ${line}: unrecognized metadata in comment.`);
      }
    }
    return { code:source, metadata:{} };
  }

  function formatLiteral(value) {
    if (value === MISSING) return '...';
    if (value === null) return 'None';
    if (value === true) return 'True';
    if (value === false) return 'False';
    if (typeof value === 'string') return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(formatLiteral).join(', ')}]`;
    if (value && typeof value === 'object') {
      return `{${Object.entries(value).map(([key, item]) => `${formatLiteral(key)}: ${formatLiteral(item)}`).join(', ')}}`;
    }
    return String(value);
  }

  function formatArguments(values) {
    return `(${values.map(formatLiteral).join(', ')})`;
  }

  function compileScript(source, options = {}) {
    const catalog = options.catalog;
    if (!catalog) throw new Error('The block catalog is unavailable.');
    const alias = options.folderAlias || 'CatWet Script Lab';
    const metadataByLine = options.metadataByLine;
    const content = [];
    let currentTop = null;
    let bodyIndent = null;
    let previousBlank = false;
    const stack = [];

    const closeScope = () => {
      const scope = stack.pop();
      const metadata = { ...scope.endMetadata };
      if (scope.endGlobalid) metadata.globalid = scope.endGlobalid;
      currentTop.actions.push(instantiate(scope.end, [], metadata, scope.line));
    };
    const finishScopes = (indent) => {
      while (stack.length && indent <= stack[stack.length - 1].indent) closeScope();
    };
    const startTop = (template, args, metadata, line) => {
      if (currentTop) {
        if (!previousBlank) throw new Error(`Line ${line}: leave a blank line before the next top-level block.`);
        finishScopes(0);
        content.push(currentTop);
      }
      currentTop = instantiate(template, args, metadata, line);
      bodyIndent = null;
    };
    const appendAction = (template, args, metadata, line, indent, mode, explicitScope = false) => {
      if (mode === 'block' && !explicitScope && !template.opensScope && stack.length && indent <= stack[stack.length - 1].indent) {
        const scope = stack[stack.length - 1];
        if (template.endTemplate === null && template.signature === scope.end.signature
            && template.category === scope.end.category) {
          stack.pop();
          return;
        }
      }
      finishScopes(indent);
      if (stack.length && indent <= stack[stack.length - 1].indent) {
        throw new Error(`Line ${line}: indent the statement inside its block.`);
      }
      if (!stack.length) {
        if (bodyIndent === null) bodyIndent = indent;
        else if (indent !== bodyIndent) throw new Error(`Line ${line}: unexpected indentation outside a block.`);
      }
      if (['if', 'for', 'scope'].includes(mode) && !explicitScope) {
        throw new Error(`Line ${line}: ${mode} must end with a colon.`);
      }
      if (explicitScope && (!template.opensScope || !template.endTemplate)) {
        throw new Error(`Line ${line}: ${template.callName || template.key} cannot open a block.`);
      }
      const label = labelOf(template.node).toLowerCase();
      if (mode === 'if' && !label.startsWith('if')) throw new Error(`Line ${line}: use if with a conditional block.`);
      if (['for', 'scope'].includes(mode) && label.startsWith('if')) {
        throw new Error(`Line ${line}: use if with a conditional block.`);
      }
      const actionMetadata = { ...metadata };
      const endGlobalid = actionMetadata.end_globalid;
      const endMetadata = actionMetadata.end_metadata;
      delete actionMetadata.end_globalid;
      delete actionMetadata.end_metadata;
      currentTop.actions.push(instantiate(template, args, actionMetadata, line));
      if (explicitScope) stack.push({
        indent, template, end:template.endTemplate, elseTemplate:template.elseTemplate,
        kind:mode, inElse:false, line, endGlobalid,
        endMetadata:endMetadata && typeof endMetadata === 'object' && !Array.isArray(endMetadata) ? endMetadata : {}
      });
    };

    source.split(/\r?\n/).forEach((original, index) => {
      const line = index + 1;
      const parsedLine = readMetadataComment(original, line);
      const stripped = parsedLine.code.trim();
      const savedMetadata = metadataByLine && typeof metadataByLine.get === 'function'
        ? metadataByLine.get(line) : null;
      const inlineMetadata = {
        ...(savedMetadata && typeof savedMetadata === 'object' && !Array.isArray(savedMetadata) ? savedMetadata : {}),
        ...parsedLine.metadata
      };
      if (!stripped) {
        if (!original.trim().startsWith('#')) previousBlank = true;
        return;
      }
      const indent = (original.match(/^[ \t]*/) || [''])[0].replace(/\t/g, '    ').length;

      const loadHeader = stripped.match(/^on\s+load\s*:\s*(?:@(\{.*\}))?$/i);
      if (!indent && loadHeader) {
        const metadata = { ...inlineMetadata };
        if (loadHeader[1]) {
          try { Object.assign(metadata, JSON.parse(loadHeader[1])); }
          catch { throw new Error(`Line ${line}: on load metadata must be a JSON object.`); }
        }
        const resolved = catalog.resolveNamed('top', 'load', [], line);
        startTop(resolved.item, resolved.args, metadata, line);
        previousBlank = false; return;
      }
      const eventHeader = stripped.match(/^on\s+([A-Za-z_]\w*)\s*(?:\(([\s\S]*)\))?\s*:/);
      if (!indent && eventHeader) {
        const [, eventName, argsSource] = eventHeader;
        const call = readNamedCall(`${eventName}(${argsSource || ''})`, line);
        const resolved = catalog.resolveNamed('top', call.name, call.args, line);
        const template = resolved.item;
        if (template.category !== 'events') throw new Error(`Line ${line}: ${eventName} is not a Catweb event.`);
        startTop(template, resolved.args, inlineMetadata, line);
        previousBlank = false; return;
      }
      const functionHeader = stripped.match(/^def\s+([A-Za-z_]\w*)\s*(?:\(\s*\))?\s*:/);
      if (!indent && functionHeader) {
        startTop(catalog.get('top', 'functions/6', line), [functionHeader[1]], inlineMetadata, line);
        previousBlank = false; return;
      }
      if (!indent && stripped.startsWith('top ')) {
        const call = readCall(stripped.slice(4), line);
        Object.assign(call.metadata, inlineMetadata);
        startTop(catalog.get('top', call.key, line), call.args, call.metadata, line);
        previousBlank = false; return;
      }
      if (!indent && stripped.startsWith('topraw ')) {
        if (currentTop) {
          if (!previousBlank) throw new Error(`Line ${line}: leave a blank line before the next top-level block.`);
          finishScopes(0); content.push(currentTop);
        }
        try { currentTop = JSON.parse(stripped.slice(7)); }
        catch { throw new Error(`Line ${line}: topraw must contain a JSON object.`); }
        if (!currentTop || Array.isArray(currentTop) || typeof currentTop !== 'object') throw new Error(`Line ${line}: topraw must contain a JSON object.`);
        Object.assign(currentTop, inlineMetadata);
        currentTop.x = '0';
        currentTop.y = '0';
        if (currentTop.actions === undefined) currentTop.actions = [];
        else if (!Array.isArray(currentTop.actions)) throw new Error(`Line ${line}: topraw actions must be an array.`);
        bodyIndent = null;
        previousBlank = false; return;
      }
      if (!currentTop) throw new Error(`Line ${line}: start with on load: or a named event.`);

      if (stripped === 'else:') {
        while (stack.length && indent < stack[stack.length - 1].indent) closeScope();
        const scope = stack[stack.length - 1];
        if (!scope || !scope.elseTemplate || scope.kind !== 'if' || indent !== scope.indent) {
          throw new Error(`Line ${line}: else must align with an if block that supports it.`);
        }
        if (scope.inElse) throw new Error(`Line ${line}: an if block can only have one else section.`);
        currentTop.actions.push(instantiate(scope.elseTemplate, [], inlineMetadata, line));
        scope.inElse = true; previousBlank = false; return;
      }
      if (stripped.startsWith('raw ')) {
        finishScopes(indent);
        let node;
        try { node = JSON.parse(stripped.slice(4)); }
        catch { throw new Error(`Line ${line}: raw must contain a JSON object.`); }
        if (!node || Array.isArray(node) || typeof node !== 'object') throw new Error(`Line ${line}: raw must contain a JSON object.`);
        Object.assign(node, inlineMetadata);
        currentTop.actions.push(node); previousBlank = false; return;
      }
      const namedScope = stripped.match(/^(if|for)\s+([\s\S]+\))\s*:/);
      if (namedScope) {
        const [, mode, callSource] = namedScope;
        const call = readNamedCall(callSource, line);
        const resolved = catalog.resolveNamed('block', call.name, call.args, line);
        appendAction(resolved.item, resolved.args, inlineMetadata, line, indent, mode, true);
        previousBlank = false; return;
      }
      const generic = stripped.match(/^(block|if|scope)\s+([\s\S]+)$/);
      if (generic) {
        const [, mode] = generic;
        let rest = generic[2];
        const opens = rest.endsWith(':');
        if (opens) rest = rest.slice(0, -1).trimEnd();
        const call = readCall(rest, line);
        Object.assign(call.metadata, inlineMetadata);
        appendAction(catalog.get('block', call.key, line), call.args, call.metadata, line, indent, mode, opens);
        previousBlank = false; return;
      }
      const message = stripped.match(/^(log|warn|error)\s+(.+)$/i);
      if (message) {
        let value;
        try { value = JSON.parse(message[2]); } catch { throw new Error(`Line ${line}: the message must be a quoted JSON string.`); }
        if (typeof value !== 'string') throw new Error(`Line ${line}: ${message[1]} requires a string.`);
        const resolved = catalog.resolveNamed('block', `console.${message[1].toLowerCase()}`, [value], line);
        appendAction(resolved.item, resolved.args, inlineMetadata, line, indent, 'call');
        previousBlank = false; return;
      }
      const legacySet = stripped.match(/^set\s+([A-Za-z_]\w*)\s*=\s*(.+)$/);
      if (legacySet) {
        let value;
        try { value = parseLiteral(legacySet[2], line); }
        catch { throw new Error(`Line ${line}: set requires a string or Python literal.`); }
        appendAction(catalog.get('block', 'math-variables/11', line), [legacySet[1], value], inlineMetadata, line, indent, 'call');
        previousBlank = false; return;
      }
      const assignment = stripped.match(/^([A-Za-z_]\w*)\s*(\+=|-=|\*=|\/=|=(?!=))\s*(.+)$/);
      if (assignment) {
        let value;
        try { value = parseLiteral(assignment[3], line); }
        catch (error) {
          throw new Error(`Line ${line}: the assigned value must be a simple Python literal. ${error.message}`);
        }
        const blockId = { '=':'11', '+=':'12', '-=':'13', '*=':'14', '/=':'15' }[assignment[2]];
        appendAction(catalog.get('block', `math-variables/${blockId}`, line), [assignment[1], value], inlineMetadata, line, indent, 'call');
        previousBlank = false; return;
      }
      const call = readNamedCall(stripped, line);
      const resolved = catalog.resolveNamed('block', call.name, call.args, line);
      appendAction(resolved.item, resolved.args, inlineMetadata, line, indent, 'call');
      previousBlank = false;
    });
    while (stack.length) closeScope();
    if (currentTop) content.push(currentTop);
    if (!content.length) throw new Error('No event or top-level block was found.');
    return [{ class: 'Folder', globalid: randomId(), alias, children: [{ class: 'script', globalid: randomId(), content }] }];
  }

  function randomId() {
    if (root.crypto && typeof root.crypto.randomUUID === 'function') return root.crypto.randomUUID().replace(/-/g, '').slice(0, 10);
    const bytes = new Uint8Array(8);
    root.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  function decompileScript(content, catalog) {
    if (!Array.isArray(content)) throw new Error('Script content must be an array.');
    const sections = content.map((node) => {
      const template = catalog.matchExisting('top', node);
      const args = template ? catalog.canonicalArguments(template, argsFor(node)) : [];
      let header;
      if (template && template.category === 'events') {
        header = template.id === '0' && !args.length ? 'on load:' : `on ${template.callName}${formatArguments(args)}:`;
        header += metadataFor(node, template);
      }
      else if (template && template.category === 'functions' && template.id === '6'
          && typeof args[0] === 'string' && /^[A-Za-z_]\w*$/.test(args[0])) {
        header = `def ${args[0]}():${metadataFor(node, template)}`;
      }
      else if (template) header = `top ${template.key.replace('top/', '')} ${formatArguments(args)}${metadataFor(node, template)}`;
      else {
        const { actions, ...rawTop } = node;
        delete rawTop.x;
        delete rawTop.y;
        header = `topraw ${JSON.stringify(rawTop)}`;
      }
      const nested = decompileActions(Array.isArray(node.actions) ? node.actions : [], catalog);
      return [header, ...nested].join('\n');
    });
    return sections.join('\n\n');
  }

  function argsFor(node) {
    return fieldValues(node).map((field) => Object.prototype.hasOwnProperty.call(field, 'value') ? field.value : MISSING);
  }

  function metadataFor(node, template) {
    const metadata = {};
    Object.entries(node).forEach(([key, value]) => {
      if (['id', 'text', 'actions'].includes(key)
          || (template && template.scope === 'top' && ['x', 'y'].includes(key))) return;
      if (key === 'globalid' || !Object.prototype.hasOwnProperty.call(template.node, key) || JSON.stringify(template.node[key]) !== JSON.stringify(value)) {
        metadata[key] = value;
      }
    });
    return Object.keys(metadata).length ? ` # @${JSON.stringify(metadata)}` : '';
  }

  function decompileActions(actions, catalog) {
    const lines = [];
    const scopes = [];
    let indent = 0;
    for (const action of actions) {
      const template = catalog.matchExisting('block', action);
      const label = template ? labelOf(action).toLowerCase() : '';
      if (template && label === 'end' && scopes.length) {
        indent = Math.max(0, indent - 1);
        const scope = scopes.pop();
        const endMetadata = metadataFor(action, template).trim();
        if (endMetadata) {
          const parsed = readMetadataComment(endMetadata, 1).metadata;
          const prior = readMetadataComment(lines[scope.lineIndex], 1);
          const { globalid, ...otherMetadata } = parsed;
          const combined = {
            ...prior.metadata,
            ...(globalid ? { end_globalid:globalid } : {}),
            ...(Object.keys(otherMetadata).length ? { end_metadata:otherMetadata } : {})
          };
          lines[scope.lineIndex] = `${prior.code.trimEnd()} # @${JSON.stringify(combined)}`;
        }
        continue;
      }
      if (template && label === 'else') {
        indent = Math.max(0, indent - 1);
        lines.push(`${'    '.repeat(indent)}else:${metadataFor(action, template)}`);
        indent += 1;
        continue;
      }
      if (!template) {
        lines.push(`${'    '.repeat(indent)}raw ${JSON.stringify(action)}`);
        continue;
      }
      const args = catalog.canonicalArguments(template, argsFor(action));
      const metadata = metadataFor(action, template);
      const isScope = template.opensScope && template.endTemplate;
      const call = `${template.callName}${formatArguments(args)}`;
      const assignmentOperators = { '11':'=', '12':'+=', '13':'-=', '14':'*=', '15':'/=' };
      const operator = template.category === 'math-variables' ? assignmentOperators[template.id] : null;
      const statement = operator && args.length === 2 && typeof args[0] === 'string' && /^[A-Za-z_]\w*$/.test(args[0])
        ? `${args[0]} ${operator} ${formatLiteral(args[1])}`
        : isScope ? `${label.startsWith('if') ? 'if' : 'for'} ${call}:` : call;
      const lineIndex = lines.length;
      lines.push(`${'    '.repeat(indent)}${statement}${metadata}`);
      if (isScope) {
        scopes.push({ lineIndex, template });
        indent += 1;
      }
    }
    return lines;
  }

  function formatLiteral(value) {
    if (value === MISSING) return '...';
    if (value === null) return 'None';
    if (value === true) return 'True';
    if (value === false) return 'False';
    if (typeof value === 'string') return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(formatLiteral).join(', ')}]`;
    if (value && typeof value === 'object') {
      return `{${Object.entries(value).map(([key, item]) => `${formatLiteral(key)}: ${formatLiteral(item)}`).join(', ')}}`;
    }
    return String(value);
  }

  function formatArguments(values) {
    return `(${values.map(formatLiteral).join(', ')})`;
  }

  root.CatwebCSL = { loadCatalog, createCatalog, compileScript, decompileScript };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.CatwebCSL;
})(globalThis);
