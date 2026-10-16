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
hacia la API; es más seguro que `localStorage` y también evita CORS en la administración.
