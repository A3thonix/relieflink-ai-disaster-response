"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { classify, method, version } = require("../triage.js");

test("publishes a versioned, explainable local ML model", () => {
  assert.equal(version, "1.0.0");
  assert.match(method, /Naive Bayes/);
});

test("routes a clear medical request and explains its matching signals", () => {
  const result = classify("My father has chest pain and difficulty breathing, please send a doctor.");
  assert.equal(result.category, "medical");
  assert.ok(result.confidence > 0 && result.confidence <= 100);
  assert.equal(result.priority, "critical");
  assert.ok(result.evidence.length > 0);
});

test("recognizes an urgent Roman Urdu rescue request", () => {
  const result = classify("Hum pani mein phans gaye hain aur rescue chahiye");
  assert.equal(result.category, "rescue");
  assert.equal(result.priority, "critical");
});

test("distinguishes clean water and food needs from shelter requests", () => {
  assert.equal(classify("We have no drinking water and need food packages").category, "foodWater");
  assert.equal(classify("Our house collapsed and we need a temporary shelter tonight").category, "shelter");
});

test("flags a critical phrase even if the request category is unclear", () => {
  const result = classify("Trapped");
  assert.equal(result.priority, "critical");
  assert.equal(result.prioritySignals[0], "trapped");
});

test("does not escalate a negated risk phrase", () => {
  assert.equal(classify("We are not trapped and are safely outside").priority, "standard");
});

test("marks a lack of drinking water for urgent review", () => {
  assert.equal(classify("We have no drinking water left").priority, "urgent");
});

test("does not invent a category when there is not enough detail", () => {
  const result = classify("please");
  assert.equal(result.category, "unknown");
  assert.equal(result.confidence, 0);
});
