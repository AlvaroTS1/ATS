# Roteiro — ATS Core Experience

A duração é medida em **telas de rolagem** (altura da viewport) e é a mesma em qualquer aparelho. Total: 10,3 telas. A fonte de verdade é `src/experience/chapters.ts`.

| # | Capítulo | Duração | Objetivo | Imagem (3D + vídeo) | Texto (DOM) | Transição de saída |
|---|---|---|---|---|---|---|
| 1 | **Núcleo** | 1,6 | Impacto imediato e identidade | A esfera ATS (filmagem s01) se abre; push-in; o núcleo 3D aparece exatamente onde estava o núcleo filmado | H1 "Tecnologia que resolve problemas reais." + CTAs | A filmagem se dissolve no núcleo 3D, alinhado ao pixel |
| 2 | **Inteligência** | 1,5 | Pessoas + IA + engenharia | Três aglomerados de nós (branco/ciano/violeta) saem do núcleo e se fundem numa rede; sinais percorrem as arestas; o cursor ilumina os nós próximos | "Pessoas, IA e engenharia — uma só rede." + rótulos projetados nos aglomerados | A rede se contrai e vira a casca do núcleo |
| 3 | **Ecossistema** | 4,2 | Os 6 produtos reais | A órbita se desenha; a câmera visita cada produto; uma linha de energia liga o núcleo ao produto em foco | Intro + um painel por produto (dados e links de `products.ts`) | A câmera desce abaixo da órbita |
| 4 | **Inovação** | 1,7 | Desenvolvimento próprio, com prova | Os blocos se selam um a um; a árvore de Merkle sobe até a raiz; o feixe vai ao anel de ancoragem | "Tecnologia construída por dentro." + legenda projetada "Raiz de Merkle · carimbo no Bitcoin" | A câmera sobe e recua |
| 5 | **Futuro** | 1,3 | Visão e convite | Plano geral de tudo aceso; aproximação final ao núcleo com a órbita completa | "O próximo produto já está a caminho." + "Conhecer os projetos" / "Falar com a ATS" | O pin se solta e entram as seções do site |

## Interação
- **Cursor ou toque:** paralaxe da câmera; a rede reage à posição do ponteiro.
- **Trilho de capítulos** (desktop): salta para qualquer capítulo.
- **Teclado:** o foco num link de um capítulo ou painel leva a jornada até ele. Há também um link "Pular a apresentação".

## Teaser vertical (redes sociais, 3 × 5 s, 9:16)
t01: entra no núcleo, a partir do último quadro de s01 → t02: a rede vira seis luzes em órbita, a partir do último quadro de t01 → t03: as luzes voltam e as placas se fecham na esfera ATS, terminando no primeiro quadro de s01. O teaser fecha em loop com a própria abertura do site.

Montagem final do teaser (local e gratuita):
```bash
ffmpeg -i t01.mp4 -i t02.mp4 -i t03.mp4 -filter_complex "[0:v][1:v][2:v]concat=n=3:v=1[v]" -map "[v]" -c:v libx264 -crf 18 -pix_fmt yuv420p teaser-ats-9x16.mp4
```
Como cada cena começa no quadro exato em que a anterior termina, o `concat` simples não mostra emenda.
