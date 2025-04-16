window.addEventListener("beforeunload", salvarDadosFormulario);

document.addEventListener("DOMContentLoaded", function () {
    carregarDadosFormulario();
    carregarDadosEdicao();
    configurarMascaras();
    configurarValidacoes();
    configurarEventosFormulario();
    configurarNavegacaoComEnter(); // Adiciona a navegação com Enter
});

// Função para salvar os dados do formulário no LocalStorage antes de sair da página
function salvarDadosFormulario() {
    const formData = new FormData(document.getElementById("cadastroForm"));
    const data = {};
    formData.forEach((value, key) => (data[key] = value));
    localStorage.setItem("formData", JSON.stringify(data));
}

// Função para carregar os dados do formulário do LocalStorage
function carregarDadosFormulario() {
    const savedData = JSON.parse(localStorage.getItem("formData"));
    if (savedData) {
        Object.keys(savedData).forEach((key) => {
            const input = document.getElementById(key);
            if (input) input.value = savedData[key];
        });
    }
}

// Função para carregar dados de edição do cliente
function carregarDadosEdicao() {
    const editCliente = JSON.parse(localStorage.getItem("editCliente"));
    if (editCliente) {
        Object.keys(editCliente).forEach((key) => {
            const input = document.getElementById(key);
            if (input) input.value = editCliente[key];
        });
    }
}

// Função para gerar um código único
function gerarCodigoUnico() {
    return Math.floor(Math.random() * 100000000000).toString().padStart(11, "0");
}

// Função para validar campos obrigatórios
function validarCamposObrigatorios() {
    const campos = document.querySelectorAll("#cadastroForm [required]");
    let valido = true;
    campos.forEach((campo) => {
        if (!campo.value.trim()) {
            campo.classList.add("erro");
            valido = false;
        } else {
            campo.classList.remove("erro");
        }
    });
    return valido;
}

// Função para configurar eventos do formulário
function configurarEventosFormulario() {
    const form = document.getElementById("cadastroForm");
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        if (!validarCamposObrigatorios()) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        const cpfInput = document.getElementById("cpf");
        console.log("CPF/CNPJ capturado:", cpfInput ? cpfInput.value : "Campo não encontrado"); // Adicionado aqui

        const cliente = {
            codigo: gerarCodigoUnico(),
            nome: document.getElementById("nome").value,
            email: document.getElementById("email").value,
            telefone: document.getElementById("telefone").value,
            endereco: document.getElementById("endereco").value,
            numero: document.getElementById("numero").value,
            cpf: cpfInput ? cpfInput.value : "", // Verifica se o elemento existe antes de acessar o valor
            servicos: [],
            produtos: [],
            inativo: false
        };

        salvarCliente(cliente);
        form.reset();
        limparCamposCustomizados();
        alert("Cadastro realizado com sucesso!");
        window.location.href = "registros.html";
    });
}

// Função para salvar ou editar cliente no LocalStorage
function salvarCliente(cliente) {
    let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const editIndex = localStorage.getItem("editIndex");

    if (editIndex !== null) {
        clientes[editIndex] = cliente;
        localStorage.removeItem("editIndex");
        localStorage.removeItem("editCliente");
    } else {
        clientes.push(cliente);
    }

    localStorage.setItem("clientes", JSON.stringify(clientes));
}

// Função para limpar campos personalizados
function limparCamposCustomizados() {
    ["cpf", "telefone", "email", "endereco", "cep"].forEach((id) => {
        const input = document.getElementById(id);
        if (input) input.value = "";
    });
}

// Função para configurar máscaras nos campos
function configurarMascaras() {
    const mascaras = {
        cpf: aplicarMascaraCPFCNPJ, // Aplica a máscara de CPF/CNPJ
        telefone: aplicarMascaraTelefone,
        cep: (value) =>
            value
                .replace(/\D/g, "")
                .replace(/^(\d{5})(\d)/, "$1-$2")
                .slice(0, 9),
        numero: aplicarMascaraSomenteNumeros
    };

    Object.keys(mascaras).forEach((id) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener("input", function (e) {
                e.target.value = mascaras[id](e.target.value);
            });
        }
    });

    document.getElementById("cep").addEventListener("blur", buscarEnderecoPorCEP);
}

// Função para buscar endereço pelo CEP
function buscarEnderecoPorCEP() {
    const cep = this.value.replace(/\D/g, "");
    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then((response) => response.json())
            .then((data) => {
                if (!data.erro) {
                    document.getElementById("endereco").value = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
                } else {
                    alert("CEP não encontrado.");
                }
            });
    }
}

// Função para configurar validações nos campos
function configurarValidacoes() {
    document.getElementById("email").addEventListener("input", function (e) {
        e.target.setCustomValidity(validarEmail(e.target.value) ? "" : "Email inválido");
    });

    document.querySelectorAll('input[type="number"]').forEach((input) => {
        input.addEventListener("keydown", bloquearCaracteresInvalidos);
        input.addEventListener("input", impedirNumerosNegativos);
    });
}

// Função para bloquear caracteres inválidos em campos numéricos
function bloquearCaracteresInvalidos(e) {
    if (["-", "e", "E"].includes(e.key)) {
        e.preventDefault();
    }
}

// Função para impedir números negativos
function impedirNumerosNegativos() {
    if (this.value < 0) {
        this.value = "";
    }
}

// Funções de máscara
function aplicarMascaraCPF(value) {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function aplicarMascaraTelefone(value) {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d{4})$/, "$1-$2");
}

function validarEmail(value) {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(value);
}

function aplicarMascaraSomenteNumeros(value) {
    return value.replace(/\D/g, ""); // Remove todos os caracteres que não são números
}

function aplicarMascaraCPFCNPJ(value) {
    value = value.replace(/\D/g, ""); // Remove todos os caracteres que não são números

    if (value.length <= 11) {
        // Aplica a máscara de CPF
        return value
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
        // Aplica a máscara de CNPJ
        return value
            .replace(/(\d{2})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{4})/, "$1/$2")
            .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }
}

// Função para configurar navegação com Enter
function configurarNavegacaoComEnter() {
    const inputs = document.querySelectorAll("#cadastroForm input, #cadastroForm select, #cadastroForm textarea");

    inputs.forEach((input, index) => {
        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault(); // Impede o comportamento padrão do Enter
                const nextInput = inputs[index + 1]; // Obtém o próximo campo
                if (nextInput) {
                    nextInput.focus(); // Move o foco para o próximo campo
                } else {
                    inputs[0].focus(); // Volta ao primeiro campo se for o último
                }
            }
        });
    });
}


