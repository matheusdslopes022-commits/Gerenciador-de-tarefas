let tarefas = [];
const button = document.getElementById("button");
const API = "/api/tarefas";

const listaEl = document.querySelector(".task-list-empty");
const htmlVazio = listaEl ? listaEl.innerHTML : "";

const filtroStatus = document.getElementById("filter-status");
const filtroCategoria = document.getElementById("filter-category");
const campoBusca = document.getElementById("busca");

function hojeLocal() {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mes}-${dia}`;
}

function situacao(tarefa) {
    if (tarefa.concluida) return "concluida";
    if (tarefa.data && tarefa.data < hojeLocal()) return "atrasada";
    return "pendente";
}

function formatarData(data) {
    if (!data) return "";
    const [a, m, d] = data.split("-");
    return d && m && a ? `${d}/${m}/${a}` : data;
}

function tarefasFiltradas() {
    const status = filtroStatus ? filtroStatus.value : "todas";
    const categoria = filtroCategoria ? filtroCategoria.value : "todas";
    const termo = campoBusca ? campoBusca.value.trim().toLowerCase() : "";

    return tarefas.filter((t) => {
        if (status !== "todas" && situacao(t) !== status) return false;
        if (categoria !== "todas" && (t.categoria || "").toLowerCase() !== categoria.toLowerCase()) return false;
        if (termo && !(t.descricao || "").toLowerCase().includes(termo)) return false;
        return true;
    });
}

function layoutTarefa() {
    const div = document.querySelector(".task-list-empty");
    if (!div) {
        console.error("Elemento '.task-list-empty' não encontrado!");
        return;
    }

    atualizarDashboardCalculado(); // o dashboard sempre considera todas as tarefas

    const lista = tarefasFiltradas();

    if (lista.length === 0) {
        div.innerHTML = tarefas.length === 0
            ? htmlVazio
            : "<h4>Nenhuma tarefa encontrada.</h4><p>Ajuste os filtros ou a busca.</p>";
        return;
    }

    div.innerHTML = "";
    lista.forEach((tarefa) => {
        const card = document.createElement("div");
        card.classList.add("task-card");

        const idTarefa = tarefa.id || tarefa._id;
        const prioridadeClasse = (tarefa.prioridade || "baixa").toLowerCase();
        const estado = situacao(tarefa);
        card.classList.add(`prioridade-${prioridadeClasse}`);
        if (estado === "concluida") card.classList.add("concluida");

        const rotulo = { pendente: "Pendente", concluida: "Concluída", atrasada: "Atrasada" }[estado];

        card.innerHTML = `
            <div class="task-card-content">
                <h3 class="task-title">${escapeHtml(tarefa.descricao)}</h3>
                <div class="task-tags">
                    <span class="badge badge-status badge-${estado}">${rotulo}</span>
                    <span class="badge badge-category">${escapeHtml(tarefa.categoria)}</span>
                    <span class="task-date">${escapeHtml(formatarData(tarefa.data))}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn btn-concluir" data-acao="concluir">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Concluir</span>
                </button>
                <button class="action-btn btn-excluir" data-acao="excluir">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>Excluir</span>
                </button>
            </div>
        `;

        card.querySelector('[data-acao="concluir"]').addEventListener("click", () => concluirTarefa(idTarefa));
        card.querySelector('[data-acao="excluir"]').addEventListener("click", () => excluirTarefa(idTarefa));

        div.appendChild(card);
    });
}

function atualizarDashboardCalculado() {
    const total = tarefas.length;
    let concluidas = 0, pendentes = 0, atrasadas = 0;

    tarefas.forEach((t) => {
        const s = situacao(t);
        if (s === "concluida") concluidas++;
        else if (s === "atrasada") atrasadas++;
        else pendentes++;
    });

    atualizarDashboard(total, pendentes, concluidas, atrasadas);
}

function atualizarDashboard(total, pendentes, concluidas, atrasadas) {
    const definir = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    };
    definir("num-total", total);
    definir("num-pendentes", pendentes);
    definir("num-concluidas", concluidas);
    definir("num-atrasadas", atrasadas);

    // Barras em porcentagem do total (a de "total" fica sempre cheia quando há tarefas)
    const pct = (valor) => (total === 0 ? 0 : Math.round((valor / total) * 100));
    const barra = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.style.width = `${pct(valor)}%`;
    };
    barra("barra-total", total);
    barra("barra-pendentes", pendentes);
    barra("barra-concluidas", concluidas);
    barra("barra-atrasadas", atrasadas);
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
            body: JSON.stringify({ descricao, categoria, prioridade, data, concluida: false })
        });

        if (!resposta.ok) {
            const erroTexto = await resposta.text();
            console.error("Resposta do servidor:", resposta.status, erroTexto);
            alert("Erro ao salvar a tarefa! Status: " + resposta.status);
            return false;
        }
        await carregarTarefas();
        return true;
    } catch (erro) {
        console.error("Erro na requisição POST:", erro);
        alert("Erro ao conectar com o servidor!");
        return false;
    }
}

async function excluirTarefa(id) {
    if (!id || id === "undefined") return;

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

async function concluirTarefa(id) {
    if (!id || id === "undefined") return;

    try {
        const resposta = await fetch(`${API}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ concluida: true })
        });

        if (!resposta.ok) {
            alert("Erro ao finalizar tarefa!");
            return;
        }
        await carregarTarefas();
    } catch (erro) {
        console.error("Erro ao concluir tarefa:", erro);
    }
}

if (button) {
    button.addEventListener("click", async (e) => {
        e.preventDefault();

        const descricaoInput = document.getElementById("descricao");
        const categoriaInput = document.getElementById("categoria");
        const prioridadeInput = document.getElementById("prioridade");
        const dataInput = document.getElementById("data");

        [descricaoInput, categoriaInput, prioridadeInput, dataInput].forEach((input) => {
            if (input) input.style.border = "";
        });

        const descricao = descricaoInput ? descricaoInput.value.trim() : "";
        const categoria = categoriaInput ? categoriaInput.value.trim() : "";
        const prioridade = prioridadeInput ? prioridadeInput.value.trim() : "";
        const data = dataInput ? dataInput.value.trim() : "";

        if (!descricao) {
            alert("Por favor, preencha o campo de descrição!");
            if (descricaoInput) descricaoInput.style.border = "2px solid red";
            return;
        } else if (!categoria) {
            alert("Por favor, escolha sua categoria!");
            if (categoriaInput) categoriaInput.style.border = "2px solid red";
            return;
        } else if (!prioridade) {
            alert("Por favor, escolha a prioridade!");
            if (prioridadeInput) prioridadeInput.style.border = "2px solid red";
            return;
        } else if (!data) {
            alert("Por favor, digite a data!");
            if (dataInput) dataInput.style.border = "2px solid red";
            return;
        }

        // Só limpa o formulário se a tarefa foi realmente salva
        const salvou = await criarTarefa(descricao, categoria, prioridade, data);
        if (salvou) {
            descricaoInput.value = "";
            categoriaInput.value = "";
            prioridadeInput.value = "";
            dataInput.value = "";
        }
    });
}

[filtroStatus, filtroCategoria].forEach((el) => el && el.addEventListener("change", layoutTarefa));
if (campoBusca) campoBusca.addEventListener("input", layoutTarefa);

carregarTarefas();
