<img src="logo.svg" width="72" alt="Logo Studio-Team">

# Studio-Team

Organigramm und Steckbriefe des KI-Teams im Familien-App-Studio. Chef ist Marco, gepflegt wird die Seite von HR-Heidi und Organigramm-Olga.

Online: https://marcokland-web.github.io/DasTeam/

## Inhalt

- `index.html`: die Organigramm-Seite mit Steckbriefen und Chronik
- `data/studio.json`: Abteilungen, Teammitglieder und Chronik
- `logo.svg`: das Logo „Runde“ als Datei
- `avatars/`: die Porträts der KI-Teammitglieder
- `style.css`, `app.js`: Gestaltung und Programm der Seite

## Logo „Runde“

Ein Punkt pro Abteilung, in der Farbe der Abteilung, im Kreis um die Leitung in der Mitte. Die Seite zeichnet Logo und Favicon aus den Daten: Kommt eine Abteilung dazu, bekommt das Logo automatisch einen Punkt mehr.

## Team-Standards

Diese Regeln hat Marco festgelegt. Sie gelten für jede Seite und jede App des Studios:

1. **Desktop, iPad und iPhone prüfen.** Eine Seite ist erst fertig, wenn sie auf allen drei Geräten optimal aussieht: kein seitliches Scrollen, kein Zoomen, gut tippbar. Zuständig sind Design-Doris (Ansicht) und Bug-Bodo (Tests).
2. **Das ganze Team einbeziehen.** Prüfungen machen die zuständigen Fachleute, nicht HR allein.
3. **Das Logo wird direkt mitentwickelt** und sofort eingebaut, zuständig ist Logo-Luisa.

## Porträts

Logo-Luisa zeichnet für jedes KI-Teammitglied ein Porträt als SVG-Datei unter `avatars/<id>.svg`, verknüpft über das Feld `bild` in `data/studio.json`. Menschen bekommen kein Porträt, für sie zeigt die Seite die Initialen.

## Organigramm

Der Baum entsteht aus dem Feld `berichtetAn`. Wer keinen Vorgesetzten hat, steht oben (der Chef). Wer selbst Teammitglieder unter sich hat, bekommt eine eigene Ebene. Alle anderen werden nach Abteilung gruppiert. Fehlerhafte Berichtslinien (Tippfehler, Kreisbezüge) erscheinen unter „Berichtslinie unklar“.

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
| `bild` | Porträt, z. B. `avatars/bug-bodo.svg` |
| `mensch` | `true` für echte Menschen (z. B. den Chef); dann ohne Version und Lektionen |
| `seit` | Datum im Format `JJJJ-MM-TT` |

Chronik-Einträge (`chronik`) haben `datum` (ISO-Zeit), `typ`, `agent` (die `id` der Person) und `text`. Der Text beginnt mit einem Verb, weil die Seite den Namen davorsetzt: „Bug-Bodo **findet** …“.
