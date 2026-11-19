# Direção de arte — ATS Core Experience

**Conceito central:** *o visitante entra no núcleo e o vê se tornar um ecossistema.* Um único lugar e uma única câmera, sem cortes. O núcleo do capítulo 1 é o mesmo objeto que os produtos orbitam no capítulo 3 e que a corrente de blocos sustenta, por baixo, no capítulo 4.

## O que cada elemento comunica
| Elemento | Significado | Onde |
|---|---|---|
| Esfera metálica ATS que se abre | identidade; tecnologia que guarda algo vivo dentro | Cap. 1 (filmagem existente) |
| Núcleo de energia | a inteligência da ATS, a origem de tudo | todos os capítulos |
| Rede em três cores que se unem | pessoas (branco), IA (ciano), engenharia (violeta) | Cap. 2 |
| Seis corpos em órbita, cada um com a cor do produto | ecossistema; disponível = esfera de energia plena, em construção = estrutura em wireframe | Cap. 3 |
| Linha de energia do núcleo ao produto em foco | todo produto nasce do mesmo núcleo | Cap. 3 |
| Blocos encadeados, árvore de Merkle, feixe para o alto | desenvolvimento próprio, com a prova real do VOTRIX (hashes, Merkle, carimbo no Bitcoin) | Cap. 4 |
| Grade de infraestrutura sob a corrente | base técnica, aquilo que sustenta os produtos | Cap. 4–5 |
| Plano geral final com tudo aceso | visão de futuro: o sistema completo e crescendo | Cap. 5 |

## Paleta (fonte: `tailwind.config.js` e `products.ts`)
- Fundo `#030712` (space-black). Nunca preto puro na interface; preto puro apenas nos vídeos de camada.
- Luz dominante: ciano `#29ABE2` e azul elétrico `#00D4FF`.
- Acento secundário: violeta `#A855F7`.
- Branco frio `#EAF6FF`: só nos pontos mais quentes.
- Cores dos produtos: somente na órbita e nos painéis (gradientes `accent.from → accent.to`).

## Câmera
- Um travelling contínuo, sem cortes. Cada capítulo começa exatamente onde o anterior terminou (`world/layout.ts`, com teste automatizado que garante ausência de saltos).
- Uma única curva de easing (`easeInOutCubic`).
- Foco nos produtos: o produto fica deslocado do centro (à direita no desktop, no alto no celular), com espaço para o painel.

## Luz e materiais
Apenas emissivos e aditivos: não há luzes reais. O bloom só aparece em aparelhos fortes e é desligado sozinho se o FPS cair.

## Tipografia
Inter, já usada no site. Títulos em black e tracking apertado; sobretítulos em caixa-alta com tracking largo e em ciano.

## Regras para os vídeos do Dreamina
1. **Fundo preto puro** nas camadas, porque entram em `screen` e o preto vira transparente.
2. **Um movimento só por clipe**, lento, em velocidade constante e sem cortes.
3. **Sem texto, logos ou pessoas.** Todo texto é HTML.
4. **Sujeito no centro seguro (40%)**: o mobile é um recorte 9:16 do mesmo arquivo.
5. **Loop**: o último segundo volta à composição do primeiro.
6. **Mesmo preâmbulo de estilo** (`styleLock`) em todas as cenas, palavra por palavra.
7. **Continuidade por quadro real**: a cena seguinte começa no último quadro *extraído* da anterior, nunca num quadro imaginado.
