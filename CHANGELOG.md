# Changelog

Todos los cambios visibles del proyecto. Formato basado en
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado según
[Semantic Versioning](https://semver.org/lang/es/). Mientras la versión sea `0.y.z` la app está en
desarrollo inicial y puede cambiar entre versiones.

## [Unreleased]

## [0.5.0] - 2026-11-13

Torneo en vivo cómodo: el admin pensado primero para el celular, y el visitante ve quién compite,
de qué club es y quién ganó.

### Added

- Sitio público: en una categoría sin llave se ven los inscritos, solo nombre y club (#54).
- Llaves: el club de cada atleta debajo de su nombre (#96) y el campeón destacado cuando termina la
  final (#14), en el sitio público y en el admin.
- Administración en celular: barra inferior con Atletas, Clubes, **Torneos** al centro, Rankings y
  Más (#89).
- Administración: pantalla «Más» con un perfil de prototipo (#90) y «Acerca de» con las versiones
  de la web y la API (#73).
- Administración: prototipo de Rankings de clubes con datos de ejemplo (#91).
- Administración: cerrar sesión desde el header en celular, con confirmación (#95).
- Atletas: sugerencias al escribir en el buscador (#92), filtros por género y club (#94) y, en
  celular, un abecedario para saltar por letra (#93); botón flotante «+» y una lupa para volver a la
  búsqueda.
- Clubes: botón flotante «+» en celular.

### Changed

- Celular: el detalle de torneo y de categoría (admin y sitio público) y el formulario de nuevo
  torneo ocupan la pantalla: sin header, con la salida junto al título y una línea debajo.
- La llave se ve siempre como mapa (sin el selector Columna/Mapa) y abre en la ronda que se está
  jugando.
- Administración: torneo con solo su título; listas sin título visible; sin el enlace «Ver en el
  sitio público»; formulario de nuevo torneo sin barra inferior ni «Cancelar» en celular.
- Header más grande en celular.

### Fixed

- Campos de fecha del mismo ancho que los demás en Android.
- Las pestañas ya no quedan pegadas a medio deslizar.
- Menos espacio vacío al final de las páginas en celular.

### Known issues

- Inscribir: todavía se ofrecen todos los atletas, no solo los que encajan en la categoría (#78);
  espera el endpoint de la API 0.7.0.
- Rankings y el perfil son prototipos: usan datos de ejemplo y el usuario de la sesión.

## [0.4.1] - 2026-11-13

### Fixed

- Administración: anotar un round volvió a funcionar con la API 0.6.0, que exige el número del round.
  Si ese round ya estaba guardado (desde otro celular, o porque la respuesta se perdió y se reenvió),
  no se guarda dos veces: el combate se recarga con los rounds actualizados y un aviso lo explica.

## [0.4.0] - 2026-11-09

Preparar y seguir un torneo desde el celular: el admin arma un torneo completo sin tocar el backend,
y el sitio público muestra también los torneos con inscripciones abiertas.

### Added

- Administración: crear torneos en `/admin/torneos/nuevo` (#43) y sus categorías desde el detalle del
  torneo, mientras las inscripciones estén abiertas (#68).
- Administración: `/admin/atletas`, con búsqueda por nombre o CI y un modal para crear y editar. Si un
  cambio de peso o género saca al atleta de una categoría, avisa antes de guardar (#44).
- Administración: `/admin/clubes`, para crear y renombrar clubes (#67).
- Administración: inscribir atletas en una categoría con un buscador (#69) y retirarlos con
  confirmación mientras las inscripciones estén abiertas (#56).
- Administración en celular: barra inferior con Torneos, Atletas y Más (#72), y botón flotante para
  crear un torneo (#64).
- Sitio público: los torneos con inscripciones abiertas aparecen y se pueden abrir (#71). En cada
  torneo en curso y sus categorías se ven combates y atletas, o que la llave no fue sorteada.
- En el celular, la llave se puede ver por columna o como mapa (#28, #65).

### Changed

- "Borrador" pasa a llamarse "Inscripciones abiertas", e "Iniciar torneo" a "Cerrar inscripciones e
  iniciar torneo" (#55).
- La lista de torneos se separa en En curso, Inscripciones abiertas y Finalizados: pestañas o barra
  inferior con deslizamiento en celular, y columnas en PC (#64, #71).
- En la categoría del admin, la llave es la vista principal y se anota tocando el combate, en un
  modal. Con inscripciones abiertas solo se ven los inscritos (#65).
- Detalle del torneo en el admin con cabecera más clara, e iniciar y finalizar abajo y separados
  (#66). Enlaces del admin al sitio público (#58).
- Los campos numéricos solo aceptan dígitos, por lo que el peso se ingresa en enteros (#68).
- En celular se oculta el pie de página con las versiones.

### Fixed

- Las respuestas sin contenido de la API (`204`) ya no se muestran como error (#56).

### Known issues

- El visitante todavía no ve los nombres de los inscritos: falta un endpoint público en el backend
  (#54). En sus torneos, los atletas se cuentan solo en las llaves ya sorteadas.
- Al inscribir se listan todos los atletas, y la API rechaza a quienes no cumplen las reglas (#78).
- Un torneo recién creado es visible al público de inmediato, aunque esté incompleto.

## [0.3.0] - 2026-11-02

Administración en vivo: el admin inicia sesión, inicia y finaliza torneos, genera las llaves y anota
cada round desde el celular; el sitio público muestra los torneos en curso y finalizados (Sprint 4).

### Added

- Administración: inicio de sesión en `/admin/login` y panel en `/admin`. La sesión se guarda en una
  cookie `httpOnly`; sin sesión, las páginas del admin llevan al login y después vuelven a la página
  pedida; si la sesión vence aparece "Tu sesión venció"; botón "Cerrar sesión" (#39).
- Administración: `/admin/torneos` lista todos los torneos, incluidos los borradores, con botones
  "Iniciar torneo" y "Finalizar torneo" que piden confirmación porque no se pueden deshacer; si la
  API rechaza el cambio (por ejemplo, quedan combates por jugar) se muestra su motivo (#40).
- Administración en vivo: cada torneo muestra sus categorías con inscritos y estado de la llave; en
  cada categoría, "Generar llave" con confirmación y, con el torneo en curso, los combates listos
  para anotar. Formulario de round pensado para el celular (inputs numéricos grandes), sin
  empates ni puntos inválidos y con confirmación porque el round no se puede editar; el marcador y
  la llave se actualizan al guardar y el ganador avanza solo (#41).

### Changed

- Para desarrollo: `npm run seed` funciona con la API 0.5 (inicia y finaliza los torneos con
  `start`/`finish`, ya no envía `round_number`), tipos de la API regenerados y Next 16.4.3 /
  React 19.3.1 (#37).
- El sitio publicado lee los datos de la API de desarrollo del backend, que ya tiene las acciones
  de administración (#38).
- La portada separa los torneos "En curso" de los "Finalizados" con una línea divisoria, cada grupo
  del más reciente al más antiguo. Los torneos en borrador ya no aparecen en el sitio público: ni en
  la lista ni por URL (su página y las de sus categorías muestran "no encontrado") (#42).

### Known issues

- En el celular la llave se recorre con scroll horizontal; una vista optimizada llega con el #28.

## [0.2.0] - 2026-10-26

Del torneo a la llave: ya se puede entrar a un torneo, elegir una categoría y seguir su llave
(Sprint 2). Primera versión publicada en Vercel.

### Added

- Detalle de torneo en `/torneos/{id}`: datos del torneo y sus categorías agrupadas por género,
  con rango de edad, peso y grupo de cinturón; "Torneo no encontrado" si no existe (#11).
- Llave de cada categoría en `/categorias/{id}`: rondas en columnas (Octavos, Cuartos, Semifinal,
  Final), atletas de cada lado con los rounds ganados y el ganador resaltado; aviso si la llave
  todavía no fue sorteada (#27).
- En la llave: líneas que conectan cada combate con el siguiente, estado de cada combate
  (Pendiente, Finalizado, Pase directo), "Sin rival" en los pases directos y "Por definir" en los
  lados que esperan un resultado (#29).
- Para desarrollo: integración continua en GitHub Actions (#7) y `npm run seed` para cargar datos de
  prueba en un backend local con Docker (#3).

### Fixed

- Las tarjetas de la lista de torneos ya no llevan a una página 404 (known issue de la 0.1.0).

### Known issues

- En el celular la llave se recorre con scroll horizontal; una vista optimizada llega con el #28.

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

[Unreleased]: https://github.com/ArtesanoWeb/taekwondo-tournament-web/compare/v0.5.0...develop
[0.5.0]: https://github.com/ArtesanoWeb/taekwondo-tournament-web/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/ArtesanoWeb/taekwondo-tournament-web/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/ArtesanoWeb/taekwondo-tournament-web/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/ArtesanoWeb/taekwondo-tournament-web/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/ArtesanoWeb/taekwondo-tournament-web/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ArtesanoWeb/taekwondo-tournament-web/releases/tag/v0.1.0
