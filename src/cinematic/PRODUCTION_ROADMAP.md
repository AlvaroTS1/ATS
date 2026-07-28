# Production Roadmap — Filme Cinematográfico ATS

Cronograma de execução de 4 semanas para os assets definidos em `PRODUCTION_BIBLE.md`. Cada semana entrega algo publicável — nenhuma semana depende de "tudo terminar" para mostrar progresso.

---

## Semana 1 — Fusion AI (maior impacto, menor esforço)

**Objetivo da semana:** sair da cena mais fraca da experiência para a mais forte.

- **Dias 1–2:** gerar no Dreamina usando o prompt cinematográfico de `PRODUCTION_BIBLE.md § Fusion AI`. Esperar variações — pedir ao menos 3-4 gerações do mesmo prompt (energia/luz têm variação alta entre gerações, vale escolher a melhor convergência das duas formas).
- **Dia 3:** revisão de direção de arte — checar contra `ART_DIRECTION.md`: paleta correta (só cyan/violeta, zero vazamento de cor quente), simetria de composição mantida, merge final sem "flash" abrupto.
- **Dia 3:** extração de frames (`ffmpeg`, mesmo comando documentado da Cena Core: `fps=24,scale=640:-2`, `libwebp -quality 72`) → 144 frames.
- **Dia 4:** integração técnica — trocar `FusionAiRenderer.ts` (dois icosaedros → `drawImage` de frame), manter o sprite "Em breve" exatamente como está.
- **Dia 5:** QA: `tsc`/`build` limpos, teste de navegação (regressão de WebGL context), teste manual de scroll real (fora do ambiente de preview automatizado).

**Entregável no fim da semana:** Fusion AI publicável, isolada, sem depender de mais nada.

---

## Semana 2 — Core v2 (maior tempo de tela)

**Objetivo da semana:** elevar a qualidade da cena mais assistida de todo o filme.

- **Dias 1–3:** gerar no Dreamina usando o prompt de `PRODUCTION_BIBLE.md § Core`. Esta é a geração mais longa e mais cara de todo o documento (10s, sequência mecânica com 3 fases dentro de um único take) — reservar mais tempo/tentativas aqui do que em qualquer outra cena.
- **Dia 3:** revisão de direção de arte — atenção especial à transição das placas (nunca deve ler como explosão) e ao brilho final do núcleo (não pode estourar/clipar).
- **Dia 4:** extração de frames (240 frames, mesmo pipeline).
- **Dia 4:** integração técnica — substituição direta de `public/cinematic/frame-001..240.webp`. Zero mudança de código (`CoreRenderer`/`CoreAnimator` não mudam).
- **Dia 5:** QA visual comparativo lado a lado (v1 vs v2) + teste de continuidade com Genesis (frame inicial) e Ecosystem (frame final).

**Entregável no fim da semana:** Core v2 no ar, primeira metade do filme (Genesis→Core) com qualidade de produção elevada.

---

## Semana 3 — Return + primeira passada de continuidade do filme inteiro

**Objetivo da semana:** fechar o arco narrativo e validar a experiência de ponta a ponta pela primeira vez com os 3 novos assets já publicados.

- **Dias 1–2:** gerar no Dreamina usando o prompt de `PRODUCTION_BIBLE.md § Return`. Atenção ao requisito mais delicado desta cena: o frame final precisa terminar **dim, não preto** (checar histograma de luminância do último frame antes de aprovar).
- **Dia 3:** extração de frames (144 frames).
- **Dia 3:** integração técnica híbrida — trocar as partículas procedurais de `ReturnRenderer.ts` por `drawImage` de frame, **preservando** a lógica de `sceneFadeOpacity` do `ReturnAnimator.ts` aplicada por cima nos últimos 15% do progresso.
- **Dia 4:** **passada completa de continuidade** — rolar a experiência inteira (Genesis → Core v2 → Ecosystem → Products → Fusion AI → Return → Hero) de ponta a ponta, em velocidades de scroll diferentes (lenta, normal, rápida, scroll reverso) procurando qualquer costura visível.
- **Dia 5:** ajuste fino de qualquer `overlap`/timing na `timeline.config.ts` que a passada do dia 4 revelar como necessário (é o único arquivo que deveria precisar tocar, dado que o núcleo do Engine já está estável).

**Entregável no fim da semana:** filme completo, ponta a ponta, com os 3 assets de maior prioridade no ar e validado.

---

## Semana 4 — Ecosystem (opcional) + polimento final + performance

**Objetivo da semana:** o enriquecimento que não é crítico, mais a rede de segurança antes de chamar o projeto de "pronto".

- **Dias 1–2:** gerar o vídeo de fundo do Ecosystem (`PRODUCTION_BIBLE.md § Ecosystem`) **somente se a Semana 3 não revelou nenhum problema mais urgente** — esta é a única entrega deste documento marcada como dispensável.
- **Dia 2:** se produzida, integração técnica (segunda camada de canvas 2D atrás do WebGL dos painéis).
- **Dia 3:** **auditoria de performance completa:** peso total de payload do filme (meta: ficar abaixo dos ~28-35MB estimados na tabela final do Production Bible), Core Web Vitals do Hero (LCP não pode regressar por causa do peso do filme carregando em paralelo), teste em dispositivo de tier baixo (`deviceTier` já reduz partículas/pixelRatio — confirmar que também está reduzindo o suficiente com os novos assets de vídeo).
- **Dia 4:** QA de acessibilidade — `prefers-reduced-motion` continua caindo no frame estático correto para cada cena nova (cada `Scene` mantém seu fallback próprio).
- **Dia 5:** revisão final de direção de arte do filme completo contra `ART_DIRECTION.md` — a pergunta a responder no fim da semana é literalmente a do brief original: **"cada cena parece parte do mesmo filme?"**

**Entregável no fim da semana:** projeto pronto para ser chamado de produção cinematográfica completa, não mais "arquitetura com placeholders".

---

## Regra de ouro do cronograma

Nenhuma semana começa a próxima cena sem a anterior estar **integrada e validada no site real** — não só gerada no Dreamina. Um vídeo lindo que não foi extraído, integrado e testado em scroll real não conta como progresso desta produção.
