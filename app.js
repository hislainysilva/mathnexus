// MATHNEXUS - primeira versão de testes
import {
    query,
    where,
    getDocs
}
from
"https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

window.salvarMissao = async function() {

    const campos = document.querySelectorAll(".campo");

    const questoes = [];

    questoes.push({
        numero: 1,
        pergunta: campos[4].value,
        A: campos[5].value,
        B: campos[6].value,
        C: campos[7].value,
        D: campos[8].value
    });

    document.querySelectorAll(".cardQuestao").forEach((card, index) => {
        questoes.push({
            numero: index + 2,
            pergunta: card.querySelector(".perguntaQuestao").value,
            A: card.querySelector(".altA").value,
            B: card.querySelector(".altB").value,
            C: card.querySelector(".altC").value,
            D: card.querySelector(".altD").value
        });
    });

    const missao = {
        codigo: campos[0].value,
        titulo: campos[1].value,
        turma: campos[2].value,
        tipo: campos[3].value,
        questoes: questoes,
        liberada: true,
        criadaEm: new Date()
    };

    if (!missao.codigo) {
        alert("Gere um código para a missão.");
        return;
    }

    await addDoc(collection(db, "missoes"), missao);

    localStorage.setItem("missaoAtual", JSON.stringify(missao));

    alert("Missão com várias questões salva com sucesso!");
}
window.liberarMissao = async function() {

    const missaoSalva = localStorage.getItem("missaoAtual");

    if (!missaoSalva) {
        alert("Crie e salve uma missão antes de liberar.");
        return;
    }

    const missao = JSON.parse(missaoSalva);
    missao.liberada = true;

    localStorage.setItem("missaoAtual", JSON.stringify(missao));

    alert("Missão liberada!");
}
window.entrarAluno = async function() {

    const campos =
        document.querySelectorAll(".campo");

    const codigo =
        campos[2].value.toUpperCase();

    const aluno = {

        nome: campos[0].value,

        turma: campos[1].value,

        codigo: codigo,

        avatar:
            localStorage.getItem("avatarAluno")
            || "😀",

        cor:
            localStorage.getItem("corAluno")
            || "azul"
    };

    if(
        !aluno.nome ||
        aluno.turma ===
        "Selecione sua turma" ||
        !codigo
    ){

        alert(
            "Preencha todos os campos."
        );

        return;
    }

    const consulta =
        query(
            collection(db,"missoes"),
            where(
                "codigo",
                "==",
                codigo
            )
        );

    const resultado =
        await getDocs(consulta);

    if(resultado.empty){

        alert(
            "Código da missão não encontrado."
        );

        return;
    }

    const missao =
        resultado.docs[0].data();

    localStorage.setItem(
        "alunoAtual",
        JSON.stringify(aluno)
    );

    localStorage.setItem(
        "missaoAtual",
        JSON.stringify(missao)
    );

    window.location.href =
        "missao-aluno.html";
}

window.selecionarAvatar = function(botao) {
    document.querySelectorAll(".avatar").forEach(a => {
        a.classList.remove("ativo");
    });

    botao.classList.add("ativo");
    localStorage.setItem("avatarAluno", botao.textContent);
}

window.selecionarCor = function(cor) {
    document.querySelectorAll(".cor").forEach(c => {
        c.classList.remove("ativa");
    });

    cor.classList.add("ativa");
    localStorage.setItem("corAluno", cor.classList[1]);
}

window.enviarResposta = async function(){
    const aluno = JSON.parse(
        localStorage.getItem("alunoAtual")
    );

    const missao = JSON.parse(
        localStorage.getItem("missaoAtual")
    );

    const resposta = document
        .getElementById("respostaAluno")
        .value;

    if(!resposta){
        alert("Escolha ou digite uma resposta.");
        return;
    }

    await addDoc(
        collection(db, "respostas"),
        {
            nome: aluno.nome,
            turma: aluno.turma,
            avatar: aluno.avatar,
            cor: aluno.cor,
            codigo: aluno.codigo,
            tituloMissao: missao.titulo,
            resposta: resposta,
            enviadaEm: new Date()
        }
    );

    alert("Resposta enviada com sucesso!");
}
window.gerarCodigoMissao = function() {
    
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

window.selecionarResposta = function(resposta){

    document
        .querySelectorAll(".alternativa")
        .forEach(botao => {
            botao.classList.remove(
                "selecionada"
            );
        });

    event.target.classList.add(
        "selecionada"
    );

    document
        .getElementById(
            "respostaAluno"
        )
        .value = resposta;
}

let contadorQuestoes = 1;

window.adicionarQuestao = function(){

    contadorQuestoes++;

    document
        .getElementById(
            "listaQuestoes"
        )
        .innerHTML += `

        <div class="cardQuestao">

            <h2>
                Questão ${contadorQuestoes}
            </h2>

            <textarea
                class="campo perguntaQuestao"
                placeholder="Digite a pergunta"
                rows="4">
            </textarea>

            <input
                type="text"
                class="campo altA"
                placeholder="Alternativa A">

            <input
                type="text"
                class="campo altB"
                placeholder="Alternativa B">

            <input
                type="text"
                class="campo altC"
                placeholder="Alternativa C">

            <input
                type="text"
                class="campo altD"
                placeholder="Alternativa D">

        </div>
    `;
}
