# Plan 001 — ilmarlopez.com v2

Estado: **aprobado por Ilmar el 2026-11-24 (Fase 2).** Actualizado ese día tras aprobar el prototipo `design/hallmark/f/` («Depth is time»). No se ha escrito código de la app.
Spec: [`spec.md`](./spec.md) (actualizada con `f/`) · Tareas: [`tasks.md`](./tasks.md)

## 1. Qué fija este plan

- **Base.** La spec está aprobada con las decisiones de Ilmar: foto en About (Q1), «View CV» sin `download` y en pestaña nueva (Q2), pasada de Hallmark para las piezas sin referencia (Q3) y GSAP acotado a la pila de Work (Q4). **Fuente visual aprobada:** `design/hallmark/f/` y el `design.md` reescrito para él; el hero «Live System» de la referencia `d/` queda como historial.
- **Valores por defecto de las preguntas sin contestar** (spec §10.5):

  | Pregunta | Se aplica |
  |---|---|
  | Q5 Lenis | **No se incluye** (decidido por Ilmar el 2026-11-24): el vuelo ya suaviza el scroll y Lenis lo duplicaría. T-59 solo registra los números de INP. |
  | Q6 Pista de ⌘K | Nota discreta en el footer solo con puntero fino, diseñada en T-18. |
  | Q7 Analítica | Ninguna en 2.0. |
  | Q8 Aviso en v1 | Inyección de snippet de Netlify si el plan la ofrece; si no, sin aviso (T-17). |
  | Q9 Fechas de `/versions` | `TODO(ilmar)` hasta T-75, donde las da Ilmar. |
  | Q10 Árbol de trabajo | `.gitignore` y commit de `design.md` y `design/` van en T-01 y T-03. El CV ya se llama `Ilmar-Lopez-CV.pdf`: **Ilmar confirmó el 2026-11-24 que se commitea en un commit aparte** (T-03). Es un archivo distinto del anterior (47 057 b frente a 66 902 b), así que Git registra el borrado de `cv-en.pdf` y el alta del nuevo. |
  | Q11 GSAP | **No se instala** (decidido por Ilmar el 2026-11-24): el vuelo y la pila de Work van con CSS y un script de DOM plano, y la tarjeta «This portfolio» deja de decir «GSAP motion» (T-04, T-55, T-59). |
  | Q12 Título del PDF | Los metadatos del PDF no tienen título; lo re-exporta Ilmar con «Ilmar Lopez, Senior Software Engineer, CV». No bloquea nada. |

- **Tamaño.** 85 tareas en 9 hitos, **≈ 66 h de trabajo del agente** (suma de las estimaciones de `tasks.md`; no incluye esperas de aprobación de Ilmar). 73 tareas son del agente, 2 de Ilmar y 10 de los dos. T-79 a T-83 se añadieron tras aprobar `f/`, y T-84 y T-85 tras probar Ilmar la home.

| Hito | Contenido | Tareas | Estimación |
|---|---|---|---|
| M0 | Preparación y cimientos | T-01 a T-14 | 9.8 h |
| M1 | v1 en Netlify | T-15 a T-17 | 2.3 h |
| M2 | Pasada de Hallmark | T-18 a T-21 | 3.5 h |
| M3 | Secciones estáticas | T-22 a T-35, T-79, T-81, T-84 y T-85 | 14.6 h |
| M4 | Interacciones | T-36 a T-42 y T-82 | 6.0 h |
| M5 | Páginas, SEO y operaciones | T-43 a T-49 | 5.0 h |
| M6 | Motion | T-50 a T-62 y T-80 | 11.3 h |
| M7 | Calidad | T-63 a T-72 y T-83 | 9.0 h |
| M8 | Lanzamiento | T-73 a T-78 | 4.5 h |

## 2. Ramas y PRs

Todas las ramas salen de `v2` y los PRs apuntan a `v2`. **Nunca se toca `main`, `release/*` ni ningún tag** hasta el PR final `v2 → main`, y ese merge y los tags los hace Ilmar.

| Hito | Rama | Tareas | Puerta de salida |
|---|---|---|---|
| M0 | `feat/foundation` | T-01 a T-14 | Deploy Preview verde; línea base de JS registrada |
| M1 | *(sin rama: operaciones en Netlify)* | T-15 a T-17 | `v1.ilmarlopez.com` sirve v1 y `dig` de MX y TXT no cambia |
| M2 | `feat/design-extension` | T-18 a T-21 | Aprobación de Ilmar de cada pieza y de `design.md` |
| M3 | `feat/sections` | T-22 a T-35, T-79, T-81, T-84 y T-85 | JS inicial ≤ 120 KB gzip (T-33); `hallmark audit` sin FAIL |
| M4 | `feat/interactions` | T-36 a T-42 y T-82 | Suite de teclado en verde |
| M5 | `feat/pages-seo` | T-43 a T-49 | Las 3 rutas con contenido real |
| M6 | `feat/motion` | T-50 a T-62 y T-80 | `/review-animations` sin hallazgos pendientes |
| M7 | `feat/quality` | T-63 a T-72 y T-83 | AC de rendimiento, accesibilidad y fidelidad cumplidos |
| M8 | `feat/launch` (T-73 a T-75) y luego `v2 → main` (T-76) | T-73 a T-78 | Checklist de lanzamiento aprobado por Ilmar |

Reglas:

- Un commit pequeño por tarea, con Conventional Commits (por ejemplo `feat(hero): add static journey`), y la casilla de `tasks.md` marcada en ese mismo commit.
- Tras cada push se relee la descripción del PR y se actualiza si cambió el alcance (regla del workspace).
- No hay un MCP de GitHub en esta sesión, así que PRs y comentarios se hacen con `gh` como alternativa.
- El agente abre los PRs y **Ilmar los mergea** (o me delega ese paso explícitamente).
- Sin `push --force` ni reescritura de historial. `/hallmark redesign` nunca se corre sobre `release/*`.

## 3. Orden y dependencias

**Camino crítico:** M0 → M3 → M4 → M5 → M6 → M7 → M8.

**Trabajo en paralelo.** M1 (operaciones) y M2 (diseño) dependen de acciones de Ilmar, así que se intercalan con M3 para no quedar bloqueados:

1. Tras el merge de M0 (T-14) arranca M2 (T-18 a T-21).
2. Mientras Ilmar aprueba el diseño, avanzo en M3 con lo que **no** depende de esa pasada: T-22, T-24, T-25, T-27, T-28, T-29, T-30, T-31, T-79 y T-81.
3. Las tareas bloqueadas por diseño esperan a su aprobación:

   | Tarea | Espera a |
   |---|---|
   | T-23 skip link | T-20 |
   | T-26 About con foto | T-18 |
   | T-32 footer con pista | T-18 |
   | T-39 y T-40 (menú de CV y paleta) | T-20 |
   | T-43 y T-44 (`/versions` y 404) | T-19 |

4. M1 se puede hacer en cualquier momento después de M0. Conviene hacerlo **pronto** porque revela de forma temprana los problemas de build de v1 (Nuxt 3.7 con `yarn.lock`).
5. M6 (motion) no empieza hasta que M3 a M5 se vean bien estáticos.

## 4. Puntos de aprobación (el agente se detiene)

1. **Este plan.**
2. Acciones solo de Ilmar: actualizar Node (T-02), secretos de Netlify (T-13), DNS y dominios (T-16), prueba en iPhone (T-71), lanzamiento y tags (T-77).
3. ~~Confirmar el CV nuevo~~ Resuelto el 2026-11-24: se commitea en T-03, en un commit aparte.
4. Aprobar cada pieza de diseño de la pasada de Hallmark y los cambios a `design.md` (T-18 a T-21).
5. **Puerta de JS (T-33).** Si la home supera 120 KB gzip, me detengo y propongo opciones antes de seguir con M4.
6. Cualquier cambio a la tabla de motion (T-50) o a la spec.
7. Fechas de `/versions` (T-75). Q5 (sin Lenis) y Q11 (sin GSAP) ya están decididas; T-59 solo registra los números de INP.
8. Cada merge de PR.
9. El PR `v2 → main` y el lanzamiento (T-76 y T-77).

## 5. Definición de terminado

**Una tarea** está terminada cuando se cumple su «Verifica» y su casilla queda marcada en `tasks.md`.

**Una sección** (M3) además pasa estas comprobaciones antes de seguir con la siguiente:

- Capturas con el MCP de Playwright a 375 y 1440 px, en claro y en oscuro, contra la referencia.
- Lighthouse local contra `npm run preview`.
- `node .agents/skills/hallmark/scripts/sloplint.mjs app --render --url http://localhost:3000/` con `npm run dev` levantado.
- Si algo rompe el presupuesto, se arregla antes de seguir.

**Un PR** se abre cuando se cumple:

- `npm run typecheck` pasa y `npm run generate` produce HTML con contenido real en cada ruta.
- `/hallmark audit app/` (solo reporta) y `sloplint --render` con 0 FAIL. Cada REFLEX se corrige o se justifica por escrito en el PR.
- El Deploy Preview de Netlify está revisado.
- En PRs de motion (M6): `/review-animations` sin hallazgos pendientes.
- La descripción del PR resume el alcance, las tareas cerradas y los resultados de las verificaciones.

**Prohibido en cualquier tarea:** instalar la skill o los hooks de Impeccable (crean su propio `DESIGN.md` y chocan con el de Hallmark; solo se usa su CLI), reintroducir `.github/workflows/cd.yml`, mencionar proyectos internos de empleadores, inventar métricas, clientes o enlaces (se usa `TODO(ilmar): ...`), o escribir secretos en el código.

## 6. Verificación y evidencia

- **Arnés (T-11).** `scripts/verify/` con Playwright y axe; scripts npm `verify:layout`, `verify:keyboard`, `verify:reduced`, `verify:nojs`, `verify:theme` y `verify:a11y`; T-83 añade `verify:flight`, `verify:cards` y `verify:stack` (AC-26 a AC-28). Es lo que convierte los AC en pruebas repetibles.
- **Evidencia.** Resultados y decisiones en `specs/001-portafolio-v2/evidence/summary.md`; los JSON crudos (Lighthouse, trazas) van a `.tmp/`, que no se commitea.
- **Cómo se mide** (spec §6):
  - Lighthouse móvil con throttling por defecto, **mediana de 5 corridas** en el Deploy Preview.
  - JS inicial: suma gzip de los scripts pedidos antes de cualquier scroll o interacción.
  - INP: `web-vitals` con interacciones reales (clic en un tab, abrir «Say hi», cambiar el tema).
  - Fidelidad visual: capturas con reduced-motion contra `design/hallmark/f`, umbral inicial del 2 % que se calibra en T-67.
- **Documentación.** Antes de usar cada API de Nuxt, Tailwind, View Transitions o Web3Forms (y GSAP solo si se incorpora) se consulta la documentación vigente (Context7 y, para Web3Forms, su documentación oficial).

## 7. Puertas de riesgo

| Puerta | Tarea | Condición | Si falla |
|---|---|---|---|
| Node local | T-02 | Node ≥ 22.22.3 | No se construye en local hasta resolverlo |
| Previews para PRs hacia `v2` | T-13, T-14 | El PR genera Deploy Preview | Añadir `v2` como rama de despliegue o revisar la estrategia de PRs |
| Presupuesto de JS | T-33 | ≤ 120 KB gzip | Parada y propuesta: más `hydrate-never`, diferir chunks, o replantear lo que entra al camino crítico |
| Build de v1 | T-15 | Build verde | Probar Node 18 y el gestor de paquetes de `yarn.lock`; si no basta, escalar a Ilmar |
| Pasada de Hallmark | T-18 a T-21 | Aprobada por Ilmar | Bloquea T-23, T-26, T-32, T-37, T-39, T-40, T-43 y T-44 |
| LCP frente a M-01 | T-51 | Costo de la animación ≤ 100 ms | El `h1` aparece sin la máscara y solo animan la frase y las acciones |
| Rendimiento del vuelo | T-52, T-60, T-71 | Sin tareas largas > 50 ms por motion; sin defectos en Safari ni iPhone; INP no empeora | Reducir los planos visibles, la perspectiva o el `will-change`, o dejar el hero en estático |
| Dimensionado de la pila | T-81, T-83 | AC-28: sin recortes en 12 anchos × 4 proyectos | Ajustar `--tag` y los `clamp` antes de seguir |

## 8. Supuestos del plan

- **Las estimaciones son de ≤ 1 h por tarea.** Si una se pasa, se divide antes de seguir, no se estira.
- **Las pasadas de Hallmark (T-18 a T-20)** cuentan solo la primera propuesta. Si hay iteraciones, el tiempo extra es de esa tarea y no mueve el resto del plan.
- **Herramientas.** Están instaladas `hallmark`, `emil-design-eng`, `review-animations` y `netlify-*` (las `gsap-*` se quitaron el 2026-11-24: GSAP no se instala, Q11). **No están** `choreograph` ni `animation-performance`: la coreografía se decide con `emil-design-eng` y el rendimiento se revisa con trazas de Chrome.
- **Netlify y DNS.** No he verificado si ya existen los sitios de Netlify ni el estado exacto de los registros DNS. T-13, T-15 y T-16 empiezan por lectura (MCP de Netlify y `dig`) antes de cambiar nada.
- **Dependencias.** Las versiones se fijan en el lockfile en T-04. `typescript` se ata a `~5.9.3`: el «latest» de npm (7.0.2) ya no trae `lib/typescript.js`, que `vue-tsc` necesita (comprobado en T-04).
- **Cambios de spec.** Cualquier ajuste a la spec que surja durante la implementación se propone a Ilmar y no se aplica por cuenta propia.

## 9. Trazabilidad: requisito → tareas

Cada requisito, fila de motion y criterio de aceptación de la spec tiene al menos una tarea. Calculado a partir de las etiquetas de `tasks.md` (83 tareas) y comprobado contra los IDs de la spec: ninguno queda sin tarea.

**Requisitos funcionales**

```text
RF-01  T-33
RF-02  T-20 T-22 T-23 T-84 T-85
RF-03  T-24
RF-04  T-25 T-52 T-71
RF-05  T-10 T-18 T-26
RF-06  T-10 T-27 T-79
RF-07  T-10 T-29 T-30 T-71 T-81
RF-08  T-10 T-28
RF-09  T-10 T-31
RF-10  T-36 T-37 T-38 T-71 T-82
RF-11  T-10 T-20 T-24 T-31 T-39 T-47
RF-12  T-06 T-09 T-22
RF-13  T-20 T-40 T-41
RF-14  T-18 T-32
RF-15  T-19 T-43
RF-16  T-19 T-44
RF-17  T-57
RF-18  T-45 T-46
RF-19  T-70
RF-20  T-58 T-59 T-84 T-85
```

**Requisitos no funcionales**

```text
RNF-01  T-34 T-68
RNF-02  T-08 T-60 T-68
RNF-03  T-12 T-33 T-68
RNF-04  T-26
RNF-05  T-65
RNF-06  T-45 T-46
RNF-07  T-24 T-29
RNF-08  T-57 T-71
RNF-09  T-08
RNF-10  T-47
RNF-11  T-01 T-02 T-04
RNF-12  T-05 T-13
```

**Versionado**

```text
RV-01  T-15 T-16
RV-02  T-17
RV-03  T-13
RV-04  T-74 T-77
RV-05  T-10 T-48 T-75
RV-06  T-73
RV-07  T-03 T-73
RV-08  T-01 T-13 T-38
```

**Tabla de motion**

```text
M-01  T-51
M-02  T-52
M-03  T-53
M-04  T-54
M-05  T-54
M-06  T-54
M-07  T-22
M-08  T-54
M-09  T-54
M-10  T-55
M-11  T-55
M-12  T-56
M-13  T-56
M-14  T-57
M-15  T-58
M-16  T-58 T-84
M-17  T-54 T-84 T-85
M-18  T-80
M-19  T-80
M-20  T-85
```

**Criterios de aceptación**

```text
AC-01  T-05 T-11 T-33 T-43 T-44 T-49
AC-02  T-11 T-24 T-29 T-64
AC-03  T-11 T-24 T-34 T-63
AC-04  T-11 T-23 T-30 T-37 T-41 T-42 T-64 T-82
AC-05  T-11 T-51 T-52 T-53 T-55 T-56 T-64 T-80
AC-06  T-06 T-09 T-22 T-64
AC-07  T-38
AC-08  T-39 T-47
AC-09  T-40
AC-10  T-44
AC-11  T-43 T-48 T-75
AC-12  T-51 T-59 T-68 T-72
AC-13  T-12 T-30 T-33 T-36 T-41 T-55 T-68
AC-14  T-26
AC-15  T-11 T-21 T-65
AC-16  T-45 T-46
AC-17  T-25 T-34 T-35 T-66 T-67 T-72
AC-18  T-50 T-54 T-61 T-62
AC-19  T-69
AC-20  T-57 T-71
AC-21  T-58 T-59 T-84 T-85
AC-22  T-15 T-16 T-74 T-77
AC-23  T-03 T-14 T-77
AC-24  T-10 T-31 T-70
AC-25  T-47 T-70
AC-26  T-52 T-83
AC-27  T-79 T-80 T-83
AC-28  T-81 T-83
```

Los defectos de la referencia quedan cubiertos así: B1 en T-06, B2 y B7 en T-29, B3 y B6 en T-21, B4 en T-07, B5 en T-08 y B9 en T-81. B8 quedó obsoleto con el hero «Depth is time».
