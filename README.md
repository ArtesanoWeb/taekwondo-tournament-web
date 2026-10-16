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

## Scripts

| Comando                | Qué hace                                      |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo con recarga automática |
| `npm run build`        | Build de producción                           |
| `npm start`            | Sirve el build de producción                  |
| `npm run lint`         | Revisa el código con ESLint                   |
| `npm run typecheck`    | Revisa los tipos de TypeScript                |
| `npm run format`       | Formatea el código con Prettier               |
| `npm run format:check` | Verifica el formato sin modificar archivos    |

## Cómo se trabaja

El backlog y los sprints viven en el
[GitHub Project](https://github.com/users/ArtesanoWeb/projects/1). Cada cambio referencia su issue
(`Closes #N`) y debe cumplir la _Definition of Done_: funciona contra la API, textos en español,
estados de carga y error, usable en celular, lint y build en verde, mergeado en `main`.
