/* ═══════════════════════════════════════════
   ESTOURA BALÃO — jogo.js
   ═══════════════════════════════════════════ */

var timerId      = null;
var tempoTotal   = 0;
var tempoAtual   = 0;
var qtde_baloes  = 92;

// Paleta de cores dos balões SVG
var BALLOON_COLORS = [
  { body: '#c94fff', shine: '#e89fff', shadow: '#8b00cc' },
  { body: '#ff5f87', shine: '#ffaac0', shadow: '#c0003a' },
  { body: '#ffda3d', shine: '#fff08a', shadow: '#c9a000' },
  { body: '#5ac8fa', shine: '#a8e5ff', shadow: '#007aad' },
  { body: '#30d158', shine: '#96edb0', shadow: '#009e3a' },
  { body: '#ff9f0a', shine: '#ffd080', shadow: '#c06800' },
];

// ─── SVG balloon inline ───────────────────────────────────────────────────
function balloonSVG(colors, id) {
  var b = colors.body, s = colors.shine, d = colors.shadow;
  var gid  = 'g' + id;
  var sgid = 's' + id;
  return `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${gid}" cx="35%" cy="30%" r="60%">
      <stop offset="0%"   stop-color="${s}" stop-opacity="0.9"/>
      <stop offset="40%"  stop-color="${b}"/>
      <stop offset="100%" stop-color="${d}"/>
    </radialGradient>
    <radialGradient id="${sgid}" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${d}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${d}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Balloon body -->
  <ellipse cx="30" cy="30" rx="22" ry="26" fill="url(#${gid})"/>
  <!-- Shadow bottom -->
  <ellipse cx="30" cy="50" rx="14" ry="6" fill="url(#${sgid})"/>
  <!-- Shine spot -->
  <ellipse cx="22" cy="18" rx="6" ry="4" fill="white" opacity="0.35" transform="rotate(-20 22 18)"/>
  <!-- Knot -->
  <circle cx="30" cy="56" r="3" fill="${d}"/>
  <!-- String -->
  <path d="M30 59 Q35 66 28 74" stroke="${d}" stroke-width="1.2" fill="none" opacity="0.6" stroke-linecap="round"/>
</svg>`;
}

// ─── iniciaJogo ───────────────────────────────────────────────────────────
function iniciaJogo() {
  var url       = window.location.search;
  var nivel_jogo = parseInt(url.replace('?', '')) || 1;

  if      (nivel_jogo === 1) { tempoTotal = 120; }
  else if (nivel_jogo === 2) { tempoTotal = 60;  }
  else if (nivel_jogo === 3) { tempoTotal = 30;  }

  tempoAtual = tempoTotal;

  // Atualiza badge de nível
  var badge = document.getElementById('hud-nivel');
  if (nivel_jogo === 1) { badge.textContent = 'Fácil';   badge.className = 'hud-nivel-badge facil'; }
  if (nivel_jogo === 2) { badge.textContent = 'Normal';  badge.className = 'hud-nivel-badge normal'; }
  if (nivel_jogo === 3) { badge.textContent = 'Difícil'; badge.className = 'hud-nivel-badge dificil'; }

  atualizaTimer(tempoTotal);
  atualizaBarraTimer(tempoTotal, tempoTotal);

  cria_baloes(qtde_baloes);

  document.getElementById('baloes_inteiros').textContent  = qtde_baloes;
  document.getElementById('baloes_estourados').textContent = 0;

  // Inicia background canvas
  iniciaCanvas();

  contagem_tempo(tempoTotal + 1);
}

// ─── Timer ────────────────────────────────────────────────────────────────
function contagem_tempo(segundos) {
  segundos--;
  tempoAtual = segundos;

  if (segundos === -1) {
    clearTimeout(timerId);
    game_over();
    return;
  }

  atualizaTimer(segundos);
  atualizaBarraTimer(segundos, tempoTotal);

  timerId = setTimeout(function () {
    contagem_tempo(segundos);
  }, 1000);
}

function atualizaTimer(s) {
  var el = document.getElementById('cronometro');
  el.textContent = s;
  if (s <= 10) {
    el.classList.add('urgent');
  } else {
    el.classList.remove('urgent');
  }
}

function atualizaBarraTimer(s, total) {
  var pct = (s / total) * 100;
  var bar = document.getElementById('timer-bar');
  bar.style.width = pct + '%';
  if (pct <= 25) { bar.classList.add('low'); }
  else           { bar.classList.remove('low'); }
}

// ─── Game Over ────────────────────────────────────────────────────────────
function game_over() {
  var estourados = parseInt(document.getElementById('baloes_estourados').textContent);
  mostraOverlay(false, tempoAtual, estourados);
}

function parar_jogo() {
  clearTimeout(timerId);
}

// ─── Overlay ──────────────────────────────────────────────────────────────
function mostraOverlay(vitoria, tempoRestante, estourados) {
  var overlay = document.getElementById('overlay');
  var emoji   = document.getElementById('overlay-emoji');
  var title   = document.getElementById('overlay-title');
  var sub     = document.getElementById('overlay-sub');
  var oTime   = document.getElementById('overlay-time');
  var oPop    = document.getElementById('overlay-popped');

  if (vitoria) {
    emoji.textContent = '🎉';
    title.textContent = 'Arrasou!';
    title.className   = 'overlay-title win';
    sub.textContent   = 'Você estourou todos os balões antes do tempo acabar. Incrível!';
  } else {
    emoji.textContent = '😬';
    title.textContent = 'Fim de Jogo';
    title.className   = 'overlay-title lose';
    sub.textContent   = 'O tempo acabou antes de você estourar tudo. Tente de novo!';
  }

  oTime.textContent  = tempoRestante;
  oPop.textContent   = estourados;

  overlay.classList.remove('hidden');
}

// ─── Criar balões ─────────────────────────────────────────────────────────
function cria_baloes(qtde) {
  var cenario = document.getElementById('cenario');
  cenario.innerHTML = '';

  for (var i = 1; i <= qtde; i++) {
    var wrapper  = document.createElement('div');
    wrapper.className = 'balloon';
    wrapper.id        = 'b' + i;
    wrapper.style.animationDelay = (i * 8) + 'ms';

    var cor = BALLOON_COLORS[i % BALLOON_COLORS.length];
    wrapper.innerHTML = balloonSVG(cor, i);
    wrapper.dataset.color = cor.body;

    wrapper.onclick = function () { estourar(this); };
    cenario.appendChild(wrapper);
  }
}

// ─── Estourar ─────────────────────────────────────────────────────────────
function estourar(el) {
  el.onclick = null;
  el.classList.add('estourado');

  // Partículas de burst
  var rect  = el.getBoundingClientRect();
  var cx    = rect.left + rect.width  / 2;
  var cy    = rect.top  + rect.height / 2;
  var color = el.dataset.color || '#c94fff';
  criaBurst(cx, cy, color);

  pontuacao(-1);
}

// ─── Burst particles ──────────────────────────────────────────────────────
function criaBurst(x, y, color) {
  var container = document.getElementById('burst-container');
  var N = 10;
  for (var i = 0; i < N; i++) {
    var p   = document.createElement('div');
    var ang = (Math.PI * 2 / N) * i + Math.random() * 0.5;
    var dist = 30 + Math.random() * 40;
    var dx  = Math.cos(ang) * dist;
    var dy  = Math.sin(ang) * dist;

    p.className = 'burst-particle';
    p.style.left = (x - 4) + 'px';
    p.style.top  = (y - 4) + 'px';
    p.style.background = color;
    p.style.setProperty('--dx', dx + 'px');
    p.style.setProperty('--dy', dy + 'px');
    p.style.animationDuration = (0.4 + Math.random() * 0.25) + 's';
    p.style.opacity = '1';

    container.appendChild(p);
    setTimeout(function(particle){ container.removeChild(particle); }, 700, p);
  }
}

// ─── Pontuação ────────────────────────────────────────────────────────────
function pontuacao(acao) {
  var inteiros   = parseInt(document.getElementById('baloes_inteiros').textContent);
  var estourados = parseInt(document.getElementById('baloes_estourados').textContent);

  inteiros   += acao;
  estourados -= acao;

  document.getElementById('baloes_inteiros').textContent  = inteiros;
  document.getElementById('baloes_estourados').textContent = estourados;

  situacao_jogo(inteiros, estourados);
}

function situacao_jogo(inteiros, estourados) {
  if (inteiros === 0) {
    parar_jogo();
    mostraOverlay(true, tempoAtual, estourados);
  }
}

// ─── Background Canvas ────────────────────────────────────────────────────
function iniciaCanvas() {
  var canvas = document.getElementById('bg-canvas');
  var ctx    = canvas.getContext('2d');
  var stars  = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (var i = 0; i < 90; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      r: 0.5 + Math.random() * 1.5,
      speed: 0.0001 + Math.random() * 0.0003,
      phase: Math.random() * Math.PI * 2,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var t = Date.now() * 0.001;
    stars.forEach(function(s) {
      var alpha = 0.15 + 0.12 * Math.sin(t * s.speed * 1000 + s.phase);
      ctx.beginPath();
      ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201,79,255,' + alpha + ')';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}
