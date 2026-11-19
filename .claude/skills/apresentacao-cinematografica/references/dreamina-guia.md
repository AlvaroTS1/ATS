# Guia Dreamina / Seedance para prompts de vídeo

Estado pesquisado em 2026-11. Confirme sempre na interface do Dreamina, porque recursos, limites e créditos mudam por região e por plano.

## O que o modelo aceita (Seedance 2.5 no Dreamina)
| Item | Valor | Confiança |
|---|---|---|
| Duração por geração | 4–30 s (Seedance 2.0 Mini: 4–15 s) | documentação de terceiros + interface |
| Proporções | 21:9, 16:9, 4:3, 1:1, 3:4, 9:16 | idem |
| Resoluções | 480P, 720P, 1080P | idem |
| Modos | texto para vídeo; primeiro quadro; primeiro e último quadro; referências (all-in-one/omni) | idem |
| Referências | a interface aceita muitas; o modelo mantém com confiabilidade **até ~7 papéis** | relato de uso |
| Sintaxe de referência | `@Image N defines …` liga a N-ésima imagem enviada | relato de uso |
| Edição | estender, editar, upscale, interpolar 60 fps, trilha, regenerar (na tela de detalhe do clipe) | interface |
| Áudio/fala | gera som; falas entre `{ }` em 11 idiomas, sem português | relato de terceiros; não verificado |

Créditos (estimativa de terceiros, 03/09/2026), por segundo: Seedance 2.5 = 17 (480P), 37 (720P), 91 (1080P); Mini 720P ≈ 5. O custo é linear na duração e multiplicado pelo número de variações. **A geração manual e a automatizada custam o mesmo.**

## API
- **Dreamina (assinatura):** sem API pública.
- **Oficial:** BytePlus ModelArk (`dreamina-seedance-2-5-…`), cobrança por segundo/token, conta separada. A disponibilidade do 2.5 para o público não foi confirmada em 2026-11.
- **Não oficiais** (wrappers que usam a sessão ou os cookies da conta): **não usar.** Expõem a conta e violam os termos ("scripts automatizados para interagir com os Serviços").

## Gramática do prompt (montada pelo `prod:prompts`)
```text
[Generation Goal] uma frase: sujeito único + ação única, "on pure black" para camadas
[Style lock] preâmbulo idêntico em todas as cenas (paleta hex, luz, lente, textura)
[Reference roles] @Image 1 defines <o que exatamente, e o que NÃO>.
[Continuity] começa exatamente no primeiro quadro fornecido…
[0-3s] estado inicial
[3-6s] a transformação
[6-8s] estado resolvido (loop: volta à composição do início)
Camera: UM movimento
Lighting: fontes e cores
Composition: onde fica o sujeito (centro seguro para o 9:16)
Constraints: contrato de filmagem (sem cortes, exposição travada, sem texto/logo/pessoas, NO BGM…)
```

## Como escrever para vídeo (e não para imagem)
- Descreva **mudança no tempo**, não um quadro. Cada trecho da timeline traz um verbo de movimento.
- **Um movimento de câmera por clipe.** "Lento, velocidade constante." Movimentos combinados (orbit + zoom + pan) geram tremor e deformação.
- **Estados nas duas pontas:** o começo e o fim precisam ser legíveis como quadros parados, porque o site pode segurar qualquer quadro.
- **Física possível:** nada atravessa sólidos sem motivo, e a escala e a direção de luz se mantêm.
- **Continuidade:** mantenha direção e velocidade iguais dos dois lados da emenda. A posição vem do quadro real; a velocidade vem do texto.
- **Personagens:** só se forem essenciais. Nesse caso, use uma folha de referência fixa como `@Image 1` em todas as cenas e descreva roupa e traços sempre com as mesmas palavras.

## Checklist de aprovação do clipe
- [ ] sem cortes, sem tremor, sem flicker de exposição
- [ ] sem texto, logo ou marca d'água inventados
- [ ] fundo preto puro (camadas `screen`)
- [ ] sujeito inteiro no recorte central 9:16
- [ ] primeiro e último quadro resolvidos; loop sem salto
- [ ] paleta dentro do `styleLock`
- [ ] duração e proporção iguais às planejadas (o `prod:ingest` avisa quando diferem)
