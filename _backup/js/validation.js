// ─── FORM VALIDATION ─────────────────────────────────────────────
const VALIDATION_RULES = {
  nombre: {
    validate: v => v.trim().length >= 2,
    error: 'Ingresá tu nombre (mín. 2 caracteres)'
  },
  tel: {
    validate: v => /^\+?\d{8,15}$/.test(v.replace(/[\s\-()]/g, '')),
    error: 'Ingresá un teléfono válido (8-15 dígitos)'
  },
  dir: {
    validate: v => v.trim().length >= 5,
    error: 'Ingresá una dirección válida'
  }
};

function validateField(fieldId, rules) {
  const input = document.getElementById(fieldId);
  if (!input) return true;
  const val = input.value;
  const isValid = rules.validate(val);
  const existingError = input.parentElement.querySelector('.field-error');
  if (existingError) existingError.remove();
  if (!isValid && val.length > 0) {
    input.classList.add('invalid');
    const errEl = document.createElement('div');
    errEl.className = 'field-error';
    errEl.textContent = rules.error;
    errEl.style.cssText = 'font-size:11px;color:#FF416C;margin-top:4px;font-weight:600;';
    input.parentElement.appendChild(errEl);
  } else {
    input.classList.remove('invalid');
  }
  return isValid;
}

function validateForm() {
  const nombreOk = validateField('fNombre', VALIDATION_RULES.nombre);
  const telOk = validateField('fTel', VALIDATION_RULES.tel);
  const dirOk = deliveryMode !== 'delivery' || validateField('fDir', VALIDATION_RULES.dir);
  return nombreOk && telOk && dirOk;
}

function validatePhone(val) {
  const input = document.getElementById('fTel');
  const status = document.getElementById('phoneValidationStatus');
  if (!input || !status) return;

  const cleanVal = val.replace(/[\s\-()]/g, '');
  const numbersOnly = cleanVal.replace(/\D/g, '');
  const isValid = numbersOnly.length >= 8 && numbersOnly.length <= 15;

  if (isValid) {
    input.classList.add('valid');
    status.classList.add('valid');
    status.textContent = '✓';
  } else {
    input.classList.remove('valid');
    status.classList.remove('valid');
    status.textContent = '';
  }
  validateField('fTel', VALIDATION_RULES.tel);
}

function validateName(val) {
  validateField('fNombre', VALIDATION_RULES.nombre);
}

function validateDir(val) {
  if (deliveryMode === 'delivery') {
    validateField('fDir', VALIDATION_RULES.dir);
  }
}

function setPaymentMethod(method) {
  paymentMethod = method;

  const payPills = document.querySelectorAll('.pay-pill');
  payPills.forEach(pill => pill.classList.remove('active'));

  const selectedBtn = document.getElementById(method === 'cash' ? 'payCash' : 'payTransfer');
  if (selectedBtn) selectedBtn.classList.add('active');

  const changeSection = document.getElementById('cashChangeSection');
  if (changeSection) {
    if (method === 'cash') {
      changeSection.classList.remove('hidden');
    } else {
      changeSection.classList.add('hidden');
      const changeInput = document.getElementById('fCashChange');
      if (changeInput) changeInput.value = '';
      cashChange = '';
    }
  }

  const transferSection = document.getElementById('transferInfoSection');
  if (transferSection) {
    transferSection.style.display = method === 'transfer' ? 'block' : 'none';
  }
}

function updateCashChange(val) {
  cashChange = val.trim();
}

function copyToClipboard(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.select();
  input.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(input.value).then(() => {
    const btn = input.parentElement.querySelector('.copy-btn');
    if (btn) {
      btn.textContent = '✅';
      setTimeout(() => { btn.textContent = '📋'; }, 2000);
    }
  }).catch(() => {});
}
