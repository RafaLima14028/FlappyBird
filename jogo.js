console.log("Flappy Bird");

const canvas = document.querySelector("canvas");
const contexto = canvas.getContext("2d");

let frames = 0;

const estado = {
  game: 1,
  over: 2,
}

//? SOM DE BATIDA
const som_HIT = new Audio();
som_HIT.src = "./efeitos/hit.wav";

//? SOM DO PULO
const som_PULO = new Audio();
som_PULO.src = "./efeitos/pulo.wav";

//? SOM DE PONTUAÇÃO
const som_PONTUACAO = new Audio();
som_PONTUACAO.src = "./efeitos/ponto.wav";

const sprites = new Image();
sprites.src = "./sprites.png";

//! PLANO DE FUNDO
const planoDeFundo = {
  spriteX: 390,
  spriteY: 0,
  largura: 275,
  altura: 204,
  x: 0,
  y: canvas.height - 316,
  desenha() {
    contexto.fillStyle = "#70c5ce";
    contexto.fillRect(0, 0, canvas.width, canvas.height);

    contexto.drawImage(
      sprites,
      planoDeFundo.spriteX,
      planoDeFundo.spriteY,
      planoDeFundo.largura,
      planoDeFundo.altura,
      planoDeFundo.x,
      planoDeFundo.y,
      planoDeFundo.largura,
      planoDeFundo.altura
    );

    contexto.drawImage(
      sprites,
      planoDeFundo.spriteX,
      planoDeFundo.spriteY,
      planoDeFundo.largura,
      planoDeFundo.altura,
      planoDeFundo.x + planoDeFundo.largura,
      planoDeFundo.y,
      planoDeFundo.largura,
      planoDeFundo.altura
    );
  },
};

//! CHÃO
function criaChao() {
  const chao = {
    spriteX: 0,
    spriteY: 610,
    largura: 224,
    altura: 112,
    x: 0,
    y: canvas.height - 112,

    atualiza() {
      const movimentoDoChao = 1;
      const repeteEm = chao.largura / 2;
      const movimentacao = chao.x - movimentoDoChao;

      /*
      console.log("[chao.x]", chao.x);
      console.log("[RepeteEm]", repeteEm);
      console.log("[Movimentacao]", movimentacao % repeteEm);
      */

      chao.x = movimentacao % repeteEm;
    },

    desenha: function () {
      contexto.drawImage(
        sprites,
        chao.spriteX,
        chao.spriteY,
        chao.largura,
        chao.altura,
        chao.x,
        chao.y,
        chao.largura,
        chao.altura
      );

      contexto.drawImage(
        sprites,
        chao.spriteX,
        chao.spriteY,
        chao.largura,
        chao.altura,
        chao.x + chao.largura,
        chao.y,
        chao.largura,
        chao.altura
      );
    },
  };

  return chao;
}

//! COLISÃO
function fazColisao(flappyBird, chao) {
  const flappyBirdY = flappyBird.y + flappyBird.altura;
  const chaoY = chao.y;

  if (flappyBirdY >= chaoY) {
    return true;
  }

  return false;
}

//! CANOS
function criaCanos() {
  const canos = {
    largura: 52,
    altura: 400,
    chao: {
      spriteX: 0,
      spriteY: 169,
    },
    ceu: {
      spriteX: 52,
      spriteY: 169,
    },
    espaco: 80,
    pares: [],
    moved: true,

    desenha() {
      canos.pares.forEach(function (par) {
        const yRandom = par.y;
        const espacamentoEntreCanos = 90;

        const canoCeuX = par.x;
        const canoCeuY = yRandom;

        // CANO DO CEU
        contexto.drawImage(
          sprites,
          canos.ceu.spriteX,
          canos.ceu.spriteY,
          canos.largura,
          canos.altura,
          canoCeuX,
          canoCeuY,
          canos.largura,
          canos.altura
        );

        const canoChaoX = par.x;
        const canoChaoY = canos.altura + espacamentoEntreCanos + yRandom;

        // CANO DO CHÃO
        contexto.drawImage(
          sprites,
          canos.chao.spriteX,
          canos.chao.spriteY,
          canos.largura,
          canos.altura,
          canoChaoX,
          canoChaoY,
          canos.largura,
          canos.altura
        );

        par.canoCeu = {
          x: canoCeuX,
          y: canos.altura + canoCeuY,
        };

        par.canoChao = {
          x: canoChaoX,
          y: canoChaoY,
        };
      });
    },

    temColisaoComOFlappyBird(par) {
      const cabecaDoFlappy = globais.flappyBird.y;
      const peDoFlappy = globais.flappyBird.y + globais.flappyBird.altura;

      if (globais.flappyBird.x + globais.flappyBird.largura >= par.x) {
        //console.log("Flappy Bird invadiu a área dos canos");

        if (cabecaDoFlappy <= par.canoCeu.y) {
          return true;
        }

        if (peDoFlappy >= par.canoChao.y) {
          return true;
        }
      }

      return false;
    },

    atualiza() {
      const passou100Frames = frames % 100 === 0;

      if (passou100Frames) {
        // console.log("Passou 100 frames");

        canos.pares.push({
          x: canvas.width,
          y: -150 * (Math.random() + 1),
        });
      }

      canos.pares.forEach(function (par) {
        par.x = par.x - 2;

        if (canos.temColisaoComOFlappyBird(par)) {
          console.log("Você perdeu !");
          som_HIT.play();
          mudaParaTela(Telas.GAME_OVER);
        }

        if (par.x + canos.largura <= 0) {
          canos.pares.shift();
        }
      });
    },
  };

  return canos;
}

//! INICIA OU REINICIA O PÁSSARO
function criarFlappyBird() {
  const flappyBird = {
    spriteX: 0,
    spriteY: 0,
    largura: 33,
    altura: 24,
    x: 10,
    y: 50,
    velocidade: 0,
    gravidade: 0.25,
    pulo: 4.6,
    frameAtual: 0,

    pula() {
      //console.log("devo pular");
      //console.log("[Antes]", flappyBird.velocidade);

      const flappyPula = (flappyBird.velocidade = -flappyBird.pulo);

      if (flappyPula) {
        som_PULO.play();
      }

      //console.log("[Depois]", flappyBird.velocidade);
    },

    atualiza() {
      if (fazColisao(flappyBird, globais.chao)) {
        //console.log("Fez colisão");

        som_HIT.play();
        mudaParaTela(Telas.GAME_OVER);

        return;
      }

      flappyBird.velocidade = flappyBird.velocidade + flappyBird.gravidade;
      flappyBird.y = flappyBird.y + flappyBird.velocidade;
    },

    movimentos: [
      { spriteX: 0, spriteY: 0 }, // ASA PARA CIME
      { spriteX: 0, spriteY: 26 }, // ASA NO MEIO
      { spriteX: 0, spriteY: 52 }, // ASA PARA BAIXO
    ],

    atualizaOFrameAtual() {
      const intervaloDeFrames = 10;
      const passouOIntervalo = frames % intervaloDeFrames === 0;

      //console.log("passouOIntervalo", passouOIntervalo);

      if (passouOIntervalo) {
        const baseDoIncremento = 1;
        const incremento = baseDoIncremento + flappyBird.frameAtual;
        const baseRepeticao = flappyBird.movimentos.length;
        flappyBird.frameAtual = incremento % baseRepeticao;
      }

      /*
      console.log("[incremento]", incremento);
      console.log("[baseRepeticao]", baseRepeticao);
      console.log("[frame]", incremento % baseRepeticao);
      */
    },

    desenha() {
      flappyBird.atualizaOFrameAtual();

      const { spriteX, spriteY } = flappyBird.movimentos[flappyBird.frameAtual];

      contexto.drawImage(
        sprites,
        spriteX,
        spriteY,
        flappyBird.largura,
        flappyBird.altura,
        flappyBird.x,
        flappyBird.y,
        flappyBird.largura,
        flappyBird.altura
      );
    },
  };

  return flappyBird;
}

//! TELA DE INICIO
const mensagemGetReady = {
  sX: 134,
  sY: 0,
  w: 174,
  h: 152,
  x: canvas.width / 2 - 174 / 2,
  y: 50,

  desenha() {
    contexto.drawImage(
      sprites,
      mensagemGetReady.sX,
      mensagemGetReady.sY,
      mensagemGetReady.w,
      mensagemGetReady.h,
      mensagemGetReady.x,
      mensagemGetReady.y,
      mensagemGetReady.w,
      mensagemGetReady.h
    );
  },
};

//! TELA DE GAME_OVER
const mensagemGameOver = {
  sX: 134,
  sY: 153,
  w: 226,
  h: 200,
  x: canvas.width / 2 - 226 / 2,
  y: 50,

  desenha() {
    contexto.drawImage(
      sprites,
      mensagemGameOver.sX,
      mensagemGameOver.sY,
      mensagemGameOver.w,
      mensagemGameOver.h,
      mensagemGameOver.x,
      mensagemGameOver.y,
      mensagemGameOver.w,
      mensagemGameOver.h
    );
  },
};

//! MEDALHA NA TELA DE GAME_OVER
const medalhaDeOuro = {
  sX: 48,
  sY: 124,
  w: 44,
  h: 44,
  x: 72,
  y: 137,

  desenha() {
    contexto.drawImage(
      sprites,
      medalhaDeOuro.sX,
      medalhaDeOuro.sY,
      medalhaDeOuro.w,
      medalhaDeOuro.h,
      medalhaDeOuro.x,
      medalhaDeOuro.y,
      medalhaDeOuro.w,
      medalhaDeOuro.h
    );
  },
};

//! PLACAR
function criaPlacar() {
  const placar = {
    pontuacao: 0,

    desenha() {
      contexto.font = "35px VT323";
      contexto.textAlign = "right";
      contexto.fillStyle = "white";
      contexto.fillText(`${placar.pontuacao}`, canvas.width - 10, 35);
    },

    atualiza() {
      if (contexto == estado.over) {
        placar.pontuacao = placar.pontuacao + 1;
      }

      /*
      const intervaloDeFrames = 20;
      const passouOIntervalo = frames % intervaloDeFrames === 0;

      if (passouOIntervalo) {
        placar.pontuacao = placar.pontuacao + 1;
      }
      */
    },
  };

  return placar;
}

//! TELAS
const globais = {};

let telaAtiva = {};

function mudaParaTela(novaTela) {
  telaAtiva = novaTela;

  if (telaAtiva.inicializa) {
    telaAtiva.inicializa();
  }
}

const Telas = {
  INICIO: {
    inicializa() {
      globais.flappyBird = criarFlappyBird();
      globais.chao = criaChao();
      globais.canos = criaCanos();
    },

    desenha() {
      planoDeFundo.desenha();
      globais.flappyBird.desenha();
      globais.chao.desenha();
      mensagemGetReady.desenha();
    },

    click() {
      mudaParaTela(Telas.JOGO);
    },

    atualiza() {
      globais.chao.atualiza();
    },
  },

  JOGO: {
    inicializa() {
      globais.placar = criaPlacar();
    },

    desenha() {
      planoDeFundo.desenha();
      globais.canos.desenha();
      globais.chao.desenha();
      globais.flappyBird.desenha();
      globais.placar.desenha();
    },

    click() {
      globais.flappyBird.pula();
    },

    atualiza() {
      globais.canos.atualiza();
      globais.chao.atualiza();
      globais.flappyBird.atualiza();
      globais.placar.atualiza();
    },
  },

  GAME_OVER: {
    desenha() {
      mensagemGameOver.desenha();
      medalhaDeOuro.desenha();
    },

    atualiza() {},

    click() {
      mudaParaTela(Telas.INICIO);
    },
  },
};

function loop() {
  telaAtiva.desenha();
  telaAtiva.atualiza();

  frames = frames + 1;

  requestAnimationFrame(loop);
}

window.addEventListener("click", function () {
  if (telaAtiva.click) {
    telaAtiva.click();
  }
});

mudaParaTela(Telas.INICIO);
loop();
