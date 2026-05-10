var timerId = null;

function iniciaJogo() {
  var url = window.location.search;
  var nivel_jogo = url.replace("?", "");
  var tempo_segundos = 0;

  if (nivel_jogo == 1) {
    tempo_segundos = 120;
  } else if (nivel_jogo == 2) {
    tempo_segundos = 60;
  } else if (nivel_jogo == 3) {
    tempo_segundos = 30;
  }

  document.getElementById("cronometro").innerHTML = tempo_segundos;
  var qtde_baloes = 92;
  cria_baloes(qtde_baloes);
  document.getElementById("baloes_inteiros").innerHTML = qtde_baloes;
  document.getElementById("baloes_estourados").innerHTML = 0;

  contagem_tempo(tempo_segundos + 1);
}

function contagem_tempo(segundos) {
  segundos = segundos - 1;

  if (segundos == -1) {
    clearTimeout(timerId);
    game_over();
    return false;
  }

  document.getElementById("cronometro").innerHTML = segundos;
  timerId = setTimeout(function () {
    contagem_tempo(segundos);
  }, 1000);
}

function game_over() {
  alert("Fim de jogo, você não conseguiu estourar todos os balões a tempo");
}

function cria_baloes(qtde_baloes) {
  var cenario = document.getElementById("cenario");
  var larguraTela = window.innerWidth * 0.8;
  var larguraBalao = 100; // incluindo margens
  var colunas = Math.floor(larguraTela / larguraBalao);
  var linhas = Math.ceil(qtde_baloes / colunas);

  for (var i = 1; i <= qtde_baloes; i++) {
    var balao = document.createElement("img");
    balao.src = "imagens/balao-roxo.png";
    balao.id = "b" + i;
    balao.onclick = function () {
      estourar(this);
    };
    cenario.appendChild(balao);
  }
}

function estourar(e) {
  e.onclick = null;
  e.classList.add("estourado");
  pontuacao(-1);
}

function pontuacao(acao) {
  var baloes_inteiros = parseInt(
    document.getElementById("baloes_inteiros").innerHTML
  );
  var baloes_estourados = parseInt(
    document.getElementById("baloes_estourados").innerHTML
  );

  baloes_inteiros += acao;
  baloes_estourados -= acao;

  document.getElementById("baloes_inteiros").innerHTML = baloes_inteiros;
  document.getElementById("baloes_estourados").innerHTML = baloes_estourados;

  situacao_jogo(baloes_inteiros);
}

function situacao_jogo(baloes_inteiros) {
  if (baloes_inteiros === 0) {
    alert("Parabéns, você conseguiu estourar todos os balões a tempo!");
    parar_jogo();
  }
}

function parar_jogo() {
  clearTimeout(timerId);
}
