document.addEventListener("DOMContentLoaded", function () {
    // Elementos do DOM
    const elementos = {
        pesquisaCliente: document.getElementById("pesquisaCliente"),
        clientesEncontrados: document.getElementById("clientesEncontrados"),
        codigoCliente: document.getElementById("codigoCliente"),
        nomeCliente: document.getElementById("nomeCliente"),
        nomeProduto: document.getElementById("nomeProduto"),
        descricaoProduto: document.getElementById("descricaoProduto"),
        precoProduto: document.getElementById("precoProduto"),
        registrarProduto: document.getElementById("registrarProduto"),
        produtosList: document.getElementById("produtosList"),
        mostrarAtivos: document.getElementById("mostrarAtivos"),
        mostrarInativos: document.getElementById("mostrarInativos"),
        pesquisaProduto: document.getElementById("pesquisaProduto"),
    };

    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

    // Atualiza o LocalStorage
    const atualizarLocalStorage = () => localStorage.setItem("clientes", JSON.stringify(clientes));

    // Limpa os campos do formulário
    const limparCampos = () => {
        elementos.nomeProduto.value = "";
        elementos.descricaoProduto.value = "";
        elementos.precoProduto.value = "";
        elementos.codigoCliente.value = "";
        elementos.nomeCliente.value = "";
        elementos.registrarProduto.textContent = "Registrar Produto"; // Restaura o texto do botão
        elementos.registrarProduto.onclick = registrarProduto; // Restaura o comportamento padrão
        elementos.registrarProduto.classList.remove("modo-edicao"); // Remove a classe de modo de edição
    };

    // Busca cliente e produto
    const buscarClienteEProduto = (clienteCodigo, index) => {
        const cliente = clientes.find((c) => c.codigo === clienteCodigo);
        if (!cliente || !cliente.produtos || !cliente.produtos[index]) {
            alert("Produto não encontrado!");
            return null;
        }
        return { cliente, produto: cliente.produtos[index] };
    };

    // Carrega produtos na tabela
    const carregarProdutos = () => {
        const query = elementos.pesquisaProduto.value.toLowerCase();
        const tbody = elementos.produtosList.querySelector("tbody");

        tbody.innerHTML = ""; // Limpa o conteúdo da tabela

        clientes.forEach((cliente) => {
            if (cliente.produtos && cliente.produtos.length > 0) {
                cliente.produtos.forEach((produto, index) => {
                    if (
                        (produto.nome.toLowerCase().includes(query) || cliente.codigo.includes(query)) &&
                        ((elementos.mostrarAtivos.checked && !produto.inativo) || (elementos.mostrarInativos.checked && produto.inativo))
                    ) {
                        const tr = document.createElement("tr");
                        tr.innerHTML = `
                            <td>${cliente.codigo}</td>
                            <td>${cliente.nome}</td>
                            <td>${produto.nome}</td>
                            <td>${produto.descricao || "Sem descrição"}</td>
                            <td>R$ ${parseFloat(produto.preco).toFixed(2)}</td>
                            <td class="acoes">
                                <button onclick="editarProduto('${cliente.codigo}', ${index})" class="editar">Editar</button>
                                <button onclick="excluirProduto('${cliente.codigo}', ${index})" class="excluir">Excluir</button>
                                <button onclick="inativarProduto('${cliente.codigo}', ${index})" class="inativar">${produto.inativo ? "Ativar" : "Inativar"}</button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    }
                });
            }
        });
    };

    // Função para registrar um novo produto
    const registrarProduto = () => {
        const nome = elementos.nomeProduto.value.trim();
        const descricao = elementos.descricaoProduto.value.trim();
        const preco = parseFloat(elementos.precoProduto.value.trim());

        if (!elementos.codigoCliente.value || !nome || isNaN(preco)) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }

        const cliente = clientes.find((c) => c.codigo === elementos.codigoCliente.value);
        if (!cliente) {
            alert("Cliente não encontrado!");
            return;
        }

        if (!cliente.produtos) cliente.produtos = [];

        cliente.produtos.push({
            nome,
            descricao: descricao || "Sem descrição",
            preco: preco.toFixed(2),
            inativo: false,
        });

        atualizarLocalStorage();
        limparCampos();
        carregarProdutos();
        alert("Produto registrado com sucesso!");
    };

    // Função para editar um produto existente
    window.editarProduto = (clienteCodigo, index) => {
        const { cliente, produto } = buscarClienteEProduto(clienteCodigo, index);
        if (!produto) return;

        // Preenche os campos do formulário com os dados do produto
        elementos.codigoCliente.value = cliente.codigo;
        elementos.nomeCliente.value = cliente.nome;
        elementos.nomeProduto.value = produto.nome;
        elementos.descricaoProduto.value = produto.descricao;
        elementos.precoProduto.value = produto.preco;

        // Atualiza o botão para salvar a edição
        elementos.registrarProduto.textContent = "Salvar Edição";

        // Remove todos os event listeners anteriores do botão
        const novoBotao = elementos.registrarProduto.cloneNode(true);
        elementos.registrarProduto.parentNode.replaceChild(novoBotao, elementos.registrarProduto);
        elementos.registrarProduto = novoBotao;

        // Adiciona o evento para salvar a edição
        elementos.registrarProduto.addEventListener("click", () => {
            salvarEdicaoProduto(clienteCodigo, index); // Chama a função para salvar a edição
        });

        // Adiciona uma classe para indicar que está em modo de edição (opcional, para estilização)
        elementos.registrarProduto.classList.add("modo-edicao");
    };

    // Função para salvar a edição de um produto
    const salvarEdicaoProduto = (clienteCodigo, index) => {
        const nome = elementos.nomeProduto.value.trim();
        const descricao = elementos.descricaoProduto.value.trim();
        const preco = parseFloat(elementos.precoProduto.value.trim());

        // Validação dos campos obrigatórios
        if (!elementos.codigoCliente.value || !nome || isNaN(preco)) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }

        // Busca o cliente pelo código
        const cliente = clientes.find((c) => c.codigo === clienteCodigo);
        if (!cliente) {
            alert("Cliente não encontrado!");
            return;
        }

        // Busca o produto pelo índice
        const produto = cliente.produtos[index];
        if (!produto) {
            alert("Produto não encontrado para edição!");
            return;
        }

        // Atualiza os dados do produto
        produto.nome = nome;
        produto.descricao = descricao || "Sem descrição";
        produto.preco = preco.toFixed(2); // Salva o preço formatado

        // Atualiza o LocalStorage e a tabela
        atualizarLocalStorage();
        limparCampos();
        carregarProdutos();
        alert("Produto editado com sucesso!");

        // Restaura o botão para o comportamento padrão de registro
        elementos.registrarProduto.textContent = "Registrar Produto";

        // Remove todos os event listeners anteriores do botão
        const novoBotao = elementos.registrarProduto.cloneNode(true);
        elementos.registrarProduto.parentNode.replaceChild(novoBotao, elementos.registrarProduto);
        elementos.registrarProduto = novoBotao;

        // Adiciona o evento para registrar um novo produto
        elementos.registrarProduto.addEventListener("click", registrarProduto);

        // Remove a classe de modo de edição (opcional, para estilização)
        elementos.registrarProduto.classList.remove("modo-edicao");
    };

    // Exclui um produto
    window.excluirProduto = (clienteCodigo, index) => {
        const { cliente, produto } = buscarClienteEProduto(clienteCodigo, index);
        if (!produto) return;

        if (confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"? Esta ação não pode ser desfeita.`)) {
            cliente.produtos.splice(index, 1);
            atualizarLocalStorage();
            carregarProdutos();
            alert("Produto excluído com sucesso!");
        }
    };

    // Inativa ou ativa um produto
    window.inativarProduto = (clienteCodigo, index) => {
        const { produto } = buscarClienteEProduto(clienteCodigo, index);
        if (!produto) return;

        const acao = produto.inativo ? "ativar" : "inativar";

        if (confirm(`Tem certeza que deseja ${acao} o produto "${produto.nome}"?`)) {
            produto.inativo = !produto.inativo;
            atualizarLocalStorage();
            carregarProdutos();
        }
    };

    // Aplica máscara de números positivos
    const aplicarMascaraNumerosPositivos = (value) => {
        value = value.replace(/[^0-9.]/g, ""); // Remove caracteres não numéricos
        const partes = value.split(".");
        if (partes.length > 2) {
            value = partes[0] + "." + partes.slice(1).join("");
        }
        if (value.startsWith("0") && !value.startsWith("0.")) {
            value = value.replace(/^0+/, "");
        }
        return value;
    };

    // Carrega clientes encontrados
    function carregarClientesEncontrados(query) {
        const clientesEncontrados = elementos.clientesEncontrados;
        clientesEncontrados.innerHTML = ""; // Limpa os resultados anteriores

        if (!query.trim()) return; // Não faz nada se a pesquisa estiver vazia

        // Filtra os clientes que correspondem à pesquisa e estão ativos
        const clientesFiltrados = clientes.filter(cliente =>
            (cliente.nome.toLowerCase().includes(query.toLowerCase()) || cliente.codigo.includes(query)) &&
            cliente.inativo === false // Garante que apenas clientes ativos sejam exibidos
        );

        if (clientesFiltrados.length === 0) {
            // Exibe uma mensagem se nenhum cliente ativo for encontrado
            const div = document.createElement("div");
            div.textContent = "Nenhum cliente ativo encontrado.";
            div.style.color = "#999";
            div.style.padding = "0.5rem";
            clientesEncontrados.appendChild(div);
            return;
        }

        // Exibe os clientes encontrados
        clientesFiltrados.forEach(cliente => {
            const div = document.createElement("div");
            div.className = "cliente-item"; // Adiciona uma classe para estilização
            div.textContent = `${cliente.codigo} - ${cliente.nome}`;
            div.style.cursor = "pointer";
            div.style.padding = "0.5rem";
            div.style.borderBottom = "1px solid #ccc";
            div.addEventListener("click", () => {
                // Preenche os campos do cliente selecionado
                elementos.codigoCliente.value = cliente.codigo;
                elementos.nomeCliente.value = cliente.nome;
                clientesEncontrados.innerHTML = ""; // Limpa os resultados após a seleção
            });
            clientesEncontrados.appendChild(div);
        });
    }

    // Eventos
    elementos.pesquisaCliente.addEventListener("input", () => carregarClientesEncontrados(elementos.pesquisaCliente.value));
    elementos.pesquisaProduto.addEventListener("input", carregarProdutos);
    elementos.mostrarAtivos.addEventListener("change", () => {
        elementos.mostrarInativos.checked = false;
        carregarProdutos();
    });
    elementos.mostrarInativos.addEventListener("change", () => {
        elementos.mostrarAtivos.checked = false;
        carregarProdutos();
    });
    elementos.registrarProduto.addEventListener("click", registrarProduto);
    elementos.precoProduto.addEventListener("input", function () {
        elementos.precoProduto.value = aplicarMascaraNumerosPositivos(elementos.precoProduto.value);
    });

    // Carrega os produtos ao carregar a página
    carregarProdutos();
});