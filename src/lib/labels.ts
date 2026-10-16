import type {
  BeltGroup,
  Discipline,
  Gender,
  MatchStatus,
  TournamentStatus,
} from "@/lib/api/types";

// Typed as Record<Enum, string> so a new enum value in the API fails the typecheck until translated.

export const tournamentStatusLabels: Record<TournamentStatus, string> = {
  draft: "Borrador",
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

export const disciplineLabels: Record<Discipline, string> = {
  sparring: "Combate",
};
