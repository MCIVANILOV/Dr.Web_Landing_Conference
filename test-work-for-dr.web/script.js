const form = document.getElementById('registrationForm');
const submitBtn = document.getElementById('submitBtn');
const agreement = document.getElementById('agreement');
const requiredInputs = form.querySelectorAll('input[required]');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const emailHint = document.getElementById('emailHint');

const formOverlay = document.getElementById('formOverlay');
const successPopup = document.getElementById('successPopup');
const errorPopup = document.getElementById('errorPopup');

const closeButtons = document.querySelectorAll('.close');

const successOkBtn = document.getElementById('successOkBtn');
const systemPopup = document.getElementById('systemPopup');
const systemOkBtn = document.getElementById('systemOkBtn')
const newEmailBtn = document.getElementById('newEmailBtn');
const supportBtn = document.getElementById('supportBtn');

const STORAGE_KEY = 'registeredEmails';

// ----------------------------------
// Работа с localStorage
// ----------------------------------
function getRegisteredEmails() {
    try {
        const emails = localStorage.getItem(STORAGE_KEY);
        return emails ? JSON.parse(emails) : [];
    } catch (error) {
        console.error('Ошибка чтения localStorage:', error);
        throw error;
    }
}

function saveRegisteredEmail(email) {
    try {
        const normalizedEmail = email.trim().toLowerCase();
        const emails = getRegisteredEmails();

        if (!emails.includes(normalizedEmail)) {
            emails.push(normalizedEmail);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
        }
    } catch (error) {
        console.error('Ошибка записи в localStorage:', error);
        throw error;
    }
}

function isEmailRegistered(email) {
    try {
        const normalizedEmail = email.trim().toLowerCase();
        const emails = getRegisteredEmails();
        return emails.includes(normalizedEmail);
    } catch (error) {
        console.error('Ошибка проверки email:', error);
        throw error;
    }
}

// ----------------------------------
// Показ / скрытие ошибок
// ----------------------------------
function showError(input, formGroup, message = 'Укажите данные') {
    input.classList.add('error');
    formGroup.classList.add('has-error');

    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function hideError(input, formGroup) {
    input.classList.remove('error');
    formGroup.classList.remove('has-error');

    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = 'Укажите данные';
    }
}

// ----------------------------------
// Валидация одного поля
// ----------------------------------
function validateField(input) {
    const formGroup = input.closest('.form-group');
    const value = input.value.trim();

    if (!formGroup) return true;

    if (!value) {
        showError(input, formGroup, 'Укажите данные');
        return false;
    }

    if (input.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showError(input, formGroup, 'Введите корректный e-mail');
            return false;
        }
    }

    if (input.id === 'phone') {
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length < 11) {
            showError(input, formGroup, 'Введите корректный номер');
            return false;
        }
    }

    hideError(input, formGroup);
    return true;
}

// ----------------------------------
// Валидация всех полей
// ----------------------------------
function validateAllFields() {
    let isValid = true;

    requiredInputs.forEach((input) => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    return isValid;
}

// ----------------------------------
// Проверка валидности формы для кнопки
// ----------------------------------
function checkFormValidity() {
    let isValid = true;

    requiredInputs.forEach((input) => {
        const value = input.value.trim();

        if (!value) {
            isValid = false;
            return;
        }

        if (input.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
            }
        }

        if (input.id === 'phone') {
            const digitsOnly = value.replace(/\D/g, '');
            if (digitsOnly.length < 11) {
                isValid = false;
            }
        }
    });

    if (isValid && agreement.checked) {
        submitBtn.classList.add('active');
        submitBtn.disabled = false;
    } else {
        submitBtn.classList.remove('active');
        submitBtn.disabled = true;
    }
}

// ----------------------------------
// Попапы
// ----------------------------------
function openPopup(type) {
    formOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';

    [successPopup, errorPopup, systemPopup].forEach(p => p.classList.remove('visible'));
    if (successPopup) successPopup.classList.remove('visible');
    if (errorPopup) errorPopup.classList.remove('visible');
    if (systemPopup) systemPopup.classList.remove('visible');

    // показываем нужный попап
    if (type === 'success' && successPopup) {
        successPopup.classList.add('visible');
    } else if (type === 'error' && errorPopup) {
        errorPopup.classList.add('visible');
    } else if (type === 'system' && systemPopup) {
        systemPopup.classList.add('visible');
    }

    // обновляем aria-hidden
    successPopup.setAttribute('aria-hidden', type==='success' ? 'false' : 'true');
    errorPopup.setAttribute('aria-hidden', type==='error' ? 'false' : 'true');
    systemPopup.setAttribute('aria-hidden', type==='system' ? 'false' : 'true');
}

function closePopups() {
    formOverlay.classList.remove('visible');
    document.body.style.overflow = ''; // вернуть прокрутку

    [successPopup, errorPopup, systemPopup].forEach(p => {
        p.classList.remove('visible');
        p.setAttribute('aria-hidden','true');
    });
}

// ----------------------------------
// Очистка формы
// ----------------------------------
function resetFormState() {
    form.reset();

    requiredInputs.forEach((input) => {
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            hideError(input, formGroup);
        }
    });

    emailHint.classList.remove('visible');
    submitBtn.classList.remove('active');
    submitBtn.disabled = true;
}

// ----------------------------------
// События полей
// ----------------------------------
requiredInputs.forEach((input) => {
    input.addEventListener('blur', function () {
        validateField(this);
        checkFormValidity();
    });

    input.addEventListener('focus', function () {
        const formGroup = this.closest('.form-group');
        if (formGroup) {
            hideError(this, formGroup);
        }
    });

    input.addEventListener('input', function () {
        checkFormValidity();
    });
});

// Подсказка для email
emailInput.addEventListener('focus', function () {
    emailHint.classList.add('visible');
});

// Чекбокс
agreement.addEventListener('change', checkFormValidity);

// ----------------------------------
// Маска телефона
// ----------------------------------
phoneInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length > 0 && (value[0] === '7' || value[0] === '8')) {
        value = value.substring(1);
    }

    let formatted = '';

    if (value.length > 0) {
        formatted = '+7 (' + value.substring(0, 3);
    }
    if (value.length >= 4) {
        formatted += ') ' + value.substring(3, 6);
    }
    if (value.length >= 7) {
        formatted += '-' + value.substring(6, 8);
    }
    if (value.length >= 9) {
        formatted += '-' + value.substring(8, 10);
    }

    e.target.value = formatted;
});

// ----------------------------------
// Submit формы
// ----------------------------------
form.addEventListener('submit', function (e) {
    e.preventDefault();

    try {
        const isFormValid = validateAllFields();

        if (!agreement.checked) {
            alert('Необходимо согласие на обработку персональных данных');
            return;
        }

        if (!isFormValid) {
            const firstError = form.querySelector('input.error');
            if (firstError) {
                firstError.focus();
            }
            return;
        }

        const emailValue = emailInput.value.trim().toLowerCase();

        // Проверка email через localStorage
        if (isEmailRegistered(emailValue)) {
            openPopup('error');
            return;
        }

        // Если email новый — сохраняем и показываем успех
        saveRegisteredEmail(emailValue);
        openPopup('success');

    } catch (error) {
        console.error('Ошибка при отправке формы:', error);
        openPopup('system');
    }
});

// ----------------------------------
// Кнопки popup
// ----------------------------------
successOkBtn.addEventListener('click', function () {
    closePopups();
    resetFormState();
});

systemOkBtn.addEventListener('click', function () {
    closePopups();
});

closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        closePopups();
        resetFormState();
    });
});

newEmailBtn.addEventListener('click', function () {
    closePopups();
    emailInput.focus();
});

supportBtn.addEventListener('click', function () {
    window.location.href = 'mailto:marketing@drweb.com?subject=Проблема с регистрацией';
});

// ----------------------------------
// Инициализация
// ----------------------------------
checkFormValidity();