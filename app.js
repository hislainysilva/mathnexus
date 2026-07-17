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

    const codigo = campoCodigo.value.trim().toUpperCase();

    if (!codigo) {
        alert("Digite o código da missão.");
        return;
    }

    const consulta = query(
        collection(db, "respostas"),
        where("codigo", "==", codigo)
    );

    onSnapshot(
        consulta,
        snapshot => {
            const participantes = {};

            snapshot.forEach(documento => {
                const resposta = documento.data();

                const nome = resposta.nome || "Aluno";
                const turma = resposta.turma || "Turma não informada";
                const chave = `${nome}_${turma}`.toLowerCase();

                const horarioAtual =
                    resposta.enviadaEm?.toMillis?.() ||
                    resposta.enviadaEm?.seconds * 1000 ||
                    0;

                const horarioAnterior =
                    participantes[chave]?.enviadaEm?.toMillis?.() ||
                    participantes[chave]?.enviadaEm?.seconds * 1000 ||
                    0;

                if (
                    !participantes[chave] ||
                    horarioAtual >= horarioAnterior
                ) {
                    participantes[chave] = resposta;
                }
            });

            const listaAlunos = Object
                .values(participantes)
                .sort((a, b) => {
                    const diferencaNota =
                        Number(b.nota || 0) -
                        Number(a.nota || 0);

                    if (diferencaNota !== 0) {
                        return diferencaNota;
                    }

                    const percentualA =
                        Number(a.percentual || 0);

                    const percentualB =
                        Number(b.percentual || 0);

                    return percentualB - percentualA;
                });

            const totalParticipantes =
                listaAlunos.length;

            document.getElementById(
                "totalParticipantes"
            ).textContent = totalParticipantes;

            document.getElementById(
                "totalRespostas"
            ).textContent = snapshot.size;

            if (totalParticipantes === 0) {
                limparDashboard();
                return;
            }

            const notas = listaAlunos.map(
                aluno => Number(aluno.nota || 0)
            );

            const percentuais = listaAlunos.map(
                aluno => Number(aluno.percentual || 0)
            );

            const somaNotas = notas.reduce(
                (total, nota) => total + nota,
                0
            );

            const somaPercentuais =
                percentuais.reduce(
                    (total, percentual) =>
                        total + percentual,
                    0
                );

            const mediaTurma = Number(
                (
                    somaNotas /
                    totalParticipantes
                ).toFixed(1)
            );

            const maiorNota = Math.max(...notas);
            const menorNota = Math.min(...notas);

            const aproveitamento = Math.round(
                somaPercentuais /
                totalParticipantes
            );

            document.getElementById(
                "mediaTurma"
            ).textContent = mediaTurma;

            document.getElementById(
                "maiorNota"
            ).textContent = maiorNota;

            document.getElementById(
                "menorNota"
            ).textContent = menorNota;

            document.getElementById(
                "aproveitamentoGeral"
            ).textContent = `${aproveitamento}%`;

            const primeiraResposta =
                listaAlunos[0];

            document.getElementById(
                "identificacaoMissao"
            ).innerHTML = `
                <strong>
                    🚀 ${primeiraResposta.tituloMissao || "Missão"}
                </strong>

                <span>
                    Código: ${codigo}
                </span>

                <span>
                    Turma: ${primeiraResposta.turma || "Não informada"}
                </span>
            `;

            criarPodio(listaAlunos);
            criarDesempenhoQuestoes(listaAlunos);
            criarCardsAlunos(listaAlunos);
        },

        erro => {
            console.error(
                "Erro ao carregar o painel:",
                erro
            );

            alert(
                "Não foi possível carregar os dados da missão."
            );
        }
    );
};


/* =========================
   FUNÇÕES DO DASHBOARD
========================= */

function limparDashboard() {
    document.getElementById(
        "mediaTurma"
    ).textContent = "0";

    document.getElementById(
        "maiorNota"
    ).textContent = "0";

    document.getElementById(
        "menorNota"
    ).textContent = "0";

    document.getElementById(
        "aproveitamentoGeral"
    ).textContent = "0%";

    document.getElementById(
        "questaoMaisDificil"
    ).textContent = "—";

    document.getElementById(
        "identificacaoMissao"
    ).textContent =
        "Nenhuma resposta recebida para esse código.";

    document.getElementById(
        "podioRanking"
    ).innerHTML = `
        <p class="subtitle">
            Aguardando respostas dos alunos.
        </p>
    `;

    document.getElementById(
        "desempenhoQuestoes"
    ).innerHTML = `
        <p class="subtitle">
            As estatísticas aparecerão quando houver respostas.
        </p>
    `;

    document.getElementById(
        "painelRespostas"
    ).innerHTML = `
        <p class="subtitle">
            Nenhum resultado recebido.
        </p>
    `;
}


function criarPodio(listaAlunos) {
    const top3 = listaAlunos.slice(0, 3);
    const medalhas = ["🥇", "🥈", "🥉"];

    let html = "";

    top3.forEach((aluno, indice) => {
        html += `
            <article
                class="
                    podio-card
                    ${indice === 0 ? "primeiro" : ""}
                "
            >
                <div class="medalha">
                    ${medalhas[indice]}
                </div>

                <div class="podio-avatar">
                    ${aluno.avatar || "😀"}
                </div>

                <h2>
                    ${aluno.nome || "Aluno"}
                </h2>

                <p>
                    ${aluno.turma || ""}
                </p>

                <strong>
                    Nota ${aluno.nota ?? 0}
                </strong>

                <span class="podio-percentual">
                    ${aluno.percentual ?? 0}% de acertos
                </span>
            </article>
        `;
    });

    document.getElementById(
        "podioRanking"
    ).innerHTML = html;
}


function criarDesempenhoQuestoes(listaAlunos) {
    const estatisticas = {};

    listaAlunos.forEach(aluno => {
        if (!Array.isArray(aluno.resposta)) {
            return;
        }

        aluno.resposta.forEach(item => {
            const numero =
                Number(item.questao);

            if (!estatisticas[numero]) {
                estatisticas[numero] = {
                    numero,
                    pergunta:
                        item.pergunta ||
                        `Questão ${numero}`,
                    total: 0,
                    acertos: 0
                };
            }

            estatisticas[numero].total++;

            if (item.acertou) {
                estatisticas[numero].acertos++;
            }
        });
    });

    const listaQuestoes = Object
        .values(estatisticas)
        .sort((a, b) => a.numero - b.numero);

    if (listaQuestoes.length === 0) {
        document.getElementById(
            "desempenhoQuestoes"
        ).innerHTML = `
            <p class="subtitle">
                Não há dados suficientes para calcular o desempenho.
            </p>
        `;

        document.getElementById(
            "questaoMaisDificil"
        ).textContent = "—";

        return;
    }

    let questaoMaisDificil =
        listaQuestoes[0];

    let menorPercentual = 101;
    let html = "";

    listaQuestoes.forEach(questao => {
        const percentual = Math.round(
            (
                questao.acertos /
                questao.total
            ) * 100
        );

        if (percentual < menorPercentual) {
            menorPercentual = percentual;
            questaoMaisDificil = questao;
        }

        let classe = "desempenho-alto";

        if (percentual < 70) {
            classe = "desempenho-medio";
        }

        if (percentual < 50) {
            classe = "desempenho-baixo";
        }

        html += `
            <article class="questao-estatistica">

                <div class="questao-estatistica-topo">

                    <div>
                        <strong>
                            Questão ${questao.numero}
                        </strong>

                        <p>
                            ${questao.pergunta}
                        </p>
                    </div>

                    <span class="${classe}">
                        ${percentual}%
                    </span>

                </div>

                <div class="barra-estatistica">

                    <div
                        class="${classe}"
                        style="width:${percentual}%"
                    ></div>

                </div>

                <small>
                    ${questao.acertos}
                    acerto(s) em
                    ${questao.total}
                    resposta(s)
                </small>

            </article>
        `;
    });

    document.getElementById(
        "questaoMaisDificil"
    ).textContent =
        `Questão ${questaoMaisDificil.numero}`;

    document.getElementById(
        "desempenhoQuestoes"
    ).innerHTML = html;
}


function criarCardsAlunos(listaAlunos) {
    let html = "";

    listaAlunos.forEach((aluno, indice) => {
        let respostasHtml = "";

        if (Array.isArray(aluno.resposta)) {
            respostasHtml = aluno.resposta
                .map(item => {
                    const icone =
                        item.acertou
                            ? "✅"
                            : "❌";

                    return `
                        <p class="resposta-individual">
                            ${icone}

                            <strong>
                                Questão ${item.questao}:
                            </strong>

                            ${item.resposta}
                        </p>
                    `;
                })
                .join("");
        }

        let classeNota = "nota-alta";

        if (Number(aluno.nota || 0) < 7) {
            classeNota = "nota-media";
        }

        if (Number(aluno.nota || 0) < 5) {
            classeNota = "nota-baixa-painel";
        }

        html += `
            <article class="cardResposta">

                <div class="posicao-ranking">
                    ${indice + 1}º
                </div>

                <div class="avatarPainel">
                    ${aluno.avatar || "😀"}
                </div>

                <h2>
                    ${aluno.nome || "Aluno"}
                </h2>

                <div class="turmaPainel">
                    ${aluno.turma || ""}
                </div>

                <div class="missaoPainel">
                    ${aluno.tituloMissao || ""}
                </div>

                <div class="nota-painel ${classeNota}">
                    Nota ${aluno.nota ?? 0}
                </div>

                <div class="resumo-aluno-painel">

                    <span>
                        ✅ ${aluno.acertos ?? 0}/${aluno.total ?? 0}
                    </span>

                    <span>
                        📊 ${aluno.percentual ?? 0}%
                    </span>

                </div>

                <div class="respostas-aluno-painel">
                    ${respostasHtml}
                </div>

            </article>
        `;
    });

    document.getElementById(
        "painelRespostas"
    ).innerHTML = html;
}
