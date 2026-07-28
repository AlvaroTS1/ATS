# Scene Engine — categorias de cena

O contrato `Scene` (`types.ts`) nunca menciona técnica de renderização — só
comportamento (`preload` / `mount` / `update` / `render` / `resize` /
`unmount`). Por isso o `SceneEngine` e a `Timeline` nunca precisam mudar
quando uma nova cena escolhe uma técnica diferente. Existem quatro
categorias previstas:

## 1. Procedural (WebGL / Three.js)

A cena desenha em tempo real via `new THREE.WebGLRenderer({ canvas })`.

**Exemplos:** `scenes/genesis` (partículas convergindo), `scenes/ecosystem`
(travessia pela esfera), `scenes/products` (formação de painéis que gira e
recolore continuamente).

## 2. Sequência de frames pré-extraídos

A cena desenha via `canvas.getContext('2d')` + `ctx.drawImage(imagem, ...)`
a cada frame, escolhendo qual imagem mostrar a partir do progresso local
(com fallback para o frame carregado mais próximo — nunca um canvas em
branco enquanto o resto ainda baixa em segundo plano).

**Exemplo:** `scenes/core` (240 frames WebP do reveal da esfera).

## 3. Vídeo otimizado sincronizado ao scroll

A cena desenha via `canvas.getContext('2d')` + `ctx.drawImage(videoElement, ...)`,
usando `shared/VideoSource.ts` para manter um `<video>` offscreen cujo
`currentTime` é dirigido pelo progresso do scroll (`seekTo`), com o mesmo
princípio de resiliência da categoria 2: desenha o frame decodificado que
já estiver pronto, nunca trava esperando a rede.

**Status:** primitivo pronto (`VideoSource.ts`), nenhuma cena o usa ainda —
aguardando os vídeos cinematográficos do Dreamina.

## 4. Interativa (planejada, não implementada)

Para momentos em que o visitante deve poder agir sobre o ambiente — girar a
esfera manualmente, explorar um produto, acionar um efeito — em vez de
apenas rolar a página.

**Por que ela cabe na arquitetura atual sem tocar no núcleo:** o contrato
`Scene` já recebe seu próprio `<canvas>` em `mount()`. Uma cena interativa
simplesmente registra os próprios listeners de ponteiro/toque **nesse
canvas**, dentro do seu próprio `mount()`, e os remove no seu próprio
`unmount()` — exatamente como qualquer `Scene` já gerencia seus recursos
Three.js. Nem `SceneEngine` nem `Timeline` precisam saber que aquilo existe.

**A única peça nova de verdade — e ainda não construída:** hoje o wrapper
pinado (`CinematicExperience.tsx`) aplica `pointer-events: none` em toda a
pilha de canvases, de propósito (nenhuma camada decorativa pode roubar
clique do Header ou do resto do site). Uma cena interativa precisa que
ISSO seja `pointer-events: auto` **só enquanto ela estiver em primeiro
plano** (opacidade ≈ 1 segundo a `Timeline`). Extensão prevista, pequena e
isolada: o host liga/desliga `canvas.style.pointerEvents` com base no
evento `scene:enter` / `scene:complete` que toda cena já emite de graça
via `EventBus` (o mesmo mecanismo que `products:stage` já usa para
acionar o rótulo HTML) — nenhuma mudança estrutural no `SceneEngine`.

**Quando esse dia chegar:** a cena interativa implementa o mesmo `Scene`
de sempre; o único código genuinamente novo é essa alternância de
`pointer-events` no host, isolada e reversível.
