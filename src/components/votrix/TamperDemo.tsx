import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BadgeCheck, Link2, RotateCcw, Wand2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const ORIGINAL = ['cédula 7f3a91c2e0', 'cédula 0b84d6f15a', 'cédula c29e7704bd', 'cédula 5d1fa38e26'];
const GENESIS = '0000000000';

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Each block's hash covers its own content AND the previous block's hash — that is the whole chain. */
async function chain(data: string[]): Promise<{ prev: string; hash: string }[]> {
  const out: { prev: string; hash: string }[] = [];
  let prev = GENESIS;
  for (let i = 0; i < data.length; i++) {
    const hash = await sha256(`${i + 1}|${prev}|${data[i]}`);
    out.push({ prev, hash });
    prev = hash;
  }
  return out;
}

const cut = (h: string) => h.slice(0, 10);

/**
 * "Try to cheat": a four-block chain with real SHA-256 in the browser. The
 * hashes sealed at the start are what the public already saw; change one
 * character of any block and every hash from there on stops matching —
 * which is exactly how anyone running the VOTRIX verifier notices tampering.
 */
const TamperDemo: React.FC = () => {
  const [data, setData] = useState<string[]>(ORIGINAL);
  const [sealed, setSealed] = useState<string[] | null>(null);
  const [now, setNow] = useState<{ prev: string; hash: string }[] | null>(null);

  useEffect(() => {
    chain(ORIGINAL).then((c) => {
      setSealed(c.map((b) => b.hash));
      setNow(c);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    let live = true;
    chain(data).then((c) => live && setNow(c)).catch(() => undefined);
    return () => {
      live = false;
    };
  }, [data]);

  const broken = useMemo(() => (sealed && now ? now.map((b, i) => b.hash !== sealed[i]) : ORIGINAL.map(() => false)), [sealed, now]);
  const firstBroken = broken.indexOf(true);
  const tampered = firstBroken >= 0;

  const tamper = () =>
    setData((d) => d.map((v, i) => (i === 1 ? v.slice(0, -1) + (v.endsWith('a') ? 'b' : 'a') : v)));

  if (!sealed || !now) return null;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#060d1d]/80 p-4 sm:p-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-0 lg:items-stretch">
        {data.map((v, i) => (
          <div key={i} className="flex flex-col lg:flex-row lg:items-center">
            {i > 0 && (
              <div className="hidden lg:flex w-6 shrink-0 justify-center">
                <Link2 className={cn('h-4 w-4 rotate-45', broken[i] ? 'text-rose-400' : 'text-cyan-300')} />
              </div>
            )}
            <div
              className={cn(
                'flex-1 min-w-0 rounded-xl border p-2.5 sm:p-3 transition-colors duration-300',
                broken[i] ? 'border-rose-400/60 bg-rose-500/[0.07]' : 'border-emerald-300/30 bg-emerald-300/[0.04]',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold text-white">Bloco {i + 1}</span>
                {broken[i] ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-300"><AlertTriangle className="h-3 w-3" />não confere</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300"><BadgeCheck className="h-3 w-3" />confere</span>
                )}
              </div>
              <label className="mt-2 block text-[10px] uppercase tracking-wider text-gray-500" htmlFor={`tamper-${i}`}>conteúdo</label>
              <input
                id={`tamper-${i}`}
                value={v}
                onChange={(e) => {
                  const val = e.target.value;
                  setData((d) => d.map((x, j) => (j === i ? val : x)));
                }}
                spellCheck={false}
                className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-2 py-1.5 font-mono text-[11px] text-gray-200 focus:border-cyan-300/60 focus:outline-none"
              />
              <dl className="mt-2 space-y-1 font-mono text-[10px] leading-tight">
                <div className="flex justify-between gap-2"><dt className="text-gray-500">anterior</dt><dd className="text-gray-300">{cut(now[i]!.prev)}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-gray-500">agora</dt><dd className={broken[i] ? 'text-rose-300' : 'text-emerald-200'}>{cut(now[i]!.hash)}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-gray-500">publicado</dt><dd className="text-gray-400">{cut(sealed[i]!)}</dd></div>
              </dl>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <p className={cn('text-sm leading-relaxed', tampered ? 'text-rose-200' : 'text-gray-400')} role="status" aria-live="polite">
          {tampered
            ? `Adulteração detectada a partir do bloco ${firstBroken + 1}: o hash calculado já não é o que foi publicado — e a corrente inteira dali em diante quebra junto. Qualquer pessoa que rode o verificador vê.`
            : 'Tudo confere: cada hash calculado é igual ao que foi publicado. Agora tente mudar um único caractere de qualquer bloco.'}
        </p>
        <div className="flex shrink-0 gap-2">
          {tampered ? (
            <button
              onClick={() => setData(ORIGINAL)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/[0.08] transition-colors"
            >
              <RotateCcw className="h-4 w-4" /> Restaurar
            </button>
          ) : (
            <button
              onClick={tamper}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/20 transition-colors"
            >
              <Wand2 className="h-4 w-4" /> Adulterar o bloco 2
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TamperDemo;
