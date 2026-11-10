import { challengeTasks, practiceTasks, noteIds } from "./lesson.ts";
import type { MaterialId, Task } from "./lesson.ts";
export type { MaterialId } from "./lesson.ts";
export type Phase =
  | "arrival"
  | "approach"
  | "intro"
  | "demo"
  | "practice"
  | "challenge"
  | "bridge"
  | "crossing"
  | "complete";
export type Attempt = {
  taskId: string;
  firstSubmission: {
    answer: MaterialId[];
    correct: boolean;
    helped: boolean;
  } | null;
  submissionCount: number;
  wrongCount: number;
  helpUsed: boolean;
  completed: boolean;
};
export type Submission = {
  id: number;
  taskId: string;
  answer: MaterialId[];
  correct: boolean;
  playing: boolean;
};
export type ResultSummary = {
  run: number;
  sequence: readonly MaterialId[];
  attempts: readonly (Attempt & { kind: "first" | "retry" | "help" })[];
};
export type Game = {
  phase: Phase;
  run: number;
  selected: MaterialId | null;
  taskIndex: number;
  slots: (MaterialId | null)[];
  submission: Submission | null;
  nextSubmissionId: number;
  records: Record<string, Attempt>;
  lastResult: ResultSummary | null;
  help: boolean;
  portrait: boolean;
  suspended: boolean;
  result: "wrong" | "right" | "empty" | null;
};
export type Action =
  | {
      type:
        | "approach"
        | "next"
        | "submit"
        | "continue"
        | "suspend"
        | "resume"
        | "replay";
    }
  | { type: "arrived" | "bridgeReady" | "exitReached"; run: number }
  | {
      type: "playbackFinished";
      run: number;
      taskId: string;
      submissionId: number;
    }
  | { type: "select"; id: MaterialId }
  | { type: "place"; index: number }
  | { type: "help"; open: boolean }
  | { type: "portrait"; value: boolean };
export function createGame(): Game {
  return {
    phase: "arrival",
    run: 1,
    selected: null,
    taskIndex: 0,
    slots: [null],
    submission: null,
    nextSubmissionId: 1,
    records: {},
    lastResult: null,
    help: false,
    portrait: false,
    suspended: false,
    result: null,
  };
}
export function paused(g: Game): boolean {
  return g.help || g.portrait || g.suspended;
}
export function currentTask(g: Game): Task {
  return (g.phase === "practice" ? practiceTasks : challengeTasks(g.run))[
    g.taskIndex
  ]!;
}
export function editable(g: Game): boolean {
  return (
    !paused(g) &&
    ["practice", "challenge"].includes(g.phase) &&
    !g.submission?.playing &&
    g.result !== "right"
  );
}
function attempt(g: Game, id: string): Attempt {
  return (
    g.records[id] || {
      taskId: id,
      firstSubmission: null,
      submissionCount: 0,
      wrongCount: 0,
      helpUsed: false,
      completed: false,
    }
  );
}
function moveTo(g: Game, phase: Phase, index: number): Game {
  const task = (phase === "practice" ? practiceTasks : challengeTasks(g.run))[
    index
  ]!;
  return {
    ...g,
    phase,
    taskIndex: index,
    selected: null,
    slots: task.target.map(() => null),
    submission: null,
    result: null,
  };
}
export function act(g: Game, action: Action): Game {
  if (action.type === "portrait") return { ...g, portrait: action.value };
  if (action.type === "suspend") return { ...g, suspended: true };
  if (action.type === "resume")
    return g.portrait ? g : { ...g, suspended: false };
  if (action.type === "help" && !g.suspended && !g.portrait) {
    if (
      !["practice", "challenge", "bridge", "crossing", "complete"].includes(
        g.phase,
      )
    )
      return g;
    let records = g.records;
    if (action.open && ["practice", "challenge"].includes(g.phase)) {
      const t = currentTask(g),
        a = attempt(g, t.id);
      if (!a.completed)
        records = { ...records, [t.id]: { ...a, helpUsed: true } };
    }
    return { ...g, help: action.open, records };
  }
  if (paused(g)) return g;
  if (action.type === "replay" && g.phase === "complete")
    return { ...createGame(), run: g.run + 1, lastResult: resultSummary(g) };
  if (action.type === "approach" && g.phase === "arrival")
    return { ...g, phase: "approach" };
  if (
    action.type === "arrived" &&
    action.run === g.run &&
    g.phase === "approach"
  )
    return { ...g, phase: "intro" };
  if (action.type === "next") {
    if (g.phase === "intro") return { ...g, phase: "demo" };
    if (g.phase === "demo") return moveTo(g, "practice", 0);
  }
  if (action.type === "select" && editable(g) && noteIds.includes(action.id))
    return { ...g, selected: action.id };
  if (
    action.type === "place" &&
    editable(g) &&
    Number.isInteger(action.index) &&
    action.index >= 0 &&
    action.index < g.slots.length
  ) {
    if (!g.selected) return { ...g, result: "empty" };
    const slots = [...g.slots];
    slots[action.index] = g.selected;
    return { ...g, slots, result: null };
  }
  if (action.type === "submit" && editable(g)) {
    if (g.slots.some((id) => id === null)) return { ...g, result: "empty" };
    const t = currentTask(g),
      answer = g.slots as MaterialId[],
      correct = answer.every((id, i) => id === t.target[i]);
    const a = attempt(g, t.id);
    const record: Attempt = {
      ...a,
      firstSubmission: a.firstSubmission || {
        answer: [...answer],
        correct,
        helped: a.helpUsed,
      },
      submissionCount: a.submissionCount + 1,
      wrongCount: a.wrongCount + (correct ? 0 : 1),
      completed: correct,
    };
    return {
      ...g,
      result: correct ? "right" : "wrong",
      records: { ...g.records, [t.id]: record },
      nextSubmissionId: g.nextSubmissionId + 1,
      submission: {
        id: g.nextSubmissionId,
        taskId: t.id,
        answer: [...answer],
        correct,
        playing: true,
      },
    };
  }
  if (
    action.type === "playbackFinished" &&
    action.run === g.run &&
    g.submission?.playing &&
    action.taskId === g.submission.taskId &&
    action.submissionId === g.submission.id
  ) {
    const last =
      g.phase === "challenge" &&
      g.taskIndex === challengeTasks(g.run).length - 1;
    return {
      ...g,
      submission: { ...g.submission, playing: false },
      phase: last && g.submission.correct ? "bridge" : g.phase,
    };
  }
  if (
    action.type === "continue" &&
    g.result === "right" &&
    !g.submission?.playing
  ) {
    if (g.phase === "practice")
      return g.taskIndex < practiceTasks.length - 1
        ? moveTo(g, "practice", g.taskIndex + 1)
        : moveTo(g, "challenge", 0);
    if (
      g.phase === "challenge" &&
      g.taskIndex < challengeTasks(g.run).length - 1
    )
      return moveTo(g, "challenge", g.taskIndex + 1);
  }
  if ("run" in action && action.run === g.run) {
    if (action.type === "bridgeReady" && g.phase === "bridge")
      return { ...g, phase: "crossing" };
    if (action.type === "exitReached" && g.phase === "crossing")
      return { ...g, phase: "complete" };
  }
  return g;
}

export function resultSummary(g: Game): ResultSummary {
  return {
    run: g.run,
    sequence: [...(g.submission?.answer || [])],
    attempts: challengeTasks(g.run)
      .map((t) => g.records[t.id])
      .filter((a): a is Attempt => !!a)
      .map((a) => ({
        ...a,
        firstSubmission: a.firstSubmission
          ? { ...a.firstSubmission, answer: [...a.firstSubmission.answer] }
          : null,
        kind: a.helpUsed ? "help" : a.wrongCount ? "retry" : "first",
      })),
  };
}
