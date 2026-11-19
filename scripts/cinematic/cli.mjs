#!/usr/bin/env node
// Cinematic production CLI. One entry point, four commands:
//
//   node scripts/cinematic/cli.mjs new     <slug> "<Nome do projeto>"
//   node scripts/cinematic/cli.mjs check   <slug>
//   node scripts/cinematic/cli.mjs prompts <slug>
//   node scripts/cinematic/cli.mjs ingest  <slug> <shot-id> <video.mp4> [--dry-run]
//
// (npm aliases: prod:new, prod:check, prod:prompts, prod:ingest)
//
// Safety: the input video is only ever READ by ffmpeg/ffprobe, launched with
// an argument array (no shell, no string interpolation into a command line).
// Nothing here talks to the network, logs in anywhere, or touches cookies.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPromptsMarkdown, validateProduction } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PROD_DIR = path.join(ROOT, 'production');
const MANIFEST = path.join(ROOT, 'src', 'experience', 'media.manifest.json');
const SLUG = /^[a-z0-9][a-z0-9-]{1,40}$/;
const VIDEO_EXT = new Set(['.mp4', '.mov', '.webm', '.m4v']);

const [, , cmd, ...args] = process.argv;
const flags = new Set(args.filter((a) => a.startsWith('--')));
const pos = args.filter((a) => !a.startsWith('--'));

function die(msg) {
  console.error(`✕ ${msg}`);
  process.exit(1);
}
function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}
function prodPaths(slug) {
  if (!SLUG.test(slug ?? '')) die(`slug inválido: "${slug}" (use minúsculas, números e hífen)`);
  const dir = path.join(PROD_DIR, slug);
  return { dir, shots: path.join(dir, 'shots.json'), prompts: path.join(dir, 'prompts.md') };
}
function loadProduction(slug) {
  const p = prodPaths(slug);
  if (!fs.existsSync(p.shots)) die(`produção "${slug}" não existe (${path.relative(ROOT, p.shots)})`);
  return { ...p, prod: readJson(p.shots) };
}
const existsIn = (dir) => (rel) => fs.existsSync(path.join(dir, rel));

function report({ errors, warnings }) {
  for (const w of warnings) console.log(`  ! ${w}`);
  for (const e of errors) console.log(`  ✕ ${e}`);
  return errors.length === 0;
}

function tool(name) {
  const r = spawnSync(name, ['-version'], { encoding: 'utf8' });
  if (r.error || r.status !== 0) die(`${name} não encontrado — instale o ffmpeg (Windows: winget install Gyan.FFmpeg)`);
}
function run(bin, argv, dry) {
  if (dry) {
    console.log(`  $ ${bin} ${argv.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(' ')}`);
    return '';
  }
  const r = spawnSync(bin, argv, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) die(`${bin} falhou:\n${(r.stderr || '').split('\n').slice(-8).join('\n')}`);
  return r.stdout;
}
function probe(file) {
  const out = run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate:format=duration', '-of', 'json', file]);
  const j = JSON.parse(out);
  const st = j.streams?.[0] ?? {};
  const [n, d] = String(st.r_frame_rate ?? '24/1').split('/').map(Number);
  return { width: st.width, height: st.height, fps: d ? n / d : 24, duration: Number(j.format?.duration ?? 0) };
}
const mib = (bytes) => (bytes / 1024 / 1024).toFixed(2);

// ── commands ───────────────────────────────────────────────────────────────

function cmdNew() {
  const [slug, ...nameParts] = pos;
  const name = nameParts.join(' ').trim() || slug;
  const p = prodPaths(slug);
  if (fs.existsSync(p.dir)) die(`production/${slug} já existe`);
  const tpl = path.join(PROD_DIR, '_template');
  fs.cpSync(tpl, p.dir, { recursive: true });
  for (const f of fs.readdirSync(p.dir)) {
    const fp = path.join(p.dir, f);
    if (fs.statSync(fp).isFile()) fs.writeFileSync(fp, fs.readFileSync(fp, 'utf8').replaceAll('{{SLUG}}', slug).replaceAll('{{NOME}}', name));
  }
  fs.mkdirSync(path.join(p.dir, 'references'), { recursive: true });
  console.log(`✓ production/${slug} criada. Próximo passo: preencher brief.md com fatos reais do projeto.`);
}

function cmdCheck() {
  const { dir, prod } = loadProduction(pos[0]);
  console.log(`Verificando production/${pos[0]}…`);
  const ok = report(validateProduction(prod, existsIn(dir)));
  if (fs.existsSync(MANIFEST) && prod.site !== false) {
    const manifest = readJson(MANIFEST);
    if (manifest.production === prod.production) {
      for (const slot of manifest.slots) {
        for (const src of [slot.desktop, slot.mobile]) {
          for (const u of [src?.mp4, src?.webm].filter(Boolean)) {
            if (!fs.existsSync(path.join(ROOT, 'public', u))) {
              console.log(`  ✕ manifest: ${slot.id} aponta para ${u}, que não existe em public/`);
              process.exitCode = 1;
            }
          }
        }
      }
    }
  }
  if (!ok) process.exit(1);
  console.log('✓ produção consistente');
}

function cmdPrompts() {
  const { dir, prod, prompts } = loadProduction(pos[0]);
  const ok = report(validateProduction(prod, existsIn(dir)));
  if (!ok) die('corrija os erros acima antes de gerar os prompts');
  fs.writeFileSync(prompts, renderPromptsMarkdown(prod));
  console.log(`✓ ${path.relative(ROOT, prompts)} gerado (${prod.shots.length} cenas)`);
}

function cmdIngest() {
  const [slug, shotId, input] = pos;
  const dry = flags.has('--dry-run');
  const { dir, shots: shotsPath, prod } = loadProduction(slug);
  const shot = prod.shots.find((s) => s.id === shotId);
  if (!shot) die(`cena "${shotId}" não existe em production/${slug}/shots.json`);
  if (!input || !fs.existsSync(input)) die(`arquivo de vídeo não encontrado: ${input}`);
  if (!VIDEO_EXT.has(path.extname(input).toLowerCase())) die('aceito apenas .mp4, .mov, .webm ou .m4v');
  tool('ffmpeg');
  tool('ffprobe');

  const src = path.resolve(input);
  const info = probe(src);
  console.log(`Fonte: ${info.width}×${info.height}, ${info.fps.toFixed(2)} fps, ${info.duration.toFixed(2)} s`);
  const [aw, ah] = shot.aspect.split(':').map(Number);
  if (Math.abs(info.width / info.height - aw / ah) > 0.03) console.log(`  ! proporção ${info.width}:${info.height} difere da planejada (${shot.aspect})`);
  if (Math.abs(info.duration - shot.duration) > 1.5) console.log(`  ! duração ${info.duration.toFixed(1)} s difere da planejada (${shot.duration} s)`);

  const pubRel = path.posix.join('cinematic', slug, shot.id);
  const outDir = path.join(ROOT, 'public', pubRel);
  const refDir = path.join(dir, 'references');
  if (!dry) {
    fs.mkdirSync(outDir, { recursive: true });
    fs.mkdirSync(refDir, { recursive: true });
  }
  const scrub = shot.kind === 'scrub';
  const gopD = scrub ? ['-g', '8', '-keyint_min', '8', '-sc_threshold', '0'] : ['-g', '48'];
  const gopM = scrub ? ['-g', '4', '-keyint_min', '4', '-sc_threshold', '0'] : ['-g', '48'];
  const landscape = info.width >= info.height;
  // mobile: centre crop to 9:16 when the source is wider (the prompt kept the subject centre-safe)
  const mobileVf = landscape ? 'crop=trunc(ih*9/16/2)*2:ih,scale=720:-2,fps=24' : 'scale=720:-2,fps=24';
  const desktopVf = `scale='min(1920,iw)':-2,fps=24`;
  const common = ['-y', '-i', src, '-an', '-pix_fmt', 'yuv420p'];
  const out = {
    dmp4: path.join(outDir, 'desktop.mp4'),
    dwebm: path.join(outDir, 'desktop.webm'),
    mmp4: path.join(outDir, 'mobile.mp4'),
    mwebm: path.join(outDir, 'mobile.webm'),
    poster: path.join(outDir, 'poster.webp'),
  };

  if (shot.kind === 'frames') {
    const fdir = path.join(outDir, 'frames');
    if (!dry) fs.mkdirSync(fdir, { recursive: true });
    run('ffmpeg', ['-y', '-i', src, '-vf', 'fps=20,scale=540:-2', '-c:v', 'libwebp', '-quality', '70', path.join(fdir, 'frame-%03d.webp')], dry);
  } else {
    console.log('Codificando versões web…');
    run('ffmpeg', [...common, '-vf', desktopVf, '-c:v', 'libx264', '-preset', 'slow', '-crf', scrub ? '20' : '24', ...gopD, '-movflags', '+faststart', out.dmp4], dry);
    run('ffmpeg', [...common, '-vf', desktopVf, '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-row-mt', '1', ...gopD, out.dwebm], dry);
    run('ffmpeg', [...common, '-vf', mobileVf, '-c:v', 'libx264', '-preset', 'slow', '-crf', scrub ? '23' : '26', ...gopM, '-movflags', '+faststart', out.mmp4], dry);
    run('ffmpeg', [...common, '-vf', mobileVf, '-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-row-mt', '1', ...gopM, out.mwebm], dry);
    // poster = first frame of the ENCODED desktop clip, never a separate still
    run('ffmpeg', ['-y', '-i', out.dmp4, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '80', out.poster], dry);
  }
  // continuity references for the next shots
  const first = path.join(refDir, `${shot.id}-primeiro-quadro.png`);
  const last = path.join(refDir, `${shot.id}-ultimo-quadro.png`);
  run('ffmpeg', ['-y', '-i', src, '-frames:v', '1', first], dry);
  run('ffmpeg', ['-y', '-sseof', '-0.1', '-i', src, '-frames:v', '1', '-update', '1', last], dry);

  if (dry) {
    console.log('(dry-run: nada foi escrito)');
    return;
  }

  // budgets
  const sizes = Object.fromEntries(Object.entries(out).filter(([, f]) => fs.existsSync(f)).map(([k, f]) => [k, fs.statSync(f).size]));
  for (const [k, b] of Object.entries(sizes)) console.log(`  ${k.padEnd(6)} ${mib(b)} MiB`);
  const budget = prod.budgets ?? { desktopMiB: 32, mobileMiB: 16 };

  // register in the site manifest
  if (prod.site !== false && shot.kind !== 'film') {
    const manifest = readJson(MANIFEST);
    let slot = manifest.slots.find((s) => s.id === shot.id);
    if (!slot) {
      slot = { id: shot.id, chapter: shot.chapter, kind: shot.kind, blend: shot.blend ?? 'normal', opacity: shot.opacity ?? 0.8 };
      manifest.slots.push(slot);
    }
    Object.assign(slot, {
      status: 'ready',
      desktop: { mp4: `/${pubRel}/desktop.mp4`, webm: `/${pubRel}/desktop.webm` },
      mobile: { mp4: `/${pubRel}/mobile.mp4`, webm: `/${pubRel}/mobile.webm` },
      poster: `/${pubRel}/poster.webp`,
    });
    const total = (key) =>
      manifest.slots
        .filter((s) => s.status === 'ready' && s[key])
        .reduce((sum, s) => sum + (fs.existsSync(path.join(ROOT, 'public', s[key].mp4)) ? fs.statSync(path.join(ROOT, 'public', s[key].mp4)).size : 0), 0);
    const dTotal = total('desktop');
    const mTotal = total('mobile');
    console.log(`Total de camadas: desktop ${mib(dTotal)} MiB (orçamento ${budget.desktopMiB}) · mobile ${mib(mTotal)} MiB (orçamento ${budget.mobileMiB})`);
    if (dTotal > budget.desktopMiB * 1048576 || mTotal > budget.mobileMiB * 1048576) console.log('  ! acima do orçamento — encurte a cena ou aumente o CRF');
    writeJson(MANIFEST, manifest);
    console.log(`✓ ${shot.id} registrado em src/experience/media.manifest.json`);
  }

  shot.status = 'ingested';
  shot.ingested = {
    file: path.basename(src),
    sha256: createHash('sha256').update(fs.readFileSync(src)).digest('hex'),
    width: info.width,
    height: info.height,
    duration: Number(info.duration.toFixed(2)),
    at: new Date().toISOString().slice(0, 10),
  };
  writeJson(shotsPath, prod);
  console.log(`✓ referências de continuidade: references/${path.basename(first)}, references/${path.basename(last)}`);
  console.log('Próximo passo: npm run build e conferir a cena no site.');
}

const COMMANDS = { new: cmdNew, check: cmdCheck, prompts: cmdPrompts, ingest: cmdIngest };
if (!COMMANDS[cmd]) {
  console.log('uso: cli.mjs <new|check|prompts|ingest> …');
  process.exit(cmd ? 1 : 0);
}
COMMANDS[cmd]();
