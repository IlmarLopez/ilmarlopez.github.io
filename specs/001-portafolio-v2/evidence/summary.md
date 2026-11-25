# Evidencia de la v2

Aquí se registran los resultados medidos y las decisiones que salen de ellos, con la fecha y el comando que los produjo. Los JSON crudos (Lighthouse, trazas, `js-weight.json`) van a `.tmp/`, que no se commitea. Una fila vacía dice **Pendiente** y nombra la tarea que la llena: nada se rellena con estimaciones.

Los KB son de 1000 bytes, como en las DevTools.

## 1. Línea base de JS (T-12)

| | |
|---|---|
| Fecha | 2026-11-24 |
| Commit | `abbc7e0` (rama `feat/foundation`), app vacía |
| Comando | `npm run generate && npm run verify:js` |
| Medida | Suma gzip (nivel 9) de los scripts que `/` pide antes de cualquier scroll o interacción (O-3, AC-13) |
| Resultado | **73,4 KB gzip** (198,3 KB sin comprimir), 4 scripts |
| Presupuesto | 120 KB gzip |
| Margen | **46,6 KB** para todo el sitio |

| Script | gzip KB | sin comprimir KB |
|---|---:|---:|
| `/_nuxt/YAQf9bLp.js` (entrada: Vue, router y runtime de Nuxt) | 72,9 | 197,8 |
| `/_nuxt/DLUFzUio.js` | 0,2 | 0,3 |
| `/_nuxt/uxCnbWQw.js` | 0,2 | 0,2 |
| `/_nuxt/BmP83cE4.js` | 0,1 | 0,1 |

Más 388 bytes de código inline en 3 scripts (el import map, el script del tema y la configuración de Nuxt). La medida cruzada con `gzip -9` sobre los archivos de `dist/` da los mismos valores (72 873 bytes la entrada).

**Lectura.** El runtime ya ocupa el 61 % del presupuesto, así que el margen real para el hero, el vuelo, Work y el resto es de unos 46 KB, y el diseño debe sostenerse con `hydrate-never` y sin librerías de animación (Q5 y Q11 ya lo cumplen). El gate es T-33: si la home ensamblada pasa de 120 KB, se detiene el trabajo y se proponen opciones.

## 2. Suites automáticas (T-11)

`npm run verify` corre todas contra `dist/` (o contra `VERIFY_BASE`). Cada suite es hoy la primera rebanada de la tarea que la completa.

| Suite | Criterio | Cubre hoy | La completa |
|---|---|---|---|
| `verify:selftest` | arnés | una aserción incorrecta falla con *expected* y *received*; el servidor responde 200, 404 con `404.html` y rechaza `/../` | |
| `verify:theme` | AC-06, B1 | 6 escenarios de tema guardado y sistema, estado de `<html>` al insertar la hoja de estilos, fondo pintado | T-64 |
| `verify:nav` | RF-02, RF-12, M-07 | sticky; 4 enlaces a 1280 px; solo wordmark e interruptor a 768 y 360 px; ciclo del tema con recarga en sistema claro y oscuro; crossfade con respaldo; reduced-motion instantáneo; `theme-color` tras hidratar; sin JS | T-64 |
| `verify:layout` | AC-03 | 360, 768, 1280 y 1920 px: carga limpia y sin scroll horizontal | T-63 |
| `verify:nojs` | AC-02 | JS apagado: HTML servido, sin `js` ni `data-theme`, sigue al sistema | T-64 |
| `verify:reduced` | AC-05 | sin animaciones en curso ni clase `flight` | T-64 |
| `verify:a11y` | AC-15 | axe en `/`, claro y oscuro: 0 violaciones serias o críticas | T-65 |
| `verify:js` | AC-13 | presupuesto de 120 KB gzip (sección 1) | T-68 |
| `verify:redirects` | AC-08 | `/files/cv-en.pdf` responde 301 hacia `/files/Ilmar-Lopez-CV.pdf`, el PDF nuevo responde 200 `application/pdf` y una URL desconocida responde 404 con HTML; lee `dist/_redirects` con la precedencia de Netlify | T-47 |
| `verify:keyboard` | AC-04 | no existe aún | T-64 |
| `verify:flight`, `verify:cards`, `verify:stack` | AC-26 a AC-28 | no existen aún | T-83 |

Última corrida completa: 2026-11-24, `npm run verify` sobre un `dist/` limpio (rama `feat/sections`, T-22), 9 suites en verde. Contra el *branch deploy* en vivo (`v2` en `34bd37f`), `theme`, `layout`, `nojs`, `reduced`, `a11y` y `js` pasaron; `redirects` falló (301 esperado, 404 recibido), hallazgo de la sección 8.

## 3. Presupuesto de JS por hito

| Hito | Fecha | gzip KB | Margen | Comando |
|---|---|---:|---:|---|
| App vacía (T-12) | 2026-11-24 | 73,4 | 46,6 | `npm run verify:js` |
| App vacía con la redirección en `routeRules` | 2026-11-24 | 74,0 | 46,0 | `npm run verify:js` |
| Con SiteNav y ThemeSwitch (T-22) | 2026-11-24 | 75,5 | 44,5 | `npm run verify:js` |
| Home ensamblada (T-33) | Pendiente | | | `npm run verify:js` |
| Deploy Preview (T-68) | Pendiente | | | `VERIFY_BASE=<url> npm run verify:js` |

## 4. Lighthouse (T-68)

| Perfil | Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
| Móvil | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Escritorio | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |

## 5. Accesibilidad (T-65)

| Comprobación | Resultado |
|---|---|
| axe en `/`, `/versions` y 404, claro y oscuro | Pendiente |
| Contraste, incluido el texto de error en oscuro | Pendiente |
| Objetivos de al menos 24×24 px | Pendiente |
| Foco no oculto por la nav sticky | Pendiente |
| Orden de encabezados | Pendiente |
| Alternativa de texto del vuelo | Pendiente |

## 6. Fidelidad visual contra `design/hallmark/f/` (T-67)

| Vista | Claro | Oscuro |
|---|---|---|
| 375 px | Pendiente | Pendiente |
| 1440 px | Pendiente | Pendiente |

## 7. Dispositivos reales (T-71, Ilmar)

| Dispositivo | Resultado |
|---|---|
| iPhone, Safari | Pendiente |
| VoiceOver | Pendiente |

## 8. Hallazgos y decisiones

| Fecha | Tarea | Hallazgo | Decisión |
|---|---|---|---|
| 2026-11-24 | T-09 | Unhead es dueño de las metas `theme-color` y las reescribe al hidratar: correctas hasta `load`, revertidas después | El script inline solo aplica `data-theme` y `js`; la sincronía de `theme-color` con el tema guardado pasa a T-22 |
| 2026-11-24 | T-11 | `verify:a11y` detectó que la home no tenía `<title>` (`document-title`, WCAG 2.4.2) | Título de respaldo en `app.vue`; T-45 lo fija por ruta |
| 2026-11-24 | T-12 | El runtime de Nuxt ocupa 73,4 de los 120 KB | El margen es de 46,6 KB; se vigila en T-33 y T-68 |
| 2026-11-24 | T-13 | En el Deploy Preview del PR #9, `/files/cv-en.pdf` devolvía 404 en vez de 301. Nitro escribe `dist/_redirects` con un comodín `/* /404.html 404` y Netlify aplica `_redirects` antes que `netlify.toml`, así que la regla del toml nunca se ejecutaba. `verify:redirects` lo reprodujo en vivo | La redirección pasa a `routeRules` (Nitro la escribe antes del comodín) con `prerender: false`, y `nitro.preset: 'netlify-static'` se fija para que el `_redirects` local sea el del despliegue. Spec §8.2 y RF-11 actualizados |
| 2026-11-24 | T-13 | Con `routeRules` no vacío, Nuxt incluye en el cliente el emparejador de reglas de ruta: +0,6 KB gzip (74,0 KB en total) | Se acepta: el margen sigue en 46,0 KB y la alternativa exige código a medida sobre Nitro |
| 2026-11-24 | T-13 | Un `dist/` generado sobre un `.nuxt` y `.output` de una configuración anterior mezcló un `index.html` nuevo con assets de otra compilación (404 en el CSS y el JS de entrada) | Al cambiar `nuxt.config.ts`, borrar `.nuxt`, `.output` y `dist` antes de `npm run generate`; Netlify construye siempre desde cero |
| 2026-11-24 | T-22 | Los `@media` que reducen `--gutter` y los espacios de sección estaban en `base.css`, dentro de `@layer base`; `tokens.css` va sin capa y gana siempre, así que a 375 px el gutter seguía en 64 px. Lo destapó la nav, el primer uso de `--gutter` | Los dos `@media` pasan a `tokens.css`, con un comentario que explica la precedencia de capas |
| 2026-11-24 | T-22 | En un `<style scoped>` de Vue, lo que sigue a `:global(...)` se pierde: `html:not(.js) .theme-switch` salió como `html:not(.js){display:none}`, que sin JS ocultaría la página entera | Los selectores que arrancan en `<html>` van en un `<style>` sin `scoped` y acotados por `.theme-switch`; `verify:nav` comprueba que sin JS la página se ve |
| 2026-11-24 | T-22 | Unhead: con `key` explícita el cliente crea metas nuevas junto a las del servidor (4 `theme-color` tras hidratar); y al pasar de 2 metas a 1 quedaban 2 con el `media` viejo | `theme-color` mantiene siempre las dos metas y solo cambia su `content`; spec RF-12 y T-22 actualizados |
