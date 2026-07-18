const busyButtons = new WeakSet();

export const setElementBusy = (element, busy) => {
  if (!element) return;
  element.toggleAttribute('aria-busy', busy);
  element.classList.toggle('is-processing', busy);
};

export const runWithButtonLock = async (button, task) => {
  if (button && busyButtons.has(button)) return null;
  const wasDisabled = button?.disabled === true;
  try {
    if (button) {
      busyButtons.add(button);
      button.disabled = true;
      setElementBusy(button, true);
    }
    return await task();
  } finally {
    if (button) {
      busyButtons.delete(button);
      button.disabled = wasDisabled;
      setElementBusy(button, false);
    }
  }
};

export const bindAsyncClick = (target, handler) => {
  target?.addEventListener('click', (event) => {
    event.preventDefault();
    runWithButtonLock(event.currentTarget, () => handler(event));
  });
};

export const setFormBusy = (form, busy) => {
  if (!form) return;
  setElementBusy(form, busy);
  form.querySelectorAll('button, input, select, textarea').forEach((element) => {
    if (busy) {
      element.dataset.wasDisabled = String(element.disabled === true);
      if (element.tagName === 'BUTTON') element.disabled = true;
      return;
    }
    if (element.dataset.wasDisabled === 'false') element.disabled = false;
    delete element.dataset.wasDisabled;
  });
};

export const submitWithFormLock = async (form, task) => {
  if (form?.dataset.busy === 'true') return null;
  try {
    if (form) {
      form.dataset.busy = 'true';
      setFormBusy(form, true);
    }
    return await task();
  } finally {
    if (form) {
      form.dataset.busy = 'false';
      setFormBusy(form, false);
    }
  }
};
