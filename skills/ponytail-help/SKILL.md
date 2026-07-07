---
name: ponytail-help
description: >
  Quick-reference card for all ponytail modes, skills, and commands.
  One-shot display, not a persistent mode. Trigger: /ponytail-help,
  "ponytail help", "what ponytail commands", "how do I use ponytail".
---

# Ponytail Help

Display this reference card when invoked. One-shot, do NOT change mode,
write flag files, or persist anything.

## Levels

| Level     | Trigger           | What change                                                                                  |
| --------- | ----------------- | -------------------------------------------------------------------------------------------- |
| **Lite**  | `/ponytail lite`  | Build what's asked, name the lazier alternative in one line.                                 |
| **Full**  | `/ponytail`       | The ladder enforced: YAGNI → stdlib → native → one line → minimum.                           |
| **Ultra** | `/ponytail ultra` | YAGNI extremist. Deletion before addition. Challenges requirements before building. Default. |

Level sticks until changed or session end.

## Skills

| Skill               | Trigger            | What it does                                                            |
| ------------------- | ------------------ | ----------------------------------------------------------------------- |
| **ponytail**        | `/ponytail`        | Lazy mode itself. Simplest solution that works.                         |
| **ponytail-review** | `/ponytail-review` | Over-engineering review: `L42: yagni: factory, one product. Inline.`    |
| **ponytail-audit**  | `/ponytail-audit`  | Whole-repo over-engineering audit: ranked list of what to delete.       |
| **ponytail-debt**   | `/ponytail-debt`   | Harvest `ponytail:` shortcut comments into a tracked ledger.            |
| **ponytail-gain**   | `/ponytail-gain`   | Measured-impact scoreboard: less code, less cost, more speed.           |
| **ponytail-help**   | `/ponytail-help`   | This card.                                                              |
| **runtime mode**    | `/ponytailMode`    | Change Ponytail session mode in Antigravity IDE: `lite/full/ultra/off`. |
| **runtime status**  | `/ponytailStatus`  | Show the current Ponytail session mode and default mode.                |
| **runtime default** | `/ponytailDefault` | Set the default Ponytail mode for future IDE sessions.                  |
| **runtime sync**    | `/ponytailSync`    | Re-copy the bundled Ponytail prompt files into Antigravity IDE.         |

Antigravity IDE uses the slash-command forms above.

## Deactivate

Say "stop ponytail" or "normal mode". Resume anytime with `/ponytail`.
`/ponytail off` also works.

## Configure Default Mode

Default mode = `ultra`, auto-active every IDE session. Change it with either:

- the Antigravity IDE setting `ponytail.defaultMode`
- the slash runtime command `/ponytailDefault <off|lite|full|ultra>`
- the Command Palette action `Ponytail: Set Default Mode`

## Update

Use `/ponytail-update` to refresh the prompt files from this repository, or
update/reinstall the Antigravity IDE extension when a new VSIX is published.

## More

Full Antigravity IDE docs: https://github.com/rizalrepo/ponytail-antigravity-IDE
