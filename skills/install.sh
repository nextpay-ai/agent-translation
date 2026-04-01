#!/bin/sh
# Install @nextpay-ai/agent-translation Claude Code skills into .claude/skills/
# Usage: curl -fsSL https://raw.githubusercontent.com/nextpay-ai/agent-translation/main/skills/install.sh | sh

set -e

REPO="https://raw.githubusercontent.com/nextpay-ai/agent-translation/main"
DEST=".claude/skills"

mkdir -p "$DEST/scaffold" "$DEST/translate"

echo "Installing agent-translation skills..."

curl -fsSL "$REPO/skills/scaffold/SKILL.md" -o "$DEST/scaffold/SKILL.md"
echo "  ✓ scaffold"

curl -fsSL "$REPO/skills/translate/SKILL.md" -o "$DEST/translate/SKILL.md"
echo "  ✓ translate"

echo ""
echo "Done. Skills installed to $DEST/"
echo "Run 'npx agent-translation init' to finish setting up the library."
