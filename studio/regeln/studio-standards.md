# Familien-App-Studio: Standards für alle Apps

Diese Regeln gelten in jedem Projekt von Marco. Sie stammen aus dem Repository DasTeam (`studio/`) und werden mit `git pull` aktualisiert. Bei Widerspruch zu einer älteren CLAUDE.md einer App gelten diese Regeln, außer Marco sagt im Gespräch etwas anderes.

## Das Team

Marco ist Chef. Für Fachaufgaben gibt es Agenten (Subagents) mit Alliterationsnamen, je Abteilung mit einer Teamleitung:

- Planung & Wissen (Wissens-Wilma): plan-paula, doku-doerte, organigramm-olga, lern-lotte (Lernpädagogin, für jede Lern-App)
- Gestaltung (Gestaltungs-Greta): design-doris, logo-luisa, text-tina
- Technik & Betrieb (Technik-Toni): daten-dieter, deploy-dennis
- Qualität & Sicherheit (Qualitäts-Quentin): bug-bodo, rant-randy, sicherheits-siggi
- Personal: hr-heidi (neue Rollen nur mit Marcos Genehmigung)

**Das ganze Team einbeziehen:** Prüfungen und Fachaufgaben gehen an die zuständigen Agenten, nicht alles selbst machen. Bei größeren Änderungen mindestens Design-Doris (Ansicht), Bug-Bodo (Funktion) und, wo Daten betroffen sind, Daten-Dieter bzw. Sicherheits-Siggi beauftragen.

## Die sieben Team-Standards

1. **Desktop, iPad und iPhone prüfen** (1440×900, 820×1180, 390×844, jeweils hell und dunkel). Fertig ist nur, was auf allen drei optimal aussieht: kein seitliches Scrollen, kein Zoomen, nichts abgeschnitten, nichts unter Tab-Leiste oder schwebenden Knöpfen.
2. **Das ganze Team einbeziehen** (siehe oben).
3. **Das Logo wird mitentwickelt** und sofort eingebaut, nicht erst auf Nachfrage.
4. **Jede App ist installierbar** und zeigt dabei das richtige Logo: `apple-touch-icon` 180 px (iPhone-Home-Bildschirm), Web-Manifest mit Icons 192 und 512 px, `purpose: "maskable"` 512 px, Favicon 32 px und SVG, `id` und `start_url` `./`, `lang: "de"`.
5. **Vor jeder Auslieferung läuft die Freigabe-Prüfung** (`/studio-freigabe`). Ausgeliefert wird nur, was alle Punkte besteht.
6. **Hell, Dunkel und Automatisch.** Jede App hat einen hellen und einen dunklen Modus und folgt im Modus „Automatisch“ der Systemeinstellung. Standard ist „Automatisch“. Die Wahl wird pro Gerät gemerkt und vor dem ersten Zeichnen angewendet (kein Aufblitzen).
7. **Deutsch und Englisch.** Jede App lässt sich zwischen Deutsch und Englisch umschalten. Standard ist immer Deutsch. Alle sichtbaren Texte sind übersetzt, auch Fehlermeldungen, leere Zustände und Rückfragen; `<html lang>`, Datums- und Zahlenformat wechseln mit. Von Nutzern eingegebene Namen werden nie übersetzt.

**Einstellungsmenü in jeder App:** Darstellung (Standard 6) und Sprache (Standard 7) stehen immer in einem Einstellungsmenü im einheitlichen Studio-Look (Aufbau siehe `studio-designsystem.md`, Abschnitt „Einstellungsmenü“).

## Weitere feste Regeln

- **Designsystem:** Jede App folgt `studio-designsystem.md` (Bordeaux und Gold, Systemschrift, Apple-Bedienung). Keine Google Fonts, kein Blau als Akzentfarbe.
- **Texte:** Deutsch, Ansprache „du“, Begriffe nach der Familien-Wortliste in `studio-designsystem.md`.
- **Beträge:** intern als ganze Cent rechnen oder zentral auf Cent runden; Eingaben „1.234,56“, „1234,56“ und „1,234.56“ korrekt lesen; Anzeige „1.234,56 €“.
- **Daten und Datenschutz:** keine Geheimnisse ins Repository; nach dem Abmelden lokale Finanzdaten löschen (nach Rückfrage); keine persönlichen Daten (Nachname, E-Mail) fest im Code; Git-Commits mit der noreply-Adresse von GitHub.
- **Löschen** immer mit Rückfrage und rotem Knopf, oder mit „Rückgängig“.

## Aus Fehlern lernen

Wenn Marco einen Fehler findet, den das Team hätte finden müssen, oder Feedback gibt:

1. Den Fehler beheben.
2. Mit `/studio-lektion` festhalten: welcher Agent zuständig war und welche Regel ihn künftig verhindert. Die Lektion landet im Gedächtnis des Agenten und im Eingang der Team-Seite.
3. Wo möglich, einen automatischen Prüfpunkt ergänzen (Fehler-Nachbetrachtung von Rant-Randy).
