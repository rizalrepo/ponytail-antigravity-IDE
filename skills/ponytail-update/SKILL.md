---
name: ponytail-update
description: >
  Updates the global ponytail and ponytail-review skills to their latest versions
  from GitHub, keeping the user's custom settings (default ultra mode, active
  by default). Triggered by the slash command /ponytail-update or when the user
  asks to update ponytail.
---

# Ponytail Update

When this skill is triggered, you must perform the following steps to dynamically update the ponytail skills:

1. **Dynamically List All Skills on GitHub**:
   Query the GitHub API to list the folders inside the `skills/` directory of the `ponytail` repository. 
   - You can execute a command like:
     `powershell -Command "Invoke-RestMethod -Uri 'https://api.github.com/repos/rizalrepo/ponytail/contents/skills' -Headers @{'User-Agent' = 'Mozilla/5.0'} | Select-Object name"`
   - Parse this output to get the name of all directories (e.g., `ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`, and any future additions).

2. **Download Each Skill's SKILL.md**:
   For each skill name found in step 1, download its latest `SKILL.md` file from:
   `https://raw.githubusercontent.com/rizalrepo/ponytail/main/skills/{skill_name}/SKILL.md`

3. **Re-apply Custom "Ultra by Default" Settings**:
   If the skill name is `ponytail`, modify the downloaded `SKILL.md` file contents to preserve the user's global "ultra default" settings:
   - In the frontmatter `description` section, replace:
     `Supports intensity levels: lite, full (default), ultra.`
     with:
     `Active by default for ALL coding tasks. Channels a senior dev who has seen everything: question whether the task needs to exist at all (YAGNI), reach for the standard library before custom code, native platform features before dependencies, one line before fifty. Default mode is ultra.`
   - In the "Persistence" section, change:
     `Default: **full**.`
     to:
     `Default: **ultra**.`
   - In the "Intensity" table, change the `Default.` text location:
     Change:
     `| **full** | The ladder enforced. Stdlib and native first. Shortest diff, shortest explanation. Default. |`
     `| **ultra** | YAGNI extremist. Deletion before addition. Ship the one-liner and challenge the rest of the requirement in the same breath. |`
     to:
     `| **full** | The ladder enforced. Stdlib and native first. Shortest diff, shortest explanation. |`
     `| **ultra** | YAGNI extremist. Deletion before addition. Ship the one-liner and challenge the rest of the requirement in the same breath. Default. |`

4. **Write to Configuration Directory**:
   Write the `SKILL.md` file for each skill into `C:\Users\Rizal\.gemini\config\skills\{skill_name}\SKILL.md`. Create the folder if it does not exist.

5. **Print a Summary**:
   Confirm to the user which skills were updated and if any new skills were discovered and installed.
