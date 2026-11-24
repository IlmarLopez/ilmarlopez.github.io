# Tasks 001 — ilmarlopez.com v2

Estado: **aprobado por Ilmar el 2026-11-24 (Fase 2).** Fase 3 en curso desde T-01. **Actualizado el 2026-11-24 tras aprobar el prototipo `design/hallmark/f/`:** T-79 a T-83 son nuevas y viven en el hito que indica su título; T-25, T-27, T-52, T-53, T-55 y T-58 cambiaron de contenido sin cambiar de número.
Spec: [`spec.md`](./spec.md) · Plan: [`plan.md`](./plan.md)

**Cómo se usa**

- Cada tarea cabe en ≤ 1 h. Si una se pasa, se divide antes de seguir.
- Una tarea es un commit pequeño (Conventional Commits). La casilla se marca `[x]` en ese mismo commit.
- Responsable: **[A]** agente · **[I]** Ilmar · **[A+I]** los dos.
- «Verifica» es lo que debe cumplirse para marcar la tarea. «Depende» solo lista lo que no es obvio por el orden.
- Las tareas de movimiento (M6) no empiezan hasta que las secciones (M3 a M5) se vean bien estáticas.
- **Después de cada sección** (M3): capturas con Playwright a 375 y 1440 px en claro y oscuro, Lighthouse local y `sloplint --render`. Si se rompe el presupuesto, se arregla antes de seguir.

---

## M0 · Preparación y cimientos (PR `feat/foundation` → `v2`)

- [x] **T-01 · Higiene del repo** · 30 min · [A] · RNF-11, RV-08
  Añadir al `.gitignore` `.playwright-mcp/` y `.tmp/`; crear `.env.example` con `NUXT_PUBLIC_WEB3FORMS_KEY=` vacía; crear `.nvmrc` con `22` y `engines.node` en `package.json` igual al de Nuxt 4.7.
  Verifica: `git status` ya no lista `.playwright-mcp/`; `.env.example` no contiene valores; `cat .nvmrc` devuelve `22`.

- [x] **T-02 · Actualizar Node local** · 15 min · [I] · RNF-11
  Subir Node local a ≥ 22.22.3 (hoy 20.16.0, que no cumple los `engines` de Nuxt 4.7).
  Verifica: `node -v` ≥ 22.22.3 y `npm install` sin avisos de `engines`.

- [x] **T-03 · Commit de spec y referencia de diseño** · 20 min · [A] · RV-07, AC-23
  Crear la rama `feat/foundation` desde `v2`; commitear `specs/`, `design.md` y `design/`. **El CV** (`public/files/Ilmar-Lopez-CV.pdf` y el borrado de `public/files/cv-en.pdf`) **va en un segundo commit**, aparte del principal, junto con el redirect de `netlify.toml` (Q10a, confirmado por Ilmar el 2026-11-24).
  Verifica: el commit principal no incluye el PDF; el segundo commit borra `cv-en.pdf` y añade `Ilmar-Lopez-CV.pdf` (contenido distinto, por eso Git no lo marca como renombrado) y trae el redirect; el árbol queda sin archivos del diseño sin trackear.
  Depende de: T-01.

- [x] **T-04 · Dependencias** · 40 min · [A] · RNF-11, spec §8.1
  Instalar `tailwindcss`, `@tailwindcss/vite`, `@nuxt/fonts` y `@nuxt/image`; en desarrollo `typescript` (`~5.9.3`: la 7.x ya no trae `lib/typescript.js` y `vue-tsc` no la soporta, comprobado), `vue-tsc`, `playwright` y `@axe-core/playwright`; `npx playwright install chromium`. **No se instalan `gsap` ni `lenis`** (Q11 y Q5, decididos por Ilmar el 2026-11-24). No se instalan `motion-v`, `@nuxtjs/seo` ni `@nuxt/content`.
  Verifica: `npm ls --depth=0` sin errores ni *peer* sin resolver; `npm run postinstall` pasa; las versiones quedan en el lockfile.
  Depende de: T-02.

- [x] **T-05 · `nuxt.config.ts` y TypeScript estricto** · 45 min · [A] · RNF-12, AC-01
  Configuración de spec §8.2 (`ssr: true`, módulos, `css`, `components` sin prefijo de ruta, plugin de Vite de Tailwind, `experimental.viewTransition` y `prerenderErrorPages`, prerender con `crawlLinks` y rutas, `runtimeConfig.public.web3formsKey`). Scripts `typecheck`, `generate` y `preview`. Consultar Context7 antes de fijar cada opción.
  Verifica: `npm run typecheck` y `npm run generate` terminan sin errores; existen `dist/index.html` y `dist/404.html`.
  Depende de: T-04.

- [x] **T-06 · Tokens** · 60 min · [A] · RF-12, AC-06
  Crear `app/assets/css/tokens.css` con `@theme static` (roles `--color-*` incluido `--color-error-text`, `--font-*`, escala de texto, radios, easings, puntos de corte) y `:root` plano (`--space-*`, `--dur-*` más `--dur-stack`, contenedor, gutter, z-index), con `light-dark()` y `color-scheme` según spec §4.5. Sin `--spacing-*`, sin `--scene-soft-side`, `--color-error` ni `--color-success`.
  Verifica: en Playwright los colores calculados coinciden con la tabla de spec §4.1 en claro y en oscuro; con el sistema en oscuro y sin `data-theme`, `--scene-soft-top` es el oscuro (defecto B1); `--color-error-text` oscuro es oklch(76% 0.15 27); `--color-red-500` ya no existe.
  Depende de: T-05.

- [ ] **T-07 · `base.css` y `main.css` con el sello de Hallmark** · 45 min · [A] · Floor 15, B4
  Portar `base.css` de la referencia en `@layer base`; renombrar `.container` a `.site-container`. `main.css` empieza por el sello de Hallmark y la línea de crítica, y después `@import "tailwindcss"` y los dos CSS.
  Verifica: la primera línea no vacía de `main.css` es el sello; `node .agents/skills/hallmark/scripts/sloplint.mjs app/assets/css/main.css` sin FAIL; `rg "\.container" app` no devuelve nada.
  Depende de: T-06.

- [ ] **T-08 · Fuentes autoalojadas** · 30 min · [A] · RNF-09, RNF-02, B5
  `@nuxt/fonts` con Rethink Sans (600 y 700) y Hanken Grotesk variable (400 a 600), `font-display: swap` y precarga solo de la fuente del hero.
  Verifica: en Playwright no hay peticiones a `fonts.googleapis.com` ni `fonts.gstatic.com`; los `@font-face` salen de `/_fonts/`; el peso 500 se resuelve sin sintetizar.
  Depende de: T-07.

- [ ] **T-09 · App shell y `<head>`** · 60 min · [A] · RF-12, AC-06
  `app.vue`, `layouts/default.vue`, `<html lang="en">`, script inline en `<head>` que aplica `data-theme` y la clase `js` antes del primer render, `color-scheme` y `theme-color` por esquema, `<link rel="icon" href="/favicon.ico">` (asset protegido), `<NuxtRouteAnnouncer />` y `<main id="main">`.
  Verifica: en `view-source` el script aparece antes del CSS; no hay avisos de hidratación en consola; en `DOMContentLoaded` ya existe `data-theme` guardado (sin parpadeo).
  Depende de: T-08.

- [ ] **T-10 · Capa de datos tipada** · 60 min · [A] · RF-05, RF-06, RF-07, RF-08, RF-09, RF-11, RV-05, AC-24
  `app/data/*.ts` y sus tipos: `profile`, `experience` (tipo `Role` de RF-06), `projects`, `tools`, `socials`, `cv` (`/files/Ilmar-Lopez-CV.pdf`) y un `versions` con `TODO(ilmar)` en las fechas. Contenido exacto de `design/hallmark/f/`; solo los 4 repos públicos ya verificados; 4 redes más el email; solo Stori lleva `url`.
  Verifica: `npm run typecheck` pasa; `rg -i "whatsapp|facebook|twitch|countly|axios" app` no devuelve nada; las URL de los 4 proyectos coinciden con las verificadas en la spec; `experience.ts` tiene un solo `url` (`https://www.storicard.com/`).
  Depende de: T-05.

- [ ] **T-11 · Arnés de verificación** · 60 min · [A] · AC-01, AC-02, AC-03, AC-04, AC-05, AC-15
  `scripts/verify/` con Playwright y axe: servir `dist`, helpers de viewports (360, 768, 1280, 1920), JS apagado, reduced-motion y tema; scripts npm `verify:*`.
  Verifica: corre contra la home vacía y falla con un mensaje legible cuando se fuerza una aserción incorrecta.
  Depende de: T-05.

- [ ] **T-12 · Evidencia y línea base de JS** · 30 min · [A] · RNF-03, AC-13
  Crear `specs/001-portafolio-v2/evidence/summary.md` con la plantilla de resultados (los JSON crudos van a `.tmp/`) y medir los KB gzip de JS de la app vacía en `/`.
  Verifica: `summary.md` registra la línea base con la fecha y el comando usado.
  Depende de: T-11.

- [ ] **T-13 · Sitio de Netlify para v2** · 60 min · [A+I] · RV-03, RV-08, RNF-12
  Empezar con lectura (MCP de Netlify) para ver qué sitios existen. Enlazar el repo, comprobar que usa `netlify.toml` (`npm run generate`, `dist`), activar *branch deploy* para `v2` y poner `NUXT_PUBLIC_WEB3FORMS_KEY` en *production*, *deploy-preview* y *branch-deploy* (el valor lo pone Ilmar).
  Verifica: el PR de `feat/foundation` genera un Deploy Preview que construye con `npm run generate` y publica `dist` (confirma que se generan previews para PRs hacia `v2`, riesgo de spec §10.4).
  Depende de: T-05.

- [ ] **T-14 · PR `feat/foundation` → `v2`** · 30 min · [A] · AC-23
  Pre-merge: `typecheck`, `sloplint` del CSS, descripción con checklist. **Ilmar hace el merge.**
  Verifica: Deploy Preview verde y revisado.
  Depende de: T-03, T-09, T-10, T-12, T-13.

---

## M1 · v1 en Netlify (paralelo desde M0; no bloquea M3)

- [ ] **T-15 · Sitio de Netlify para v1** · 60 min · [A+I] · RV-01, AC-22
  Segundo sitio, rama de producción `release/v1`, `npm run generate` (o el comando de yarn que corresponda al `yarn.lock`), publicación `dist`, `NODE_VERSION` probada (empezar en 20 y bajar a 18 si falla). No se toca la rama.
  Verifica: build verde; la URL `*.netlify.app` muestra v1; `git rev-parse origin/release/v1` sigue en `1c0814b`.

- [ ] **T-16 · Dominio `v1.ilmarlopez.com`** · 45 min · [A+I] · RV-01, AC-22
  Antes: guardar una instantánea con `dig` de los registros A, CNAME, MX y TXT. Después: añadir solo el dominio `v1` al sitio de v1 (Netlify DNS).
  Verifica: `dig v1.ilmarlopez.com` resuelve a Netlify; HTTPS válido; `dig MX` y `dig TXT` de `ilmarlopez.com` idénticos a la instantánea.
  Depende de: T-15.

- [ ] **T-17 · Aviso de «versión archivada» en v1** · 30 min · [A+I] · RV-02
  Comprobar si el plan de Netlify ofrece inyección de snippet; si sí, banner «archived version, go to current». Si no, registrar «sin aviso» (Q8).
  Verifica: v1 muestra el aviso o la decisión queda anotada en `evidence/summary.md`.
  Depende de: T-16.

---

## M2 · Pasada de Hallmark (Q3): checkpoints de diseño

Alcance de componente bajo el `design.md` bloqueado. Cada tarea es una propuesta de ≤ 1 h; la aprobación de Ilmar es la condición de cierre y no cuenta como tiempo.

- [ ] **T-18 · About con foto y pista ⌘K del footer** · 60 min · [A+I] · RF-05, RF-14, Q1, Q6
  HTML/CSS de referencia en `design/hallmark/e/about/` con `me.jpg` en About y la pista de ⌘K solo con puntero fino.
  Verifica: `sloplint` con 0 FAIL, 0 REFLEX y 0 WARN; capturas a 375 y 1440 px en claro y oscuro; **aprobación de Ilmar**.
  Depende de: T-14.

- [ ] **T-19 · `/versions` y 404** · 60 min · [A+I] · RF-15, RF-16
  Referencia en `design/hallmark/e/versions/` y `e/404/`.
  Verifica: igual que T-18.
  Depende de: T-18.

- [ ] **T-20 · Paleta ⌘K, skip link y menú de CV** · 60 min · [A+I] · RF-13, RF-11, RF-02
  Referencia en `design/hallmark/e/ui/`: paleta, skip link y menú de CV con 2 idiomas. Los estados del diálogo «Say hi» ya están diseñados en `design/hallmark/f/`.
  Verifica: igual que T-18.
  Depende de: T-19.

- [ ] **T-21 · Tokens faltantes en `design.md` y contraste** · 30 min · [A+I] · B3, B6, AC-15
  Añadir a la tabla de `design.md` `--color-accent-ink`, `--color-field-ink` y `--color-field-muted` (B3) y volcar las adiciones aprobadas de T-18 a T-20. Comprobar con un script que `--color-error-text` y `--color-muted` cumplen ≥ 4.5:1 sobre `paper` en claro y oscuro (B6).
  Verifica: contraste calculado ≥ 4.5:1; el diff de `design.md` lo revisa y aprueba Ilmar.
  Depende de: T-18, T-19, T-20.

---

## M3 · Secciones estáticas, sin movimiento (PR `feat/sections` → `v2`)

- [ ] **T-22 · SiteNav y ThemeSwitch** · 60 min · [A] · RF-02, RF-12, M-07, AC-06
  Nav sticky; en ≤ 60 rem solo wordmark e interruptor; etiqueta del interruptor resuelta con CSS; persistencia en `localStorage`; el cambio de tema usa View Transitions (crossfade de 220 ms, M-07) con respaldo instantáneo.
  Verifica: Playwright: sticky; sin enlaces en 768 px y menos; el tema alterna, persiste al recargar y no parpadea; con reduced-motion el cambio es instantáneo; capturas a 375 y 1440 px, claro y oscuro, contra `f/`.
  Depende de: T-14.

- [ ] **T-23 · SkipLink** · 20 min · [A] · RF-02, AC-04
  Según el diseño aprobado en T-20.
  Verifica: es el primer destino de Tab, solo se ve con foco y tiene el anillo de foco.
  Depende de: T-20, T-22.

- [ ] **T-24 · HeroCopy y CvLink** · 60 min · [A] · RF-03, RF-11, RNF-07, AC-02, AC-03
  `h1` en dos líneas con máscara (`.ln > span`), frase y acciones (copy exacto de `f/`). «Say hi» como `mailto:`; «View CV» desde `cv.ts`, con una entrada es un enlace a pestaña nueva y sin `download`.
  Verifica: a 1280×800 titular, frase y acción primaria quedan dentro del viewport; con JS apagado «Say hi» abre el cliente de correo; el enlace del CV apunta a `/files/Ilmar-Lopez-CV.pdf` con `target="_blank"` y `rel="noopener"`.
  Depende de: T-22.

- [ ] **T-25 · JourneyFlight y DepthRuler estáticos** · 60 min · [A] · RF-04, AC-17
  `JourneyFlight` agrupa `HeroCopy`, el `h2` «Experience» (visible en estático, solo para lectores en vuelo), los 4 `RoleCard` y la `DepthRuler` (`aria-hidden`). El CSS del vuelo (recorrido de 480 svh, visor *sticky*, perspectiva, planos, regla de profundidad) se escribe detrás de la clase `flight`, que todavía nadie añade. En estático, el hero y los roles son una lista legible.
  Verifica: sin la clase, la lista se lee a 375 y 1440 px; con la clase puesta a mano en Playwright, el hero y los planos se colocan como en `f/`; la diferencia contra `f/` queda bajo el umbral provisional del 2 % por sección, claro y oscuro.
  Depende de: T-24, T-27.

- [ ] **T-26 · About con foto** · 45 min · [A] · RF-05, RNF-04, AC-14
  Según el diseño aprobado en T-18, con `<NuxtImg>` (AVIF/WebP, `width` y `height`, `lazy`) y `alt` descriptivo.
  Verifica: en la red se pide una variante AVIF o WebP redimensionada, nunca el `me.jpg` de 5.3 MB; CLS 0.
  Depende de: T-18, T-25.

- [ ] **T-27 · RoleCard y datos de Experience** · 45 min · [A] · RF-06
  `RoleCard` desde `experience.ts`: monograma, nombre (con enlace solo en el rol activo), rol, estado, resumen y lectura estática con periodo y duración en texto. UTT sin lectura.
  Verifica: 4 tarjetas con los textos de `f/`; solo el título de Stori es un enlace (`https://www.storicard.com/`, `target="_blank"`, `rel="noopener"`); una columna en ≤ 60 rem; capturas contra `f/`.
  Depende de: T-22.

- [ ] **T-79 · RoleTimeline y cifras** · 60 min · [A] · RF-06, AC-27
  `RoleTimeline` (contenedor `aria-hidden` con `data-from`, `data-to` y `data-label`) y la parte 1 de `journey.client.ts`: con JS construye en cada tarjeta la gráfica de tiempo (una fila por rol, escala común de enero de 2017 a hoy, una línea por enero, años cada 2 o cada 3 en teléfono, línea de hoy) y calcula la duración contando el primer y el último mes, que reemplaza al texto estático.
  Verifica: con la fecha fijada en la prueba, 5 años 2 meses, 4 años 2 meses y 4 meses; la gráfica muestra 3 filas con el rol de la tarjeta en tinta; sin JS no hay gráfica y el texto estático se lee; sin desbordes a 360 px.
  Depende de: T-27.

- [ ] **T-28 · Tools** · 30 min · [A] · RF-08
  `ToolsSection` desde `tools.ts` y la línea de idiomas.
  Verifica: 4, 2 y 1 columnas a 1440, 768 y 375 px.
  Depende de: T-22.

- [ ] **T-29 · Work sin JS** · 60 min · [A] · RF-07, RNF-07, B2, B7, AC-02
  SSR de los 4 proyectos como lista legible, con la pila decorativa en estado abierto. Corrige B7: cada etiqueta de capa anclada a su vértice derecho.
  Verifica: con JS apagado se leen los 4 proyectos (título, texto y enlace) y no hay texto encimado (captura). En cada proyecto, el centro de cada etiqueta coincide en vertical con el vértice derecho de su capa (medido con `getBoundingClientRect`, tolerancia 1 px) y ninguna etiqueta se sale de su columna a 1440, 1280, 1024, 768 y 375 px.
  Depende de: T-27.

- [ ] **T-30 · Work con tabs** · 60 min · [A] · RF-07, AC-04, AC-13
  Tabs ARIA (flechas, Home, End, `tabindex` itinerante), cambio de panel instantáneo, `hydrate-on-visible`. Sin animación todavía (M-09 llega en T-54).
  Verifica: Playwright con teclado cambia `aria-selected` y `tabindex`; el JS del inspector no se pide antes de ver la sección.
  Depende de: T-29.

- [ ] **T-81 · Dimensionado de la pila de Work** · 45 min · [A] · RF-07, B9, AC-28
  Portar de `f/` el dimensionado con unidades de contenedor: `container-type: inline-size` en el escenario, `--pu` con `clamp` según `100cqw`, `--lead` y `--tag`, el desplazamiento (`min(0, …)` en escritorio, centrado en una columna), etiquetas de 14 px y guía más corta en ≤ 60 rem, y el respaldo `@supports`. `--tag` se mide con la etiqueta más larga de `projects.ts`.
  Verifica: AC-28 con `verify:stack`: 12 anchos (320, 344, 390, 414, 600, 768, 961, 1000, 1100, 1280, 1440, 1920) y los 4 proyectos, con margen ≥ 0 px entre la etiqueta más larga y el diamante, y el escenario y el viewport; a 1440 y 1920 px el resultado es idéntico al de `f/`.
  Depende de: T-29.

- [ ] **T-31 · Contact y redes** · 30 min · [A] · RF-09, RF-11, AC-24
  `ContactSection` con el texto, el `mailto:`, el botón «Say hi» y la lista de enlaces que empieza con «CV» y «PDF, 1 page», seguida de las 4 redes.
  Verifica: URL exactas de GitHub, LinkedIn (`www.linkedin.com/in/ilmarlopez`), DEV y CodePen; sin WhatsApp, Facebook ni Twitch; el enlace del CV apunta a `/files/Ilmar-Lopez-CV.pdf` con `target="_blank"`, y «1 page» coincide con el PDF.
  Depende de: T-22.

- [ ] **T-32 · Footer** · 30 min · [A] · RF-14, Q6
  Campo grafito, wordmark, «All versions», «Version 1, archived», «Version 2, 2026» y la pista de ⌘K aprobada en T-18.
  Verifica: enlaces correctos; la pista solo aparece con `(hover: hover) and (pointer: fine)`.
  Depende de: T-18, T-22.

- [ ] **T-33 · Ensamblado de la home e hidratación** · 60 min · [A] · RF-01, RNF-03, AC-01, AC-13
  `pages/index.vue` con la estrategia de spec §8.4 (`Lazy*` con `hydrate-never` y `hydrate-on-visible`; `JourneyFlight` y sus tarjetas son `hydrate-never`).
  Verifica: `dist/index.html` contiene el contenido completo; se registra el JS inicial en gzip. **Puerta:** si supera 120 KB gzip se corrige antes de seguir con M4.
  Depende de: T-24 a T-32.

- [ ] **T-34 · Barrido de la home** · 60 min · [A] · AC-03, AC-17, RNF-01
  Capturas de toda la home a 375 y 1440 px, claro y oscuro; Lighthouse local contra `npm run preview`; `sloplint --render --url http://localhost:3000/`.
  Verifica: 0 FAIL; Lighthouse local sin caer bajo el presupuesto (los problemas se corrigen aquí).
  Depende de: T-33.

- [ ] **T-35 · PR `feat/sections` → `v2`** · 30 min · [A] · AC-17
  Pre-merge: `/hallmark audit app/`, `typecheck`, Deploy Preview revisado. **Ilmar hace el merge.**
  Verifica: preview verde y auditoría sin FAIL.
  Depende de: T-34.

---

## M4 · Interacciones (PR `feat/interactions` → `v2`)

- [ ] **T-36 · Acciones delegadas y montaje diferido del diálogo** · 45 min · [A] · RF-10, AC-13
  `actions.client.ts` (listener con `data-action`), `useHiDialog` y `HiDialog` que se monta al primer pedido, con precarga en `pointerenter`.
  Verifica: el chunk del diálogo no se pide hasta el primer hover o clic; «Say hi» del hero y el de Contact abren el mismo diálogo.
  Depende de: T-35.

- [ ] **T-37 · `HiDialog`: UI, foco y validación** · 60 min · [A] · RF-10, AC-04
  `<dialog>` nativo con los estados de `design/hallmark/f/` (reposo, enviando, éxito y error), trampa de foco, Esc, retorno de foco y `aria-invalid` con `aria-describedby`. Sin botón Cancelar; el texto de error usa `--color-error-text`.
  Verifica: Playwright con teclado: foco atrapado, Esc cierra, el foco vuelve al disparador; los campos inválidos se anuncian; no hay botón Cancelar.
  Depende de: T-36.

- [ ] **T-82 · HiDialog en teléfono: hoja sobre el teclado** · 45 min · [A] · RF-10, AC-04
  En ≤ 40 rem el diálogo es una hoja desde el borde inferior que sube con el teclado (`--kb` y `--vvh` de `visualViewport`), con acciones *sticky*; mientras está abierto la página no se desplaza (`html:has(dialog[open])`).
  Verifica: Playwright móvil: con el diálogo abierto la página no se desplaza y las acciones quedan visibles; con `visualViewport` simulado a la mitad de la altura, el botón Enviar sigue visible. La prueba con teclado real va en T-71.
  Depende de: T-37.

- [ ] **T-38 · Integración con Web3Forms** · 60 min · [A] · RF-10, AC-07, RV-08
  Revisar la documentación vigente (campos `subject` y `botcheck`). `POST` JSON con `runtimeConfig.public.web3formsKey`, honeypot, estados enviando, éxito y error. Sin clave: botón deshabilitado y `mailto:`.
  Verifica: Playwright con la ruta simulada (ningún correo real): cuerpo correcto, éxito, error que conserva los datos, honeypot y caso sin clave.
  Depende de: T-37.

- [ ] **T-39 · Menú de CV con varios idiomas** · 30 min · [A] · RF-11, AC-08
  Si `cv.ts` tiene 2 o más entradas, `CvLink` abre el menú de T-20.
  Verifica: con una entrada `es` añadida temporalmente el menú aparece sin tocar el componente; `/files/Ilmar-Lopez-CV.pdf` responde 200 con `application/pdf`.
  Depende de: T-20, T-24.

- [ ] **T-40 · Paleta de comandos** · 60 min · [A] · RF-13, AC-09
  `commands.ts` y `CommandPalette` (ARIA combobox y listbox, filtro local, grupos de spec RF-13).
  Verifica: Playwright: filtra, flechas, Enter y Esc; cada comando ejecuta su acción.
  Depende de: T-20, T-36.

- [ ] **T-41 · Atajo ⌘K / Ctrl+K con carga diferida** · 30 min · [A] · RF-13, AC-04, AC-13
  Plugin del atajo que importa la paleta en el primer uso.
  Verifica: el chunk de la paleta no se pide hasta el atajo; el foco vuelve al cerrar.
  Depende de: T-40.

- [ ] **T-42 · PR `feat/interactions` → `v2`** · 30 min · [A] · AC-04
  Pre-merge: `/hallmark audit app/`, `typecheck`, suite de teclado, Deploy Preview revisado. **Ilmar hace el merge.**
  Verifica: preview verde.
  Depende de: T-38, T-39, T-41.

---

## M5 · Páginas, SEO y operaciones (PR `feat/pages-seo` → `v2`)

- [ ] **T-43 · `/versions`** · 60 min · [A] · RF-15, AC-11, AC-01
  Página y `VersionEntry` según el diseño de T-19, con v2 (current) y v1 (archived) desde `versions.ts`.
  Verifica: orden inverso, un solo `h1`, el enlace de v1 apunta a `https://v1.ilmarlopez.com`, `dist/versions/index.html` tiene contenido.
  Depende de: T-19, T-42.

- [ ] **T-44 · Página 404** · 45 min · [A] · RF-16, AC-10, AC-01
  `error.vue` según T-19, `prerenderErrorPages` y `noindex`.
  Verifica: `dist/404.html` contiene el texto de la página; en la preview `curl -I` a una URL inexistente devuelve 404.
  Depende de: T-19.

- [ ] **T-45 · Metadatos por ruta y JSON-LD** · 60 min · [A] · RF-18, RNF-06, AC-16
  `useSeoMeta`/`useHead` con `title`, `description`, canonical, Open Graph y Twitter; `utils/seo.ts` para el JSON-LD `Person` (`worksFor` con solo `name`).
  Verifica: el HTML de cada ruta trae las etiquetas; el JSON-LD se parsea y contiene `jobTitle` y `worksFor.name`.
  Depende de: T-43, T-44.

- [ ] **T-46 · Imagen OG, sitemap y robots** · 45 min · [A] · RF-18, RNF-06, AC-16
  `public/og.png` (1200×630, captura del hero con Playwright en claro), `public/sitemap.xml` con 2 URLs y `robots.txt` con la línea `Sitemap`.
  Verifica: la imagen mide 1200×630; `og:image`, `sitemap.xml` y `robots.txt` responden 200 en la preview.
  Depende de: T-45.

- [ ] **T-47 · Cabeceras y redirección del CV** · 30 min · [A] · RNF-10, RF-11, AC-25, AC-08
  `public/_headers`: caché inmutable en `/_nuxt/*`, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy`. En `netlify.toml`, el 301 de `/files/cv-en.pdf` a `/files/Ilmar-Lopez-CV.pdf` (ya añadido en el segundo commit de T-03; aquí solo se verifica en la preview).
  Verifica: `curl -I` en la preview muestra las cabeceras; `/files/cv-en.pdf` devuelve 301 con `location` al archivo nuevo, que devuelve 200 `application/pdf`; la clave de Web3Forms no aparece en el repo.
  Depende de: T-42.

- [ ] **T-48 · Captura de v1 para `/versions`** · 30 min · [A] · RV-05, AC-11
  Captura con Playwright de v1 (1440×900, claro) en `public/img/versions/v1.png`, servida con `<NuxtImg>`; las dimensiones se registran en `versions.ts`. La captura de v2 va en T-75.
  Verifica: dimensiones y `alt` presentes; la imagen sale en AVIF o WebP.
  Depende de: T-43.

- [ ] **T-49 · PR `feat/pages-seo` → `v2`** · 30 min · [A] · AC-01
  Pre-merge: `/hallmark audit app/`, `typecheck`, Deploy Preview revisado. **Ilmar hace el merge.**
  Verifica: preview verde y las tres rutas con contenido real.
  Depende de: T-46, T-47, T-48.

---

## M6 · Motion (PR `feat/motion` → `v2`)

Se decide con `emil-design-eng` y se implementa con CSS y el script de DOM plano según spec §5 (GSAP solo si el port de la pila no cumple, Q4; sin Lenis, Q5). Nada se anima sin pasar por la tabla.

- [ ] **T-50 · Confirmar la tabla de motion** · 45 min · [A] · spec §5, AC-18
  Revisar M-01 a M-19 con `emil-design-eng`; cualquier cambio se propone a Ilmar, no se aplica solo.
  Verifica: nota «sin cambios» o diff propuesto en `evidence/summary.md`.
  Depende de: T-49.

- [ ] **T-51 · M-01 asentamiento del hero** · 45 min · [A] · M-01, AC-05, AC-12
  CSS puro, solo en la primera carga del documento: líneas del `h1` (0 y 70 ms), frase (140 ms) y acciones (200 ms). A/B de LCP con y sin la animación.
  Verifica: Lighthouse ×5 con y sin; si cuesta más de 100 ms, el `h1` aparece sin la máscara y solo animan la frase y las acciones; con reduced-motion no hay animación.
  Depende de: T-50.

- [ ] **T-52 · M-02 vuelo de la cámara** · 60 min · [A] · M-02, RF-04, AC-05, AC-26
  Parte 2 de `journey.client.ts`: la clase `flight` solo sin reduced-motion; rAF con amortiguamiento exponencial (≈ 90 ms) y parada por plano; `--x --y --z --o --po` en cada plano; `data-reached`, `data-passed` y `data-on`/`data-past` de la regla; el desplazamiento de las tarjetas de fondo en teléfono calculado a partir de la perspectiva; puntero y foco solo en el plano frontal; y el enlace «Experience» que lleva al primer rol.
  Verifica: AC-26 con `verify:flight`: en p = 0, 0.25, 0.5, 0.75 y 1 exactamente un plano con puntero y `tabIndex` 0, la regla marca el rol correcto, y el rAF se detiene al llegar (sin trabajo en reposo); con reduced-motion no existe `flight`; a 375×812, 360×800 y 390×844 la tarjeta de fondo no solapa el texto del hero.
  Depende de: T-50, T-25, T-79.

- [ ] **T-53 · M-03 llegada de los planos** · 45 min · [A] · M-03, AC-05
  `@property --zi` y `--pi` con `@keyframes arrive` (700 ms, 200 ms + 80 ms por plano) y la entrada tardía de la regla de profundidad.
  Verifica: con el vuelo, `getAnimations()` muestra la llegada una sola vez al cargar y ninguna con reduced-motion.
  Depende de: T-52.

- [ ] **T-54 · M-04, M-05, M-06, M-08, M-09 y M-17 microinteracciones** · 60 min · [A] · M-04, M-05, M-06, M-08, M-09, M-17, AC-18
  Subrayado, color de botones, pulsación, interruptor y color de tabs; el cambio de panel de Work (salida de 120 ms, entrada de 220 ms y texto que sube línea a línea); y el indicador de la nav (translate y `scaleX`, sin deslizarse en su primera colocación). Con tokens y reduced-motion.
  Verifica: `rg "transition: *all" app` vacío; las duraciones calculadas coinciden con los tokens; el panel saliente no se solapa con el entrante (captura intermedia); el indicador se desliza entre secciones; con reduced-motion los cambios son instantáneos.
  Depende de: T-50, T-30.

- [ ] **T-55 · M-10 y M-11 pila de Work con CSS** · 45 min · [A] · M-10, M-11, AC-05, AC-13
  Transición de 700 ms por capa con 60 ms de desfase (`transition-delay` por índice), etiquetas de 420 ms tras 300 ms, `--gap` de 44 px en móvil y, con reduced-motion, pila abierta sin transición. **GSAP solo si esto no cumple** (Q4): en ese caso `gsap.client.ts` con `gsap.context()`/`ctx.revert()`, `gsap.matchMedia()` y carga diferida, con la documentación vigente de Context7.
  Verifica: cambiar de tab a mitad de transición no deja saltos; la pila abre al ver Work; con reduced-motion está abierta y sin transición; no aparece un chunk extra de animación en la red.
  Depende de: T-30, T-50, T-81.

- [ ] **T-56 · M-12 y M-13 diálogo y paleta** · 60 min · [A] · M-12, M-13, AC-05
  Apertura de «Say hi» desde atrás con `@starting-style` (entrada de 220 ms, salida de 120 ms; `::backdrop` solo con `opacity`) y respaldo instantáneo; línea de progreso coral; éxito con los planos del formulario retrocediendo (40 ms de desfase) y la confirmación avanzando (420 ms), y cierre posterior que retrocede; la paleta sin animación.
  Verifica: Esc a mitad de animación cierra sin esperar; con reduced-motion solo cambia la opacidad; tras el éxito el foco queda en la confirmación; la paleta abre sin animación.
  Depende de: T-50, T-38.

- [ ] **T-57 · M-14 View Transitions** · 45 min · [A] · RF-17, RNF-08, M-14, AC-20
  CSS de `::view-transition-*`, `view-transition-name` en nav y footer, y comprobar la configuración de Nuxt.
  Verifica: Chromium dispara la transición y la nav no hace *crossfade*; sin soporte (Firefox) y con reduced-motion la navegación es instantánea y sin errores en consola.
  Depende de: T-50.

- [ ] **T-58 · M-15 reveal y M-16 anclas** · 45 min · [A] · RF-20, M-15, M-16, AC-21
  `page.client.ts`: reveal con `IntersectionObserver` (una sola vez, 420 ms, 60 ms por bloque) y `scroll-behavior: smooth` solo con no-preference; `scroll-padding-top` de 96 px. Sin Lenis.
  Verifica: AC-21: scroll nativo con rueda; los encabezados de sección quedan visibles bajo la nav; con reduced-motion no hay reveal ni scroll animado; todos los `data-reveal` terminan visibles sin JS.
  Depende de: T-50.

- [ ] **T-59 · Medir el INP del vuelo y registrar Q5 y Q11** · 45 min · [A] · RF-20, AC-12, AC-21
  Medir el INP con el vuelo en el Deploy Preview (5 corridas) y dejar registrado que Lenis (Q5) y GSAP (Q11) no se incluyen, ya decidido por Ilmar. Cambiar el texto de la tarjeta «This portfolio» en `projects.ts` si aún no se hizo (AC-24).
  Verifica: números en `evidence/summary.md`; el texto de la tarjeta coincide con `package.json`.
  Depende de: T-58, T-52.

- [ ] **T-80 · M-18 y M-19 lectura y gráfica de la tarjeta** · 45 min · [A] · M-18, M-19, AC-05, AC-27
  La cuenta de la duración (700 ms tras 160 ms, una sola vez, valor final para lectores de pantalla), las dos celdas de la lectura que despiertan (220 ms, a los 100 y 160 ms), las barras de la gráfica que se dibujan (420 ms, las de atrás primero y la del rol al final) y la línea de hoy al final.
  Verifica: con el vuelo, la duración pasa de 0 a su valor en ≈ 0.7 s y no se repite al volver; las celdas llegan en orden; las barras se dibujan en orden (muestreo de `getComputedStyle`); con reduced-motion todo aparece final.
  Depende de: T-79, T-52, T-50.

- [ ] **T-60 · Rendimiento del motion** · 45 min · [A] · RNF-02
  Trazas de Chrome con CPU 4× más lenta en el vuelo (hero y 4 planos) y en Work; `will-change` solo de forma puntual; revisión con la skill `gsap-performance` solo si se usa GSAP.
  Verifica: sin tareas largas > 50 ms atribuibles al motion; nota en `evidence/summary.md`.
  Depende de: T-52, T-55.

- [ ] **T-61 · `/review-animations`** · 60 min · [A] · AC-18
  Correr la skill sobre los archivos de motion y corregir cada hallazgo. Si marca los 700 ms de M-10, bajar a 500 ms.
  Verifica: sin hallazgos pendientes (salida guardada en `evidence/`).
  Depende de: T-51 a T-58, T-60 y T-80.

- [ ] **T-62 · PR `feat/motion` → `v2`** · 30 min · [A] · AC-18
  Pre-merge: `/hallmark audit app/`, `/review-animations`, `typecheck`, Deploy Preview revisado. **Ilmar hace el merge.**
  Verifica: preview verde.
  Depende de: T-59, T-61.

---

## M7 · Calidad (PR `feat/quality` → `v2`)

- [ ] **T-63 · Suite de viewports** · 45 min · [A] · AC-03
  360, 768, 1280 y 1920 px: sin scroll horizontal, hero completo a 1280×800 y contenedor de 1440 px a 1920 px.
  Verifica: `npm run verify:layout` en verde.
  Depende de: T-62.

- [ ] **T-64 · Suites de teclado, reduced-motion, JS apagado y tema** · 60 min · [A] · AC-02, AC-04, AC-05, AC-06
  Automatizar los criterios con el arnés de T-11.
  Verifica: `verify:keyboard`, `verify:reduced`, `verify:nojs` y `verify:theme` en verde.
  Depende de: T-62.

- [ ] **T-83 · Suites del vuelo, las tarjetas y la pila** · 60 min · [A] · AC-26, AC-27, AC-28
  Scripts `verify:flight`, `verify:cards` y `verify:stack` con el arnés de T-11 (consolidan los de T-52, T-80 y T-81 y los dejan repetibles).
  Verifica: los tres en verde; `verify:stack` mide 12 anchos × 4 proyectos; `verify:cards` comprueba duraciones, el enlace único de Stori y la gráfica.
  Depende de: T-62.

- [ ] **T-65 · Accesibilidad con axe** · 60 min · [A] · AC-15, RNF-05
  axe en `/`, `/versions` y 404, claro y oscuro, más revisión manual de contraste (incluido el texto de error en oscuro), objetivos de 24×24, foco no tapado por la nav y orden de encabezados.
  Verifica: 0 violaciones serias o críticas y la revisión manual anotada en `evidence/summary.md`.
  Depende de: T-62.

- [ ] **T-66 · Auditoría de Hallmark** · 60 min · [A] · AC-17, O-5
  `/hallmark audit app/` y `node .agents/skills/hallmark/scripts/sloplint.mjs app --render --url http://localhost:3000/` con `npm run dev` levantado.
  Verifica: 0 FAIL y 0 WARN; cada REFLEX corregido o justificado por escrito en el PR.
  Depende de: T-62.

- [ ] **T-67 · Fidelidad visual contra la referencia** · 45 min · [A] · AC-17
  Calibrar el umbral del diff contra `design/hallmark/f/` (propuesto 2 %), fijarlo y correr la comparación por sección.
  Verifica: resultados por sección en `evidence/summary.md`; ninguna sección por encima del umbral final.
  Depende de: T-66.

- [ ] **T-68 · Lighthouse y presupuesto de JS en el Deploy Preview** · 60 min · [A] · AC-12, AC-13, RNF-01, RNF-02, RNF-03
  Lighthouse móvil ×5 sobre `/` y `/versions`, suma de JS inicial y INP con interacciones reales. Corregir lo que rompa el presupuesto.
  Verifica: medianas ≥ 95 en las 4 categorías, LCP < 1.5 s, CLS < 0.05, JS ≤ 120 KB gzip, INP < 200 ms.
  Depende de: T-62.

- [ ] **T-69 · `impeccable detect` (opcional)** · 30 min · [A] · AC-19
  `npx impeccable detect dist` (solo el CLI; no se instala la skill ni los hooks).
  Verifica: sin hallazgos sin resolver, o ignorados con justificación escrita.
  Depende de: T-68.

- [ ] **T-70 · Auditoría de contenido** · 45 min · [A] · AC-24, AC-25, RF-19
  `rg` sobre `dist` (Countly, axios, `api.ilmarlopez.com`, WhatsApp, Facebook, Twitch, proyectos internos); comprobar que las tecnologías de la tarjeta «This portfolio» y de `versions.ts` existen en `package.json`; sin secretos.
  Verifica: salida vacía y consistente, anotada en `evidence/summary.md`.
  Depende de: T-62.

- [ ] **T-71 · Prueba en Safari y en iPhone real** · 45 min · [A+I] · RNF-08, RF-04, RF-07, RF-10, AC-20
  En Safari de escritorio y en un iPhone real (Firefox como contraste): el vuelo (`perspective`, `preserve-3d`, variables CSS por fotograma), la pila de Work con unidades de contenedor, la hoja de «Say hi» sobre el teclado, View Transitions (tema y páginas), `<dialog>` y `light-dark()`. El agente prepara la lista y las capturas de escritorio; Ilmar prueba en el iPhone.
  Verifica: capturas y notas por navegador en `evidence/summary.md`; sin defectos abiertos, o cada uno con su corrección o su justificación.
  Depende de: T-62.

- [ ] **T-72 · PR `feat/quality` → `v2`** · 30 min · [A] · AC-12, AC-17
  Pre-merge: resultados de T-63 a T-71 en la descripción. **Ilmar hace el merge.**
  Verifica: preview verde.
  Depende de: T-63 a T-71.

---

## M8 · Lanzamiento

- [ ] **T-73 · Documentación de versionado y README** · 45 min · [A] · RV-06, RV-07
  `docs/versioning.md` con el proceso de spec RV-06 (incluida la recomendación de *rulesets* de GitHub para `main`, `release/*` y tags) y actualización del `README` (stack, comandos, versionado).
  Verifica: cada paso del proceso es ejecutable sin ambigüedad (revisión de Ilmar).
  Depende de: T-72.

- [ ] **T-74 · Lista de lanzamiento** · 45 min · [A] · RV-04, AC-22
  `docs/launch-checklist.md`: instantánea DNS, bajar TTL, registros que no se tocan (MX y TXT), orden de pasos, *rollback*, desactivación de Pages tras 24–48 h y **un envío real de prueba del formulario a `me@ilmarlopez.com`** en el Deploy Preview (los tests automáticos usan una ruta simulada).
  Verifica: Ilmar la revisa y la aprueba.
  Depende de: T-72.

- [ ] **T-75 · `versions.ts` definitivo** · 45 min · [A+I] · RV-05, AC-11
  Captura de v2 desde el Deploy Preview final y fechas reales (Q9; las da Ilmar).
  Verifica: `/versions` muestra v2 y v1 con sus capturas; `rg "TODO\(ilmar\)" app` no devuelve nada.
  Depende de: T-72.

- [ ] **T-76 · PR `v2` → `main`** · 45 min · [A] · todos
  Descripción con el checklist de AC, resultados de Lighthouse, `hallmark audit`, `/review-animations` e `impeccable`. **Ilmar hace el merge.**
  Verifica: Deploy Preview de producción verde.
  Depende de: T-73, T-74, T-75.

- [ ] **T-77 · Lanzamiento** · 60 min · [I] · RV-04, AC-22, AC-23
  Seguir `docs/launch-checklist.md`: dominios en Netlify, DNS, HTTPS, GitHub Pages desactivado a las 24–48 h y tag `v2.0.0` (lo crea Ilmar).
  Verifica: AC-22 y AC-23.
  Depende de: T-76.

- [ ] **T-78 · Cierre** · 30 min · [A] · todos
  Checklist final de AC en `evidence/summary.md` y resumen de pasos de deploy: sitio v2 en `ilmarlopez.com`, sitio v1 en `v1.ilmarlopez.com` y limpieza de GitHub Pages.
  Verifica: cada AC de la spec figura como cumplido, con su evidencia, o como pendiente con motivo.
  Depende de: T-77.
