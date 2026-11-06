-- =====================================================================
-- Auth-Hook „Before User Created“ – Projekt asfwbuptsfcrgmmgdgim
-- (Zählerstände, Gewohnheiten, BrainCraft): neue Konten nur für die Familie.
--
-- ANLEITUNG FÜR MARCO
--   1. Diese Datei im Supabase-Dashboard unter „SQL Editor“ komplett ausführen.
--      Sie darf vor, zwischen oder nach Zähler-006 und BrainCraft-007 laufen und
--      kann gefahrlos mehrfach ausgeführt werden.
--   2. Zuerst deine Adressen in die Erlaubnisliste eintragen (siehe Beispiel unten),
--      sonst kann sich niemand Neues mehr anmelden.
--   3. Dashboard → Authentication → Hooks → „Before User Created“ → „Add hook“ →
--      Typ „Postgres“ → Schema „private“ → Funktion „hook_before_user_created“ wählen
--      und speichern.
--   4. Unter Project Settings → API → „Exposed schemas“ darf „private“ NICHT stehen.
--   Ausschalten: denselben Hook im Dashboard wieder deaktivieren.
--
-- Wer darf ein neues Konto anlegen? Die vereinheitlichte E-Mail-Adresse muss
--   (a) in private.allowed_emails stehen, ODER
--   (b) eine Einladung in public.household_invites haben (Zählerstände, ab 006), ODER
--   (c) eine noch gültige Einladung in braincraft.parent_invites haben (BrainCraft, ab 007).
-- Fehlt eine dieser Tabellen noch, wird sie einfach übersprungen.
--
-- Bestehende Konten sind nicht betroffen: Der Hook läuft nur, wenn Supabase einen neuen
-- Eintrag in auth.users anlegen will. Meldest du dich mit Google an und gibt es schon ein
-- Konto mit derselben bestätigten Adresse, verknüpft Supabase die Google-Identität mit
-- diesem Konto (automatisches Identity-Linking), es entsteht kein neues Konto und der
-- Hook wird nicht gefragt.
--
-- Beispiel (Adresse wird beim Speichern automatisch vereinheitlicht):
--   insert into private.allowed_emails (email, note)
--   values ('vorname.beispiel@gmail.com', 'Wer das ist')
--   on conflict (email) do nothing;
-- Anschauen:  select * from private.allowed_emails order by added_at;
-- Entfernen:  delete from private.allowed_emails where email = private.email_norm('…');
-- =====================================================================

-- ---------------------------------------------------------------------
-- Schema private: nicht über die API erreichbar, nur der Auth-Dienst darf hinein
-- ---------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to supabase_auth_admin;

-- ---------------------------------------------------------------------
-- Eigene Kopie der E-Mail-Vereinheitlichung (wie braincraft.email_norm in BrainCraft-007;
-- deckt auch public.normalize_email aus Zähler-006 ab): klein, ohne Leer- und unsichtbare
-- Zeichen; gmail.com/googlemail.com ohne Punkte und +Zusatz, googlemail.com → gmail.com.
-- ---------------------------------------------------------------------
create or replace function private.email_norm(p_email text)
returns text language plpgsql immutable set search_path = '' as $$
declare v text := lower(regexp_replace(left(coalesce(p_email, ''), 320), ('[[:space:]' || chr(160) || chr(173) || chr(6158) || chr(8203) || '-' || chr(8207) || chr(8232) || '-' || chr(8239) || chr(8288) || '-' || chr(8292) || chr(65279) || ']'), '', 'g'));
  v_local text; v_domain text;
begin
  if position('@' in v) = 0 then return v; end if;
  v_local := split_part(v, '@', 1);
  v_domain := split_part(v, '@', 2);
  if v_domain in ('gmail.com', 'googlemail.com') then
    v_local := replace(split_part(v_local, '+', 1), '.', '');
    v_domain := 'gmail.com';
  end if;
  return v_local || '@' || v_domain;
end $$;

-- ---------------------------------------------------------------------
-- Erlaubnisliste (leer angelegt)
-- ---------------------------------------------------------------------
create table if not exists private.allowed_emails (
  email    text primary key,
  note     text,
  added_at timestamptz not null default now()
);

-- Adresse beim Eintragen vereinheitlichen, damit Vergleich und Primärschlüssel passen
create or replace function private.allowed_emails_norm()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.email := private.email_norm(new.email);
  if new.email !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
    raise exception 'Ungültige E-Mail-Adresse: %', new.email;
  end if;
  return new;
end $$;

drop trigger if exists allowed_emails_norm on private.allowed_emails;
create trigger allowed_emails_norm
  before insert or update of email on private.allowed_emails
  for each row execute function private.allowed_emails_norm();

alter table private.allowed_emails enable row level security;
drop policy if exists allowed_emails_auth_admin_read on private.allowed_emails;
create policy allowed_emails_auth_admin_read on private.allowed_emails
  for select to supabase_auth_admin using (true);

revoke all on table private.allowed_emails from public, anon, authenticated;
grant select on table private.allowed_emails to supabase_auth_admin;

-- ---------------------------------------------------------------------
-- Der Hook
-- Läuft als Eigentümer (security definer), darum braucht supabase_auth_admin keine
-- Rechte auf die Einladungstabellen der Apps. Die Tabellen der Apps werden nur per
-- to_regclass und dynamischem SQL angesprochen, damit der Hook auch funktioniert,
-- solange 006/007 noch nicht eingespielt sind. Fällt eine Einzelprüfung aus (z. B.
-- geänderte Spalte), zählt sie als „nicht eingeladen“; die anderen Prüfungen laufen weiter.
-- ---------------------------------------------------------------------
create or replace function private.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_raw   text := coalesce(event -> 'user' ->> 'email', '');
  v_email text := private.email_norm(v_raw);
  v_ok    boolean := false;
  v_deny  constant jsonb := jsonb_build_object('error', jsonb_build_object(
            'http_code', 403,
            'message', 'Kein Zugang – bitte von der Familie freischalten lassen.'));
begin
  if v_email = '' or position('@' in v_email) = 0 then
    return v_deny;  -- ohne E-Mail (Telefon, anonym) kein neues Konto
  end if;

  -- (a) Erlaubnisliste
  if exists (select 1 from private.allowed_emails a where a.email = v_email) then
    return '{}'::jsonb;
  end if;

  -- (b) Zählerstände: offene Haushalts-Einladung (Migration 006)
  if to_regclass('public.household_invites') is not null then
    begin
      if to_regprocedure('public.normalize_email(text)') is not null then
        execute 'select exists (select 1 from public.household_invites where email = public.normalize_email($1))'
          into v_ok using v_raw;
      else
        execute 'select exists (select 1 from public.household_invites where email = $1)'
          into v_ok using v_email;
      end if;
      if v_ok then return '{}'::jsonb; end if;
    exception when others then
      raise warning 'hook_before_user_created: Prüfung household_invites fehlgeschlagen: %', sqlerrm;
    end;
  end if;

  -- (c) BrainCraft: noch gültige Eltern-Einladung (Migration 007)
  if to_regclass('braincraft.parent_invites') is not null then
    begin
      if to_regprocedure('braincraft.email_norm(text)') is not null then
        execute 'select exists (select 1 from braincraft.parent_invites where email = braincraft.email_norm($1) and expires_at > now())'
          into v_ok using v_raw;
      else
        execute 'select exists (select 1 from braincraft.parent_invites where email = $1 and expires_at > now())'
          into v_ok using v_email;
      end if;
      if v_ok then return '{}'::jsonb; end if;
    exception when others then
      raise warning 'hook_before_user_created: Prüfung parent_invites fehlgeschlagen: %', sqlerrm;
    end;
  end if;

  return v_deny;
end $$;

-- ---------------------------------------------------------------------
-- Rechte: nur der Auth-Dienst darf den Hook ausführen
-- ---------------------------------------------------------------------
revoke all on function private.hook_before_user_created(jsonb) from public, anon, authenticated;
revoke all on function private.email_norm(text) from public, anon, authenticated;
revoke all on function private.allowed_emails_norm() from public, anon, authenticated;
grant execute on function private.hook_before_user_created(jsonb) to supabase_auth_admin;
grant execute on function private.email_norm(text) to supabase_auth_admin;
