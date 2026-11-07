# Prüfung „Kein Modus nur per Tastatur“ (Design-Doris, 06./07.11.2026)

Regel (Marco, 06.11.2026): Jeder Modus, jedes Pop-up und jedes Menü lässt sich mit einem sichtbaren Knopf beenden („Fertig“, „Abbrechen“, „Schließen“). Ein solcher Knopf ist mindestens 44 × 44 px groß und auch auf dem iPhone nicht verdeckt. Enter, Esc, Tippen daneben und Wischen gelten nur als Ergänzung.

**Geprüft:** 7 Apps. Zeitwort (Clock2) ist ausgelassen.
**Methode:** Ich habe den Code durchsucht (Escape/keydown, `<dialog>`, Sheet-/Modal-Bausteine, Menüs, Modi, Toasts). Bei B.A.S.E, der Team-Seite und Rechenstern habe ich zusätzlich im Browser gemessen: Playwright auf 390×844, 820×1180 und 1440×900. Jeder Zustand wurde per Skript hergestellt. Der Schließen-Knopf wurde mit `getBoundingClientRect` vermessen und mit `elementFromPoint` auf Verdeckung geprüft. Die Skripte liegen im Scratchpad unter `doris/dbase.mjs` und `doris/dteam.mjs`.

## B.A.S.E (`~/Apps/BASE/index.html`)

| Fundstelle | Was | Verstoß | Vorschlag |
|---|---|---|---|
| index.html:1244 `menuHTML` (`.pmm .pmenu`) | ⋯-Menü. Auf iPhone und iPad ist es ein Aktionsblatt mit 8 Einträgen ohne „Abbrechen“; es schließt nur, wenn man daneben tippt. Am Desktop ist es ein Dropdown, das nur über ⋯ oder einen Tipp daneben schließt. | **ja** | Auf iPhone/iPad unten einen eigenen Knopf „Abbrechen“ (volle Breite, ≥ 44 px) wie bei iOS-Aktionsblättern ergänzen. Am Desktop reicht der Auslöser, wenn er sichtbar umschaltet (`aria-expanded`). |
| index.html:1352 `qsheetHTML` (`.qsheet`, data-a `qsx`) | Schnelleingabe → „+ Alle“ → Sheet „Kategorie wählen“. Es gibt keinen Knopf; das Sheet schließt nur bei einem Tipp auf den Hintergrund. | **ja** | In die Kopfzeile „Kategorie wählen“ rechts „Fertig“ oder ✕ (44 × 44) einbauen. |
| index.html:1515 `goalHTML` (Modal `goal`) | „Aktuelles Ziel“: Es gibt nur die Auswahlzeilen. Ohne Auswahl schließt es nur mit Esc oder einem Tipp daneben. | **ja** | Wie bei den anderen `.mod` eine Zeile `.mb` mit „Abbrechen“ ergänzen. |
| index.html:1371 `loginHTML` (`finishing`) | „Anmeldung wird abgeschlossen …“: Das Fenster hat keinen Knopf. Hängt der Code-Tausch, kommt man nur mit Esc oder einem Tipp daneben heraus. | **ja (gering)** | Nach ca. 10 s einen Knopf „Abbrechen“ einblenden. |
| index.html:769–787 `.mod .mb` (cat, grp, newcat, newgrp, target, acct, xfer, move, bulkcat, paste, tpl, fresh, accedit, accdel, rec, check, act, moves, bk, info, pins) | Die Knöpfe „Abbrechen“, „Schließen“, „OK“ und „Fertig“ sind sichtbar, aber nur **34–38 px hoch**, gemessen auf allen drei Geräten, z. B. „Abbrechen“ 85 × 34 und „Schließen“ 79 × 34. „Zurück“ in der Buchung (act-edit) misst 61 × 34. | **ja (Größe)** | Für `.mod .mb button` und `.mod .lk` gilt `min-height:44px`; die bestehende Regel `html:root.tabm :is(...)` (Z. 507) entsprechend erweitern. |
| index.html:729 `mpop` (Desktop) | Monatswahl-Pop-up ohne Schließen. Es schließt nur über den Monatstitel oder einen Klick daneben. | **ja (leicht)** | Den Auslöser als Umschalter kennzeichnen (`aria-expanded`) oder unten „Fertig“ ergänzen. |
| index.html:731 `.pop` (Desktop, „Assign ▾“) | Das Pop-up „Automatikmodus“ hat kein Schließen. Es schließt nur über den Auslöser oder einen Klick daneben. | **ja (leicht)** | Wie bei `autoSheetHTML` in der Kopfzeile ein ✕ (44 px) ergänzen. |
| index.html:1009–1010 `txForm` (Desktop, Buchung hinzufügen/bearbeiten) und Auswahlmodus `tsel` | „Abbrechen“ ist sichtbar, misst aber nur **112 × 20 px**. | **ja (Größe)** | Am Desktop wenigstens 32–36 px Zielhöhe geben. Der Studio-Standard verlangt 44 px. |
| index.html:1475 `sheetHTML` (iPhone/iPad, Schnelleingabe) | ✕ oben links, 44 px, sichtbar. Das Typ-Menü (`tmenu`) schließt über den Typ-Knopf. | nein | – |
| index.html:1490 `pickerHTML` | ✕ bzw. ‹, 46 × 46. | nein | – |
| index.html:1697 `autoSheetHTML` | ✕, 44 × 44. | nein | – |
| index.html:1565 `rvHTML` (Durchsicht) | ‹ und „Fertig“, 74 px hoch. | nein | – |
| index.html:1200 `padHTML` (Zahlenblock) | „Fertig“ (174 × 53) und ✕. | nein | – |
| index.html:1248 `dispHTML` (Einstellungen) | „Fertig“, 67 × 44. | nein | – |
| sbout / sbswap / sbswap2 | × (44 × 44) und „Abbrechen“ (volle Breite). | nein | – |
| index.html:1544 Analyse-Detail (`rdet`) | ‹, 46 × 46. | nein | – |
| Auswahlmodus Buchungen (`tsel`, iPhone/iPad) | „Fertig“, 80 × 44. | nein | – |
| index.html:1018 Zuweisungsfeld `#ai` | Enter und Esc beenden die Eingabe; Weggehen speichert. Das ist ein Inline-Feld, kein Modus. | nein (Hinweis) | – |
| Toast „Rückgängig“ | Verschwindet nach 4,5 s von selbst. | nein | – |

## Gewohnheiten (`~/Apps/Gewohnheiten/src`)

| Fundstelle | Was | Verstoß | Vorschlag |
|---|---|---|---|
| components/ui.tsx:98–106 `Sheet` | Jedes Sheet hat oben rechts „Fertig“ oder ✕ (`size-11` = 44 px). Esc und ein Tipp daneben sind nur Ergänzung. Betrifft Einstellungen, Editor, Notiz, Nachtragen, Rückfragen und Abmelden. | nein | – |
| components/Today.tsx:83 | Sortiermodus mit „Fertig“, `min-h-11`. | nein | – |
| components/HabitDetail.tsx:63 | Detail mit „Zurück“, `min-h-11`. | nein | – |
| App.tsx:107–110 | Fehlermeldung mit ✕ (`size-11`). | nein | – |

## Zählerstände (`~/Apps/zaehler-app/src`)

| Fundstelle | Was | Verstoß | Vorschlag |
|---|---|---|---|
| components/Modal.tsx:85–92 | Alle Dialoge (Einstellungen „Fertig“, sonst ✕ `h-11 w-11`) laufen über diesen Baustein: Erfassen, Foto/Sprache, Zähler, Rückfragen, Familie. | nein | – |
| components/CaptureDialog.tsx:161 | Die Sprachaufnahme stoppt per sichtbarem Knopf. | nein | – |

## GymBuddy (`~/Apps/GymBuddy/src`)

| Fundstelle | Was | Verstoß | Vorschlag |
|---|---|---|---|
| components/ui/Sheet.tsx:63 | Alle 14 Sheets haben „Fertig“, `min-h-11`. | nein | – |
| components/AccountCard.tsx:264 | Die Abmelde-Rückfrage hat „Abbrechen“. | nein | – |
| components/ToastProvider.tsx:95 | Toast mit ✕ (`size-11`). | nein | – |
| components/workout/RestTimerBar.tsx:79 | Pausen-Kapsel mit „Überspringen“ bzw. ✕ (`size-11`). | nein | – |
| components/ui/Stepper.tsx:91 | Inline-Zahlenfeld: Esc bricht ab, Enter oder Weggehen übernimmt. Die iOS-Zifferntastatur (`decimal`) hat kein Enter; man beendet die Eingabe durch Weggehen. Ein sichtbares „Abbrechen“ fehlt. | nein (Hinweis) | Optional einen kleinen Knopf ✕ „Abbrechen“ neben dem Feld zeigen, solange bearbeitet wird. |

## BrainCraft (`~/Apps/BrainCraft/src`)

| Fundstelle | Was | Verstoß | Vorschlag |
|---|---|---|---|
| components/Sheet.tsx | Der Baustein selbst hat **keinen** eigenen Schließen-Knopf. Alle 13 Verwendungen bringen aber einen mit: Assist.tsx:98, ShopManager.tsx:166/244/265, Devices.tsx:138/151/164, Family.tsx:136, Setup.tsx:247, Shop.tsx:164/176, Reconnect.tsx:86, Manage.tsx:123/158. | nein | Den Knopf in den Baustein ziehen (Prop `done`), damit neue Sheets ihn nicht vergessen. |
| Devices.tsx:138, Manage.tsx:158 | Der einzige Ausweg „Abbrechen“ steht unten unter einem Eingabefeld. Am iPhone kann die Tastatur ihn verdecken. | nicht prüfbar (Risiko) | Abbrechen zusätzlich oben in die Kopfzeile setzen (wie ShopManager.tsx:166). |
| components/Settings.tsx | „Fertig“ (`.st-done`). | nein | – |
| views/Parents.tsx:221/250/348 | Eltern-Bereich mit „Fertig“ bzw. „Jetzt sperren“; die Abmelde-Rückfrage hat „Abbrechen“. | nein | – |
| views/Arena.tsx:217, Boss.tsx:194 | Runde/Boss mit ✕ (`.arena .x` 44 × 44, game.css:6). | nein | – |
| views/Together.tsx:165 | Gemeinsames Abfragen mit „Beenden“. | nein | – |
| App.tsx:341 | Der Toast ohne Aktion verschwindet von selbst. | nein | – |

## Team-Seite (`~/Apps/DasTeam`)

| Fundstelle | Was | Verstoß | Vorschlag |
|---|---|---|---|
| app.js:274 | Steckbrief mit ×, gemessen 46 × 46 auf allen drei Geräten. | nein | – |
| index.html:337 | Einstellungen mit „Fertig“, gemessen 55 × 44. | nein | – |

## Rechenstern (`~/Apps/DasTeam/apps/rechenstern`)

| Fundstelle | Was | Verstoß | Vorschlag |
|---|---|---|---|
| index.html:64 | Namens-Pop-up mit „Später“, 312 × 52. | nein | – |
| index.html:72 | Einstellungen mit „Fertig“, 55 × 44. | nein | – |
| app.js:432 / 443 | Spielrunde mit ✕ „Runde beenden“ (46 × 46). Die Rückfrage hat „Beenden“ (114 × 52) und „Weiterspielen“. Esc (app.js:1904) ist nur Ergänzung. | nein | – |
| app.js:896 `actHead`, 1483 | Aktivitäten (Abzeichen, Tricks, Muster, Advent gemessen 46 × 46; Duell, Geschichte und Schoko nur im Code) haben ✕. | nein | – |
| app.js:89 | Eltern-Bereich mit „Eltern-Bereich schließen“. | nein | – |

## Nicht prüfbar

- **Echte iOS-Tastatur:** Ob die Tastatur einen Knopf verdeckt, lässt sich ohne echtes Gerät nicht zeigen (betrifft BrainCraft Devices/Manage und alle Formular-Sheets).
- **Gewohnheiten, Zählerstände, GymBuddy, BrainCraft** nur im Code geprüft: Sie brauchen Anmeldung bzw. Mocks und eigene Server, und ein lokaler Server wurde in dieser Sitzung nicht erlaubt. Die gemeinsamen Bausteine (Sheet/Modal) belegen den Schließen-Knopf jeweils zentral.
- **Rechenstern-Aktivitäten Duell, Geschichte und Schoko** nur im Code geprüft: Ich konnte den Zustand per Skript nicht vollständig herstellen.
