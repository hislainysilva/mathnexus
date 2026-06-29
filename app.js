// MATHNEXUS - primeira versão de testes
import { db } from "./firebase-config.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

async function salvarMissao() {
    const campos = document.querySelectorAll(".campo");

    const missao = {
        codigo: campos[0].value,
        titulo: campos[1].value,
        turma: campos[2].value,
        tipo: campos[3].value,
        pergunta: campos[4].value,
        alternativaA: campos[5].value,
        alternativaB: campos[6].value,
        alternativaC: campos[7].value,
        alternativaD: campos[8].value,
        liberada: false,
        criadaEm: new Date()
    };

    if (!missao.codigo) {
        alert("Gere um código para a missão.");
        return;
    }

    await addDoc(collection(db, "missoes"), missao);

    localStorage.setItem("missaoAtual", JSON.stringify(missao));

    alert("Missão salva no Firebase com sucesso!");
}

function liberarMissao() {
    const missaoSalva = localStorage.getItem("missaoAtual");

    if (!missaoSalva) {
        alert("Crie uma missão antes de liberar.");
        return;
    }

    const missao = JSON.parse(missaoSalva);
    missao.liberada = true;

    localStorage.setItem("missaoAtual", JSON.stringify(missao));

    alert("Missão liberada para os alunos!");
}

function entrarAluno() {

    const campos = document.querySelectorAll(".campo");

    const aluno = {

        nome: campos[0].value,

        turma: campos[1].value,

        codigo: campos[2].value.toUpperCase(),

        avatar: localStorage.getItem("avatarAluno") || "😀",

        cor: localStorage.getItem("corAluno") || "azul"

    };

    if (
        !aluno.nome ||
        aluno.turma === "Selecione sua turma" ||
        !aluno.codigo
    ) {

        alert(
            "Digite seu nome, selecione sua turma e informe o código da missão."
        );

        return;
    }

    localStorage.setItem(
        "alunoAtual",
        JSON.stringify(aluno)
    );

    window.location.href =
        "missao-aluno.html";
}

function selecionarAvatar(botao) {
    document.querySelectorAll(".avatar").forEach(a => {
        a.classList.remove("ativo");
    });

    botao.classList.add("ativo");
    localStorage.setItem("avatarAluno", botao.textContent);
}

function selecionarCor(cor) {
    document.querySelectorAll(".cor").forEach(c => {
        c.classList.remove("ativa");
    });

    cor.classList.add("ativa");
    localStorage.setItem("corAluno", cor.classList[1]);
}
function enviarResposta(){

    const aluno =
        JSON.parse(localStorage.getItem("alunoAtual"));

    const resposta =
        document.getElementById("respostaAluno").value;

    const respostas =
        JSON.parse(localStorage.getItem("respostas")) || [];

    respostas.push({
        nome: aluno.nome,
        turma: aluno.turma,
        resposta: resposta
    });

    localStorage.setItem(
        "respostas",
        JSON.stringify(respostas)
    );

    alert("Resposta enviada!");
}

function gerarCodigoMissao() {

    const prefixos = [
        "MATH",
        "ROB",
        "EXP",
        "NEXUS"
    ];

    const prefixo =
        prefixos[
            Math.floor(
                Math.random() *
                prefixos.length
            )
        ];

    const numero =
        Math.floor(
            1000 +
            Math.random() * 9000
        );

    const codigo =
        `${prefixo}-${numero}`;

    document.getElementById(
        "codigoMissao"
    ).value = codigo;

    document.getElementById(
        "codigoGerado"
    ).innerHTML =
        `🎯 Código da missão: <strong>${codigo}</strong>`;
}
