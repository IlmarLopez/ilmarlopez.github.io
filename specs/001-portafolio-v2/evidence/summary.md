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
| `verify:hero` | RF-03, RF-11, RNF-07 | titular, frase y acción primaria dentro de 1280×800; `mailto:` y CV sin JS; el CV abre en pestaña nueva con `noopener`; ancho de los botones en teléfono alto y corto | T-51, T-64 |
| `verify:journey` | RF-04, RF-06, RNF-07, AC-05, AC-17 | las 4 tarjetas con los textos de `f/` y solo Stori enlazada; periodos y duraciones con la fecha fijada; gráfica (3 filas, escala común, años cada 2 o 3); lista sin JS y con reduced-motion; un solo plano frontal en cada parada, cifras que cuentan y rAF en reposo; enlace «Experience» y `/#experience`; teléfonos sin planos sobre el hero; respaldo si el paquete no arranca | T-83 (`verify:flight`, `verify:cards`) |
| `verify:sections` | RF-05, RF-07 a RF-09, RF-11, AC-02, AC-14, AC-28, B2, B7, B9 | orden y anclas de las secciones; About como `f/` (titular a la izquierda, dos párrafos a la derecha, sin imagen, apilado en móvil); pestañas ARIA con teclado; el JS de Work se pide al acercarse; etiquetas de la pila en el vértice y dentro del escenario y del viewport en 12 anchos y 4 proyectos; el HTML sin JS lee toda la home; el paquete que llega tarde; Tools en 4, 2 y 1 columnas; enlaces de Contact y pie, PDF de una página y sin redes no permitidas | T-83 (`verify:stack`) |
| `verify:anchors` | RF-02, RF-20, M-16, M-17, AC-21 | anclas suaves con no-preference y saltos con reduced-motion; `aria-current` y línea coral tras cada clic y con Enter; ventanas de 2000 y 3000 px donde la página no sube la sección (el clic se refleja y se mantiene al parar el scroll; la rueda devuelve el mando); vuelo en 6 progresos; lectura hacia abajo con About sin marca; final de página; apertura en `#work` y `#tools`; sin línea a 768 px; sin JS | T-84 |
| `verify:layout` | AC-03 | 360, 768, 1280 y 1920 px: carga limpia y sin scroll horizontal | T-63 |
| `verify:nojs` | AC-02 | JS apagado: HTML servido, sin `js` ni `data-theme`, sigue al sistema | T-64 |
| `verify:reduced` | AC-05 | sin animaciones en curso ni clase `flight` | T-64 |
| `verify:a11y` | AC-15 | axe en `/`, claro y oscuro: 0 violaciones serias o críticas, en la lista (reduced-motion, sin exclusiones) y en vuelo con la cámara en cada plano (se excluyen solo los planos por delante de la cámara, ver R12) | T-65 |
| `verify:js` | AC-13 | presupuesto de 120 KB gzip (sección 1) | T-68 |
| `verify:redirects` | AC-08 | `/files/cv-en.pdf` responde 301 hacia `/files/Ilmar-Lopez-CV.pdf`, el PDF nuevo responde 200 `application/pdf` y una URL desconocida responde 404 con HTML; lee `dist/_redirects` con la precedencia de Netlify | T-47 |
| `verify:keyboard` | AC-04 | no existe aún | T-64 |
| `verify:flight`, `verify:cards`, `verify:stack` | AC-26 a AC-28 | no existen aún | T-83 |

Última corrida completa: 2026-11-24, `npm run verify` sobre un `dist/` limpio (rama `feat/sections`, vuelo de T-25, T-27, T-79 y T-52), 11 suites en verde. Contra el *branch deploy* en vivo (`v2` en `34bd37f`), `theme`, `layout`, `nojs`, `reduced`, `a11y` y `js` pasaron; `redirects` falló (301 esperado, 404 recibido), hallazgo de la sección 8.

## 3. Presupuesto de JS por hito

| Hito | Fecha | gzip KB | Margen | Comando |
|---|---|---:|---:|---|
| App vacía (T-12) | 2026-11-24 | 73,4 | 46,6 | `npm run verify:js` |
| App vacía con la redirección en `routeRules` | 2026-11-24 | 74,0 | 46,0 | `npm run verify:js` |
| Con SiteNav y ThemeSwitch (T-22) | 2026-11-24 | 75,5 | 44,5 | `npm run verify:js` |
| Con HeroCopy, BaseButton y CvLink (T-24) | 2026-11-24 | 76,0 | 44,0 | `npm run verify:js` |
| Con el vuelo: tarjetas, gráfica y cámara (T-25, T-27, T-79, T-52) | 2026-11-24 | 78,7 | 41,3 | `npm run verify:js` |
| Home ensamblada (T-33) | 2026-11-24 | 80,0 | 40,0 | `npm run verify:js` |
| Con el indicador de la nav (T-84) | 2026-11-24 | 80,7 | 39,3 | `npm run verify:js` |
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

Primer encuadre con la cámara en 0 (hero y plano de Stori), medido con diferencia de píxeles contra `f/` (canal > 24/255, 2026-11-24). Un desplazamiento de 1 px da 2,16 %, así que la medición distingue. La revisión completa de T-67 (secciones y resto del vuelo) sigue pendiente.

| Vista | Claro | Oscuro |
|---|---|---|
| 375×700 | 0,02 % | 0,02 % |
| 1280×800 | 0,01 % | 0,01 % |
| 1440 px | Pendiente | Pendiente |

Secciones nuevas, mismo método (2026-11-24, `f/` con reduced-motion y la nav oculta en ambos lados). Las cajas (posición y alto de sección, encabezado, listas, titular, correo, acciones y redes) miden igual que en `f/` a 1280 px en Tools y Contact; las capturas difieren en 1 px de alto por redondeo.

| Sección | 1280 claro | 375 oscuro | Nota |
|---|---|---|---|
| Contact | 0,78 % | 1,07 % | Antialiasing de los glifos del titular |
| Tools, Work | Sin medir en píxeles | Sin medir en píxeles | Cajas iguales; la 4.ª pestaña dice «CSS motion» y no «GSAP» (Q11) |
| About | 0,16 % | 0,25 % | Misma altura de sección que `f/`; antialiasing del texto. Tras rechazar Ilmar la composición con foto, About es el de `f/` |
| Footer | No comparable | No comparable | Sin «All versions» hasta T-43 |

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
| 2026-11-24 | T-52 | Ilmar rechazó la página con solo el hero («yo no pedí ese diseño»): lo que aprobó es `f/`, con el vuelo y las tarjetas en 3D | T-25, T-27, T-79 y T-52 se adelantan a M3 y se construyen ahora; M-01 (T-51) y M-03 (T-53) siguen donde estaban |
| 2026-11-24 | T-52 | Al abrir `/#experience` la cámara quedaba en p = 0,07: durante la hidratación el router reescribe la URL sin el hash (se midió `hash=""` 60 ms después de que el plugin lo veía) y luego hace su propio scroll hacia el destino | El hash se lee al arrancar el plugin y se pasa a la cámara como opción |
| 2026-11-24 | T-52 | Aun así quedaba en p = 0,22: `html { scroll-padding-top: 96px }` se suma al `scroll-margin-top` del destino (Nuxt lo suma a mano; el CSS nativo igual), y el router llevaba el scroll 96 px más arriba que la cámara | El destino es el `h2` «Experience.», fijo en el visor *sticky*; en vuelo lleva `scroll-margin-top: calc(var(--space-2xl) - var(--space-3xl))` para que el scroll del router no mueva nada, y en la lista el margen es 0. `verify:journey` cubre ambos modos |
| 2026-11-24 | T-52 | La clase `flight` va puesta antes del primer pintado: si el paquete de JS no cargaba, quedaban el hero y 480 svh vacíos | Si en 8 s no aparece `app-ready`, el `<head>` quita `flight`; el plugin lo quita si el montaje falla. `verify:journey` lo prueba bloqueando los scripts |
| 2026-11-24 | T-26 | `<NuxtPicture>` ignora `densities` si no recibe `sizes`: usa todos los `screens` hasta 3072 px. La primera compilación generó 29 variantes (4,6 MB) y un `<img src>` de respaldo de 3072×4096 | `sizes` fijo con `densities="x1 x2"`: 6 archivos de 16 a 66 KB. `image.provider: 'ipx'` explícito |
| 2026-11-24 | T-26 | Ilmar rechazó la composición provisional de About con foto: «el about no es como esta aquí» (`f/`) | About vuelve a ser el de `f/`, sin foto; la pasada de Hallmark de T-18 decide dónde va. T-26 queda reabierta solo para la foto. Salen `aside`, `profile.photo` y `image` de `nuxt.config.ts` |
| 2026-11-24 | T-84 | Ilmar: «el navbar da la impresion que no funciona». En una ventana alta el clic en un ancla casi no mueve la página y la nav no marcaba nada; `scroll-behavior: smooth` tampoco estaba | `scroll-behavior: smooth` solo con no-preference, `aria-current` y línea coral, y el clic manda hasta que el visitante hace scroll por su cuenta |
| 2026-11-24 | T-84 | El espía leía el progreso del vuelo (`--p`) antes de que la cámara lo actualizara: la cámara se acerca al scroll con inercia, después del evento `scroll`. «Experience» se marcaba un paso tarde | Observa el atributo `style` de `#journey` con un `MutationObserver` |
| 2026-11-24 | T-84 | En una ventana de 2000 px el clic en Tools terminaba marcando Contact: el desplazamiento pasaba un instante por «Tools», el espía soltaba la intención al «coincidir» y el fin de la página lo cambiaba a «Contact» en el último fotograma. El primer test no lo vio porque leía a los 500 ms y el desplazamiento dura ~1,5 s | La intención se mantiene hasta que el visitante hace scroll. El test espera a que el scroll se detenga; control negativo: con la lógica antigua falla en 2000 y 3000 px |
| 2026-11-24 | T-84 | `scroll-behavior: smooth` volvió animados los `window.scrollTo(0, y)` de `verify:nav`, que leían la posición al instante | Usan `behavior: 'instant'` |
| 2026-11-24 | T-32 | `nuxt generate` falló con `/versions (404)`: el pie enlazaba a una página que no existe hasta T-43 y `crawlLinks` la rastrea | «All versions» sale del pie hasta T-43; anotado en T-43 y en el comentario de `SiteFooter.vue` |
| 2026-11-24 | T-30 | Si el paquete de JS no cargaba, con `js` puesto antes del primer pintado los proyectos 2 a 4 quedaban ocultos y las pestañas muertas | El script de arranque quita `js` y `flight` a los 8 s sin `app-ready` (antes solo `flight`, y solo sin reduced-motion); el plugin devuelve `js` si el paquete llega tarde. `verify:sections` retrasa los scripts 8,6 s |
| 2026-11-24 | T-30 | La comparación con `f/` midió el Work móvil 26 px más bajo: `f/` pone los 4 paneles en una celda y la sección conserva la altura del más alto, y yo ocultaba los inactivos con `display: none` (la página habría saltado al cambiar de pestaña) | Los paneles comparten celda y los inactivos usan `visibility: hidden`; ahora la diferencia es de 1 px de redondeo |
| 2026-11-24 | T-79 | Dibujar la gráfica al cargar con JS empujaba la página hacia abajo (la tira estaba vacía) | El HTML da a la tira su alto con `--rows`; la suite exige desplazamiento de diseño < 0,02 con reduced-motion |
| 2026-11-24 | T-52 | `verify:a11y` falló en `/`: 28 nodos de contraste en los planos por delante de la cámara (`--o` 0,7 / 0,4 / 0,1, de 3,41:1 a 1,14:1). El hero, el plano frontal y la lista estática pasan sin excepción | Se conserva el diseño aprobado. La suite audita la lista completa y la cámara en cada plano excluyendo solo los planos por delante. **Pendiente de decisión de Ilmar en T-65** (R12 en la spec) |
