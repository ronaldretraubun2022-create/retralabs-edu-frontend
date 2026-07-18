export const required = (value, label) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${label} wajib diisi.`;
  }
  return '';
};

export const minLength = (value, min, label) => {
  if (String(value || '').trim().length < min) {
    return `${label} minimal ${min} karakter.`;
  }
  return '';
};

export const maxLength = (value, max, label) => {
  if (String(value || '').trim().length > max) {
    return `${label} maksimal ${max} karakter.`;
  }
  return '';
};

export const email = (value, label = 'Email') => {
  const text = String(value || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return `${label} tidak valid.`;
  return '';
};

export const sanitizeText = (value, max = 5000) =>
  String(value ?? '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .trim()
    .slice(0, max);

export const validateForm = (form, rules) => {
  const errors = {};
  const data = Object.fromEntries([...new FormData(form).entries()].map(([key, value]) => [key, sanitizeText(value)]));

  Object.entries(rules).forEach(([field, validators]) => {
    const list = Array.isArray(validators) ? validators : [validators];
    for (const validator of list) {
      const message = validator(data[field], data);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  });

  return { isValid: Object.keys(errors).length === 0, errors, data };
};

export const renderErrors = (form, errors = {}) => {
  form.querySelectorAll('[data-error-for]').forEach((element) => {
    const field = element.dataset.errorFor;
    element.textContent = errors[field] || '';
  });

  form.querySelectorAll('[name]').forEach((field) => {
    field.classList.toggle('border-rose-500', Boolean(errors[field.name]));
    field.setAttribute('aria-invalid', Boolean(errors[field.name]));
  });
};
