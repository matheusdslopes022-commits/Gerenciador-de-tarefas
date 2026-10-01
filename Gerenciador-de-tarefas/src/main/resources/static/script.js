const nome = prompt("Digite seu nome");
const spanNome = document.getElementById("nome");
spanNome.innerText = nome;

const API = "/api/tarefas";
let tarefas = []; 

const botaoAdicionar = document.getElementById("button");
const listaDeTarefas = document.querySelector(".task-list-empty");
const filtroSituacao = document.getElementById("filter-status");
const filtroCategoria = document.getElementById("filter-category");
const campoBusca = document.getElementById("busca");

// Guarda a mensagem "Nenhuma tarefa cadastrada" que já está no HTML
const htmlVazio = listaDeTarefas.innerHTML;


// Retorna a data de hoje
function dataDeHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return ano + "-" + mes + "-" + dia;
}

// Descobre se a tarefa está "concluida", "atrasada" ou "pendente"
function pegarSituacao(tarefa) {
    if (tarefa.concluida) {
        return "concluida";
    }
    if (tarefa.data < dataDeHoje()) {
        return "atrasada";
    }
    return "pendente";
}

// Tira a data do formato americano 2026-10-01 em 01/10/2026
function formatarData(data) {
    const partes = data.split("-"); // ["2026", "10", "01"]
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// Devolve só as tarefas que passam nos filtros e na busca
function filtrarTarefas() {
    const situacaoEscolhida = filtroSituacao.value;
    const categoriaEscolhida = filtroCategoria.value;
    const textoBusca = campoBusca.value.trim().toLowerCase();

    const resultado = [];

    for (const tarefa of tarefas) {
        // Filtro de situação
        if (situacaoEscolhida !== "todas" && pegarSituacao(tarefa) !== situacaoEscolhida) {
            continue;
        }
        // Filtro de categoria
        if (categoriaEscolhida !== "todas" && tarefa.categoria !== categoriaEscolhida) {
            continue;
        }
        // Busca pela descrição
        if (!tarefa.descricao.toLowerCase().includes(textoBusca)) {
            continue;
        }
        resultado.push(tarefa);
    }

    return resultado;
}



// Cria o card de uma tarefa
function criarCard(tarefa) {
    const situacao = pegarSituacao(tarefa);
    const nomesDaSituacao = { pendente: "Pendente", concluida: "Concluída", atrasada: "Atrasada" };

    const card = document.createElement("div");
    card.classList.add("task-card", "prioridade-" + tarefa.prioridade);
    if (situacao === "concluida") {
        card.classList.add("concluida");
    }

    // Estrutura do card (os textos são preenchidos abaixo, de forma segura)
    card.innerHTML = `
        <div class="task-card-content">
            <h3 class="task-title"></h3>
            <div class="task-tags">
                <span class="badge badge-status badge-${situacao}"></span>
                <span class="badge badge-category"></span>
                <span class="task-date"></span>
            </div>
        </div>
        <div class="task-actions">
            <button class="action-btn btn-concluir">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Concluir</span>
            </button>
            <button class="action-btn btn-excluir">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Excluir</span>
            </button>
        </div>
    `;

    card.querySelector(".task-title").textContent = tarefa.descricao;
    card.querySelector(".badge-status").textContent = nomesDaSituacao[situacao];
    card.querySelector(".badge-category").textContent = tarefa.categoria;
    card.querySelector(".task-date").textContent = formatarData(tarefa.data);

    card.querySelector(".btn-concluir").addEventListener("click", function () {
        concluirTarefa(tarefa.id);
    });
    card.querySelector(".btn-excluir").addEventListener("click", function () {
        excluirTarefa(tarefa.id);
    });

    return card;
}

// Desenha a lista de tarefas na tela
function mostrarTarefas() {
    atualizarDashboard();

    const lista = filtrarTarefas();

    // Nenhuma tarefa para mostrar
    if (lista.length === 0) {
        if (tarefas.length === 0) {
            listaDeTarefas.innerHTML = htmlVazio;
        } else {
            listaDeTarefas.innerHTML = "<h4>Nenhuma tarefa encontrada.</h4><p>Ajuste os filtros ou a busca.</p>";
        }
        return;
    }

    // Limpa a lista e coloca um card para cada tarefa
    listaDeTarefas.innerHTML = "";
    for (const tarefa of lista) {
        listaDeTarefas.appendChild(criarCard(tarefa));
    }
}

// Atualiza os números e as barrinhas dos 4 cards do topo
function atualizarDashboard() {
    let concluidas = 0;
    let atrasadas = 0;
    let pendentes = 0;

    for (const tarefa of tarefas) {
        const situacao = pegarSituacao(tarefa);
        if (situacao === "concluida") {
            concluidas++;
        } else if (situacao === "atrasada") {
            atrasadas++;
        } else {
            pendentes++;
        }
    }

    const total = tarefas.length;

    document.getElementById("num-total").textContent = total;
    document.getElementById("num-pendentes").textContent = pendentes;
    document.getElementById("num-concluidas").textContent = concluidas;
    document.getElementById("num-atrasadas").textContent = atrasadas;

    // Barras: porcentagem em relação ao total
    atualizarBarra("barra-total", total, total);
    atualizarBarra("barra-pendentes", pendentes, total);
    atualizarBarra("barra-concluidas", concluidas, total);
    atualizarBarra("barra-atrasadas", atrasadas, total);
}

function atualizarBarra(idDaBarra, valor, total) {
    let porcentagem = 0;
    if (total > 0) {
        porcentagem = (valor / total) * 100;
    }
    document.getElementById(idDaBarra).style.width = porcentagem + "%";
}



// Busca todas as tarefas no servidor
async function carregarTarefas() {
    try {
        const resposta = await fetch(API);
        tarefas = await resposta.json();
        mostrarTarefas();
    } catch (erro) {
        console.error("Erro ao carregar tarefas:", erro);
    }
}

// Envia uma nova tarefa. Retorna true se deu certo.
async function criarTarefa(novaTarefa) {
    try {
        const resposta = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novaTarefa)
        });

        if (!resposta.ok) {
            alert("Erro ao salvar a tarefa!");
            return false;
        }

        await carregarTarefas();
        return true;
    } catch (erro) {
        alert("Erro ao conectar com o servidor!");
        return false;
    }
}

// Marca a tarefa como concluída
async function concluirTarefa(id) {
    try {
        const resposta = await fetch(API + "/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ concluida: true })
        });

        if (!resposta.ok) {
            alert("Erro ao concluir a tarefa!");
            return;
        }

        await carregarTarefas();
    } catch (erro) {
        alert("Erro ao conectar com o servidor!");
    }
}

// Apaga a tarefa
async function excluirTarefa(id) {
    try {
        const resposta = await fetch(API + "/" + id, { method: "DELETE" });

        if (!resposta.ok) {
            alert("Erro ao excluir a tarefa!");
            return;
        }

        await carregarTarefas();
    } catch (erro) {
        alert("Erro ao conectar com o servidor!");
    }
}


// Marca o campo com borda vermelha e avisa o usuário
function mostrarErro(campo, mensagem) {
    alert(mensagem);
    campo.style.border = "2px solid red";
}

botaoAdicionar.addEventListener("click", async function (evento) {
    evento.preventDefault(); // não deixa a página recarregar

    const campoDescricao = document.getElementById("descricao");
    const campoCategoria = document.getElementById("categoria");
    const campoPrioridade = document.getElementById("prioridade");
    const campoData = document.getElementById("data");

    // Tira as bordas vermelhas de erros anteriores
    campoDescricao.style.border = "";
    campoCategoria.style.border = "";
    campoPrioridade.style.border = "";
    campoData.style.border = "";

    const descricao = campoDescricao.value.trim();

    // Confere se tudo foi preenchido
    if (descricao === "") {
        mostrarErro(campoDescricao, "Por favor, preencha a descrição!");
        return;
    }
    if (campoCategoria.value === "") {
        mostrarErro(campoCategoria, "Por favor, escolha a categoria!");
        return;
    }
    if (campoPrioridade.value === "") {
        mostrarErro(campoPrioridade, "Por favor, escolha a prioridade!");
        return;
    }
    if (campoData.value === "") {
        mostrarErro(campoData, "Por favor, escolha a data!");
        return;
    }

    const novaTarefa = {
        descricao: descricao,
        categoria: campoCategoria.value,
        prioridade: campoPrioridade.value,
        data: campoData.value,
        concluida: false
    };

    const deuCerto = await criarTarefa(novaTarefa);

    // Só limpa o formulário se a tarefa foi salva
    if (deuCerto) {
        campoDescricao.value = "";
        campoCategoria.value = "";
        campoPrioridade.value = "";
        campoData.value = "";
    }
});


// Quando o usuário mexe nos filtros ou digita na busca, redesenha a lista
filtroSituacao.addEventListener("change", mostrarTarefas);
filtroCategoria.addEventListener("change", mostrarTarefas);
campoBusca.addEventListener("input", mostrarTarefas);

// Ao abrir a página, carrega as tarefas
carregarTarefas();