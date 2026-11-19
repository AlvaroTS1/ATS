# Brief — ATS Sistemas · Core Experience

## Objetivo
Fazer o visitante sentir, nos primeiros segundos, que entrou num ambiente tecnológico, e não num site empresarial comum. Depois, levá-lo aos produtos reais da ATS.

## Público
- Empresas, condomínios, associações e cooperativas avaliando VOTRIX, Reencontra, Fusion Buy AI e Coffee Break.
- Parceiros e pessoas que querem saber "quem é a ATS".
- A maior parte do tráfego vem do celular: o mobile é a referência, e não uma versão reduzida do desktop.

## Fatos (fonte única: o próprio site)
Nada do que for dito ou mostrado pode ir além disto:

| Fato | Fonte no código |
|---|---|
| ATS Sistemas de Automações, CNPJ 65.402.484/0001-40, Espumoso/RS | `index.html`, `Footer.tsx` |
| Ecossistema de 6 produtos: 4 disponíveis, 2 em construção | `src/data/products.ts` |
| VOTRIX: cédula cifrada no aparelho, credencial única e anônima, votos selados num quadro público encadeado por hashes, raízes de Merkle carimbadas no Bitcoin | `products.ts` (votrix) |
| Reencontra: QR Codes de proteção familiar, localização em tempo real, SOS com biometria | `products.ts` (reencontra) |
| Fusion Buy AI: assistente de compras conversacional | `products.ts` (fusion-buy) |
| Coffee Break: app Android publicado na Play Store | `products.ts` (coffee-break) |
| Fusion AI e Giro IA: em construção, com lista de espera | `products.ts`, `RoadmapSection.tsx` |
| Serviços: apps móveis, agentes de IA, chatbots, automação de processos, plataformas web e SaaS, soluções sob medida | `ServicesSection.tsx` |
| Valores: confiança, inteligência aplicada ("IA para resolver problemas concretos, não para parecer moderna"), ecossistema integrado | `AboutSection.tsx` |

**Proibido:** inventar números de clientes, métricas, depoimentos, parcerias, certificações ou recursos que não estejam acima.

## Mensagens (em ordem)
1. Tecnologia que resolve problemas reais (H1, já usado no site).
2. Pessoas + IA + engenharia trabalhando como uma rede.
3. Um ecossistema, e não aplicativos isolados.
4. Tecnologia construída por dentro (desenvolvimento próprio; prova concreta: VOTRIX).
5. O próximo produto já está a caminho.

## Identidade a preservar
A esfera metálica com "ATS" em ciano que se abre num núcleo de energia (`public/cinematic/nucleus`). Ela é a abertura e a referência de cor de todo o resto.

## Entregáveis
- Experiência no site: `src/components/experience/CoreExperience.tsx`.
- Camadas de vídeo do Dreamina: `shots.json` → `prompts.md` → `npm run prod:ingest`.
- Teaser vertical de 15 s para redes sociais (t01–t03), encadeado quadro a quadro.
