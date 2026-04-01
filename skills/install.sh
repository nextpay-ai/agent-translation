#!/bin/sh
# Install @nextpay-ai/agent-translation skills into .claude/skills/ and/or .agents/skills/
# Usage: curl -fsSL https://raw.githubusercontent.com/nextpay-ai/agent-translation/main/skills/install.sh | sh

set -e

REPO="https://raw.githubusercontent.com/nextpay-ai/agent-translation/main"

install_to() {
  DEST="$1"
  mkdir -p "$DEST/agent-translation" "$DEST/agent-translation:scaffold"
  curl -fsSL "$REPO/skills/agent-translation/SKILL.md" -o "$DEST/agent-translation/SKILL.md"
  echo "  ✓ agent-translation -> $DEST/"
  curl -fsSL "$REPO/skills/agent-translation:scaffold/SKILL.md" -o "$DEST/agent-translation:scaffold/SKILL.md"
  echo "  ✓ agent-translation:scaffold -> $DEST/"
}

echo "Installing agent-translation skills..."

INSTALLED=0

if [ -d ".claude/skills" ] || [ -d ".claude" ]; then
  install_to ".claude/skills"
  INSTALLED=1
fi

if [ -d ".agents/skills" ] || [ -d ".agents" ]; then
  install_to ".agents/skills"
  INSTALLED=1
fi

if [ "$INSTALLED" = "0" ]; then
  # Default to .claude/skills if neither exists
  install_to ".claude/skills"
fi

echo ""
echo "Done. Run 'npx agent-translation init' to finish setting up the library."
