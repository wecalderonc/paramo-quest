# Páramo Quest 🌄

PWA local-first y gamificada para seguir el plan de carrera geoespacial/NbS de ~10 meses (43 semanas, ~400 tareas diarias). Los datos viven solo en tu dispositivo (IndexedDB); no hay backend, login ni tracking.

## Funcionalidades

- **Hoy**: tareas del **día activo del plan** (cursor). Al completar todas las tareas, pregunta si quieres **continuar con el día siguiente el mismo día real** para acortar el plan. Checks con XP, bitácora, racha con escudos.
- **Semana**: navegación S01–S43, progreso semanal, mover tareas de fecha, y botón "Se me corrió el plan" que desplaza todas las tareas pendientes N días hábiles (salta findes y festivos).
- **Progreso**: heatmap de actividad tipo GitHub, % global, mejor racha, posts publicados y línea de tiempo de las 8 fases con sus entregables.
- **Gamificación**: XP por tarea (estudio 10, proyecto 15, post 30, revisión 20, bitácora 5), bonus por semana (+50) y fase (+200) completas, 8 niveles temáticos, racha que solo cuenta días hábiles, 2 escudos/mes automáticos y decaimiento suave (−20%) en vez de reset.
- **Ajustes**: export/import JSON (respaldo) y reset.

## Desarrollo

```bash
npm install
npm run dev        # servidor local
npm run test       # tests de dominio (racha, XP, scheduler)
npm run build      # build de producción + PWA
npm run parse-plan # regenerar src/data/plan.json desde ../plan-carrera-geoespacial.md
```

## Arquitectura

- `src/data/plan.json` — contenido del plan (generado por `scripts/parse_plan.py`).
- `src/domain/` — lógica pura y testeada: `streak.ts`, `xp.ts`, `scheduler.ts`.
- `src/db/` — Dexie (IndexedDB): estado del usuario separado del contenido; log de actividad inmutable como fuente de verdad.
- `src/views/` — Hoy, Semana, Progreso, Ajustes.

Stack: React 19 + Vite + TypeScript, Tailwind CSS v4, Dexie.js, vite-plugin-pwa.

## Instalar en Android

1. Despliega `dist/` en cualquier hosting estático con HTTPS (Vercel, Netlify, GitHub Pages).
2. Abre la URL en Chrome (Android) → menú ⋮ → **Instalar app**.
3. Funciona offline; los datos quedan en el dispositivo. Exporta un respaldo JSON de vez en cuando desde Ajustes.
