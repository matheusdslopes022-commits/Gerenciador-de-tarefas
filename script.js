let tarefas = [];
const button = document.getElementById("button");

function layoutTarefa(tarefa) {
    const div = document.getElementById("task-list");
    div.innerHTML = "";
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
    layoutTarefa(tarefa);
}

button.addEventListener("click", (e) => {
    e.preventDefault();
    

    const descricaoInput = document.getElementById("descricao");
    const categoriaInput = document.getElementById("categoria");
    const prioridadeInput = document.getElementById("prioridade");
    const dataInput = document.getElementById("data");


    const descricao = descricaoInput.value.trim();
    const categoria = categoriaInput.value.trim();
    const prioridade = prioridadeInput.value.trim();
    const data = dataInput.value.trim();


    if (!descricao || !categoria || !prioridade || !data) {
        alert("Por favor, preencha todos os campos antes de adicionar a tarefa!");
        return; 
    }

   
    criarTarefa(descricao, categoria, prioridade, data);


    descricaoInput.value = "";
    categoriaInput.value = "";
    prioridadeInput.value = "";
    dataInput.value = "";
});