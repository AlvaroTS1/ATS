# Integração no site

## 1. Camada sobre o mundo 3D (`kind: "loop"`) — caminho padrão
O vídeo, gerado sobre **preto puro**, entra num `<video>` com `mix-blend-mode: screen` acima do canvas WebGL. O preto vira transparente e a luz do vídeo se soma à luz do 3D.

- `prod:ingest` grava os arquivos em `public/cinematic/<produção>/<cena>/` (desktop.mp4/webm, mobile.mp4/webm, poster.webp) e marca o slot como `ready` em `src/experience/media.manifest.json`.
- `CoreExperience.tsx` só baixa o vídeo quando o capítulo dele está a um capítulo de distância. A opacidade segue o capítulo e o vídeo pausa fora dele.
- O WebM (VP9) é preferido quando o navegador suporta; o MP4 (H.264) é a alternativa. O mobile recebe o recorte central 9:16.
- Ajuste fino: `opacity` do slot no manifesto.

## 2. Cena de frames controlada pela rolagem (`kind: "frames"`)
Use para uma tomada que precisa ir e voltar com a rolagem sem travar (vídeo comum trava ao ser buscado fora de ordem). `prod:ingest` extrai WebP a 20 fps e 540 px de largura. Use `FootageLayer.ts` como base (alinhamento por `anchor`, máscara de borda, carregamento progressivo).

## 3. Vídeo sincronizado com a rolagem (`kind: "scrub"`)
O `prod:ingest` codifica com GOP curto (8 no desktop, 4 no mobile) para busca rápida. Prefira frames (item 2) quando o clipe tiver menos de 8 s.

## 4. Peça avulsa (`kind: "film"`, por exemplo um teaser)
Não entra no manifesto. Monte localmente com ffmpeg (exemplo em `production/ats-site/roteiro.md`).

## Novo capítulo ou novo projeto
- **Novo produto no ecossistema ATS** (só se for um produto real da ATS): adicione-o em `src/data/products.ts` e o id em `ECOSYSTEM_ORDER` (`chapters.ts`). A órbita, o painel e o marcador aparecem sozinhos.
- **Nova apresentação dedicada a um projeto:** crie `src/presentations/<slug>/chapters.ts` com o mesmo formato de `experience/chapters.ts`, um manifesto próprio e uma rota nova. Reaproveite `FootageLayer`, `lib/pinScrollMath`, `lib/scrollEasing`, as regras de `windowOpacity` e o padrão de palco de `CoreExperience`. Para o 3D, crie sistemas novos no estilo de `CoreWorld` (materiais aditivos de `world/materials.ts`, coreografia pura em um `layout.ts` com teste de continuidade).

## Requisitos de qualidade (verificar sempre)
- O H1 e os CTAs aparecem no primeiro paint, sem esperar o Three.js.
- `prefers-reduced-motion` mostra o fallback estático, sem nenhuma requisição de vídeo ou frames.
- Sem WebGL, o fallback estático assume (`detectMode`).
- Orçamento de vídeo: ≤ 32 MiB no desktop e ≤ 16 MiB no mobile somando todas as camadas (o `prod:ingest` mede).
- Sem rolagem horizontal em 390 px. O texto não fica sob o header (≈ 120 px).
- Screenshots de verificação: a cada capítulo e no meio de cada produto. Valores de rolagem múltiplos de 0,05 podem cair sempre no começo de um painel.
