import { useEffect, type RefObject } from 'react';

/**
 * Faz a cena "respirar" com o corpo de quem olha: no celular, inclinar o
 * aparelho desloca levemente o vídeo e o console holográfico (paralaxe por
 * giroscópio); no desktop, o mesmo efeito segue o mouse.
 *
 * Escreve só duas variáveis CSS no elemento (`--tilt-x` e `--tilt-y`, de -1
 * a 1) num único rAF suavizado — quem consome decide quanto se mover. Nada
 * de re-render do React por quadro.
 *
 * iOS exige permissão explícita (`DeviceOrientationEvent.requestPermission`)
 * com um diálogo do sistema; não pedimos — um alerta surgindo no primeiro
 * toque quebraria a imersão em vez de criá-la. No iPhone a cena fica estável;
 * no Android os eventos chegam direto, sem pedir nada.
 */
export function useSceneTilt(targetRef: RefObject<HTMLElement | null>, enabled = true): void {
  useEffect(() => {
    const el = targetRef.current;
    if (!el || !enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let rafId: number | null = null;
    // Postura "neutra" = como a pessoa segurava o celular na primeira leitura;
    // assim ninguém precisa segurá-lo na vertical para ver a cena centrada.
    let baseBeta: number | null = null;
    let baseGamma: number | null = null;

    const clamp = (v: number) => Math.max(-1, Math.min(1, v));

    const tick = () => {
      x += (targetX - x) * 0.08;
      y += (targetY - y) * 0.08;
      el.style.setProperty('--tilt-x', x.toFixed(4));
      el.style.setProperty('--tilt-y', y.toFixed(4));
      if (Math.abs(targetX - x) > 0.001 || Math.abs(targetY - y) > 0.001) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };
    const kick = () => {
      if (rafId === null && !document.hidden) rafId = requestAnimationFrame(tick);
    };

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      if (baseBeta === null || baseGamma === null) {
        baseBeta = e.beta;
        baseGamma = e.gamma;
      }
      // ±18° de inclinação já leva ao deslocamento máximo.
      targetX = clamp((e.gamma - baseGamma) / 18);
      targetY = clamp((e.beta - baseBeta) / 18);
      // A postura neutra acompanha devagar — quem muda a forma de segurar
      // o celular não fica com a cena "torta" para sempre.
      baseBeta += (e.beta - baseBeta) * 0.004;
      baseGamma += (e.gamma - baseGamma) * 0.004;
      kick();
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      targetX = clamp((e.clientX / window.innerWidth) * 2 - 1);
      targetY = clamp((e.clientY / window.innerHeight) * 2 - 1);
      kick();
    };

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const DOE = window.DeviceOrientationEvent as
      | (typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> })
      | undefined;

    const needsPermission = typeof DOE?.requestPermission === 'function';
    if (coarse) {
      if (DOE && !needsPermission) window.addEventListener('deviceorientation', onOrientation);
    } else {
      window.addEventListener('pointermove', onPointer, { passive: true });
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('deviceorientation', onOrientation);
      window.removeEventListener('pointermove', onPointer);
      el.style.removeProperty('--tilt-x');
      el.style.removeProperty('--tilt-y');
    };
  }, [targetRef, enabled]);
}
