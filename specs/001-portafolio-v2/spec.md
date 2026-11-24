# Spec 001 — ilmarlopez.com v2

| | |
|---|---|
| Estado | **Fase 1 aprobada por Ilmar (2026-11-24)** con las decisiones Q1 a Q4 de la sección 10.5. **Actualizada el mismo día** tras aprobar el prototipo `design/hallmark/f/` (hero «Depth is time», tarjetas con gráfica de tiempo, «Say hi» rediseñado, nueva coreografía y CV renombrado); los cambios se resumen en 10.7. Siguiente: re-aprobación de `plan.md` y `tasks.md`. |
| Rama | `v2` (trabajo en `feat/*` desde `v2`, PR hacia `v2`) |
| Fuente de verdad visual | [`design.md`](../../design.md) y [`design/hallmark/f/`](../../design/hallmark/f/) (dirección «Depth Is Time»; `design/hallmark/d/`, «Live System», queda como historial) |
| Fecha | 2026-11-24 |
| Idioma del sitio | Inglés. Esta spec está en español. |

**Regla de precedencia.** Si algo de esta spec choca con la referencia de Hallmark, gana la referencia y el choque se registra en la sección 10. El Floor de Hallmark no se negocia.

**Leyenda de verificación.** *Verificado* = lo comprobé hoy en el repo, en npm, en GitHub o en la documentación (Context7). *Por verificar* = depende de la primera build o de Netlify y queda como tarea del plan.

---

## 0. Estado de partida (verificado)

- **Repo.** Rama `v2` alineada con `origin/v2`. El scaffold Nuxt 4 existe (`app/`, `nuxt.config.ts`, `netlify.toml`). Sin commits nuevos de esta fase.
- **Sin trackear o modificado en el árbol de trabajo:** `design.md`, `design/`, `.playwright-mcp/` y el CV. Ilmar renombró `public/files/cv-en.pdf` a `public/files/Ilmar-Lopez-CV.pdf` el 2026-11-24 (47 057 bytes, 1 página, sin título en los metadatos), de modo que Git ve `cv-en.pdf` como borrado y el nuevo como no trackeado. Ver preguntas Q9 y Q10.
- **v1.** El tag anotado `v1.0.0` (2026-04-12) apunta al commit `1c0814b`, que es la punta de `origin/release/v1`. Están alineados. `release/v1` es Nuxt `^3.7.4` + `@nuxtjs/tailwindcss`, con `yarn.lock` y `.npmrc`. **No tiene `netlify.toml`**: la configuración de build del sitio v1 en Netlify irá en los ajustes del sitio, no en el repo (la rama no se toca).
- **Workflow heredado.** `release/v1` y `main` conservan `.github/workflows/cd.yml` (deploy a GitHub Pages en `push` a `main`). `v2` ya no lo tiene, así que el PR `v2 → main` lo elimina.
- **Versiones actuales (npm, hoy):** `nuxt` 4.7.0 (instalado), `@nuxt/image` 2.2.1, `@nuxt/fonts` 1.2.0, `tailwindcss` y `@tailwindcss/vite` 4.3.5, `gsap` 3.15.1, `lenis` 1.3.28, `motion-v` 2.13.0.
- **Node.** Nuxt 4.7 declara `engines.node: ^22.22.3 || ^24.15.0 || >=26.0.0` y Vite 8.3.8 pide `^20.19.0 || >=22.12.0`. El Node local es **v20.16.0**, que no cumple. Netlify usa `NODE_VERSION = "22"`.
- **Assets protegidos** presentes: `public/img/hero/me.jpg` (5.3 MB, 4896×6528), `me_v1.jpg`, `public/files/Ilmar-Lopez-CV.pdf` (antes `cv-en.pdf`; lo renombró Ilmar), `public/favicon.ico`. `public/robots.txt` existe (`Disallow:` vacío, sin línea `Sitemap`).
- **Repos de «Selected work»:** los 5 existen, son públicos y no están archivados (`umami-cloud-go`, `serverless-transaction-notifications`, `utt-access-control-client`, `utt-access-control-server`, `ilmarlopez.github.io`).
- **Skills.** Instaladas: `hallmark`, `emil-design-eng`, `review-animations`, `gsap-*`, `netlify-*`. **No instaladas:** `choreograph` y `animation-performance` (el prompt las pide «solo si están instaladas»). La coreografía se decide con `emil-design-eng` y el rendimiento con `gsap-performance` más trazas de Chrome DevTools.
- **Por verificar:** si ya existen sitios de Netlify para v2 o v1, y el estado exacto de los registros DNS.

---

## 1. Resumen y objetivos

**Qué es.** Un portafolio de una página (más `/versions` y 404) de un ingeniero que muestra el trabajo que describe: la profundidad es tiempo. El rol más reciente está al frente y al hacer scroll la cámara vuela hacia atrás por los roles que lo construyeron, cada uno en una tarjeta con su duración y su lugar en una gráfica de tiempo. Minimalista, claro/oscuro, un solo acento.

**Objetivos medibles**

| ID | Objetivo | Cómo se mide |
|---|---|---|
| O-1 | Lighthouse móvil ≥ 95 en Performance, Accessibility, Best Practices y SEO en `/` y `/versions` | Lighthouse con throttling móvil por defecto, mediana de 5 corridas, sobre Deploy Preview y producción |
| O-2 | LCP < 1.5 s, CLS < 0.05, INP < 200 ms | Lighthouse (LCP, CLS, TBT como proxy) y `web-vitals` con interacciones reales vía Playwright (INP) |
| O-3 | JS inicial de la home ≤ 120 KB gzip | Suma gzip de los scripts pedidos antes de cualquier scroll o interacción |
| O-4 | Cada ruta sale como HTML con contenido real | Inspección de `dist/**/index.html` y `dist/404.html` |
| O-5 | Fidelidad a la referencia de Hallmark | `/hallmark audit app/` sin `FAIL`; `sloplint --render` con 0 FAIL, 0 REFLEX y 0 WARN (guardrail de `design.md`) |
| O-6 | WCAG 2.2 AA | axe-core sin violaciones serias o críticas en ambos temas, más revisión manual |
| O-7 | Versionado público | `v1.ilmarlopez.com` sirve v1 de forma permanente; `/versions` lista v1 y v2; proceso documentado para v3 |

**No-objetivos**

- CMS, blog, i18n de la interfaz (solo inglés), funciones de Netlify, formularios con backend propio.
- Analítica activa en 2.0 (ver Q7).
- Proyectos, sistemas o herramientas internas de empleadores (código privado).
- WhatsApp, Facebook y Twitch (se quitan respecto a v1).
- Fondo shader/WebGL: la referencia no lo incluye y `design.md` limita a un efecto «wow» por sección.
- Una dirección visual distinta de la de `design.md`.
- Tocar `main`, `release/v1` o cualquier tag desde esta fase.

---

## 2. Usuarios y jobs-to-be-done

| Usuario | Job | Camino en el sitio |
|---|---|---|
| Reclutador | Saber en menos de 30 s quién soy, dónde trabajo, qué stack uso y llevarme el CV | Hero (nombre, rol, «View CV») → Experience → Tools |
| Tech lead | Evaluar profundidad técnica y criterio | Hero y vuelo por Experience → Selected work (repos públicos) → Tools → «This portfolio» y su código |
| Cliente freelance | Contactarme sin fricción | «Say hi» (hero y Contact) → `me@ilmarlopez.com` |

---

## 3. Requisitos funcionales

**Orden del home:** Nav · Hero y Experience (el vuelo) · About · Selected work · Tools · Contact · Footer. Rutas: `/`, `/versions`, 404.

| ID | Requisito |
|---|---|
| **RF-01** | Tres rutas prerenderizadas: `/`, `/versions` y `404.html` con contenido real. |
| **RF-02 Nav** | Sticky, fondo `paper`, filete inferior de 1 px. Wordmark «Ilmar Lopez» a la izquierda; a la derecha Experience, Work, Tools, Contact y el interruptor de tema. Desde `/versions` o 404 los enlaces apuntan a `/#experience`, etc. En ≤ 60 rem solo quedan el wordmark y el interruptor (como la referencia). Incluye un *skip link* a `#main`, visible solo con foco. |
| **RF-03 Hero** | `h1` «Hi, I’m Ilmar Lopez.» que entra línea a línea (M-01); frase «Senior engineer at Stori, building serverless APIs in Go and Python.»; acciones «Say hi» (primaria, tinta) y «View CV» (secundaria, contorno; ver RF-11). Titular, una frase y acciones visibles a 1280×800 sin scroll. Es el primer plano del vuelo (RF-04): cuando la cámara se aleja, las acciones dejan de recibir foco. Copy de la referencia, sin emoji. |
| **RF-04 Vuelo «Depth is time»** | El hero y Experience forman un solo recorrido (`.journey`). **Primero estático:** el hero y después los roles como lista legible, con el `h2` «Experience» visible. Con JS y sin reduced-motion, la clase `flight` lo convierte en una escena CSS 3D según `design.md` (sin canvas ni WebGL): recorrido de 480 svh con un visor *sticky* (`perspective` 1100 px; 900 px en ≤ 40 rem), el hero y 4 planos de rol separados 820 px en profundidad. El scroll fija `--x --y --z --o --po` en cada plano; la cámara se detiene un instante en cada uno y se acerca al scroll con un amortiguamiento de ≈ 90 ms (M-02). Al cargar, los planos llegan desde la profundidad (M-03). Una regla de profundidad inferior (`aria-hidden`) muestra Now · Stori · Home & Media · California Web · UTT con relleno coral. En teléfono las tarjetas de fondo se ubican en la banda entre la nav y el texto del hero, con un desplazamiento calculado a partir de la perspectiva. **Solo el plano frontal recibe puntero y foco:** los enlaces de los demás salen del orden de tabulación pero siguen en el DOM para los lectores de pantalla. El script es de DOM plano (`journey.client.ts`) y no hidrata componentes. |
| **RF-05 About** | Dos párrafos con el copy de la referencia, que conserva «I aspire to create impactful contributions.». **Foto `/img/hero/me.jpg` en About** (Q1, decidido), con `<NuxtImg>` (AVIF/WebP, `width` y `height` explícitos, `loading="lazy"`) y `alt` descriptivo. La composición de About con foto no existe en la referencia: la define la pasada de Hallmark de la sección 10.3 antes de portar About. |
| **RF-06 Experience** | 4 roles desde `app/data/experience.ts` con el tipo `Role { id, name, short, mark, role, summary?, state: 'active' \| 'ended' \| 'education', from?, to?: 'YYYY-MM' \| 'now', url? }`: Stori Card (Senior Software Engineer, Oct 2021 to now, activo, `url` `https://www.storicard.com/`), Home & Media Products (Full Stack Developer and Technical Lead, Sep 2017 to Oct 2021, terminado), California Web Design (Frontend Developer, Apr 2017 to Jul 2017, terminado) y Universidad Tecnológica de Tijuana (Information Technology Engineering, educación, sin fechas). **Tarjeta («hoja de dibujo»):** monograma, nombre, rol y estado («Active» con el único punto coral de la página, «Ended», «Education»); resumen; una lectura con **Period** y **Duration**; y una gráfica de tiempo. La duración se calcula con las fechas contando el primer y el último mes (5 años 2 meses para Stori en noviembre de 2026) y cuenta de 0 a su valor una sola vez cuando llega el plano (M-18); los lectores de pantalla reciben solo el valor final. La gráfica muestra una fila por rol en una escala común (enero de 2017 a hoy), el más nuevo arriba, con el rol de la tarjeta en tinta y negrita, los demás en gris, una línea coral para hoy, una línea por cada enero y los años rotulados cada 2 (cada 3 en teléfono) (M-19). Solo el nombre del rol activo enlaza fuera (`target="_blank"`, `rel="noopener"`). UTT no tiene fechas, así que no lleva lectura ni gráfica. **Mejora progresiva:** sin JS (o con reduced-motion) los roles son una lista con periodo y duración en texto estático; la gráfica y la cuenta las construye el script. |
| **RF-07 Selected work** | Inspector de 4 proyectos (datos en `app/data/projects.ts`): 01 Self-hosted analytics on AWS, 02 Serverless transaction notifications, 03 Building access control, 04 This portfolio. Patrón ARIA *tabs*: flechas, Home y End, `tabindex` itinerante. Cada proyecto muestra su pila de capas en 3D y enlaza a su repo público. **Mejora progresiva obligatoria:** sin JS se ven los 4 proyectos como lista legible y la pila decorativa en estado abierto (ver sección 10, defecto B2). La pila se dimensiona con el ancho de su escenario (unidades de contenedor) para que el diamante, la guía y la etiqueta más larga quepan siempre; `--tag` guarda el ancho de la etiqueta más larga (126 px a 16 px) y se actualiza si una etiqueta nueva es más larga. |
| **RF-08 Tools** | Cuatro columnas (Languages, Frontend, Cloud, Practice) desde `app/data/tools.ts`, más «Spanish, native. English, technical.». |
| **RF-09 Contact** | «Have something to build?», enlace `mailto:me@ilmarlopez.com`, botón «Say hi» y redes: GitHub `https://github.com/IlmarLopez`, LinkedIn `https://www.linkedin.com/in/ilmarlopez`, DEV `https://dev.to/ilmarlopez`, CodePen `https://codepen.io/ilmarlopez`. Datos en `app/data/socials.ts`. La lista de enlaces empieza con «CV» y el dato «PDF, 1 page» (RF-11). |
| **RF-10 «Say hi»** | `<dialog>` nativo con Name, Email y Message. Envía JSON por `POST` a `https://api.web3forms.com/submit` con `access_key` = `runtimeConfig.public.web3formsKey` (← `NUXT_PUBLIC_WEB3FORMS_KEY`), campo anti-spam oculto (*honeypot*) y `subject`. Estados: reposo, enviando, éxito (`role="status"`), error (conserva los datos y ofrece el `mailto`). Validación con `aria-invalid` y mensajes enlazados con `aria-describedby`. Gestión de foco: el diálogo atrapa el foco, Esc cierra y el foco vuelve al disparador. Sin la clave (desarrollo local) el botón Enviar queda deshabilitado y se muestra el `mailto`. Sin JS, los botones «Say hi» son enlaces `mailto:` que el JS mejora. La clave de Web3Forms es pública por diseño, pero nunca se escribe en el código. **Diseño aprobado (`design/hallmark/f/`):** el diálogo llega desde atrás; al enviarse con éxito el formulario retrocede hacia el punto de fuga y la confirmación avanza (M-12); una línea coral de progreso recorre el borde superior mientras se envía; los campos llevan etiqueta visible, una línea de ayuda reservada que el error reemplaza y un control de 52 px; el foco es de tinta; no hay botón Cancelar (cierran el control de cierre y Esc); el texto de error usa `--color-error-text`; en teléfono es una hoja desde el borde inferior que sube sobre el teclado (`--kb` y `--vvh` salen de `visualViewport`). |
| **RF-11 CV** | Datos en `app/data/cv.ts` (`[{ lang: 'en', label: 'English', href: '/files/Ilmar-Lopez-CV.pdf' }]`). «View CV» del hero y el enlace «CV · PDF, 1 page» de Contact usan la misma entrada; con una entrada son enlaces directos y con más de una abren un menú. Agregar `/files/Ilmar-Lopez-CV-es.pdf` (o el nombre que se elija) solo requiere una entrada nueva. **Sin atributo `download`: el PDF se abre en una pestaña nueva** (`target="_blank"` con `rel="noopener"`), de modo que la etiqueta «View CV» describe lo que ocurre (Q2, decidido). El nombre del archivo ya es el que verá quien lo guarde. `netlify.toml` redirige con 301 `/files/cv-en.pdf` a `/files/Ilmar-Lopez-CV.pdf`, para no romper enlaces ya publicados. El título de los metadatos del PDF lo fija Ilmar al exportarlo (Q12). |
| **RF-12 Tema** | Claro/oscuro por `data-theme` en `<html>`. Sin preferencia guardada sigue `prefers-color-scheme`. Un script inline en `<head>` aplica el tema y la clase `js` antes del primer render (sin parpadeo). La etiqueta del interruptor se resuelve con CSS (dos textos, uno visible) para evitar *hydration mismatch*. Persistencia en `localStorage`. Incluye `color-scheme` y `<meta name="theme-color">` por esquema. El cambio se hace con un crossfade de View Transitions de 220 ms (M-07); sin soporte o con reduced-motion es instantáneo. |
| **RF-13 Command palette** | ⌘K / Ctrl+K abre un diálogo modal con búsqueda local (sin librería). Comandos: *Navigate* (Top, Experience, Work, Tools, Contact, All versions), *Actions* (Say hi, View CV, Copy email, Toggle theme), *Links* (GitHub, LinkedIn, DEV, CodePen, Version 1 archived). Patrón ARIA *combobox + listbox*, flechas, Enter, Esc. Se carga bajo demanda en el primer atajo. Descubribilidad en Q6. |
| **RF-14 Footer** | Campo grafito (`--color-field`), wordmark, «All versions» (`/versions`), «Version 1, archived» (`https://v1.ilmarlopez.com`) y «Version 2, 2026». |
| **RF-15 `/versions`** | Línea de tiempo en orden inverso desde `app/data/versions.ts`. Cada versión muestra versión, fecha, stack, captura y enlace. «Current» o «Archived» como texto, sin puntos de estado decorativos. Entradas iniciales: v2 (actual) y v1 (archivada, Nuxt 3 + Tailwind CSS 3, según su `package.json`). |
| **RF-16 404** | `app/error.vue` con titular, una frase y botón «Back home». Se prerenderiza dentro de `404.html` (`experimental.prerenderErrorPages`). `noindex`. |
| **RF-17 Transiciones de página** | `experimental.viewTransition: true` entre `/`, `/versions` y 404. Nav y footer son elementos con nombre y no se animan; solo cambia el contenido de `main` (detalle en la tabla de motion). Si ningún elemento compartido aporta valor, no se inventa uno. |
| **RF-18 SEO** | Por ruta: `title`, `description`, canonical, Open Graph y Twitter Card con `useSeoMeta`/`useHead`. Imagen OG 1200×630 estática en `public/`. JSON-LD `Person`: `name`, `jobTitle` «Senior Software Engineer», `worksFor` (`Organization`, solo `name` «Stori»), `url`, `image` (`/img/hero/me.jpg`), `sameAs` (las 4 redes), `email`, `knowsLanguage` (`es`, `en`) y `alumniOf` (Universidad Tecnológica de Tijuana). `public/sitemap.xml` estático (2 URLs) y `public/robots.txt` con línea `Sitemap`. |
| **RF-19 Limpieza de v1** | Sin Countly, sin `plugins/axios.ts` ni referencias a `api.ilmarlopez.com` (ya ausentes del scaffold). Sin analítica ni cookies. |
| **RF-20 Scroll** | Scroll nativo. Las anclas de la nav planean con `scroll-behavior: smooth` solo con `prefers-reduced-motion: no-preference`, con compensación de la nav sticky (`scroll-padding-top` 96 px); en el vuelo, el enlace «Experience» lleva al momento en que el primer rol está frente a la cámara. **Lenis no se incluye (propuesta, Q5):** el vuelo ya suaviza el scroll y una segunda capa de suavizado se sentiría con retraso. |

---

## 4. Design system

Fuente: `design/hallmark/f/tokens.css`, `base.css`, `styles.css` y `design.md`. **Los valores de abajo se transcriben de `tokens.css`**; la tabla de `design.md` es un subconjunto (ver B3 en la sección 10).

### 4.1 Color (OKLCH)

| Token | Claro | Oscuro |
|---|---|---|
| `--color-paper` | oklch(97.5% 0.006 250) | oklch(16% 0.015 260) |
| `--color-paper-2` | oklch(94.5% 0.01 250) | oklch(20% 0.018 260) |
| `--color-paper-3` | oklch(90% 0.015 250) | oklch(26% 0.02 260) |
| `--color-ink` | oklch(20% 0.02 260) | oklch(96% 0.006 250) |
| `--color-ink-2` | oklch(32% 0.025 260) | oklch(86% 0.012 250) |
| `--color-muted` | oklch(45% 0.025 260) | oklch(74% 0.02 255) |
| `--color-rule` | oklch(86% 0.012 250) | oklch(30% 0.02 260) |
| `--color-accent` (coral, única señal) | oklch(66% 0.19 33) | oklch(70% 0.18 35) |
| `--color-accent-ink` | oklch(20% 0.02 260) | igual |
| `--color-focus` | oklch(50% 0.2 33) | oklch(76% 0.17 38) |
| `--color-field` (footer) | oklch(19% 0.02 260) | oklch(12% 0.012 260) |
| `--color-field-ink` | oklch(97.5% 0.006 250) | igual |
| `--color-field-muted` | oklch(78% 0.02 255) | igual |
| `--scene-soft-top` (capa superior de la pila de Work) | oklch(88% 0.04 255) | oklch(38% 0.06 255) |
| `--color-error-text` (texto de error del diálogo) | oklch(52% 0.19 27) | oklch(76% 0.15 27) |

`--color-error-text` ya tiene versión clara y oscura (≥ 4.5:1 por verificar con axe, AC-15). `--scene-soft-side`, `--color-error` y `--color-success` existen en la referencia pero el diseño aprobado no los usa, así que no se portan (ver B6).

### 4.2 Tipografía

- Display: **Rethink Sans** (600, 700). Cuerpo: **Hanken Grotesk** (400, 600). Dos familias, autoalojadas con `@nuxt/fonts` desde `/_nuxt/fonts/` (proveedor Fontsource, subset `latin`, `font-display: swap`). Fontsource sirve el eje completo de Hanken Grotesk (100 a 900) y no se puede recortar a 400–600; no cambia nada visible.
- Escala fija: `xs` 0.8125rem · `sm` 0.875 · `md` 1 · `lg` 1.25 · `xl` 1.5625 · `2xl` 1.953 · `3xl` 2.441.
- Escala fluida: `display` `clamp(2.75rem, 6vw, 5.5rem)` · `display-s` `clamp(2.25rem, 4vw + 0.5rem, 3.75rem)` · `section` `clamp(2rem, 2.5vw + 1rem, 3.5rem)` · `title` `clamp(1.25rem, 0.75vw + 0.875rem, 1.625rem)` · `lead` `clamp(1.125rem, 0.35vw + 1rem, 1.375rem)`.
- Cuerpo: `line-height` 1.55. `h1`: peso 700, `line-height` 1, tracking −0.04em, máx. 12ch. `h2`: 700, 1.02, −0.035em, máx. 12ch. Títulos de fila y de proyecto: −0.02em. El CSS de la referencia es más específico que el «−0.02em» de `design.md` y manda.
- Etiquetas, pies y cabeceras de tabla: cuerpo, una talla menor, sin mayúsculas ni tracking (Floor 9).

### 4.3 Espaciado, layout y forma

- Espacio: 2 · 4 · 8 · 12 · 16 · 24 · 40 · 64 · 96 · 144 px (`--space-3xs` … `--space-4xl`).
- Contenedor 1440 px y *gutter* 64 px (24 px en ≤ 60 rem; 16 px en ≤ 40 rem). Separación de columnas 32 px (16 px en ≤ 40 rem). Separación entre secciones 120 px (80 px en ≤ 60 rem; 56 px en ≤ 40 rem). A 1920 px crecen los márgenes, no la medida.
- Grid de secciones 4fr/8fr; el hero es un plano del vuelo, a ancho completo. Todas las pistas con imágenes o 3D usan `minmax(0, 1fr)`.
- Radio 4 px (tarjetas, mosaicos, inputs) y píldora 999 px (botones, interruptor). Filete 1 px. **Sin sombras.**
- Botón primario: relleno tinta, y en hover relleno acento con `accent-ink`. Secundario: contorno. Un solo estilo de botón primario por página.
- Puntos de corte de la referencia: 70 rem (Tools a 2 columnas), 60 rem (una columna, nav sin enlaces, la pila de Work se dimensiona al ancho de su escenario) y 40 rem (botones de ancho completo, Tools a 1 columna).
- Escala de z-index: base 1, raised 10, dropdown 100, sticky 200, sticky-nav 300, modal 400, toast 500, tooltip 600.

### 4.4 Duraciones y easings

- `--dur-micro` 120 ms · `--dur-short` 220 ms · `--dur-long` 420 ms.
- `--ease-out` `cubic-bezier(0.16, 1, 0.3, 1)` (equivale a *easeOutExpo*; en GSAP se usa `expo.out`) · `--ease-in` `cubic-bezier(0.7, 0, 0.84, 0)` · `--ease-in-out` `cubic-bezier(0.65, 0, 0.35, 1)`.
- Se añade un token que la referencia deja como literal: `--dur-stack: 700ms` (pila de Work y llegada de los planos).

### 4.5 Mapeo a Tailwind v4

Consultado en Context7: `@theme static`, variante `dark` por atributo y `@tailwindcss/vite`.

```css
/* app/assets/css/main.css — la línea 1 es el sello de Hallmark (Floor 15), luego la línea de crítica */
@import "tailwindcss";
@import "./tokens.css";
@import "./base.css" layer(base);
```

```css
/* tokens.css */
@theme static {
  --color-*: initial;  --text-*: initial;  --radius-*: initial;
  --ease-*: initial;   --font-*: initial;  --breakpoint-*: initial;
  --color-paper: light-dark(oklch(97.5% 0.006 250), oklch(16% 0.015 260));
  /* …el resto de roles de 4.1 como --color-*; fuentes como --font-display / --font-body;
     escala como --text-*; radios como --radius-card / --radius-pill; easings como --ease-* */
}
:root { color-scheme: light dark; /* --space-*, --dur-*, --container, --gutter, --z-* como variables planas */ }
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"]  { color-scheme: dark; }
```

Reglas de mapeo:

1. Los roles `--color-*`, `--font-*`, la escala de texto, los radios y los easings van en `@theme static`. `static` es necesario porque el CSS plano también usa estas variables y el modo oscuro las reasigna. `--color-*: initial` borra la paleta por defecto de Tailwind, de modo que `bg-red-500` no compila y el sistema queda «solo tokens».
2. **Sin `--spacing-<nombre>`.** La escala `--space-*` vive en `:root` como variables planas y se consume con la sintaxis `p-(--space-md)`.
3. Las duraciones `--dur-*` también viven en `:root` (Tailwind no tiene un namespace de duración): `duration-(--dur-short)`.
4. **Modo oscuro.** Recomendado: definir cada token una sola vez con `light-dark()` más `color-scheme`. Esto elimina la duplicación que causó el defecto B1 y cubre las dos rutas (interruptor y preferencia del sistema). Alternativa: dos bloques como en la referencia, pero completos. Se valida con Playwright en ambas rutas.
5. La clase `.container` de `base.css` choca con la utilidad `container` de Tailwind: se renombra a `.site-container` y no se usa la utilidad.
6. `base.css` va en `@layer base`.
7. Los puntos de corte se definen como `--breakpoint-sm: 40rem`, `--breakpoint-md: 60rem` y `--breakpoint-lg: 70rem`. La referencia usa `max-width` desktop-first y Tailwind usa `max-*` con `<`, así que hay una diferencia de 1 px en el borde exacto. Las pruebas no se hacen en el borde.
8. El vuelo, las tarjetas y el inspector de Work se escriben en `<style scoped>` con los tokens. Layout y tipografía usan utilidades de Tailwind. Ningún color, espaciado ni fuente literal fuera de los tokens (incluido `bg-[#hex]`).
9. `--font-outlier` de la referencia es un alias de `--font-display`; no se porta.

---

## 5. Principios de motion

La coreografía la deciden las skills de Emil Kowalski (`emil-design-eng`). CSS y un script pequeño de DOM plano la implementan; GSAP solo si el port de la pila de Work a CSS no cumple (Q4). Si chocan, gana el Floor de Hallmark.

**Principios**

1. **Propósito.** Solo se anima para orientar, dar feedback o mostrar una relación. El vuelo muestra el tiempo como profundidad. La pila de Work muestra capas. La gráfica de tiempo muestra dónde cae cada rol. El hero se asienta una vez.
2. **La frecuencia decide.** Atajos de teclado y paleta: sin animación («No animation. Ever.»). Controles de uso frecuente: ≤ 220 ms. El cambio de tema ocurre pocas veces y es un crossfade corto de 220 ms. Momentos ilustrativos, raros y que no bloquean (hero 420 ms, llegada de los planos 700 ms, pila 700 ms): permitidos.
3. **Easing.** `ease-out` con los tokens para entradas y respuestas. Nunca `ease-in` en una entrada; las salidas rápidas (120 ms) de paneles y celdas pueden usar `--ease-in`. `linear` solo para el giro del indicador de envío del diálogo.
4. **Propiedades.** Movimiento solo con `transform` y `opacity`. Para feedback de hover se permiten transiciones solo de pintura (`background-color`, `color`, `border-color`, `background-size`) de ≤ 220 ms, como en la referencia (ver R7). Nunca `width`, `height`, `top`, `left` ni `transition: all`.
5. **Interrumpible.** Toda animación se puede cancelar con input y nunca bloquea la interacción.
6. **Cada bloque entra una sola vez.** El hero se asienta al cargar. Los bloques posteriores al vuelo suben 12 px y aparecen una vez al entrar en pantalla (M-15). El vuelo es el único patrón de scroll de la página. Sin ScrollTrigger en 2.0.
7. **Reduced-motion = menos y más suave.** Se quita el movimiento, se conservan los cambios de opacidad que ayudan a entender y el contenido se ve sin JS.
8. **Reparto de herramientas.** CSS primero. Un script de DOM plano (`journey.client.ts`) mueve el vuelo (rAF y variables CSS) y cuenta las cifras; otro minúsculo coloca el indicador de la nav y el reveal. GSAP, con carga diferida, solo si el port a CSS de M-10 y M-11 no cumple (Q4). Sin Lenis, SplitText, ScrollTrigger, `motion-v` ni shader. Las transiciones de página y de tema son CSS (View Transitions).
9. **Sin efecto de cursor propio.** Nada sigue al puntero: no hay inclinación, brillos ni cursor personalizado.

**Tabla de motion**

| ID | Elemento | Disparador | Propiedad | Duración | Easing | Orden / stagger | Si se interrumpe | Reduced-motion |
|---|---|---|---|---|---|---|---|---|
| M-01 | Hero: `h1` por líneas, frase y acciones | Primera carga del documento (no se repite al volver al home por navegación) | `h1`: `transform` translateY(105 %)→0 detrás de una máscara por línea. Frase y acciones: `opacity` 0→1 y `translateY` 8px→0 | 420 ms | `--ease-out` | Líneas del `h1` 0 / 70 ms; frase 140 ms; acciones 200 ms | One-shot, CSS, no bloquea input | Sin animación, visible |
| M-02 | Vuelo: la cámara | Scroll dentro del recorrido (480 svh), solo con JS y sin reduced-motion | `transform` y `opacity` de cada plano vía `--x --y --z --o --po` | Continuo: amortiguamiento exponencial de ≈ 90 ms hacia el scroll; parada de cada plano entre 0.22 y 0.78 de su tramo | Suavizado exponencial y *smoothstep* en la parada | Un plano por tramo | Cada fotograma parte del valor actual; el scroll del usuario manda siempre y el rAF se detiene al llegar | Sin vuelo: hero y roles como lista estática |
| M-03 | Llegada de los planos | Carga del documento, con el vuelo activo | `--zi` −700 px→0 y `--pi` 0→1 (`@property`) aplicadas a `transform` y `opacity` | 700 ms | `--ease-out` | Del más cercano al más lejano: 200 ms + 80 ms por plano; la regla de profundidad entra al final | One-shot, CSS | Sin llegada |
| M-04 | Enlaces: subrayado | hover / `:focus-visible` | `background-size` 0→100 % (2 px, acento) | 220 ms | `--ease-out` | — | La transición se invierte desde el estado actual | Estado instantáneo |
| M-05 | Botones y interruptor: color | hover | `background-color`, `color`, `border-color` | 120 ms | `--ease-out` | — | Igual | Instantáneo |
| M-06 | Botones: pulsación | `:active` | `transform` scale 0.97 | 120 ms | `--ease-out` | — | Igual | Sin `transform`; queda el cambio de color |
| M-07 | Cambio de tema | Clic en el interruptor o comando | Crossfade de la raíz (View Transitions) | 220 ms | `--ease-out` | — | Nativo: un clic nuevo salta al final | Cambio instantáneo |
| M-08 | Work: tab (color) | hover / selección | `color` | 220 ms | `--ease-out` | — | Se invierte | Instantáneo |
| M-09 | Work: panel | Selección de tab | `opacity`: el saliente baja en 120 ms y el entrante sube en 220 ms tras esos 120 ms; el texto del detalle sube `translateY` 8px→0 línea a línea | 120 ms salida, 220 ms entrada | `--ease-in` (salida) y `--ease-out` (entrada) | Líneas del detalle: +40 ms cada una | Una selección nueva a mitad de transición parte del valor actual (CSS) | Instantáneo |
| M-10 | Work: pila de capas | Primera vez con ≥ 40 % visible y cada selección de tab | `translateZ` de cada capa: 6 px → `--gap` (54 px; 44 px en móvil) | 700 ms (`--dur-stack`) | `expo.out` (≡ `--ease-out`) | Stagger 60 ms, de abajo hacia arriba | Se mata la línea de tiempo previa y se reinicia: nunca hay saltos ni dos timelines a la vez | Sin timeline: pila abierta |
| M-11 | Work: etiquetas de capa | Tras abrir la pila | `opacity` 0→1 | 420 ms | `--ease-out` | Retraso 300 ms | Sigue a M-10 | Visibles sin transición |
| M-12 | «Say hi»: apertura, envío, éxito y cierre | Clic (puntero) y envío | Apertura: `opacity` y `translateZ` −60 px→0 (llega desde atrás, `perspective(1100px)`); `::backdrop` solo `opacity`. Envío: línea coral `scaleX` hasta 0.82. Éxito: los planos del formulario retroceden (`translateZ` hasta −220 px y `opacity` →0) y la confirmación avanza desde −140 px. Cierre tras el éxito: retrocede a −240 px | Entrada 220 ms, salida 120 ms; envío 1600 ms; éxito 220 ms y 420 ms | `--ease-out` | Cada plano del formulario sale 40 ms después del anterior | Esc o cerrar durante la animación cierra sin esperar | Solo `opacity` ≤ 120 ms |
| M-13 | Command palette | ⌘K / Ctrl+K | Ninguna | 0 | — | — | No aplica | No aplica |
| M-14 | Transición de página | Navegación cliente `/` ↔ `/versions` y a 404 | `opacity` del contenido de `main` (salida), `opacity` + `translateY` 8px→0 (entrada). Nav y footer fijos por `view-transition-name` | Salida 120 ms, entrada 220 ms | `--ease-out` | Crossfade | Nativo: una nueva navegación salta al final de la actual | Nuxt omite la transición |
| M-15 | Reveal de bloques | Primera vez que cada bloque entra al viewport (`IntersectionObserver`) | `opacity` 0→1 y `translateY` 12px→0 | 420 ms | `--ease-out` | 60 ms por bloque dentro de una sección | One-shot | Visible, sin transición |
| M-16 | Anclas | Clic en un enlace de anclas | Scroll nativo con `scroll-behavior: smooth` (solo con no-preference); en el vuelo, «Experience» lleva al primer rol | Nativa del navegador | Nativa | — | Un clic nuevo reemplaza el scroll en curso | Salto instantáneo |
| M-17 | Indicador de la nav | Cambia la sección en pantalla | `transform` (translate + `scaleX`) y `opacity` de una línea coral de 2 px bajo el enlace activo | 220 ms (la primera colocación no se desliza); `opacity` 120 ms | `--ease-out` | — | Se invierte desde el valor actual | Instantáneo |
| M-18 | Lectura de la tarjeta | El plano llega a la cámara (`data-reached`) | `opacity` 0→1 y `translateY` 6px→0 de Period y Duration; Duration cuenta de 0 a su valor, una sola vez | 220 ms por celda; la cuenta 700 ms tras 160 ms | `--ease-out` (la cuenta, `1-(1-t)^4`) | Celda 1 a los 100 ms y celda 2 a los 160 ms | La cuenta no se repite ni bloquea input | Valor final al instante |
| M-19 | Gráfica de tiempo | El plano llega a la cámara | `transform` `scaleX` 0→1 de cada barra (origen izquierdo) y `opacity` de la línea de hoy | 420 ms por barra; línea de hoy 220 ms tras 450 ms | `--ease-out` | Los roles de atrás primero y la barra del rol de la tarjeta al final (120 ms + 80 ms por orden) | Se invierte | Barras dibujadas, sin transición |

**Lo que no se anima, a propósito:** la paleta, el skip link, el footer, Tools y Contact más allá de su reveal, y todo lo que seguiría al puntero. Experience y Work solo se animan como dicen M-02, M-03, M-18 y M-19, y M-09, M-10 y M-11.

**Proceso.** Antes de animar algo se pregunta si debe animarse (`emil-design-eng`). Tras implementar cada fila se prueba con CPU 4× más lenta en Chrome. Antes de cada merge se corre `/review-animations` sobre los cambios y no queda ningún hallazgo pendiente. M-10 dura 700 ms, por encima de la regla de 300 ms de Emil para UI, porque es ilustrativo, no bloquea input y el texto cambia al instante. Si `/review-animations` lo marca, se baja a 500 ms.

---

## 6. Requisitos no funcionales

| ID | Requisito | Verificación |
|---|---|---|
| **RNF-01** | Lighthouse móvil ≥ 95 en las 4 categorías, en `/` y `/versions` | Ver O-1 |
| **RNF-02** | LCP < 1.5 s, CLS < 0.05, INP < 200 ms. «4G» se mide con el throttling móvil por defecto de Lighthouse (Slow 4G simulado), más estricto que una 4G real. | Ver O-2 |
| **RNF-03** | JS inicial de `/` ≤ 120 KB gzip. Nuxt hidrata, así que se mide en la primera build y se baja con hidratación diferida. Los chunks de Work, el diálogo y la paleta (y GSAP si se usa) no se piden hasta su disparador. | Ver O-3 |
| **RNF-04** | Imágenes en AVIF/WebP con `width` y `height` explícitos. `me.jpg` (5.3 MB, 4896×6528) solo se sirve ya redimensionada. Proveedor por defecto: IPX en build (por verificar que `nuxt generate` emite las variantes). Plan B: proveedor de Netlify Image CDN. | AC-14 |
| **RNF-05** | WCAG 2.2 AA: contraste, foco visible y no oculto por la nav sticky (2.4.11), tamaño de objetivo ≥ 24×24 (2.5.8), un solo `h1` por página, vuelo con alternativa de texto (los roles son texto en el DOM y la regla de profundidad va `aria-hidden`), foco solo en el plano frontal, `NuxtRouteAnnouncer` en la navegación cliente. | AC-15 |
| **RNF-06** | SEO: meta, OG, JSON-LD, sitemap y robots. | AC-16 |
| **RNF-07** | Funciona sin JS: el contenido es legible y las acciones críticas degradan a enlaces. | AC-02 |
| **RNF-08** | Navegadores evergreen (últimas 2 versiones de Chrome, Safari, Firefox y Edge). View Transitions, `@starting-style` y `light-dark()` degradan a «sin animación» o a un valor equivalente sin errores. | AC-20 |
| **RNF-09** | Privacidad: sin cookies ni analítica; fuentes autoalojadas; la única petición de terceros en runtime es el envío a Web3Forms. | AC-24 |
| **RNF-10** | Cabeceras en `public/_headers`: caché inmutable en `/_nuxt/*`, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy`. CSP estricta es opcional: el script inline del tema exige un hash calculado en build. | AC-25 |
| **RNF-11** | Tooling: Node ≥ 22.22.3 (`.nvmrc` y `engines`, alineado con Nuxt 4.7 y Netlify), TypeScript estricto con script de *typecheck*, y la versión de TypeScript fijada a la que soporte `vue-tsc`. `typescript` 7.0.2 es el «latest» de npm y **no se adopta**: ya no trae `lib/typescript.js` (solo `lib/version.cjs` y APIs «unstable»), que `vue-tsc` necesita (comprobado en T-04). Se usa `~5.9.3`. | Plan |
| **RNF-12** | `ssr: true` siempre (nunca `false`) y `nuxt generate`. | AC-01 |

---

## 7. Versionado

Objetivo: cualquier visitante ve v1, v2… y la más reciente.

| ID | Requisito |
|---|---|
| **RV-01 v1 congelada** | Tag `v1.0.0` y rama `release/v1` (ya existen y están alineadas; no se tocan). Se despliega en un **segundo sitio de Netlify** con rama de producción `release/v1` y dominio `v1.ilmarlopez.com`. Como la rama no tiene `netlify.toml`, los ajustes van en el sitio: comando de build y directorio de publicación (`dist`, por verificar), `NODE_VERSION` (por verificar entre 18 y 22; el CI antiguo usaba 18) y gestor de paquetes según `yarn.lock`. La zona DNS ya está en Netlify DNS (según el prompt, sin verificar aún), así que Netlify debería poder crear el registro de `v1` al añadir el dominio (por verificar). Esto se puede hacer **antes** de publicar v2 y no afecta al apex. |
| **RV-02 Aviso de archivo** | No se toca `release/v1`. Opciones: (A) inyección de snippet de Netlify en el sitio v1, sin tocar la rama (por verificar que la función esté disponible en el plan), (B) un PR de Ilmar a `release/v1`, o (C) sin aviso, porque `/versions` y el footer de v2 ya enlazan. Recomendado: A si existe, si no C. Ver Q8. |
| **RV-03 Desarrollo de v2** | Rama `v2`, con *branch deploys* explícitos para `v2` y Deploy Previews en cada PR hacia `v2` (por verificar en el primer PR que Netlify genera previews para PRs que no apuntan a la rama de producción). El sitio principal de Netlify toma `main` como producción y recibe el dominio `ilmarlopez.com` solo en el lanzamiento. Mientras `main` conserve v1, un build de producción de `main` es inofensivo porque el DNS sigue apuntando a GitHub Pages. |
| **RV-04 Lanzamiento** | Lo ejecuta Ilmar. (1) Merge del PR `v2 → main`. (2) Build de producción verificado en la URL `*.netlify.app`. (3) Bajar el TTL de los registros un día antes. (4) Añadir `ilmarlopez.com` y `www.ilmarlopez.com` y, en un solo paso, reemplazar los registros A del apex y el CNAME de `www` que hoy apuntan a GitHub Pages por los de Netlify (se listan primero con `dig`; no asumo cuántos hay). **No se tocan MX, TXT (SPF/DKIM/DMARC) ni ningún otro registro de `privateemail.com`**; se guarda una instantánea de `dig` antes y después. (5) Verificar HTTPS y el certificado. (6) Mantener GitHub Pages activo 24–48 h como *rollback* y después desactivarlo (Settings → Pages) y, si Ilmar quiere, eliminar la rama `gh-pages`. (7) El tag `v2.0.0` lo crea Ilmar, no el agente. Se documenta también el *rollback*: restaurar los A y el CNAME originales. |
| **RV-05 `/versions`** | Datos en `app/data/versions.ts` con tipo `Version { id, label, status: 'current' \| 'archived', date, stack, url, screenshot: { src, width, height, alt } }`. Capturas con Playwright a 1440×900 en claro: v1 desde el sitio actual y v2 desde el Deploy Preview, en `public/img/versions/`. Fechas: **`TODO(ilmar)`**. Para v1 solo se conoce la fecha del tag (2026-04-12), no la de publicación. El stack de v2 y el texto de la tarjeta «This portfolio» solo afirman tecnologías presentes en `package.json` al cierre (ver AC-24). |
| **RV-06 Proceso para v3** | Documentado en `docs/versioning.md`: (1) Ilmar crea el tag `v2.0.0` en `main`. (2) Crear `release/v2` desde ese tag. (3) Nuevo sitio de Netlify en `release/v2`: como v2 sí tiene `netlify.toml`, el sitio se autoconfigura. (4) Dominio `v2.ilmarlopez.com`. (5) En `main`: dar de alta v3 en `versions.ts` y pasar v2 a `archived` con su URL. (6) Ilmar crea el tag `v3.0.0`. Los sitios archivados no se actualizan: su `/versions` muestra solo las versiones que existían entonces, y eso es por diseño. |
| **RV-07 Guardrails** | Nunca commits directos a `main`; `release/*` y los tags son de solo lectura; sin `push --force` ni reescritura de historial; el agente no crea tags. Se recomienda a Ilmar activar *rulesets* de GitHub para `main`, `release/*` y tags. |
| **RV-08 Variables de entorno** | `NUXT_PUBLIC_WEB3FORMS_KEY` en Netlify para los contextos *production*, *deploy-preview* y *branch-deploy*. Como el sitio es estático, la clave debe estar presente **en build**. `.env.example` con la variable vacía (el `.gitignore` ya admite `!.env.example`). |

---

## 8. Arquitectura

### 8.1 Decisiones de stack (cambios respecto al prompt, justificados)

| Tema | Prompt | Esta spec | Por qué |
|---|---|---|---|
| Nuxt | 4.6.x | **4.7.0** (instalada, última estable hoy) | Verificado con npm. Exige Node ≥ 22.22.3. |
| Render | `ssr: true` + `nuxt generate` | Igual | Evita el error de v1. |
| Tailwind | v4 por `@tailwindcss/vite` | Igual (4.3.5), registrado en `vite.plugins` | Guía oficial. |
| GSAP | Timelines y tipografía cinética | **Acotado a la pila de Work (Q4), y solo si hace falta.** El prototipo `f/` resuelve M-10 y M-11 con transiciones CSS | La referencia es CSS casi por completo. Ver R6, Q4 y Q11. |
| Lenis | Smooth scroll | **No se incluye (propuesta, Q5)** | El vuelo ya suaviza el scroll con su propio amortiguamiento; sumar Lenis duplicaría el suavizado y se sentiría con retraso. Las anclas usan `scroll-behavior: smooth`. |
| `motion-v`, shader, `@nuxtjs/seo`, `@nuxt/content`, `NuxtIsland` | Opcionales | **No se usan** | Nada los necesita. `hydrate-never` sustituye a las islas. El contenido es pequeño y tipado en `app/data/*.ts`. |
| Sitemap | Opcional | Archivo estático de 2 URLs | Un módulo no se justifica para 2 rutas. |

### 8.2 Configuración (validada en T-05)

```ts
// nuxt.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: true,
  modules: ['@nuxt/fonts', '@nuxt/image'],
  css: ['~/assets/css/main.css'],
  components: [{ path: '~/components', pathPrefix: false }],
  vite: { plugins: [tailwindcss()] },
  experimental: { viewTransition: true, prerenderErrorPages: true },
  prerender: { crawlLinks: true, routes: ['/', '/versions'] },
  runtimeConfig: { public: { web3formsKey: '' } },
})
```

**Ajustes de T-05, validados contra Nuxt 4.7 y Context7:** `prerender` va en el primer nivel porque `nitro.prerender.{routes,ignore,crawlLinks}` está obsoleto; `/200.html` y `/404.html` no hacen falta en `routes` (`nuxt generate` los emite); `css` se añade en T-07, cuando existe `main.css`; `/versions` entra a `routes` en T-43, cuando existe la página; y `viewTransition: true` (no `'always'`) respeta `prefers-reduced-motion`. `nuxt generate` ya prerenderiza las rutas descubiertas. `routeRules: { '/**': { prerender: true } }` queda como red de seguridad opcional. Por defecto `404.html` sale como un cascarón vacío, por eso se activa `prerenderErrorPages` (Context7). Salida: `dist` en Netlify.

### 8.3 Estructura de carpetas

```
app/
  app.vue                      # NuxtLayout + NuxtPage + NuxtRouteAnnouncer
  error.vue                    # RF-16
  layouts/default.vue
  pages/index.vue · versions.vue
  assets/css/main.css · tokens.css · base.css
  components/
    layout/    SiteNav · SiteFooter · ThemeSwitch · SkipLink
    journey/   JourneyFlight · HeroCopy · RoleCard · RoleTimeline · DepthRuler
    sections/  AboutSection · WorkSection (+ WorkInspector, WorkStack) · ToolsSection · ContactSection
    dialogs/   HiDialog · CommandPalette
    ui/        BaseButton · TextLink · CvLink
    versions/  VersionEntry
  composables/ useTheme · useHiDialog · useCommandPalette · useReducedMotion
  data/        profile · experience · projects · tools · socials · cv · versions · commands
  plugins/     actions.client.ts · journey.client.ts · page.client.ts (indicador de la nav y reveal) · gsap.client.ts solo si se usa (Q4)
  utils/       seo.ts (constructor del JSON-LD)
public/        _headers · sitemap.xml · robots.txt · og.png · img/versions/*
docs/          versioning.md
specs/001-portafolio-v2/   spec.md · plan.md · tasks.md
```

El contenido vive en archivos de datos tipados y no en `@nuxt/content`. Las páginas no llevan lógica de negocio.

### 8.4 Estrategia de hidratación

Idea central: casi todo es HTML estático. Las acciones se resuelven con un único *listener* delegado (`actions.client.ts`, atributos `data-action`), de modo que ni el hero ni Contact necesitan hidratarse.

| Pieza | Render | Hidratación | Motivo |
|---|---|---|---|
| `SiteNav` + `ThemeSwitch` | SSR | Normal (diminutos) | El interruptor debe responder pronto; los enlaces son anclas simples. |
| `HeroCopy` | SSR | `hydrate-never` | Estático. «Say hi» es un `mailto:` mejorado por `data-action`. M-01 es CSS. |
| `JourneyFlight`, `RoleCard`, `RoleTimeline`, `DepthRuler` | SSR | `hydrate-never` | Marcado estático: lista legible. `journey.client.ts` construye la gráfica y las cifras con DOM plano en `onNuxtReady` cuando hay JS, y añade la clase `flight` y el rAF del vuelo solo sin reduced-motion. |
| `AboutSection`, `ToolsSection`, `ContactSection`, `SiteFooter` | SSR | `hydrate-never` | Estáticos. |
| `WorkSection` | SSR | `hydrate-on-visible` (`rootMargin: 200px`) | Es lo único del home con estado. La pila es CSS; GSAP solo si hace falta (Q4). |
| `HiDialog` | Cliente, bajo demanda | `v-if` al primer pedido, con precarga en `pointerenter` del disparador | No pesa en la carga inicial. |
| `CommandPalette` | Cliente, bajo demanda | Al primer atajo | Mismo motivo. |
| `/versions` | SSR | `hydrate-never` | Estática. |

Los componentes `Lazy*` con `hydrate-never` y `hydrate-on-visible` están confirmados en la documentación de Nuxt (Context7). Un componente `hydrate-never` no puede contener hijos que se hidraten, por eso el `ThemeSwitch` va en un `SiteNav` que sí hidrata.

---

## 9. Criterios de aceptación

Cada criterio indica a qué cubre. Las medidas de rendimiento se toman sobre el Deploy Preview.

**Contenido y render**

- **AC-01 (RF-01, RNF-12, O-4).** *Dado* `npm run generate`, *cuando* se inspecciona `dist/index.html`, `dist/versions/index.html` y `dist/404.html`, *entonces* cada uno contiene su `h1` y el contenido de la página, y ninguno es un `<div id="__nuxt">` vacío.
- **AC-02 (RNF-07, RF-03, RF-07, RF-10).** *Dado* JavaScript desactivado a 1280×800, *cuando* se carga `/`, *entonces* se ven titular, frase y acciones; «Say hi» abre el cliente de correo (`mailto:`); Experience muestra los 4 roles como lista legible con periodo y duración en texto; Work muestra los 4 proyectos como lista legible sin texto encimado; el tema sigue al sistema.
- **AC-03 (RF-03, RF-04).** *Dado* viewports de 360, 768, 1280 y 1920 px, *cuando* se carga `/`, *entonces* no hay scroll horizontal (`scrollWidth === clientWidth`), a 1280×800 titular, frase y acción primaria quedan completos dentro del viewport, y a 1920 px el contenedor sigue en 1440 px con márgenes mayores.

**Interacción y accesibilidad**

- **AC-04 (RF-02, RF-07, RF-10, RF-13).** *Dado* solo teclado, *cuando* se recorre la página, *entonces* el orden de foco es lógico y todo control muestra un anillo de foco visible al instante; el skip link aparece con foco; los tabs responden a flechas, Home y End; «Say hi» atrapa el foco, Esc lo cierra y el foco vuelve al disparador; ⌘K y Ctrl+K abren la paleta y flechas, Enter y Esc funcionan.
- **AC-05 (M-01…M-19).** *Dado* `prefers-reduced-motion: reduce`, *cuando* se carga `/`, *entonces* `document.getAnimations()` no devuelve animaciones en curso; no existe la clase `flight` y los roles son una lista estática con las cifras finales; las barras de la gráfica están dibujadas; la pila de Work se ve abierta y sus paneles cambian sin transición; el reveal no se aplica; Nuxt omite la transición de página.
- **AC-06 (RF-12).** *Dado* un tema guardado o la preferencia del sistema, *cuando* se recarga, *entonces* `data-theme` está aplicado antes del primer pintado (sin parpadeo) y con el sistema en oscuro y sin preferencia guardada la capa superior de la pila de Work usa el valor oscuro de `--scene-soft-top` (cubre el defecto B1).
- **AC-07 (RF-10).** *Dado* la clave configurada y la ruta de Web3Forms simulada en Playwright (sin enviar correos reales), *cuando* se envía un formulario válido, *entonces* se hace `POST` JSON a `https://api.web3forms.com/submit` con `access_key`, honeypot y `subject`, y se muestra el estado de éxito. *Cuando* la respuesta falla, se conservan los datos y aparece el `mailto`. *Cuando* un campo es inválido, se marca `aria-invalid` con su mensaje. *Sin* clave, Enviar está deshabilitado.
- **AC-08 (RF-11).** *Dado* el Deploy Preview, *cuando* se pide `/files/Ilmar-Lopez-CV.pdf`, *entonces* responde 200 con `application/pdf`; el enlace del hero y el de Contact apuntan a él; y `/files/cv-en.pdf` responde 301 hacia él. *Dada* una segunda entrada en `cv.ts`, el componente muestra un menú sin cambios de código.
- **AC-09 (RF-13).** *Dada* la paleta abierta, *cuando* se escribe, *entonces* se filtran los comandos y cada comando de RF-13 ejecuta su acción.
- **AC-10 (RF-16).** *Dado* el Deploy Preview, *cuando* se pide una URL inexistente, *entonces* responde 404 con el texto de la página 404 y `noindex`.
- **AC-11 (RF-14, RF-15, RV-05).** *Dado* `/versions`, *cuando* se carga, *entonces* lista v2 (current) y v1 (archived) con fecha, stack, captura y enlace, y el enlace de v1 resuelve a `https://v1.ilmarlopez.com` con 200. El footer muestra «All versions» y «Version 1, archived».
- **AC-26 (RF-04, RF-03).** *Dado* JS y sin reduced-motion a 1440×900, *cuando* se recorre el vuelo en p = 0, 0.25, 0.5, 0.75 y 1, *entonces* en cada estación exactamente un plano recibe puntero y foco (`tabIndex`), la regla de profundidad marca ese rol y no hay scroll horizontal. A 375×812, 360×800 y 390×844 la tarjeta de fondo no solapa el texto del hero (a 375×667 y 360×740 puede asomar bajo la nav, ver 10.4), y «Say hi» del hero abre el diálogo.
- **AC-27 (RF-06, RF-11).** *Dadas* las 4 tarjetas, *cuando* se llega a cada una, *entonces* la duración coincide con el conteo inclusivo de meses (Stori: 5 años 2 meses en noviembre de 2026; Home & Media: 4 años 2 meses; California: 4 meses) y la cuenta ocurre una sola vez; sin JS se ve el texto estático; la gráfica muestra los 3 roles con el de la tarjeta en tinta, los años cada 2 (cada 3 en teléfono) y la línea de hoy; solo el título de Stori enlaza, a `https://www.storicard.com/` con `target="_blank"` y `rel="noopener"`.
- **AC-28 (RF-07).** *Dados* 12 anchos de 320 a 1920 px y los 4 proyectos de Work, *cuando* la pila está abierta, *entonces* ninguna etiqueta ni el diamante quedan fuera de su escenario ni del viewport (margen ≥ 0 px, medido con rangos de texto).

**Rendimiento y calidad**

- **AC-12 (RNF-01, RNF-02).** *Dado* el Deploy Preview, *cuando* se corre Lighthouse móvil 5 veces en `/` y `/versions`, *entonces* la mediana es ≥ 95 en las 4 categorías, LCP < 1.5 s y CLS < 0.05. El INP medido con interacciones reales (clic en un tab, abrir «Say hi», cambiar el tema) es < 200 ms.
- **AC-13 (RNF-03).** *Dada* la carga inicial de `/`, *cuando* se suman los scripts pedidos antes de cualquier scroll o interacción, *entonces* el total es ≤ 120 KB gzip, y los chunks de Work, diálogo y paleta (y GSAP si se usa) no aparecen en la red hasta su disparador.
- **AC-14 (RNF-04).** *Dada* `me.jpg` en uso, *cuando* se inspecciona la red, *entonces* se sirve en AVIF o WebP, ya redimensionada, con `width` y `height` explícitos y sin CLS. Si va en About lleva `loading="lazy"`.
- **AC-15 (RNF-05).** *Dado* axe-core en Playwright, *cuando* se analizan `/`, `/versions` y 404 en claro y oscuro, *entonces* hay 0 violaciones serias o críticas. Revisión manual de contraste (incluido el texto de error en oscuro), tamaño de objetivo, foco no oculto por la nav sticky, orden de encabezados y alternativa de texto del vuelo.
- **AC-16 (RF-18).** *Dado* el HTML de cada ruta, *cuando* se inspecciona, *entonces* están `title`, `description`, canonical, OG y Twitter; `og:image` responde 200 y mide 1200×630; el JSON-LD se parsea y contiene `jobTitle: "Senior Software Engineer"` y `worksFor.name: "Stori"`; `sitemap.xml` y `robots.txt` responden 200; 404 lleva `noindex`.

**Fidelidad, motion y herramientas**

- **AC-17 (O-5).** *Dado* el sitio en local con `npm run dev`, *cuando* se corre `/hallmark audit app/` y `node .agents/skills/hallmark/scripts/sloplint.mjs app --render --url http://localhost:3000/`, *entonces* hay 0 FAIL, 0 REFLEX y 0 WARN (o cada REFLEX queda justificado por escrito). **Fidelidad visual:** con reduced-motion activo, capturas de la referencia (`design/hallmark/f`) y del port por sección, en claro y oscuro, a 375 y 1440 px, no difieren en más de un umbral de píxeles. El umbral inicial propuesto es 2 % y se calibra en la primera sección portada y se registra.
- **AC-18 (sección 5).** *Dado* el cambio terminado, *cuando* se corre `/review-animations`, *entonces* no quedan hallazgos pendientes, y cada fila M-xx se verificó contra la tabla.
- **AC-19 (opcional).** *Dado* `dist`, *cuando* se corre `npx impeccable detect dist` (solo el CLI; sin instalar la skill ni los hooks), *entonces* no quedan hallazgos sin resolver o están ignorados con justificación.
- **AC-20 (RF-17, RNF-08).** *Dado* Chromium, *cuando* se navega `/` ↔ `/versions`, *entonces* se dispara una View Transition y la nav no hace *crossfade*. En un navegador sin soporte la navegación es instantánea y sin errores en consola.
- **AC-21 (RF-20).** *Dado* un escritorio sin reduced-motion, *cuando* se hace scroll con rueda, *entonces* el scroll es nativo (no hay Lenis) y la cámara del vuelo sigue al scroll sin retraso perceptible (el INP no empeora); los diálogos desplazan su contenido sin arrastrar la página; los enlaces de la nav dejan el encabezado visible bajo la nav sticky; y «Experience» lleva al primer rol.

**Versionado, repo y contenido**

- **AC-22 (RV-01…RV-04).** *Dado* el lanzamiento, *cuando* se verifica, *entonces* `git rev-parse v1.0.0^{commit}` sigue igual a `origin/release/v1`; `https://v1.ilmarlopez.com` sirve la build de `release/v1`; los registros MX y TXT de `dig` son idénticos antes y después; `ilmarlopez.com` resuelve a Netlify con HTTPS válido; y GitHub Pages queda desactivado (`gh api repos/IlmarLopez/ilmarlopez.github.io/pages` devuelve 404).
- **AC-23 (RV-07).** *Dado* el historial, *cuando* se revisa, *entonces* no hay commits a `main` ni a `release/*`, el agente no creó tags, `.github/workflows/cd.yml` no existe, y los 4 assets protegidos están presentes.
- **AC-24 (RF-19, RNF-09).** *Dado* `dist`, *cuando* se busca con `rg`, *entonces* no aparecen Countly, `axios`, `api.ilmarlopez.com`, WhatsApp, Facebook ni Twitch; no hay proyectos internos de empleadores; solo hay repos públicos verificados; no hay métricas, clientes ni testimonios inventados; y la tarjeta «This portfolio» y `versions.ts` solo mencionan tecnologías presentes en `package.json` (en la referencia dice «GSAP motion»).
- **AC-25 (RNF-10, RV-08).** *Dado* el repo y `dist`, *cuando* se inspeccionan, *entonces* existe `public/_headers` con caché inmutable en `/_nuxt/*`, y la clave de Web3Forms no aparece en el repo; solo en las variables de Netlify.

---

## 10. Riesgos y preguntas abiertas

### 10.1 Choques entre el prompt y la referencia (gana la referencia)

| ID | Choque | Resolución |
|---|---|---|
| **R1** | El prompt pedía una sección de «áreas de expertise»; la referencia trae «Selected work» con 4 repos públicos (decisión posterior de Ilmar de no mencionar proyectos internos). | Se sigue la referencia. Los 4 repos se verificaron públicos. Las 6 áreas del prompt quedan cubiertas por About, Experience y Tools. |
| **R2** | El sello del CSS de la referencia dice que la foto va «en About», pero `index.html` no la incluye. | Ver Q1. |
| **R3** | El prompt usaba «Hi 👋, I’m…»; la referencia saluda sin emoji («Hi, I’m Ilmar Lopez.»). | Sin emoji (Floor 11). |
| **R4** | El texto de la referencia no repite «reducción de costos y automatización» ni «migración de Python a Go» del prompt. | Se conserva el copy de la referencia. Si lo quieres de vuelta, se añade a la fila de Stori. |
| **R5** | El prompt contemplaba un fondo shader opcional. | No se incluye (ver sección 1). |
| **R6** | El prompt pide GSAP «para timelines y tipografía cinética». La referencia casi no los necesita: el hero, el vuelo, las tarjetas, los subrayados y los diálogos son CSS y un script de DOM plano. | GSAP queda como opción solo para M-10 y M-11 si el port a CSS no cumple (el prototipo `f/` los resuelve con transiciones CSS, y no usa SplitText ni ScrollTrigger). Ver Q4 y Q11. |
| **R7** | `frontend.mdc` dice «solo `transform`, `opacity`, `filter` y `clip-path`», pero la referencia hace transiciones de pintura en botones y enlaces. | Se permiten las de pintura para feedback de hover (≤ 220 ms). Se sugiere enmendar `frontend.mdc`. |
| **R8** | `frontend.mdc` y el prompt dan por hecho una foto en el hero con `fetchpriority="high"`; la referencia no tiene foto en el hero. | Si la foto va en About, es `lazy`. |
| **R9** | El botón «View CV» de la referencia lleva el atributo `download`: la etiqueta dice «ver» y el comportamiento es descargar. | Ver Q2. |
| **R10** | En ≤ 60 rem la nav oculta los enlaces. | Se acepta: es una sola página y el wordmark vuelve al inicio. |
| **R11** | El prototipo aprobado `f/` sustituye el hero de la referencia `d/` («Live System», escena isométrica con paquetes) por el vuelo «Depth is time», y rediseña tarjetas, «Say hi» y la coreografía. | Gana `f/`, aprobado por Ilmar el 2026-11-24. `design.md` se reescribió en consecuencia. |

### 10.2 Defectos de la referencia (se corrigen en el port)

| ID | Defecto | Corrección |
|---|---|---|
| **B1** | El bloque `@media (prefers-color-scheme: dark)` de `tokens.css` no incluye `--scene-soft-top`. Con el sistema en oscuro y sin interruptor, la capa superior de la pila de Work quedaría en azul claro sobre fondo oscuro. `design.md` sí lo lista para oscuro. | Completar con `light-dark()` o con bloques completos (sección 4.5). AC-06. |
| **B2** | El inspector de Work depende de JS. Los paneles 2–4 llevan `hidden`, los tabs no hacen nada sin JS y la pila arranca colapsada, de modo que sus etiquetas se encimarían (por verificar con JS desactivado). Esto contradice el Floor 7. | Sin JS: lista con los 4 proyectos y pila abierta. Con JS el resultado visual no cambia. AC-02. |
| **B3** | La tabla de tokens de `design.md` omite `--color-accent-ink`, `--color-field-ink` y `--color-field-muted`. | Se transcriben de `tokens.css`. `design.md` se reescribió con la aprobación de `f/`; añadir estos tres tokens requiere la tuya (Q3). |
| **B4** | `base.css` define `.container`, que choca con la utilidad de Tailwind. | Se renombra a `.site-container`. |
| **B5** | Hanken Grotesk se carga en 400 y 600, pero `.tile .label span` pide peso 500. | Fuentes variables con `@nuxt/fonts`. |
| **B6** | `--color-error` y `--color-success` no tienen versión oscura. | El diseño aprobado no los usa: el texto de error usa `--color-error-text`, que sí tiene versión oscura (oklch 76 % 0.15 27). No se portan. Verificar ≥ 4.5:1 con axe (AC-15). |
| **B7** | En el inspector de Work, `.plate .tag` se ancla con `top: 50%`, que tras la rotación cae sobre la esquina superior de la capa y no sobre su vértice derecho. Medido a 1440 px en los 4 proyectos (12 etiquetas): cada etiqueta queda unos 80 px por encima del vértice y su línea guía flota sin tocar la capa. «AWS» queda más cerca de la capa superior que de la suya. Detectado en la revisión de Ilmar, 2026-11-24. | Anclar al vértice derecho: `left: 100%; top: 100%; transform-origin: 0 0; transform: rotateZ(42deg) rotateX(-58deg) translateY(-50%)`, con la línea guía saliendo del vértice hacia la derecha (`left: 0`, ancho `0.3 × --pu`). Probado con CSS inyectado a 1440 px: distancia vertical al vértice 0 en 12 de 12 etiquetas, y la etiqueta más larga termina a 10 px del borde de la columna. Falta verificar 1280, 1024, 768 y 375 px. |
| **B8** | *(Obsoleto con el hero «Depth is time»: ya no hay nodos Lambda ni etiquetas de escena.)* | — |
| **B9** | Detectado por Ilmar en móvil el 2026-11-24: en la pila de Work las etiquetas se cortaban en el borde derecho («CI/», «Pyt», «Clo», «AWS»). La pila medía 10 rem fijos y el conjunto (diamante, guía y etiqueta más larga de 126 px) necesita unos 417 px, contra 288 a 358 px de escenario. A 1000 px de ancho (dos columnas) el texto se salía 118 px. | Corregido en `f/`: la pila se dimensiona con el ancho del escenario con unidades de contenedor y se centra en una columna; en escritorio conserva su tamaño y lugar mientras quepa. Medido en 12 anchos y 4 proyectos (AC-28). |

### 10.3 Superficies sin referencia visual

`/versions`, 404, la paleta ⌘K, el *skip link*, el menú de CV (cuando haya más de un idioma), **About con foto** (Q1) y la pista de ⌘K del footer (Q6). **Hallmark no las ha diseñado.** Q3 autorizó una pasada de Hallmark en alcance de componente para todas ellas, guardada en `design/hallmark/e/` y volcada a `design.md` solo tras tu aprobación. Esa pasada es un requisito previo de las tareas que portan cada pieza. Los estados del diálogo «Say hi» (enviando, éxito y error) y la gráfica de tiempo ya los diseñó `design/hallmark/f/`.

### 10.4 Riesgos técnicos

| Riesgo | Mitigación |
|---|---|
| El presupuesto de 120 KB gzip es desconocido hasta la primera build (Vue, router y runtime de Nuxt ya ocupan una parte). | Se mide en la primera tarea; hidratación diferida; `hydrate-never` en casi todo. |
| Lenis y el suavizado propio de la cámara se sumarían y el scroll se sentiría con retraso. | No se incluye (Q5). |
| Rendimiento del vuelo en móviles de gama baja (`perspective`, `preserve-3d` y variables CSS actualizadas por fotograma) y diferencias de Safari. | CPU 4× en Chrome; el rAF se detiene al llegar al objetivo y no hay trabajo fuera de viewport; `will-change` solo de forma puntual. Se prueba en un iPhone real o en Safari antes del lanzamiento. |
| La duración estática (sin JS) se calcula en build y queda vieja con el tiempo; el script la recalcula. | AC-27 la comprueba con JS; sin JS es un texto aproximado y se acepta. |
| En 375×667 y 360×740 la tarjeta de fondo del hero asoma unos 30 px bajo la nav (cosmético; no toca el texto). Es peor en 320×568. | Se acepta. Si molesta, ocultar el resumen de la tarjeta solo en esas alturas. |
| `--tag` fija el ancho de la etiqueta más larga de la pila de Work. | Se actualiza al añadir una etiqueta más larga; AC-28 lo detecta. |
| La animación del hero (opacidad desde 0) puede retrasar el LCP del `h1`. | Medir con y sin M-01; si cuesta más de 100 ms, el `h1` anima solo `transform`. |
| El script inline del tema complica una CSP estricta. | CSP queda opcional (RNF-10). |
| Node local 20.16.0 no cumple los `engines` de Nuxt 4.7. | `.nvmrc` y `engines` en 22.22.3 o superior; el desarrollador debe actualizar su Node. |
| Build del sitio v1 en Netlify (Nuxt 3.7, `yarn.lock`, Node). | Primer deploy de prueba; plan B con Node 18. |
| Deploy Previews para PRs hacia `v2` (no es la rama de producción). | Verificar en el primer PR y, si hace falta, añadir `v2` como rama de despliegue. |
| Web3Forms: spam y límites del plan gratuito. | Honeypot; el `mailto` queda siempre como alternativa. |
| La tarjeta «This portfolio» promete «GSAP motion» y lista GSAP en su pila. Si GSAP no se instala, el texto cambia (Q11). | AC-24 la valida contra `package.json`. |

### 10.5 Preguntas para Ilmar

**Decididas por Ilmar el 2026-11-24 (Q1 a Q4).** Q5 a Q10 no se han contestado: se aplica el valor *Recomendado* de cada una, salvo la Q9 (fechas, sigue en `TODO(ilmar)`) y la Q10(a) (el PDF no se commitea sin tu confirmación explícita).

1. **Q1. Foto. Decidido: en About**, optimizada y con `lazy`. La composición la define la pasada de Hallmark (10.3).
2. **Q2. «View CV». Decidido:** sin `download`, el PDF se abre en una pestaña nueva.
3. **Q3. Ampliar la referencia. Decidido: sí**, con una pasada de Hallmark en alcance de componente (10.3) antes de portar esas piezas. `design.md` solo se amplía tras tu aprobación de esa pasada.
4. **Q4. Alcance de GSAP. Decidido: acotado** a la pila de Work (R6), cargado de forma diferida. SplitText y ScrollTrigger quedan fuera de 2.0. *Novedad:* el prototipo `f/` resuelve la pila con CSS, así que GSAP solo se instala si el port no cumple (ver Q11).
5. **Q5. Lenis.** **Decidido por Ilmar el 2026-11-24: no se incluye.** El vuelo ya suaviza el scroll (≈ 90 ms) y Lenis lo duplicaría. Antes la recomendación era incluirlo con interruptor.
6. **Q6. Descubribilidad de ⌘K.** *Recomendado:* una nota discreta en el footer solo con puntero fino. Alternativa: sin pista.
7. **Q7. Analítica.** *Recomendado:* ninguna en 2.0. Alternativa posterior: Umami autoalojado (tu repo `umami-cloud-go`), sin cookies.
8. **Q8. Aviso en v1.** *Recomendado:* inyección de snippet de Netlify si el plan la ofrece; si no, sin aviso.
9. **Q9. Fechas de `/versions`.** Necesito la fecha de publicación de v1 y la de v2 (hoy `TODO(ilmar)`; solo conozco la fecha del tag de v1, 2026-04-12).
10. **Q10. Árbol de trabajo.** (a) El CV ya se llama `Ilmar-Lopez-CV.pdf` (lo renombraste tú). **Decidido el 2026-11-24: se commitea como tu CV nuevo en un commit aparte (T-03).** Git lo ve como `cv-en.pdf` borrado y un archivo nuevo; el redirect protege el nombre viejo. (b) Añadir `.playwright-mcp/` y `.tmp/` al `.gitignore`. (c) Commitear `design.md` y `design/` en el primer PR de `feat/*`. No he commiteado nada.
11. **Q11. GSAP y la tarjeta «This portfolio».** **Decidido por Ilmar el 2026-11-24: no instalar GSAP y cambiar el texto de la tarjeta.** La tarjeta de Work lista «Nuxt, Tailwind, GSAP» y una capa «GSAP motion». *Recomendado:* no instalar GSAP y cambiar ese texto a lo que sí se usa (por ejemplo «Nuxt, Tailwind, CSS motion»). Alternativa: instalar GSAP solo para la pila de Work. AC-24 exige que el texto coincida con `package.json`.
12. **Q12. Título del PDF.** Los metadatos de `Ilmar-Lopez-CV.pdf` no tienen título (la pestaña mostrará el nombre del archivo). Al exportarlo, ponle «Ilmar Lopez, Senior Software Engineer, CV».

### 10.6 Fuentes consultadas

Context7: Nuxt (hidratación diferida, `experimental.viewTransition`, prerender y `404.html`), Tailwind CSS v4 (`@theme static`, modo oscuro por atributo, `@tailwindcss/vite`) y Lenis (integración con el ticker de GSAP, `scrollTo`, `data-lenis-prevent`, `destroy`). `npm view` y `gh repo view` para versiones y repos. `release/v1` y los tags con `git`. Skill `emil-design-eng` para las reglas de frecuencia y de teclado.

**Por verificar con la documentación en cuanto se use:** los campos de Web3Forms (`subject`, `botcheck`), la sintaxis exacta de `--color-*: initial` dentro de `@theme static` y `light-dark()` con los modificadores de opacidad de Tailwind.


### 10.7 Cambios tras aprobar el prototipo `f/` (2026-11-24)

- **Hero.** «Live System» (escena isométrica con paquetes) sale; entra el vuelo «Depth is time» (RF-03, RF-04, M-02, M-03). Desaparecen la inclinación con el puntero y los paquetes (antes M-02 y M-03).
- **Experience.** Tarjetas «hoja de dibujo» con estado, lectura, duración que cuenta y gráfica de tiempo; enlace solo en Stori (RF-06, M-18, M-19, AC-27).
- **Say hi.** Rediseñado: llegada desde atrás, éxito en profundidad, progreso coral, hoja en teléfono (RF-10, M-12).
- **Coreografía.** Nuevos: cambio de tema con crossfade (M-07), cambio de panel en Work (M-09), reveal (M-15), anclas suaves nativas (M-16), indicador de la nav (M-17).
- **Work.** La pila se dimensiona a su escenario (RF-07, B9, AC-28).
- **CV.** Archivo renombrado a `Ilmar-Lopez-CV.pdf`, redirect 301 del nombre viejo y enlace «CV · PDF, 1 page» en Contact (RF-09, RF-11, AC-08).
- **Propuestas que necesitan tu decisión.** Sin Lenis (Q5) y sin GSAP, con el texto de «This portfolio» cambiado (Q11).
- **Accesibilidad.** Solo el plano frontal recibe foco; los enlaces de los demás quedan fuera del orden de tabulación (RF-04, AC-26).