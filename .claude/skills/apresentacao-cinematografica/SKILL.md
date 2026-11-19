---
name: apresentacao-cinematografica
description: Diretor criativo + roteirista + planejador audiovisual + desenvolvedor para apresentações cinematográficas da ATS. Use quando pedirem "crie uma apresentação cinematográfica para o projeto X", um vídeo, teaser, clipe ou cena para o Dreamina/Seedance, prompts de vídeo, ou quando um vídeo gerado no Dreamina precisar entrar no site (ingestão, camadas, experiência 3D).
---

# Apresentação cinematográfica (Claude + Dreamina + Three.js)

Você conduz a produção de ponta a ponta. **O Dreamina gera; você planeja, escreve, organiza, integra e verifica.** A geração no Dreamina é sempre feita pelo usuário, na interface do Dreamina.

## Regras inegociáveis
1. **Fatos só com fonte.** Antes de escrever qualquer coisa, entenda o projeto por fontes reais: README e código do repositório, a página publicada, `src/data/products.ts`. Todo fato do roteiro aparece em `brief.md` com a sua fonte. Não invente métricas, clientes, depoimentos ou recursos.
2. **Nada de automação da conta do Dreamina.** Não use extensões, wrappers não oficiais (por exemplo, APIs que usam a sessão ou os cookies da conta), automação de navegador logado nem exportação de cookies. O fluxo é híbrido e a geração é manual. A única via automática aceitável é a API oficial (BytePlus ModelArk), com contrato e chave próprios, e só se o usuário pedir.
3. **Créditos são do usuário.** Mostre a estimativa por cena (`prompts.md`) e recomende o rascunho barato (Seedance 2.0 Mini, 5 s, 720P) antes de cada final. As estimativas não são oficiais; diga isso.
4. **Sem texto, logo ou pessoa gerados no vídeo.** Todo texto é HTML real (acessível, nítido, indexável). Exceção: `keepExistingMark` quando o último quadro fornecido já contém a marca.
5. **Continuidade por quadro real.** A cena seguinte começa no último quadro *extraído* da anterior (`references/<cena>-ultimo-quadro.png`, gerado pelo `prod:ingest`), nunca num quadro inventado.

## Fluxo — "Crie uma nova apresentação cinematográfica para o projeto X"

1. **Entender o projeto.** Localize o repositório (se não estiver na sessão, peça para anexá-lo) e leia README, telas e textos públicos. Se faltar informação, pergunte, em vez de supor.
2. **Criar a produção:** `npm run prod:new -- <slug> "<Nome>"`.
3. **`brief.md`**: objetivo, público, tabela de fatos com fonte, mensagens em ordem e identidade a preservar.
4. **`direcao-de-arte.md`**: um conceito central nomeável e, para cada elemento visual, *o que ele comunica*. Elemento sem significado sai. Defina paleta em hex, câmera, luz e tipografia.
5. **`roteiro.md`**: 3 a 6 cenas. Para cada uma: duração, objetivo, imagem, texto (DOM) e transição de saída. Uma narrativa contínua, sem cenas soltas.
6. **`shots.json`**: uma entrada por cena. Leia `references/dreamina-guia.md` antes de escrever, porque ali estão a gramática do prompt e os limites do modelo. Campos obrigatórios:
   - `goal` (em inglês, uma frase);
   - `timeline` com trechos `"0-3s"` contíguos que somam `duration`;
   - `camera`, `lighting`, `composition`, `mode`, `aspect`, `resolution`;
   - `references` com `role`, e `firstFrame`/`lastFrame` quando houver encadeamento.
   
   O `styleLock` é **idêntico** em todas as cenas.
7. **Validar e gerar os prompts:** `npm run prod:check -- <slug>` e depois `npm run prod:prompts -- <slug>`. Corrija até não restar nenhum erro.
8. **Entregar ao usuário** o `prompts.md`: o que configurar no Dreamina, o prompt para colar, as referências a anexar e o custo estimado. Indique também a ordem de geração (as cenas encadeadas ficam bloqueadas até a anterior ser ingerida).
9. **Ingerir** cada MP4 baixado: `npm run prod:ingest -- <slug> <cena> production/<slug>/raw/<arquivo>.mp4`. O comando codifica, extrai os quadros de continuidade e registra no manifesto. Depois, rode `prod:check` de novo.
10. **Integrar e construir a experiência.** Leia `references/integracao-site.md`. Existem três caminhos: camada sobre o mundo 3D, cena de frames controlada pela rolagem, ou peça avulsa (teaser) montada com ffmpeg.
11. **Verificar:**
    - `npm run check`, `npm test` e `npm run build`;
    - screenshots em desktop (1440×900) e mobile (390×844) em vários pontos da jornada, com Playwright;
    - modo `prefers-reduced-motion` sem nenhum vídeo carregado.
    
    Relate o que foi verificado de fato. Nunca diga que testou num aparelho físico se não testou.
12. **Commits pequenos**, um por etapa (produção, integração, ajustes visuais).

## Onde está cada coisa
| Arquivo | Papel |
|---|---|
| `src/experience/chapters.ts` | narrativa do site ATS em dados (textos, duração em telas) |
| `src/experience/world/CoreWorld.ts` | mundo 3D único (núcleo, rede, órbita, corrente, câmera) |
| `src/experience/world/layout.ts` | coreografia de câmera pura e testada (sem saltos) |
| `src/experience/media.manifest.json` | quais vídeos existem — reescrito pelo `prod:ingest` |
| `src/components/experience/CoreExperience.tsx` | palco fixo, camadas, DOM, fallbacks |
| `scripts/cinematic/cli.mjs` + `lib.mjs` | CLI de produção (validação, prompts, ingestão) |
| `production/ats-site/` | produção de referência completa (use como exemplo) |

## Exemplos
- Produção completa de referência: `production/ats-site/` (5 capítulos e um teaser de 3 cenas encadeadas).
- Passo a passo para um projeto novo: `references/exemplo-ananke.md`.
