# Changelog

Todos los cambios visibles del proyecto. Formato basado en
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado según
[Semantic Versioning](https://semver.org/lang/es/). Mientras la versión sea `0.y.z` la app está en
desarrollo inicial y puede cambiar entre versiones.

## [Unreleased]

### Added

- Detalle de torneo en `/torneos/{id}`: datos del torneo y sus categorías agrupadas por género,
  con rango de edad, peso y grupo de cinturón; "Torneo no encontrado" si no existe (#11).

## [0.1.0] - 2026-10-16

Primera versión: la base del proyecto y la lista pública de torneos (Sprint 1).

### Added

- Lista de torneos en la página principal: nombre, fecha en español, lugar y estado con color,
  ordenados del más reciente al más antiguo, con mensaje cuando no hay torneos (#9).
- Aviso de carga que, si la API tarda más de 3 s (servidor dormido en Render), explica que se está
  despertando; mensaje de error en español con botón "Reintentar" (#10).
- Encabezado, pie con la versión de la web y de la API, página 404 en español y diseño adaptable al
  celular (#6).
- Traducción al español de los valores de la API y formato de fechas en hora de Bolivia (#5).
- Cliente tipado de la API generado desde su contrato OpenAPI (#4).
- Proyecto base con Next.js 16, React 19, TypeScript y Tailwind CSS 4; ESLint, Prettier y Vitest
  (#1, #2).

### Known issues

- Las tarjetas de torneo enlazan a `/torneos/{id}`, que todavía muestra la página 404: el detalle del
  torneo llega en la próxima versión (#11).

[Unreleased]: https://github.com/ArtesanoWeb/taekwondo-tournament-web/compare/v0.1.0...develop
[0.1.0]: https://github.com/ArtesanoWeb/taekwondo-tournament-web/releases/tag/v0.1.0
