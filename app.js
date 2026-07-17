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

    const novaQuestao = `
        <div class="cardQuestao">
            <h2>Questão ${contadorQuestoes}</h2>

            <textarea class="campo perguntaQuestao" placeholder="Digite a pergunta" rows="4"></textarea>

            <input type="text" class="campo altA" placeholder="Alternativa A">
            <input type="text" class="campo altB" placeholder="Alternativa B">
            <input type="text" class="campo altC" placeholder="Alternativa C">
            <input type="text" class="campo altD" placeholder="Alternativa D">

            <select class="campo gabaritoQuestao">
                <option value="">Resposta correta</option>
                <option value="A">Alternativa A</option>
                <option value="B">Alternativa B</option>
                <option value="C">Alternativa C</option>
                <option value="D">Alternativa D</option>
            </select>
        </div>
    `;

    document
        .getElementById("listaQuestoes")
        .insertAdjacentHTML("beforeend", novaQuestao);
};

window.salvarMissao = async function() {
    const codigo = document.getElementById("codigoMissao").value;
    const titulo = document.getElementById("tituloMissaoCriar").value;
    const turma = document.getElementById("turmaMissaoCriar").value;
    const tipo = document.getElementById("tipoMissaoCriar").value;

    const questoes = [];

    questoes.push({
        numero: 1,
        pergunta: document.getElementById("perguntaPrincipal").value,
        A: document.getElementById("alternativaA").value,
        B: document.getElementById("alternativaB").value,
        C: document.getElementById("alternativaC").value,
        D: document.getElementById("alternativaD").value,
        correta: document.getElementById("gabaritoPrincipal").value
    });

    document.querySelectorAll(".cardQuestao").forEach((card, index) => {
        if (index === 0) return;

        questoes.push({
            numero: index + 1,
            pergunta: card.querySelector(".perguntaQuestao").value,
            A: card.querySelector(".altA").value,
            B: card.querySelector(".altB").value,
            C: card.querySelector(".altC").value,
            D: card.querySelector(".altD").value,
            correta: card.querySelector(".gabaritoQuestao").value
        });
    });

    const missao = {
        codigo,
        titulo,
        turma,
        tipo,
        questoes,
        liberada: true,
        criadaEm: new Date()
    };

    if (!codigo) {
        alert("Gere um código para a missão.");
        return;
    }

    if (!titulo) {
        alert("Digite o título da missão.");
        return;
    }

    if (questoes.some(q => !q.pergunta || !q.A || !q.B || !q.C || !q.D || !q.correta)) {
        alert("Preencha todas as perguntas, alternativas e o gabarito.");
        return;
    }

    await addDoc(collection(db, "missoes"), missao);

    localStorage.setItem("missaoAtual", JSON.stringify(missao));

    alert("Missão salva com sucesso!");
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

window.selecionarResposta = function(resposta, alternativa) {
    document.querySelectorAll(".alternativa").forEach(botao => {
        botao.classList.remove("selecionada");
    });

    event.target.classList.add("selecionada");

    document.getElementById("respostaAluno").value = resposta;
    localStorage.setItem("alternativaAtual", alternativa);
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

    let acertos = 0;

    const respostasCorrigidas = respostasMissao.map(item => {
        const questao = missao.questoes[item.questao - 1];

        const acertou = item.alternativa === questao.correta;

        if (acertou) {
            acertos++;
        }

        return {
    questao: item.questao,
    pergunta: item.pergunta,
    resposta: item.resposta,
    alternativa: item.alternativa,
    correta: questao.correta,
    respostaCorreta: questao[questao.correta],
    acertou: acertou
};
    });

    const total = missao.questoes.length;
    const nota = Number(((acertos / total) * 10).toFixed(1));
    const percentual = Math.round((acertos / total) * 100);

    await addDoc(collection(db, "respostas"), {
        nome: aluno.nome,
        turma: aluno.turma,
        avatar: aluno.avatar,
        cor: aluno.cor,
        codigo: aluno.codigo,
        tituloMissao: missao.titulo,
        resposta: respostasCorrigidas,
        acertos,
        total,
        nota,
        percentual,
        enviadaEm: new Date()
    });

    const resultadoFinal = {
    nome: aluno.nome,
    turma: aluno.turma,
    avatar: aluno.avatar,
    tituloMissao: missao.titulo,
    resposta: respostasCorrigidas,
    acertos,
    total,
    nota,
    percentual
};

localStorage.setItem(
    "resultadoAtual",
    JSON.stringify(resultadoFinal)
);

localStorage.removeItem("respostasMissao");
localStorage.removeItem("alternativaAtual");

window.location.href = "resultado-missao.html";
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
        const alunosUnicos = {};

        snapshot.forEach(doc => {
            const r = doc.data();
            const chave = `${r.nome}_${r.turma}`.toLowerCase();
            alunosUnicos[chave] = r;
        });

        const listaAlunos = Object.values(alunosUnicos)
            .sort((a, b) => (b.nota || 0) - (a.nota || 0));
const top3 = listaAlunos.slice(0, 3);

let htmlPodio = "";

top3.forEach((aluno, index) => {
    const medalhas = ["🥇", "🥈", "🥉"];

    htmlPodio += `
        <div class="podio-card ${index === 0 ? "primeiro" : ""}">
            <div class="medalha">${medalhas[index]}</div>
            <h2>${aluno.avatar} ${aluno.nome}</h2>
            <p>${aluno.turma}</p>
            <strong>Nota ${aluno.nota ?? "-"}</strong>
        </div>
    `;
});

document.getElementById("podioRanking").innerHTML = htmlPodio;
        document.getElementById("totalParticipantes").innerHTML =
            listaAlunos.length;

        document.getElementById("totalRespostas").innerHTML =
            snapshot.size;

        if (listaAlunos.length === 0) {
            html = `
                <p class="subtitle">
                    Nenhuma resposta recebida ainda.
                </p>
            `;
        }

        listaAlunos.forEach((r, index) => {
            let medalha = "";

            if (index === 0) medalha = "🥇";
            if (index === 1) medalha = "🥈";
            if (index === 2) medalha = "🥉";

            let respostaTexto = "";

            if (Array.isArray(r.resposta)) {
                respostaTexto = r.resposta
                    .map(item => {
                        const icone = item.acertou ? "✅" : "❌";

                        return `
                            <p>
                                ${icone}
                                <strong>Questão ${item.questao}:</strong>
                                ${item.resposta}
                            </p>
                        `;
                    })
                    .join("");
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

                    <div class="respostaPainel">
                        Nota: ${r.nota ?? "-"}
                    </div>

                    <p>
                        <strong>Acertos:</strong>
                        ${r.acertos ?? 0}/${r.total ?? 0}
                    </p>

                    <p>
                        <strong>Percentual:</strong>
                        ${r.percentual ?? 0}%
                    </p>

                    ${respostaTexto}

                </div>
            `;
        });

        document.getElementById("painelRespostas").innerHTML = html;
    });
};
