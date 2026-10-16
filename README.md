# Taekwondo Tournament Web

Frontend web para gestionar y seguir torneos de taekwondo: lista de torneos, categorías y llaves de
combate. Consume la API de
[taekwondo-tournament-manager](https://github.com/pacha2880/taekwondo-tournament-manager)
([guía de la API](https://github.com/pacha2880/taekwondo-tournament-manager/blob/dev/docs/API.md)).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4. El porqué de cada elección está en
[`docs/DECISIONS.md`](docs/DECISIONS.md).

## Requisitos

- Node.js 20.9 o superior y npm

## Cómo correrlo

```bash
npm install
npm run dev
```

Queda en [http://localhost:3000](http://localhost:3000).

## API

Por defecto usa el servidor dev
(`https://taekwondo-tournament-manager-dev.onrender.com`). Para apuntar a otro, por ejemplo al
backend local con Docker, copiar `.env.example` a `.env.local` y cambiar `API_URL`.

Los tipos de TypeScript de la API (`src/lib/api/schema.d.ts`) se generan desde su contrato OpenAPI.
Cuando la API cambie, regenerarlos con:

```bash
npm run api:types
```

El cliente (`src/lib/api/client.ts`) solo se usa desde el servidor de Next. `unwrap()` devuelve los
datos o lanza un `ApiError` con el mensaje en español.

## Scripts

| Comando                | Qué hace                                      |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo con recarga automática |
| `npm run build`        | Build de producción                           |
| `npm start`            | Sirve el build de producción                  |
| `npm run lint`         | Revisa el código con ESLint                   |
| `npm run typecheck`    | Revisa los tipos de TypeScript                |
| `npm test`             | Corre los tests con Vitest                    |
| `npm run format`       | Formatea el código con Prettier               |
| `npm run format:check` | Verifica el formato sin modificar archivos    |
| `npm run api:types`    | Regenera los tipos de la API desde OpenAPI    |

## Cómo se trabaja

El backlog y los sprints viven en el
[GitHub Project](https://github.com/users/ArtesanoWeb/projects/1). Cada cambio referencia su issue
(`Closes #N`) y debe cumplir la _Definition of Done_: funciona contra la API, textos en español,
estados de carga y error, usable en celular, lint y build en verde, mergeado en `develop`.

### Flujo de ramas (Git Flow)

| Rama                            | Para qué                                                     |
| ------------------------------- | ------------------------------------------------------------ |
| `main`                          | Solo versiones publicadas, cada una con su tag (`v0.1.0`…)   |
| `develop`                       | Integración: lo terminado y revisado. Es la rama por defecto |
| `feature/<issue>-<descripción>` | Una por issue, por ejemplo `feature/4-cliente-api`           |
| `release/X.Y.Z`                 | Preparar una versión (changelog y número de versión)         |

1. `git checkout develop && git pull`
2. `git checkout -b feature/4-cliente-api`
3. Commits chicos con prefijo `feat:`, `fix:`, `docs:`, `chore:`…
4. Pull request hacia `develop` con `Closes #N` en la descripción.
5. Para publicar una versión `X.Y.Z`:
   1. Rama `release/X.Y.Z` desde `develop`: versión en `package.json` y sección nueva en
      [`CHANGELOG.md`](CHANGELOG.md), nada más.
   2. Pull request de `release/X.Y.Z` hacia `main` (merge commit).
   3. Tag anotado sobre `main`: `git tag -a vX.Y.Z -m "X.Y.Z"` y `git push origin vX.Y.Z`.
   4. Mergear `main` de vuelta en `develop` para que tenga los cambios del release.

Nunca se commitea directo en `main` ni en `develop`.
