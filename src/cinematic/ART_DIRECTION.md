# Direção de Arte — Experiência Cinematográfica ATS

Este documento não é aspiracional: cada regra aqui já está em produção em
pelo menos uma cena (Genesis, Ecosystem ou Products). Serve como
referência obrigatória para toda cena nova — antes de inventar um valor,
confira se um padrão já existe aqui.

## Filosofia

Mistério → precisão → inteligência → confiança. Nada chamativo, nada
gratuito. Cada cena deve parecer a continuação natural da anterior, nunca
um corte. Se uma escolha visual não serve a essa progressão, ela não
pertence à experiência.

## Aspecto e enquadramento

**V2 (referência atual):** os 4 vídeos oficiais foram recriados em **9:16
retrato** (720×1280, 24fps, ~6s cada) — Núcleo, Portal, Entrada no
Ecossistema, Ambiente Holográfico Principal, uma narrativa única e
contínua (cada arquivo continua exatamente de onde o anterior termina).
Isso substitui a produção V1 em 16:9 paisagem (histórico preservado em
`PRODUCTION_INTEGRATION_REPORT.md`) — nenhum código ou asset da versão
16:9 permanece no projeto.

**Fit adaptativo por orientação, não por breakpoint** (`shared/FrameSequenceRenderer.ts`):
a decisão de `cover` vs `contain` compara a orientação da *imagem* com a
orientação do *canvas*, nunca assume qual delas é paisagem. Quando as duas
concordam (ambas retrato, ou ambas paisagem/quadrada) o encaixe é `cover`
— tela cheia, imersivo, sem barras. Quando divergem — nosso vídeo 9:16
dentro de um viewport largo de desktop, por exemplo — o encaixe é
`contain`: a filmagem fica centralizada como um "portal" vertical,
ladeada pela própria ambientação da cena (grid, glow, partículas) em vez
de barras pretas. Resultado prático: mobile (retrato) recebe `cover`
(tela cheia, como conteúdo nativo de app), desktop (paisagem) recebe
`contain` (portal vertical centralizado) — a mesma regra serve as duas
sem precisar de um caso especial por dispositivo.

## Câmera

- **Direção padrão: `-Z`.** Nenhuma cena usa `camera.lookAt()` — a câmera
  nasce olhando para `-Z` e a composição é resolvida posicionando os
  objetos, não rotacionando a câmera. Isso mantém o código simples e evita
  inconsistência de enquadramento entre cenas.
- **Dolly, nunca corte.** Movimento de câmera é sempre uma interpolação
  contínua de posição (`cameraZ` variando suavemente), nunca um salto.
  Faixas usadas até agora: Genesis `9 → 6.8` (aproximação sutil), Ecosystem
  `6 → -6` (travessia completa através da formação).
  Products mantém a câmera quase parada (`z = 5`, respiração de `±0.25`
  via seno) — quando o ambiente gira em vez de a câmera viajar, o
  observador fica parado para sentir a transformação, não a viagem.
- **FOV muda pouco.** Ecosystem varia `50° → 64°` ao longo de toda a
  travessia — uma abertura gradual de "espaço se abrindo", nunca um zoom
  agressivo. Cenas que não viajam (Genesis, Products) mantêm FOV fixo.

## Motion design / easing

- **`shared/easing.ts` → `easeInOutCubic` é a única curva usada em toda a
  experiência** (câmera, rotação, cor, opacidade). Não criar uma curva
  nova sem justificativa forte — a familiaridade da curva é parte da
  unidade estética.
- **O ambiente nunca fica estático.** Mesmo nas janelas de "hold" (Products
  segura cada produto em foco por `HOLD = 0.15` de seu progresso local
  para dar tempo de leitura), pelo menos uma propriedade contínua segue
  avançando sem gate — em Products é a rotação do grupo, dirigida
  diretamente pelo progresso bruto, nunca pelas janelas de estágio. Uma
  cena nunca deve ter um trecho onde absolutamente nada muda.
- **Transições internas usam `easeInOutCubic` em uma janela de transição
  dedicada**, tipicamente `~27%` do progresso local (`TRANSITION` em
  Products) — rápido o suficiente para não arrastar, suave o suficiente
  para não saltar.

## Continuidade entre cenas (crossfade da Timeline)

- **Overlap é fração do progresso da cena que termina, nunca tempo
  adicional** — a cena seguinte começa a entrar exatamente enquanto a
  anterior ainda está terminando, dentro do mesmo intervalo de scroll.
  Faixas usadas: `0.15–0.35` (nunca abaixo de `0.15`, que já soa abrupto
  em teste; nunca acima de `0.35`, que começa a "lavar" as duas cenas
  juntas por tempo demais).
- **Opacidades sempre somam exatamente 1** durante o overlap (validado
  por teste automatizado da `Timeline` a cada fase). Isso é o que garante
  que nunca existe frame preto nem frame com dupla exposição visível.
- **Regra de handoff:** o estado final de uma cena deve estar
  proximamente compatível com o estado inicial da próxima — mesma
  paleta dominante, mesmo nível de brilho, escala visual parecida. Core
  termina quase preto (frame 1 do reveal já é escuro); Genesis termina
  com a esfera de partículas formada — a costura funciona porque as duas
  pontas já são visualmente "quietas" e escuras antes de se tocarem.

## Iluminação

**Não existe iluminação tradicional (nenhuma `PointLight`/`DirectionalLight`
real é usada até agora).** Todo "brilho" vem de:
1. Cor emissiva do próprio material (`MeshBasicMaterial`, que ignora luzes
   da cena e sempre renderiza na cor plena — mais barato e mais previsível
   que luz real);
2. `THREE.AdditiveBlending`, que faz cores sobrepostas se somarem em vez
   de ocluírem — é isso que dá a sensação de "energia"/holograma sem
   precisar de pós-processamento.

Isso é uma escolha de performance deliberada, não uma limitação. Só
introduzir luzes reais se uma cena futura precisar de sombras projetadas
de verdade (nenhuma até agora precisou).

## Materiais

Todo material emissivo/de energia na experiência segue o mesmo preset:
```ts
{
  transparent: true,
  depthWrite: false,       // evita popping/z-fighting entre planos translúcidos
  blending: THREE.AdditiveBlending,
}
```
`depthWrite: false` é obrigatório em qualquer material transparente novo —
sem isso, planos aditivos começam a ocluir uns aos outros de forma
inconsistente conforme a câmera se move.

## Bloom / glow

**Não há passe de pós-processamento (`UnrealBloomPass` ou equivalente)
implementado ainda.** O "glow" que já existe é inteiramente uma ilusão
barata: sprites com textura de gradiente radial suave
(`shared/particleTexture.ts`) + blending aditivo + cor da marca. Isso é
suficiente para o nível de fidelidade atual e custa quase nada em GPU.

Se uma cena futura precisar de bloom de verdade (halo ao redor de bordas
duras, não só de sprites já suaves), avaliar `UnrealBloomPass` como uma
exceção deliberada — ele exige um `EffectComposer` compartilhado entre
cenas para não multiplicar o custo de render, o que teria que ser um novo
serviço em `SceneEngine`, não algo que cada cena monta sozinha.

## Partículas

- **Textura compartilhada:** `shared/particleTexture.ts` — gradiente
  radial 16×16 (`rgba(0,212,255,1)` no centro → `rgba(41,171,226,0.3)` →
  transparente). Nunca recriar essa textura numa cena nova; importar.
- **Tamanho:** sempre pequeno, `0.045–0.06` em unidades de mundo — a
  partícula é atmosfera, nunca o assunto principal do quadro.
- **Densidade por tier de dispositivo** (`lib/deviceTier.ts`), redução de
  ~60% no tier `low`: Genesis `700 → 280`, Ecosystem `260 → 110`, Products
  `180 → 80`. Uma cena nova deve seguir essa mesma proporção (~2.5×), não
  reinventar o corte.
- **`pixelRatioCap`:** `2` no tier `high`, `1.5` no tier `low` — sempre
  passado ao `WebGLRenderer.setPixelRatio`, nunca usar
  `window.devicePixelRatio` bruto (telas 3×+ desperdiçam fill-rate sem
  ganho perceptível nessa escala de elemento).

## Paleta de cores

**Fonte única: `src/data/products.ts` (`accent.from`/`accent.to` de cada
produto) e os tokens do `tailwind.config.js`.** Nunca redeclarar um hex à
mão numa cena nova — ler daí (`hexStringToInt` em `shared/colorLerp.ts`
converte a string `#RRGGBB` para o inteiro que o Three.js espera).

| Token | Hex | Uso |
|---|---|---|
| `neon-cyan` | `#29ABE2` | Cor primária da marca (Núcleo, Genesis, Reencontra) |
| `glow-blue` | `#00D4FF` | Realce/ponto quente (textura de partícula, Fusion AI) |
| `cyber-purple` | `#A855F7` | Secundária da marca (Ecosystem, Fusion Buy AI, Fusion AI) |
| `cyber-pink` | `#EC4899` | Acento quente (Fusion Buy AI) |
| `cyber-emerald` | `#10B981` | Status "disponível"/sucesso (Giro IA) |
| laranja Coffee Break | `#F97316` → `#F59E0B` | Única exceção quente-neutra da paleta — intencional, já é a identidade do produto no resto do site |

## Profundidade e composição

- **Formações em elipse/anel, não em grade.** Ecosystem e Products
  arranjam painéis em posições derivadas de `angle = (i/count) * 2π`
  (elipse) — nunca uma grade cartesiana, que lê como "UI", não como
  "espaço".
- **Espaçamento em Z tem propósito narrativo.** Em Ecosystem, o
  espaçamento em Z dos painéis É o que cria a sensação de "voar por
  entre eles"; em Products, o Z dos painéis é quase constante (a formação
  gira no lugar) — a profundidade serve à história de cada cena, não é
  decoração.
- **Sway/respiração sempre por `Math.sin`, nunca `Math.random()` por
  frame.** Vida orgânica vem de funções periódicas determinísticas
  (`sin(t * freq + fase)`), nunca de aleatoriedade recalculada a cada
  frame — isso manteria os testes determinísticos e evita jitter visual.

## Performance (não negociável em nenhuma cena nova)

- Zero alocação por frame: buffers (`Float32Array`, objetos de estado)
  são criados uma vez em `mount()`, mutados em `update()`/`render()`.
- `renderer.forceContextLoss()` antes de `dispose()` no `unmount()` —
  sempre, sem exceção (ver histórico de bug na Fase 1).
- Um `WebGLRenderer` por cena, nunca compartilhado — cada cena é
  independente e descartável.
