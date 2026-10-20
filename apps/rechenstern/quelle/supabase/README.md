# Rechenstern in Supabase (Projekt „Zähler“)

Eingespielt am 20.10.2026 in zwei Migrationen: `rechenstern_1_tabellen` und `rechenstern_2_funktionen`. Es wurden nur neue Objekte angelegt. Zählerstände, Haushalte und Gewohnheiten sind unverändert.

## Aufbau

- **Schema `rechenstern`** (nicht über die API erreichbar, Row Level Security an, keine Policies):
  - `familien`: ein Spielstand pro Familie (`state` als JSON, `version` für den Abgleich, Familien-Code nur als SHA-256).
  - `verlauf`: gesicherte frühere Stände (höchstens einer alle 10 Minuten), zum Zurückholen im Eltern-Bereich.
  - `push_abos`: Geräte mit Lern-Erinnerung (Uhrzeit, Wochentage, Zeitzone, Sprache).
- **Funktionen `public.rechenstern_*`**:
  - für die App (brauchen den Familien-Code): `create`, `pull`, `push` (nur wenn niemand dazwischen gespeichert hat), `versions`, `version_get`, `push_register`, `push_unregister`.
  - intern, nur mit dem `service_role`-Schlüssel (geprüft per `rechenstern.nur_server()`): `claim_due`, `abos`, `push_drop`, `secret`.
- **Edge Function `rechenstern-reminders`** (Quelltext in `rechenstern-reminders/index.ts`): verschickt die Erinnerungen per Web-Push. Keine Erinnerung, wenn an dem Tag schon gelernt wurde.
- **Zeitplan** `rechenstern-reminders` (pg_cron, alle 10 Minuten).
- **Geheimnisse** im Supabase Vault: `rechenstern_vapid_private`, `rechenstern_cron_secret`. Sie stehen nicht in diesem Repository. Der öffentliche VAPID-Schlüssel steht in der App.

## Schutz gegen Datenverlust

1. Jedes Gerät speichert seinen Stand sofort lokal; der Abgleich passiert danach.
2. Beim Abgleich werden die Stände zusammengeführt (`merge3` in der App): Zähler wie Sterne und gerechnete Aufgaben werden addiert, Erfolge vereinigt, Bestwerte maximiert.
3. Gespeichert wird nur, wenn kein anderes Gerät dazwischen gespeichert hat; sonst wird erneut zusammengeführt.
4. Vor jeder Zusammenführung legt das Gerät eine lokale Sicherung an (die letzten 3).
5. Frühere Stände bleiben im Verlauf und lassen sich im Eltern-Bereich zurückholen.
