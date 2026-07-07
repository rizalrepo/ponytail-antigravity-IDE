const fs = require("fs");
const fsp = require("fs/promises");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const {
  DEFAULT_MODE,
  VALID_MODES,
  getGainScoreboardMarkdown,
  getPonytailInstructions,
  isDeactivationCommand,
  normalizeMode,
  parseModeFromPrompt,
  readSkillMarkdown,
} = require("./ponytail-core");

const PARTICIPANT_ID = "rizalrepo.ponytail";
const RUNTIME_COMMANDS = {
  mode: "ponytailMode",
  status: "ponytailStatus",
  defaultMode: "ponytailDefault",
  sync: "ponytailSync",
};
const SKIP_DIRS = new Set([
  ".git",
  ".hg",
  ".svn",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".nuxt",
  ".turbo",
  "vendor",
  "out",
]);
const DEBT_MARKER = /(?:#|\/\/|--|;)\s*ponytail:\s*(.*)/i;

function getSkillNames(repoRoot) {
  const skillsRoot = path.join(repoRoot, "skills");
  return fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(skillsRoot, name, "SKILL.md")));
}

function getTargetRoots() {
  const appData = process.env.APPDATA;

  if (appData) {
    return [path.join(appData, "Antigravity IDE", "User", "prompts")];
  }

  const configHome =
    process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
  return [path.join(configHome, "Antigravity IDE", "User", "prompts")];
}

async function syncSkills() {
  const repoRoot = __dirname;
  const skillsRoot = path.join(repoRoot, "skills");
  const skillNames = getSkillNames(repoRoot);
  const targetRoots = getTargetRoots();

  for (const targetRoot of targetRoots) {
    await fsp.mkdir(targetRoot, { recursive: true });

    for (const skillName of skillNames) {
      const sourceFile = path.join(skillsRoot, skillName, "SKILL.md");
      const targetFile = path.join(targetRoot, skillName, "SKILL.md");

      await fsp.mkdir(path.dirname(targetFile), { recursive: true });
      await fsp.copyFile(sourceFile, targetFile);
    }
  }

  return {
    skillCount: skillNames.length,
    targetRoots,
  };
}

function getConfiguration() {
  return vscode.workspace.getConfiguration("ponytail");
}

function getDefaultMode() {
  return normalizeMode(getConfiguration().get("defaultMode")) || DEFAULT_MODE;
}

function getStatusBarEnabled() {
  return Boolean(getConfiguration().get("showStatusBar", true));
}

function createRuntimeState() {
  return {
    mode: getDefaultMode(),
    statusBarItem: vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    ),
  };
}

function getStatusMarkdown(state) {
  return [
    "# Ponytail Status",
    "",
    `- Session mode: **${state.mode}**`,
    `- Default mode: **${getDefaultMode()}**`,
    `- Status bar: **${getStatusBarEnabled() ? "visible" : "hidden"}**`,
  ].join("\n");
}

function updateStatusBar(state) {
  state.statusBarItem.command = "ponytail.showStatus";
  state.statusBarItem.tooltip = "Show Ponytail status";

  if (!getStatusBarEnabled() || state.mode === "off") {
    state.statusBarItem.hide();
    return;
  }

  state.statusBarItem.text = `PONYTAIL:${state.mode.toUpperCase()}`;
  state.statusBarItem.show();
}

function setSessionMode(state, mode) {
  state.mode = normalizeMode(mode) || DEFAULT_MODE;
  updateStatusBar(state);
}

async function pickMode(placeHolder, allowOff = true) {
  const modes = allowOff
    ? VALID_MODES
    : VALID_MODES.filter((mode) => mode !== "off");
  const selected = await vscode.window.showQuickPick(modes, { placeHolder });
  return normalizeMode(selected);
}

async function setDefaultMode(mode) {
  const normalized = normalizeMode(mode);
  if (!normalized) {
    return null;
  }

  await getConfiguration().update(
    "defaultMode",
    normalized,
    vscode.ConfigurationTarget.Global,
  );

  return normalized;
}

function getHelpMarkdown(state) {
  const help = readSkillMarkdown(__dirname, "ponytail-help");
  return `${getStatusMarkdown(state)}\n\n${help}`;
}

function getReferenceText(request) {
  if (!request.references || request.references.length === 0) {
    return "";
  }

  return request.references
    .map((reference) => {
      const description =
        reference.modelDescription || String(reference.value || "");
      return `- ${description}`;
    })
    .join("\n");
}

function getHistoryMessages(context) {
  if (!context || !Array.isArray(context.history)) {
    return [];
  }

  const messages = [];

  for (const turn of context.history.slice(-6)) {
    if (turn instanceof vscode.ChatRequestTurn) {
      messages.push(vscode.LanguageModelChatMessage.User(turn.prompt));
      continue;
    }

    if (turn instanceof vscode.ChatResponseTurn) {
      const responseText = turn.response
        .map((part) => {
          if (!part || part.value === undefined || part.value === null) {
            return "";
          }

          if (typeof part.value === "string") {
            return part.value;
          }

          if (typeof part.value.value === "string") {
            return part.value.value;
          }

          return "";
        })
        .join("\n")
        .trim();

      if (responseText) {
        messages.push(vscode.LanguageModelChatMessage.Assistant(responseText));
      }
    }
  }

  return messages;
}

async function runModelBackedSkill(
  skillName,
  request,
  context,
  stream,
  token,
  state,
) {
  const repoRoot = __dirname;
  const defaultPrompts = {
    ponytail: "Answer the user's request using Ponytail mode.",
    review: "Review the current change for over-engineering only.",
    audit: "Audit the current workspace for over-engineering only.",
  };

  const instructions =
    skillName === "ponytail"
      ? getPonytailInstructions(repoRoot, state.mode)
      : readSkillMarkdown(repoRoot, `ponytail-${skillName}`);
  const references = getReferenceText(request);
  const userPrompt =
    (request.prompt || "").trim() ||
    defaultPrompts[skillName] ||
    "Help with Ponytail.";
  const history = getHistoryMessages(context);
  const composedPrompt = [
    instructions,
    references ? `Attached references:\n${references}` : "",
    `User request:\n${userPrompt}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  stream.progress(`Running Ponytail ${skillName}...`);

  const response = await request.model.sendRequest(
    [...history, vscode.LanguageModelChatMessage.User(composedPrompt)],
    {
      justification: "Answering a Ponytail request in Antigravity IDE.",
    },
    token,
  );

  for await (const chunk of response.text) {
    stream.markdown(chunk);
  }
}

async function scanDirectory(rootPath, currentPath, entries) {
  const directoryEntries = await fsp.readdir(currentPath, {
    withFileTypes: true,
  });

  for (const entry of directoryEntries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) {
        continue;
      }

      await scanDirectory(
        rootPath,
        path.join(currentPath, entry.name),
        entries,
      );
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const filePath = path.join(currentPath, entry.name);
    let content;
    try {
      content = await fsp.readFile(filePath, "utf8");
    } catch {
      continue;
    }

    const lines = content.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const match = lines[index].match(DEBT_MARKER);
      if (!match) {
        continue;
      }

      entries.push({
        file: path.relative(rootPath, filePath).replace(/\\/g, "/"),
        line: index + 1,
        detail: match[1].trim(),
      });
    }
  }
}

async function collectDebtEntries() {
  const entries = [];

  for (const folder of vscode.workspace.workspaceFolders || []) {
    await scanDirectory(folder.uri.fsPath, folder.uri.fsPath, entries);
  }

  return entries;
}

function hasTrigger(detail) {
  return /(if|when|until|once|after|upgrade|revisit|trigger)/i.test(detail);
}

function formatDebtMarkdown(entries) {
  if (entries.length === 0) {
    return "No `ponytail:` debt. Clean ledger.";
  }

  const lines = ["# Ponytail Debt", ""];
  let missingTriggerCount = 0;

  for (const entry of entries) {
    const noTrigger = hasTrigger(entry.detail) ? "" : " `no-trigger`";
    if (!hasTrigger(entry.detail)) {
      missingTriggerCount += 1;
    }

    lines.push(`- ${entry.file}:${entry.line}, ${entry.detail}.${noTrigger}`);
  }

  lines.push("");
  lines.push(
    `${entries.length} markers, ${missingTriggerCount} with no trigger.`,
  );
  return lines.join("\n");
}

function getRuntimeSlashHelpMarkdown(state) {
  return [
    "# Ponytail Slash Commands",
    "",
    `- Prompt commands: **/ponytail**, **/ponytail-help**, **/ponytail-review**, **/ponytail-audit**, **/ponytail-debt**, **/ponytail-gain**, **/ponytail-update**`,
    `- Runtime commands: **/${RUNTIME_COMMANDS.mode} <lite|full|ultra|off>**, **/${RUNTIME_COMMANDS.status}**, **/${RUNTIME_COMMANDS.defaultMode} <lite|full|ultra|off>**, **/${RUNTIME_COMMANDS.sync}**`,
    "",
    getStatusMarkdown(state),
  ].join("\n");
}

async function handleChatRequest(request, context, stream, token, state) {
  if (request.command === RUNTIME_COMMANDS.mode) {
    const requestedMode = parseModeFromPrompt(request.prompt);
    if (!requestedMode) {
      stream.markdown(
        `Usage: \`/${RUNTIME_COMMANDS.mode} <off|lite|full|ultra>\``,
      );
      return { metadata: { kind: "help" } };
    }

    setSessionMode(state, requestedMode);
    stream.markdown(`Ponytail session mode is now **${state.mode}**.`);
    return { metadata: { kind: "mode", mode: state.mode } };
  }

  if (request.command === RUNTIME_COMMANDS.defaultMode) {
    const defaultMode = parseModeFromPrompt(request.prompt);
    if (!defaultMode) {
      stream.markdown(
        `Usage: \`/${RUNTIME_COMMANDS.defaultMode} <off|lite|full|ultra>\``,
      );
      return { metadata: { kind: "help" } };
    }

    await setDefaultMode(defaultMode);
    stream.markdown(
      `Ponytail default mode for future IDE sessions is now **${defaultMode}**.`,
    );
    return { metadata: { kind: "default", mode: defaultMode } };
  }

  if (request.command === RUNTIME_COMMANDS.status) {
    stream.markdown(getStatusMarkdown(state));
    return { metadata: { kind: "status" } };
  }

  if (request.command === "help") {
    stream.markdown(getRuntimeSlashHelpMarkdown(state));
    return { metadata: { kind: "help" } };
  }

  if (request.command === RUNTIME_COMMANDS.sync) {
    const result = await syncSkills();
    stream.markdown(
      `Synced **${result.skillCount}** Ponytail skills into Antigravity IDE prompts.`,
    );
    return { metadata: { kind: "sync" } };
  }

  if (request.command === "update") {
    const result = await syncSkills();
    stream.markdown(
      `Updated **${result.skillCount}** Ponytail skills in Antigravity IDE prompts.`,
    );
    return { metadata: { kind: "sync" } };
  }

  if (request.command === "gain") {
    stream.markdown(getGainScoreboardMarkdown());
    return { metadata: { kind: "gain" } };
  }

  if (request.command === "debt") {
    const entries = await collectDebtEntries();
    stream.markdown(formatDebtMarkdown(entries));
    return { metadata: { kind: "debt" } };
  }

  if (isDeactivationCommand(request.prompt) || request.command === "off") {
    setSessionMode(state, "off");
    stream.markdown("Ponytail is now **off** for this IDE session.");
    return { metadata: { kind: "mode", mode: state.mode } };
  }

  if (request.command === "review" || request.command === "audit") {
    await runModelBackedSkill(
      request.command,
      request,
      context,
      stream,
      token,
      state,
    );
    return { metadata: { kind: request.command } };
  }

  if (state.mode === "off") {
    stream.markdown(
      `Ponytail is off for this IDE session. Use \`/${RUNTIME_COMMANDS.mode} full\`, \`/${RUNTIME_COMMANDS.mode} lite\`, or \`/${RUNTIME_COMMANDS.mode} ultra\` to turn it back on.`,
    );
    return { metadata: { kind: "help" } };
  }

  await runModelBackedSkill("ponytail", request, context, stream, token, state);
  return { metadata: { kind: "ponytail", mode: state.mode } };
}

function getFollowups(result) {
  const kind = result && result.metadata ? result.metadata.kind : undefined;

  if (kind === "help") {
    return [
      {
        prompt: "ultra",
        label: "Use ultra",
        command: RUNTIME_COMMANDS.mode,
      },
      {
        prompt: "show current Ponytail status",
        label: "Show status",
        command: RUNTIME_COMMANDS.status,
      },
    ];
  }

  if (kind === "mode") {
    return [
      {
        prompt: "show Ponytail slash commands",
        label: "Open help",
        command: "help",
      },
      {
        prompt: "review this for over-engineering",
        label: "Review",
        command: "review",
      },
    ];
  }

  return [
    { prompt: "show Ponytail slash commands", label: "Help", command: "help" },
    {
      prompt: "show current Ponytail status",
      label: "Status",
      command: RUNTIME_COMMANDS.status,
    },
  ];
}

async function openHelp() {
  const helpPath = path.join(__dirname, "skills", "ponytail-help", "SKILL.md");
  const document = await vscode.workspace.openTextDocument(helpPath);
  await vscode.window.showTextDocument(document, { preview: false });
}

async function openPromptsFolder() {
  const appData = process.env.APPDATA;

  if (!appData) {
    vscode.window.showWarningMessage("APPDATA is not set on this machine.");
    return;
  }

  const promptsRoot = path.join(appData, "Antigravity IDE", "User", "prompts");
  await fsp.mkdir(promptsRoot, { recursive: true });
  const uri = vscode.Uri.file(promptsRoot);
  await vscode.commands.executeCommand("revealFileInOS", uri);
}

async function showStatus(state) {
  const document = await vscode.workspace.openTextDocument({
    content: getStatusMarkdown(state),
    language: "markdown",
  });
  await vscode.window.showTextDocument(document, { preview: false });
}

async function showSlashRuntimeHelp(state) {
  const document = await vscode.workspace.openTextDocument({
    content: getRuntimeSlashHelpMarkdown(state),
    language: "markdown",
  });
  await vscode.window.showTextDocument(document, { preview: false });
}

async function activate(context) {
  const state = createRuntimeState();
  updateStatusBar(state);

  context.subscriptions.push(state.statusBarItem);

  try {
    await syncSkills();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showWarningMessage(
      `Ponytail could not sync skills automatically: ${message}`,
    );
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("ponytail.showStatusBar")) {
        updateStatusBar(state);
      }
    }),
  );

  const participant = vscode.chat.createChatParticipant(
    PARTICIPANT_ID,
    (request, chatContext, stream, token) =>
      handleChatRequest(request, chatContext, stream, token, state),
  );
  participant.iconPath = new vscode.ThemeIcon("zap");
  participant.followupProvider = {
    provideFollowups(result) {
      return getFollowups(result);
    },
  };
  context.subscriptions.push(participant);

  context.subscriptions.push(
    vscode.commands.registerCommand("ponytail.syncSkills", async () => {
      const result = await syncSkills();
      vscode.window.showInformationMessage(
        `Ponytail synced ${result.skillCount} skills into Antigravity IDE prompts.`,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ponytail.setSessionMode", async (mode) => {
      const selectedMode =
        normalizeMode(mode) ||
        (await pickMode("Select a Ponytail session mode"));
      if (!selectedMode) {
        return;
      }

      setSessionMode(state, selectedMode);
      vscode.window.showInformationMessage(
        `Ponytail session mode is now ${selectedMode}.`,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ponytail.setDefaultMode", async (mode) => {
      const selectedMode =
        normalizeMode(mode) ||
        (await pickMode("Select a default Ponytail mode"));
      if (!selectedMode) {
        return;
      }

      await setDefaultMode(selectedMode);
      vscode.window.showInformationMessage(
        `Ponytail default mode is now ${selectedMode} for future IDE sessions.`,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ponytail.showStatus", () =>
      showStatus(state),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ponytail.runSlashRuntimeHelp", () =>
      showSlashRuntimeHelp(state),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ponytail.updateSkills", async () => {
      const result = await syncSkills();
      vscode.window.showInformationMessage(
        `Ponytail updated ${result.skillCount} skills in Antigravity IDE prompts.`,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ponytail.openHelp", openHelp),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "ponytail.openPromptsFolder",
      openPromptsFolder,
    ),
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
