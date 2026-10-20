# Prüfbericht B.A.S.E – Build 2026.10.19-9

Zusammengefasst von Qualitäts-Quentin (Teamleitung Qualität & Sicherheit), 20.10.2026.
Geprüft von: Design-Doris, Text-Tina, Bug-Bodo, Rant-Randy, Sicherheits-Siggi, Daten-Dieter, Deploy-Dennis, Logo-Luisa.
Geprüft wurde der Stand auf GitHub (`marcokland-web/umschlag`, `ynab.html` = `index.html`). Neuere Änderungen auf Marcos Mac sind nicht enthalten.
Getestet mit Testdaten in einer lokalen Kopie, ohne Zugriff auf das echte Supabase-Projekt. Zeilennummern beziehen sich auf `ynab.html`.

**Ergebnis der Freigabe-Prüfung: NICHT freigegeben.**

## Was gut ist

- Die Umschlag-Logik rechnet in allen nachgerechneten Fällen richtig: Rest bleibt in der Kategorie, Überzogenes geht vom nächsten Monat ab, Split, Überweisung, 29. Februar und Undo stimmen (Bodo).
- Kein seitliches Scrollen auf Desktop, iPad und iPhone in allen 30 geprüften Ansichten; die iPhone-Schnelleingabe ist wirklich scrollfrei (Doris).
- Supabase-Absicherung (RLS) ist für alle 7 Tabellen vollständig; Beträge sind in der Datenbank `numeric(14,2)`; Namen und Notizen werden fast überall sauber maskiert (Siggi, Dieter).
- Alle Icons zeigen das neue B.A.S.E-Logo; die App ist installierbar (Luisa, Dennis).
- Die Übersetzung ist sehr weit, kaum englische Reste (Tina).

---

## 1. Kritisch – Gefahr für Daten oder falsches Geld

| # | Befund | Wo | Vorschlag | Von |
|---|---|---|---|---|
| K1 | **Geht die Uhr eines Geräts nach, können Buchungen beim Sync verschwinden.** Ob lokal oder in der Cloud etwas neu ist, wird nur über Geräte-Zeitstempel entschieden (`lc=S.mod>base.mod`, `rc=st.rev>base.mod`). Eine neue Buchung auf einem nachgehenden iPhone wird nicht hochgeladen und beim nächsten Abruf überschrieben. | Z. 496, 874, 896–905 | Keine Zeitstempel vergleichen: lokal ein `dirty`-Merker, auf dem Server ein Zähler `rev bigint` (per Trigger hochgezählt). „Cloud geändert“ = `st.rev !== base.rev`. | Dieter |
| K2 | **Zwei Geräte, die gleichzeitig hochladen, überschreiben sich.** `base_settings` wird ohne Prüfung geschrieben; Notizen, Empfänger, Pins des einen Geräts gehen verloren, und beide halten ihren Stand danach für aktuell. | Z. 888, 895–899 | Bedingtes Schreiben (`… where rev = <gelesener rev>`) bzw. eine Supabase-Funktion, die alles in einer Transaktion schreibt und bei veraltetem Stand ablehnt; dann neu abrufen und zusammenführen. | Dieter |
| K3 | **„1.234“ wird als 1,23 € gespeichert.** Ein deutscher Tausenderpunkt wird als Komma gelesen; „1,234.56“ ebenfalls 1,23. | `num()` Z. 481 | Punkt mit genau 3 folgenden Ziffern = Tausendertrenner; bei Punkt und Komma entscheidet das letzte Zeichen. Test: `num("1.234")===1234`, `num("1.234,56")===1234.56`, `num("1,234.56")===1234.56`. | Bodo |
| K4 | **Abmelden lässt alle Finanzdaten auf dem Gerät, und wer sich danach anmeldet, lädt sie in sein eigenes Konto hoch.** Ebenso: Meldet sich ein Gerät zum ersten Mal an, das vorher lokal Daten (oder nur die Musterdaten aus `seed()`) hatte, werden diese komplett zu den echten Cloud-Daten hochgeladen – doppelte Konten/Gruppen, und lokal Gelöschtes taucht wieder auf. | `sbout` Z. 795, `seed()` Z. 491, `sbSync` Z. 896–903 | Beim Abmelden „Daten auf diesem Gerät löschen?“ (Standard ja): `ynab-nachbau-v1`, `sb-snap`, `ynab-lastacc`, IndexedDB `base-backup` leeren. `sb-uid` merken; bei anderer Person oder erster Anmeldung mit vorhandenem Cloud-Stand fragen „Cloud-Daten übernehmen oder dieses Gerät hochladen?“. Unveränderte Musterdaten nie hochladen. | Siggi, Dieter |

## 2. Hoch – deutlich falsch, sollte vor dem nächsten Ausbau behoben werden

| # | Befund | Wo | Vorschlag | Von |
|---|---|---|---|---|
| H1 | **Bearbeiten → Typ „Überweisung“ erzeugt ein Duplikat**: Die alte Ausgabe bleibt, zusätzlich entsteht die Überweisung. Geld zählt doppelt. | iPhone/iPad, `shSave` Z. 1224 | Im Überweisungs-Zweig `if(eid) S.tx=S.tx.filter(t=>t.id!==eid)` innerhalb von `commit`. | Bodo |
| H2 | **Kategorie löschen lässt das Restgeld verschwinden**: Zuweisungen bleiben als verwaiste Schlüssel und belasten „Zuweisbar“, Buchungen werden unkategorisiert. (Beispiel: 150 € verfügbar, „Zuweisbar“ sinkt um 100 statt zu steigen.) | `mdel` Z. 663 | Wie YNAB: vor dem Löschen Ziel-Kategorie abfragen und Zuweisungen samt Buchungen dorthin verschieben; mindestens die `assigned`-Schlüssel mitlöschen. | Bodo |
| H3 | **Konto löschen schreibt die Vergangenheit um**: „Zuweisbar“ sinkt um den Kontostand, Ausgaben verschwinden rückwirkend aus Kategorien, Gegenbuchungen von Überweisungen werden zu Einnahmen. | `accdelok` Z. 807 | „Konto schließen“ als Standard (Saldo 0, Historie bleibt, ausgeblendet); hartes Löschen nur ohne Buchungen. | Bodo |
| H4 | **Schadcode über das Emoji-Feld der Kategorie**: `${c.emoji}` wird ohne `esc()` eingesetzt; `<img src=x onerror=…>` wird auf allen Geräten ausgeführt – auch wenn es per Import oder Sync hereinkommt. Damit wäre das Supabase-Token lesbar. | Z. 537, 557, 578, 954, 1036, 1091, 1105, 1154, 1233–1258, 1307 | Überall `esc(c.emoji)`; beim Speichern auf 2 Zeichen ohne `<>` begrenzen; Import und `sbBuild` durch eine Bereinigung schicken. | Siggi |
| H5 | **Speicherfehler werden still geschluckt** (13 leere `catch(e){}`). Ist der Speicher voll (Plan + `sb-snap` doppelt, Grenze etwa bei 18.000 Buchungen), speichert die App lokal nicht mehr – ohne Hinweis. | `save()` Z. 496, `lsSet`, `bkSave` Z. 1338 | Sichtbarer Hinweis „Lokal nicht gespeichert – Backup exportieren“; `sb-snap` nur als Prüfsummen oder beides nach IndexedDB. | Randy, Dieter |
| H6 | **Ungerundete Kommazahlen im Zustand und in Supabase** (z. B. `150.1+0.2 = 150.29999999999998` bei „Auffüllen“), gerundet wird an ~20 Stellen einzeln. | `fill` Z. 660, „Neuanfang“ Z. 691, `accBal` Z. 515 | Beträge intern als ganze Cent speichern (Migration in `migrate()`), anzeigen mit `F(c/100)`; übergangsweise eine zentrale `r2()`. | Randy |
| H7 | **Langsam bei vielen Buchungen**: Die Suche baut bei jedem Buchstaben die ganze App neu (575 ms bei 2000, 1,15 s bei 5000 Buchungen); eine Zuweisung auf dem iPhone 472 ms bei 5000 Buchungen. Wird mit jedem Jahr Nutzung langsamer. | Suche Z. 962, `render()` Z. 609, `act/avail/rtaOf` Z. 503–507 | Suche verzögern (150 ms) und nur die Liste neu zeichnen; Listen in Blöcken (100–200 Zeilen); einmal pro Render einen Summen-Index `catId|Monat` bauen. | Randy, Bodo |
| H8 | **iPhone-Plan: letzte Kategorie liegt dauerhaft unter „+ Buchung“** – nicht lesbar, nicht antippbar. | `.tab.vplan main` Z. 313 | `padding-bottom:calc(180px + env(safe-area-inset-bottom))`; ebenso Buchungsliste prüfen. | Doris |
| H9 | **Kontostände im hellen Design kaum lesbar**: Grün 1,5:1, Rot 1,9:1, Einnahmen 2,0:1 (nötig 4,5:1). | iPhone/iPad Konten und Buchungsliste | Eigene Farben für Hell, z. B. Grün `#2D7A1E`, Rot `#C62828`. | Doris |
| H10 | **Knöpfe in den Kopfleisten nur 29 px hoch** (✎ ≡ ⋯ 🔍 ＋), Abgleich-Kreis 20 px, Pillen 25 px – zu klein zum Tippen. | Z. 465 überschreibt Z. 200 | `min-height/min-width:44px`; bei Kreis und Pillen die Trefferfläche vergrößern, Aussehen kann bleiben. | Doris |
| H11 | **Das Wörterbuch übersetzt auch eigene Namen**: Kategorie „Auto“ erscheint als „Automatisch“ (ebenso „Plan“, „Name“, …). | `trDom` Z. 827, 848–849 | Nutzertexte mit `translate="no"`/`data-nt` kennzeichnen und überspringen; langfristig alles auf `gT()` und `trDom` abschaffen. | Tina |
| H12 | **Ausgaben ohne Kategorie heißen „Zufluss: Zuweisbar“** (Desktop) bzw. „Einnahme: Zuweisbar“ (iPhone). | `cn()` Z. 568, 578 | „Ohne Kategorie“ für Ausgaben, „Einnahme → Noch zu verteilen“ für Einnahmen. | Tina |
| H13 | **Kein Masken-Icon und blaue statt bordeaux Statusleiste**: Manifest sagt `#6e1a35`, HTML und `applyTheme()` setzen `#4f6fe3`; das 512er-Icon wird im Kreis-Zuschnitt (Android) angeschnitten. | `ynab-manifest.json`, Z. 6, Z. 991 | `base-icon-maskable-512.png` (B auf ~60 %) mit `purpose:"maskable"`; eine Markenfarbe festlegen (siehe Entscheidung 2) und überall gleich setzen. | Dennis, Luisa |

## 3. Mittel

- **Zuweisung in einem Zukunftsmonat senkt das aktuelle „Zuweisbar“ nicht** – dasselbe Geld lässt sich im laufenden Monat noch einmal verteilen (YNAB: „Assigned in Future“). `rtaOf` Z. 506. *(Bodo)*
- **Kreditkarte wird wie Bargeld behandelt**: alle Konten stehen unter „Bargeld“ mit 💵; Überzug mit der Karte senkt „Zuweisbar“, eine Zahlungskategorie fehlt. Kontotypen (Giro/Tagesgeld/Kreditkarte) einführen. Z. 506, 1264, 1267. *(Bodo, Doris)*
- **Negative Beträge werden still umgedeutet**: „−25“ als Ausgabe zählt als +25 € Einnahme; Überweisung über −100 wird gespeichert. `Math.abs()` oder ablehnen. *(Bodo)*
- **Datum bleibt nach Mitternacht stehen**: `TODAY` wird nur beim Laden berechnet (Z. 482); neue Buchungen bekommen das alte Datum. Bei `visibilitychange` neu setzen; „Gestern“ über `new Date(y,m,d-1)`. *(Randy)*
- **Zusammenführen bei Konflikten ganzzeilig**: Desktop ändert Betrag, iPhone offline das Memo – eine Änderung geht verloren; gelöschte Konten/Gruppen hinterlassen verwaiste Buchungen und Kategorien. Einstellungen feldweise zusammenführen, nach dem Sync Verwaiste prüfen, ggf. `deleted_at` statt Löschen. Z. 876, 903. *(Dieter)*
- **Cloud-Abruf ersetzt lokale Daten ohne Sicherung** – vorher `bkSave('sync')`, bei >20 % gelöschten Buchungen nachfragen. Z. 902–903. *(Dieter)*
- **Offline-Start nicht garantiert**: Service Worker speichert nichts vorab, wartet ohne Zeitlimit aufs Netz, Cache-Name fest `base-v3`, cacht auch fremde Antworten. Vorab-Cache bei `install`, 3-s-Timeout, Cache-Name aus `BUILD`. *(Dennis, Randy, Siggi)*
- **`deploy.sh` prüft nur die Syntax** und läuft unter bash im falschen Ordner (`${0:A:h}` gibt es nur in zsh); `git add -A` nimmt alles mit; `pull --rebase` nach dem Commit. Siehe „Freigabe-Prüfung“ unten. *(Dennis, Randy)*
- **Keine Content-Security-Policy, Supabase-SDK ohne Integritäts-Prüfung** (Z. 855, 919). *(Siggi)*
- **E-Mail-Adresse fest im Planmenü** (Z. 996) und damit für jeden sichtbar → `esc(sbUser?.email||'')`. *(Siggi)*
- **Löschen ohne Rückfrage** bei Kategorie, markierten Buchungen und Buchung im iPhone-Formular; beim Konto ist „Endgültig löschen“ blau wie „Speichern“. Einheitlich: Rückfrage mit rotem Knopf oder „Gelöscht · Rückgängig“-Streifen. *(Tina)*
- **Eine Sache, mehrere Namen; Fachchinesisch** („Unterfinanziert“, „Zuweisbar“, „Alter des Geldes“, Spalte „C“, „BARGELD“). Lösung: Familien-Wortliste (Anhang). *(Tina)*
- **iPhone-Plan: Kopfzeile beim Scrollen durchsichtig** (Z. 420, 461) → deckender oder unscharfer Hintergrund. *(Doris)*
- **iPad dunkel: Karte „Benachrichtigungen“ unsichtbar** (Z. 1264). *(Doris)*
- **Logo fehlt auf iPhone und iPad**, steckt nur im Desktop-Menüknopf; Logo bordeaux/gold, App blau/violett (siehe Entscheidung 2). *(Luisa)*
- **Manifest**: `start_url` `./ynab.html` statt `./`, keine `id` (Gefahr einer zweiten installierten App), `lang`/`description` fehlen. *(Dennis)*
- **Google Fonts direkt eingebunden** (Z. 7) – Datenschutz; Figtree selbst ausliefern. *(Siggi)*

## 4. Niedrig

- Toter Code: `voice`, `parseVoice`, `photoScan`, `parseReceipt`, `fillFrom` (Z. 1050–1073), `closeAll` (Z. 636); doppelte Löschlogik (`tdel`/`txdel`), vier globale Klick-Handler, 22-KB-Base64-Logo in Z. 1299. *(Randy)*
- Rote Zähler in der Tab-Leiste 3,96:1 → `#D32F2F`. *(Doris)*
- Einmal „Sie“ statt „du“ (Z. 594); „1.150,00€“ ohne Leerzeichen (Z. 474); „Oktober Zusammenfassung“ und fest „Hallo Marco“ (Z. 1247/1250); leere Suche ohne Hinweis. *(Tina, Doris)*
- Bearbeitete Überweisung verliert „abgeglichen“ (Z. 1126); einzelner Split-Teil löschbar ohne Warnung. *(Bodo)*
- Favicon unscharf 48 px; Icon-Dateien heißen noch `ynab-icon-*`; `base-logo-512.png` unbenutzt, CLAUDE.md behauptet anderes. *(Luisa)*
- Alte Google-OAuth-Client-ID in der Git-Historie (nicht geheim; in der Google Cloud Console löschen, falls ungenutzt). *(Siggi)*
- Schema: `updated_at` ohne Trigger, fehlende `check (outflow>=0 and inflow>=0)`, ungenutzte Indizes. *(Dieter)*

---

## Entscheidungen für Marco

1. **Registrierung schließen** – Supabase-Dashboard → Authentication → „Allow new users to sign up“ ausschalten, sobald alle Familienkonten angelegt sind; Mindestlänge Passwort ≥ 10, „Leaked password protection“ an. (Nur Marco kann das.)
2. **Markenfarbe** – App-Oberfläche ist blau/violett, Logo und Manifest bordeaux/gold. Eins von beiden festlegen.
3. **Konten wie YNAB** – Kontotypen (Giro/Tagesgeld/Kreditkarte) mit Zahlungskategorie für Karten und „Konto schließen“ statt Löschen?
4. **Sync-Prüfstand (Idee von Technik-Toni, bisher nicht genehmigt)** – Die kritischen Befunde K1, K2 und K4 lassen sich nur mit einem Prüfstand aus zwei simulierten Geräten sicher beheben und dauerhaft absichern. Empfehlung des Teams: genehmigen.

## Freigabe-Prüfung für B.A.S.E (Vorschlag)

`deploy.sh` wird zur Schranke: (1) `BUILD` gegenüber `HEAD` erhöht, (2) Smoke-Test auf iPhone/iPad/Desktop ohne Seitenfehler und ohne seitliches Scrollen, (3) Icons, Manifest und Installierbarkeit (`tools/freigabe-check.js` aus dem Repo DasTeam), (4) Leistungstest mit 2000 Buchungen (Kontoansicht < 100 ms), (5) Betrags-Prüfung (`num()`-Tests, alle Beträge auf Cent), (6) kein neues leeres `catch(e){}`, (7) gezieltes `git add` statt `-A`, `pull --rebase` vor dem Commit, `#!/usr/bin/env bash`.

## Anhang: Entwurf Familien-Wortliste (Text-Tina)

| Verwenden | Nicht verwenden |
|---|---|
| Plan | Budget, Haushaltsplan |
| Zuweisen | Budgetieren, Einplanen |
| Noch zu verteilen | Zuweisbar, Ready to Assign |
| Konto / Konten (Überschrift) | Account, Bargeld, CASH |
| Kontostand | Saldo, Working Balance |
| Buchung | Transaktion, Umsatz |
| Ausgabe / Einnahme | Outflow/Inflow, Zufluss |
| Empfänger | Zahlungsempfänger, Payee |
| Notiz | Memo |
| Ohne Kategorie | Zufluss: Zuweisbar |
| Gebucht ✓ | Abgeglichen, Cleared |
| Kontostand korrigieren / Korrekturbuchung | Kontoabgleich, Abstimmungsbuchung |
| Überweisung | Umbuchung, Transfer |
| Aufteilen | Split |
| Ziel | Target, Vorgabe |
| Fehlt noch / Gedeckt | Unterfinanziert / Finanziert |
| Überzogen | Overspent |
| Pausieren | Snoozen |
| Analyse | Reflect, Berichte |
| du | Sie |
| 1.234,56 € (mit Leerzeichen) | 1.234,56€ |
| 20. Oktober 2026 / 20.10.2026 | 2026-10-20 |

Belege (Skripte, Messwerte, Screenshots) liegen in der Prüfumgebung unter `base-review/<name>/`.
