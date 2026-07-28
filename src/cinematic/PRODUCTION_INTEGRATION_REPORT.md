# Relatório de Integração — 4 Vídeos Oficiais

> **V2 (atual):** os 4 vídeos abaixo (`sitevideo1-4.mp4`, 16:9 paisagem, tomada
> única de 40s) foram **completamente substituídos** por uma nova remessa —
> `video1.6.mp4`, `video 2.6.mp4`, `video 3.6.mp4`, `video 4.6.mp4` — em
> **9:16 retrato** (720×1280, 24fps, ~6s cada), mesma narrativa e mesmo
> mapeamento de cena (nucleus/portal/ecosystem-entry/holo-hall), extraídos
> a 20fps/540px de largura/`libwebp` q68 (120 frames por cena). Nenhum
> asset ou código específico do 16:9 permanece — este relatório fica só
> como histórico de como a arquitetura de vídeo-para-frames foi validada
> pela primeira vez. Ver `ART_DIRECTION.md § Aspecto e enquadramento` para
> a regra de fit atual (cover/contain por orientação, não por breakpoint).

Registro do que foi de fato integrado na Scene Engine a partir dos 4 vídeos reais fornecidos (`sitevideo1-4.mp4`), substituindo as cenas procedurais Genesis/Core/Ecosystem/Products.

## Descoberta

Os 4 arquivos não são clipes independentes — são **uma única tomada contínua de 40 segundos** (cada arquivo começa exatamente no último frame do anterior), em **16:9 paisagem** (1280×720, 24fps), não 9:16 como o planejamento original assumia. Isso mudou duas decisões técnicas importantes:
1. **Overlap entre as 4 cenas de vídeo pode ser mínimo** (0.05, "blend de segurança") em vez de um crossfade real — não há descontinuidade visual para esconder, é o mesmo plano.
2. **Fit adaptativo cover/contain** substituiu o letterbox fixo em retrato (ver `ART_DIRECTION.md § Aspecto e enquadramento`).

## Mapeamento final

| Vídeo | Cena nova | Substitui | Conteúdo |
|---|---|---|---|
| `sitevideo1` | `nucleus` | Genesis + Core | Esfera se forma, placas abrem, núcleo de energia revelado |
| `sitevideo2` | `portal` | Ecosystem (início) | Câmera atravessa o portal para um corredor cristalino |
| `sitevideo3` | `ecosystem-entry` | Ecosystem (fim) | Corredor continua, primeiros painéis holográficos aparecem ao longe |
| `sitevideo4` | `holo-hall` | Products | Salão principal com 3 clusters de painéis holográficos (esquerda/centro/direita) |

`fusion-ai` e `return` (Three.js procedural, Fase 4) **não mudaram** — continuam depois de `holo-hall` na mesma ordem narrativa.

## Arquitetura: generalização, não duplicação

Em vez de 4 trios `Scene`/`Renderer`/`Animator` copiados (como Core tinha na Fase 1), o padrão foi **generalizado uma vez**:
- `shared/FrameSequenceAnimator.ts` — seleção de frame + suporte a `freezeAt` (congelar o vídeo perto do fim).
- `shared/FrameSequenceRenderer.ts` — desenho no canvas 2D + fit adaptativo cover/contain.
- `shared/createFrameSequenceScene.ts` — factory que compõe os dois + `AssetManager`, com callback opcional `onProgress` para uma cena reagir ao próprio timing sem precisar de uma classe própria.

Cada uma das 4 cenas novas é agora **só um manifest de assets + uma chamada ao factory** (~15 linhas cada) — o build confirma isso: cada cena virou um chunk de 0.2-0.3KB.

## Painéis holográficos: de vídeo decorativo a React interativo

O pedido central desta fase — "quando surgir um painel holográfico, transforme-o em componente React real, clicável" — foi resolvido assim:

1. **`HoloHallScene.ts`** congela o vídeo em 72% do próprio progresso (`HOLOHALL_FREEZE_AT`) — a câmera "chega" e para, dando um fundo estável em vez de continuar variando enquanto o usuário tenta clicar.
2. No mesmo instante, emite `'holo-hall:panels'` via `EventBus` (visible: true) — o mesmo Event Layer já previsto na Fase 1, agora com seu primeiro uso realmente crítico de UX.
3. **`HoloProductPanels.tsx`** (host) escuta esse evento e alterna `pointer-events` de `none` para `auto` **somente** enquanto os painéis estão em foco — exatamente a extensão documentada em `ARCHITECTURE.md` para a futura "Interactive Scene", validada na prática mais cedo do que o previsto.
4. **`HoloPanel.tsx`** — cada painel é HTML/React real: reaproveita `getProduct()`/`ProductCTAs` de `data/products.ts` (mesma fonte única de sempre, mesmos links reais já auditados), com uma entrada que "emerge da energia" (escala 0.55→1, blur 12px→0, brilho 2.5×→1×, nunca um fade simples) e bordas em canto estilo HUD que ecoam a estética do próprio vídeo.
5. Os painéis **desaparecem antes do crossfade para a Fusion AI** (`HOLOHALL_PANELS_HIDE_AT = 0.85`, calculado para terminar antes do overlap de 0.12 começar em 0.88) — nunca ficam visíveis por cima da próxima cena.

## Peso e performance

- Extração: 16fps (não 24 — a jornada é 4× mais longa que o antigo Core sozinho, então caiu a taxa para manter o peso razoável sem perder suavidade perceptível), 720px de largura, WebP q68.
- **18MB para os 40s completos** (nucleus 4.0MB, portal 4.6MB, ecosystem-entry 4.9MB, holo-hall 4.4MB) — carregados progressivamente pelo `AssetManager` já existente, mesma disciplina de sempre.
- Bundle JS praticamente inalterado (674.79KB, era 672.21KB) — a generalização em `createFrameSequenceScene` até reduziu código comparado a 4 cópias.

## Limitação de teste (mesma de sempre)

O ambiente de preview desta sessão não simula scroll real nem `requestAnimationFrame` de forma confiável. Validado via: (1) emissão manual do evento `holo-hall:panels` confirmando a cadeia EventBus→React→CSS funciona ponta a ponta, (2) links reais dos 3 CTAs confirmados corretos, (3) matemática da Timeline (6 cenas) varrida em 2500 pontos sem lacunas, (4) build de produção limpo, (5) ciclo de navegação em produção sem erros de console, (6) sem overflow em mobile. **Recomendo fortemente testar o scroll real após o deploy** — é a única coisa que não pude confirmar meu mesmo aqui.
