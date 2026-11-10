export type MaterialId = "C" | "D" | "E";
export type LabelMode = "letter" | "solfege" | "both";
export const notes = {
  C: { solfege: "do", frequency: 261.6256 },
  D: { solfege: "re", frequency: 293.6648 },
  E: { solfege: "mi", frequency: 329.6276 },
} as const;
export const noteIds: readonly MaterialId[] = ["C", "D", "E"];
export function label(id: MaterialId, mode: LabelMode): string {
  return mode === "letter"
    ? id
    : mode === "solfege"
      ? notes[id].solfege
      : `${id} / ${notes[id].solfege}`;
}
export type Task = {
  id: string;
  promptMode: LabelMode;
  materialMode: LabelMode;
  target: readonly MaterialId[];
  order: readonly MaterialId[];
};
export const practiceTasks: readonly Task[] = [
  {
    id: "p1",
    promptMode: "solfege",
    materialMode: "letter",
    target: ["C"],
    order: ["C", "D", "E"],
  },
  {
    id: "p2",
    promptMode: "solfege",
    materialMode: "letter",
    target: ["D"],
    order: ["E", "C", "D"],
  },
  {
    id: "p3",
    promptMode: "solfege",
    materialMode: "letter",
    target: ["E"],
    order: ["D", "E", "C"],
  },
];
const firstChallenge: readonly Task[] = [
  {
    id: "c1",
    promptMode: "solfege",
    materialMode: "letter",
    target: ["D"],
    order: ["C", "D", "E"],
  },
  {
    id: "c2",
    promptMode: "letter",
    materialMode: "solfege",
    target: ["E"],
    order: ["C", "E", "D"],
  },
  {
    id: "c3",
    promptMode: "solfege",
    materialMode: "letter",
    target: ["E", "D", "C"],
    order: ["D", "E", "C"],
  },
];
const replayChallenge: readonly Task[] = [
  {
    id: "c1",
    promptMode: "solfege",
    materialMode: "letter",
    target: ["E"],
    order: ["C", "D", "E"],
  },
  {
    id: "c2",
    promptMode: "letter",
    materialMode: "solfege",
    target: ["D"],
    order: ["E", "D", "C"],
  },
  {
    id: "c3",
    promptMode: "solfege",
    materialMode: "letter",
    target: ["C", "E", "C"],
    order: ["E", "C", "D"],
  },
];
export function challengeTasks(run: number): readonly Task[] {
  return run % 2 === 1 ? firstChallenge : replayChallenge;
}
