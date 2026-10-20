#!/bin/bash
# Installiert das Studio-Kit für Claude Code auf diesem Rechner.
# Legt Verknüpfungen in ~/.claude an, damit ein "git pull" in DasTeam alles aktualisiert:
#   ~/.claude/rules/studio-*.md   – Studio-Standards und Designsystem (gelten in jedem Projekt)
#   ~/.claude/agents/<name>.md    – die Teammitglieder als Agenten, mit ihren Lektionen
#   ~/.claude/skills/studio-*     – /studio-umstellung, /studio-freigabe, /studio-lektion
# Mehrfach ausführen ist unschädlich. Aufruf: bash studio/installieren.sh

set -e
KIT="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$KIT/.." && pwd)"
CL="$HOME/.claude"
mkdir -p "$CL/rules" "$CL/agents" "$CL/skills"

verknuepfen() {   # $1 = Ziel im Kit, $2 = Verknüpfung in ~/.claude
  if [ -e "$2" ] && [ ! -L "$2" ]; then
    mv "$2" "$2.vor-studio-kit"
    echo "  Gesichert: $2 → $2.vor-studio-kit"
  fi
  ln -sfn "$1" "$2"
}

echo "Studio-Kit aus $KIT"

for f in "$KIT"/regeln/*.md; do
  verknuepfen "$f" "$CL/rules/$(basename "$f")"
done
echo "✓ Regeln: $(ls "$KIT"/regeln/*.md | wc -l | tr -d ' ')"

n=0
for f in "$KIT"/agents/*.md; do
  verknuepfen "$f" "$CL/agents/$(basename "$f")"; n=$((n+1))
done
echo "✓ Agenten: $n"

for d in "$KIT"/skills/*/; do
  d="${d%/}"
  verknuepfen "$d" "$CL/skills/$(basename "$d")"
done
echo "✓ Befehle: /studio-umstellung, /studio-freigabe, /studio-lektion"

# Verknüpfungen zu gelöschten Agenten aufräumen
for l in "$CL"/agents/*.md; do
  [ -L "$l" ] && [ ! -e "$l" ] && rm "$l" && echo "  Entfernt (nicht mehr im Team): $(basename "$l")"
done

# Werkzeug für die Freigabe-Prüfung
if command -v npm >/dev/null 2>&1; then
  if [ ! -d "$REPO/tools/node_modules/playwright" ]; then
    echo "Installiere Playwright für die Freigabe-Prüfung …"
    if (cd "$REPO/tools" && npm install --silent && npx playwright install chromium); then
      echo "✓ Freigabe-Prüfung bereit"
    else
      echo "! Playwright konnte nicht installiert werden (Internet?). Später erneut ausführen."
    fi
  else
    echo "✓ Freigabe-Prüfung bereit"
  fi
else
  echo "! Node.js fehlt – für /studio-freigabe bitte Node.js installieren und dieses Skript erneut ausführen."
fi

echo
echo "Fertig. Starte Claude Code in einer App neu und prüfe mit /agents, ob das Team da ist."
echo "Aktualisieren später: git -C \"$REPO\" pull && bash \"$KIT/installieren.sh\""
