import { collection, addDoc, query, where, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

/* =========================
   MISSÕES - PROFESSORA
========================= */

window.gerarCodigoMissao = function() {
    const prefixos = ["MATH", "ROB", "EXP", "NEXUS"];
    const prefixo = prefixos[Math.floor(Math.random() * prefixos.length)];
    const numero = Math.floor(1000 + Math.random() * 9000);
    const codigo = `${prefixo}-${numero}`;

    document.getElementById("codigoMissao").value = codigo;

    const codigoGerado = document.getElementById("codigoGerado");
    if (codigoGerado) {
        codigoGerado.innerHTML = `🎯 Código da missão: <strong>${codigo}</strong>`;
    }
};

let contadorQuestoes = 1;

window.adicionarQuestao = function() {
    contadorQuestoes++;

    document.getElementById("listaQuestoes").innerHTML += `
        <div class="cardQuestao">
            <h2>Questão ${contadorQuestoes}</h2>

            <textarea
                class="campo perguntaQuestao"
                placeholder="Digite a pergunta"
                rows="4"></textarea>

            <input type="text" class="campo altA" placeholder="Alternativa A">
            <input type="text" class="campo altB" placeholder="Alternativa B">
            <input type="text" class="campo altC" placeholder="Alternativa C">
            <input type="text" class="campo altD" placeholder="Alternativa D">
        </div>
    `;
};

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
};

window.liberarMissao = function() {
    const missaoSalva = localStorage.getItem("missaoAtual");

    if (!missaoSalva) {
        alert("Crie e salve uma missão antes de liberar.");
        return;
    }

    const missao = JSON.parse(missaoSalva);
    missao.liberada = true;

    localStorage.setItem("missaoAtual", JSON.stringify(missao));

    alert("Missão liberada!");
};

/* =========================
   ALUNO
========================= */

window.entrarAluno = async function() {
    const campos = document.querySelectorAll(".campo");

    const codigo = campos[2].value.toUpperCase();

    const aluno = {
        nome: campos[0].value,
        turma: campos[1].value,
        codigo: codigo,
        avatar: localStorage.getItem("avatarAluno") || "😀",
        cor: localStorage.getItem("corAluno") || "azul"
    };

    if (!aluno.nome || aluno.turma === "Selecione sua turma" || !codigo) {
        alert("Preencha todos os campos.");
        return;
    }

    const consulta = query(
        collection(db, "missoes"),
        where("codigo", "==", codigo)
    );

    const resultado = await getDocs(consulta);

    if (resultado.empty) {
        alert("Código da missão não encontrado.");
        return;
    }

    const missao = resultado.docs[0].data();

    localStorage.setItem("alunoAtual", JSON.stringify(aluno));
    localStorage.setItem("missaoAtual", JSON.stringify(missao));

    window.location.href = "missao-aluno.html";
};

window.selecionarAvatar = function(botao) {
    document.querySelectorAll(".avatar").forEach(a => {
        a.classList.remove("ativo");
    });

    botao.classList.add("ativo");
    localStorage.setItem("avatarAluno", botao.textContent);
};

window.selecionarCor = function(cor) {
    document.querySelectorAll(".cor").forEach(c => {
        c.classList.remove("ativa");
    });

    cor.classList.add("ativa");
    localStorage.setItem("corAluno", cor.classList[1]);
};

window.selecionarResposta = function(resposta) {
    document.querySelectorAll(".alternativa").forEach(botao => {
        botao.classList.remove("selecionada");
    });

    event.target.classList.add("selecionada");

    document.getElementById("respostaAluno").value = resposta;
};

window.enviarResposta = async function() {
    const aluno = JSON.parse(localStorage.getItem("alunoAtual"));
    const missao = JSON.parse(localStorage.getItem("missaoAtual"));

    const respostasMissao =
        JSON.parse(localStorage.getItem("respostasMissao")) || [];

    if (respostasMissao.length === 0) {
        alert("Nenhuma resposta encontrada.");
        return;
    }

    await addDoc(collection(db, "respostas"), {
        nome: aluno.nome,
        turma: aluno.turma,
        avatar: aluno.avatar,
        cor: aluno.cor,
        codigo: aluno.codigo,
        tituloMissao: missao.titulo,
        resposta: respostasMissao,
        enviadaEm: new Date()
    });

    localStorage.removeItem("respostasMissao");

    alert("Missão concluída! Respostas enviadas com sucesso.");
};

/* =========================
   PAINEL DA PROFESSORA
========================= */

window.abrirPainel = function() {
    const campoCodigo = document.getElementById("codigoPainel");

    if (!campoCodigo) {
        alert("Campo de código não encontrado.");
        return;
    }

    const codigo = campoCodigo.value.toUpperCase();

    if (!codigo) {
        alert("Digite o código da missão.");
        return;
    }

    const consulta = query(
        collection(db, "respostas"),
        where("codigo", "==", codigo)
    );

    onSnapshot(consulta, snapshot => {
        let html = "";

        document.getElementById("totalParticipantes").innerHTML = snapshot.size;
        document.getElementById("totalRespostas").innerHTML = snapshot.size;

        if (snapshot.empty) {
            html = `
                <p class="subtitle">
                    Nenhuma resposta recebida ainda.
                </p>
            `;
        }

        const alunosUnicos = {};

snapshot.forEach(doc => {
    const r = doc.data();

    const chave = `${r.nome}_${r.turma}`.toLowerCase();

    alunosUnicos[chave] = r;
});

const listaAlunos = Object.values(alunosUnicos);

document.getElementById("totalParticipantes").innerHTML =
    listaAlunos.length;

document.getElementById("totalRespostas").innerHTML =
    snapshot.size;

listaAlunos.forEach(r => {

    let respostaTexto = "";

    if (Array.isArray(r.resposta)) {
        respostaTexto = r.resposta
            .map(item => {
                return `<p><strong>Questão ${item.questao}:</strong> ${item.resposta}</p>`;
            })
            .join("");
    } else {
        respostaTexto = `
            <div class="respostaPainel">
                ${r.resposta}
            </div>
        `;
    }

    html += `
        <div class="cardResposta">

            <div class="avatarPainel">
                ${r.avatar}
            </div>

            <h2>${r.nome}</h2>

            <div class="turmaPainel">
                ${r.turma}
            </div>

            <div class="missaoPainel">
                ${r.tituloMissao}
            </div>

            ${respostaTexto}

        </div>
    `;
});

        document.getElementById("painelRespostas").innerHTML = html;
    });
};
