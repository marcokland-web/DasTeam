# Studio-Team

Organigramm und Steckbriefe des KI-Teams im Familien-App-Studio, gepflegt von HR-Heidi und Organigramm-Olga.

## Inhalt

- `index.html`: die Organigramm-Seite mit Steckbriefen und Chronik
- `data/studio.json`: Abteilungen, Teammitglieder und Chronik

## Ansehen

Die Seite lädt ihre Daten aus `data/studio.json` und braucht deshalb einen Webserver. Einfach doppelklicken funktioniert im Browser meist nicht.

- Lokal: `python3 -m http.server` im Ordner starten und `http://localhost:8000` öffnen
- Online: GitHub Pages aktivieren (Settings → Pages → Branch `main`, Ordner `/`)

## Team ändern

Neue Mitarbeitende, Beförderungen und gelernte Lektionen werden in `data/studio.json` eingetragen. Die Seite passt sich beim nächsten Laden automatisch an: neue Abteilungen, neue Karten, mehr Lektionen.

Felder pro Teammitglied:

| Feld | Bedeutung |
|---|---|
| `id` | Kurzname, z. B. `bug-bodo` |
| `nr` | Personalnummer, z. B. `P-004` |
| `name`, `rolle`, `motto`, `persoenlichkeit` | Steckbrief |
| `abteilung` | `id` einer Abteilung |
| `berichtetAn` | `id` der vorgesetzten Person, `null` für die Leitung |
| `aufgaben` | Liste von Aufgaben |
| `faehigkeiten` | Liste aus `{ "name", "stufe" }`, Stufe 1 bis 5 |
| `lektionen` | gelernte Regeln aus Feedback, als Text oder `{ "text", "datum" }` |
| `version` | steigt, wenn sich der Agent weiterentwickelt |
| `datei` | Pfad zur Agenten-Konfiguration |
