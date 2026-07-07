---
name: ponytail-update
description: >
  Refreshes locally installed Ponytail skills from this repository, preserving
  the fork's ultra-by-default behavior and using portable per-user install
  paths. Triggered by /ponytail-update or when the user asks to update ponytail.
---

# Ponytail Update

When this skill is triggered, perform the following steps:

1. **Resolve repository metadata**

- Query `https://api.github.com/repos/rizalrepo/ponytail-antigravity-IDE`.
- Read the repository's `default_branch`; do not hardcode `main` or `master`.

2. **Discover all skills dynamically**

- Query `https://api.github.com/repos/rizalrepo/ponytail-antigravity-IDE/contents/skills?ref={default_branch}`.
- Collect every directory name found inside `skills/`.

3. **Download each `SKILL.md`**

- For each skill name, download `https://raw.githubusercontent.com/rizalrepo/ponytail-antigravity-IDE/{default_branch}/skills/{skill_name}/SKILL.md`.
- If the GitHub API response exposes `download_url`, you may use that directly.

4. **Re-apply the fork's ultra-by-default behavior**

- If the skill name is `ponytail`, preserve these customizations in the downloaded content:
  - The description says Ponytail is active by default for coding tasks.
  - The persistence section says `Default: **ultra**.`
  - In the intensity table, `ultra` is marked as the default and `full` is not.
- If the skill name is `ponytail-help`, preserve the same ultra default in the levels/configuration text.

5. **Write to portable user paths**

- Primary install target:
  - Windows: `$env:APPDATA\Antigravity IDE\User\prompts\{skill_name}\SKILL.md`
  - macOS/Linux: `${XDG_CONFIG_HOME:-$HOME/.config}/Antigravity IDE/User/prompts/{skill_name}/SKILL.md`

6. **Create missing directories**

- Create the skill directory before writing the file.

7. **Print a short summary**

- Report the resolved default branch and the updated Antigravity IDE prompt commands.
