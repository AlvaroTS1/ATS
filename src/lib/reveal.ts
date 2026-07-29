/**
 * V7's absolute rule: nothing is born, nothing enters, nothing slides.
 *
 * The previous grammar (`.animate-materialize`) grew every element from
 * `scale(0.25)`. Growing is what communicates "this did not exist a moment
 * ago" — it is birth, and birth is exactly what V7 forbids, because it
 * tells the viewer that a *document* is assembling itself on top of a
 * scene.
 *
 * What replaces it is a FOCUS PULL. The object was always there, at its
 * final size, in its final position — it was simply out of focus and
 * blown out by light. The camera resolves it. Scale and position never
 * change; only blur, brightness, saturation and opacity do. Same
 * energetic quality as before (glow collapsing into a solid edge), none
 * of the "it wasn't here" tell.
 *
 * These constants live together because the dormant class and the
 * keyframes must agree exactly: the resting blur has to match the
 * keyframe's 0% blur, or the element visibly POPS at animation start —
 * the one artefact that would give the whole trick away.
 */

/** Must match `reveal-focus`'s duration in `index.css`. */
export const REVEAL_DURATION_MS = 1100;

/**
 * The resting state: present in layout, at full size, simply unresolved.
 * Every filter here mirrors `reveal-focus`'s 0% frame EXACTLY — blur,
 * brightness and saturation. Deliberately NO scale and NO translate.
 *
 * The saturation is easy to dismiss as unnecessary, since opacity is 0 at
 * 0% and a one-frame mismatch can't be seen through a transparent
 * element. It's here anyway: the moment anything raises the resting
 * opacity above zero — which V7-E's ambient-light work is heading
 * straight toward — a silent mismatch becomes a visible flash on the
 * first frame, and that is precisely the kind of artefact that announces
 * "this is a web page animating".
 */
export const REVEAL_DORMANT =
  'opacity-0 blur-[14px] brightness-[2.2] saturate-150 pointer-events-none';

/**
 * `.animate-reveal` declares two animations in one shorthand (the focus
 * pull, then the endless idle breathe), so `animationDelay` has to be a
 * comma-separated pair — a single value would delay only the first and
 * let the idle loop start immediately, breathing over an element that
 * hasn't resolved yet.
 */
export const revealDelay = (ms: number) => ({
  animationDelay: `${ms}ms, ${REVEAL_DURATION_MS + ms}ms`,
});
