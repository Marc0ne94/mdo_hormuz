/** Voice/text → JSON op. Toy sandbox. No real weapons. */
export function parseVoice(text, src) {
  const raw = String(text || "").trim();
  const t = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const out = { src: src || "voice", text: raw };
  if (!raw) return { ...out, error: "unrecognized" };

  const num = (re, d) => {
    const m = t.match(re);
    return m ? Number(m[1]) : d;
  };
  const who = () => {
    const m = raw.match(/\b((?:SEA|LAND|IRN)[- ]?[A-Z]{2,4}\s*\d+)\b/i);
    return m ? m[1].toUpperCase().replace(/\s+/g, " ") : null;
  };
  const xz = () => {
    const m = t.match(/\b(\d{1,3})\s*[, ]\s*(\d{1,3})\b/);
    return m ? { x: Number(m[1]), z: Number(m[2]) } : {};
  };
  const zone = () => {
    if (/jetty|molo/.test(t)) return "jetty";
    if (/farm|serbatoi|terminal/.test(t)) return "farm";
    if (/runway|pista/.test(t)) return "runway";
    if (/costa|coast|terra/.test(t)) return "coast";
    if (/golfo|gulf|mare aperto/.test(t)) return "gulf";
    if (/isola|kharg|island/.test(t)) return "island";
    if (/davanti|ahead/.test(t)) return "ahead";
    return "";
  };
  const Z = () => { const z = zone(); return z ? { zone: z, ...xz() } : xz(); };

  if (/pace|calma|stop fire|cessate/.test(t)) return { ...out, op: "battle", n: 0 };
  if (/battaglia|weapons free|apri il fuoco/.test(t)) return { ...out, op: "battle", n: 1 };
  if (/status|stato|quanti|report/.test(t)) return { ...out, op: "status" };
  if (/radar|scansione|ping/.test(t)) return { ...out, op: "radar" };

  const w = who();
  if (/prendi|possiedi|impersona|entra|possess|enter|be the|diventa/.test(t)) {
    return { ...out, op: "possess", who: w || raw.replace(/^(prendi|possiedi|impersona|entra|possess|enter)\s+/i, "").trim() };
  }
  if (/lascia|esci|smetti|unpossess|release/.test(t)) return { ...out, op: "possess", who: "" };

  if (/paracad|paradrop|drop tank|carro dal cielo|airdrop|sgancia carro/.test(t)) {
    return { ...out, op: "paradrop", side: /land|terra|brics/.test(t) ? "land" : /sea|mare/.test(t) ? "sea" : "land", n: num(/(\d+)/, 1), ...Z() };
  }
  if (/tappeto|carpet/.test(t)) return { ...out, op: "carpet", side: /land/.test(t) ? "land" : "sea", ...Z() };
  if (/cruise|crociera|tomahawk giocattolo/.test(t)) return { ...out, op: "cruise", ...Z() };
  if (/fumo|smoke|cortina|flare/.test(t)) return { ...out, op: "smoke", ...Z() };
  if (/\buav\b|drone|occhio in cielo/.test(t)) return { ...out, op: "uav", side: /sea/.test(t) ? "sea" : "land", ...Z() };
  if (/bird in hot|elicottero hot|inserzione/.test(t)) return { ...out, op: "heli", side: /sea/.test(t) ? "sea" : "irn", ...Z() };
  if (/oleodotto|oilfire|tank farm in fiamme|farm in fiamme|civili|civilian/.test(t)) return { ...out, op: "oilfire", zone: zone() || "farm", ...xz() };
  if (/\birn\b|iranian|iraniani/.test(t) && /terreno|isola|spawn|chiama|arriva|dal/.test(t)) {
    return { ...out, op: "navy", side: "irn", n: num(/(\d+)/, 3), ...Z() };
  }
  if (/catapulta|lancia jet|launch/.test(t) && /carrier|portaerei|catapult/.test(t)) return { ...out, op: "launch", side: "sea" };
  if (/moab|madre di tutte/.test(t)) return { ...out, op: "moab", ...Z() };

  const weapon = /missile|razzo/.test(t) ? "missile"
    : /bomba|bomb/.test(t) ? "bomb"
    : /cannone|cannon|shell|colpo/.test(t) ? "cannon"
    : null;
  if (weapon && /spara|fire|attack|attacca|sparat|launch|lancia/.test(t)) {
    return { ...out, op: "fire", weapon, who: w, ...Z() };
  }
  if (/nave spara|ship attack|portaerei spara|cvn spara/.test(t)) {
    return { ...out, op: "fire", weapon: weapon || "missile", who: w, ...Z() };
  }

  if (/barrage|satura|stormo di colpi/.test(t)) return { ...out, op: "barrage", ...Z() };
  if (/artiglier|artillery|batteria/.test(t)) return { ...out, op: "artillery", ...Z() };
  if (/bombarda|airstrike|strike|colpisci/.test(t)) return { ...out, op: "bomb", r: 3.6, ...Z() };

  if (/marina|navy|flotta|carrier|portaerei|destroyer|cacciator/.test(t) && /chiama|send|manda|spawn|arriva/.test(t)) {
    return { ...out, op: "navy", side: /land|terra/.test(t) ? "land" : /irn|isola/.test(t) ? "irn" : "sea", n: num(/(\d+)/, 3) };
  }
  if (/jet|caccia|air|aerei|aviazione/.test(t) && /chiama|send|manda|spawn/.test(t)) {
    return { ...out, op: "air", side: /land|terra/.test(t) ? "land" : /irn/.test(t) ? "irn" : "sea" };
  }
  if (/lock|bersaglio|fixa|inquadra/.test(t)) return { ...out, op: "lock", who: w, ...Z() };

  if (weapon) return { ...out, op: "fire", weapon, who: w, ...Z() };
  return { ...out, error: "unrecognized" };
}
