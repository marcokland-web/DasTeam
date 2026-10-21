# Designsystem des Familien-App-Studios (Kurzfassung für den Code)

**Apple-Klarheit in Familienfarben.** Bordeaux und Gold kommen aus dem Familienwappen, Form, Systemschrift und Bedienung von Apple. Alle Apps teilen dieselben Farben und unterscheiden sich nur durch ihr Symbol.

## Farben (CSS-Variablen, Hell / Dunkel)

```css
:root{
  --bg:#FAF7F2; --surface:#FFFFFF; --fill:#F1EBE3; --separator:#E5DDD3;
  --ink:#1D1A1C; --ink-2:#675E62;
  --brand:#7A1E3A; --brand-strong:#5A1028; --brand-tint:#F3E3E8; --on-brand:#FFFFFF;
  --gold:#C8963E; --gold-ink:#8A6420;
  --success:#276F38; --danger:#B3261E; --warning:#9A5B00; --info:#2A6390;
}
/* Dunkel (prefers-color-scheme: dark bzw. Umschalter) */
  --bg:#141012; --surface:#1E191B; --fill:#2A2326; --separator:#3A3134;
  --ink:#F4EEEA; --ink-2:#ADA3A6;
  --brand:#E57A98; --brand-strong:#F29BB3; --brand-tint:#3A1C26; --on-brand:#141012;
  --gold:#E3B866; --gold-ink:#E3B866;
  --success:#6CC97A; --danger:#FF8A80; --warning:#F2B44C; --info:#8CC0EA;
```

- `--brand` heißt „hier kann man tippen“: Hauptknopf, aktiver Tab, Links, Auswahl, Fokusring. Höchstens ein gefüllter Hauptknopf pro Ansicht.
- `--gold` nur als Schmuck (Symbole, Fortschrittsringe, erreichte Ziele), nie als Text auf hellem Grund; Gold-Text heißt `--gold-ink`.
- Grün/Ocker/Rot nie als einziges Merkmal: immer mit Vorzeichen oder Text.
- Hell / Dunkel / Automatisch in jeder App umschaltbar, Standard Automatisch (Team-Standard 6).
- `<meta name="theme-color">` je Thema mit `media` auf `--bg`; Manifest: `theme_color` `#5A1028`, `background_color` `#FAF7F2`.

## Schrift

- Systemschrift: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. Keine geladenen Schriften.
- Beträge: `ui-rounded, "SF Pro Rounded", -apple-system, …`, `font-variant-numeric: tabular-nums`, rechtsbündig. Großer Betrag 44 px Gewicht 300; in Listen 17 px Gewicht 500.
- iPhone/iPad: Apple-Größen (Titel groß 34/41 fett, Text 17/22, Zweitzeile 15/20, Fußnote 13/18). Desktop kompakt: Text 14/20, klein 12/16.

## Formen, Abstände, Bedienung

- Abstände 4/8/12/16/20/24/32 px; Seitenrand 16 px (iPhone), 20 px (iPad/Desktop).
- Radius: 8 px Eingaben/Plaketten, 10 px Knöpfe, 14 px Karten und gruppierte Listen, 20 px Sheets oben, 999 px Pillen.
- Jede tippbare Fläche mindestens 44 × 44 px.
- iPhone: Tab-Leiste unten (max. 5), großer Titel, Eingabe als Bottom-Sheet mit Zahlenblock. iPad: Seitenleiste oder Pille oben, zweispaltig. Desktop: Seitenleiste links, kompakt.
- Gruppierte Listen im iOS-Stil („inset grouped“), Trennlinien ab Textanfang.
- Kopfleisten beim Scrollen deckend oder unscharf, nie durchsichtig über Text.

## Einstellungsmenü (in jeder App gleich)

- **Zugang:** Zahnrad-Symbol (Linien-Icon, 44 × 44 px) oben rechts in der Kopfzeile; am Desktop zusätzlich unten in der Seitenleiste. Beschriftung für Screenreader „Einstellungen“ / „Settings“.
- **Form:** iPhone: Sheet von unten (Ecken 20 px, Griff oben); iPad und Desktop: Dialog, höchstens 440 px breit. Kopf: Titel „Einstellungen“, rechts „Fertig“ (schlichter Knopf in `--brand`).
- **Inhalt immer in dieser Reihenfolge**, als gruppierte Listen:
  1. **Darstellung:** Segment-Steuerung „Automatisch | Hell | Dunkel“ (Standard Automatisch).
  2. **Sprache:** Segment-Steuerung „Deutsch | English“ (Standard Deutsch).
  3. App-eigene Einstellungen (z. B. Konten, Sync, Erinnerungen).
  4. **Über:** App-Icon, Name, Langform, Version/Build, „Teil des Familien-App-Studios“.
- **Segment-Steuerung:** Fläche `--fill`, gewählter Teil `--surface` mit leichtem Schatten und Text in `--ink` (halbfett), Ecken 8 px, Höhe mindestens 36 px innerhalb einer 44-px-Zeile; technisch als Radio-Gruppe (Tastatur und Screenreader).
- **Verhalten:** Änderungen gelten sofort, ohne Speichern-Knopf; gemerkt pro Gerät in `localStorage` unter `studio-theme` (`auto|light|dark`) und `studio-lang` (`de|en`). Thema vor dem ersten Zeichnen setzen (kleines Skript im `<head>`), `meta theme-color` mitändern.
- **Sprache:** Texte über ein Wörterbuch bzw. `T(de, en)`; Datum und Zahlen mit `Intl` (`de-DE` bzw. `en-GB`); Eingaben in beiden Formaten akzeptieren.

## Apps für Kinder

Gleiche Familienfarben und derselbe Aufbau, aber größer und verspielter (erstmals in Rechenstern, `apps/rechenstern/`):

- Zahlen und Aufgaben in der gerundeten Systemschrift (`ui-rounded`), groß und fett; Tasten mindestens 60 px hoch.
- Gold für Sterne und Belohnungen, Grün für „richtig“, Rot nur mit freundlichem Text („Knapp daneben.“), nie mit Strafe.
- Lob für Mühe, kein Zeitdruck außer in freiwilligen Spielen, keine Schuldgefühle bei Pausen, keine Käufe, keine Werbung.
- Echte Belohnungen nur über einen Eltern-Bereich mit PIN; alle Daten bleiben auf dem Gerät.

## Liquid Glass (Apple-Glasoptik, in jeder App)

Marco hat am 21.10.2026 entschieden: Alle Apps bekommen die Glasoptik von Apple („Liquid Glass“, iOS 26). Glas gehört auf die **Navigationsebene**, Inhalte bleiben ruhig und gut lesbar.

- **Aus Glas:** Kopfzeile (schwebend, `position: sticky`, Ecken 26 px), Tab-Leiste (schwebende Kapsel mit Abstand zum Rand, Ecken 32 px), Navigationspille, Zahnrad und kleine runde Knöpfe, Einstellungsmenü und Pop-ups, Hinweise (Toast), Sprechblasen, getönte Knöpfe.
- **Nicht aus Glas:** Karten, Listen, Tabellen, Eingabefelder mit Inhalt, Beträge. Sie bekommen nur eine feine Lichtkante (`inset 0 1px 0`).
- **Rezept:** `background: var(--glass)` (hell `rgb(255 255 255 / .58)`, dunkel `rgb(40 30 34 / .55)`), `backdrop-filter: blur(22px) saturate(185%)` (mit `-webkit-`), 1 px Rand `--glass-edge`, Schatten `--glass-shadow` plus Lichtkante oben `inset 0 1px 0 var(--glass-shine)`.
- **Grund:** Damit das Glas schimmert, liegt hinter der App ein ruhiger Farbschleier aus Familienfarben (zwei bis drei weiche `radial-gradient` in Bordeaux und Gold über `--bg`, `background-attachment: fixed`).
- **Hauptknopf:** bleibt deckend Bordeaux, bekommt aber Glanzkante und weichen Farbschatten.
- **Barrierefreiheit:** Bei `prefers-reduced-transparency: reduce` und ohne `backdrop-filter` werden alle Glasflächen deckend (`--surface`). Text auf Glas muss weiterhin 4,5:1 erreichen; im Zweifel `--glass-strong` nehmen.
- **Vorbild:** Rechenstern (`apps/rechenstern/`), Block „Liquid Glass“ im CSS.

## App-Icons

- Bordeaux-Verlauf `#8C2545` → `#5A1028`, darauf **ein** goldenes Linien-Symbol, Verlauf `#F0D08A` → `#C8963E`. Keine Schrift (Ausnahme: das „B“ von B.A.S.E).
- Quell-SVGs (1024 px) liegen in DasTeam `studio/brand/`: `base`, `gewohnheiten`, `zaehlerstaende`, `studio-team`, `vorlage`; je vollflächig (iPhone, maskable), `-rund` (Desktop, Favicon) und teils `-klein` (16–32 px).
- Daraus erzeugt jede App ihr Pflicht-Set (siehe Standard 4). Ein neues Symbol entwirft logo-luisa, ausgehend von `vorlage.svg`.

## Zahlen und Texte

- Beträge „1.234,56 €“ (schmales Leerzeichen vor €), negativ mit „−“; Datum „20. Oktober 2026“ bzw. „20.10.2026“, relativ „Heute“, „Gestern“; Zählerstände mit Einheit „12.345,6 kWh“.

### Familien-Wortliste (verwenden → nicht verwenden)

Plan → Budget · Zuweisen → Budgetieren · Noch zu verteilen → Zuweisbar, Ready to Assign · Konto/Konten → Account, Bargeld · Kontostand → Saldo · Buchung → Transaktion, Umsatz · Ausgabe/Einnahme → Outflow/Inflow, Zufluss · Empfänger → Zahlungsempfänger, Payee · Notiz → Memo · Ohne Kategorie → Unkategorisiert · Gebucht ✓ → Abgeglichen, Cleared · Kontostand korrigieren → Kontoabgleich · Überweisung → Umbuchung, Transfer · Aufteilen → Split · Ziel → Target · Fehlt noch/Gedeckt → Unterfinanziert/Finanziert · Überzogen → Overspent · Pausieren → Snoozen · Serie → Streak · Zählerstand ablesen → Reading · Verbrauch → Delta · Analyse → Reflect, Berichte · Synchronisieren → Sync (im Fließtext) · Rückgängig/Wiederholen → Undo/Redo · du → Sie
