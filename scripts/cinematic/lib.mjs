// Shared, pure logic of the cinematic production pipeline.
// No I/O here — every function takes data and returns data, so the whole
// pipeline (validation, prompt rendering, credit estimates) is unit-tested
// in `src/experience/__tests__/production.test.ts`.

export const KINDS = ['frames', 'loop', 'scrub', 'film'];
export const MODES = ['text', 'first-frame', 'first-last-frame', 'reference'];
export const ASPECTS = ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'];
export const RESOLUTIONS = ['480P', '720P', '1080P'];
export const STATUSES = ['pending', 'generated', 'ingested', 'ready', 'rejected'];

/** Constraints appended to EVERY prompt — the footage contract. */
export const FOOTAGE_CONTRACT = [
  'one continuous take, no cuts',
  'no camera shake, slow constant motion',
  'locked exposure and white balance, no flicker',
  'minimal motion blur',
  'no text, no letters, no numbers, no logos, no watermark',
  'no people, no faces, no hands',
  'NO BGM',
  'no subtitles',
];

/** Extra constraints for layers composited with `screen` blend over the 3D world. */
export const SCREEN_LAYER_CONTRACT = [
  'pure black background (#000000) everywhere outside the light',
  'the subject is light itself: no solid surfaces, no floor, no environment',
  'subject kept in the central 40% of the frame so a 9:16 centre crop keeps it whole',
];

export const LOOP_CONTRACT = ['the final second returns to the exact composition and density of the first second, for a seamless loop'];

/**
 * Credits per second by model and resolution. NOT official: read from the
 * Dreamina credit indicator by a third party (2026-09-03). The production's
 * own `creditRates` overrides this — always confirm in the Dreamina UI.
 */
export const DEFAULT_CREDIT_RATES = {
  'Seedance 2.5': { '480P': 17, '720P': 37, '1080P': 91 },
  'Seedance 2.0 Mini': { '480P': 2.5, '720P': 5 },
};

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;

/**
 * Validates a production (`shots.json`). Returns `{ errors, warnings }`.
 * `fileExists(relPath)` lets the caller decide what "exists" means (disk in
 * the CLI, a set in tests).
 */
export function validateProduction(prod, fileExists = () => true) {
  const errors = [];
  const warnings = [];
  if (!prod || typeof prod !== 'object') return { errors: ['shots.json vazio ou inválido'], warnings };
  if (!isStr(prod.production)) errors.push('campo "production" ausente');
  if (!isStr(prod.styleLock)) errors.push('campo "styleLock" ausente — o preâmbulo de estilo idêntico em todas as cenas é obrigatório');
  if (!Array.isArray(prod.shots) || prod.shots.length === 0) errors.push('nenhuma cena em "shots"');
  const ids = new Set();
  const byId = new Map();
  for (const s of prod.shots ?? []) {
    const where = `[${s.id ?? '?'}]`;
    if (!isStr(s.id)) errors.push(`${where} cena sem "id"`);
    else if (ids.has(s.id)) errors.push(`${where} id duplicado`);
    ids.add(s.id);
    byId.set(s.id, s);
    if (!KINDS.includes(s.kind)) errors.push(`${where} "kind" deve ser um de ${KINDS.join(', ')}`);
    if (!STATUSES.includes(s.status)) errors.push(`${where} "status" deve ser um de ${STATUSES.join(', ')}`);
    if (s.legacy) continue; // already-produced footage: documented, not re-generated
    for (const f of ['chapter', 'objective', 'camera', 'lighting', 'composition', 'goal']) {
      if (!isStr(s[f])) errors.push(`${where} campo "${f}" ausente`);
    }
    if (!MODES.includes(s.mode)) errors.push(`${where} "mode" deve ser um de ${MODES.join(', ')}`);
    if (!ASPECTS.includes(s.aspect)) errors.push(`${where} "aspect" inválido (${s.aspect})`);
    if (!RESOLUTIONS.includes(s.resolution)) errors.push(`${where} "resolution" inválida (${s.resolution})`);
    if (typeof s.duration !== 'number' || s.duration < 4 || s.duration > 30) errors.push(`${where} "duration" deve estar entre 4 e 30 s`);
    else if (s.duration > 12 && s.kind !== 'film') warnings.push(`${where} ${s.duration}s é longo para uma camada do site (peso e memória) — prefira 6–10 s`);
    if (!Array.isArray(s.timeline) || s.timeline.length < 2) errors.push(`${where} "timeline" precisa de pelo menos 2 trechos com tempo`);
    else {
      let cursor = 0;
      for (const seg of s.timeline) {
        const m = /^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)s$/.exec(seg.t ?? '');
        if (!m) {
          errors.push(`${where} trecho "${seg.t}" deve ter o formato "0-3s"`);
          continue;
        }
        const a = Number(m[1]);
        const b = Number(m[2]);
        if (a !== cursor) errors.push(`${where} trecho "${seg.t}" deixa buraco ou sobreposição (esperado começar em ${cursor}s)`);
        if (b <= a) errors.push(`${where} trecho "${seg.t}" termina antes de começar`);
        if (!isStr(seg.action)) errors.push(`${where} trecho "${seg.t}" sem "action"`);
        cursor = b;
      }
      if (cursor !== s.duration) errors.push(`${where} a timeline soma ${cursor}s, mas "duration" é ${s.duration}s`);
    }
    if ((s.mode === 'first-frame' || s.mode === 'first-last-frame') && !isStr(s.firstFrame)) {
      errors.push(`${where} modo "${s.mode}" exige "firstFrame"`);
    }
    if (s.mode === 'first-last-frame' && !isStr(s.lastFrame)) errors.push(`${where} modo "first-last-frame" exige "lastFrame"`);
    const refs = Array.isArray(s.references) ? s.references : [];
    if (refs.length > 7) warnings.push(`${where} ${refs.length} referências — o modelo mantém com confiabilidade até ~7 papéis`);
    refs.forEach((r, i) => {
      if (!isStr(r.file)) errors.push(`${where} referência ${i + 1} sem "file"`);
      if (!isStr(r.role)) errors.push(`${where} referência ${i + 1} sem "role" — toda referência precisa dizer o que ela define`);
    });
    if (s.kind === 'loop' && s.blend !== 'screen') warnings.push(`${where} camada "loop" sem blend "screen" — o fundo do vídeo vai cobrir o mundo 3D`);
  }
  // continuity: frames produced by a previous shot can only exist once that shot was ingested
  for (const s of prod.shots ?? []) {
    if (s.legacy) continue;
    const needs = [s.firstFrame, s.lastFrame, ...(s.references ?? []).map((r) => r.file)].filter(isStr);
    for (const file of needs) {
      const from = (s.continuityFrom ?? []).find((c) => c.file === file);
      if (from && !byId.has(from.shot)) errors.push(`[${s.id}] continuidade aponta para cena inexistente "${from.shot}"`);
      if (!fileExists(file)) {
        if (from) warnings.push(`[${s.id}] bloqueada até "${from.shot}" ser ingerida (falta ${file})`);
        else errors.push(`[${s.id}] arquivo de referência não encontrado: ${file}`);
      }
    }
  }
  return { errors, warnings };
}

export function estimateCredits(shot, rates = DEFAULT_CREDIT_RATES, model) {
  const m = model ?? shot.model ?? 'Seedance 2.5';
  const perSecond = rates[m]?.[shot.resolution];
  if (perSecond == null || typeof shot.duration !== 'number') return null;
  return Math.round(perSecond * shot.duration * (shot.variants ?? 1));
}

/** Draft pass: always Seedance 2.0 Mini, 5 s, 720P — validates motion before spending on the final. */
export function estimateDraftCredits(rates = DEFAULT_CREDIT_RATES) {
  const r = rates['Seedance 2.0 Mini']?.['720P'];
  return r == null ? null : Math.round(r * 5);
}

/** Renders the English prompt that goes into Dreamina's prompt box. */
export function renderPrompt(prod, shot) {
  const lines = [];
  lines.push(`[Generation Goal] ${shot.goal}`);
  lines.push(`[Style lock] ${prod.styleLock}`);
  const refs = shot.references ?? [];
  if (refs.length) {
    lines.push(`[Reference roles] ${refs.map((r, i) => `@Image ${i + 1} defines ${r.role}.`).join(' ')}`);
  }
  if (shot.mode === 'first-frame' || shot.mode === 'first-last-frame') {
    lines.push(`[Continuity] The video begins exactly on the provided first frame${shot.mode === 'first-last-frame' ? ' and ends exactly on the provided last frame' : ''}; motion continues the direction and speed of the previous shot.`);
  }
  for (const seg of shot.timeline) lines.push(`[${seg.t}] ${seg.action}`);
  lines.push(`Camera: ${shot.camera}`);
  lines.push(`Lighting: ${shot.lighting}`);
  lines.push(`Composition: ${shot.composition}`);
  if (isStr(shot.motion)) lines.push(`Motion: ${shot.motion}`);
  const constraints = shot.keepExistingMark
    ? FOOTAGE_CONTRACT.map((c) =>
        c.startsWith('no text') ? 'no NEW text, letters, numbers or logos beyond the lettering already present in the provided frames' : c,
      )
    : [...FOOTAGE_CONTRACT];
  if (shot.blend === 'screen') constraints.unshift(...SCREEN_LAYER_CONTRACT);
  if (shot.loop) constraints.unshift(...LOOP_CONTRACT);
  if (Array.isArray(shot.avoid)) constraints.push(...shot.avoid);
  lines.push(`Constraints: ${constraints.join('; ')}.`);
  return lines.join('\n');
}

const MODE_LABEL = {
  text: 'Texto para vídeo (sem imagem)',
  'first-frame': 'Imagem para vídeo — só primeiro quadro',
  'first-last-frame': 'Primeiro e último quadro (First and last frames)',
  reference: 'Referências (all-in-one / omni), imagens como @Image N',
};

/** The full `prompts.md` for a production: one ready-to-paste block per shot. */
export function renderPromptsMarkdown(prod, rates = prod.creditRates ?? DEFAULT_CREDIT_RATES) {
  const out = [];
  out.push(`# Prompts Dreamina — ${prod.title ?? prod.production}`);
  out.push('');
  out.push('> Gerado por `npm run prod:prompts -- ' + prod.production + '` a partir de `shots.json`. Não edite à mão: edite `shots.json` e gere de novo.');
  out.push('');
  out.push('Fluxo por cena: **(1)** rascunho no Seedance 2.0 Mini, 5 s, 720P, para validar movimento e composição → **(2)** final no modelo indicado → **(3)** baixar o MP4 para `production/' + prod.production + '/raw/` → **(4)** `npm run prod:ingest -- ' + prod.production + ' <id-da-cena> <arquivo>`.');
  out.push('');
  out.push('Créditos são **estimativas** (tabela em `shots.json → creditRates`, lida do indicador do Dreamina por terceiros). Confirme o valor no próprio Dreamina antes de gerar.');
  out.push('');
  let total = 0;
  const draft = estimateDraftCredits(rates);
  for (const s of prod.shots) {
    out.push(`## ${s.id} — ${s.title ?? s.chapter ?? ''}`);
    out.push('');
    if (s.legacy) {
      out.push(`**Já produzida** (${s.source ?? 'produção anterior'}). Status: \`${s.status}\`. ${s.note ?? ''}`);
      out.push('');
      continue;
    }
    const credits = estimateCredits(s, rates);
    if (credits) total += credits;
    out.push(`**Objetivo:** ${s.objective}`);
    out.push('');
    out.push('| Configuração no Dreamina | Valor |');
    out.push('|---|---|');
    out.push(`| Modelo | ${s.model ?? 'Seedance 2.5'} |`);
    out.push(`| Modo | ${MODE_LABEL[s.mode]} |`);
    out.push(`| Proporção | ${s.aspect} |`);
    out.push(`| Duração | ${s.duration} s |`);
    out.push(`| Resolução | ${s.resolution} |`);
    out.push(`| Variações | ${s.variants ?? 1} |`);
    out.push(`| Áudio | desligado (o site não usa som) |`);
    if (s.firstFrame) out.push(`| Primeiro quadro | \`${s.firstFrame}\` |`);
    if (s.lastFrame) out.push(`| Último quadro | \`${s.lastFrame}\` |`);
    (s.references ?? []).forEach((r, i) => out.push(`| @Image ${i + 1} | \`${r.file}\` — ${r.role} |`));
    out.push(`| Créditos (estimativa) | rascunho ≈ ${draft ?? '?'} · final ≈ ${credits ?? '?'} |`);
    out.push(`| Status | \`${s.status}\` |`);
    out.push('');
    out.push('```text');
    out.push(renderPrompt(prod, s));
    out.push('```');
    out.push('');
    if (s.mobile) out.push(`**Mobile:** ${s.mobile}`);
    if (s.transitionIn || s.transitionOut) out.push(`**Transições:** entra — ${s.transitionIn ?? '—'}; sai — ${s.transitionOut ?? '—'}`);
    if (s.integration) out.push(`**No site:** ${s.integration}`);
    out.push('');
    out.push('**Aprovar só se:** sem cortes · sem texto/logo inventado · fundo preto puro (camadas) · exposição estável · começo e fim resolvidos' + (s.loop ? ' · loop sem salto' : '') + '.');
    out.push('');
  }
  out.push(`---\n\n**Total estimado dos finais:** ≈ ${total} créditos (+ rascunhos ≈ ${draft ?? '?'} cada).`);
  return out.join('\n') + '\n';
}
