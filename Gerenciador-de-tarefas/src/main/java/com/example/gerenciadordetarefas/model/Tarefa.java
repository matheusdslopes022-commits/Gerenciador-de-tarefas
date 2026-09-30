package com.example.gerenciadordetarefas.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "tarefas")
public class Tarefa {

    @Id
    private String id;
    private String descricao;
    private String categoria;
    private String prioridade;
    private String data;

    public Tarefa() {}

    public Tarefa(String descricao, String categoria, String prioridade, String data) {
        this.descricao = descricao;
        this.categoria = categoria;
        this.prioridade = prioridade;
        this.data = data;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getPrioridade() { return prioridade; }
    public void setPrioridade(String prioridade) { this.prioridade = prioridade; }

    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
}