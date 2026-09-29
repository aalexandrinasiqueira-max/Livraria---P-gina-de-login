/* ==========================================================
   LIVRARIA SENAI
   VALIDAÇÃO + PROTEÇÃO DOS DADOS
   ==========================================================

   IMPORTANTE:
   Este é um projeto FRONT-END.

   Em um sistema real, a autenticação deve ser feita no
   servidor usando HTTPS e uma função adequada para senhas,
   como Argon2id ou bcrypt.

   Aqui utilizamos:
   AES-256-GCM + PBKDF2-SHA-256
   para proteger os dados antes de gerar o arquivo.
   ========================================================== */

const form = document.getElementById("login");
const message = document.getElementById("message");

/* =========================================
   CAMPOS
   ========================================= */
const fields = {
    nome: document.getElementById("nome"),
    email: document.getElementById("email"),
    cpf: document.getElementById("cpf"),
    endereco: document.getElementById("endereco"),
    senha: document.getElementById("senha"),
    confirmarSenha: document.getElementById("confirmarSenha"),
    imagem: document.getElementById("imagem")
};

/* =========================================
   MENSAGENS DE ERRO
   ========================================= */
function setError(fieldName, text) {
    const input = fields[fieldName];
    const error = document.getElementById(`${fieldName}-error`);

    if (!input || !error) return;

    input.classList.toggle("invalid", Boolean(text));
    input.classList.toggle("valid", !text && input.value.trim() !== "");
    error.textContent = text || "";
}

/* =========================================
   MENSAGEM GERAL
   ========================================= */
function showMessage(text, type = "error") {
    message.textContent = text;
    message.className = `form-message show ${type}`;
}

/* =========================================
   CPF
   ========================================= */
function onlyDigits(value) {
    return value.replace(/\D/g, "");
}

function formatCPF(value) {
    const digits = onlyDigits(value).slice(0, 11);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `\({digits.slice(0, 3)}.\){digits.slice(3)}`;
    if (digits.length <= 9) return `\({digits.slice(0, 3)}.\){digits.slice(3, 6)}.${digits.slice(6)}`;

    return `\({digits.slice(0, 3)}.\){digits.slice(3, 6)}.\({digits.slice(6, 9)}-\){digits.slice(9)}`;
}

function isValidCPF(value) {
    const cpf = onlyDigits(value);

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    // PRIMEIRO DÍGITO
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += Number(cpf[i]) * (10 - i);
    }

    let digit1 = 11 - (sum % 11);
    if (digit1 >= 10) digit1 = 0;
    if (digit1 !== Number(cpf[9])) return false;

    // SEGUNDO DÍGITO
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += Number(cpf[i]) * (11 - i);
    }

    let digit2 = 11 - (sum % 11);
    if (digit2 >= 10) digit2 = 0;

    return digit2 === Number(cpf[10]);
}

fields.cpf.addEventListener("input", () => {
    fields.cpf.value = formatCPF(fields.cpf.value);
});

/* =========================================
   E-MAIL
   ========================================= */
function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/* =========================================
   SENHA
   ========================================= */
function getPasswordRules(value) {
    return {
        length: value.length >= 8 && value.length <= 72,
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        number: /\d/.test(value),
        symbol: /[^A-Za-z0-9\s]/.test(value),
        noSpaces: !/\s/.test(value)
    };
}

function isValidPassword(value) {
    const rules = getPasswordRules(value);
    return rules.length && rules.upper && rules.lower && rules.number && rules.symbol && rules.noSpaces;
}

/* =========================================
   BARRA DE FORÇA DA SENHA
   ========================================= */
function updatePasswordMeter() {
    const value = fields.senha.value;
    const rules = getPasswordRules(value);
    const score = Object.values(rules).filter(Boolean).length;
    const bar = document.getElementById("password-bar");

    bar.style.width = `${(score / 6) * 100}%`;
}

fields.senha.addEventListener("input", updatePasswordMeter);

/* =========================================
   IMAGEM
   ========================================= */
function isValidImage(file) {
    if (!file) return false;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    return allowedTypes.includes(file.type) && file.size <= maxSize;
}

/* =========================================
   VALIDAÇÃO COMPLETA
   ========================================= */
function validateForm() {
    let valid = true;

    /* NOME */
    if (fields.nome.value.trim().length < 3) {
        setError("nome", "Informe seu nome completo.");
        valid = false;
    } else {
        setError("nome", "");
    }

    /* EMAIL */
    if (!isValidEmail(fields.email.value.trim())) {
        setError("email", "Digite um e-mail válido, como voce@exemplo.com.");
        valid = false;
    } else {
        setError("email", "");
    }

    /* CPF */
    if (!isValidCPF(fields.cpf.value)) {
        setError("cpf", "Digite um CPF válido no formato 000.000.000-00.");
        valid = false;
    } else {
        setError("cpf", "");
    }

    /* ENDEREÇO */
    if (fields.endereco.value.trim().length < 5) {
        setError("endereco", "Informe um endereço válido.");
        valid = false;
    } else {
        setError("endereco", "");
    }

    /* SENHA */
    if (!isValidPassword(fields.senha.value)) {
        setError("senha", "Use 8–72 caracteres, incluindo maiúscula, minúscula, número e símbolo, sem espaços.");
        valid = false;
    } else {
        setError("senha", "");
    }

    /* CONFIRMAR SENHA */
    if (fields.confirmarSenha.value !== fields.senha.value || !fields.confirmarSenha.value) {
        setError("confirmarSenha", "As senhas precisam ser iguais.");
        valid = false;
    } else {
        setError("confirmarSenha", "");
    }

    /* IMAGEM */
    const file = fields.imagem.files[0];
    if (!isValidImage(file)) {
        setError("imagem", "Escolha uma imagem PNG, JPG ou WEBP de até 5 MB.");
        valid = false;
    } else {
        setError("imagem", "");
    }

    return valid;
}

/* =========================================
   MOSTRAR / OCULTAR SENHA
   ========================================= */
document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.target);
        const isPassword = input.type === "password";

        input.type = isPassword ? "text" : "password";
        button.textContent = isPassword ? "🙈" : "👁";
        button.setAttribute("aria-label", isPassword ? "Ocultar senha" : "Mostrar senha");
    });
});

/* =========================================
   CRIPTOGRAFIA
   ========================================= */
const encoder = new TextEncoder();

function bytesToBase64(bytes) {
    let binary = "";
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }

    return btoa(binary);
}

function arrayBufferToBase64(buffer) {
    return bytesToBase64(new Uint8Array(buffer));
}

async function deriveKey(password, salt) {
    const material = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 310000,
            hash: "SHA-256"
        },
        material,
        {
            name: "AES-GCM",
            length: 256
        },
        false,
        ["encrypt"]
    );
}

async function encryptData(data, password) {
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error("Seu navegador não oferece suporte à criptografia.");
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);

    const encrypted = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encoder.encode(JSON.stringify(data))
    );

    return {
        version: 1,
        algorithm: "AES-256-GCM",
        kdf: "PBKDF2-SHA-256",
        iterations: 310000,
        salt: arrayBufferToBase64(salt),
        iv: arrayBufferToBase64(iv),
        ciphertext: arrayBufferToBase64(encrypted),
        createdAt: new Date().toISOString()
    };
}

/* =========================================
   GERAR ARQUIVO
   ========================================= */
function downloadSecureFile(payload, name) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const safeName = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .toLowerCase();

    link.href = url;
    link.download = `cadastro_protegido_${safeName || "usuario"}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

/* =========================================
   ENVIO DO FORMULÁRIO
   ========================================= */
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.className = "form-message";

    if (!validateForm()) {
        showMessage("Revise os campos destacados antes de continuar.");
        return;
    }

    const submitButton = form.querySelector(".submit-button");
    submitButton.disabled = true;
    submitButton.style.opacity = ".7";
    submitButton.innerHTML = "Protegendo dados...";

    try {
        const file = fields.imagem.files[0];

        const dados = {
            nome: fields.nome.value.trim(),
            email: fields.email.value.trim().toLowerCase(),
            cpf: onlyDigits(fields.cpf.value),
            endereco: fields.endereco.value.trim(),
            imagem: {
                nome: file.name,
                tipo: file.type,
                tamanho: file.size
            }
        };

        const protectedData = await encryptData(dados, fields.senha.value);

        downloadSecureFile(protectedData, fields.nome.value);

        showMessage(
            "Cadastro validado e arquivo protegido gerado com sucesso. Guarde sua senha: sem ela, os dados criptografados não poderão ser recuperados.",
            "success"
        );

        form.reset();
        document.getElementById("password-bar").style.width = "0";

        document.querySelectorAll(".field input").forEach(input => {
            input.classList.remove("valid", "invalid");
        });

    } catch (error) {
        console.error(error);
        showMessage("Não foi possível proteger os dados. Verifique se está usando um navegador moderno.");
    } finally {
        submitButton.disabled = false;
        submitButton.style.opacity = "1";
        submitButton.innerHTML = 'Criar conta e proteger dados →';
    }
});