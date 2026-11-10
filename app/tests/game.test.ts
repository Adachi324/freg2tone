import { test } from "node:test";
import assert from "node:assert/strict";
import { createGame, act } from "../src/game.ts";
import type { Game } from "../src/game.ts";

function practice() {
  let g = createGame();
  g = act(g, { type: "approach" });
  g = act(g, { type: "arrived", run: g.run });
  g = act(g, { type: "next" });
  return act(g, { type: "next" });
}
function answer(g: Game, ids: ("C" | "D" | "E")[]) {
  ids.forEach((id, index) => {
    g = act(g, { type: "select", id });
    g = act(g, { type: "place", index });
  });
  return act(g, { type: "submit" });
}
function finish(g: Game) {
  return act(g, {
    type: "playbackFinished",
    run: g.run,
    taskId: g.submission!.taskId,
    submissionId: g.submission!.id,
  });
}
function challenge() {
  let g = practice();
  for (const id of ["C", "D", "E"] as const) {
    g = finish(answer(g, [id]));
    g = act(g, { type: "continue" });
  }
  return g;
}
test("三个引导关系完成后才能收起教学；撤表后根据re选择D", () => {
  let g = practice();
  assert.equal(act(g, { type: "continue" }).phase, "practice");
  g = finish(answer(g, ["C"]));
  g = act(g, { type: "continue" });
  assert.equal(g.phase, "practice");
  assert.equal(g.taskIndex, 1);
  g = finish(answer(g, ["D"]));
  g = act(g, { type: "continue" });
  g = finish(answer(g, ["E"]));
  g = act(g, { type: "continue" });
  assert.equal(g.phase, "challenge");
  assert.deepEqual(g.slots, [null]);
  g = answer(g, ["D"]);
  assert.equal(g.result, "right");
  assert.equal(g.phase, "challenge");
  g = finish(g);
  assert.equal(g.phase, "challenge");
});

test("空提交不算错；首答保留，正确提交后播放中求助不追改记录", () => {
  let g = challenge();
  g = act(g, { type: "submit" });
  assert.equal(g.result, "empty");
  assert.equal(g.records.c1, undefined);
  g = answer(g, ["C"]);
  const first = g.records.c1!.firstSubmission;
  assert.deepEqual(first, { answer: ["C"], correct: false, helped: false });
  assert.deepEqual(act(g, { type: "submit" }), g);
  g = finish(g);
  g = answer(g, ["D"]);
  g = act(g, { type: "help", open: true });
  assert.equal(g.records.c1!.helpUsed, false);
  assert.deepEqual(g.records.c1!.firstSubmission, first);
  assert.equal(g.records.c1!.wrongCount, 1);
  assert.equal(g.records.c1!.submissionCount, 2);
});
test("回看保留选择与槽位，暂停和过期播放不能推进", () => {
  let g = answer(challenge(), ["D"]);
  const original = g;
  g = act(g, { type: "help", open: true });
  g = act(g, { type: "portrait", value: true });
  g = act(g, { type: "suspend" });
  assert.deepEqual(finish(g), g);
  assert.equal(act(g, { type: "resume" }).suspended, true);
  g = act(g, { type: "portrait", value: false });
  g = act(g, { type: "resume" });
  assert.equal(g.help, true);
  g = act(g, { type: "help", open: false });
  assert.deepEqual(g.slots, ["D"]);
  assert.deepEqual(
    act(g, {
      type: "playbackFinished",
      run: 0,
      taskId: "c1",
      submissionId: g.submission!.id,
    }),
    g,
  );
  assert.equal(finish(g).phase, "challenge");
  assert.equal(original.help, false);
});

test("两道单音不提前开桥；三槽顺序错误可修正，最终播放完成才通行", () => {
  let g = finish(answer(challenge(), ["D"]));
  assert.equal(g.phase, "challenge");
  g = act(g, { type: "continue" });
  assert.equal(g.taskIndex, 1);
  g = finish(answer(g, ["E"]));
  g = act(g, { type: "continue" });
  assert.deepEqual(g.slots, [null, null, null]);
  g = answer(g, ["C", "D", "E"]);
  assert.equal(g.result, "wrong");
  g = finish(g);
  assert.equal(g.phase, "challenge");
  g = answer(g, ["E", "D", "C"]);
  assert.equal(g.result, "right");
  assert.equal(g.phase, "challenge");
  assert.equal(g.records.c3!.submissionCount, 2);
  g = finish(g);
  assert.equal(g.phase, "bridge");
});

test("更换题目使旧提交失效；空槽不计错，帮助与首答逐题独立", () => {
  let g = answer(challenge(), ["D"]);
  const old = g.submission!;
  g = finish(g);
  g = act(g, { type: "continue" });
  assert.deepEqual(
    act(g, {
      type: "playbackFinished",
      run: g.run,
      taskId: old.taskId,
      submissionId: old.id,
    }),
    g,
  );
  g = act(g, { type: "help", open: true });
  g = act(g, { type: "help", open: false });
  assert.equal(g.records.c1!.helpUsed, false);
  g = finish(answer(g, ["E"]));
  assert.equal(g.records.c2!.firstSubmission!.helped, true);
  g = act(g, { type: "continue" });
  g = act(g, { type: "select", id: "C" });
  g = act(g, { type: "place", index: 0 });
  g = act(g, { type: "place", index: 2 });
  assert.deepEqual(g.slots, ["C", null, "C"]);
  g = act(g, { type: "submit" });
  assert.equal(g.result, "empty");
  assert.equal(g.records.c3, undefined);
  assert.deepEqual(act(g, { type: "place", index: 4 }), g);
});

test("完成摘要区分首答、重试与帮助；新run保留上一轮且重复音可通过", () => {
  let g = challenge();
  g = finish(answer(g, ["C"]));
  g = finish(answer(g, ["D"]));
  g = act(g, { type: "continue" });
  g = act(g, { type: "help", open: true });
  g = act(g, { type: "help", open: false });
  g = finish(answer(g, ["E"]));
  g = act(g, { type: "continue" });
  g = finish(answer(g, ["E", "D", "C"]));
  g = act(g, { type: "bridgeReady", run: g.run });
  g = act(g, { type: "exitReached", run: g.run });
  g = act(g, { type: "replay" });
  assert.equal(g.run, 2);
  assert.deepEqual(
    g.lastResult?.attempts.map((a) => a.kind),
    ["retry", "help", "first"],
  );
  assert.deepEqual(g.lastResult?.sequence, ["E", "D", "C"]);
  assert.deepEqual(g.records, {});
  g = act(g, { type: "approach" });
  g = act(g, { type: "arrived", run: 2 });
  g = act(g, { type: "next" });
  g = act(g, { type: "next" });
  for (const id of ["C", "D", "E"] as const) {
    g = finish(answer(g, [id]));
    g = act(g, { type: "continue" });
  }
  g = finish(answer(g, ["E"]));
  g = act(g, { type: "continue" });
  g = finish(answer(g, ["D"]));
  g = act(g, { type: "continue" });
  g = answer(g, ["C", "E", "C"]);
  assert.equal(g.result, "right");
  assert.equal(g.records.c3!.firstSubmission!.helped, false);
  assert.equal(finish(g).phase, "bridge");
  assert.deepEqual(
    g.lastResult?.attempts.map((a) => a.kind),
    ["retry", "help", "first"],
  );
});
