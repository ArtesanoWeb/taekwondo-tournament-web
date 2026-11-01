# Decisiones de arquitectura

Registro corto del porqué de cada decisión no obvia. Una entrada por decisión, la más nueva al final.

## 2026-10-16 — Stack del frontend (#1)

**Contexto.** Frontend separado para la API de
[taekwondo-tournament-manager](https://github.com/pacha2880/taekwondo-tournament-manager) (FastAPI,
`/api/v1`). Primero una vista pública de solo lectura (torneos, categorías y llaves) y después la
administración. El backend corre en el plan gratis de Render: el primer request tras 15 minutos sin
tráfico tarda 30-50 s.

**Decisión.**

| Pieza                     | Elección                                                                         |
| ------------------------- | -------------------------------------------------------------------------------- |
| Framework                 | Next.js 16 con App Router, React 19 y TypeScript                                 |
| Estilos                   | Tailwind CSS 4                                                                   |
| Datos de la vista pública | Server Components con `fetch` dentro de `<Suspense>` (Cache Components activado) |
| Cliente de la API         | `openapi-typescript` (tipos generados desde `/openapi.json`) + `openapi-fetch`   |
| Calidad de código         | ESLint (`eslint-config-next`) + Prettier con `prettier-plugin-tailwindcss`       |
| Gestor de paquetes        | npm                                                                              |
| Despliegue                | Vercel                                                                           |

**Por qué.**

- Las lecturas públicas se hacen desde el servidor de Next: el navegador nunca llama a la API, así
  que no dependen de CORS y la página llega con los datos ya cargados (mejor primera carga y SEO).
- `<Suspense>` permite mostrar al instante la estructura de la página y un aviso de "despertando el
  servidor" mientras la API arranca en frío, en vez de una pantalla en blanco.
- Los tipos generados del contrato OpenAPI evitan escribir modelos a mano y hacen que un cambio
  incompatible de la API (posible mientras esté en `0.x`) aparezca como error de compilación.
- Vercel es la plataforma de los creadores de Next: deploy automático desde GitHub y plan gratis.

**Pendiente (épica E2, login).** Dónde guardar el JWT del admin. Candidato: patrón _Backend for
Frontend_ — el servidor de Next guarda el token en una cookie `httpOnly` y hace de intermediario
hacia la API; es más seguro que `localStorage` y también evita CORS en la administración. Resuelto
en la entrada del 2026-11-01 (#39).

## 2026-11-01 — Sesión del admin en una cookie `httpOnly` (#39)

**Contexto.** El login de la API (`POST /api/v1/auth/login`) devuelve un JWT de 8 horas, sin refresh,
que se envía como `Authorization: Bearer`. Hay que guardarlo en algún lado entre petición y petición.

**Decisión.** _Backend for Frontend_: una Server Action hace el login desde el servidor de Next y
guarda el JWT tal cual en la cookie `admin_session` (`httpOnly`, `Secure` en producción,
`SameSite=Lax`). Las páginas y acciones del admin la leen en el servidor y llaman a la API con el
token; el navegador nunca ve el token ni llama a la API.

- `src/proxy.ts` hace un chequeo optimista en `/admin/*`: sin cookie o con el token vencido (lee
  `exp` del JWT) redirige a `/admin/login?next=…`, y en el segundo caso agrega `vencida=1` para
  mostrar "Tu sesión venció".
- `src/lib/session.ts` es la capa de acceso a datos: `getAdminApi()` vuelve a verificar la sesión
  junto a los datos, y `adminAttempt()` manda al login si la API responde `401`.
- La cookie dura 7 días aunque el token dure 8 horas, para distinguir "sesión vencida" de "nunca
  entró".

**Por qué.**

- Una cookie `httpOnly` no se puede leer desde JavaScript: un XSS no puede robar el token, a
  diferencia de `localStorage`.
- No se cifra ni se firma de nuevo: el JWT ya viene firmado por el backend y el frontend no le
  agrega datos, así que no hace falta un secreto propio. El frontend nunca confía en el token: solo
  lee `exp` para redirigir antes; la API es la que valida la firma en cada petición.
- `SameSite=Lax` más las Server Actions (que Next solo acepta desde el mismo origen) cubren CSRF.
- Las páginas del admin no se prerenderizan con datos: leer la cookie las hace dinámicas, y cada
  lectura queda dentro de un `<Suspense>` (Cache Components).

**Alternativas descartadas.** `localStorage` (expuesto a XSS y obliga a CORS en la API); una librería
de sesiones como iron-session o Auth.js (cifrar un token que ya está firmado no agrega seguridad y
suma una dependencia y un secreto que mantener).
