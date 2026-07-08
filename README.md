# Ponytail for Antigravity IDE

Focused fork of `DietrichGebert/ponytail` for Antigravity IDE.
This extension brings Ponytail's lazy-senior-dev ruleset into Antigravity IDE,
defaults it to **ultra**, and adds slash-first Ponytail commands plus the
bundled Ponytail prompt skills.

## What This Fork Includes

- `package.json` + `extension.js` so Antigravity IDE can load Ponytail as an editor extension.
- Slash commands for Antigravity IDE prompt files and Ponytail runtime controls.
- `skills/` for Ponytail prompt cards and specialized prompts.
- Install scripts that copy the skills into `~/.gemini/config/skills` (Antigravity's global skills location).

## Recommended Installation

### Antigravity IDE Extension

Install Ponytail as a normal Antigravity IDE extension.

Option 1: from a VSIX release asset.

Option 2: build a VSIX from this repository, then in Antigravity IDE open the
Extensions view and choose `...` → `Install from VSIX...`.

Once installed, the extension syncs the bundled Ponytail skills into Antigravity's
global skills folder (`~/.gemini/config/skills`), shows the active Ponytail mode in the status bar, and gives you
these commands in the Command Palette:

- `Ponytail: Sync Skills`
- `Ponytail: Update Skills`
- `Ponytail: Set Session Mode`
- `Ponytail: Set Default Mode`
- `Ponytail: Show Current Status`
- `Ponytail: Open Help`
- `Ponytail: Open Antigravity Prompts Folder`

## Chat Usage

Antigravity IDE uses slash commands here, not `@` mentions.

Examples:

- `/ponytail`
- `/ponytail-help`
- `/ponytail-review`
- `/ponytail-audit`
- `/ponytail-debt`
- `/ponytail-gain`
- `/ponytail-update`

Runtime commands exposed by the extension itself:

- `/ponytailMode ultra`
- `/ponytailMode full`
- `/ponytailMode off`
- `/ponytailStatus`
- `/ponytailDefault ultra`
- `/ponytailSync`

The session mode is temporary and resets when Antigravity IDE starts a new
session. The persistent default mode is controlled by the `ponytail.defaultMode`
setting or the `/ponytailDefault` runtime command.

## Manual Fallback: Install Raw Skills Only

Use this only if you want the `SKILL.md` files copied into Antigravity's global
skills folder without packaging the editor extension. Skills placed here are
discovered automatically and exposed as slash commands (e.g. `/ponytail`).

The target folder is Antigravity's global skills location:

- Windows: `%USERPROFILE%\.gemini\config\skills`
- macOS/Linux: `~/.gemini/config/skills`

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/rizalrepo/ponytail-antigravity-IDE/main/install.ps1 | iex
```

### macOS / Linux (Terminal)

```bash
curl -fsSL https://raw.githubusercontent.com/rizalrepo/ponytail-antigravity-IDE/main/install.sh | bash
```

The installers resolve the repository's default branch dynamically before
downloading the skill files.

## What It Is For

Ponytail is for making Antigravity IDE behave like a lazy senior developer:

- prefer deletion over addition
- reuse what the codebase already has
- choose stdlib or native platform features before dependencies
- keep answers and diffs small unless the task really needs more

In practice, this extension's job is now two things:

- keep the Ponytail prompt files synchronized inside Antigravity IDE
- provide IDE-native slash runtime controls for session mode, default mode,
  status, and prompt synchronization

## Available Skills

1. **`ponytail`**: Forces the simplest, shortest, and most minimal solution.
2. **`ponytail-review`**: Review focused on over-engineering and code bloat.
3. **`ponytail-audit`**: Whole-repository audit for code that should be deleted or simplified.
4. **`ponytail-debt`**: Harvests every `ponytail:` shortcut comment into a debt ledger.
5. **`ponytail-gain`**: Scoreboard of estimated code, cost, and time savings.
6. **`ponytail-help`**: Quick-reference card for commands and modes.
7. **`ponytail-update`**: Refreshes locally installed skills from this repository.

## Scope

This fork is intentionally Antigravity IDE-only. It does not target Gemini,
Antigravity CLI, Claude, Codex, Copilot CLI, Hermes, or the rest of the
upstream host matrix.
