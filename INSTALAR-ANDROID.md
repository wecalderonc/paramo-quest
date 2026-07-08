# Instalar Páramo Quest en Android (gratis, sin pagar nada)

Usamos **GitHub Pages**: hosting estático gratis con **HTTPS** (obligatorio para instalar PWAs en Android). No pide tarjeta de crédito.

Tu app quedará en:

`https://TU_USUARIO_GITHUB.github.io/paramo-quest/`

Reemplaza `TU_USUARIO_GITHUB` por tu usuario (ej. `wecalderonc`).

---

## Parte A — Publicar la app (solo la primera vez)

### A1. Cuenta GitHub

Si no tienes cuenta: [github.com/signup](https://github.com/signup) (gratis).

### A2. Crear el repositorio

1. Entra a [github.com/new](https://github.com/new)
2. **Repository name:** `paramo-quest` (exactamente este nombre; la URL depende de él)
3. **Public**
4. No marques “Add README”
5. Clic en **Create repository**

### A3. Subir el código desde tu Mac

Abre Terminal y ejecuta (cambia `TU_USUARIO_GITHUB`):

```bash
cd ~/code/hoja-de-vida/paramo-quest

git init
git add .
git commit -m "Páramo Quest: app de seguimiento del plan de estudios"

git branch -M main
git remote add origin https://github.com/TU_USUARIO_GITHUB/paramo-quest.git
git push -u origin main
```

Te pedirá login de GitHub (usuario + token o navegador).

### A4. Activar GitHub Pages

1. En GitHub abre el repo **paramo-quest**
2. **Settings** → menú izquierdo **Pages**
3. En **Build and deployment** → **Source:** elige **GitHub Actions**
4. Listo. No hace falta más configuración.

### A5. Esperar el deploy

1. Pestaña **Actions** del repo
2. Debe aparecer **Deploy to GitHub Pages** en verde (~2 minutos)
3. Abre en el navegador del Mac:

   `https://TU_USUARIO_GITHUB.github.io/paramo-quest/`

4. Debe cargar la app (tema oscuro, pestaña Hoy)

Si falla el Action, entra al job rojo y lee el error (casi siempre es que falta activar Pages en A4).

---

## Parte B — Instalar en tu Android

### B1. Abrir en Chrome

1. Celular conectado a internet (WiFi o datos)
2. Abre **Google Chrome** (tiene que ser Chrome)
3. URL exacta:

   `https://TU_USUARIO_GITHUB.github.io/paramo-quest/`

4. Espera a que cargue por completo

### B2. Instalar como app

1. Menú **⋮** (tres puntos, arriba a la derecha)
2. Toca **“Instalar app”** o **“Añadir a la pantalla de inicio”**
3. Nombre: **Páramo Quest** → **Instalar** / **Añadir**

Aparece un ícono en el launcher, como una app normal.

### B3. Comprobar que quedó bien

- Abre desde el ícono (no desde una pestaña del navegador)
- Debe verse a pantalla completa, sin barra de URL
- Ve a **Ajustes** → prueba **Exportar JSON** (confirma que IndexedDB funciona)
- Opcional: activa **Día 1 del plan (13 jul)** en Modo prueba para ver tareas

### B4. Si no sale “Instalar app”

- Confirma que la URL empieza con **https://**
- Usa **Chrome**, no Firefox ni Samsung Internet
- Navega un poco (Hoy → Semana → Progreso) y vuelve al menú ⋮
- Alternativa: ⋮ → **Compartir** → **Añadir a la pantalla de inicio**

---

## Parte C — Actualizar la app cuando cambies código

Cada vez que edites el proyecto en Cursor y quieras que el celular tenga la versión nueva:

### C1. En tu Mac (Terminal)

```bash
cd ~/code/hoja-de-vida/paramo-quest

# Opcional: probar que compila
npm run build

git add .
git commit -m "Describe el cambio que hiciste"
git push
```

### C2. Esperar deploy automático

1. GitHub → repo **paramo-quest** → **Actions**
2. Espera el check verde **Deploy to GitHub Pages** (~1–2 min)

### C3. En el Android

La app usa **autoUpdate** (service worker):

1. **Cierra** Páramo Quest por completo (quítala de recientes)
2. **Ábrela de nuevo** desde el ícono
3. Si no ves el cambio, cierra otra vez y abre; a lo sumo 2 veces

**Tus datos no se borran** al actualizar (checks, racha, bitácora viven en el teléfono). Solo cambia el código de la app.

### C4. Si cambiaste el plan de estudios (`plan-carrera-geoespacial.md`)

Además del push, regenera el JSON antes del commit:

```bash
npm run parse-plan
git add src/data/plan.json
git commit -m "Actualizar plan de estudios"
git push
```

---

## Resumen rápido

| Quiero… | Qué hacer |
|--------|-----------|
| Instalar la primera vez | Parte A + Parte B |
| Publicar un cambio de código | `git add .` → `commit` → `push` → reabrir app en el celular |
| Respaldo de mi progreso | En la app: Ajustes → Exportar JSON |
| Probar sin esperar al 13 jul | Ajustes → Día 1 del plan (13 jul) |

---

## Costo

**$0.** GitHub Pages es gratis para repos públicos. No necesitas Vercel, dominio propio ni tarjeta.

---

## Notas del páramo

- En el celular la app funciona **offline** después de la primera visita (PWA + service worker).
- El progreso **no se sincroniza** entre Mac y Android; exporta JSON si cambias de teléfono.
- Si renombras el repo, cambia también `base` en `vite.config.ts` (línea `/paramo-quest/`).
