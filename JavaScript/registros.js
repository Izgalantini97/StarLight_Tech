document.addEventListener("DOMContentLoaded", function () {
    const clientesList = document.getElementById("clientesList");
    const mostrarInativos = document.getElementById("mostrarInativos");
    const mostrarAtivos = document.getElementById("mostrarAtivos");
    const pesquisaCliente = document.getElementById("pesquisaCliente");

    // Corrige os dados no localStorage para usar apenas a propriedade 'inativo'
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    clientes.forEach(cliente => {
        if (cliente.ativo !== undefined) {
            cliente.inativo = !cliente.ativo; // Converte 'ativo' para 'inativo'
            delete cliente.ativo; // Remove a propriedade 'ativo'
        }
    });
    localStorage.setItem("clientes", JSON.stringify(clientes));

    // Função para carregar os clientes na tabela
    function carregarClientes() {
        const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
        const query = pesquisaCliente.value.toLowerCase();
        clientesList.innerHTML = "";

        if (clientes.length === 0) {
            clientesList.innerHTML = "<p>Nenhum cliente cadastrado.</p>";
            return;
        }

        const table = criarTabelaClientes(clientes, query);
        clientesList.appendChild(table);

        // Atualiza o LocalStorage
        localStorage.setItem("clientes", JSON.stringify(clientes));
    }

    // Função para criar a tabela de clientes
    function criarTabelaClientes(clientes, query) {
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>CPF/CNPJ</th>
                <th>Endereço</th>
                <th>Ações</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        clientes.forEach((cliente, index) => {
            // Garante que a propriedade 'inativo' esteja definida
            if (cliente.inativo === undefined) cliente.inativo = false;

            // Filtra clientes com base na pesquisa e no estado ativo/inativo
            if (
                (cliente.nome.toLowerCase().includes(query) || cliente.codigo.includes(query)) &&
                ((mostrarAtivos.checked && !cliente.inativo) || (mostrarInativos.checked && cliente.inativo))
            ) {
                const tr = criarLinhaCliente(cliente, index);
                tbody.appendChild(tr);
            }
        });
        table.appendChild(tbody);
        return table;
    }

    // Função para criar uma linha da tabela de clientes
    function criarLinhaCliente(cliente, index) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${cliente.codigo}</td>
            <td>${cliente.nome}</td>
            <td>${cliente.email}</td>
            <td>${cliente.telefone}</td>
            <td>${cliente.cpf}</td>
            <td>${cliente.endereco}</td>
            <td>
                <button class="editar" data-index="${index}">Editar</button>
                <button class="inativar" data-index="${index}">${cliente.inativo ? "Ativar" : "Inativar"}</button>
                <button class="excluir" data-index="${index}">Excluir</button>
                <button class="detalhes" data-index="${index}">Detalhes</button>
            </td>
        `;
        if (cliente.inativo) tr.classList.add("inativo");

        // Adiciona eventos aos botões
        tr.querySelector(".editar").addEventListener("click", () => editarCliente(index));
        tr.querySelector(".inativar").addEventListener("click", () => inativarCliente(index));
        tr.querySelector(".excluir").addEventListener("click", () => excluirCliente(index));
        tr.querySelector(".detalhes").addEventListener("click", () => abrirModalDetalhes(cliente));

        return tr;
    }

    // Função para gerar um código único
    function gerarCodigoUnico(clientes) {
        let codigo;
        do {
            codigo = Math.floor(Math.random() * 100000000000).toString().padStart(11, "0");
        } while (clientes.some(cliente => cliente.codigo === codigo));
        return codigo;
    }

    // Função para editar um cliente
    function editarCliente(index) {
        const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
        const cliente = clientes[index];
        localStorage.setItem("editIndex", index);
        localStorage.setItem("editCliente", JSON.stringify(cliente));
        window.location.href = "index.html";
    }

    // Função para inativar ou ativar um cliente
    function inativarCliente(index) {
        const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
        const cliente = clientes[index];
        const acao = cliente.inativo ? "ativar" : "inativar";

        if (confirm(`Tem certeza que deseja ${acao} o cliente "${cliente.nome}"?`)) {
            cliente.inativo = !cliente.inativo;
            localStorage.setItem("clientes", JSON.stringify(clientes));
            carregarClientes();
        }
    }

    // Função para excluir um cliente
    function excluirCliente(index) {
        const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
        const cliente = clientes[index];

        if (confirm(`Tem certeza que deseja excluir o cliente "${cliente.nome}"? Esta ação não pode ser desfeita.`)) {
            clientes.splice(index, 1);
            localStorage.setItem("clientes", JSON.stringify(clientes));
            carregarClientes();
        }
    }

    // Função para abrir o modal de detalhes do cliente
    function abrirModalDetalhes(cliente) {
        const modal = document.getElementById("modalDetalhes");
        const detalhesCliente = document.getElementById("detalhesCliente");

        // Preenche os detalhes do cliente dinamicamente
        detalhesCliente.innerHTML = `
            <div class="info-group">
                <span>Código:</span>
                <p>${cliente.codigo}</p>
            </div>
            <div class="info-group">
                <span>Nome:</span>
                <p>${cliente.nome}</p>
            </div>
            <div class="info-group">
                <span>Email:</span>
                <p>${cliente.email}</p>
            </div>
            <div class="info-group">
                <span>Telefone:</span>
                <p>${cliente.telefone}</p>
            </div>
            <div class="info-group">
                <span>CPF/CNPJ:</span>
                <p>${cliente.cpf}</p>
            </div>
            <div class="info-group">
                <span>Endereço:</span>
                <p>${cliente.endereco}</p>
            </div>
            <div class="info-group">
                <span>Status:</span>
                <p>${cliente.inativo ? "Inativo" : "Ativo"}</p>
            </div>
        `;

        // Exibe o modal
        modal.style.display = "block";

        // Fecha o modal ao clicar no botão de fechar
        const closeModal = modal.querySelector(".close");
        closeModal.addEventListener("click", () => {
            modal.style.display = "none";
        });

        // Fecha o modal ao clicar fora do conteúdo
        window.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    }

    // Eventos para alternar entre clientes ativos e inativos
    function configurarFiltros() {
        mostrarInativos.addEventListener("change", () => {
            mostrarAtivos.checked = !mostrarInativos.checked;
            carregarClientes();
        });

        mostrarAtivos.addEventListener("change", () => {
            mostrarInativos.checked = !mostrarAtivos.checked;
            carregarClientes();
        });
    }

    // Evento para pesquisa de clientes
    pesquisaCliente.addEventListener("input", carregarClientes);

    // Inicialização
    configurarFiltros();
    carregarClientes();
});




