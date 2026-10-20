---
name: studio-lektion
description: Hält eine Lektion des Teams fest, wenn Marco einen Fehler findet oder Feedback gibt – im Gedächtnis des zuständigen Agenten und im Eingang der Team-Seite. Auch selbst nutzen, wenn ein Fehler bemerkt wurde, den das Team hätte finden müssen.
argument-hint: "[agent] [Regel in einem Satz]"
---

# Lektion festhalten

1. Bestimme den zuständigen Agenten (z. B. `bug-bodo`, `logo-luisa`) und formuliere die Lektion als **Regel für die Zukunft** in einem Satz („Zu jedem Logo gehört das komplette Icon-Set …“), nicht als Beschreibung des Fehlers. Nimm `$ARGUMENTS`, wenn angegeben; sonst schlage Agent und Satz vor und lass Marco bestätigen.
2. **Gedächtnis des Agenten:** Hänge die Regel als Zeile `- <Regel> (<Datum>, <App>)` an `~/.claude/agent-memory/<agent>/MEMORY.md` an (Ordner bei Bedarf anlegen). Doppelte Regeln nicht erneut eintragen.
3. **Eingang der Team-Seite:** Hänge an `~/Apps/DasTeam/studio/lektionen-eingang.md` eine Zeile an:
   `- <JJJJ-MM-TT> · <agent> · <App> · <Regel>`
   Dann in `~/Apps/DasTeam`: `git pull`, `git add studio/lektionen-eingang.md`, `git commit -m "Lektion: <agent>"`, `git push`.
   HR-Heidi übernimmt die Einträge beim nächsten Abgleich in die Team-Seite und in die Agenten-Datei.
4. Gilt die Regel für alle Apps, schlage Marco vor, sie in die Studio-Standards aufzunehmen.
5. Kurze Bestätigung an Marco: wer was gelernt hat.
