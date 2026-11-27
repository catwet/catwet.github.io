(() => {
  const $ = (selector) => document.querySelector(selector);
  // .cat remains a future import/export format. It is intentionally disabled,
  // while the JSON project format stays compatible and is exported explicitly.
  const CAT_FORMAT_PROTOTYPE = Object.freeze({
    enabled: false,
    importEnabled: false,
    exportEnabled: false,
    futureSections: Object.freeze(['Script', 'Visor 2D']),
  });
  const source = $('#source');
  const lineNumbers = $('#lineNumbers');
  const highlight = $('#highlight');
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const uid = () => crypto.getRandomValues(new Uint32Array(2)).join('').slice(0, 12);
  const sample = `# Welcome script\non load:\nconsole.log("Welcome to my site")\nvisits = 1`;
  let documentData = [{ class: 'Folder', globalid: uid(), alias: 'CatWet Script Lab', children: [] }];
  const firstScript = { class: 'script', globalid: uid(), content: [] };
  documentData[0].children.push(firstScript);
  let selectedNodeId = firstScript.globalid;
  let activeScriptId = firstScript.globalid;
  let sourceDirty = true;
  let lastJson = '';
  let projectLabelFallback = 'MY PROJECT';
  let toastTimer;
  const drafts = new Map([[firstScript.globalid, sample]]);
  const metadataDrafts = new Map();
  const dirtyUserScripts = new Set();
  const collapsed = new Set();
  let projectTreeFilter = 'all';
  let aiApiKey = '';
  let aiRequestController = null;
  let aiCompiledPreview = null;
  const appScriptUrl = document.currentScript && document.currentScript.src;
  const catalogBase = appScriptUrl
    ? new URL('../script/', appScriptUrl).toString()
    : new URL('./script/', document.baseURI).toString();
  const catalogPromise = CatwebCSL.loadCatalog(catalogBase);
  source.value = sample;
  let activeMetadata = new Map();
  let previousSourceValue = source.value;

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[character]));
  function splitInlineComment(line) {
    let quote = null;
    let escaped = false;
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      if (quote) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === quote) quote = null;
      } else if (character === '"' || character === "'") quote = character;
      else if (character === '#') {
        const comment = line.slice(index + 1).trim();
        return {
          code: line.slice(0, index),
          comment,
          metadata: comment.startsWith('@') ? comment.slice(1).trim() : ''
        };
      }
    }
    return { code: line, comment: '', metadata: '' };
  }
  function parseMetadata(metadataText) {
    try {
      const metadata = JSON.parse(metadataText);
      if (!metadata || Array.isArray(metadata) || typeof metadata !== 'object') return null;
      return metadata;
    } catch {
      return null;
    }
  }
  function metadataDescription(metadata) {
    return `Preserved block metadata · ${Object.entries(metadata).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(' · ')}`;
  }
  function extractMetadata(text) {
    const metadata = new Map();
    const lines = text.split('\n').map((line, index) => {
      const parsed = splitInlineComment(line);
      if (!parsed.metadata) return line;
      const values = parseMetadata(parsed.metadata);
      if (!values) return line;
      metadata.set(index + 1, values);
      return parsed.code.replace(/[ \t]+$/, '');
    });
    return { source: lines.join('\n'), metadata };
  }
  function remapMetadata(previousText, nextText, metadata) {
    if (previousText === nextText) return metadata;
    const previousLines = previousText.split('\n');
    const nextLines = nextText.split('\n');
    const result = new Map();
    const copyMetadata = (previousIndex, nextIndex) => {
      const values = metadata.get(previousIndex + 1);
      if (values && splitInlineComment(nextLines[nextIndex]).code.trim()) result.set(nextIndex + 1, values);
    };
    let prefix = 0;
    while (prefix < previousLines.length && prefix < nextLines.length
      && previousLines[prefix] === nextLines[prefix]) {
      copyMetadata(prefix, prefix);
      prefix += 1;
    }
    let previousEnd = previousLines.length - 1;
    let nextEnd = nextLines.length - 1;
    while (previousEnd >= prefix && nextEnd >= prefix
      && previousLines[previousEnd] === nextLines[nextEnd]) {
      copyMetadata(previousEnd, nextEnd);
      previousEnd -= 1;
      nextEnd -= 1;
    }
    const previousMiddle = previousEnd - prefix + 1;
    const nextMiddle = nextEnd - prefix + 1;
    if (previousMiddle === nextMiddle) {
      for (let offset = 0; offset < previousMiddle; offset += 1) copyMetadata(prefix + offset, prefix + offset);
    } else if (previousMiddle === 1 && nextMiddle > 1) {
      copyMetadata(prefix, prefix);
    }
    return result;
  }
  function sourceWithMetadata(text, metadata) {
    const result = [];
    text.split('\n').forEach((line, index) => {
      const values = metadata.get(index + 1);
      if (!values) { result.push(line); return; }
      const parsed = splitInlineComment(line);
      if (!parsed.code.trim() || parsed.metadata) { result.push(line); return; }
      result.push(`${parsed.code.replace(/[ \t]+$/, '')} # @${JSON.stringify(values)}`);
      if (parsed.comment) result.push(`# ${parsed.comment}`);
    });
    return result.join('\n');
  }
  const iconFor = (type) => ({
    Folder: '▰', Frame: '▧', TextLabel: 'T', TextButton: '▰',
    'TextButton?link': '↗', 'TextButton?transfer': '↗', 'TextButton?avataritem': '↗',
    ImageLabel: '▣', ImageButton: '▣', TextBox: '▤', ScrollingFrame: '▤', script: '⌘'
  }[type] || '◇');
  const labelFor = (key) => key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
  const treeTypeLabel = (type) => ({
    Folder: 'SITE',
    script: 'SCRIPT',
    Frame: 'FRAME',
    TextLabel: 'TEXT',
    TextButton: 'BUTTON',
    'TextButton?link': 'LINK',
    'TextButton?transfer': 'DONATE',
    'TextButton?avataritem': 'ITEM',
    ImageLabel: 'IMAGE',
    ImageButton: 'IMAGE BTN',
    TextBox: 'INPUT',
    ScrollingFrame: 'SCROLL'
  }[type] || 'OBJECT');

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function nodeById(id, node = documentData[0]) {
    if (node.globalid === id) return node;
    for (const child of node.children || []) {
      const found = nodeById(id, child);
      if (found) return found;
    }
    return null;
  }

  function parentOf(id, node = documentData[0]) {
    for (const child of node.children || []) {
      if (child.globalid === id) return node;
      const found = parentOf(id, child);
      if (found) return found;
    }
    return null;
  }

  function scriptsInProject(node = documentData[0]) {
    const found = node.class === 'script' ? [node] : [];
    for (const child of node.children || []) found.push(...scriptsInProject(child));
    return found;
  }

  function validateProject(project) {
    if (!Array.isArray(project) || project.length !== 1 || !project[0] || project[0].class !== 'Folder') {
      throw new Error('The project must contain a root Folder.');
    }
    if (!Array.isArray(project[0].children)) throw new Error('The root folder must have children as an array.');
    const ids = new Set();
    const visitBlock = (block, path) => {
      if (!block || Array.isArray(block) || typeof block !== 'object') throw new Error(`${path} must be a JSON block.`);
      if (block.actions !== undefined && !Array.isArray(block.actions)) throw new Error(`${path}.actions must be an array.`);
      (block.actions || []).forEach((action, index) => visitBlock(action, `${path}.actions[${index}]`));
    };
    const visitNode = (node, path) => {
      if (!node || Array.isArray(node) || typeof node !== 'object' || typeof node.class !== 'string' || !node.class) {
        throw new Error(`${path} must be an object with a class.`);
      }
      if (typeof node.globalid !== 'string' || !node.globalid) throw new Error(`${path} must have a string globalid.`);
      if (ids.has(node.globalid)) throw new Error(`The globalid ${node.globalid} is duplicated.`);
      ids.add(node.globalid);
      if (node.children !== undefined && !Array.isArray(node.children)) throw new Error(`${path}.children must be an array.`);
      if (node.class === 'script') {
        if (!Array.isArray(node.content)) throw new Error(`${path}.content must be an array.`);
        node.content.forEach((block, index) => visitBlock(block, `${path}.content[${index}]`));
      }
      (node.children || []).forEach((child, index) => visitNode(child, `${path}.children[${index}]`));
    };
    visitNode(project[0], 'root');
  }

  function normalizeImport(parsed) {
    const entries = Array.isArray(parsed) ? parsed : [parsed];
    if (entries.length === 1 && entries[0] && entries[0].class === 'Folder') {
      validateProject(entries);
      return entries;
    }
    if (!entries.length || entries.some((entry) => !entry || entry.class === 'Folder')) {
      throw new Error('Import a complete Catweb folder or a script object/array.');
    }
    const project = [{ class: 'Folder', globalid: uid(), alias: 'CatWet Script Lab', children: entries }];
    validateProject(project);
    return project;
  }

  function inspectSource(text = source.value) {
    if (!text.trim()) return [];
    const errors = [];
    let topCount = 0;
    let previousLineBlank = false;
    for (const [index, original] of text.split('\n').entries()) {
      const line = index + 1;
      const trimmed = splitInlineComment(original).code.trim();
      if (!trimmed) { previousLineBlank = true; continue; }
      if (trimmed.startsWith('#')) continue;
      const indent = original.match(/^[ \t]*/)[0].replace(/\t/g, '    ').length;
      const isTop = !indent && (/^on\s+[A-Za-z_]\w*\s*(?:\(.*\))?\s*:/.test(trimmed)
        || /^def\s+[A-Za-z_]\w*\s*(?:\(\s*\))?\s*:/.test(trimmed)
        || /^top\s+\S+/.test(trimmed) || /^topraw\s+\{/.test(trimmed));
      if (isTop) {
        if (topCount && !previousLineBlank) errors.push({ line, message: 'Leave a blank line before the next top-level block.' });
        topCount += 1;
        previousLineBlank = false;
        continue;
      }
      if (!topCount) errors.push({ line, message: "Start with an event, for example 'on load:'." });
      else if (/^(?:local|obj)\s+[A-Za-z_]\w*\s*=/.test(trimmed)) {
        errors.push({ line, message: 'Catweb has no local/object variable declaration block; use its scoped variable references in supported fields.' });
      }
      else if (!/^(?:(?:if|for)\s+.+\)\s*:|else:|(?:raw|block|scope|topraw|top)\s+|(?:log|warn|error)\s+|(?:local|global|obj)\s+[A-Za-z_]\w*\s*=.+|[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*\s*\(|[A-Za-z_]\w*\s*(?:\+=|-=|\*=|\/=|=(?!=)))/i.test(trimmed)) {
        errors.push({ line, message: 'Unrecognized statement. Use named calls, assignments, or a raw JSON block.' });
      }
      previousLineBlank = false;
    }
    if (!topCount && errors.length === 0) errors.push({ line: 1, message: "An event is required, for example 'on load:'." });
    return errors;
  }

  function highlightSource() {
    const tokenPattern = /(#.*$|"(?:[^"\\]|\\.)*"|\b(?:on|load|def|topraw|top|raw|block|scope|if|for|else|local|global|obj|None|True|False)\b|\b[A-Za-z_][A-Za-z0-9_]*\b|[:=@])/gm;
    let output = '';
    let lastIndex = 0;
    let match;
    while ((match = tokenPattern.exec(source.value)) !== null) {
      output += escapeHtml(source.value.slice(lastIndex, match.index));
      const token = match[0];
      const kind = token.startsWith('#') ? 'comment'
        : token.startsWith('"') ? 'string'
          : /^(on|load|def|topraw|top|raw|block|scope|if|for|else|local|global|obj|None|True|False|:|=|@)$/.test(token) ? 'keyword' : 'variable';
      output += `<span class="tok-${kind}">${escapeHtml(token)}</span>`;
      lastIndex = tokenPattern.lastIndex;
    }
    output += escapeHtml(source.value.slice(lastIndex));
    highlight.innerHTML = output + (source.value.endsWith('\n') ? ' ' : '\n');
    lineNumbers.innerHTML = source.value.split('\n').map((line, index) => {
      const inlineMetadata = splitInlineComment(line).metadata;
      const metadata = activeMetadata.get(index + 1) || (inlineMetadata ? parseMetadata(inlineMetadata) : null);
      const marker = metadata
        ? `<button class="metadata-indicator" type="button" title="${escapeHtml(metadataDescription(metadata))}" aria-label="${escapeHtml(metadataDescription(metadata))}" data-metadata="${escapeHtml(metadataDescription(metadata))}">i</button>`
        : '<span class="metadata-spacer"></span>';
      return `<span class="gutter-row"><span class="line-number">${index + 1}</span>${marker}</span>`;
    }).join('');
    syncScroll();
  }

  function syncScroll() {
    highlight.scrollTop = source.scrollTop;
    highlight.scrollLeft = source.scrollLeft;
    lineNumbers.scrollTop = source.scrollTop;
    const beforeCaret = source.value.slice(0, source.selectionStart).split('\n');
    $('#lineStatus').textContent = `Line ${beforeCaret.length}, column ${beforeCaret[beforeCaret.length - 1].length + 1}`;
  }

  function renderStructure() {
    const headers = source.value.split('\n')
      .map((line, index) => ({ text: splitInlineComment(line).code, line: index + 1 }))
      .filter(({ text }) => /^(?:on\s+[A-Za-z_]\w*\s*(?:\(.*\))?\s*:|def\s+[A-Za-z_]\w*\s*(?:\(\s*\))?\s*:|top\s+\S+|topraw\s+\{)/i.test(text));
    $('#eventTree').innerHTML = headers.map(({ text, line }, index) => {
      const label = /^on\s+/i.test(text) ? text.slice(0, text.lastIndexOf(':')).trim()
        : /^def\s+/i.test(text) ? text.slice(0, text.lastIndexOf(':')).trim()
          : text.replace(/^top\s+/, '').replace(/^topraw\s+/, 'raw ').split(/\s/)[0];
      return `<button class="event-node" type="button" data-line="${line}"><span class="event-icon">⚡</span><span>${escapeHtml(label)}</span><span class="action-count">${index + 1}</span></button>`;
    }).join('');
  }

  function renderDiagnostics(errors) {
    const container = $('#diagnostics');
    container.innerHTML = errors.map((error) =>
      `<div class="diagnostic"><span class="mark">●</span><span>Line ${error.line}: ${escapeHtml(error.message)}</span><button data-line="${error.line}">Go</button></div>`
    ).join('');
    container.classList.toggle('has-items', errors.length > 0);
    container.querySelectorAll('[data-line]').forEach((button) => button.addEventListener('click', () => {
      const line = Number(button.dataset.line);
      const offset = source.value.split('\n').slice(0, line - 1).join('\n').length + (line > 1 ? 1 : 0);
      source.focus();
      source.setSelectionRange(offset, offset);
    }));
    $('.statusbar').classList.toggle('has-error', errors.length > 0);
    $('#sourceStatus').innerHTML = errors.length
      ? `<i></i> ${errors.length} ${errors.length === 1 ? 'warning' : 'warnings'} to fix`
      : '<i></i> Syntax recognized';
    return errors;
  }

  function renderProjectTree() {
    const tree = $('#projectTree');
    const rootId = documentData[0].globalid;
    const query = $('#projectSearch').value.trim().toLowerCase();
    const allNodes = [];
    const collect = (node) => {
      allNodes.push(node);
      (node.children || []).forEach(collect);
    };
    collect(documentData[0]);
    const scripts = allNodes.filter((node) => node.class === 'script');
    const uiObjects = allNodes.filter((node) => node.globalid !== rootId
      && node.class !== 'script' && node.class !== 'Folder');
    const itemCount = allNodes.length - 1;
    $('#projectItemCount').textContent = String(itemCount);
    $('#projectUiCount').textContent = String(uiObjects.length);
    $('#projectScriptCount').textContent = String(scripts.length);
    $('#treeAllCount').textContent = String(itemCount);
    $('#treeUiCount').textContent = String(uiObjects.length);
    $('#treeScriptCount').textContent = String(scripts.length);

    const scriptNumbers = new Map(scripts.map((node, index) => [node.globalid, index + 1]));
    const labelOf = (node) => node.text || node.alias
      || (node.class === 'script' ? `Script ${scriptNumbers.get(node.globalid)}` : node.class);
    const matchesOwnFilter = (node) => node.globalid === rootId
      || projectTreeFilter === 'all'
      || (projectTreeFilter === 'scripts' && node.class === 'script')
      || (projectTreeFilter === 'ui' && node.class !== 'script' && node.class !== 'Folder');
    const matchesQuery = (node) => !query
      || `${labelOf(node)} ${node.class} ${node.globalid}`.toLowerCase().includes(query);
    const visible = (node) => matchesOwnFilter(node) && matchesQuery(node)
      || (node.children || []).some(visible);
    const addRows = (node, depth = 0) => {
      const children = node.children || [];
      const visibleChildren = children.filter(visible);
      const hasChildren = visibleChildren.length > 0;
      const isCollapsed = collapsed.has(node.globalid);
      const row = document.createElement('div');
      row.className = `project-tree-row${node.globalid === selectedNodeId ? ' selected' : ''}`;
      row.setAttribute('role', 'treeitem');
      row.setAttribute('aria-level', String(depth + 1));
      row.setAttribute('aria-selected', node.globalid === selectedNodeId ? 'true' : 'false');
      row.style.paddingLeft = `${8 + depth * 14}px`;
      row.innerHTML = `${hasChildren
        ? `<button class="tree-toggle" type="button" data-toggle-id="${escapeHtml(node.globalid)}" aria-label="${isCollapsed ? 'Expand' : 'Collapse'}" aria-expanded="${!isCollapsed}">${isCollapsed ? '▸' : '▾'}</button>`
        : '<span class="tree-spacer"></span>'}<span class="tree-object-icon">${iconFor(node.class)}</span><span class="tree-object-name">${escapeHtml(labelOf(node))}</span><span class="tree-object-type">${escapeHtml(treeTypeLabel(node.class))}</span>`;
      row.dataset.nodeId = node.globalid;
      tree.append(row);
      if (!isCollapsed || query) visibleChildren.forEach((child) => addRows(child, depth + 1));
    };
    tree.replaceChildren();
    addRows(documentData[0]);
    const visibleItemCount = allNodes.slice(1).filter((node) => matchesOwnFilter(node) && matchesQuery(node)).length;
    if (itemCount && !visibleItemCount) {
      const empty = document.createElement('p');
      empty.className = 'tree-empty';
      empty.textContent = query ? 'No matching project items.' : 'No items in this view.';
      tree.append(empty);
    }
    const selected = nodeById(selectedNodeId);
    const target = selected && ['Folder', 'Frame', 'ScrollingFrame'].includes(selected.class)
      ? selected
      : selected && parentOf(selectedNodeId) || documentData[0];
    $('#addTargetLabel').textContent = target.alias || target.text || (target.globalid === rootId ? 'Website root' : target.class);
  }

  function renderObjectProperties(node) {
    const fields = Object.entries(node).filter(([key]) => key !== 'children' && key !== 'content'
      && !(node.class === 'Folder' && key === 'alias'));
    const controls = fields.map(([key, value], index) => {
      const type = value === null ? 'null' : Array.isArray(value) || typeof value === 'object' ? 'json' : typeof value;
      const readOnly = key === 'class' || key === 'globalid';
      const control = type === 'boolean'
        ? `<select id="object-property-${index}" class="property-input" data-property="${escapeHtml(key)}" data-type="boolean"><option value="true"${value ? ' selected' : ''}>Yes</option><option value="false"${value ? '' : ' selected'}>No</option></select>`
        : type === 'json' || type === 'null'
          ? `<textarea id="object-property-${index}" class="property-input property-json" data-property="${escapeHtml(key)}" data-type="json" rows="2">${escapeHtml(JSON.stringify(value))}</textarea>`
          : `<input id="object-property-${index}" class="property-input" data-property="${escapeHtml(key)}" data-type="${type}" value="${escapeHtml(value)}"${readOnly ? ' readonly aria-readonly="true"' : ''}>`;
      return `<div class="property-field"><label for="object-property-${index}">${escapeHtml(labelFor(key))}<small>${escapeHtml(key)}</small></label>${control}</div>`;
    }).join('');
    const deleteButton = node.class === 'Folder' ? '' : '<button id="deleteProjectObject" class="tool-button delete-project-object" type="button">Remove from project</button>';
    return `<div class="inspector-heading">CATWEB PROPERTIES <span>${escapeHtml(node.class)}</span></div><div class="property-grid">${controls}</div><details class="advanced-properties"><summary>Advanced JSON</summary><textarea id="objectPropertiesRaw" class="json-input" spellcheck="false"></textarea></details><button id="applyObjectProperties" class="tool-button apply-properties" type="button">Apply properties</button>${deleteButton}`;
  }

  function renderInspector() {
    const selected = nodeById(selectedNodeId);
    const inspector = $('#objectInspector');
    if (!selected) return;
    if (selected.class === 'script') {
      const actions = (selected.content || []).reduce((count, block) => count + (block.actions || []).length, 0);
      inspector.innerHTML = `<div class="inspector-heading">SCRIPT DETAILS <span>Catweb</span></div><p class="inspector-placeholder">${selected.content.length} top-level blocks · ${actions} actions. Edit in the script workspace. Existing block IDs and layout positions are preserved as metadata.</p><button id="deleteProjectObject" class="tool-button delete-project-object" type="button">Remove script</button>`;
      return;
    }
    inspector.innerHTML = renderObjectProperties(selected);
    $('#objectPropertiesRaw').value = JSON.stringify(selected, null, 2);
  }

  function renderProject() {
    renderProjectTree();
    renderInspector();
    $('#folderAlias').value = documentData[0].alias || '';
    $('#projectName').textContent = documentData[0].alias || projectLabelFallback;
    $('#breadcrumbProject').textContent = documentData[0].alias || projectLabelFallback;
  }

  function formatLiteral(value) {
    if (value === undefined) return '...';
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

  function callForTemplate(item, catalog) {
    const fields = item.node.text.filter((part) => part && typeof part === 'object' && !Array.isArray(part));
    const sourceArgs = fields.map((field) => Object.prototype.hasOwnProperty.call(field, 'value') ? field.value : undefined);
    const args = catalog.canonicalArguments(item, sourceArgs);
    const callArgs = `(${args.map(formatLiteral).join(', ')})`;
    if (item.scope === 'top' && item.category === 'events') {
      return item.callName === 'load' && args.length === 0 ? 'on load:' : `on ${item.callName}${callArgs}:`;
    }
    if (item.scope === 'top' && item.category === 'functions' && item.id === '6') {
      return `def ${formatLiteral(args[0])}():`;
    }
    if (item.scope === 'block' && item.category === 'math-variables') {
      const operator = { '11':'=', '12':'+=', '13':'-=', '14':'*=', '15':'/=' }[item.id];
      if (operator && args.length === 2 && /^[A-Za-z_]\w*$/.test(String(args[0]))) {
        return `${args[0]} ${operator} ${formatLiteral(args[1])}`;
      }
    }
    if (item.scope === 'block' && item.opensScope) {
      const kind = item.node.text.filter((part) => typeof part === 'string').join('').trim().toLowerCase().startsWith('if') ? 'if' : 'for';
      return `${kind} ${item.callName}${callArgs}:`;
    }
    return `${item.callName}${callArgs}`;
  }

  function renderCatalog(catalog, query = '') {
    const filter = query.trim().toLowerCase();
    const templates = [...catalog.byKey.values()].filter((item) => {
      if (!item.callName) return false;
      const label = (item.node.text || []).filter((part) => typeof part === 'string').join(' ');
      return `${item.category} ${item.key} ${label}`.toLowerCase().includes(filter);
    });
    $('#catalogEntries').innerHTML = templates.map((item) => {
      const label = (item.node.text || []).filter((part) => typeof part === 'string').join('').trim() || '(unnamed block)';
      const call = callForTemplate(item, catalog);
      return `<button class="catalog-entry" type="button" data-call="${escapeHtml(call)}" data-scope="${item.scope}"><span>${escapeHtml(label)}</span><small>${escapeHtml(item.callName)} · ${item.scope === 'top' ? 'event/top-level block' : 'action'}</small></button>`;
    }).join('') || '<p class="catalog-empty">No blocks found.</p>';
  }

  function refreshProjectJson(status = 'Project ready · compact') {
    lastJson = JSON.stringify(documentData);
    const statusElement = $('#outputStatus');
    if (statusElement) statusElement.textContent = sourceDirty ? 'Uncompiled code · saved JSON available' : status;
    const exportButton = $('#exportProject');
    if (exportButton) exportButton.disabled = false;
  }

  function markSourceDirty() {
    if (activeScriptId) {
      drafts.set(activeScriptId, source.value);
      dirtyUserScripts.add(activeScriptId);
    }
    sourceDirty = true;
    const status = $('#outputStatus');
    if (status) status.textContent = 'Uncompiled code · export to compile';
  }

  function updateEditor(markDirty = false) {
    if (source.value !== previousSourceValue) {
      activeMetadata = remapMetadata(previousSourceValue, source.value, activeMetadata);
      previousSourceValue = source.value;
    }
    highlightSource();
    renderStructure();
    renderDiagnostics(inspectSource());
    if (markDirty && activeScriptId) markSourceDirty();
  }

  function loadScriptIntoEditor(scriptNode) {
    activeScriptId = scriptNode.globalid;
    source.disabled = true;
    source.value = 'Loading the block catalog…';
    activeMetadata = new Map();
    previousSourceValue = source.value;
    $('#scriptTitle').textContent = scriptNode.alias || scriptNode.name || 'script';
    $('#breadcrumbScript').textContent = $('#scriptTitle').textContent;
    $('#windowTitle').textContent = `Script Lab — ${$('#scriptTitle').textContent}`;
    catalogPromise.then((catalog) => {
      if (activeScriptId !== scriptNode.globalid) return;
      if (drafts.has(scriptNode.globalid)) {
        source.value = drafts.get(scriptNode.globalid);
        activeMetadata = new Map(metadataDrafts.get(scriptNode.globalid) || []);
      } else {
        const extracted = extractMetadata(CatwebCSL.decompileScript(scriptNode.content, catalog));
        source.value = extracted.source;
        activeMetadata = extracted.metadata;
      }
      previousSourceValue = source.value;
      sourceDirty = drafts.has(scriptNode.globalid);
      source.disabled = false;
      updateEditor(false);
      refreshProjectJson();
    }).catch((error) => {
      if (activeScriptId !== scriptNode.globalid) return;
      source.value = `Could not load script: ${error.message}`;
      activeMetadata = new Map();
      previousSourceValue = source.value;
      source.disabled = true;
      updateEditor(false);
      showToast(error.message);
    });
  }

  function selectNode(id) {
    const selected = nodeById(id);
    if (!selected) return;
    if (sourceDirty && activeScriptId) {
      drafts.set(activeScriptId, source.value);
      metadataDrafts.set(activeScriptId, new Map(activeMetadata));
      dirtyUserScripts.add(activeScriptId);
    }
    selectedNodeId = id;
    renderProject();
    if (selected.class === 'script') loadScriptIntoEditor(selected);
  }

  function findFirstScript(node = documentData[0]) {
    if (node.class === 'script') return node;
    for (const child of node.children || []) {
      const found = findFirstScript(child);
      if (found) return found;
    }
    return null;
  }

  function setProject(project, filename = 'Catweb') {
    validateProject(project);
    documentData = project;
    projectLabelFallback = filename || 'MY PROJECT';
    collapsed.clear();
    drafts.clear();
    metadataDrafts.clear();
    dirtyUserScripts.clear();
    selectedNodeId = documentData[0].globalid;
    const first = findFirstScript();
    activeScriptId = first ? first.globalid : null;
    sourceDirty = false;
    activeMetadata = new Map();
    $('#folderAlias').value = documentData[0].alias || '';
    $('#projectName').textContent = documentData[0].alias || projectLabelFallback;
    if (first) {
      selectedNodeId = first.globalid;
      renderProject();
      loadScriptIntoEditor(first);
      const saveSourceButton = $('#saveSource');
      if (saveSourceButton) saveSourceButton.disabled = false;
    } else {
      source.value = '';
      previousSourceValue = source.value;
      source.disabled = true;
      $('#scriptTitle').textContent = 'no_script';
      $('#breadcrumbScript').textContent = 'no script';
      $('#windowTitle').textContent = 'Script Lab — no script';
      const saveSourceButton = $('#saveSource');
      if (saveSourceButton) saveSourceButton.disabled = true;
      updateEditor(false);
      renderProject();
    }
    refreshProjectJson('Project imported · compact');
    showToast(first ? 'Project imported. Select a script to edit it.' : 'Project imported; create a script to get started.');
  }

  function insertCatalogCall(button) {
    const call = button.dataset.call;
    const top = button.dataset.scope === 'top';
    const start = source.selectionStart;
    const end = source.selectionEnd;
    const before = source.value.slice(0, start);
    const after = source.value.slice(end);
    if (top) {
      const prefix = !before ? '' : before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
      const suffix = !after ? '\n\n' : after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n';
      source.setRangeText(`${prefix}${call}${suffix}`, start, end, 'end');
    } else {
      const lineStart = before.lastIndexOf('\n') + 1;
      const linePrefix = before.slice(lineStart);
      const indent = (linePrefix.match(/^\s*/) || [''])[0];
      const prefix = linePrefix.trim() ? `\n${indent}` : '';
      source.setRangeText(`${prefix}${call}\n${call.endsWith(':') ? `${indent}    ` : indent}`, start, end, 'end');
    }
    source.focus();
    updateEditor(true);
  }

  async function compile() {
    if (!activeScriptId) {
      showToast('Create or select a script before compiling.');
      return false;
    }
    const errors = renderDiagnostics(inspectSource());
    if (errors.length) {
      showToast('Fix the warnings before compiling.');
      return false;
    }
    try {
      const catalog = await catalogPromise;
      const result = CatwebCSL.compileScript(source.value, {
        catalog,
        folderAlias: $('#folderAlias').value.trim() || 'CatWet Script Lab',
        metadataByLine: activeMetadata
      });
      const scriptData = result[0].children[0];
      const target = nodeById(activeScriptId);
      if (!target || target.class !== 'script') throw new Error('The active script no longer exists in the project.');
      target.content = scriptData.content;
      sourceDirty = false;
      drafts.delete(activeScriptId);
      metadataDrafts.delete(activeScriptId);
      dirtyUserScripts.delete(activeScriptId);
      const mainCount = scriptData.content.length;
      const actionCount = scriptData.content.reduce((sum, item) => sum + (item.actions || []).length, 0);
      renderProject();
      updateEditor(false);
      refreshProjectJson(`${mainCount} top-level blocks · ${actionCount} actions · compact`);
      showToast('Script compiled and updated in the project.');
      return true;
    } catch (error) {
      const match = error.message.match(/Line (\d+):/);
      const compileErrors = match
        ? [{ line: Number(match[1]), message: error.message.replace(/^Line \d+:\s*/, '') }]
        : [{ line: 1, message: error.message }];
      renderDiagnostics(compileErrors);
      showToast(error.message);
      return false;
    }
  }

  async function compilePendingScripts() {
    const pendingIds = [...new Set([
      ...dirtyUserScripts,
      ...(sourceDirty && activeScriptId ? [activeScriptId] : [])
    ])];
    if (!pendingIds.length) return true;
    try {
      const catalog = await catalogPromise;
      for (const id of pendingIds) {
        const target = nodeById(id);
        if (!target || target.class !== 'script') {
          drafts.delete(id);
          metadataDrafts.delete(id);
          dirtyUserScripts.delete(id);
          continue;
        }
        const text = id === activeScriptId ? source.value : drafts.get(id) || '';
        const metadata = id === activeScriptId ? activeMetadata : metadataDrafts.get(id) || new Map();
        if (!text.trim()) {
          target.content = [];
        } else {
          const errors = inspectSource(text);
          if (errors.length) {
            showToast(`Cannot export script ${scriptsInProject().indexOf(target) + 1}: ${errors[0].message}`);
            return false;
          }
          const result = CatwebCSL.compileScript(text, {
            catalog,
            folderAlias: $('#folderAlias').value.trim() || 'CatWet Script Lab',
            metadataByLine: metadata
          });
          target.content = result[0].children[0].content;
        }
        drafts.delete(id);
        metadataDrafts.delete(id);
        dirtyUserScripts.delete(id);
      }
      sourceDirty = false;
      renderProject();
      updateEditor(false);
      refreshProjectJson('Project compiled · compact');
      showToast(`${pendingIds.length} changed ${pendingIds.length === 1 ? 'script' : 'scripts'} compiled.`);
      return true;
    } catch (error) {
      showToast(`Could not compile project scripts: ${error.message}`);
      return false;
    }
  }

  function setAIStatus(message, state = '') {
    const status = $('#aiStatus');
    status.textContent = message;
    status.classList.toggle('error', state === 'error');
    status.classList.toggle('success', state === 'success');
  }

  function invalidateAIPreview(message = 'Code changed · compile again before adding.') {
    aiCompiledPreview = null;
    $('#aiJsonPreview').value = '';
    $('#aiJsonDetails').open = false;
    $('#addAIScript').disabled = true;
    if (message) setAIStatus(message);
  }

  async function buildAIContext(catalog) {
    const documentationFiles = ['CATWEB_SCRIPT_LANGUAGE.md', 'AI_PROJECT_GUIDE.md'];
    const documentation = await Promise.all(documentationFiles.map(async (path) => {
      const response = await fetch(new URL(path, document.baseURI), { credentials: 'same-origin' });
      if (!response.ok) throw new Error(`Could not load ${path} for the AI context (HTTP ${response.status}).`);
      return `## ${path}\n${await response.text()}`;
    }));
    const calls = [...catalog.byKey.values()]
      .filter((item) => item.callName)
      .map((item) => {
        const parameters = (item.node.text || [])
          .filter((part) => part && typeof part === 'object' && !Array.isArray(part))
          .map((part) => `${part.l || 'value'}:${part.t || 'any'}`);
        return `- ${item.callName}(${parameters.join(', ')}) [${item.scope}; ${item.key}]`;
      })
      .join('\n');
    return `${documentation.join('\n\n')}\n\n## Available catalog calls\n${calls}`;
  }

  function cleanAICode(text) {
    const trimmed = text.replace(/^\uFEFF/, '').trim();
    const fenced = trimmed.match(/^```(?:catweb|csl|cat|text)?\s*\n([\s\S]*?)\n```$/i);
    return (fenced ? fenced[1] : trimmed).trim();
  }

  async function generateAICode() {
    const endpoint = $('#aiEndpoint').value.trim();
    const model = $('#aiModel').value.trim();
    const prompt = $('#aiPrompt').value.trim();
    aiApiKey = $('#aiApiKey').value.trim();
    if (!endpoint) {
      setAIStatus('Enter a provider endpoint URL.', 'error');
      return;
    }
    if (!model) {
      setAIStatus('Enter the model ID required by your provider.', 'error');
      return;
    }
    if (!prompt) {
      setAIStatus('Describe what the Catweb script should do.', 'error');
      return;
    }
    if (!window.CatwebAI) {
      setAIStatus('The provider adapter did not load. Reload the page and try again.', 'error');
      return;
    }
    $('#generateAI').disabled = true;
    $('#cancelAI').hidden = false;
    setAIStatus('Preparing Catweb docs and catalog…');
    aiRequestController = new AbortController();
    try {
      const catalog = await catalogPromise;
      const context = await buildAIContext(catalog);
      setAIStatus('Sending prompt and public Catweb references to your configured provider…');
      const response = await window.CatwebAI.generateChatCompletion({
        endpoint,
        model,
        apiKey: aiApiKey,
        messages: [
          {
            role: 'system',
            content: [
              'Generate complete Catweb Script Language (CSL) source code, not Python, Luau, or JSON.',
              'Follow the supplied CSL documentation and use only calls present in the supplied Catweb catalog.',
              'Plain assignments are global. Do not invent local/object declaration syntax, functions, blocks, or properties.',
              'Use valid top-level events/functions, correct indentation and blank lines between top-level sections.',
              'Return only CSL source, with no prose or Markdown fences. If a requested behavior is unsupported, do not fake it.'
            ].join(' ')
          },
          { role: 'user', content: `${context}\n\n## User request\n${prompt}` }
        ],
        signal: aiRequestController.signal
      });
      const code = cleanAICode(response);
      if (!code) throw new Error('The provider returned an empty CSL response.');
      $('#aiCode').value = code;
      $('#compileAI').disabled = false;
      invalidateAIPreview('CSL received · review it, then compile locally.');
      setAIStatus('CSL received · review it, then compile locally.', 'success');
    } catch (error) {
      if (error.name === 'AbortError') {
        setAIStatus('Provider request cancelled.');
      } else {
        const detail = error instanceof TypeError
          ? `${error.message} Check the endpoint, network, and provider CORS settings.`
          : error.message;
        setAIStatus(detail || 'Provider request failed.', 'error');
      }
    } finally {
      aiRequestController = null;
      $('#generateAI').disabled = false;
      $('#cancelAI').hidden = true;
    }
  }

  async function compileAICode() {
    const code = $('#aiCode').value.trim();
    if (!code) {
      invalidateAIPreview('Generate or enter CSL source before compiling.');
      return;
    }
    $('#compileAI').disabled = true;
    $('#addAIScript').disabled = true;
    setAIStatus('Compiling with the local Catweb catalog…');
    try {
      const errors = inspectSource(code);
      if (errors.length) throw new Error(`Line ${errors[0].line}: ${errors[0].message}`);
      const catalog = await catalogPromise;
      const project = CatwebCSL.compileScript(code, {
        catalog,
        folderAlias: $('#folderAlias').value.trim() || 'CatWet Script Lab'
      });
      aiCompiledPreview = { code, project };
      $('#aiJsonPreview').value = JSON.stringify(project);
      $('#aiJsonDetails').open = true;
      $('#addAIScript').disabled = false;
      setAIStatus('Compile succeeded · JSON preview is local and ready to add.', 'success');
    } catch (error) {
      aiCompiledPreview = null;
      $('#aiJsonPreview').value = '';
      $('#aiJsonDetails').open = false;
      setAIStatus(error.message || 'CSL compilation failed.', 'error');
    } finally {
      $('#compileAI').disabled = false;
    }
  }

  async function addAICodeAsScript() {
    if (!aiCompiledPreview || aiCompiledPreview.code !== $('#aiCode').value.trim()) {
      invalidateAIPreview('Compile the current CSL source before adding it.');
      return;
    }
    $('#addAIScript').disabled = true;
    const root = aiCompiledPreview.project && aiCompiledPreview.project[0];
    const previewScript = root && Array.isArray(root.children)
      ? root.children.find((child) => child.class === 'script')
      : null;
    if (!previewScript || previewScript.class !== 'script') {
      setAIStatus('Compiler output did not contain a Catweb script object.', 'error');
      $('#addAIScript').disabled = false;
      return;
    }
    try {
      const catalog = await catalogPromise;
      const extracted = extractMetadata(CatwebCSL.decompileScript(previewScript.content, catalog));
      if (sourceDirty && activeScriptId) {
        drafts.set(activeScriptId, source.value);
        metadataDrafts.set(activeScriptId, new Map(activeMetadata));
        dirtyUserScripts.add(activeScriptId);
      }
      const scriptNode = {
        class: 'script',
        globalid: uid(),
        content: clone(previewScript.content)
      };
      documentData[0].children ||= [];
      documentData[0].children.push(scriptNode);
      selectedNodeId = scriptNode.globalid;
      activeScriptId = scriptNode.globalid;
      sourceDirty = false;
      drafts.delete(scriptNode.globalid);
      metadataDrafts.delete(scriptNode.globalid);
      dirtyUserScripts.delete(scriptNode.globalid);
      source.value = extracted.source;
      previousSourceValue = source.value;
      activeMetadata = extracted.metadata;
      source.disabled = false;
      $('#scriptTitle').textContent = 'script';
      $('#breadcrumbScript').textContent = 'script';
      $('#windowTitle').textContent = `Script Lab — ${documentData[0].alias || projectLabelFallback}`;
      const saveSourceButton = $('#saveSource');
      if (saveSourceButton) saveSourceButton.disabled = false;
      renderProject();
      updateEditor(false);
      refreshProjectJson('AI script added · compact');
      invalidateAIPreview('Script added · compile again before adding another copy.');
      closeAIModal();
      showToast('Compiled AI script added to the project. Test it in Catweb.');
    } catch (error) {
      setAIStatus(`Could not add compiled script: ${error.message}`, 'error');
      $('#addAIScript').disabled = false;
    }
  }

  function openAIModal() {
    $('#aiModal').classList.add('open');
    $('#aiModal').setAttribute('aria-hidden', 'false');
    $('#aiPrompt').focus();
  }

  function closeAIModal() {
    if (aiRequestController) aiRequestController.abort();
    aiApiKey = '';
    $('#aiApiKey').value = '';
    $('#aiModal').classList.remove('open');
    $('#aiModal').setAttribute('aria-hidden', 'true');
    $('#openAI').focus();
  }

  function replaceSelectedObject(edited) {
    const oldId = selectedNodeId;
    const candidate = clone(documentData);
    const replace = (node) => {
      if (node.globalid === oldId) return edited;
      if (Array.isArray(node.children)) node.children = node.children.map(replace);
      return node;
    };
    candidate[0] = replace(candidate[0]);
    validateProject(candidate);
    documentData = candidate;
    selectedNodeId = edited.globalid;
    if (activeScriptId === oldId && edited.class === 'script') activeScriptId = edited.globalid;
    renderProject();
    refreshProjectJson('Properties updated · compact');
    showToast('Properties applied.');
  }

  function applyObjectProperties() {
    const current = nodeById(selectedNodeId);
    if (!current || current.class === 'script') return;
    let edited;
    const details = $('#objectPropertiesRaw').closest('details');
    if (details.open) {
      edited = JSON.parse($('#objectPropertiesRaw').value);
    } else {
      edited = clone(current);
      document.querySelectorAll('#objectInspector [data-property]').forEach((control) => {
        const key = control.dataset.property;
        if (control.dataset.type === 'boolean') edited[key] = control.value === 'true';
        else if (control.dataset.type === 'number') {
          const number = Number(control.value);
          if (!Number.isFinite(number)) throw new Error(`${key} must be numeric.`);
          edited[key] = number;
        } else if (control.dataset.type === 'json') {
          try { edited[key] = JSON.parse(control.value); }
          catch { throw new Error(`${key} must contain valid JSON.`); }
        } else edited[key] = control.value;
      });
    }
    if (!edited || Array.isArray(edited) || typeof edited !== 'object'
        || typeof edited.class !== 'string' || typeof edited.globalid !== 'string') {
      throw new Error('Each object must have string class and globalid values.');
    }
    replaceSelectedObject(edited);
    if (edited.class === 'Folder') $('#folderAlias').value = edited.alias || '';
  }

  function createScript() {
    if (sourceDirty && activeScriptId) {
      drafts.set(activeScriptId, source.value);
      metadataDrafts.set(activeScriptId, new Map(activeMetadata));
    }
    const scriptNode = { class: 'script', globalid: uid(), content: [] };
    documentData[0].children ||= [];
    documentData[0].children.push(scriptNode);
    selectedNodeId = scriptNode.globalid;
    activeScriptId = scriptNode.globalid;
    sourceDirty = false;
    drafts.delete(scriptNode.globalid);
    source.disabled = false;
    source.value = '';
    activeMetadata = new Map();
    previousSourceValue = source.value;
    $('#scriptTitle').textContent = 'script';
    $('#breadcrumbScript').textContent = 'script';
    $('#windowTitle').textContent = 'Script Lab — script';
    const saveSourceButton = $('#saveSource');
    if (saveSourceButton) saveSourceButton.disabled = false;
    renderProject();
    updateEditor(false);
    refreshProjectJson('New script · compact project');
    showToast('New script created; start with on load:.');
  }

  function addProjectObject(type) {
    if (type === 'script') {
      createScript();
      return;
    }
    const selected = nodeById(selectedNodeId);
    const target = selected && ['Folder', 'Frame', 'ScrollingFrame'].includes(selected.class)
      ? selected
      : selected && parentOf(selectedNodeId) || documentData[0];
    const node = { class: type, globalid: uid(), children: [] };
    if (type === 'Frame') Object.assign(node, { size: '{1, 0},{0.25, 0}', background_color: '#f1f4f0' });
    if (type === 'TextLabel') Object.assign(node, { text: 'New text', size: '{1, 0},{0.1, 0}', font_size: 'scaled', rich: 'false' });
    if (type.startsWith('TextButton')) Object.assign(node, { text: 'New button', size: '{0.4, 0},{0.12, 0}', background_color: '#4e9bff', font_size: 'scaled', auto_color: 'true' });
    if (type === 'ImageLabel' || type === 'ImageButton') Object.assign(node, { image: 'rbxassetid://', size: '{0.3, 0},{0.2, 0}' });
    if (type === 'TextBox') Object.assign(node, { text: '', placeholder: 'Type here', editable: 'true', multiline: 'false', size: '{0.5, 0},{0.1, 0}' });
    if (type === 'ScrollingFrame') Object.assign(node, { canvassize: '{0, 0},{2, 0}', size: '{1, 0},{0.5, 0}' });
    target.children ||= [];
    target.children.push(node);
    selectedNodeId = node.globalid;
    renderProject();
    refreshProjectJson('Catweb object added · compact');
    showToast(`${labelFor(type.split('?')[0])} added to ${target.alias || target.text || 'project'}.`);
  }

  function deleteSelectedProjectObject() {
    const selected = nodeById(selectedNodeId);
    const parent = selected && parentOf(selectedNodeId);
    if (!selected || !parent) return;
    const removedScripts = scriptsInProject(selected);
    const hasUnsavedScript = removedScripts.some((scriptNode) => dirtyUserScripts.has(scriptNode.globalid));
    if (hasUnsavedScript && !window.confirm('This object contains uncompiled script changes. Remove it anyway?')) return;
    parent.children = (parent.children || []).filter((node) => node.globalid !== selected.globalid);
    collapsed.delete(selected.globalid);
    removedScripts.forEach((scriptNode) => {
      drafts.delete(scriptNode.globalid);
      metadataDrafts.delete(scriptNode.globalid);
      dirtyUserScripts.delete(scriptNode.globalid);
    });
    const deletedActiveScript = removedScripts.some((scriptNode) => scriptNode.globalid === activeScriptId);
    if (deletedActiveScript) {
      activeScriptId = null;
      sourceDirty = false;
      activeMetadata = new Map();
      source.value = '';
      previousSourceValue = '';
      source.disabled = true;
      $('#scriptTitle').textContent = 'no script';
      $('#breadcrumbScript').textContent = 'no script';
      $('#windowTitle').textContent = `Script Lab — ${documentData[0].alias || projectLabelFallback}`;
      const saveSourceButton = $('#saveSource');
      if (saveSourceButton) saveSourceButton.disabled = true;
    }
    selectedNodeId = parent.globalid;
    renderProject();
    refreshProjectJson('Catweb object removed · compact');
    if (deletedActiveScript) {
      const nextScript = scriptsInProject()[0];
      if (nextScript) selectNode(nextScript.globalid);
      else updateEditor(false);
    }
    showToast(`${selected.class === 'script' ? 'Script' : labelFor(selected.class)} removed from project.`);
  }

  function downloadProject() {
    const blob = new Blob([lastJson || JSON.stringify(documentData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const name = ($('#folderAlias').value || 'catweb').replace(/[^\w-]+/g, '_') || 'catweb';
    link.href = url;
    link.download = `${name}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Project exported as compact JSON.');
  }

  function saveSource() {
    showToast('.cat import/export is reserved for a future editor stage.');
  }

  function clearOutput() {
    $('#output').innerHTML = '<span class="output-placeholder">Compact project JSON will appear here.</span>';
    $('#outputStatus').textContent = 'Output hidden';
    $('#copy').disabled = true;
  }

  source.addEventListener('input', () => updateEditor(true));
  source.addEventListener('click', syncScroll);
  source.addEventListener('keyup', syncScroll);
  source.addEventListener('scroll', syncScroll);
  lineNumbers.addEventListener('click', (event) => {
    const marker = event.target.closest('.metadata-indicator');
    if (marker) showToast(marker.dataset.metadata);
  });
  source.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      source.setRangeText('    ', source.selectionStart, source.selectionEnd, 'end');
      updateEditor(true);
    }
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      compile();
      return;
    }
    if (event.key === 'Enter') {
      const lineStart = source.value.lastIndexOf('\n', source.selectionStart - 1) + 1;
      let indent = source.value.slice(lineStart, source.selectionStart).match(/^\s*/)?.[0] || '';
      const currentLine = splitInlineComment(source.value.slice(lineStart, source.selectionStart)).code.trimEnd();
      if (/^(?:if|for|else)\b.*:\s*$/.test(currentLine.trim())) indent += '    ';
      event.preventDefault();
      source.setRangeText(`\n${indent}`, source.selectionStart, source.selectionEnd, 'end');
      updateEditor(true);
    }
  });
  document.querySelectorAll('[data-insert]').forEach((button) =>
    button.addEventListener('click', () => {
      const snippet = button.dataset.insert === 'set' ? 'new_variable = "value"' : 'console.log("Hello")';
      source.setRangeText(snippet, source.selectionStart, source.selectionEnd, 'end');
      source.focus();
      updateEditor(true);
    }));
  $('#compile').addEventListener('click', compile);
  const openJsonModal = (json) => {
    $('#jsonModalContent').value = json;
    $('#jsonCopyStatus').textContent = 'Ready to copy';
    $('#jsonModal').classList.add('open');
    $('#jsonModal').setAttribute('aria-hidden', 'false');
    $('#jsonModalContent').focus();
  };
  const closeJsonModal = () => {
    $('#jsonModal').classList.remove('open');
    $('#jsonModal').setAttribute('aria-hidden', 'true');
    $('#exportProject').focus();
  };
  $('#exportProject').addEventListener('click', async () => {
    if (dirtyUserScripts.size || sourceDirty) {
      const saved = await compilePendingScripts();
      if (!saved) return;
    }
    if (!lastJson) refreshProjectJson();
    openJsonModal(lastJson);
  });
  $('#openAI').addEventListener('click', openAIModal);
  $('#closeAI').addEventListener('click', closeAIModal);
  $('#aiModal [data-close-ai]').addEventListener('click', closeAIModal);
  $('#generateAI').addEventListener('click', generateAICode);
  $('#cancelAI').addEventListener('click', () => {
    if (aiRequestController) aiRequestController.abort();
  });
  $('#aiCode').addEventListener('input', () => {
    invalidateAIPreview();
    $('#compileAI').disabled = !$('#aiCode').value.trim();
  });
  $('#compileAI').addEventListener('click', compileAICode);
  $('#addAIScript').addEventListener('click', addAICodeAsScript);
  $('#closeJsonModal').addEventListener('click', closeJsonModal);
  $('[data-close-modal]').addEventListener('click', closeJsonModal);
  $('#copyJson').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('#jsonModalContent').value);
      $('#jsonCopyStatus').textContent = 'Copied successfully';
      showToast('Project JSON copied.');
    } catch {
      $('#jsonModalContent').select();
      $('#jsonCopyStatus').textContent = 'Text selected; press Ctrl+C';
      showToast('Automatic copying is unavailable.');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && $('#jsonModal').classList.contains('open')) closeJsonModal();
    if (event.key === 'Escape' && $('#aiModal').classList.contains('open')) closeAIModal();
  });
  $('#openProject').addEventListener('click', () => $('#fileInput').click());
  $('#fileInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (dirtyUserScripts.size && !window.confirm('There are unsaved code changes. Do you want to replace the current project?')) {
      event.target.value = '';
      return;
    }
    try {
      const imported = normalizeImport(JSON.parse(await file.text()));
      setProject(imported, file.name.replace(/\.json$/i, ''));
    } catch (error) {
      showToast(`Could not import project: ${error.message}`);
    }
    event.target.value = '';
  });
  $('#projectTree').addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-toggle-id]');
    if (toggle) {
      const id = toggle.dataset.toggleId;
      if (collapsed.has(id)) collapsed.delete(id);
      else collapsed.add(id);
      renderProjectTree();
      return;
    }
    const row = event.target.closest('[data-node-id]');
    if (row) selectNode(row.dataset.nodeId);
  });
  $('#eventTree').addEventListener('click', (event) => {
    const item = event.target.closest('[data-line]');
    if (!item) return;
    const line = Number(item.dataset.line);
    const offset = source.value.split('\n').slice(0, line - 1).join('\n').length + (line > 1 ? 1 : 0);
    source.focus();
    source.setSelectionRange(offset, offset);
  });
  $('#newScript').addEventListener('click', createScript);
  $('.project-add').addEventListener('click', (event) => {
    const button = event.target.closest('[data-add-object]');
    if (button) addProjectObject(button.dataset.addObject);
  });
  $('#objectInspector').addEventListener('click', (event) => {
    if (event.target.closest('#deleteProjectObject')) deleteSelectedProjectObject();
    if (event.target.closest('#applyObjectProperties')) {
      try { applyObjectProperties(); }
      catch (error) { showToast(`Could not apply properties: ${error.message}`); }
    }
  });
  $('#projectSearch').addEventListener('input', renderProjectTree);
  $('.tree-filters').addEventListener('click', (event) => {
    const button = event.target.closest('[data-tree-filter]');
    if (!button) return;
    projectTreeFilter = button.dataset.treeFilter;
    $('.tree-filters').querySelectorAll('[data-tree-filter]').forEach((filterButton) => {
      const active = filterButton === button;
      filterButton.classList.toggle('active', active);
      filterButton.setAttribute('aria-pressed', String(active));
    });
    renderProjectTree();
  });
  $('#folderAlias').addEventListener('input', () => {
    documentData[0].alias = $('#folderAlias').value;
    $('#projectName').textContent = documentData[0].alias || projectLabelFallback;
    $('#breadcrumbProject').textContent = documentData[0].alias || projectLabelFallback;
    renderProjectTree();
    refreshProjectJson('Project updated · compact');
  });
  const workbench = $('.workbench');
  document.querySelectorAll('[data-panel-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const panel = button.dataset.panelToggle;
      const compact = window.matchMedia('(max-width: 760px)').matches;
      const narrow = window.matchMedia('(max-width: 850px)').matches;
      const openClass = panel === 'explorer' && compact ? 'show-explorer'
        : panel === 'catalog' && narrow ? 'show-catalog' : null;
      const closedClass = `hide-${panel}`;
      if (openClass) {
        workbench.classList.remove(closedClass);
        const isOpen = workbench.classList.toggle(openClass);
        button.setAttribute('aria-pressed', String(isOpen));
      } else {
        workbench.classList.remove(panel === 'explorer' ? 'show-explorer' : 'show-catalog');
        const isHidden = workbench.classList.toggle(closedClass);
        button.setAttribute('aria-pressed', String(!isHidden));
      }
      button.classList.toggle('active', button.getAttribute('aria-pressed') === 'true');
    });
  });
  $('#activitySearch').addEventListener('click', () => {
    const narrow = window.matchMedia('(max-width: 850px)').matches;
    workbench.classList.remove('hide-catalog');
    if (narrow) workbench.classList.add('show-catalog');
    const blocksButton = document.querySelector('[data-panel-toggle="catalog"]');
    blocksButton.setAttribute('aria-pressed', 'true');
    blocksButton.classList.add('active');
    $('#catalogSearch').focus();
  });
  $('#activityEvents').addEventListener('click', () => {
    const firstEvent = $('#eventTree .event-node');
    if (firstEvent) firstEvent.click();
  });
  $('#catalogSearch').addEventListener('input', (event) =>
    catalogPromise.then((catalog) => renderCatalog(catalog, event.target.value)));
  $('#catalogEntries').addEventListener('click', (event) => {
    const button = event.target.closest('[data-call]');
    if (button && !source.disabled) insertCatalogCall(button);
  });

  catalogPromise.then((catalog) => {
    const categories = [...new Set([...catalog.byKey.values()].map((item) => item.category))].sort();
    $('#catalogSummary').textContent = `${categories.length} categories · ${catalog.byKey.size} catalog forms`;
    renderCatalog(catalog);
    source.disabled = false;
    updateEditor(false);
    refreshProjectJson('Project ready · compact');
  }).catch((error) => {
    $('#catalogSummary').textContent = error.message;
    $('.statusbar').classList.add('has-error');
    $('#sourceStatus').textContent = 'Could not load catalog';
    showToast(error.message);
  });

  renderProject();
  updateEditor(false);
  refreshProjectJson();
})();
