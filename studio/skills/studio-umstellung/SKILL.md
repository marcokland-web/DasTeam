---
name: studio-umstellung
description: Bringt die App im aktuellen Ordner auf die Studio-Standards und das Designsystem (Bordeaux und Gold, Apple-Bedienung, Icon-Set, Installierbarkeit) und überträgt alle Lektionen des Teams. Aufruf mit /studio-umstellung.
disable-model-invocation: true
argument-hint: "[optional: nur Teil, z. B. icons, farben, texte, pruefbericht]"
---

# Umstellung einer App auf die Studio-Standards

Du arbeitest im Ordner einer von Marcos Apps. Ziel: Die App erfüllt danach die Studio-Standards (`studio-standards.md`), das Designsystem (`studio-designsystem.md`) und alle Lektionen der Agenten. Wenn `$ARGUMENTS` einen Teil nennt, bearbeite nur diesen.

## 0. Aktuellen Stand holen
- `git -C ~/Apps/DasTeam pull` (Studio-Kit aktualisieren). Wenn der Ordner anders heißt, finde den Klon von `marcokland-web/DasTeam` unter `~/Apps`.
- `git pull` in der App, damit du auf dem neuesten Stand arbeitest.

## 1. Bestandsaufnahme (Wissens-Wilma / Plan-Paula)
- Lies die CLAUDE.md der App und die Studio-Regeln. Liste Widersprüche (z. B. andere Schrift, andere Akzentfarbe, „exakt wie Vorbild“) und die Funktionen, die nicht verändert werden dürfen.
- Gibt es in `~/Apps/DasTeam/studio/pruefberichte/` einen Prüfbericht zu dieser App (z. B. `PRUEFBERICHT-BASE.md` für B.A.S.E), übernimm seine offenen Befunde in den Plan, kritische zuerst.
- Schreibe einen kurzen Plan mit Etappen und zeige ihn Marco, bevor du größere Umbauten beginnst.

## 2. Umsetzen, Etappe für Etappe
- **Farben und Schrift (design-doris):** Farbtokens des Designsystems als CSS-Variablen für Hell und Dunkel einführen; alte Akzentfarben (z. B. Blau) und Google Fonts entfernen; Systemschrift; Beträge gerundet mit gleich breiten Ziffern.
- **Icons (logo-luisa):** Aus `~/Apps/DasTeam/studio/brand/<app>.svg` das Pflicht-Set erzeugen (180, 192, 512, maskable 512, Favicon 32 und SVG). Neue App ohne Symbol: Logo-Luisa entwirft eines auf Basis von `vorlage.svg`.
- **Installierbarkeit (deploy-dennis):** Web-Manifest (`id`/`start_url` `./`, `lang: "de"`, Icons inkl. maskable, `theme_color` `#5A1028`, `background_color` `#FAF7F2`), `apple-touch-icon`, `theme-color` je Thema, Service Worker mit Vorab-Cache.
- **Texte (text-tina):** alle sichtbaren Texte gegen die Familien-Wortliste prüfen und angleichen; „du“.
- **Bedienung je Gerät (design-doris):** Tab-Leiste und Sheets am iPhone, Touch-Ziele 44 px, nichts unter Leisten verdeckt.
- **Daten und Beträge (daten-dieter, sicherheits-siggi)**, wenn die App Daten speichert: Beträge in Cent, Eingabe „1.234,56“ korrekt, Abmelden löscht lokale Daten nach Rückfrage, keine persönlichen Daten fest im Code.
- Nach jeder Etappe committen, mit klarer deutscher Nachricht.

## 3. Prüfen (ganzes Team)
- Beauftrage parallel **design-doris** (Ansicht in drei Größen, hell/dunkel), **bug-bodo** (Funktion und Randfälle), **rant-randy** (Code) und bei Daten **sicherheits-siggi**. Behebe ihre Befunde.
- Führe `/studio-freigabe` aus. Ausgeliefert wird erst, wenn alles grün ist.

## 4. Abschließen
- **doku-doerte:** CLAUDE.md der App aktualisieren: Verweis auf die Studio-Regeln, alte widersprüchliche Vorgaben entfernen, Version/BUILD hochzählen.
- Ausliefern auf dem in der App üblichen Weg (z. B. `deploy.sh`).
- Gelerntes mit `/studio-lektion` festhalten.
- Marco eine kurze Zusammenfassung geben: was geändert wurde, was offen ist, und dass er das Home-Bildschirm-Icon einmal entfernen und neu hinzufügen muss, damit das neue Logo erscheint.
