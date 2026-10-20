---
name: studio-freigabe
description: Freigabe-Prüfung des Studios für die App im aktuellen Ordner – iPhone, iPad und Desktop in Hell und Dunkel, App-Icons, Manifest und Installierbarkeit. Vor jeder Auslieferung ausführen.
argument-hint: "[optional: Adresse, sonst lokaler Server]"
---

# Freigabe-Prüfung

1. Starte, falls `$ARGUMENTS` keine Adresse nennt, einen lokalen Server im App-Ordner, z. B. `python3 -m http.server 8765 --bind 127.0.0.1` (im Hintergrund), und nimm `http://127.0.0.1:8765/`.
2. Führe aus (Pfad zum DasTeam-Klon ggf. anpassen):
   ```
   node ~/Apps/DasTeam/tools/freigabe-check.js <adresse> ./freigabe
   ```
   Fehlt Playwright: einmal `cd ~/Apps/DasTeam/tools && npm install && npx playwright install chromium`.
   Damit keine echten Daten berührt werden, blockiere bei Apps mit Supabase die Anfragen an `*.supabase.co` (z. B. Kopie des Skripts mit Chrome-Option `--host-resolver-rules="MAP *.supabase.co 0.0.0.0"`).
3. Lies `./freigabe/bericht.md` und schau dir die Screenshots in `./freigabe/` an (mindestens iPhone hell und dunkel).
4. Ergebnis an Marco: „freigegeben“ oder die offenen Punkte mit Vorschlag. Bei offenen Punkten wird nicht ausgeliefert.
5. Den Ordner `./freigabe/` nicht committen (in `.gitignore` aufnehmen) und den Server beenden.
