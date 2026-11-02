# Jacob's birthday cinematic

A full-screen, real-time Three.js family birthday film with animated characters, gift and cake presentation, candles, name signs and instrumental birthday music.

## Preview locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:4173 and select **Step inside**. Music starts after this gesture; use the music button to mute it. The timeline and Scenes menu let you inspect individual moments.

## Check

```sh
node --check dist/app.js
node test-timeline.mjs
node test-framing.mjs
```

## Publish

GitHub Actions verifies the timeline and responsive camera framing, then deploys `dist/` to GitHub Pages on every push to `main`. Reference photos and local preview screenshots are not part of this repository.

Three.js r180 is bundled in `dist/vendor/` under its MIT license. Google Fonts is optional; the page includes system-font fallbacks.
