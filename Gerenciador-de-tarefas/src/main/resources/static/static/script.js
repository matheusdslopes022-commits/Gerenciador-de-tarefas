let tarefas = [];
const button = document.getElementById("button");

function layoutTarefa() {
    const div = document.querySelector(".task-list-empty");
    console.log("Elemento capturado:", div);

    if (!div) {
        console.error("Elemento '.task-list-empty' não encontrado!");
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
                <button class="action-btn btn-concluir" onclick="concluirTarefa(${tarefa.id})">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Concluir</span>
                </button>
                <button class="action-btn btn-excluir" onclick="excluirTarefa(${tarefa.id})">
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

function criarTarefa(descricao, categoria, prioridade, data) {
    const tarefa = {
        id: Date.now(),
        descricao: descricao,
        categoria: categoria,
        prioridade: prioridade,
        data: data
    };

    tarefas.push(tarefa);
    console.log("Lista de tarefas atualizada:", tarefas);
    layoutTarefa();
}

// Funções para manipular ações dos botões
function excluirTarefa(id) {
    tarefas = tarefas.filter(t => t.id !== id);
    layoutTarefa();
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

    // Limpa bordas vermelhas antes da validação (incluído dataInput no reset)
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