import type { components } from "./schema";

type Schemas = components["schemas"];

export type Club = Schemas["ClubRead"];
export type Athlete = Schemas["AthleteRead"];
export type Tournament = Schemas["TournamentRead"];
export type Category = Schemas["CategoryRead"];
export type Registration = Schemas["RegistrationRead"];
export type Bracket = Schemas["BracketRead"];
export type Match = Schemas["MatchRead"];
export type RoundScore = Schemas["RoundScoreRead"];

export type TournamentStatus = Schemas["TournamentStatus"];
export type MatchStatus = Schemas["MatchStatus"];
export type Gender = Schemas["Gender"];
export type BeltGroup = Schemas["BeltGroup"];
export type Discipline = Schemas["Discipline"];
