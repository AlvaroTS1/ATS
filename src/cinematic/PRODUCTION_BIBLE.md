# Production Bible — Filme Cinematográfico ATS

> **Atualização pós-produção:** os 4 vídeos oficiais entregues (Núcleo,
> Portal, Entrada no Ecossistema, Ambiente Holográfico Principal) vieram
> em **16:9 paisagem**, não 9:16 como este documento planejou — uma tomada
> única contínua de 40s, não clipes independentes. A regra de aspecto
> vigente agora está em `ART_DIRECTION.md § Aspecto e enquadramento`. Este
> documento permanece como registro do raciocínio de direção original;
> os prompts abaixo continuam válidos como referência de linguagem
> cinematográfica para produções futuras, só a proporção de tela mudou.

**Direção Criativa, Fotografia, Arte e Supervisão Técnica.**
Documento oficial de produção para os assets em vídeo/imagem gerados no Dreamina e integrados à Scene Engine (`src/cinematic/`).

Este não é um documento de inspiração. É um guia de produção. Toda cena aqui já tem uma contraparte funcionando hoje em Three.js — este documento define o que substitui, o que complementa e o que permanece procedural, e por quê.

---

## Regras-mestre (valem para toda cena deste documento)

**1. Uma única produção, oito capítulos.** Nenhum vídeo pode parecer um clipe isolado. Regra prática: toda cena herda a paleta e a "temperatura de luz" exatas de `ART_DIRECTION.md` — nunca inventar uma cor nova, nunca sair do esquema aditivo/emissivo (sem sombra dura, sem luz ambiente quente, sem contraste teal-orange genérico de stock footage).

**2. Conversão scroll → duração.** A Cena Core já estabeleceu a régua: **1500px de scroll = 10s de vídeo fonte = 150px por segundo.** Toda duração recomendada abaixo deriva dessa proporção, para que o ritmo entre cenas nunca pareça arbitrário.

**3. Aspecto único: 9:16 (retrato), sempre.** A Cena Core já usa retrato (720×1280, enquadrado em letterbox "cinema screen" dentro do canvas). Toda cena nova em vídeo/imagem PRECISA nascer em 9:16 — misturar aspectos criaria um "acordeão" visual entre cenas, quebrando a sensação de filme único.

**4. Pipeline técnico já existe e é o padrão.** Extração de frames via `ffmpeg` (script já usado na Cena Core), formato de entrega **WebP sequence** (não MP4 solto) — é o que o `AssetManager`/`CoreRenderer` já sabem consumir sem nenhuma linha nova de engenharia. `VideoSource.ts` (seek em `<video>`) existe como alternativa para uma futura camada ambiente/looping, mas não é o caminho recomendado para nenhuma cena narrativa deste documento.

**5. Zero elemento humano, zero texto embutido, zero logotipo genérico.** A marca entra via overlay HTML da própria Scene Engine (como já acontece na Cena Products) ou via elementos abstratos gerados nesta pipeline (como o "Em breve" da Fusion AI) — nunca "queimado" no vídeo.

---

## 1. GENESIS

| Campo | Definição |
|---|---|
| **Objetivo emocional** | Mistério, curiosidade, expectativa |
| **Duração ideal** | 6s (900px ÷ 150px/s) — tempo mínimo para completar a convergência de partículas sem parecer apressado, e curto o bastante para não gastar a paciência do visitante antes mesmo do primeiro texto |
| **Tipo de cena** | **Manter Three.js/Procedural.** Não recomendo vídeo aqui. |

**Por quê permanece procedural:** esta é a única cena onde o usuário controla a velocidade da convergência com o próprio dedo/scroll — role rápido, as partículas convergem rápido; role devagar, elas pairam. Um vídeo fixo faria isso "andar em degraus" (stepping de frame), exatamente o problema que a extração de 240 frames da Core já expôs e que a arquitetura foi desenhada para evitar nas cenas onde a interação é o ponto central. Genesis É a cena de abertura — não pode ter o menor soluço.

**Uso recomendado do Dreamina aqui:** gerar 1 **imagem** de referência ("energy spark" de alta definição) para servir de textura da partícula em `shared/particleTexture.ts`, substituindo o gradiente radial gerado por canvas por um sprite de maior fidelidade. Enriquecimento, não substituição.

**Prompt cinematográfico (para a imagem de referência da partícula):**
> Macro extreme close-up of a single point of pure energy suspended in absolute darkness, cinematic sci-fi still frame, 9:16 vertical. A tiny luminous spark of electric cyan (#29ABE2) light with a soft glowing blue-white core (#00D4FF), surrounded by a delicate halo of chromatic aberration and lens bloom. Volumetric micro-particles of dust catching the light around it. Shot on a macro lens, extremely shallow depth of field, perfect radial falloff from center to transparent edges, no hard boundary. Studio black background, absolute void, no visible surface or floor. High-end product photography lighting — a single soft key light source from within the spark itself, no external light. 8K render quality, physically-based rendering, subtle film grain, no banding in the glow gradient. The image must read as pure light and energy, not as an object.

**Negative prompt:**
> cartoon, anime, illustration, low quality, blurry, text, watermark, logo, humans, hands, faces, characters, saturated rainbow colors, warm orange tones, red tones, green tones, hard shadows, visible floor or surface, background scenery, multiple sparks, symmetry grid, UI elements, lens flare streaks (non-radial), noise, flicker, jpeg artifacts, oversharpened edges

**Movimento de câmera:** N/A (still frame de referência, não vídeo).

**Continuidade:** o frame final da convergência procedural (esfera de partículas formada, câmera em z=6.8) precisa bater com o **frame 1 do Core** — que já é quase preto por natureza. Não requer ação nova; a continuidade já existe e está validada.

**Ponto de entrada na Scene Engine:** nenhum — `scenes/genesis/` permanece 100% Three.js. Só a textura de `shared/particleTexture.ts` seria trocada, e isso beneficiaria Genesis, Ecosystem, Products e Return simultaneamente (é a mesma textura compartilhada).

**Peso ideal:** a imagem de referência é um asset de build-time (vira uma textura de ~16×16 a ~64×64px depois de processada) — peso final irrelevante, não é um asset servido por cena.

---

## 2. CORE

| Campo | Definição |
|---|---|
| **Objetivo emocional** | Tecnologia, precisão, engenharia, "isso está vivo" |
| **Duração ideal** | 10s (1500px ÷ 150px/s) — já é a duração exata do asset atual; manter para compatibilidade total com o `PIN_DISTANCE` já commitado |
| **Tipo de cena** | **Dreamina vídeo — recomendo um re-shoot (Core v2).** |

**Por quê recomendo refazer:** o asset atual foi o primeiro vídeo gerado nesta produção, antes de qualquer diretriz de arte existir. Ele cumpre a função, mas a qualidade de produção do resto da experiência (Ecosystem, Products) já subiu — a esfera precisa acompanhar. Esta é a cena mais vista de toda a experiência (é a primeira metade inteira do filme, 900–2085px de 6830px totais) — o investimento aqui tem o maior retorno por segundo assistido.

**Prompt cinematográfico:**
> Ultra-detailed 9:16 vertical cinematic CGI product reveal, 10 seconds, seamless continuous shot. A perfectly spherical mechanical orb — the "Núcleo ATS" — hovers in absolute darkness. Surface made of interlocking dark gunmetal and matte black armor plates with micro-beveled edges, each seam lined with a thin channel of glowing electric cyan (#29ABE2) light that pulses gently like a heartbeat, synchronized across all plates. The orb rotates slowly and smoothly on its vertical axis throughout the entire shot — no stutters, constant angular velocity. At 0–4s: the sphere is fully closed, camera holds a slow, almost imperceptible push-in (dolly), light pulses travel along the seams like data packets moving through circuitry. At 4–7s: the armor plates begin to mechanically separate and rotate outward — heavy, deliberate, engineered movement, like a bank vault or a piece of precision Swiss watchmaking, NEVER an explosion, always weighted and controlled, each plate has visible mass and momentum, subtle motion blur on fast-moving plate edges only. At 7–10s: the interior is revealed — a blinding core of pure blue-white energy (#00D4FF) with cyan (#29ABE2) and violet (#A855F7) plasma tendrils swirling inside it, volumetric light rays escaping through the gaps between plates, god rays cutting through a thin haze of suspended particles. Camera continues its slow push-in throughout, ending centered and close on the exposed energy core, filling roughly 70% of frame height. Materials: brushed dark metal with anisotropic reflections, physically-based rendering, subtle fingerprint-free specular highlights, no dust or scratches (pristine, factory-new). Lighting: entirely self-illuminated by the orb itself plus two soft rim lights (cyan from upper-left, violet from lower-right) to separate silhouette from the black background — no visible light source, no studio floor, no environment reflections beyond the orb's own glow. Lens: 50mm equivalent, shallow-to-medium depth of field, very subtle anamorphic bokeh on background particles, no visible lens distortion. Atmosphere: sparse floating dust motes catching rim light, extremely subtle film grain, no fog. Color grading: near-monochrome black base with cyan/blue/violet as the only chromatic information — zero warm tones anywhere in frame. The final frame must end on the fully-open core at peak brightness, perfectly centered, ready to be intercut with the next shot.

**Negative prompt:**
> cartoon, anime, illustration, low quality, blurry, motion stutter, frame skipping, text, watermark, logo, subtitles, humans, hands, faces, robots with faces, explosion, fire, sparks flying outward violently, debris, warm orange tones, red tones, green tones, rainbow colors, lens flare streaks, hard shadows, visible studio floor, visible background scenery, camera shake, handheld wobble, zoom snap, jump cuts, oversaturation, banding, compression artifacts, noise, flicker, out of focus core, asymmetrical rotation, plates flying off independently, cheap sci-fi look, plastic material look

**Movimento de câmera:** **push-in (dolly) contínuo e único** do início ao fim, sem cortes internos — velocidade constante, levemente acelerando (`ease-in`) nos últimos 20% para dar ênfase ao clímax da abertura. Sem orbit, sem pan, sem tilt — a única variável é a distância.

**Continuidade:** primeiro frame quase preto (silhueta apenas emergindo) para conectar com o fim de Genesis; último frame = núcleo de energia totalmente aberto e centralizado, no pico de brilho — precisa entregar exatamente o enquadramento que a Cena Ecosystem espera encontrar (câmera entrando "para dentro" da esfera).

**Ponto de entrada na Scene Engine:** substitui `public/cinematic/frame-001..240.webp` (consumido por `scenes/core/CoreRenderer.ts` via `core.assets.ts`). **Zero mudança de código** — é um drop-in replacement do mesmo pipeline já em produção (extrair com o mesmo comando `ffmpeg` documentado na sessão de implementação: `fps=24,scale=640:-2`, `libwebp -quality 72`).

**Peso ideal:** manter o padrão validado — 24fps × 10s = 240 frames, WebP q72 em 640px de largura, **~9.8MB total** (já confirmado em produção). Não subir resolução além de 720px de largura sem testar impacto no LCP.

---

## 3. ECOSYSTEM

| Campo | Definição |
|---|---|
| **Objetivo emocional** | Espaço, escala, inteligência, "entrei em algo maior" |
| **Duração ideal** | 7s (1000px ÷ 150px/s, arredondado) |
| **Tipo de cena** | **Híbrido.** Manter os painéis procedurais (a opacidade de cada um depende matematicamente da distância até a câmera — isso não é reproduzível em vídeo fixo), complementado por um **vídeo de ambiente/fundo** gerado no Dreamina. |

**Por quê híbrido:** o efeito de "voar por entre painéis holográficos que aparecem e desaparecem" É a distância câmera-painel calculada em tempo real (`EcosystemAnimator.ts`, falloff gaussiano) — sacrificar isso por vídeo fixo perderia a resposta ao scroll. Mas o FUNDO por trás dos painéis hoje é só grid+glow CSS; um vídeo de "túnel de luz/espaço de dados" atrás dos painéis (renderizado como uma textura de fundo com blend aditivo, opacidade fixa) daria profundidade real sem tocar na lógica dos painéis.

**Prompt cinematográfico (vídeo de fundo/ambiente):**
> Abstract cinematic 9:16 vertical background plate, 7 seconds, seamless loop-friendly. An infinite dark tunnel of suspended light — thin luminous data-stream lines in electric cyan (#29ABE2), cyber violet (#A855F7) and glow blue (#00D4FF) stretch from extreme foreground to a vanishing point deep in the frame, flowing continuously past camera like light-speed travel but WITHOUT any starburst or lens-flare streak effect — the lines are thin, precise, engineered, like fiber-optic threads, not "warp speed" sci-fi cliché. Extremely sparse floating particles of dust catch soft rim light as they drift slowly past camera at varying depths, creating genuine parallax. The camera is stationary relative to the tunnel's center axis — only the light lines and particles move past it, receding toward the vanishing point at a slow, constant, meditative speed (this is atmosphere, not a race). Background is pure black void beyond the light lines — no walls, no geometry, no structure, only lines and particles suspended in nothing. Lighting is entirely self-emissive from the lines themselves; extremely subtle volumetric haze near the camera only, clearing to pure black in the distance. Lens: wide-angle equivalent (24mm), deep focus throughout — everything from foreground to vanishing point stays reasonably sharp, this is an environment plate meant to sit behind other elements, not a hero shot with shallow DOF. Color grading: cool, desaturated, near-monochrome with the three brand hues as the only saturated color information. No camera shake, no handheld movement — perfectly stable, locked-off feel despite the flowing lines.

**Negative prompt:**
> cartoon, anime, low quality, blurry, text, watermark, logo, humans, faces, warp speed starburst, lens flare streaks, hyperspace jump effect, warm tones, red tones, green tones, rainbow colors, geometric grid floor, visible walls or tunnel structure, hard edges on light lines, camera shake, spinning camera, fast erratic motion, noise, flicker, compression banding, oversaturation, glowing orbs (reserved for other scenes, do not duplicate here), particles moving toward camera aggressively

**Movimento de câmera:** **estática relativa ao túnel** — a câmera não se move; o movimento é inteiramente das linhas de luz e partículas fluindo através do quadro, criando parallax sem exigir qualquer keyframe de câmera. Isso é deliberado: a câmera "real" desta cena, no site, é a câmera procedural do `EcosystemRenderer` (que sim faz o dolly através dos painéis) — o vídeo de fundo precisa ser neutro o bastante para não competir com esse movimento.

**Continuidade:** por ser um plano de fundo em loop (não uma narrativa com início/fim definidos), a costura é trivial — entra e sai em crossfade puro de opacidade, controlado pelo `Timeline` exatamente como as outras cenas.

**Ponto de entrada na Scene Engine:** **novo** — hoje não existe. Precisaria de um pequeno acréscimo (não arquitetural, só um asset a mais): `EcosystemRenderer.ts` ganharia uma segunda textura de fundo (sequência de frames desenhada ANTES dos painéis no mesmo canvas, `ctx.drawImage` com blend aditivo antes de `renderer.render()` do WebGL — ou, mais simples, uma segunda `<canvas>` 2D empilhada abaixo do canvas WebGL do Ecosystem, seguindo exatamente o padrão que `CinematicExperience.tsx` já usa para empilhar cenas). Prioridade: **opcional, não bloqueante** — a cena já funciona bem sem isso.

**Peso ideal:** 24fps × 7s = 168 frames, WebP q70 (fundo pode tolerar compressão um pouco mais agressiva que hero shots, já que fica atrás de elementos em primeiro plano), 640px largura, estimado **~6–7MB**.

---

## 4. REENCONTRA

| Campo | Definição |
|---|---|
| **Objetivo emocional** | Segurança, conexão, proteção, confiança |
| **Duração ideal** | 6.7s (⅓ de 3000px ÷ 150px/s — a fatia da cena Products dedicada a este produto) |
| **Tipo de cena** | **Manter Three.js/Procedural (dentro da cena `products`).** Prompt abaixo é material de referência para uma eventual evolução futura, não uma recomendação imediata. |

**Por quê permanece procedural:** a Cena Products não é 3 vídeos — é **uma única cena contínua** (`scenes/products/`) onde a MESMA formação de painéis gira e recolore ao vivo, usando as cores reais de `data/products.ts`. Trocar por vídeo fixo quebraria exatamente a decisão de direção que você tomou na Fase 3 ("sem parecer três telas diferentes") — um vídeo tem início e fim fixos, não pode "girar e se transformar" de forma matematicamente contínua com a próxima cor. Se cores de marca mudarem no `products.ts` no futuro, o vídeo ficaria desatualizado; o procedural nunca fica.

**Prompt cinematográfico (referência para eventual mockup de produto dentro do painel):**
> Extreme close-up cinematic product UI shot, 9:16 vertical, 7 seconds. A holographic interface panel floats in dark space, displaying an abstract map interface glowing in electric cyan (#29ABE2) transitioning to soft indigo (#6366F1) — thin glowing contour lines suggesting a stylized topographic map, a single pulsing location pin at center emitting concentric rings of light like a radar ping, a subtle QR-code-like pattern of glowing dots in one corner (abstract, not a scannable real code). The panel itself is a thin sheet of glowing glass with a faint Fresnel rim-light edge, slightly translucent, floating and rotating very slowly on its Y axis, catching soft volumetric light as it turns. Behind it, extremely soft bokeh particles in the same cyan-to-indigo gradient drift slowly. Camera holds a slow, locked-off close-up with a very subtle breathing zoom (barely perceptible, like a held breath). Lighting entirely self-emissive from the panel's own glow plus one soft rim light. Lens: 85mm equivalent macro, shallow depth of field with the panel's front edge in crisp focus and its own depth falling into soft blur. Material: glass and light, no physical UI chrome, no buttons, no readable text or icons — pure abstraction of "location + family + protection" as light and shape.

**Negative prompt:**
> cartoon, anime, low quality, blurry, readable text, real UI buttons, app screenshot look, watermark, logo, humans, faces, hands, warm tones, red tones, green tones, rainbow colors, hard shadows, visible background scenery, camera shake, fast motion, flicker, noise, banding, literal smartphone frame, literal QR code (must remain abstract pattern), stock photo look

**Movimento de câmera:** câmera travada (locked-off) com respiração sutil de zoom — nenhum movimento brusco, o painel é o único elemento que gira.

**Continuidade:** este material, se um dia produzido, entraria como **textura de material** nos meshes já existentes de `ProductsRenderer.ts` (substituindo a cor plana atual por uma textura animada), nunca como vídeo de tela cheia — a continuidade é garantida pela própria arquitetura já construída (mesma formação, mesma rotação, mesma câmera).

**Ponto de entrada na Scene Engine:** nenhum imediato. Caminho futuro, se desejado: `ProductsRenderer.ts` ganha um `THREE.VideoTexture`/`CanvasTexture` animada por painel em vez de `material.color.setHex()` — mudança contida, sem alterar `ProductsAnimator.ts` nem a Timeline.

**Peso ideal:** N/A hoje (não recomendado para produção imediata).

---

## 5. FUSION BUY AI

| Campo | Definição |
|---|---|
| **Objetivo emocional** | Inteligência, agilidade, assistência, "está pensando por mim" |
| **Duração ideal** | 6.7s (mesma fatia de Products) |
| **Tipo de cena** | **Manter Three.js/Procedural.** Mesmo raciocínio da Reencontra — item 4. |

**Prompt cinematográfico (referência futura):**
> Extreme close-up cinematic product UI shot, 9:16 vertical, 7 seconds. A holographic interface panel floats in dark space, glowing in cyber violet (#A855F7) transitioning to soft pink (#EC4899) — abstract representation of an AI assistant "thinking": a cluster of small glowing nodes connected by thin animated light-threads that continuously rearrange themselves, like a neural network visualizing a thought, pulses of brighter light travel along the threads at irregular intervals suggesting computation happening in real time. The panel is thin glowing glass with Fresnel rim light, rotating slowly on its Y axis. Extremely soft violet-to-pink bokeh particles drift behind it. Camera: slow locked-off close-up, subtle breathing zoom. Lighting entirely self-emissive. Lens: 85mm equivalent macro, shallow depth of field, panel edge crisp, depth falling into soft blur. Material: glass and light only — no readable UI, no chat bubbles with text, no product photos — pure abstraction of "intelligence comparing options" as moving light.

**Negative prompt:**
> cartoon, anime, low quality, blurry, readable text, chat bubble UI, product photography, price tags, shopping cart icons, watermark, logo, humans, faces, hands, warm tones, red tones, green tones, hard shadows, visible background scenery, camera shake, flicker, noise, banding, stock photo look

**Movimento de câmera:** idêntico ao item 4 (câmera travada, respiração sutil).

**Continuidade:** mesma lógica de item 4 — textura de material dentro do mesh já existente, nunca vídeo de tela cheia.

**Ponto de entrada na Scene Engine:** mesmo caminho de item 4 (futuro, não imediato).

**Peso ideal:** N/A hoje.

---

## 6. COFFEE BREAK

| Campo | Definição |
|---|---|
| **Objetivo emocional** | Agilidade, praticidade, energia do dia a dia |
| **Duração ideal** | 6.7s (mesma fatia de Products) |
| **Tipo de cena** | **Manter Three.js/Procedural.** Mesmo raciocínio dos itens 4 e 5. |

**Prompt cinematográfico (referência futura):**
> Extreme close-up cinematic product UI shot, 9:16 vertical, 7 seconds. A holographic interface panel floats in dark space, glowing in warm amber-orange (#F97316 to #F59E0B) — the one deliberate warm exception in this entire film's palette, exactly as it is on the rest of the site. Abstract representation of speed and freshness: a small glowing particle of light "pours" downward through the panel like a drop of liquid light, leaving a brief trailing glow, repeating in a slow rhythmic loop — an abstraction of a coffee pour, never literal, no cup, no beans, no logo. The panel is thin glowing glass with Fresnel rim light, rotating slowly on its Y axis. Soft amber bokeh particles drift behind it — the ONLY scene in the whole production where the ambient particles are warm-toned, intentionally, echoing the product's own brand exception. Camera: slow locked-off close-up, subtle breathing zoom. Lighting entirely self-emissive. Lens: 85mm equivalent macro, shallow depth of field. Material: glass and light only, no literal food or drink imagery, no readable text.

**Negative prompt:**
> cartoon, anime, low quality, blurry, readable text, literal coffee cup, literal beans, food photography, watermark, logo, humans, faces, hands, cold blue tones dominating (this scene is the intentional warm exception, but must not shift to red/green), hard shadows, visible background scenery, camera shake, flicker, noise, banding, stock photo look

**Movimento de câmera:** idêntico aos itens 4 e 5.

**Continuidade:** mesma lógica — textura de material, nunca vídeo cheio.

**Ponto de entrada na Scene Engine:** mesmo caminho futuro dos itens 4 e 5.

**Peso ideal:** N/A hoje.

---

## 7. FUSION AI

| Campo | Definição |
|---|---|
| **Objetivo emocional** | Inovação, expectativa, "o próximo salto" |
| **Duração ideal** | 6s (900px ÷ 150px/s) |
| **Tipo de cena** | **Dreamina vídeo — maior prioridade de produção nova.** |

**Por quê é a maior prioridade:** esta é, hoje, a cena visualmente mais fraca da experiência — foi construída com dois icosaedros wireframe como placeholder funcional (para não bloquear a Fase 4 pedindo assets que ainainda não existiam). É também a cena mais "cara" narrativamente: precisa comunicar "inovação" sem mostrar nada literal do produto, que é exatamente o tipo de trabalho em que geração generativa se destaca sobre geometria procedural simples.

**Prompt cinematográfico:**
> Abstract cinematic sci-fi CGI shot, 9:16 vertical, 6 seconds, seamless continuous take. Two distinct forms of pure light float in absolute darkness on opposite sides of frame: on the left, a form built of sharp, angular, crystalline facets glowing electric cyan-blue (#00D4FF), rotating slowly on its own axis, like a fractured gemstone made of light. On the right, a form built of soft, organic, flowing ribbons of light glowing cyber violet (#A855F7), also rotating slowly, like liquid smoke given shape. Throughout the full 6 seconds, both forms drift slowly and smoothly toward the center of frame along a straight, deliberate path — no acceleration tricks, constant velocity, inevitable. As they approach each other (starting around 4s), their outer edges begin to interpenetrate and exchange light — cyan tendrils reaching into the violet form and vice-versa, filaments of light bridging the gap before full contact. At 5.5–6s, the two forms fully merge into a single, brighter, symmetric point of blue-violet light at the exact center of frame — a controlled, elegant convergence, NEVER an explosion or a flash-cut, the merge is soft, gradual, almost gravitational. Camera: fixed wide shot, perfectly centered and symmetric, extremely slow and subtle push-in throughout, ending just slightly closer than it started — barely perceptible, holding tension rather than releasing it. Lighting entirely self-emissive from the two forms; extremely soft volumetric haze in the space between them that intensifies subtly as they approach, suggesting an energy field building up. Lens: 50mm equivalent, deep-ish focus keeping both forms sharp throughout (this is a symmetric two-subject composition, not a shallow-DOF single subject). Atmosphere: sparse floating dust motes catching rim light from both forms. Color grading: pure black background, no other color in frame besides the cyan and violet of the two forms and their shared blue-violet merge point — absolute color discipline. The final half-second should hold on the merged point of light, bright but not blown out, perfectly centered, ready for a text reveal over it.

**Negative prompt:**
> cartoon, anime, low quality, blurry, motion stutter, text, watermark, logo, humans, faces, hands, product photos, phone mockups, screenshots, explosion, shockwave, lens flare streaks, warm orange tones, red tones, green tones, rainbow colors, hard shadows, visible floor or background scenery, camera shake, asymmetric composition, off-center forms, erratic motion, flicker, noise, banding, one form dominating over the other (must stay balanced/equal), literal sphere shapes (reserved for Núcleo/Genesis/Core/Return — this scene must look visually distinct from those)

**Movimento de câmera:** **push-in fixo e extremamente sutil**, câmera perfeitamente centrada e simétrica do início ao fim — nenhum pan, nenhum tilt, nenhum orbit. A simetria da composição é o ponto — qualquer assimetria de câmera quebraria a leitura de "dois iguais se tornando um".

**Continuidade:** primeiro frame com as duas formas já visíveis nas bordas opostas do quadro (conecta com o fim de Products, que termina numa formação de painéis coloridos — a leitura "painéis se dissolvem em duas formas de luz" funciona bem no crossfade); último frame = ponto de luz único, centralizado, pico de brilho, pronto para o texto "Em breve" (que continua sendo gerado via sprite de canvas pela Scene Engine, não embutido no vídeo — mantém o texto sempre nítido e no idioma correto).

**Ponto de entrada na Scene Engine:** substitui inteiramente `scenes/fusionai/FusionAiRenderer.ts` — troca os dois `IcosahedronGeometry` wireframe por um plano com a sequência de frames (`ctx.drawImage`, mesmo padrão do `CoreRenderer`). O sprite de texto "Em breve" (`createLabelTexture` já implementado) permanece exatamente como está, desenhado por cima. **Menor esforço de integração de todo este documento** — a cena já está estruturada para receber isso.

**Peso ideal:** 24fps × 6s = 144 frames, WebP q72, 640px largura, estimado **~5.9MB**.

---

## 8. RETURN

| Campo | Definição |
|---|---|
| **Objetivo emocional** | Calma, resolução, confiança, "pronto para o que vem" |
| **Duração ideal** | 6s (900px ÷ 150px/s) |
| **Tipo de cena** | **Híbrido.** Vídeo para riqueza visual da dissipação de energia + controle procedural do timing final para garantir handoff perfeito com o Hero. |

**Por quê híbrido e não vídeo puro:** esta é a cena mais sensível tecnicamente de todo o documento — o frame final dela precisa se dissolver EXATAMENTE no primeiro frame do Hero (`AIHeroScene.tsx`), que é interativo e não tem "início" fixo. Um vídeo com pacing fixo não consegue garantir esse encontro para qualquer velocidade de scroll do usuário. Solução: o vídeo cobre a "textura" da dissipação de energia (0–85% do progresso local), e o último trecho (85–100%, já implementado em `ReturnAnimator.ts` como `sceneFadeOpacity`) continua sendo controlado por opacidade procedural — pura matemática de scroll, sem depender de onde o vídeo "está" no seu próprio tempo interno.

**Prompt cinematográfico:**
> Abstract cinematic CGI shot, 9:16 vertical, 6 seconds, seamless continuous take. Hundreds of tiny points of light, scattered loosely across the entire frame in electric cyan (#29ABE2), begin the shot drifting slowly and slightly outward, as if breathing. Starting around 1.5s, every point begins a slow, smooth, accelerating convergence toward the exact center of frame — not a sudden pull, a gravitational, inevitable collapse, particles closer to center arrive first, outer particles trail slightly behind (staggered, organic, never mechanical-looking). As they converge (3–5s), a soft point of light at the center brightens and flares gently — brief peak intensity around 4.5s, like an ember catching, immediately followed by a slow, graceful dimming (5–6s) rather than a hard cutoff. Camera: begins moderately close and slowly, subtly pulls BACK throughout the full 6 seconds — the opposite motion of Core's push-in, creating a clear narrative bookend. The pull-back is smooth and constant, never accelerating sharply. Lighting entirely self-emissive from the particles and the central glow; no external light source, no floor, no walls, only particles and void. Lens: 50mm equivalent, shallow depth of field early (close particles sharp, distant ones soft), transitioning to a more even, wider sense of space as the camera pulls back. Atmosphere: extremely subtle, thin volumetric haze near the center point only during the flare (4–5s). Color grading: the shot must end DIMMER than it started — by 6s, overall frame luminance should be noticeably lower, a calm ember rather than an empty black frame (never fully cut to black — always leave a faint residual glow at center). This ending brightness level is critical: it must be dim enough to feel like a resolution, bright enough to still read as "alive" and ready to hand off to what comes next.

**Negative prompt:**
> cartoon, anime, low quality, blurry, motion stutter, text, watermark, logo, humans, faces, explosion, shockwave, warm orange tones, red tones, green tones, rainbow colors, hard shadows, visible floor or background scenery, camera shake, erratic particle motion, particles moving in straight mechanical lines, flicker, noise, banding, ending in pure black (must retain faint glow), ending at peak brightness (must dim), lens flare streaks, sphere/orb shape forming (this must read as diffuse convergence, not a return to Genesis's literal sphere — visually distinct resolution, not a repeat)

**Movimento de câmera:** **pull-back (dolly reverso) contínuo**, exatamente o espelho do push-in da Cena Core — mesma velocidade de base, sentido oposto. Este espelhamento é intencional e deve ser respeitado à risca: é o que dá ao filme inteiro a sensação de "abriu, viveu, fechou" como uma respiração completa.

**Continuidade:** primeiro frame conecta com o fim de Fusion AI (ponto único de luz brilhante, centralizado — praticamente idêntico ao clímax de Fusion AI, o que torna a transição quase invisível por design); os últimos 15% do progresso local permanecem sob controle procedural de opacidade (`sceneFadeOpacity` em `ReturnAnimator.ts`, já implementado) para garantir handoff perfeito com o Hero **em qualquer velocidade de scroll**.

**Ponto de entrada na Scene Engine:** substitui os elementos de partícula em `scenes/return/ReturnRenderer.ts` (troca `THREE.Points` procedural por sequência de frames desenhada via `ctx.drawImage`) — **mas mantém intacta** a lógica de `sceneFadeOpacity` do `ReturnAnimator.ts`, aplicada como `globalAlpha` adicional sobre o vídeo nos últimos 15%, exatamente como já é aplicada sobre as partículas hoje. Não é um replace completo — é a mesma arquitetura híbrida já usada implicitamente em toda cena com overlap.

**Peso ideal:** 24fps × 6s = 144 frames, WebP q72, 640px largura, estimado **~5.9MB**.

---

## Tabela final

| Cena | Vídeo | Imagem | Three.js | Duração | FPS | Peso estimado |
|---|:---:|:---:|:---:|---|---|---|
| Genesis | — | ✓ (textura) | ✓ (mantém) | 6s | — | ~0 (textura de build) |
| Core | ✓ (v2) | — | — | 10s | 24 | ~9.8MB |
| Ecosystem | ✓ (fundo, opcional) | — | ✓ (mantém painéis) | 7s | 24 | ~6–7MB |
| Reencontra | — (futuro) | — | ✓ (mantém) | 6.7s | — | N/A |
| Fusion Buy AI | — (futuro) | — | ✓ (mantém) | 6.7s | — | N/A |
| Coffee Break | — (futuro) | — | ✓ (mantém) | 6.7s | — | N/A |
| Fusion AI | ✓ (prioridade máxima) | — | — | 6s | 24 | ~5.9MB |
| Return | ✓ (híbrido) | — | ✓ (fade final) | 6s | 24 | ~5.9MB |

**Peso total do filme completo (se todas as recomendações de vídeo forem produzidas):** Core (9.8MB, já existe) + Ecosystem (6-7MB, opcional) + Fusion AI (5.9MB) + Return (5.9MB) ≈ **~28MB de payload cinematográfico total**, carregado progressivamente (não bloqueante) ao longo de 6830px de scroll. Para efeito de comparação: um único vídeo MP4 de 40 segundos em qualidade cinematográfica facilmente passaria de 40-60MB sozinho — a arquitetura de frame-sequence + code-splitting já construída é o que torna esse orçamento viável.

---

## Cronograma de prioridade — o que produzir primeiro

**1º — Fusion AI.** Maior impacto por menor esforço de integração (a cena já está estruturada para receber a troca, é literalmente um `drawImage` a mais). É também a cena visualmente mais fraca hoje — o ganho percentual de qualidade é o maior de todo o documento.

**2º — Core v2.** Maior tempo de tela de toda a experiência (quase 1/3 do filme inteiro). Pipeline 100% comprovado (é o único asset que já passou pelo processo completo uma vez). Risco técnico zero, ganho de percepção de qualidade alto — é a "cara" do site.

**3º — Return.** Fecha o arco do filme e é tecnicamente mais delicado (handoff híbrido com o Hero) — melhor produzir depois de já ter validado o pipeline duas vezes com Fusion AI e Core v2.

**4º — Ecosystem (fundo).** É um enriquecimento, não uma correção — a cena já funciona bem sem ele. Deixar para quando houver folga de produção.

**Deixar para depois (não recomendado no curto prazo): Reencontra, Fusion Buy AI, Coffee Break.** Ficam procedurais por decisão de arquitetura, não por falta de prioridade — produzir vídeo para elas hoje seria trabalho descartável se as cores de marca em `products.ts` mudarem.
