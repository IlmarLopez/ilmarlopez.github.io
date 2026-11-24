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
| `verify:layout` | AC-03 | 360, 768, 1280 y 1920 px: carga limpia y sin scroll horizontal | T-63 |
| `verify:nojs` | AC-02 | JS apagado: HTML servido, sin `js` ni `data-theme`, sigue al sistema | T-64 |
| `verify:reduced` | AC-05 | sin animaciones en curso ni clase `flight` | T-64 |
| `verify:a11y` | AC-15 | axe en `/`, claro y oscuro: 0 violaciones serias o críticas | T-65 |
| `verify:js` | AC-13 | presupuesto de 120 KB gzip (sección 1) | T-68 |
| `verify:keyboard` | AC-04 | no existe aún | T-64 |
| `verify:flight`, `verify:cards`, `verify:stack` | AC-26 a AC-28 | no existen aún | T-83 |

Última corrida completa: 2026-11-24, `npm run verify`, 7 suites en verde.

## 3. Presupuesto de JS por hito

| Hito | Fecha | gzip KB | Margen | Comando |
|---|---|---:|---:|---|
| App vacía (T-12) | 2026-11-24 | 73,4 | 46,6 | `npm run verify:js` |
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
