# Exemplo: "Crie uma nova apresentação cinematográfica para o projeto ANANKE"

Isto é um roteiro de trabalho, não conteúdo: **nenhum fato sobre o ANANKE está escrito aqui**. Todos eles saem do próprio projeto.

1. **Fontes.** O repositório `AlvaroTS1/Ananke` existe na conta. Se ele não estiver na sessão, peça para anexá-lo. Leia README, `package.json`, telas e textos públicos. Anote cada fato com o caminho do arquivo de onde ele saiu.
2. **Perguntas** (só as que as fontes não respondem): para quem é a apresentação, onde ela vai passar (site da ATS, página própria, redes) e se há identidade visual existente.
3. `npm run prod:new -- ananke "ANANKE"`
4. **`brief.md`**: tabela de fatos com fonte. Se o README não diz, não entra.
5. **`direcao-de-arte.md`**: um conceito central derivado *do que o ANANKE faz*. Escreva o significado de cada elemento visual; o que não tiver significado, corte.
6. **`roteiro.md`** e **`shots.json`**: de 3 a 6 cenas, `styleLock` idêntico em todas e encadeamento por `firstFrame` quando a peça for contínua.
7. `npm run prod:check -- ananke` → `npm run prod:prompts -- ananke` → entregue `production/ananke/prompts.md` ao usuário com o custo estimado.
8. Depois de cada download: `npm run prod:ingest -- ananke <cena> production/ananke/raw/<arquivo>.mp4`.
9. **Integração:** se o ANANKE for um produto da ATS que deve aparecer no site, adicione-o em `products.ts` com dados reais e coloque-o em `ECOSYSTEM_ORDER`. Se for uma apresentação própria, crie a rota `src/presentations/ananke/` seguindo `integracao-site.md`.
10. **Verificação** (build, testes, screenshots desktop e mobile, movimento reduzido) e commits por etapa.
