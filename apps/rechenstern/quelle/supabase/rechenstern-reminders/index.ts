// Rechenstern – Lern-Erinnerungen per Web-Push
//
// Zwei Aufrufarten:
//   * pg_cron (alle 10 Minuten) mit Header "x-cron-secret": verschickt fällige Erinnerungen
//     (Logik in public.rechenstern_claim_due: richtige Uhrzeit, Wochentag, heute noch nicht gelernt).
//   * App mit { code, test: true }: schickt eine Test-Nachricht an die Geräte dieser Familie.
// Geheimnisse (VAPID-Schlüssel, Cron-Secret) liegen im Supabase Vault, nicht im Code.

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const VAPID_PUBLIC = "BEQokCiaHISguPppaV3UW1Dqnfk7zrftzhHdQq7r8IYVi3wkOdNME_jdesheFgHJE36TghofzZQrDbWYz5ifc5g";
const APP_URL = "https://marcokland-web.github.io/DasTeam/apps/rechenstern/";

const cors = {
  "Access-Control-Allow-Origin": "https://marcokland-web.github.io",
  "Access-Control-Allow-Headers": "apikey, content-type, x-client-info, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

let ready = false;
async function secret(name: string) {
  const { data, error } = await db.rpc("rechenstern_secret", { p_name: name });
  if (error || !data) throw new Error(`Geheimnis ${name} fehlt`);
  return data as string;
}
async function init() {
  if (ready) return;
  webpush.setVapidDetails(APP_URL, VAPID_PUBLIC, await secret("rechenstern_vapid_private"));
  ready = true;
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

interface Abo { endpoint: string; p256dh: string; auth: string; lang: string; name: string; streak?: number }

const TEXT = {
  de: [
    (n: string) => `Hallo ${n}! Stella hat einen neuen Trick für dich. Lust auf 5 Minuten Einmaleins?`,
    (n: string) => `${n}, deine Sterne warten! Eine kleine Runde Rechenstern?`,
    (n: string) => `Stella winkt dir zu, ${n}! Heute schon den Frosch hüpfen lassen?`,
  ],
  en: [
    (n: string) => `Hi ${n}! Stella has a new trick for you. Fancy 5 minutes of times tables?`,
    (n: string) => `${n}, your stars are waiting! A quick round of Rechenstern?`,
    (n: string) => `Stella is waving at you, ${n}! Has the frog hopped today?`,
  ],
};
function message(a: Abo, test = false) {
  const en = a.lang === "en", n = a.name || (en ? "there" : "du");
  if (test) return { title: "Rechenstern", body: en ? "Reminders work on this device." : "Erinnerungen funktionieren auf diesem Gerät.", tag: "rechenstern-test" };
  const list = en ? TEXT.en : TEXT.de;
  let body = list[new Date().getDate() % list.length](n);
  if ((a.streak ?? 0) >= 2) body += en ? ` Your streak: ${a.streak} days.` : ` Deine Serie: ${a.streak} Tage.`;
  return { title: "Rechenstern", body, tag: "rechenstern-reminder" };
}
async function send(abos: Abo[], test = false) {
  let sent = 0; const errors: string[] = [];
  await Promise.all(abos.map(async (a) => {
    try {
      await webpush.sendNotification({ endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } },
        JSON.stringify({ ...message(a, test), url: APP_URL }), { TTL: 3 * 60 * 60, urgency: "normal" });
      sent++;
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) await db.rpc("rechenstern_push_drop", { p_endpoint: a.endpoint });
      else errors.push(`${status ?? ""} ${(e as Error).message}`.trim());
    }
  }));
  return { sent, errors };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  try {
    await init();
    const cron = req.headers.get("x-cron-secret");
    if (cron) {
      if (!safeEqual(cron, await secret("rechenstern_cron_secret"))) return json({ error: "forbidden" }, 403);
      const { data, error } = await db.rpc("rechenstern_claim_due");
      if (error) throw new Error(error.message);
      return json({ due: data?.length ?? 0, ...(await send((data ?? []) as Abo[])) });
    }
    const body = await req.json().catch(() => ({}));
    if (!body?.code || !body?.test) return json({ error: "bad_request" }, 400);
    const { data, error } = await db.rpc("rechenstern_abos", { p_code: String(body.code) });
    if (error) return json({ error: "not_found" }, 404);
    if (!data?.length) return json({ sent: 0, errors: ["Kein Gerät für Erinnerungen eingeschaltet."] });
    return json(await send(data as Abo[], true));
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});
