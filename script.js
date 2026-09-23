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
    const descricao = document.getElementById("descricao");
    const categoria = document.getElementById("categoria");
    const prioridade = document.getElementById("prioridade");
    const data = document.getElementById("data");


    criarTarefa(descricao.value, categoria.value, prioridade.value, data.value);


});


