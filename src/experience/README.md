# ATS Core Experience

A abertura cinematográfica do site: cinco capítulos (Núcleo → Inteligência → Ecossistema → Inovação → Futuro) num único mundo 3D, com câmera contínua e sem cortes.

```
CoreExperience.tsx (palco fixo, rolagem → progresso suavizado)
 ├─ 1. CoreWorld (Three.js, chunk separado)   world/CoreWorld.ts · layout.ts · materials.ts
 ├─ 2. Camadas Dreamina (<video>, blend screen) media.manifest.json  ← npm run prod:ingest
 ├─ 3. Filmagem de abertura (frames da esfera)  FootageLayer.ts
 └─ 4. Interface DOM acessível                  chapters.ts (textos) + data/products.ts (painéis)
```

| Arquivo | Responsabilidade |
|---|---|
| `chapters.ts` | narrativa em dados: textos, duração de cada capítulo em telas de rolagem, foco dos produtos |
| `world/layout.ts` | onde fica cada coisa e onde está a câmera em qualquer ponto da jornada (puro, testado contra saltos) |
| `world/CoreWorld.ts` | núcleo, rede de três grupos, órbita dos produtos, corrente de hashes com árvore de Merkle, bloom e qualidade adaptativos |
| `FootageLayer.ts` | frames da esfera ATS controlados pela rolagem, alinhados ao núcleo 3D na passagem |
| `media.ts` / `media.manifest.json` | quais vídeos existem e em que estado |
| `components/experience/StaticExperience.tsx` | fallback sem movimento (reduced motion / sem WebGL) |

## Garantias
- O H1, os CTAs e o pôster aparecem sem esperar o Three.js, que carrega no idle num chunk de ~144 KB gzip.
- `prefers-reduced-motion` ou falta de WebGL ativam o fallback estático, sem canvas e sem nenhuma requisição de vídeo ou frames.
- Aparelhos fracos (`lib/deviceTier.ts`) recebem menos partículas, DPR ≤ 1,25, sem bloom e metade dos frames. Se o FPS cair, o bloom é desligado e depois o DPR baixa para 1.
- O loop 3D pausa fora da tela (IntersectionObserver) e com a aba oculta.
- Um vídeo do Dreamina só é baixado quando o capítulo dele está a um capítulo de distância.

## Testes
`npm test`: continuidade dos capítulos, câmera sem saltos (desktop e retrato), produtos apenas de `data/products.ts`, manifesto, validador de produção e prompts.

A abertura anterior (`components/CinematicExperience.tsx`, filme do Guardião) e o motor de cenas antigo (`src/cinematic/`) continuam no repositório. `FootageLayer` e os utilitários de `src/cinematic/shared` vêm desse trabalho.
