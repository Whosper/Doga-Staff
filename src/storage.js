import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, STATE_ID } from "./config";

const useSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const STORAGE_MODE = useSupabase ? "shared" : "local";

let supabase = null;
if (useSupabase) supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const LS_KEY = "doga-staff-hub-v1";

export async function loadState() {
  if (useSupabase) {
    const { data, error } = await supabase
      .from("app_state").select("data").eq("id", STATE_ID).maybeSingle();
    if (error) { console.error("[storage] load:", error.message); return null; }
    return data ? data.data : null;
  }
  try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
}

export async function saveState(state) {
  if (useSupabase) {
    const { error } = await supabase.from("app_state")
      .upsert({ id: STATE_ID, data: state, updated_at: new Date().toISOString() });
    if (error) console.error("[storage] save:", error.message);
    return;
  }
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); }
  catch (e) { console.error("[storage] save:", e); }
}

// Abonnement temps réel (Supabase uniquement). Renvoie une fonction
// de désabonnement. En mode local : no-op.
export function subscribe(onRemoteChange) {
  if (!useSupabase) return () => {};
  const channel = supabase
    .channel("app_state_" + STATE_ID)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "app_state", filter: `id=eq.${STATE_ID}` },
      (payload) => { if (payload.new && payload.new.data) onRemoteChange(payload.new.data); }
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
