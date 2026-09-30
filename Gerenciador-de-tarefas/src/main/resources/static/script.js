let tarefas = [];
const button = document.getElementById("button");
const API = "/api/tarefas";

// Guarda o conteúdo original do HTML (ícone + "Nenhuma tarefa cadastrada.")
const listaEl = document.querySelector(".task-list-empty");
const htmlVazio = listaEl ? listaEl.innerHTML : "";

function layoutTarefa() {
    const div = document.querySelector(".task-list-empty");

    if (!div) {
        console.error("Elemento '.task-list-empty' não encontrado!");
        return;
    }

    // Sem tarefas: mostra o que já existe no HTML
    if (tarefas.length === 0) {
        div.innerHTML = htmlVazio;
        return;
    }

    div.innerHTML = "";
    tarefas.forEach((tarefa) => {
        const card = document.createElement("div");
        card.classList.add("task-card");

        // borda de prioridade
        const prioridadeClasse = (tarefa.prioridade || "baixa");
        card.classList.add(`prioridade-${prioridadeClasse}`);

        card.innerHTML = `
            <div class="task-card-content">
                <h3 class="task-title">${tarefa.descricao}</h3>
                <div class="task-tags">
                    <span class="badge badge-status">${tarefa.prioridade || 'Pendente'}</span>
                    <span class="badge badge-category">${tarefa.categoria}</span>
                    <span class="task-date">${tarefa.data}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn btn-concluir" onclick="concluirTarefa('${tarefa.id}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Concluir</span>
                </button>
                <button class="action-btn btn-excluir" onclick="excluirTarefa('${tarefa.id}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>Excluir</span>
                </button>
            </div>
        `;

        div.appendChild(card);
    });
}

async function carregarTarefas() {
    try {
        const resposta = await fetch(API);
        if (!resposta.ok) throw new Error("Status " + resposta.status);
        tarefas = await resposta.json();
        layoutTarefa();
    } catch (erro) {
        console.error("Erro ao carregar tarefas:", erro);
    }
}

async function criarTarefa(descricao, categoria, prioridade, data) {
    try {
        const resposta = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descricao, categoria, prioridade, data })
        });

        if (!resposta.ok) {
            alert("Erro ao salvar a tarefa!");
            return;
        }
        await carregarTarefas();
    } catch (erro) {
        console.error("Erro ao criar tarefa:", erro);
        alert("Erro ao salvar a tarefa!");
    }
}

async function excluirTarefa(id) {
    try {
        const resposta = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (!resposta.ok) {
            alert("Erro ao excluir a tarefa!");
            return;
        }
        await carregarTarefas();
    } catch (erro) {
        console.error("Erro ao excluir tarefa:", erro);
        alert("Erro ao excluir a tarefa!");
    }
}

function concluirTarefa(id) {
    alert("Tarefa concluída com sucesso!");
}

button.addEventListener("click", (e) => {
    e.preventDefault();

    const descricaoInput = document.getElementById("descricao");
    const categoriaInput = document.getElementById("categoria");
    const prioridadeInput = document.getElementById("prioridade");
    const dataInput = document.getElementById("data");

    // Limpa bordas vermelhas antes da validação
    [descricaoInput, categoriaInput, prioridadeInput, dataInput].forEach(input => {
        if (input) input.style.border = "";
    });

    const descricao = descricaoInput.value.trim();
    const categoria = categoriaInput.value.trim();
    const prioridade = prioridadeInput.value.trim();
    const data = dataInput.value.trim();

    if (!descricao) {
        alert("Por favor, preencha o campo de descrição!");
        descricaoInput.style.border = "2px solid red";
        return;
    } else if (!categoria) {
        alert("Por favor, Escolha sua categoria!");
        categoriaInput.style.border = "2px solid red";
        return;
    } else if (!prioridade) {
        alert("Por favor, Escolha a prioridade!");
        prioridadeInput.style.border = "2px solid red";
        return;
    } else if (!data) {
        alert("Por favor, Digite a data!");
        dataInput.style.border = "2px solid red";
        return;
    }

    criarTarefa(descricao, categoria, prioridade, data);

    // Reseta o formulário
    descricaoInput.value = "";
    categoriaInput.value = "";
    prioridadeInput.value = "";
    dataInput.value = "";
});

// Carrega as tarefas do banco ao abrir a página
carregarTarefas();