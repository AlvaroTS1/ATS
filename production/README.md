# Produção audiovisual — fluxo Claude + Dreamina

Cada pasta aqui é uma **produção**: um conjunto de cenas de vídeo planejadas, geradas no Dreamina e integradas a um site ou a uma peça.

```
production/<slug>/
  brief.md            fatos reais (com fonte), público, mensagens
  direcao-de-arte.md  conceito, significado de cada elemento, paleta, regras
  roteiro.md          cenas, duração, objetivo, transições
  shots.json          FONTE DE VERDADE — uma entrada por cena (validada)
  prompts.md          GERADO a partir de shots.json: prompts prontos para colar no Dreamina
  references/         imagens de referência e quadros de continuidade (gerados na ingestão)
  raw/                downloads do Dreamina (ignorado pelo git)
```

## Comandos
| Comando | O que faz |
|---|---|
| `npm run prod:new -- <slug> "Nome"` | cria a produção a partir de `_template/` |
| `npm run prod:check -- <slug>` | valida timeline, referências, continuidade, modos e orçamento |
| `npm run prod:prompts -- <slug>` | gera `prompts.md` (configuração do Dreamina + prompt + checklist por cena) |
| `npm run prod:ingest -- <slug> <cena> <arquivo.mp4>` | codifica as versões web (MP4/WebM para desktop e mobile, pôster), extrai o primeiro e o último quadro para a continuidade e registra a cena em `src/experience/media.manifest.json` |

Requisito: `ffmpeg` (Windows: `winget install Gyan.FFmpeg`). Nada aqui acessa a internet, a conta do Dreamina ou cookies. A geração é feita por você, no Dreamina.

## Por que é híbrido
O Dreamina não oferece API para assinantes. A API oficial do Seedance é a BytePlus ModelArk: cobrança por uso, conta separada e disponibilidade do 2.5 não confirmada. Wrappers não oficiais funcionam com a sessão ou os cookies da conta, e por isso estão **fora** deste fluxo. Se um dia a API oficial for adotada, só muda o passo "gerar": `shots.json`, prompts, ingestão e integração continuam iguais.
