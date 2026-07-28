# Prompts Finais de Produção — Filme Cinematográfico ATS

> **Atualização pós-produção:** os 4 vídeos oficiais entregues vieram em
> 16:9 paisagem (não 9:16) como uma tomada contínua de 40s — ver
> `ART_DIRECTION.md § Aspecto e enquadramento` para a regra vigente e
> `PRODUCTION_INTEGRATION_REPORT.md` para como cada vídeo foi de fato
> integrado na Scene Engine (cenas `nucleus`/`portal`/`ecosystem-entry`/
> `holo-hall`). Os prompts abaixo continuam válidos como referência de
> linguagem cinematográfica para o próximo lote de produção.

Prontos para copiar e colar no Dreamina. Este documento substitui os prompts exploratórios de `PRODUCTION_BIBLE.md` pela versão de produção definitiva — mais densa, com timecode por segundo, especificação técnica de lente/exposição/grading, e a decisão explícita de pós-processamento.

**Ordem de produção adotada** (sua correção ao meu cronograma original — concordo com o raciocínio e sigo esta ordem): **Core 2.0 → Fusion AI → Return → Ecosystem (condicional)**.

---

## Identidade visual única — leia antes de gerar qualquer vídeo

Todo prompt abaixo compartilha a MESMA linguagem de cinematografia, para nenhum vídeo parecer produção isolada:

- **Estilo:** *Industrial Sci-Fi × Luxury Technology.* A precisão mecânica de um reveal de produto Tesla/Apple, combinada com a escuridão vazia e a escala de Blade Runner 2049 — nunca cyberpunk saturado, nunca "energia mágica" genérica de stock footage de IA.
- **Lente-base:** equivalente a 50mm em todas as cenas hero (Core, Fusion AI, Return), variando só a abertura/profundidade de campo conforme a cena pede. Isso mantém a "distância psicológica" da câmera constante ao longo do filme — o espectador nunca sente que trocou de operador de câmera.
- **Exposição:** subexposta em 1 a 1.5 stops em relação a uma cena "normal" — o preto é preto de verdade (não cinza de compressão), e toda luz em quadro é auto-justificada pela própria energia do objeto (nunca luz ambiente "de estúdio").
- **Grading:** emulação de impressão em película fria (tipo Kodak 2383, mas empurrado para o azul-ciano), contraste alto, preto rico, zero dessaturação de meio-tom — a cor SÓ existe nos elementos de energia (ciano/violeta/âmbar-Coffee-Break); todo o resto do quadro é preto ou cinza-metal escuro.
- **Cadência:** 24fps em todo o filme — é o padrão já usado na Core v1 e em toda a matemática de `Timeline.ts`; mudar isso quebraria a intuição de "mesmo filme" e aumentaria peso sem ganho perceptível.

---

## 1 — CORE 2.0

**Prioridade de produção: 1ª (identidade da marca).**

### 1. Nome
Núcleo ATS — Core 2.0

### 2. Objetivo emocional
Precisão, engenharia de altíssimo nível, "isto é vivo e pensa". O visitante deve sentir que está diante de tecnologia real, não de um efeito gráfico — o mesmo respeito que um reveal de produto Apple/Tesla inspira antes de qualquer palavra ser dita.

### 3. Duração
**10 segundos.** Justificativa: já é a duração exata do `PIN_DISTANCE` commitado (1500px ÷ 150px/s), e os três atos do vídeo (fechado → abrindo → núcleo exposto) precisam desse tempo para não parecer apressado — é o único vídeo do filme com uma progressão narrativa de três fases dentro de um único take, os outros são eventos de um só movimento.

### 4. Resolução
**1080×1920 (Full HD vertical)** na geração — o teto prático de qualidade que a maioria das ferramentas de vídeo generativo entrega hoje em 9:16. É deliberadamente MAIOR que a resolução final de entrega (o pipeline já existente reduz para 640px de largura na extração via `ffmpeg`) — gerar em alta e comprimir depois preserva detalhe fino nas bordas biseladas das placas que geração em baixa resolução perderia.

### 5. FPS
**24fps.** Padrão cinema, já usado na v1, e o que resulta no menor número de frames (240 para 10s) para o mesmo tempo de tela — direto impacto no peso final do WebP sequence.

### 6. Estilo cinematográfico
Reveal de produto industrial de altíssimo orçamento — pense num anúncio de motor de foguete SpaceX ou num teaser de relógio suíço de alta precisão, não em ficção científica de tela de cinema. A câmera nunca "atua" — ela documenta com reverência.

### 7. Prompt COMPLETO para o Dreamina

> Ultra-detailed 9:16 vertical cinematic CGI product reveal film, 10 seconds, single continuous unbroken shot, no cuts. A perfectly spherical mechanical orb — an engineered artifact, the "Núcleo ATS" — hovers motionless in absolute void, pure black, no floor, no horizon, no environment of any kind.
>
> **Materials:** the orb's surface is built from interlocking dark gunmetal and matte-black armor plates, each with micro-beveled machined edges catching the thinnest possible specular highlight — physically-based rendering, anisotropic brushed-metal reflections, zero dust, zero fingerprints, factory-new precision. Every seam between plates is lined with a hairline channel of glowing electric cyan light (#29ABE2) that pulses gently in unison across the whole sphere, like a heartbeat or a data packet traveling through circuitry — never random, always synchronized.
>
> **Timecode 0:00–0:04 (Act 1 — Dormant):** the sphere is fully closed, perfectly still except for the pulsing seam-light. Camera holds a barely-perceptible push-in (dolly), so slow it reads as stillness with intent. Two soft rim lights only — cyan from upper-left, violet (#A855F7) from lower-right — separate the orb's silhouette from the black void; no other light source exists in the shot.
>
> **Timecode 0:04–0:07 (Act 2 — Awakening):** the armor plates begin to mechanically separate and rotate outward. This is heavy, deliberate, engineered movement — think a bank vault door or Swiss watch complication, NEVER an explosion, always weighted with visible mass and momentum. Subtle motion blur only on the fastest-moving plate edges, everything else stays crisp. As gaps open between plates, thin volumetric light rays begin to escape, cutting through a barely-visible haze of suspended dust motes.
>
> **Timecode 0:07–0:10 (Act 3 — Revealed):** the interior is fully exposed — a core of blinding blue-white energy (#00D4FF) with cyan and violet plasma tendrils swirling inside it, like a captured storm. Camera continues its slow push-in, now slightly accelerating (ease-in), ending centered and close, the core filling roughly 70% of frame height. God rays escape through every gap between the now-open plates.
>
> **Camera/lens:** 50mm equivalent, medium depth of field — the orb stays in crisp focus throughout, background is naturally infinite black (no bokeh needed, there is nothing behind it). No distortion, no dutch angle, perfectly level horizon line implied by the sphere's own symmetry.
>
> **Exposure/contrast:** shot underexposed by roughly 1 stop from "neutral" — blacks are true black, the only light in frame is self-emissive from the orb. High contrast, no lifted shadows.
>
> **Color grading:** cold film-print emulation, near-monochrome black/gunmetal base, cyan/blue/violet as the ONLY chromatic information anywhere in frame — absolute zero warm tones (no orange, no red, no green) anywhere, including in the rim lighting.
>
> **Atmosphere:** sparse floating dust motes catching rim light throughout, extremely subtle and fine film grain (not video noise — grain), no fog, no haze beyond the localized god-ray effect in Act 3.
>
> **Composition:** the orb stays perfectly centered in frame for the entire 10 seconds — this is a symmetric, reverent composition, never off-axis.
>
> Final frame: the fully-open core at peak brightness, perfectly centered, filling ~70% of frame height, energy visibly swirling but not flickering.

### 8. Negative Prompt
> cartoon, anime, illustration, low quality, blurry, motion stutter, frame skipping, text, watermark, logo, subtitles, humans, hands, faces, robots with faces, explosion, fire, sparks flying outward violently, debris, shrapnel, warm orange tones, red tones, green tones, yellow tones, rainbow colors, lens flare streaks, hard directional shadows, visible studio floor, visible background scenery, horizon line, camera shake, handheld wobble, zoom snap, jump cuts, oversaturation, color banding, compression artifacts, video noise, flicker, strobing, out-of-focus core, asymmetrical or off-center rotation, plates flying off independently, cheap plastic material look, chrome/mirror-polish finish (must stay matte/brushed), vignette (site already frames this), heavy chromatic aberration

### 9. Continuidade
**Último frame da cena anterior (Genesis, procedural):** esfera de partículas recém-formada, quase escura, câmera parada em z≈6.8, silhueta apenas emergindo do preto.
**Primeiro frame deste vídeo:** precisa nascer igualmente escuro e quieto — a esfera JÁ fechada e imóvel, silhueta apenas sugerida por reflexos mínimos, sem nenhum pulso de luz visível ainda no frame zero (o pulso começa a aparecer nos primeiros 0.5s). Isso garante que o crossfade Genesis→Core não tenha nenhum salto de brilho perceptível.
**Último frame deste vídeo:** núcleo de energia azul-branca totalmente exposto, centralizado, pico de brilho controlado (não estourado).
**Primeiro frame esperado da próxima cena (Ecosystem, procedural):** a câmera "entra" nesse mesmo núcleo de energia — o Ecosystem começa com o glow residual do núcleo (`coreGlowOpacity` já implementado em `EcosystemAnimator.ts`) na mesma cor e intensidade do último frame da Core. Não requer ação nova — a costura já foi desenhada para isso.

### 10. Pós-processamento
**Não existe pipeline de pós depois da extração de frames** — o que sai do Dreamina é o que vai para o site. Por isso, tudo abaixo precisa estar DENTRO do prompt de geração, não é uma etapa separada:
- **Bloom:** sim, pedir explicitamente (já embutido no prompt via "god rays", "glowing", "blinding energy") — é a única forma de vender "energia real" sem pós-processamento.
- **Motion blur:** sim, mas só nas placas em movimento rápido (Ato 2) — pedir explicitamente que o núcleo estático e as partículas de poeira NÃO tenham motion blur, para não borrar o que precisa ficar nítido.
- **Volumetric light (god rays):** sim, é o efeito-chave do Ato 3 — já no prompt.
- **Film grain:** sim, sutil — ajuda a esconder banding de compressão do WebP final e dá textura de "filme", não de "render 3D limpo".
- **Vignette:** **não pedir.** O canvas do site já aplica um enquadramento tipo letterbox/cinema sobre fundo preto — um vignette embutido no vídeo ficaria redundante e escureceria demais as bordas onde o glow do CSS (`neon-cyan/10`, `cyber-purple/10`) já precisa aparecer.
- **Chromatic aberration:** **evitar, ou pedir apenas o mínimo residual.** Em excesso lê como filtro barato de "IA generativa", não como cinema de verdade — é o oposto do objetivo.
- **Lens flare (streaks):** **não pedir.** Já está explicitamente na negative prompt — feixes de flare tradicionais quebram a estética "luz contida", que é o que separa este filme de vídeo genérico de IA.

### 11. Integração
Substitui diretamente `public/cinematic/frame-001.webp` até `frame-240.webp`, consumidos por `scenes/core/CoreRenderer.ts` via `scenes/core/core.assets.ts`. **Zero mudança de código.** Pipeline de extração: `ffmpeg -i core-v2.mp4 -vf "fps=24,scale=640:-2" -frames:v 240 -c:v libwebp -quality 72 -compression_level 6 -preset picture frame-%03d.webp` (comando idêntico ao já usado na v1, documentado nesta mesma sessão de implementação).

---

## 2 — FUSION AI

**Prioridade de produção: 2ª (placeholder mais evidente hoje).**

### 1. Nome
Fusion AI — Convergência

### 2. Objetivo emocional
Inovação, expectativa contida, "o próximo salto está chegando". Não deve mostrar nada literal do produto — a emoção é 100% sobre o QUE VEM A SEGUIR, não sobre o que já existe.

### 3. Duração
**6 segundos.** Justificativa: 900px ÷ 150px/s. É a cena mais curta de propósito narrativo único do filme (não tem três atos como a Core) — 6s é o suficiente para a aproximação + fusão + meio segundo de resolução antes do texto "Em breve" assumir o quadro.

### 4. Resolução
**1080×1920 (Full HD vertical)**, mesmo racional da Core 2.0 — gerar em alta, entregar em 640px de largura.

### 5. FPS
**24fps**, mesmo racional — consistência com o resto do filme e menor peso final (144 frames para 6s).

### 6. Estilo cinematográfico
O mesmo *Industrial Sci-Fi × Luxury Technology* do filme inteiro, mas nesta cena especificamente mais próximo de uma abertura de conferência de produto (o momento "algo novo está para ser anunciado") — composição simétrica, tensão contida, nunca explosiva.

### 7. Prompt COMPLETO para o Dreamina

> Abstract cinematic sci-fi CGI shot, 9:16 vertical, 6 seconds, single continuous unbroken take, no cuts. Two distinct forms of pure light float in absolute darkness on opposite sides of a perfectly symmetric frame.
>
> **Left form:** sharp, angular, crystalline facets glowing electric cyan-blue (#00D4FF), like a fractured gemstone made of solid light, rotating slowly and smoothly on its own vertical axis.
> **Right form:** soft, organic, flowing ribbons of light glowing cyber violet (#A855F7), like liquid smoke given shape, also rotating slowly on its own axis, in the opposite rotational direction from the left form.
>
> **Timecode 0:00–0:04 (Approach):** both forms drift slowly and smoothly toward the exact center of frame along a straight, deliberate horizontal path — constant velocity, no acceleration tricks yet, inevitable rather than dramatic. Camera holds an extremely slow, barely-perceptible push-in throughout this entire phase.
>
> **Timecode 0:04–0:055 (Contact):** as the forms approach close proximity, their outer edges begin to interpenetrate — thin filaments of cyan light reach into the violet form and violet filaments reach into the cyan form, bridging the gap before full contact, like two magnetic fields becoming visible to each other.
>
> **Timecode 0:055–0:06 (Fusion):** the two forms fully merge into a single, brighter, perfectly symmetric point of blue-violet light at the exact center of frame. The merge is soft, gradual, gravitational — NEVER an explosion, NEVER a flash-cut, no shockwave. A faint volumetric haze in the space between the forms intensifies subtly in the final second, suggesting a building energy field just before contact.
>
> **Camera/lens:** 50mm equivalent, fixed wide shot, perfectly centered and symmetric throughout — the composition itself IS the message (two becoming one), so the camera must never break that symmetry with pan, tilt, or orbit. Medium-deep depth of field keeping both forms sharp simultaneously (this is a two-subject symmetric composition, not a single shallow-DOF hero object).
>
> **Exposure/contrast:** same underexposed, true-black baseline as the rest of the film — both forms are the only light sources, no ambient fill.
>
> **Color grading:** absolute color discipline — pure black background, and the ONLY colors permitted anywhere in frame are the cyan of the left form, the violet of the right form, and their shared blue-violet merge point. No other hue may appear, including in the dust particles.
>
> **Atmosphere:** sparse floating dust motes catching rim light from both forms, extremely subtle fine film grain.
>
> **Composition/rhythm:** perfect left-right symmetry for the full 6 seconds, holding tension rather than releasing it early — the payoff is entirely in the final half-second.
>
> Final frame: the merged point of light, bright but never blown out or clipped, perfectly centered, occupying roughly 15–20% of frame width — small enough that a text reveal can comfortably appear beneath or around it without competing for attention.

### 8. Negative Prompt
> cartoon, anime, illustration, low quality, blurry, motion stutter, text, watermark, logo, humans, faces, hands, product photos, phone mockups, screenshots, UI elements, explosion, shockwave, debris, warm orange tones, red tones, green tones, yellow tones, rainbow colors, lens flare streaks, hard directional shadows, visible floor or background scenery, camera shake, off-center or asymmetric composition, one form dominating the other in size or brightness, erratic or jittery motion, flicker, strobing, video noise, color banding, compression artifacts, literal sphere shape forming (reserved visually for Núcleo/Core/Return — this scene must read as distinct), vignette, heavy chromatic aberration

### 9. Continuidade
**Último frame da cena anterior (Products, procedural):** formação de 6 painéis girando, cor no tom do último produto (Coffee Break, laranja-âmbar), câmera quase estática.
**Primeiro frame deste vídeo:** as duas formas (cyan e violeta) já visíveis nas bordas opostas do quadro, ainda distantes uma da outra — a leitura "os painéis coloridos se dissolvem em duas formas de luz puras" funciona no crossfade porque ambos os frames são compostos majoritariamente de pontos de luz sobre preto, só a cor e a forma mudam.
**Último frame deste vídeo:** ponto único de luz azul-violeta, centralizado, pico de brilho controlado.
**Primeiro frame esperado da próxima cena (Return):** precisa começar com um ponto de luz igualmente centralizado e de intensidade semelhante — praticamente o MESMO frame visualmente, só trocando o contexto (de "dois se tornaram um" para "tudo retorna ao um"). Esse espelhamento é proposital e deve ser mantido.

### 10. Pós-processamento
- **Bloom:** sim, essencial — já embutido no prompt ("glowing", "pure light").
- **Motion blur:** mínimo — as formas se movem devagar o suficiente para não precisar, e motion blur aqui borraria os detalhes cristalinos/orgânicos que diferenciam as duas formas. Pedir explicitamente "crisp edges, minimal motion blur".
- **Volumetric light:** sim, sutil, só no momento de aproximação/contato (0:04–0:06) — não do início ao fim.
- **Film grain:** sim, sutil, consistente com o resto do filme.
- **Vignette:** **não pedir**, mesmo racional da Core.
- **Chromatic aberration:** **evitar.**
- **Lens flare:** **não pedir** — o ponto de fusão final precisa ficar limpo o suficiente para o texto "Em breve" (gerado via sprite de canvas pela própria Scene Engine) ficar legível sobre ele.

### 11. Integração
Substitui inteiramente os dois `IcosahedronGeometry` wireframe em `scenes/fusionai/FusionAiRenderer.ts` por uma sequência de frames desenhada via `ctx.drawImage` (mesmo padrão do `CoreRenderer`) — troca a cada frame. **O sprite de texto "Em breve" (`createLabelTexture`, já implementado) permanece exatamente como está**, desenhado por cima do vídeo com sua própria opacidade controlada por `FusionAiAnimator.ts` (`labelOpacity`, já existente, sem mudança). Menor esforço de integração de toda a produção.

---

## 3 — RETURN

**Prioridade de produção: 3ª (fecha o arco, mais delicado tecnicamente).**

### 1. Nome
Retorno ao Núcleo — Return

### 2. Objetivo emocional
Calma, resolução, confiança — a sensação de "terminou bem, e o que vem a seguir é natural". É a única cena do filme cujo objetivo emocional é desacelerar o espectador, não excitá-lo.

### 3. Duração
**6 segundos.** Justificativa: 900px ÷ 150px/s. É o espelho temporal exato da Core 2.0 em ritmo (mesma duração-base de 6s das cenas de "um só movimento"), reforçando a simetria "abriu, viveu, fechou" do filme inteiro.

### 4. Resolução
**1080×1920 (Full HD vertical)**, mesmo racional das demais.

### 5. FPS
**24fps**, mesmo racional — 144 frames para 6s.

### 6. Estilo cinematográfico
O mesmo *Industrial Sci-Fi × Luxury Technology*, mas na sua variação mais contemplativa — pense no plano final de um comercial de carro elétrico premium, quando o produto já foi revelado e a câmera simplesmente... respira.

### 7. Prompt COMPLETO para o Dreamina

> Abstract cinematic CGI shot, 9:16 vertical, 6 seconds, single continuous unbroken take, no cuts. Hundreds of tiny points of light are scattered loosely across the entire frame in electric cyan (#29ABE2), each drifting very slightly as if breathing.
>
> **Timecode 0:00–0:015 (Held breath):** particles drift gently, no directional pull yet — this is the calm immediately after the Fusion AI merge, matching its energy level.
>
> **Timecode 0:015–0:05 (Convergence):** every particle begins a slow, smooth, gently ACCELERATING convergence toward the exact center of frame — not a sudden pull, a gravitational, inevitable collapse. Particles closer to center arrive first; outer particles trail slightly behind, staggered and organic, never mechanical or uniform. Around 0:045, a soft point of light at the center brightens and flares gently — a brief peak intensity, like an ember catching — immediately followed by the beginning of a graceful dim.
>
> **Timecode 0:05–0:06 (Settle):** the central point continues dimming smoothly, never cutting off hard. By the final frame, overall frame luminance is noticeably LOWER than the peak at 0:045 — a calm ember, not an empty black frame. A faint residual glow must remain visible at center in the very last frame; the shot must never go fully black.
>
> **Camera/lens:** 50mm equivalent. The camera begins moderately close and performs a slow, constant, SUBTLE pull-back (dolly reverse) for the full 6 seconds — the exact mirror motion of the Core 2.0's push-in, same base speed, opposite direction. This mirroring is the single most important camera decision in this shot and must be honored precisely: it is what gives the entire film the feeling of a complete breath — opened, lived, closed.
>
> **Exposure/contrast:** begins at the same underexposed baseline as the rest of the film; contrast should visibly soften in the final second as the light dims — not flatten to gray, but lose intensity gracefully.
>
> **Color grading:** cyan-only particle field (matching Genesis/Core's primary hue, closing the visual loop back to where the film began), the same cold film-print emulation as every other scene. No other hue anywhere in frame.
>
> **Atmosphere:** extremely subtle, thin volumetric haze near the center point only during the brief flare (0:04–0:05). Fine film grain, consistent with the rest of the film.
>
> **Composition/rhythm:** starts diffuse and wide, ends compact and centered — the frame itself feels like it's exhaling.
>
> Final frame: a single dim, faint point of cyan-blue light at the exact center of an otherwise near-black frame — dim enough to feel resolved, bright enough to still read as "alive."

### 8. Negative Prompt
> cartoon, anime, illustration, low quality, blurry, motion stutter, text, watermark, logo, humans, faces, explosion, shockwave, warm orange tones, red tones, green tones, yellow tones, rainbow colors, hard directional shadows, visible floor or background scenery, camera shake, erratic or mechanical particle motion, particles moving in straight rigid lines, flicker, strobing, video noise, color banding, compression artifacts, ending in pure black with zero residual glow, ending at peak brightness without dimming, lens flare streaks, sphere/orb shape forming (must read as diffuse convergence, not a literal repeat of Genesis's sphere), vignette, heavy chromatic aberration

### 9. Continuidade
**Último frame da cena anterior (Fusion AI):** ponto único de luz azul-violeta centralizado, pico de brilho.
**Primeiro frame deste vídeo:** partículas cyan dispersas, luminosidade geral equivalente à do ponto de fusão anterior (não pode "cair" de brilho no corte) — a leitura é "aquele ponto de luz se espalhou de volta em centenas de partículas", uma transformação, não uma troca de cena.
**Último frame deste vídeo:** ponto único, fraco, cyan, centralizado — nunca preto absoluto.
**A partir daqui, a continuidade deixa de ser sobre frames e passa a ser sobre matemática:** os últimos 15% do progresso local desta cena são controlados por `sceneFadeOpacity` (`ReturnAnimator.ts`, já implementado) aplicado por cima do vídeo como opacidade adicional — isso garante que o encontro com o Hero (`AIHeroScene.tsx`, que não tem "primeiro frame" fixo porque é interativo) funcione em QUALQUER velocidade de scroll do visitante, não só na velocidade "ideal" de um vídeo de ritmo fixo.

### 10. Pós-processamento
- **Bloom:** sim, no momento do flare central (0:04–0:05) — já embutido no prompt.
- **Motion blur:** mínimo nas partículas convergindo (mantém leitura clara de "centenas de pontos", não um borrão), zero no ponto central.
- **Volumetric light:** sim, muito sutil, só no pico do flare.
- **Film grain:** sim, sutil, consistente.
- **Vignette:** **não pedir**, mesmo racional das demais cenas.
- **Chromatic aberration:** **evitar.**
- **Lens flare:** **não pedir** — o frame final precisa ficar limpo para a transição procedural final (`sceneFadeOpacity`) funcionar sem interferência visual extra.

### 11. Integração
Substitui o sistema de partículas `THREE.Points` procedural em `scenes/return/ReturnRenderer.ts` por uma sequência de frames via `ctx.drawImage` — **mas preserva integralmente** a lógica de `sceneFadeOpacity` de `ReturnAnimator.ts`, aplicada como `globalAlpha` adicional sobre o vídeo nos últimos 15% do progresso local. Não é uma troca completa — é a mesma arquitetura híbrida (vídeo + controle procedural de timing) necessária para garantir o handoff perfeito com o Hero.

---

## 4 — ECOSYSTEM (condicional)

**Prioridade de produção: 4ª — só produzir se, após testar as 3 cenas acima no ar, o Three.js procedural não estiver "vendendo" a sensação de profundidade/escala esperada.** Preparado e pronto para uso imediato se essa avaliação apontar necessidade.

### 1. Nome
Ecossistema ATS — Travessia (camada de fundo)

### 2. Objetivo emocional
Escala, profundidade, "entrei em algo maior que uma esfera".

### 3. Duração
**7 segundos** (1000px ÷ 150px/s, arredondado).

### 4. Resolução
**1080×1920.**

### 5. FPS
**24fps.**

### 6. Estilo cinematográfico
Mesmo *Industrial Sci-Fi × Luxury Technology* — aqui na variação "espaço de dados infinito", mais próximo de uma cena de transição de um filme como Tron ou Ghost in the Shell, mas sem o excesso saturado desses dois — mantendo a paleta restrita do resto do filme.

### 7. Prompt COMPLETO para o Dreamina

> Abstract cinematic 9:16 vertical background plate, 7 seconds, single continuous take, loop-friendly (first and last frame should be tonally similar, since this plays behind procedural foreground elements for the full duration). An infinite dark tunnel of suspended light: thin, precise, engineered luminous data-stream lines in electric cyan (#29ABE2), cyber violet (#A855F7) and glow blue (#00D4FF) stretch from extreme foreground to a vanishing point deep in frame.
>
> **Motion:** the camera is stationary relative to the tunnel's center axis — only the light lines and sparse floating dust particles move past it, receding toward the vanishing point at a slow, constant, meditative speed. This is atmosphere, not a race — explicitly NOT a hyperspace/warp-speed effect, no starburst, no streaking lens flare. Particles at varying depths create genuine parallax as they drift past camera.
>
> **Environment:** pure black void beyond the light lines — no walls, no geometry, no structure, only lines and particles suspended in nothing.
>
> **Lighting:** entirely self-emissive from the lines themselves; extremely subtle volumetric haze near camera only, clearing to pure black in the distance.
>
> **Lens:** wide-angle equivalent (24mm) — wider than the rest of the film deliberately, since this is an environment plate meant to sit BEHIND other rendered elements (holographic panels), not a hero shot. Deep focus throughout, everything stays reasonably sharp from foreground to vanishing point.
>
> **Color grading:** cool, desaturated, near-monochrome, same three brand hues as the rest of the film as the only saturated color information.
>
> **Composition/rhythm:** perfectly stable, locked-off feel despite the flowing lines — no camera movement of any kind, all motion is in the environment itself.
>
> Final frame: tonally and compositionally similar to the first frame (this is a plate meant to be crossfaded in/out, not a narrative arc with a distinct ending).

### 8. Negative Prompt
> cartoon, anime, low quality, blurry, text, watermark, logo, humans, faces, warp-speed starburst effect, lens flare streaks, hyperspace jump effect, warm tones, red tones, green tones, yellow tones, rainbow colors, geometric grid floor, visible walls or tunnel structure, hard edges on light lines, camera shake, spinning or orbiting camera, fast erratic motion, video noise, flicker, strobing, color banding, oversaturation, glowing orb/sphere shapes (reserved for other scenes), particles moving toward camera aggressively, vignette, chromatic aberration

### 9. Continuidade
Por ser uma camada de fundo (não uma narrativa com início/fim próprios), a costura com as cenas vizinhas é sempre um crossfade puro de opacidade controlado pelo `Timeline` — não depende de frame inicial/final específico como as outras três cenas.

### 10. Pós-processamento
Mesma lista das demais cenas (bloom sim, volumetric sutil sim, film grain sim, vignette não, chromatic aberration evitar, lens flare não) — sem variação, para não competir visualmente com os painéis do Ecosystem que ficam por cima.

### 11. Integração
**Requer um pequeno acréscimo de código** (não arquitetural): `EcosystemRenderer.ts` ganharia uma segunda `<canvas>` 2D empilhada ABAIXO do canvas WebGL dos painéis, seguindo o mesmo padrão de empilhamento por z-index que `CinematicExperience.tsx` já usa entre cenas — desenhando os frames deste vídeo com `ctx.drawImage` antes do WebGL renderizar por cima. Único item deste documento que não é substituição 1:1 de um asset já esperado pelo código.

---

## Produtos (Reencontra, Fusion Buy AI, Coffee Break) — confirmação

**Continuam 100% procedurais. Nenhum prompt de vídeo produzido para esta cena.**

Concordo com sua expectativa: a solução procedural deve continuar sendo a melhor escolha aqui, e não por limitação técnica — é a decisão certa mesmo depois de testar tudo o resto. Três motivos, na ordem que mais importa:

1. **Continuidade contínua é irreproduzível em vídeo.** A cena `products` é UMA formação de painéis que gira e recolore ao vivo — não três clipes com crossfade. Um vídeo tem começo e fim fixos; a transformação matemática contínua (`ProductsAnimator.ts`) é exatamente o que faz essa cena não parecer "três telas diferentes", que era o problema original que você pediu para resolver na Fase 3.
2. **Adapta-se ao scroll de qualquer velocidade**, como qualquer outra cena procedural do filme — vídeo sempre "anda em degraus" quando o usuário rola mais rápido que 24fps permite.
3. **Acompanha mudanças futuras do ecossistema ATS sem regravar nada.** As cores desta cena vêm direto de `data/products.ts` — se a paleta de um produto mudar amanhã, a Cena Products atualiza sozinha. Um vídeo ficaria desatualizado no mesmo dia.

Se um dia fizer sentido enriquecer visualmente (não substituir), o caminho já está mapeado em `PRODUCTION_BIBLE.md § 4-6`: texturas de material animadas dentro dos meshes já existentes, nunca vídeo de tela cheia.

---

## Tabela final

| Ordem | Cena | Vídeo | Duração | Prioridade | Status |
|---|---|---|---|---|---|
| 1 | Core 2.0 | ✓ | 10s | Alta — identidade da marca | Pronto para gerar |
| 2 | Fusion AI | ✓ | 6s | Alta — placeholder mais evidente | Pronto para gerar |
| 3 | Return | ✓ | 6s | Média-alta — fecha o arco, mais delicado | Pronto para gerar |
| 4 | Ecosystem | ✓ (condicional) | 7s | Baixa — só se o teste real apontar necessidade | Preparado, aguardando avaliação |
| — | Reencontra | — | — | — | Permanece procedural |
| — | Fusion Buy AI | — | — | — | Permanece procedural |
| — | Coffee Break | — | — | — | Permanece procedural |
| — | Genesis | — | — | — | Permanece procedural |

## Ordem recomendada de geração

**1º Core 2.0 → 2º Fusion AI → 3º Return → 4º Ecosystem (condicional, só após avaliar 1–3 no ar).**

Adoto integralmente sua correção de prioridade. O raciocínio "a esfera é a identidade da ATS, produz primeiro" pesa mais do que meu critério original de "menor esforço de integração primeiro" — é uma escolha de direção de marca, não de engenharia, e cabe a você, não a mim, decidir esse peso. Tecnicamente as três primeiras cenas têm o mesmo custo de produção (6-10s, mesmo pipeline, mesma complexidade de prompt) e o mesmo esforço de integração (substituição 1:1 de assets já esperados pelo código) — a diferença real está inteiramente em qual ordem entrega mais valor de marca primeiro, e nisso sua leitura está certa.
