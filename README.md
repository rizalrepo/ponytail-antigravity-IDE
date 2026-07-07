# Ponytail Skills for Gemini / Antigravity

A collection of custom skills for the Gemini/Antigravity AI Coding Assistant focusing on extreme simplicity, efficiency, and eliminating unnecessary code (YAGNI).

These skills are pre-configured to run in **ultra** mode by default.

## Available Skills

1. **`ponytail`**: Forces the simplest, shortest, and most minimal solution (prioritizes the standard library & native platform features).
2. **`ponytail-review`**: Code review focused exclusively on detecting over-engineering and code bloat.
3. **`ponytail-audit`**: Whole-repository audit to scan for over-engineering.
4. **`ponytail-debt`**: Harvests every `ponytail:` comment in the codebase into a unified debt ledger.
5. **`ponytail-gain`**: Displays an scoreboard of estimated code and time savings.
6. **`ponytail-help`**: Quick-reference card for all ponytail commands.
7. **`ponytail-update`**: Updates your ponytail skills to the latest versions directly from this repository.

---

## Quick Installation

### Windows (PowerShell)
To install all skills automatically on Windows, open **PowerShell** and run the following command:
```powershell
irm https://raw.githubusercontent.com/rizalrepo/ponytail-antigravity-IDE/main/install.ps1 | iex
```
*Note: Make sure to close your Gemini/Antigravity IDE before running the installer so the new configurations are loaded correctly when reopened.*

### macOS / Linux (Terminal)
To install all skills automatically on macOS or Linux, open your **Terminal** and run the following command:
```bash
curl -fsSL https://raw.githubusercontent.com/rizalrepo/ponytail-antigravity-IDE/main/install.sh | bash
```
*Note: Make sure to close your Gemini/Antigravity IDE before running the installer so the new configurations are loaded correctly when reopened.*

---

## License
This project is licensed under the MIT License - see the LICENSE file for details.
