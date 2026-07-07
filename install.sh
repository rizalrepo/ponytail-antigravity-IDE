#!/bin/bash
# install.sh - Ponytail Skills Installer for macOS/Linux

REPO_OWNER="rizalrepo"
REPO_NAME="ponytail-antigravity-IDE"
BRANCH="main"

SKILLS=(
    "ponytail"
    "ponytail-audit"
    "ponytail-debt"
    "ponytail-gain"
    "ponytail-help"
    "ponytail-review"
    "ponytail-update"
)

BASE_DIR="$HOME/.gemini/config/skills"

echo "=== Starting Ponytail Skills Installation ==="
echo "Target directory: $BASE_DIR"

if [ ! -d "$BASE_DIR" ]; then
    mkdir -p "$BASE_DIR"
    echo "Creating configuration directory..."
fi

for skill in "${SKILLS[@]}"; do
    SKILL_DIR="$BASE_DIR/$skill"
    if [ ! -d "$SKILL_DIR" ]; then
        mkdir -p "$SKILL_DIR"
    fi
    
    URL="https://raw.githubusercontent.com/$REPO_OWNER/$REPO_NAME/$branch/skills/$skill/SKILL.md"
    DEST_FILE="$SKILL_DIR/SKILL.md"
    
    echo -n "Downloading skill $skill... "
    if curl -s -f -o "$DEST_FILE" "$URL"; then
        echo "[Success]"
    else
        echo "[Failed]"
    fi
done

echo ""
echo "=== Installation Completed ==="
echo "Please restart Gemini/Antigravity IDE to load the new skills."
