(() => {
  const $ = (selector) => document.querySelector(selector);
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const uid = () => crypto.getRandomValues(new Uint32Array(2)).join('').slice(0, 12);
  const root = { class: 'Folder', globalid: uid(), children: [] };
  let documentData = [root];
  let selectedId = root.globalid;
  let toastTimer;
  const catalogPromise = CatwebCSL.loadCatalog('../script/');

  const iconFor = (type) => ({ Folder: '▱', Frame: '▧', TextLabel: 'T', TextButton: '▰',
    'TextButton?link': '↗', 'TextButton?transfer': '↗', 'TextButton?avataritem': '↗',
    ImageLabel: '▣', ImageButton: '▣', TextBox: '▤', ScrollingFrame: '▤', script: '⌘' }[type] || '◇');
  const findNode = (id, node = documentData[0]) => {
    if (node.globalid === id) return node;
    for (const child of node.children || []) { const found = findNode(id, child); if (found) return found; }
    return null;
  };
  const findParent = (id, node = documentData[0]) => {
    for (const child of node.children || []) {
      if (child.globalid === id) return node;
      const found = findParent(id, child); if (found) return found;
    }
    return null;
  };
  const escape = (value) => String(value).replace(/[&<>"']/g, (ch) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  const labelFor = (key) => key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  function notify(message) {
    const toast = $('#toast'); toast.textContent = message; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function validateDocument(document) {
    if (!Array.isArray(document) || document.length !== 1 || !document[0] || document[0].class !== 'Folder') {
      throw new Error('The project must be an array with a root folder.');
    }
    if (!Array.isArray(document[0].children)) throw new Error('The root folder must have children as an array.');
    const ids = new Set();
    const visitBlock = (block, path) => {
      if (!block || Array.isArray(block) || typeof block !== 'object') throw new Error(`${path} must be a JSON block.`);
      if (block.actions !== undefined && !Array.isArray(block.actions)) throw new Error(`${path}.actions must be an array.`);
      (block.actions || []).forEach((action, index) => visitBlock(action, `${path}.actions[${index}]`));
    };
    const visit = (node, path) => {
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
      (node.children || []).forEach((child, index) => visit(child, `${path}.children[${index}]`));
    };
    visit(document[0], 'root');
  }

  function normalizeImport(parsed) {
    const entries = Array.isArray(parsed) ? parsed : [parsed];
    if (entries.length === 1 && entries[0] && entries[0].class === 'Folder') {
      const project = entries;
      validateDocument(project);
      return project;
    }
    if (!entries.length || entries.some((entry) => !entry || entry.class === 'Folder')) {
      throw new Error('Import a complete Catweb folder or a script object/array.');
    }
    const project = [{ class: 'Folder', globalid: uid(), children: entries }];
    validateDocument(project);
    return project;
  }

  function renderTree() {
    const tree = $('#tree'); tree.replaceChildren();
    const addRows = (node, depth = 0) => {
      const row = document.createElement('div'); row.className = `tree-row${node.globalid === selectedId ? ' selected' : ''}`;
      row.setAttribute('role', 'treeitem'); row.style.paddingLeft = `${8 + depth * 15}px`;
      row.innerHTML = `<span class="tree-icon">${iconFor(node.class)}</span><span class="tree-name">${escape(node.text || node.alias || node.class)}</span><span class="tree-type">${escape(node.class)}</span>`;
      row.addEventListener('click', () => { selectedId = node.globalid; render(); }); tree.append(row);
      (node.children || []).forEach((child) => addRows(child, depth + 1));
    };
    addRows(documentData[0]);
    const count = countObjects(documentData[0]);
    $('#objectCount').textContent = `${count} ${count === 1 ? 'object' : 'objects'}`;
  }

  function countObjects(node) { return 1 + (node.children || []).reduce((sum, child) => sum + countObjects(child), 0); }

  function renderVisualProperties(node) {
    const fields = Object.entries(node).filter(([key]) => key !== 'children' && key !== 'content');
    return `<div class="property-grid">${fields.map(([key, value], index) => {
      const type = value === null ? 'null' : Array.isArray(value) ? 'json' : typeof value === 'object' ? 'json' : typeof value;
      const control = type === 'boolean'
        ? `<select id="property-${index}" class="property-input" data-property="${escape(key)}" data-type="boolean"><option value="true"${value ? ' selected' : ''}>Yes</option><option value="false"${value ? '' : ' selected'}>No</option></select>`
        : type === 'json' || type === 'null'
          ? `<textarea id="property-${index}" class="property-input property-json" data-property="${escape(key)}" data-type="json" rows="3">${escape(JSON.stringify(value))}</textarea>`
          : `<input id="property-${index}" class="property-input" data-property="${escape(key)}" data-type="${type}" value="${escape(value)}">`;
      return `<div class="field"><label class="property-label" for="property-${index}">${escape(labelFor(key))}<small>${escape(key)}</small></label>${control}</div>`;
    }).join('')}</div>`;
  }

  function renderInspector() {
    const node = findNode(selectedId);
    const body = $('#inspectorBody');
    $('#selectedTitle').textContent = node.text || node.alias || node.class;
    $('#deleteObject').disabled = node.class === 'Folder';
    $('#applyProperties').disabled = false;
    $('#applyProperties').textContent = node.class === 'script' ? 'Save CSL code' : 'Apply properties';
    if (node.class === 'script') {
      body.innerHTML = '<label class="property-label" for="scriptSource">Script CSL code</label><textarea id="scriptSource" class="json-input" spellcheck="false" disabled>Loading the block catalog…</textarea><small class="editor-hint">Blocks, end markers, and identifiers are preserved; unrecognized blocks appear as raw.</small>';
      catalogPromise.then((catalog) => {
        if (selectedId !== node.globalid) return;
        const editor = $('#scriptSource');
        if (editor) { editor.value = CatwebCSL.decompileScript(node.content, catalog); editor.disabled = false; }
      }).catch((error) => {
        if (selectedId === node.globalid && $('#scriptSource')) $('#scriptSource').value = `Could not load catalog: ${error.message}`;
      });
      return;
    }
    body.innerHTML = `${renderVisualProperties(node)}<details class="advanced-properties"><summary>Edit entire object as JSON</summary><textarea id="properties" class="json-input" spellcheck="false"></textarea></details>`;
    $('#properties').value = JSON.stringify(node, null, 2);
  }

  function renderPreview() {
    const preview = $('#preview'); preview.replaceChildren();
    const visible = (documentData[0].children || []).filter((node) => node.class !== 'script');
    if (!visible.length) {
      preview.innerHTML = '<div class="empty-state"><div class="empty-icon">✦</div><h2>Your site starts here</h2><p>Add objects with the left panel, then select them to edit their properties.</p></div>';
      $('#previewCount').textContent = '0 elements'; return;
    }
    visible.forEach((node) => preview.append(renderNode(node)));
    const count = visible.reduce((sum, node) => sum + countVisible(node), 0);
    $('#previewCount').textContent = `${count} ${count === 1 ? 'element' : 'elements'}`;
  }
  function countVisible(node) { return (node.class === 'script' ? 0 : 1) + (node.children || []).reduce((sum, child) => sum + countVisible(child), 0); }
  function renderNode(node) {
    let el;
    if (node.class === 'TextLabel') { el = document.createElement('div'); el.textContent = node.text || 'Text'; }
    else if (node.class.startsWith('TextButton') || node.class === 'ImageButton') { el = document.createElement('button'); el.textContent = node.text || (node.class === 'ImageButton' ? 'Image' : 'Button'); }
    else if (node.class === 'ImageLabel') { el = document.createElement('div'); el.textContent = 'Image'; el.style.background = '#edf0ec'; el.style.display = 'grid'; el.style.placeItems = 'center'; }
    else if (node.class === 'TextBox') { el = document.createElement('input'); el.placeholder = node.placeholder || 'Input'; el.value = node.text || ''; }
    else if (node.class === 'script') return document.createDocumentFragment();
    else { el = document.createElement('div'); }
    el.style.boxSizing = 'border-box'; el.style.minWidth = '24px'; el.style.minHeight = '24px';
    el.style.padding = '8px'; el.style.margin = '5px'; el.style.border = '1px dashed #d8ded7';
    if (node.size) el.dataset.catwebSize = node.size;
    if (node.background_color) el.style.backgroundColor = node.background_color;
    if (node.font_color) el.style.color = node.font_color;
    if (node.font_size && node.font_size !== 'scaled') el.style.fontSize = `${parseInt(node.font_size, 10) || 12}px`;
    if (node.align_x === 'Center') el.style.textAlign = 'center';
    if (node.class === 'Frame' || node.class === 'ScrollingFrame' || node.class === 'Folder') {
      el.style.minHeight = '70px'; el.style.display = 'flex'; el.style.flexDirection = 'column';
      (node.children || []).forEach((child) => el.append(renderNode(child)));
    }
    el.title = `${node.class}${node.size ? ` · ${node.size}` : ''}`;
    el.addEventListener('click', (event) => { event.stopPropagation(); selectedId = node.globalid; render(); });
    return el;
  }

  function render() { renderTree(); renderInspector(); renderPreview(); }
  function addObject(type) {
    const selected = findNode(selectedId);
    const target = ['Folder', 'Frame', 'ScrollingFrame'].includes(selected.class) ? selected : (findParent(selectedId) || documentData[0]);
    const node = { class: type, globalid: uid() };
    if (type !== 'script') node.children = [];
    if (type === 'Frame') Object.assign(node, { size: '{1, 0},{0.25, 0}', background_color: '#f1f4f0' });
    if (type === 'TextLabel') Object.assign(node, { text: 'New text', size: '{1, 0},{0.1, 0}', font_size: 'scaled', rich: 'false' });
    if (type.startsWith('TextButton')) Object.assign(node, { text: 'New button', size: '{0.4, 0},{0.12, 0}', background_color: '#4e9bff', font_size: 'scaled', auto_color: 'true' });
    if (type === 'ImageLabel' || type === 'ImageButton') Object.assign(node, { image: 'rbxassetid://', size: '{0.3, 0},{0.2, 0}' });
    if (type === 'TextBox') Object.assign(node, { text: '', placeholder: 'Type here', editable: 'true', multiline: 'false', size: '{0.5, 0},{0.1, 0}' });
    if (type === 'ScrollingFrame') Object.assign(node, { canvassize: '{0, 0},{2, 0}', size: '{1, 0},{0.5, 0}', children: [] });
    if (type === 'script') node.content = [];
    target.children ||= []; target.children.push(node); selectedId = node.globalid; render();
  }

  function replaceSelected(edited) {
    const candidate = clone(documentData);
    const locate = (node) => {
      if (node.globalid === selectedId) return edited;
      if (Array.isArray(node.children)) node.children = node.children.map(locate);
      return node;
    };
    candidate[0] = locate(candidate[0]);
    validateDocument(candidate);
    documentData = candidate;
    selectedId = edited.globalid;
    render();
  }

  $('#tree').addEventListener('click', (event) => { if (event.target === $('#tree')) { selectedId = documentData[0].globalid; render(); } });
  document.querySelectorAll('[data-add]').forEach((button) => button.addEventListener('click', () => addObject(button.dataset.add)));
  $('#applyProperties').addEventListener('click', async () => {
    try {
      const current = findNode(selectedId);
      if (current.class === 'script') {
        const catalog = await catalogPromise;
        const generated = CatwebCSL.compileScript($('#scriptSource').value, { catalog, folderAlias: documentData[0].alias || 'CatWet Studio' });
        const edited = clone(current);
        edited.content = generated[0].children[0].content;
        replaceSelected(edited);
        notify('CSL script saved to the project.');
        return;
      }
      let edited;
      if ($('#properties').closest('details').open) {
        edited = JSON.parse($('#properties').value);
      } else {
        edited = clone(current);
        document.querySelectorAll('[data-property]').forEach((control) => {
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
      if (!edited || Array.isArray(edited) || typeof edited !== 'object' || typeof edited.class !== 'string' || typeof edited.globalid !== 'string') {
        throw new Error('Each object must have string class and globalid values.');
      }
      replaceSelected(edited);
      notify('Properties applied.');
    } catch (error) { notify(`Could not apply changes: ${error.message}`); }
  });
  $('#deleteObject').addEventListener('click', () => {
    const parent = findParent(selectedId); if (!parent) return;
    parent.children = parent.children.filter((node) => node.globalid !== selectedId); selectedId = parent.globalid; render(); notify('Object deleted.');
  });
  $('#newProject').addEventListener('click', () => {
    documentData = [{ class: 'Folder', globalid: uid(), children: [] }]; selectedId = documentData[0].globalid; $('#projectName').textContent = 'Untitled site'; render(); notify('New project created.');
  });
  $('#openProject').addEventListener('click', () => $('#fileInput').click());
  $('#fileInput').addEventListener('change', async (event) => {
    const file = event.target.files[0]; if (!file) return;
    try {
      const imported = normalizeImport(JSON.parse(await file.text()));
      documentData = imported; selectedId = imported[0].globalid; $('#projectName').textContent = file.name.replace(/\.json$/i, ''); render(); notify('Catweb JSON opened.');
    } catch (error) { notify(`Could not open file: ${error.message}`); }
    event.target.value = '';
  });
  $('#exportProject').addEventListener('click', () => {
    try {
      validateDocument(documentData);
      const blob = new Blob([JSON.stringify(documentData)], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const link = document.createElement('a');
      link.href = url; link.download = `${$('#projectName').textContent.replace(/[^\w-]+/g, '_') || 'catweb'}.json`;
      link.click();       setTimeout(() => URL.revokeObjectURL(url), 1000); notify('Compact JSON exported.');
    } catch (error) { notify(`Could not export project: ${error.message}`); }
  });
  catalogPromise.catch((error) => notify(`Could not load catalog: ${error.message}`));
  render();
})();
