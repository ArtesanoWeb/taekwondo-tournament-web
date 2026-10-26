// Loads demo data into a LOCAL backend so every bracket state can be seen in the frontend:
// finished, in progress and pending matches, byes, a two-athlete final and categories without
// a bracket. Usage: `npm run seed` (backend running with `docker compose up` in ../Backend).

const API_URL = process.env.SEED_API_URL ?? "http://localhost:8000";
const USERNAME = process.env.SEED_USERNAME ?? "admin";
const PASSWORD = process.env.SEED_PASSWORD ?? "admin";
const MARKER = "Copa de Prueba 2026";

// The API has no DELETE endpoints, so seeding a shared server can't be undone.
const host = new URL(API_URL).hostname;
if (!["localhost", "127.0.0.1", "::1"].includes(host)) {
  console.error(
    `Solo se cargan datos de prueba en un backend local (recibido: ${API_URL}).`,
  );
  process.exit(1);
}

let token;

async function request(method, path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(body && { "Content-Type": "application/json" }),
    },
    body: body && JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      `${method} ${path} → ${response.status}: ${JSON.stringify(data.detail)}`,
    );
  }
  return data;
}

const post = (path, body) => request("POST", path, body);
const get = (path) => request("GET", path);

async function login() {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: USERNAME, password: PASSWORD }),
  });
  if (!response.ok)
    throw new Error(`No se pudo iniciar sesión (${response.status}).`);
  token = (await response.json()).access_token;
}

const FIRST_NAMES = {
  male: [
    "Mateo",
    "Santiago",
    "Diego",
    "Joaquín",
    "Thiago",
    "Gabriel",
    "Lucas",
    "Bruno",
    "Adrián",
    "Iker",
  ],
  female: [
    "Valentina",
    "Camila",
    "Sofía",
    "Isabella",
    "Luciana",
    "Mariana",
    "Antonella",
    "Renata",
    "Daniela",
    "Ximena",
  ],
};
const LAST_NAMES = [
  "Quispe",
  "Mamani",
  "Rojas",
  "Vargas",
  "Choque",
  "Flores",
  "Gutiérrez",
  "Torrez",
  "Mendoza",
  "Céspedes",
  "Arce",
  "Villca",
];
let nameIndex = 0;

function nextName(gender) {
  const first = FIRST_NAMES[gender][nameIndex % FIRST_NAMES[gender].length];
  const last = LAST_NAMES[(nameIndex * 7) % LAST_NAMES.length];
  const second = LAST_NAMES[(nameIndex * 5 + 3) % LAST_NAMES.length];
  nameIndex += 1;
  return `${first} ${last} ${second}`;
}

async function createCategory(tournamentId, clubs, spec) {
  const category = await post("/api/v1/categories", {
    tournament_id: tournamentId,
    ...spec.category,
  });
  const weight =
    spec.category.max_weight ?? (spec.category.min_weight ?? 60) + 10;
  for (let i = 0; i < spec.athletes; i++) {
    const athlete = await post("/api/v1/athletes", {
      name: nextName(spec.category.gender),
      birth_date: `${2026 - spec.category.min_age}-0${(i % 9) + 1}-15`,
      gender: spec.category.gender,
      belt_rank:
        spec.category.belt_group === "black" ? "negro 1er dan" : "verde",
      weight_kg: weight - 1 - (i % 4),
      club_id: clubs[i % clubs.length].id,
    });
    await post("/api/v1/registrations", {
      athlete_id: athlete.id,
      category_id: category.id,
    });
  }
  if (spec.matchesToPlay !== undefined) {
    await post(`/api/v1/categories/${category.id}/bracket`);
    await playMatches(category.id, spec.matchesToPlay);
  }
  return category;
}

// Score patterns per round so results look varied: [red, blue] points.
const SCORE_PATTERNS = [
  [
    [12, 5],
    [9, 7],
  ],
  [
    [4, 10],
    [11, 6],
    [8, 3],
  ],
  [
    [6, 9],
    [3, 7],
  ],
  [
    [10, 8],
    [5, 12],
    [14, 9],
  ],
];

/** Plays `count` matches in bracket order (round by round), or all of them with `Infinity`. */
async function playMatches(categoryId, count) {
  let played = 0;
  while (played < count) {
    const bracket = await get(`/api/v1/categories/${categoryId}/bracket`);
    const next = bracket.matches
      .filter(
        (m) => m.status === "pending" && m.athlete_red_id && m.athlete_blue_id,
      )
      .sort((a, b) => a.round_number - b.round_number || a.slot - b.slot)[0];
    if (!next) return;
    const pattern = SCORE_PATTERNS[next.id % SCORE_PATTERNS.length];
    for (const [index, [red_points, blue_points]] of pattern.entries()) {
      await post(`/api/v1/matches/${next.id}/rounds`, {
        round_number: index + 1,
        red_points,
        blue_points,
      });
    }
    played += 1;
  }
}

const cadete = {
  gender: "male",
  age_label: "Cadete",
  min_age: 12,
  max_age: 14,
  belt_group: "color",
};
const juvenil = {
  gender: "female",
  age_label: "Juvenil",
  min_age: 15,
  max_age: 17,
  belt_group: "color",
};

const TOURNAMENTS = [
  {
    tournament: {
      name: MARKER,
      date: "2026-11-21",
      location: "Coliseo Cerrado, Cochabamba",
    },
    status: "in_progress",
    categories: [
      {
        category: { ...cadete, weight_label: "Hasta 45kg", max_weight: 45 },
        athletes: 8,
        matchesToPlay: 5,
      },
      {
        category: { ...juvenil, weight_label: "Hasta 55kg", max_weight: 55 },
        athletes: 5,
        matchesToPlay: 1,
      },
      {
        category: {
          gender: "male",
          age_label: "Adultos",
          min_age: 18,
          belt_group: "black",
          weight_label: "Libre",
        },
        athletes: 2,
        matchesToPlay: Infinity,
      },
      {
        category: {
          gender: "female",
          age_label: "Infantil",
          min_age: 9,
          max_age: 11,
          belt_group: "color",
          weight_label: "Hasta 35kg",
          max_weight: 35,
        },
        athletes: 3,
        matchesToPlay: 0,
      },
      {
        category: { ...cadete, weight_label: "Más de 45kg", min_weight: 45 },
        athletes: 16,
        matchesToPlay: 10,
      },
      {
        category: { ...juvenil, weight_label: "Más de 55kg", min_weight: 55 },
        athletes: 1,
      },
      {
        category: {
          gender: "female",
          age_label: "Adultos",
          min_age: 18,
          belt_group: "black",
          weight_label: "Libre",
        },
        athletes: 0,
      },
    ],
  },
  {
    tournament: {
      name: "Copa Invierno 2025",
      date: "2025-07-12",
      location: "Polideportivo, Quillacollo",
    },
    status: "finished",
    categories: [
      {
        category: { ...cadete, weight_label: "Hasta 45kg", max_weight: 45 },
        athletes: 4,
        matchesToPlay: Infinity,
      },
    ],
  },
  {
    tournament: {
      name: "Torneo de Primavera 2027",
      date: "2027-03-20",
      location: "Sacaba, Cochabamba",
    },
    status: "draft",
    categories: [],
  },
];

async function main() {
  await login();
  const existing = await get("/api/v1/tournaments");
  if (existing.some((t) => t.name === MARKER)) {
    console.log(`Los datos de prueba ya están cargados ("${MARKER}").`);
    console.log(
      "Para empezar de cero: cd ../Backend && docker compose down -v && docker compose up",
    );
    return;
  }

  const clubs = [];
  for (const name of [
    "Dojang Central",
    "Club Halcones",
    "Escuela Hwarang",
    "Tigres del Valle",
  ]) {
    clubs.push(await post("/api/v1/clubs", { name }));
  }

  for (const spec of TOURNAMENTS) {
    const tournament = await post("/api/v1/tournaments", spec.tournament);
    for (const categorySpec of spec.categories) {
      await createCategory(tournament.id, clubs, categorySpec);
    }
    if (spec.status !== "draft") {
      await request("PATCH", `/api/v1/tournaments/${tournament.id}`, {
        status: spec.status,
      });
    }
    console.log(
      `✓ ${tournament.name} (${spec.categories.length} categorías) → /torneos/${tournament.id}`,
    );
  }
}

main().catch((error) => {
  console.error(error.message);
  if (error.cause?.code === "ECONNREFUSED") {
    console.error(
      `No hay backend en ${API_URL}. Levantarlo con: cd ../Backend && docker compose up`,
    );
  }
  process.exit(1);
});
