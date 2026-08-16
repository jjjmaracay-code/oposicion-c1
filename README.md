# Administrativo C1 — Comunidad de Madrid

Plataforma de tests interactivos para la oposición de Administrativo, Cuerpo C1,
Comunidad de Madrid. Sitio estático, sin backend.

Convocatoria vigente verificada: **Orden 1634/2026, de 30 de junio** (BOCM núm. 166,
de 14 de julio de 2026). Temario oficial: 47 temas en 5 bloques (ver `public/data/temario.json`).

## Estructura

```
public/
  index.html          ← motor del quiz (NO tocar para añadir preguntas)
  _headers            ← CSP para Cloudflare Pages
  data/
    temario.json       ← bloques y temas oficiales (fuente ya verificada, no regenerar)
    bloque-1/
      test-01.json      ← 20 preguntas, Bloque I / Tema 1 (Constitución 1978) — verificado
      test-02.json       ← siguiente test a construir
      ...
    bloque-2/ ... bloque-5/
scripts/
  validate.js         ← valida schema, duplicados, respuestas ambiguas
```

`index.html` tiene un `MANIFEST` al principio del `<script>` que declara qué tests
están construidos por bloque. Cada test nuevo que se añada como JSON hay que
registrarlo ahí — es la única edición que toca el motor.

## Cómo continuar la construcción del banco (para Claude Code)

**No generar preguntas de memoria.** Cada tanda debe verificarse contra fuente oficial
antes de escribir el JSON: BOE, BOCM, o el texto consolidado de la norma en cuestión
(Constitución, Ley 39/2015, Ley 40/2015, TREBEP, Ley de Hacienda de la CM, etc.).
Si no se puede verificar un dato (artículo, plazo, porcentaje), no se usa como
respuesta correcta — se descarta la pregunta.

Orden de trabajo, un test a la vez:

1. Elegir el siguiente test pendiente (ver progreso en pantalla de inicio o en `MANIFEST`).
2. Buscar y confirmar la normativa vigente aplicable a ese tema concreto.
3. Escribir `public/data/bloque-N/test-NN.json` con exactamente 20 preguntas,
   siguiendo el esquema exacto de `bloque-1/test-01.json` (mismos campos, mismos tipos).
4. Distribuir dificultad: ~30% fácil, ~50% media, ~20% difícil (campo `dificultad`).
5. Variar el tipo de pregunta (directa, verdadero/falso reformulado, caso práctico,
   "cuál es incorrecta", comparativa, orden cronológico...) — no repetir el mismo
   patrón 20 veces.
6. Correr `npm run validate`. Si falla, corregir antes de seguir.
7. Añadir el número de test al array correspondiente en `MANIFEST` (dentro de
   `public/index.html`).
8. Mostrar el diff real y esperar confirmación explícita ("confirmo") antes de
   hacer commit, siguiendo el flujo habitual del autor del repo.

Repetir test a test, bloque a bloque. No generar varios tests sin verificar cada
uno: la prioridad es exactitud > cantidad > velocidad.

## Despliegue — Cloudflare Pages

- Framework preset: **None**
- Build command: *(vacío, no hay build)*
- Build output directory: `public`

Con eso, `public/index.html`, `public/data/` y `public/_headers` se sirven tal cual.

## Puntuación

Modo estudio (esta app): acierto +1, error 0, sin responder 0.

Examen real (para no generar falsas expectativas): 1er y 3er ejercicio penalizan
cada error con 1/3 del valor de una respuesta correcta (Anexo I de la Orden 1634/2026).
Esta app no replica esa penalización porque el objetivo aquí es aprender, no simular
la nota exacta del examen.

## Estado actual del banco

- Bloque I: 1/10 tests (20/200 preguntas) — Tema 1, Constitución Española de 1978.
- Bloques II–V: 0/10 tests.
