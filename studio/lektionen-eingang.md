# Eingang: neue Lektionen vom Mac

Hier trägt `/studio-lektion` neue Lektionen ein, die in Claude Code auf dem Mac entstehen. HR-Heidi übernimmt sie beim nächsten Abgleich in die Team-Seite und in die Agenten-Dateien und markiert sie dann als übernommen.

Format: `- JJJJ-MM-TT · agent · App · Regel`

## Neu

## Übernommen
- 2026-10-30 · bug-bodo · Zählerstände · Bei Apps mit Anmeldung den ganzen Konto-Ablauf testen: Registrieren mit neuer und mit schon vorhandener E-Mail, Anmelden mit falschem Passwort und „Passwort vergessen?“ bis zum neuen Passwort; Supabase meldet bei vorhandener E-Mail Erfolg ohne Mail, die App muss das an leeren identities erkennen und das Zurücksetzen anbieten.
- 2026-10-23 · design-doris · BrainCraft · Übernommenes CSS aus einer Vorbild-App (Rechenstern) genauso streng prüfen wie neues: Tippflächen per elementFromPoint messen, Dunkel-Werte und Glas-Glanz nur als Tokens.
- 2026-10-23 · logo-luisa · BrainCraft · Jedes neue Symbol auf Fehldeutung als Standard-Icon prüfen (Kiste + Pfeil liest sich als Export) und für 16–32 px eine Klein-Variante mit dickerer Linie bauen.
- 2026-10-24 · design-doris · BrainCraft · Bei Spielen jeden Zustand (normal, Hinweis, Lösung, Ende) per Skript herbeiführen und das Bild ansehen, nicht nur Messwerte; Größen-Selektoren mit `>` begrenzen.
- 2026-10-24 · lern-lotte · BrainCraft · „Lösung zeigen“ je Spielform einzeln prüfen (bleibt die richtige Antwort sichtbar?) und Mehrschritt-Spiele nicht mit derselben Fehlergrenze wie Einzelantworten bewerten.
- 2026-10-24 · sicherheits-siggi · BrainCraft · Alle Apps auf marcokland-web.github.io teilen localStorage: bei jeder Prüfung die Nachbar-Apps auf CDN-Skripte ohne SRI und fehlende CSP mitprüfen.
- 2026-10-24 · bug-bodo · BrainCraft · Datenanbindung nur gegen einen Fake-Server testen (Service Worker blocken) und Warteschlangen-Sperren auch mit leerer Schlange aufrufen.
- 2026-10-25 · design-doris · BrainCraft · Getönte Glas-Knöpfe auf weißen Karten im Bild prüfen (dort deckend tönen) und Wischleisten auf Abstand-Drift und Überspringen testen.
- 2026-10-28 · design-doris · BrainCraft · Jedes Formular-Sheet im Bild prüfen: breite Feldregeln wie `.field input{all:unset}` treffen eingebettete Radios; neue Linien-Symbole zusätzlich auf 96 px ansehen.
- 2026-10-28 · sicherheits-siggi · BrainCraft · Bei Belohnungs-Funktionen einen Nachweis nur fordern, wenn der Client ihn nicht billig selbst erzeugen kann; sonst Tagesdeckel und Server-Regel.
- 2026-10-28 · daten-dieter · BrainCraft · Migrationen im geteilten Supabase-Projekt nur als Probelauf ohne Spuren testen (ganze Datei in einem DO-Block über die CLI, Abbruch am Ende) und danach Reste zählen.
- 2026-10-29 · design-doris · BrainCraft · Klassennamen neuer Ansichten gegen globale Bausteine abgleichen (`section.gear` erbte die Zahnrad-Regeln) und Overrides gegen das später geladene glass.css nachmessen.
- 2026-10-29 · bug-bodo · BrainCraft · Regeln der Form „kommt nach N anderen wieder“ immer mit weniger als N Resten testen und bei null-Rückgaben alle Bedeutungen von null prüfen.
- 2026-10-29 · bug-bodo · BrainCraft · Neue Steuerelemente in geteilten Containern per Geometrie prüfen (Segment 36–52 px hoch) und nach Regeländerungen auch alle älteren Spec-Dateien mitlaufen lassen.
- 2026-10-29 · lern-lotte · BrainCraft · Jeden Rückmeldetext gegen das prüfen, was das Kind im selben Moment sieht (Schaden, Restanzahl, Gesicht), und Fortschrittstexte gegen die echte Rechnung.
- 2026-10-29 · logo-luisa · BrainCraft · Gesichter in Kinder-Apps bei „brummig“ nur mit fast flachen Brauen zeichnen und bei doppelter Größe auf „wirkt böse?“ prüfen.
- 2026-10-29 · sicherheits-siggi · BrainCraft · Bei Zurücksetzen und Löschen prüfen, ob mitgelöschte Idempotenz-Schlüssel Offline-Warteschlangen anderer Geräte wieder buchbar machen.
- 2026-10-30 · daten-dieter · BrainCraft · Bei jeder Funktion zum Zurücksetzen oder Löschen prüfen, ob Offline-Warteschlangen anderer Geräte danach alte Antworten oder Sterne erneut buchen können (z. B. Zeitstempel am Profil).
- 2026-10-30 · bug-bodo · BrainCraft · Test-Locatoren für Knöpfe über Rolle und Namen suchen (`getByRole`), nicht über Text: neue Hilfetexte können denselben Wortlaut enthalten.
- 2026-10-30 · deploy-dennis · BrainCraft · Erst auf main pushen (= veröffentlichen), wenn alle Spec-Dateien und Unit-Tests der App grün sind; ein noch laufender Test zählt nicht als grün.
- 2026-10-30 · plan-paula · BrainCraft · Bei Plänen für Lern-Apps die bestehenden Regeln von Lern-Lotte aus `docs/entscheidungen.md` als Abnahmekriterien in den Plan übernehmen.
- 2026-10-30 · text-tina · B.A.S.E · Vor jeder Auslieferung mit sichtbaren Textänderungen und bei jeder Umstellung auf den Studio-Stil prüft Text-Tina alle gT-Paare, das Übersetzungswörterbuch und die gerenderte Oberfläche gegen die Familien-Wortliste, formuliert wörtliche Übersetzungen aus dem Englischen neu und prüft Fachaussagen gegen den Code. Automatischer Prüfpunkt: Wortlisten-Scan der sichtbaren deutschen Texte in der Freigabe-Prüfung.
- 2026-10-31 · deploy-dennis · B.A.S.E · Wird ein App-Icon geändert, bekommen alle Icon-Adressen (apple-touch-icon, Favicon, Manifest-Icons, Manifest-Link) eine neue Version (z. B. ?v=2 oder neuer Dateiname), und Marco erfährt, wie er eine schon installierte App neu anlegt.
