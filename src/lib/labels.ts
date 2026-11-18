import type {
  BeltGroup,
  Discipline,
  Gender,
  Grade,
  MatchStatus,
  TournamentStatus,
} from "@/lib/api/types";

// Typed as Record<Enum, string> so a new enum value in the API fails the typecheck until translated.

export const tournamentStatusLabels: Record<TournamentStatus, string> = {
  draft: "Inscripciones abiertas",
  in_progress: "En curso",
  finished: "Finalizado",
};

export const matchStatusLabels: Record<MatchStatus, string> = {
  pending: "Pendiente",
  bye: "Pase directo",
  finished: "Finalizado",
};

export const genderLabels: Record<Gender, string> = {
  male: "Masculino",
  female: "Femenino",
};

export const beltGroupLabels: Record<BeltGroup, string> = {
  color: "Cinturón de color",
  black: "Cinturón negro",
};

/** In the API's order, from the lowest grade to the highest: forms list them like this. */
export const gradeLabels: Record<Grade, string> = {
  kup_10: "10.º Kup",
  kup_9: "9.º Kup",
  kup_8: "8.º Kup",
  kup_7: "7.º Kup",
  kup_6: "6.º Kup",
  kup_5: "5.º Kup",
  kup_4: "4.º Kup",
  kup_3: "3.er Kup",
  kup_2: "2.º Kup",
  kup_1: "1.er Kup",
  dan: "Dan",
};

export const disciplineLabels: Record<Discipline, string> = {
  sparring: "Combate",
};
