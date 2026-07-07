const fs = require("fs");
const path = require("path");

const DEFAULT_MODE = "ultra";
const VALID_MODES = ["off", "lite", "full", "ultra"];

function normalizeMode(mode) {
  if (typeof mode !== "string") {
    return null;
  }

  const normalized = mode.trim().toLowerCase();
  return VALID_MODES.includes(normalized) ? normalized : null;
}

function isDeactivationCommand(text) {
  const normalized = String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[.!?\s]+$/, "");

  return normalized === "stop ponytail" || normalized === "normal mode";
}

function stripFrontmatter(text) {
  return String(text || "").replace(/^---[\s\S]*?---\s*/, "");
}

function readSkillMarkdown(repoRoot, skillName) {
  const skillPath = path.join(repoRoot, "skills", skillName, "SKILL.md");
  return stripFrontmatter(fs.readFileSync(skillPath, "utf8"));
}

function filterPonytailBodyForMode(body, mode) {
  const effectiveMode = normalizeMode(mode) || DEFAULT_MODE;

  return stripFrontmatter(body)
    .split(/\r?\n/)
    .filter((line) => {
      const tableLabel = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|/);
      if (tableLabel) {
        const labelMode = normalizeMode(tableLabel[1].trim());
        if (labelMode) {
          return labelMode === effectiveMode;
        }
      }

      const exampleLabel = line.match(/^-\s*([^:]+):\s*/);
      if (exampleLabel) {
        const labelMode = normalizeMode(exampleLabel[1].trim());
        if (labelMode) {
          return labelMode === effectiveMode;
        }
      }

      return true;
    })
    .join("\n");
}

function getPonytailInstructions(repoRoot, mode) {
  const effectiveMode = normalizeMode(mode) || DEFAULT_MODE;
  const body = readSkillMarkdown(repoRoot, "ponytail");

  return (
    `PONYTAIL MODE ACTIVE - level: ${effectiveMode}\n\n` +
    filterPonytailBodyForMode(body, effectiveMode)
  );
}

function parseModeFromPrompt(prompt) {
  if (typeof prompt !== "string") {
    return null;
  }

  const firstToken = prompt.trim().split(/\s+/)[0];
  return normalizeMode(firstToken);
}

function getGainScoreboardMarkdown() {
  return [
    "# Ponytail Gain",
    "",
    "```text",
    "  ponytail gain                     benchmark median · 5 tasks · 3 models",
    "",
    "  Lines of code   no-skill  ████████████████████  100%",
    "                  ponytail  ██▌·················    6–20%   ▼ 80–94%",
    "  Cost            no-skill  ████████████████████  100%",
    "                  ponytail  █████▌··············   23–53%  ▼ 47–77%",
    "  Speed           ponytail  ▸ 3–6× faster",
    "",
    "  This repo:  /ponytail-debt  (shortcuts you deferred)",
    "              /ponytail-audit (what's still cuttable)",
    "```",
    "",
    "These are published benchmark medians, not measurements from the current repo.",
  ].join("\n");
}

module.exports = {
  DEFAULT_MODE,
  VALID_MODES,
  filterPonytailBodyForMode,
  getGainScoreboardMarkdown,
  getPonytailInstructions,
  isDeactivationCommand,
  normalizeMode,
  parseModeFromPrompt,
  readSkillMarkdown,
  stripFrontmatter,
};
