# Prompts Dreamina — ATS Sistemas — Core Experience

> Gerado por `npm run prod:prompts -- ats-site` a partir de `shots.json`. Não edite à mão: edite `shots.json` e gere de novo.

Fluxo por cena: **(1)** rascunho no Seedance 2.0 Mini, 5 s, 720P, para validar movimento e composição → **(2)** final no modelo indicado → **(3)** baixar o MP4 para `production/ats-site/raw/` → **(4)** `npm run prod:ingest -- ats-site <id-da-cena> <arquivo>`.

Créditos são **estimativas** (tabela em `shots.json → creditRates`, lida do indicador do Dreamina por terceiros). Confirme o valor no próprio Dreamina antes de gerar.

## s01-nucleo-abertura — Núcleo — a esfera ATS se abre

**Já produzida** (produção anterior do site (public/cinematic/nucleus, 120 frames WebP 540×960)). Status: `ready`. Identidade preservada: a esfera metálica com ATS em ciano que se abre e revela o núcleo de energia. Seu último quadro é a referência de cor e luz de todas as cenas novas.

## s02-inteligencia-sinapses — Inteligência — sinapses de luz

**Objetivo:** Dar textura orgânica e volumétrica à rede Pessoas + IA + Engenharia que o 3D desenha: filamentos de luz que o WebGL não consegue fazer com a mesma riqueza.

| Configuração no Dreamina | Valor |
|---|---|
| Modelo | Seedance 2.5 |
| Modo | Referências (all-in-one / omni), imagens como @Image N |
| Proporção | 16:9 |
| Duração | 8 s |
| Resolução | 720P |
| Variações | 1 |
| Áudio | desligado (o site não usa som) |
| @Image 1 | `references/s01-nucleo-abertura-ultimo-quadro.png` — only the colour, temperature and glow of the energy core at the centre — not the metal casing, not the room |
| Créditos (estimativa) | rascunho ≈ 25 · final ≈ 296 |
| Status | `pending` |

```text
[Generation Goal] Abstract filaments of light branching outward from a single hot white-cyan energy core into a delicate neural lattice, on pure black.
[Style lock] Dark cinematic technology film. Deep near-black space lit only by self-emissive light. Brand palette: cyan #29ABE2 and electric blue #00D4FF as the dominant light, violet #A855F7 as the only secondary accent, cool white #EAF6FF only at the hottest points. Precise, engineered, calm; fine volumetric glow and sparse floating particles; shallow depth of field, 35mm lens look; photoreal render quality; 24 fps.
[Reference roles] @Image 1 defines only the colour, temperature and glow of the energy core at the centre — not the metal casing, not the room.
[0-2s] Fine threads of cyan light creep outward from the bright core at the centre of frame, thin as hair.
[2-5s] The threads branch like synapses; small nodes ignite where they meet; a few violet and cool white threads weave between the cyan ones.
[5-8s] Soft pulses travel along the filaments toward the edges while the lattice slowly breathes back to the density of the opening second.
Camera: locked-off, extremely slow push-in (about 3% scale over the whole clip), lens centred on the core
Lighting: self-emissive only; the core is the single light source; gentle bloom; no rim lights, no environment
Composition: core exactly centred; filaments fill the central 70% and fade to black before the edges
Motion: slow, organic, constant speed; nothing enters or leaves the frame
Constraints: the final second returns to the exact composition and density of the first second, for a seamless loop; pure black background (#000000) everywhere outside the light; the subject is light itself: no solid surfaces, no floor, no environment; subject kept in the central 40% of the frame so a 9:16 centre crop keeps it whole; one continuous take, no cuts; no camera shake, slow constant motion; locked exposure and white balance, no flicker; minimal motion blur; no text, no letters, no numbers, no logos, no watermark; no people, no faces, no hands; NO BGM; no subtitles.
```

**Mobile:** recorte central 9:16 feito pelo `prod:ingest` — o núcleo fica no centro seguro
**Transições:** entra — aparece por opacidade quando a rede 3D começa a se abrir (capítulo 2); sai — dissolve quando a rede se recolhe para virar a casca do ecossistema
**No site:** camada `screen` sobre o mundo 3D no capítulo Inteligência; o preto vira transparente

**Aprovar só se:** sem cortes · sem texto/logo inventado · fundo preto puro (camadas) · exposição estável · começo e fim resolvidos · loop sem salto.

## s03-ecossistema-aurora — Ecossistema — atmosfera orbital

**Objetivo:** Atmosfera volumétrica por trás das órbitas dos produtos — profundidade e escala sem disputar atenção com os painéis.

| Configuração no Dreamina | Valor |
|---|---|
| Modelo | Seedance 2.5 |
| Modo | Texto para vídeo (sem imagem) |
| Proporção | 16:9 |
| Duração | 10 s |
| Resolução | 720P |
| Variações | 1 |
| Áudio | desligado (o site não usa som) |
| Créditos (estimativa) | rascunho ≈ 25 · final ≈ 370 |
| Status | `pending` |

```text
[Generation Goal] Slow ribbons of cyan and violet aurora-like light drifting through deep empty space, with very sparse glowing dust, on pure black.
[Style lock] Dark cinematic technology film. Deep near-black space lit only by self-emissive light. Brand palette: cyan #29ABE2 and electric blue #00D4FF as the dominant light, violet #A855F7 as the only secondary accent, cool white #EAF6FF only at the hottest points. Precise, engineered, calm; fine volumetric glow and sparse floating particles; shallow depth of field, 35mm lens look; photoreal render quality; 24 fps.
[0-4s] Two faint ribbons of cyan light drift diagonally across the upper half of the frame, folding slowly like silk.
[4-7s] A thinner violet ribbon crosses behind them at a different depth; tiny dust motes catch the light.
[7-10s] The ribbons keep drifting at the same speed and thin out until the frame matches the opening second.
Camera: static camera, no movement
Lighting: the ribbons are the only light; soft volumetric falloff; never brighter than mid-grey
Composition: light concentrated in the upper and central area; lower third almost black (space for interface panels)
Motion: very slow, constant drift; no flashes
Constraints: the final second returns to the exact composition and density of the first second, for a seamless loop; pure black background (#000000) everywhere outside the light; the subject is light itself: no solid surfaces, no floor, no environment; subject kept in the central 40% of the frame so a 9:16 centre crop keeps it whole; one continuous take, no cuts; no camera shake, slow constant motion; locked exposure and white balance, no flicker; minimal motion blur; no text, no letters, no numbers, no logos, no watermark; no people, no faces, no hands; NO BGM; no subtitles.
```

**Mobile:** recorte central 9:16
**Transições:** entra — entra junto com a órbita no início do capítulo 3; sai — sai quando a câmera desce para a corrente de blocos
**No site:** camada `screen` atrás dos produtos, opacidade 0,5

**Aprovar só se:** sem cortes · sem texto/logo inventado · fundo preto puro (camadas) · exposição estável · começo e fim resolvidos · loop sem salto.

## s04-inovacao-fibras — Inovação — fibras da infraestrutura

**Objetivo:** Sugerir infraestrutura própria e dados em trânsito sob a corrente de blocos — luz correndo por canais finos, em macro.

| Configuração no Dreamina | Valor |
|---|---|
| Modelo | Seedance 2.5 |
| Modo | Texto para vídeo (sem imagem) |
| Proporção | 16:9 |
| Duração | 8 s |
| Resolução | 720P |
| Variações | 1 |
| Áudio | desligado (o site não usa som) |
| Créditos (estimativa) | rascunho ≈ 25 · final ≈ 296 |
| Status | `pending` |

```text
[Generation Goal] Macro view of pulses of light racing through fine parallel glass-fibre channels that recede toward a vanishing point, on pure black.
[Style lock] Dark cinematic technology film. Deep near-black space lit only by self-emissive light. Brand palette: cyan #29ABE2 and electric blue #00D4FF as the dominant light, violet #A855F7 as the only secondary accent, cool white #EAF6FF only at the hottest points. Precise, engineered, calm; fine volumetric glow and sparse floating particles; shallow depth of field, 35mm lens look; photoreal render quality; 24 fps.
[0-3s] Dozens of hair-thin fibre channels lie in parallel, receding into the distance; short pulses of cyan light run along them toward the horizon.
[3-6s] Some pulses split at junctions and continue on two channels; an occasional violet pulse travels among the cyan ones.
[6-8s] The pulse rhythm stays constant and returns to the spacing of the opening second.
Camera: low angle, very slow forward dolly along the fibres, constant speed
Lighting: only the pulses emit light; fibres faintly visible where pulses pass; deep black elsewhere
Composition: vanishing point at the centre; fibres occupy the lower 60% of the frame
Constraints: the final second returns to the exact composition and density of the first second, for a seamless loop; pure black background (#000000) everywhere outside the light; the subject is light itself: no solid surfaces, no floor, no environment; subject kept in the central 40% of the frame so a 9:16 centre crop keeps it whole; one continuous take, no cuts; no camera shake, slow constant motion; locked exposure and white balance, no flicker; minimal motion blur; no text, no letters, no numbers, no logos, no watermark; no people, no faces, no hands; NO BGM; no subtitles.
```

**Mobile:** recorte central 9:16
**Transições:** entra — aparece quando a câmera desce sob as órbitas; sai — dissolve no início do Futuro
**No site:** camada `screen` sob a corrente de hashes e a árvore de Merkle

**Aprovar só se:** sem cortes · sem texto/logo inventado · fundo preto puro (camadas) · exposição estável · começo e fim resolvidos · loop sem salto.

## s05-futuro-horizonte — Futuro — horizonte de luz

**Objetivo:** Encerrar com amplitude: um horizonte de luz que nasce atrás de todo o ecossistema.

| Configuração no Dreamina | Valor |
|---|---|
| Modelo | Seedance 2.5 |
| Modo | Texto para vídeo (sem imagem) |
| Proporção | 16:9 |
| Duração | 8 s |
| Resolução | 720P |
| Variações | 1 |
| Áudio | desligado (o site não usa som) |
| Créditos (estimativa) | rascunho ≈ 25 · final ≈ 296 |
| Status | `pending` |

```text
[Generation Goal] A wide dark horizon where a thin line of cyan dawn light slowly widens and brightens, with faint grid lines on an endless plane in the foreground, on pure black.
[Style lock] Dark cinematic technology film. Deep near-black space lit only by self-emissive light. Brand palette: cyan #29ABE2 and electric blue #00D4FF as the dominant light, violet #A855F7 as the only secondary accent, cool white #EAF6FF only at the hottest points. Precise, engineered, calm; fine volumetric glow and sparse floating particles; shallow depth of field, 35mm lens look; photoreal render quality; 24 fps.
[0-3s] A razor-thin line of cyan light sits on the horizon in the lower third; faint perspective grid lines on the plane converge toward it.
[3-6s] The horizon glow widens gently upward with a soft violet edge above the cyan.
[6-8s] The glow settles and eases back to the width of the opening second.
Camera: static wide shot, eye level with the horizon
Lighting: only the horizon line emits; gradient falloff into black above and below
Composition: horizon at the lower third; upper two thirds stay dark for the closing headline
Constraints: the final second returns to the exact composition and density of the first second, for a seamless loop; pure black background (#000000) everywhere outside the light; the subject is light itself: no solid surfaces, no floor, no environment; subject kept in the central 40% of the frame so a 9:16 centre crop keeps it whole; one continuous take, no cuts; no camera shake, slow constant motion; locked exposure and white balance, no flicker; minimal motion blur; no text, no letters, no numbers, no logos, no watermark; no people, no faces, no hands; NO BGM; no subtitles.
```

**Mobile:** recorte central 9:16
**Transições:** entra — entra quando a câmera recua para o plano geral do Futuro; sai — permanece até a experiência liberar a página
**No site:** camada `screen` atrás do plano final e dos CTAs

**Aprovar só se:** sem cortes · sem texto/logo inventado · fundo preto puro (camadas) · exposição estável · começo e fim resolvidos · loop sem salto.

## t01-teaser-entrada — Teaser vertical 1/3 — entrar no núcleo

**Objetivo:** Peça para redes sociais: continua exatamente do último quadro da abertura do site.

| Configuração no Dreamina | Valor |
|---|---|
| Modelo | Seedance 2.5 |
| Modo | Imagem para vídeo — só primeiro quadro |
| Proporção | 9:16 |
| Duração | 5 s |
| Resolução | 1080P |
| Variações | 1 |
| Áudio | desligado (o site não usa som) |
| Primeiro quadro | `references/s01-nucleo-abertura-ultimo-quadro.png` |
| Créditos (estimativa) | rascunho ≈ 25 · final ≈ 455 |
| Status | `pending` |

```text
[Generation Goal] The camera pushes straight into the blazing energy core; its light opens into a vast space of branching light filaments.
[Style lock] Dark cinematic technology film. Deep near-black space lit only by self-emissive light. Brand palette: cyan #29ABE2 and electric blue #00D4FF as the dominant light, violet #A855F7 as the only secondary accent, cool white #EAF6FF only at the hottest points. Precise, engineered, calm; fine volumetric glow and sparse floating particles; shallow depth of field, 35mm lens look; photoreal render quality; 24 fps.
[Continuity] The video begins exactly on the provided first frame; motion continues the direction and speed of the previous shot.
[0-2s] Slow push-in toward the bright core at the centre; the metal plates slide out of frame at the edges.
[2-5s] The camera passes through the light; on the other side, filaments of cyan light branch into a neural lattice around the lens, still moving forward.
Camera: single forward dolly, constant speed, centred
Lighting: the core is the light source; exposure locked even when passing through the light
Composition: vanishing point centred for the whole shot
Constraints: one continuous take, no cuts; no camera shake, slow constant motion; locked exposure and white balance, no flicker; minimal motion blur; no text, no letters, no numbers, no logos, no watermark; no people, no faces, no hands; NO BGM; no subtitles.
```

**Transições:** entra — —; sai — termina em movimento para frente — a próxima cena começa deste último quadro

**Aprovar só se:** sem cortes · sem texto/logo inventado · fundo preto puro (camadas) · exposição estável · começo e fim resolvidos.

## t02-teaser-ecossistema — Teaser vertical 2/3 — seis luzes em órbita

**Objetivo:** A rede se organiza em seis luzes de cores distintas orbitando o núcleo — o ecossistema.

| Configuração no Dreamina | Valor |
|---|---|
| Modelo | Seedance 2.5 |
| Modo | Imagem para vídeo — só primeiro quadro |
| Proporção | 9:16 |
| Duração | 5 s |
| Resolução | 1080P |
| Variações | 1 |
| Áudio | desligado (o site não usa som) |
| Primeiro quadro | `references/t01-teaser-entrada-ultimo-quadro.png` |
| Créditos (estimativa) | rascunho ≈ 25 · final ≈ 455 |
| Status | `pending` |

```text
[Generation Goal] The neural lattice gathers into six small glowing spheres of distinct colours slowly orbiting a bright central core.
[Style lock] Dark cinematic technology film. Deep near-black space lit only by self-emissive light. Brand palette: cyan #29ABE2 and electric blue #00D4FF as the dominant light, violet #A855F7 as the only secondary accent, cool white #EAF6FF only at the hottest points. Precise, engineered, calm; fine volumetric glow and sparse floating particles; shallow depth of field, 35mm lens look; photoreal render quality; 24 fps.
[Continuity] The video begins exactly on the provided first frame; motion continues the direction and speed of the previous shot.
[0-2s] Continuing the same forward motion, the filaments draw together into six points of light.
[2-5s] The six lights — sky blue, cyan-green, violet-magenta, orange-amber, cyan-violet and emerald — settle into one thin elliptical orbit around the core; the camera slows and rises slightly.
Camera: forward drift slowing to a gentle rise, no rotation
Lighting: core and six spheres are the only light sources
Composition: core centred; orbit fills the central 80% of the width
Constraints: one continuous take, no cuts; no camera shake, slow constant motion; locked exposure and white balance, no flicker; minimal motion blur; no text, no letters, no numbers, no logos, no watermark; no people, no faces, no hands; NO BGM; no subtitles.
```

**Transições:** entra — —; sai — termina com a órbita estável vista levemente de cima

**Aprovar só se:** sem cortes · sem texto/logo inventado · fundo preto puro (camadas) · exposição estável · começo e fim resolvidos.

## t03-teaser-assinatura — Teaser vertical 3/3 — a esfera se fecha

**Objetivo:** Fechar o teaser na assinatura: as luzes voltam ao núcleo e as placas metálicas se fecham formando a esfera ATS — o primeiro quadro do site.

| Configuração no Dreamina | Valor |
|---|---|
| Modelo | Seedance 2.5 |
| Modo | Primeiro e último quadro (First and last frames) |
| Proporção | 9:16 |
| Duração | 5 s |
| Resolução | 1080P |
| Variações | 1 |
| Áudio | desligado (o site não usa som) |
| Primeiro quadro | `references/t02-teaser-ecossistema-ultimo-quadro.png` |
| Último quadro | `references/s01-nucleo-abertura-primeiro-quadro.png` |
| Créditos (estimativa) | rascunho ≈ 25 · final ≈ 455 |
| Status | `pending` |

```text
[Generation Goal] The six orbiting lights spiral back into the core and the armoured metal plates close around it, sealing the metallic sphere.
[Style lock] Dark cinematic technology film. Deep near-black space lit only by self-emissive light. Brand palette: cyan #29ABE2 and electric blue #00D4FF as the dominant light, violet #A855F7 as the only secondary accent, cool white #EAF6FF only at the hottest points. Precise, engineered, calm; fine volumetric glow and sparse floating particles; shallow depth of field, 35mm lens look; photoreal render quality; 24 fps.
[Continuity] The video begins exactly on the provided first frame and ends exactly on the provided last frame; motion continues the direction and speed of the previous shot.
[0-2s] The six lights spiral inward along the orbit and merge into the core.
[2-5s] Curved armoured plates slide in from the edges and lock together around the glowing core, settling into the closed sphere of the last frame.
Camera: slow pull-back that ends exactly on the framing of the provided last frame
Lighting: core glow dims as the plates close; cyan seams stay lit
Composition: sphere centred, matching the last frame
Constraints: one continuous take, no cuts; no camera shake, slow constant motion; locked exposure and white balance, no flicker; minimal motion blur; no NEW text, letters, numbers or logos beyond the lettering already present in the provided frames; no people, no faces, no hands; NO BGM; no subtitles.
```

**Transições:** entra — —; sai — termina no quadro de abertura do site — o teaser faz loop com ele

**Aprovar só se:** sem cortes · sem texto/logo inventado · fundo preto puro (camadas) · exposição estável · começo e fim resolvidos.

---

**Total estimado dos finais:** ≈ 2623 créditos (+ rascunhos ≈ 25 cada).
