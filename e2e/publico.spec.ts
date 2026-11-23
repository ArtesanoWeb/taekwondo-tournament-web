import { expect, test } from "@playwright/test";

// The public site with the demo data of `npm run seed` (scripts/e2e-api.sh loads it).

test("un torneo en curso: categorías, llave en vivo y detalle de un combate", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Copa de Prueba 2026/ }).click();

  await expect(
    page.getByRole("heading", { level: 1, name: "Copa de Prueba 2026" }),
  ).toBeVisible();
  await expect(page.getByText("En vivo").first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Ranking de clubes/ }),
  ).toBeVisible();

  // Cadete · Hasta 45kg: 8 athletes and 5 matches played, so there are matches being fought.
  await page.getByRole("link", { name: /Cadete · Hasta 45kg/ }).click();
  await expect(page.getByText("Combate en curso").first()).toBeVisible();

  // The first match of the bracket is finished: its detail lists the rounds.
  await page
    .getByRole("button", { name: /^Ver combate:/ })
    .first()
    .click();
  const detail = page.getByRole("dialog");
  await expect(detail.getByText("Finalizado")).toBeVisible();
  await expect(
    detail.getByRole("rowheader", { name: "Round 1" }),
  ).toBeVisible();
  await expect(detail.getByText(/^Ganó .+, \d rounds a \d\.$/)).toBeVisible();
  await detail.getByRole("button", { name: "Cerrar" }).click();
  await expect(detail).toBeHidden();
});

test("un torneo finalizado: podio y ranking de clubes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Copa Invierno 2025/ }).click();
  await page.getByRole("link", { name: /Cadete · Hasta 45kg/ }).click();
  await expect(page.getByText("Campeón")).toBeVisible();

  await page.goBack();
  await page.getByRole("link", { name: /Ranking de clubes/ }).click();
  await expect(
    page.getByText("Con la única categoría del torneo."),
  ).toBeVisible();
  const clubs = page.getByRole("listitem").filter({ hasText: "puntos" });
  await expect(clubs.first()).toContainText("7");
});

test("un torneo con inscripciones abiertas: inscritos sin llave ni ranking", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Torneo de Primavera 2027/ }).click();
  await expect(
    page.getByRole("link", { name: /Ranking de clubes/ }),
  ).toHaveCount(0);
  await expect(page.getByText("En vivo")).toHaveCount(0);

  await page
    .getByRole("link", { name: /Cadete/ })
    .first()
    .click();
  await expect(
    page.getByText(/Las inscripciones están abiertas/),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /inscritos?$/ }),
  ).toBeVisible();
});
