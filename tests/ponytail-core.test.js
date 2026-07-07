const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");

const root = path.join(__dirname, "..");
const {
  DEFAULT_MODE,
  filterPonytailBodyForMode,
  getGainScoreboardMarkdown,
  getPonytailInstructions,
  isDeactivationCommand,
  normalizeMode,
  parseModeFromPrompt,
  readSkillMarkdown,
} = require("../ponytail-core");

test("normalizeMode accepts valid modes", () => {
  assert.equal(normalizeMode(" ultra "), "ultra");
  assert.equal(normalizeMode("OFF"), "off");
  assert.equal(normalizeMode("weird"), null);
});

test("isDeactivationCommand only matches standalone stop phrases", () => {
  assert.equal(isDeactivationCommand("stop ponytail"), true);
  assert.equal(isDeactivationCommand("normal mode!"), true);
  assert.equal(
    isDeactivationCommand("add a normal mode toggle next to dark mode"),
    false,
  );
});

test("parseModeFromPrompt extracts the first mode token", () => {
  assert.equal(parseModeFromPrompt("ultra please"), "ultra");
  assert.equal(parseModeFromPrompt("full"), "full");
  assert.equal(parseModeFromPrompt("ship it"), null);
});

test("filterPonytailBodyForMode keeps only the requested intensity row and example", () => {
  const skill = readSkillMarkdown(root, "ponytail");
  const filtered = filterPonytailBodyForMode(skill, "lite");

  assert.match(filtered, /\| \*\*lite\*\*/i);
  assert.doesNotMatch(filtered, /\| \*\*full\*\*/i);
  assert.doesNotMatch(filtered, /\| \*\*ultra\*\*/i);
  assert.match(filtered, /- lite:/i);
  assert.doesNotMatch(filtered, /- full:/i);
  assert.doesNotMatch(filtered, /- ultra:/i);
});

test("getPonytailInstructions prefixes the active mode header", () => {
  const instructions = getPonytailInstructions(root, DEFAULT_MODE);
  assert.match(instructions, /PONYTAIL MODE ACTIVE - level: ultra/i);
  assert.match(instructions, /# Ponytail/);
});

test("gain scoreboard returns a stable markdown card", () => {
  const markdown = getGainScoreboardMarkdown();
  assert.match(markdown, /Ponytail Gain/);
  assert.match(markdown, /80–94%/);
  assert.match(markdown, /47–77%/);
});
