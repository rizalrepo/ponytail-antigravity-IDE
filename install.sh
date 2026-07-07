#!/bin/bash
# install.sh - Ponytail Skills Installer for Antigravity IDE

set -u

REPO_OWNER="rizalrepo"
REPO_NAME="ponytail-antigravity-IDE"
USER_AGENT="Mozilla/5.0"
FALLBACK_BRANCH="main"
FALLBACK_SKILLS=(
    "ponytail"
    "ponytail-audit"
    "ponytail-debt"
    "ponytail-gain"
    "ponytail-help"
    "ponytail-review"
    "ponytail-update"
)

REPO_API="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME"
CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
BASE_DIR="$CONFIG_HOME/Antigravity IDE/User/prompts"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_SKILLS_ROOT="$SCRIPT_DIR/skills"

BRANCH="$({
    curl -fsSL -H "User-Agent: $USER_AGENT" "$REPO_API" 2>/dev/null || true
} | sed -n 's/.*"default_branch":[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)"

if [ -z "$BRANCH" ]; then
    BRANCH="$FALLBACK_BRANCH"
    echo "Could not resolve default branch. Falling back to '$BRANCH'."
fi

mapfile -t SKILLS < <({
    curl -fsSL -H "User-Agent: $USER_AGENT" "$REPO_API/contents/skills?ref=$BRANCH" 2>/dev/null || true
} | sed -n 's/.*"name":[[:space:]]*"\([^"]*\)".*/\1/p')

if [ "${#SKILLS[@]}" -eq 0 ]; then
    SKILLS=("${FALLBACK_SKILLS[@]}")
    echo "Could not list skills from GitHub. Falling back to built-in skill list."
fi

echo "=== Starting Ponytail Skills Installation ==="
echo "Target prompt directory: $BASE_DIR"
echo "Source branch: $BRANCH"

if [ ! -d "$BASE_DIR" ]; then
    mkdir -p "$BASE_DIR"
    echo "Creating configuration directory..."
fi

for skill in "${SKILLS[@]}"; do
    SKILL_DIR="$BASE_DIR/$skill"
    if [ ! -d "$SKILL_DIR" ]; then
        mkdir -p "$SKILL_DIR"
    fi

    URL="https://raw.githubusercontent.com/$REPO_OWNER/$REPO_NAME/$BRANCH/skills/$skill/SKILL.md"
    DEST_FILE="$SKILL_DIR/SKILL.md"
    LOCAL_SKILL_FILE="$LOCAL_SKILLS_ROOT/$skill/SKILL.md"

    echo -n "Downloading skill $skill... "
    if [ -f "$LOCAL_SKILL_FILE" ]; then
        cp "$LOCAL_SKILL_FILE" "$DEST_FILE"
        echo "[Success]"
    elif curl -s -f -H "User-Agent: $USER_AGENT" -o "$DEST_FILE" "$URL"; then
        echo "[Success]"
    else
        echo "[Failed]"
    fi
done

echo ""
echo "=== Installation Completed ==="
echo "Please restart Antigravity IDE to load the new skills."
