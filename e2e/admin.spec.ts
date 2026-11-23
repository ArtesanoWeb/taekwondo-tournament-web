import { expect, type Page, test } from "@playwright/test";

// A tournament's whole life in the admin, step by step: create it, add a category and two
// athletes, register them, start it, draw the bracket and score the final. Each project (phone
// and PC) creates its own data, with names that don't repeat between runs.

const API_URL = process.env.E2E_API_URL ?? "http://localhost:8001";

test.describe.configure({ mode: "serial" });

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Usuario").fill("admin");
  await page.getByLabel("Contraseña").fill("admin");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).not.toHaveURL(/\/admin\/login/);
}

test.describe("ciclo de un torneo en el admin", () => {
  let suffix = "";
  let tournamentId = 0;
  let categoryId = 0;
  const athletes = ["", ""];

  test.beforeAll(({}, testInfo) => {
    suffix = `${testInfo.project.name} ${Date.now() % 100000}`;
    athletes[0] = `Ana Rojas ${suffix}`;
    athletes[1] = `Bea Vargas ${suffix}`;
  });

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("crear el torneo, con todos los datos en la confirmación", async ({
    page,
  }) => {
    await page.goto("/admin/torneos/nuevo");
    await page.getByLabel("Nombre").fill(`Copa E2E ${suffix}`);
    await page.getByLabel("Fecha").fill("2027-03-01");
    await page.getByLabel("Lugar").fill("Coliseo de prueba");
    await page.getByRole("button", { name: "Crear torneo" }).click();

    const confirm = page.getByRole("dialog", { name: "¿Crear el torneo?" });
    await expect(confirm).toContainText(`Copa E2E ${suffix}`);
    await expect(confirm).toContainText("1 de marzo de 2027");
    await confirm.getByRole("button", { name: "Sí, crear" }).click();

    await expect(page).toHaveURL(/creado=\d+/);
    tournamentId = Number(new URL(page.url()).searchParams.get("creado"));
  });

  test("crear una categoría", async ({ page }) => {
    await page.goto(`/admin/torneos/${tournamentId}`);
    await page.getByRole("button", { name: "Nueva categoría" }).click();
    const form = page.getByRole("dialog", { name: "Nueva categoría" });
    await form.getByLabel("Género").selectOption({ label: "Femenino" });
    await form.getByLabel("Nombre de la edad").fill("Cadete");
    await form.getByLabel("Edad mínima").fill("12");
    await form.getByLabel("Edad máxima (opcional)").fill("14");
    await form.getByLabel("Cinturón").selectOption("color");
    await form.getByLabel("Nombre del peso").fill("Hasta 50kg");
    await form.getByLabel("Peso máximo (opcional)").fill("50");
    await form.getByLabel("Rounds para ganar").fill("2");
    await form.getByRole("button", { name: "Crear categoría" }).click();
    await page
      .getByRole("dialog", { name: "¿Crear la categoría?" })
      .getByRole("button", { name: "Sí, crear" })
      .click();

    const link = page.getByRole("link", { name: /Cadete · Hasta 50kg/ });
    await expect(link).toBeVisible();
    categoryId = Number((await link.getAttribute("href"))?.split("/").at(-1));
  });

  test("crear dos atletas (uno desde el formulario, con su cinturón)", async ({
    page,
    request,
  }) => {
    await page.goto("/admin/atletas");
    await page.getByRole("button", { name: "Nuevo atleta" }).click();
    const form = page.getByRole("dialog", { name: "Nuevo atleta" });
    await form.getByLabel("Nombre completo").fill(athletes[0]);
    await form.getByLabel("Fecha de nacimiento").fill("2013-05-10");
    await form.getByLabel("Género").selectOption({ label: "Femenino" });
    await form.getByTitle("6.º Kup").click();
    await form.getByLabel("Peso (kg)").fill("44");
    await form.getByLabel("Club").selectOption({ index: 1 });
    await form.getByRole("button", { name: "Guardar" }).click();

    const confirm = page.getByRole("dialog", { name: "¿Crear el atleta?" });
    await expect(confirm).toContainText(athletes[0]);
    await expect(confirm).toContainText("6.º Kup");
    await expect(confirm).toContainText("44 kg");
    await confirm.getByRole("button", { name: "Sí, crear" }).click();
    await expect(form).toBeHidden();

    // The second one straight through the API: the form was already covered.
    const login = await request.post(`${API_URL}/api/v1/auth/login`, {
      form: { username: "admin", password: "admin" },
    });
    const { access_token } = await login.json();
    const clubs = await (await request.get(`${API_URL}/api/v1/clubs`)).json();
    const created = await request.post(`${API_URL}/api/v1/athletes`, {
      headers: { Authorization: `Bearer ${access_token}` },
      data: {
        name: athletes[1],
        birth_date: "2013-08-20",
        gender: "female",
        grade: "kup_5",
        weight_kg: 46,
        club_id: clubs.at(-1).id,
      },
    });
    expect(created.ok()).toBe(true);
  });

  test("inscribir a las dos en la categoría", async ({ page }) => {
    await page.goto(`/admin/categorias/${categoryId}`);
    for (const name of athletes) {
      await page.getByRole("button", { name: "Inscribir atleta" }).click();
      const dialog = page.getByRole("dialog", { name: "Inscribir atleta" });
      await dialog.getByLabel("Buscar por nombre o CI").fill(name);
      await dialog
        .getByRole("listitem")
        .filter({ hasText: name })
        .getByRole("button", { name: "Inscribir" })
        .click();
      const confirm = page.getByRole("dialog", {
        name: `¿Inscribir a ${name}?`,
      });
      await expect(confirm).toContainText("Cadete · Hasta 50kg");
      await confirm.getByRole("button", { name: "Sí, inscribir" }).click();
      await dialog.getByRole("button", { name: "Cerrar" }).click();
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }
  });

  test("iniciar el torneo y sortear la llave", async ({ page }) => {
    await page.goto(`/admin/torneos/${tournamentId}`);
    await page
      .getByRole("button", { name: "Cerrar inscripciones e iniciar torneo" })
      .click();
    await page.getByRole("button", { name: "Sí, cerrar e iniciar" }).click();
    await expect(
      page.getByRole("button", { name: "Finalizar torneo" }),
    ).toBeVisible();

    await page.goto(`/admin/categorias/${categoryId}`);
    await page.getByRole("button", { name: "Generar llave" }).click();
    await page.getByRole("button", { name: "Sí, generar" }).click();
    await expect(page.getByRole("button", { name: /^Anotar: / })).toBeVisible();
  });

  test("anotar la final y verla en vivo en el sitio público", async ({
    page,
    context,
  }) => {
    const visitor = await context.newPage();
    await visitor.goto(`/categorias/${categoryId}`);
    await expect(visitor.getByText("Combate en curso")).toBeVisible();

    await page.goto(`/admin/categorias/${categoryId}`);
    for (const round of [1, 2]) {
      await page.getByRole("button", { name: /^Anotar: / }).click();
      const score = page.getByRole("dialog", { name: /^Anotar / });
      await score.locator("input[name=red]").fill("9");
      await score.locator("input[name=blue]").fill("4");
      await score
        .getByRole("button", { name: `Guardar round ${round}` })
        .click();
      await page
        .getByRole("dialog", { name: `¿Guardar el round ${round}?` })
        .getByRole("button", { name: "Sí, guardar" })
        .click();
      if (round === 1) {
        await expect(
          score.getByRole("button", { name: "Guardar round 2" }),
        ).toBeVisible();
        await page.keyboard.press("Escape");
      }
    }

    // Two rounds to the red side: the final is over and the podium shows its champion.
    await expect(page.getByText("Campeón")).toBeVisible();

    // The visitor's page refreshes itself (every 5 s) and the admin's save cleared the cache.
    await expect(visitor.getByText("Campeón")).toBeVisible({ timeout: 20_000 });
    await expect(visitor.getByText("Combate en curso")).toHaveCount(0);
  });
});
