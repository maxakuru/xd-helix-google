function createSelect(fd) {
    const select = document.createElement('select');
    select.id = fd.id;
    if (fd.placeholder) {
      const ph = document.createElement('option');
      ph.textContent = fd.placeholder;
      ph.setAttribute('selected', '');
      ph.setAttribute('disabled', '');
      select.append(ph);
    }
    fd.enum.split(',').forEach((o) => {
      const option = document.createElement('option');
      option.textContent = o.trim();
      option.value = o.trim();
      select.append(option);
    });
    if (fd.required === 'x') {
      select.setAttribute('required', 'required');
    }
    return select;
  }
  
  function constructPayload(form) {
    const payload = {};
    [...form.elements].forEach((fe) => {
      if (fe.type === 'checkbox') {
        if (fe.checked) payload[fe.id] = fe.value;
      } else if (fe.id) {
        payload[fe.id] = fe.value;
      }
    });
    return payload;
  }
  
  async function submitForm(form) {
    const payload = constructPayload(form);
    const resp = await fetch(form.dataset.action, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: payload }),
    });
    await resp.text();
    return payload;
  }
  
  function createButton(fd) {
    const button = document.createElement('button');
    button.textContent = fd.label;
    button.classList.add('button');
    if (fd.type === 'submit') {
      button.addEventListener('click', async (event) => {
        const form = button.closest('form');
        if (form.checkValidity()) {
          event.preventDefault();
          button.setAttribute('disabled', '');
          await submitForm(form);
          if(fd.redirect) {
            window.location.href = fd.redirect;
          }
        }
      });
    }
    return button;
  }
  
  function createHeading(fd) {
    const heading = document.createElement('h3');
    heading.textContent = fd.label;
    return heading;
  }
  
  function createInput(fd) {
    const input = document.createElement('input');
    input.type = fd.inputType;
    input.id = fd.id;
    input.setAttribute('placeholder', fd.placeholder);
    if (fd.required === 'x' || fd.required === 'true') {
      input.setAttribute('required', 'required');
    }
    return input;
  }
  
  function createTextArea(fd) {
    const input = document.createElement('textarea');
    input.id = fd.id;
    input.setAttribute('placeholder', fd.placeholder);
    if (fd.required === 'x' || fd.required === 'true') {
      input.setAttribute('required', 'required');
    }
    return input;
  }
  
  function createLabel(fd) {
    const label = document.createElement('label');
    label.setAttribute('for', fd.id);
    label.textContent = fd.label;
    if (fd.required === 'x' || fd.required === 'true') {
      label.classList.add('required');
    }
    return label;
  }
  
  function applyRules(form, rules) {
    const payload = constructPayload(form);
    rules.forEach((field) => {
      const { type, condition: { key, operator, value } } = field.rule;
      if (type === 'visible') {
        if (operator === 'eq') {
          if (payload[key] === value) {
            form.querySelector(`.${field.fieldId}`).classList.remove('hidden');
          } else {
            form.querySelector(`.${field.fieldId}`).classList.add('hidden');
          }
        }
      }
    });
  }
  
  async function createForm(formURL) {
    const { pathname } = new URL(formURL);
    let hasSubmit = false;
    const resp = await fetch(pathname);
    const json = await resp.json();
    const form = document.createElement('form');
    const rules = [];
    // eslint-disable-next-line prefer-destructuring
    form.dataset.action = pathname.split('.json')[0];
    json.data.forEach((fd) => {
      fd.inputType = fd.inputType || 'text';
      const fieldWrapper = document.createElement('div');
      const style = fd.viewType ? ` form-${fd.viewType}` : '';
      const fieldId = `form-${fd.id}-wrapper${style}`;
      fieldWrapper.className = fieldId;
      fieldWrapper.classList.add('field-wrapper');
      switch (fd.inputType) {
        case 'select':
          fieldWrapper.append(createLabel(fd));
          fieldWrapper.append(createSelect(fd));
          break;
        case 'heading':
          fieldWrapper.append(createHeading(fd));
          break;
        case 'checkbox':
          fieldWrapper.append(createInput(fd));
          fieldWrapper.append(createLabel(fd));
          break;
        case 'text-area':
          fieldWrapper.append(createLabel(fd));
          fieldWrapper.append(createTextArea(fd));
          break;
        case 'submit':
          hasSubmit = true;
          fieldWrapper.append(createButton(fd));
          break;
        default:
          fieldWrapper.append(createLabel(fd));
          fieldWrapper.append(createInput(fd));
      }
  
      if (fd.rules) {
        try {
          rules.push({ fieldId, rule: JSON.parse(fd.rules) });
        } catch (e) {
          console.log(`Invalid Rule ${fd.rules}: ${e}`);
        }
      }
      form.append(fieldWrapper);
    });

    if(!hasSubmit) {
      // temp: auto append a submit button
      fieldWrapper.append(createButton({label: 'Submit'}));
    }
  
    form.addEventListener('change', () => applyRules(form, rules));
    applyRules(form, rules);
  
    return (form);
  }
  
  export default async function decorate(block) {
    const form = block.querySelector('a[href$=".json"]');
    if (form) {
      if(form.innerText.startsWith('/')) {
        form.replaceWith(await createForm(`${window.location.origin}${form.innerText}`));
      } else if(form.innerText.startsWith('../') || form.innerText.startsWith('./')) {
        form.replaceWith(await createForm(`${form.baseURI}${form.innerText}`));
      } else {
        form.replaceWith(await createForm(form.href));
      }
    }
  }