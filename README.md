<img src="logo.svg" width="72" alt="Logo Studio-Team">

# Studio-Team

Organigramm und Steckbriefe des KI-Teams im Familien-App-Studio. Chef ist Marco, gepflegt wird die Seite von HR-Heidi und Organigramm-Olga.

Online: https://marcokland-web.github.io/DasTeam/

## Inhalt

- `index.html`: die Organigramm-Seite mit Steckbriefen und Chronik
- `data/studio.json`: Abteilungen, Teammitglieder und Chronik
- `logo.svg`: das Logo „Runde“ als Datei
- `avatars/`: die Porträts der KI-Teammitglieder
- `tools/freigabe-check.js`: die Freigabe-Prüfung vor jeder Auslieferung
- `style.css`, `app.js`: Gestaltung und Programm der Seite

## Logo „Runde“

Goldene Punkte auf Bordeaux: ein Punkt pro Abteilung, im Kreis um die Leitung in der Mitte, im Familienstil des Designsystems. Die Seite zeichnet Logo und Favicon aus den Daten: Kommt eine Abteilung dazu, bekommt das Logo automatisch einen Punkt mehr.

## Team-Standards

Diese Regeln hat Marco festgelegt. Sie gelten für jede Seite und jede App des Studios:

1. **Desktop, iPad und iPhone prüfen.** Eine Seite ist erst fertig, wenn sie auf allen drei Geräten optimal aussieht: kein seitliches Scrollen, kein Zoomen, gut tippbar. Zuständig sind Design-Doris (Ansicht) und Bug-Bodo (Tests).
2. **Das ganze Team einbeziehen.** Prüfungen machen die zuständigen Fachleute, nicht HR allein.
3. **Das Logo wird direkt mitentwickelt** und sofort eingebaut, zuständig ist Logo-Luisa.
4. **Jede App ist installierbar und zeigt dabei das richtige Logo.** Dazu gehören auf dem iPhone „Zum Home-Bildschirm“ (`apple-touch-icon`, 180 px) und auf dem Desktop die Installation als App (Web-Manifest mit Icons in 192 und 512 px plus Masken-Icon). Zuständig sind Logo-Luisa (Icons), Deploy-Dennis (Manifest) und Bug-Bodo (Test auf beiden Geräten).
5. **Vor jeder Auslieferung läuft die Freigabe-Prüfung** (`tools/freigabe-check.js`). Ausgeliefert wird nur, was alle Punkte besteht.
6. **Hell, Dunkel und Automatisch** in jeder App, Standard Automatisch (folgt der Systemeinstellung).
7. **Deutsch und Englisch** in jeder App umschaltbar, Standard Deutsch. Beides steht in einem Einstellungsmenü im einheitlichen Studio-Look.

## App-Installation

- `manifest.webmanifest`: Name, Farben und Icons für die Installation als App
- `icons/`: App-Icons, aus dem Logo erzeugt (iPhone 180 px, Desktop 192 und 512 px, Masken-Icon, Favicon)

Kommt eine Abteilung dazu, werden die Icons beim nächsten Erzeugen der Seite neu gezeichnet. Auf bereits installierten Apps aktualisieren iPhone und Desktop das Icon erst, wenn man die App einmal entfernt und neu hinzufügt.

## Apps des Studios

| App | Ordner | Adresse |
|---|---|---|
| Rechenstern (Einmaleins: Lernen mit Entdeckerpfad und Lernspielen, Üben, Belohnungen) | `apps/rechenstern/` | https://marcokland-web.github.io/DasTeam/apps/rechenstern/ |

Rechenstern speichert den Spielstand nur im Browser des Geräts. Quelle der App ist eine einzelne HTML-Datei; die installierbare Fassung (eigene CSS- und JS-Dateien, Manifest, Icon-Set) wird daraus gebaut.

## Studio-Kit für Claude Code

Damit alle Apps auf dem Mac nach denselben Regeln gebaut werden und das Team überall mitarbeitet, liegt hier das Studio-Kit (`studio/`):

- `studio/regeln/`: Studio-Standards und Designsystem; werden zu Regeln in `~/.claude/rules/` und gelten in jedem Projekt
- `studio/agents/`: alle Teammitglieder als Claude-Code-Agenten, mit ihren Lektionen aus der Team-Seite (werden bei jedem Hochladen neu erzeugt)
- `studio/skills/`: die Befehle `/studio-umstellung`, `/studio-freigabe`, `/studio-lektion`
- `studio/brand/`: die Quell-SVGs aller App-Icons
- `studio/pruefberichte/`: Prüfberichte der Apps
- `studio/lektionen-eingang.md`: neue Lektionen vom Mac, die in die Team-Seite übernommen werden

**Einmal einrichten** (Terminal auf dem Mac):

```
cd ~/Apps
git clone https://github.com/marcokland-web/DasTeam.git
bash ~/Apps/DasTeam/studio/installieren.sh
```

**Aktualisieren**, wenn das Team dazugelernt hat:

```
git -C ~/Apps/DasTeam pull && bash ~/Apps/DasTeam/studio/installieren.sh
```

**Eine App umstellen:** Claude Code im Ordner der App starten und `/studio-umstellung` eingeben.

## Organisation

- **Marco** ist Chef. Alle Teamleitungen berichten direkt an ihn.
- **HR-Heidi** ist Stabsstelle bei Marco. Braucht eine Teamleitung Personal, meldet sie es bei Heidi. Heidi schreibt das Rollenprofil und holt die Stellengenehmigung bei Marco ein. Erst danach wird eingestellt.
- **Teamleitungen**, je Abteilung eine: Wissens-Wilma (Planung & Wissen), Gestaltungs-Greta (Gestaltung), Technik-Toni (Technik & Betrieb), Qualitäts-Quentin (Qualität & Sicherheit). Sie entwickeln selbstständig Ideen, wie ihr Team besser wird, und bringen sie unter „Ideen der Teams“ ein. Marco entscheidet.
- **Teamleiter-Runde:** Die Teamleitungen treffen sich jeden Montagmorgen, bringen je eine neue Idee ein und vereinbaren einen Punkt zur besseren Zusammenarbeit. Das Ergebnis steht in der Chronik.

## Freigabe-Prüfung

Gemeinsame Idee aller vier Teamleitungen. Sie prüft eine laufende Seite auf iPhone, iPad und Desktop (hell und dunkel), außerdem Manifest, App-Icons und Installierbarkeit. Screenshots und ein Bericht landen im Ausgabeordner.

```
PLAYWRIGHT_MODULE=<pfad-zu-playwright> CHROME_PATH=<chrome> node tools/freigabe-check.js http://127.0.0.1:8765/ freigabe
```

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
| `fuehrt` | `true` für Teamleitungen |
| `stab` | `true` für Stabsstellen wie HR, die direkt an den Chef berichten |
| `mensch` | `true` für echte Menschen (z. B. den Chef); dann ohne Version und Lektionen |
| `seit` | Datum im Format `JJJJ-MM-TT` |

Ideen (`ideen`) haben `titel`, `beschreibung`, `nutzen`, `art`, `status` (z. B. „Wartet auf Marco“, „Genehmigt“, „Umgesetzt“), `abteilung` und `von` (eine oder mehrere `id`s).

Chronik-Einträge (`chronik`) haben `datum` (ISO-Zeit), `typ`, `agent` (die `id` der Person) und `text`. Der Text beginnt mit einem Verb, weil die Seite den Namen davorsetzt: „Bug-Bodo **findet** …“.
