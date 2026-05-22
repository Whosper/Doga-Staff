// =====================================================================
//  CONFIGURATION DU STOCKAGE
// ---------------------------------------------------------------------
//  - Laisse ces deux champs VIDES => l'app sauvegarde en local
//    (dans le navigateur de chacun, rien n'est partagé).
//
//  - Remplis-les avec tes clés Supabase => le staff partage les MÊMES
//    données, synchronisées en temps réel. (Voir README.md, section
//    "Stockage partagé".)
// =====================================================================

export const SUPABASE_URL = "https://cmwwdrjrcgzywptsaurp.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_pIY2rqfIbB5CniN8f1fP9Q_PRWa10-7";

// Identifiant du document d'état. À ne changer que si tu veux faire
// tourner plusieurs QG distincts sur le même projet Supabase.
export const STATE_ID = "doga-staff-hub";
