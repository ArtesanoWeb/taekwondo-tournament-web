// Validation of a round's score, shared by the admin form (instant feedback) and its Server Action
// (the API accepts negative points, so the frontend is the one that rejects them).

export const MAX_ROUND_POINTS = 99;

export type RoundPoints = { red: number; blue: number };

type ParsedRound =
  { ok: true; points: RoundPoints } | { ok: false; error: string };

function parsePoints(value: unknown): number | undefined {
  if (typeof value !== "string" || !/^\d+$/.test(value.trim()))
    return undefined;
  const points = Number(value);
  return points <= MAX_ROUND_POINTS ? points : undefined;
}

export function parseRoundPoints(red: unknown, blue: unknown): ParsedRound {
  const redPoints = parsePoints(red);
  const bluePoints = parsePoints(blue);
  if (redPoints === undefined || bluePoints === undefined) {
    return {
      ok: false,
      error: `Los puntos de cada lado deben ser un número entero de 0 a ${MAX_ROUND_POINTS}.`,
    };
  }
  if (redPoints === bluePoints) {
    return { ok: false, error: "Un round no puede terminar en empate." };
  }
  return { ok: true, points: { red: redPoints, blue: bluePoints } };
}
