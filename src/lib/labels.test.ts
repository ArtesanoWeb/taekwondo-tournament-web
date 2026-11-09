import { describe, expect, it } from "vitest";

import { tournamentStatusLabels } from "./labels";

describe("tournamentStatusLabels", () => {
  it("names each status for the admin", () => {
    expect(tournamentStatusLabels).toEqual({
      draft: "Inscripciones abiertas",
      in_progress: "En curso",
      finished: "Finalizado",
    });
  });
});
