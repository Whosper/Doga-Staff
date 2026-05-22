import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { loadState, saveState, subscribe, STORAGE_MODE } from "./storage";

/* ============================================================
   QG ÉQUIPAGE — Dashboard staff de Doga
   Concepts · Tâches · Planning
   ============================================================ */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+JP:wght@500;700&display=swap');

:root{
  --abyss:#06101b; --deep:#0b1929; --surface:#11253a; --surface2:#173049;
  --line:rgba(232,184,92,0.16); --line2:rgba(232,184,92,0.30);
  --gold:#e8b85c; --gold-soft:#f3d089; --cyan:#57c9e0; --ink:#eaf1f8;
  --muted:#8398b1; --red:#ec6a62; --amber:#efb45a; --green:#54d99a; --violet:#9b8cf0;
}
*{box-sizing:border-box;}
.dh-root{
  font-family:'Manrope',sans-serif; color:var(--ink); min-height:100vh;
  background:
    radial-gradient(1200px 600px at 80% -10%, rgba(87,201,224,0.10), transparent 60%),
    radial-gradient(900px 500px at 0% 110%, rgba(232,184,92,0.08), transparent 55%),
    linear-gradient(180deg, var(--abyss), var(--deep));
  position:relative; overflow-x:hidden;
}
.dh-root:before{
  content:""; position:fixed; inset:0; pointer-events:none; opacity:.4;
  background-image:radial-gradient(rgba(255,255,255,.04) 1px, transparent 1px);
  background-size:3px 3px;
}
.dh-wrap{max-width:1280px; margin:0 auto; padding:0 22px 80px; position:relative; z-index:1;}

.dh-top{display:flex; align-items:center; gap:18px; padding:26px 0 18px; flex-wrap:wrap;}
.dh-crest{
  width:54px;height:54px;border-radius:14px;flex:none;display:grid;place-items:center;
  background:linear-gradient(145deg,#1c3a57,#0c1c2e); font-size:28px;
  border:1px solid var(--line2); box-shadow:0 8px 30px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06);
}
.dh-title{font-family:'Cinzel',serif; font-weight:900; letter-spacing:.5px; font-size:26px; line-height:1; margin:0;}
.dh-title .accent{color:var(--gold);}
.dh-sub{font-family:'Noto Sans JP',sans-serif; color:var(--muted); font-size:12px; margin-top:5px; letter-spacing:.5px;}
.dh-spacer{flex:1;}
.dh-stat{display:flex; gap:10px; flex-wrap:wrap;}
.dh-pill{background:rgba(255,255,255,.03); border:1px solid var(--line); border-radius:12px; padding:8px 13px; display:flex; flex-direction:column; min-width:64px;}
.dh-pill b{font-size:18px; font-weight:800; line-height:1;}
.dh-pill span{font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:.8px; margin-top:3px;}

.mode-tag{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;border:1px solid var(--line);color:var(--muted);}
.mode-tag .dot{width:7px;height:7px;border-radius:50%;}

.dh-tabs{display:flex; gap:6px; margin:8px 0 22px; flex-wrap:wrap; border-bottom:1px solid var(--line);}
.dh-tab{appearance:none; border:none; cursor:pointer; background:transparent; color:var(--muted); font-family:'Manrope'; font-weight:700; font-size:14px; padding:11px 16px; border-radius:10px 10px 0 0; position:relative; display:flex; align-items:center; gap:8px; transition:.18s;}
.dh-tab:hover{color:var(--ink); background:rgba(255,255,255,.03);}
.dh-tab.on{color:var(--gold);}
.dh-tab.on:after{content:""; position:absolute; left:10px; right:10px; bottom:-1px; height:2px; background:linear-gradient(90deg,var(--gold),var(--gold-soft)); border-radius:2px;}
.dh-tab .cnt{font-size:11px; background:rgba(232,184,92,.14); color:var(--gold); border-radius:20px; padding:1px 7px; font-weight:800;}

.btn{appearance:none; cursor:pointer; font-family:'Manrope'; font-weight:700; font-size:13px; border-radius:10px; padding:9px 14px; border:1px solid var(--line2); background:rgba(255,255,255,.04); color:var(--ink); transition:.16s; display:inline-flex; align-items:center; gap:7px;}
.btn:hover{background:rgba(255,255,255,.08); transform:translateY(-1px);}
.btn.gold{background:linear-gradient(145deg,var(--gold),#d6a23f); color:#23170a; border-color:transparent; box-shadow:0 6px 18px rgba(232,184,92,.25);}
.btn.gold:hover{filter:brightness(1.06);}
.btn.gold:disabled{opacity:.5; cursor:not-allowed; transform:none;}
.btn.ghost{background:transparent; border-color:var(--line);}
.btn.sm{padding:6px 10px; font-size:12px; border-radius:8px;}
.btn.danger:hover{background:rgba(236,106,98,.16); border-color:var(--red); color:var(--red);}

.kb{display:grid; grid-template-columns:repeat(var(--cols,4),1fr); gap:14px; align-items:start;}
@media(max-width:900px){.kb{grid-template-columns:1fr 1fr;}}
@media(max-width:600px){.kb{grid-template-columns:1fr;}}
.col{background:rgba(255,255,255,.018); border:1px solid var(--line); border-radius:16px; padding:12px; min-height:120px; transition:.16s;}
.col.over{border-color:var(--gold); background:rgba(232,184,92,.06);}
.col-head{display:flex; align-items:center; gap:8px; margin-bottom:11px; padding:0 3px;}
.col-dot{width:9px;height:9px;border-radius:50%;}
.col-name{font-weight:800; font-size:13px; letter-spacing:.3px;}
.col-cnt{font-size:11px; color:var(--muted); margin-left:auto; font-weight:700;}

.card{background:linear-gradient(160deg,var(--surface),var(--deep)); border:1px solid var(--line); border-radius:13px; padding:13px; margin-bottom:10px; cursor:grab; transition:.16s; position:relative; box-shadow:0 4px 14px rgba(0,0,0,.3);}
.card:hover{border-color:var(--line2); transform:translateY(-2px); box-shadow:0 10px 26px rgba(0,0,0,.45);}
.card:active{cursor:grabbing;}
.card.dragging{opacity:.4;}
.card-top{display:flex; align-items:flex-start; gap:8px; margin-bottom:7px;}
.card-title{font-weight:700; font-size:14px; line-height:1.3; flex:1;}
.tag{font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.5px; padding:3px 8px; border-radius:20px; white-space:nowrap;}
.card-notes{font-size:12px; color:var(--muted); line-height:1.45; margin:6px 0;}
.card-foot{display:flex; align-items:center; gap:8px; margin-top:9px; flex-wrap:wrap;}
.who{font-size:11px; color:var(--muted); display:flex; align-items:center; gap:5px;}
.avs{display:flex;}
.av{width:22px;height:22px;border-radius:50%; display:grid; place-items:center; font-size:10px; font-weight:800; color:#0b1322; border:2px solid var(--deep); margin-left:-6px;}
.av:first-child{margin-left:0;}
.prio{font-size:10px; font-weight:800; padding:2px 7px; border-radius:6px; letter-spacing:.3px;}
.due{font-size:11px; font-weight:700; display:flex; align-items:center; gap:4px;}
.card-x{position:absolute; top:9px; right:9px; opacity:0; cursor:pointer; color:var(--muted); font-size:15px; line-height:1; transition:.15s; border:none; background:none;}
.card:hover .card-x{opacity:.7;} .card-x:hover{opacity:1; color:var(--red);}
.card-edit{position:absolute; top:9px; right:30px; opacity:0; cursor:pointer; color:var(--muted); font-size:13px; transition:.15s; border:none; background:none;}
.card:hover .card-edit{opacity:.7;} .card-edit:hover{opacity:1; color:var(--gold);}
.add-card{width:100%; text-align:left; color:var(--muted); font-weight:700; font-size:12px; padding:9px 11px; border-radius:10px; border:1px dashed var(--line2); background:transparent; cursor:pointer; transition:.15s;}
.add-card:hover{color:var(--gold); border-color:var(--gold); background:rgba(232,184,92,.05);}

.empty{text-align:center; padding:60px 20px; color:var(--muted);}
.empty .big{font-size:40px; margin-bottom:10px; opacity:.6;}
.empty h3{color:var(--ink); font-family:'Cinzel'; margin:0 0 6px;}

.ov{position:fixed; inset:0; background:rgba(4,9,16,.72); backdrop-filter:blur(4px); display:grid; place-items:center; z-index:50; padding:20px;}
.modal{background:linear-gradient(165deg,var(--surface),var(--deep)); border:1px solid var(--line2); border-radius:20px; width:100%; max-width:480px; padding:24px; box-shadow:0 30px 80px rgba(0,0,0,.6); max-height:90vh; overflow:auto;}
.modal h2{font-family:'Cinzel'; font-size:19px; margin:0 0 18px; display:flex; align-items:center; gap:9px;}
.field{margin-bottom:14px;}
.field label{display:block; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.6px; color:var(--muted); margin-bottom:6px;}
.field input, .field textarea, .field select{width:100%; background:rgba(0,0,0,.28); border:1px solid var(--line); border-radius:10px; padding:10px 12px; color:var(--ink); font-family:'Manrope'; font-size:14px; outline:none; transition:.15s;}
.field input:focus, .field textarea:focus, .field select:focus{border-color:var(--gold);}
.field textarea{resize:vertical; min-height:64px;}
.row2{display:grid; grid-template-columns:1fr 1fr; gap:12px;}
.chips{display:flex; flex-wrap:wrap; gap:7px;}
.chip{cursor:pointer; font-size:12px; font-weight:700; padding:6px 11px; border-radius:20px; border:1px solid var(--line); background:rgba(255,255,255,.03); color:var(--muted); transition:.14s; display:flex; align-items:center; gap:6px;}
.chip.on{color:#0b1322; border-color:transparent;}
.modal-foot{display:flex; gap:10px; margin-top:8px;}
.modal-foot .btn{flex:1; justify-content:center;}

.cal-head{display:flex; align-items:center; gap:14px; margin-bottom:16px; flex-wrap:wrap;}
.cal-month{font-family:'Cinzel'; font-size:20px; font-weight:700; min-width:170px;}
.cal-grid{display:grid; grid-template-columns:repeat(7,1fr); gap:8px;}
.cal-dow{font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.6px; color:var(--muted); text-align:center; padding:4px 0;}
.cal-cell{background:rgba(255,255,255,.018); border:1px solid var(--line); border-radius:11px; min-height:104px; padding:8px; cursor:pointer; transition:.14s; display:flex; flex-direction:column; gap:5px;}
.cal-cell:hover{border-color:var(--line2); background:rgba(255,255,255,.04);}
.cal-cell.muted{opacity:.32;}
.cal-cell.today{border-color:var(--cyan); box-shadow:inset 0 0 0 1px rgba(87,201,224,.3);}
.cal-num{font-size:12px; font-weight:800; color:var(--muted);}
.cal-cell.today .cal-num{color:var(--cyan);}
.cal-ev{font-size:10.5px; font-weight:700; padding:3px 6px; border-radius:6px; line-height:1.25; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
@media(max-width:600px){.cal-cell{min-height:64px;} .cal-ev{display:none;} .cal-cell.has:after{content:""; width:6px;height:6px;border-radius:50%;background:var(--gold);}}

.team-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:12px;}
.member{background:linear-gradient(160deg,var(--surface),var(--deep)); border:1px solid var(--line); border-radius:14px; padding:15px; display:flex; align-items:center; gap:12px; position:relative;}
.member .av{width:42px;height:42px;font-size:15px; margin:0; border:none;}
.member .mn{font-weight:800; font-size:14px;}
.member .mr{font-size:11px; color:var(--muted);}
.member .rm{position:absolute; top:10px; right:10px; opacity:0; cursor:pointer; border:none; background:none; color:var(--muted); font-size:14px;}
.member:hover .rm{opacity:.7;} .member .rm:hover{color:var(--red); opacity:1;}

.toolbar{display:flex; align-items:center; gap:10px; margin-bottom:16px; flex-wrap:wrap;}
.toolbar h2{font-family:'Cinzel'; font-size:18px; margin:0;}
.note{font-size:12px; color:var(--muted); margin-left:auto;}
`;

const CONCEPT_STATUS = [
  { id: "idee", name: "Idée brute", color: "#8398b1" },
  { id: "valide", name: "Validé", color: "#57c9e0" },
  { id: "prod", name: "En prod", color: "#efb45a" },
  { id: "publie", name: "Publié", color: "#54d99a" },
];
const TASK_STATUS = [
  { id: "todo", name: "À faire", color: "#8398b1" },
  { id: "doing", name: "En cours", color: "#efb45a" },
  { id: "done", name: "Terminé", color: "#54d99a" },
];
const CONCEPT_TYPES = ["Réact anime", "Réact film/série", "Vidéo YouTube", "Clip TikTok", "Format/émission", "Autre"];
const TYPE_COLOR = { "Réact anime": "#ec6a62", "Réact film/série": "#9b8cf0", "Vidéo YouTube": "#57c9e0", "Clip TikTok": "#54d99a", "Format/émission": "#efb45a", "Autre": "#8398b1" };
const PRIOS = [
  { id: "basse", name: "Basse", color: "#8398b1" },
  { id: "normale", name: "Normale", color: "#57c9e0" },
  { id: "haute", name: "Haute", color: "#efb45a" },
  { id: "urgente", name: "Urgente", color: "#ec6a62" },
];
const AV_COLORS = ["#e8b85c", "#57c9e0", "#54d99a", "#ec6a62", "#9b8cf0", "#efb45a", "#f3d089", "#7fd1c4"];

const uid = () => Math.random().toString(36).slice(2, 9);
const prioOf = (id) => PRIOS.find((p) => p.id === id) || PRIOS[1];
const initials = (n) => n.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const SEED = {
  members: [
    { id: "m1", name: "Doga", role: "Capitaine", color: "#e8b85c" },
    { id: "m2", name: "Frigui", role: "Gestion Patreon", color: "#57c9e0" },
    { id: "m3", name: "Urbain", role: "Gestion / support", color: "#54d99a" },
  ],
  concepts: [
    { id: uid(), title: "Découverte saison 5 Stranger Things", type: "Réact film/série", status: "valide", proposedBy: "m1", prio: "haute", notes: "Enchaîner après l'arc en cours. Prévoir planning soirées.", createdAt: Date.now() },
    { id: uid(), title: "Compil best-of réacts MCU pour TikTok", type: "Clip TikTok", status: "prod", proposedBy: "m3", prio: "normale", notes: "Cibler @dogafilms, format vertical 30-45s.", createdAt: Date.now() },
    { id: uid(), title: "Idée : tier list des arcs One Piece", type: "Format/émission", status: "idee", proposedBy: "m2", prio: "normale", notes: "", createdAt: Date.now() },
  ],
  tasks: [
    { id: uid(), title: "Monter la compil MCU (3 clips)", assignees: ["m3"], status: "doing", prio: "normale", due: "", notes: "Source : VOD Patreon", createdAt: Date.now() },
    { id: uid(), title: "Préparer le planning des soirées Stranger Things", assignees: ["m1", "m2"], status: "todo", prio: "haute", due: "", notes: "", createdAt: Date.now() },
  ],
  events: [],
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("concepts");
  const [members, setMembers] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [modal, setModal] = useState(null);
  const [drag, setDrag] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const skipSave = useRef(false);

  useEffect(() => {
    (async () => {
      const s = await loadState();
      if (s) {
        setMembers(s.members || []); setConcepts(s.concepts || []);
        setTasks(s.tasks || []); setEvents(s.events || []);
      } else {
        setMembers(SEED.members); setConcepts(SEED.concepts);
        setTasks(SEED.tasks); setEvents(SEED.events);
      }
      setReady(true);
    })();
  }, []);

  // Sauvegarde (débounce) — ignorée juste après une mise à jour distante.
  useEffect(() => {
    if (!ready) return;
    if (skipSave.current) { skipSave.current = false; return; }
    const t = setTimeout(() => saveState({ members, concepts, tasks, events }), 400);
    return () => clearTimeout(t);
  }, [members, concepts, tasks, events, ready]);

  // Synchro temps réel (mode partagé).
  useEffect(() => {
    if (!ready) return;
    const unsub = subscribe((data) => {
      skipSave.current = true;
      setMembers(data.members || []); setConcepts(data.concepts || []);
      setTasks(data.tasks || []); setEvents(data.events || []);
    });
    return unsub;
  }, [ready]);

  const memberById = useCallback((id) => members.find((m) => m.id === id), [members]);

  const onDrop = (statusId, kind) => {
    if (!drag || drag.kind !== kind) { setDrag(null); setOverCol(null); return; }
    if (kind === "concept") setConcepts((c) => c.map((x) => x.id === drag.id ? { ...x, status: statusId } : x));
    else setTasks((t) => t.map((x) => x.id === drag.id ? { ...x, status: statusId } : x));
    setDrag(null); setOverCol(null);
  };

  const saveConcept = (d) => setConcepts((c) => d.id ? c.map((x) => x.id === d.id ? d : x) : [...c, { ...d, id: uid(), createdAt: Date.now() }]);
  const saveTask = (d) => setTasks((t) => d.id ? t.map((x) => x.id === d.id ? d : x) : [...t, { ...d, id: uid(), createdAt: Date.now() }]);
  const saveEvent = (d) => setEvents((e) => d.id ? e.map((x) => x.id === d.id ? d : x) : [...e, { ...d, id: uid() }]);
  const conceptToTask = (concept) => setModal({ type: "task", status: "todo", data: { title: concept.title, conceptId: concept.id, prio: concept.prio, notes: concept.notes, assignees: [] } });

  if (!ready) return (
    <div className="dh-root"><style>{STYLES}</style>
      <div className="dh-wrap"><div className="empty" style={{ paddingTop: 140 }}><div className="big">🧭</div><h3>Chargement du QG…</h3></div></div>
    </div>
  );

  const activeTasks = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className="dh-root">
      <style>{STYLES}</style>
      <div className="dh-wrap">
        <div className="dh-top">
          <div className="dh-crest">🏴‍☠️</div>
          <div>
            <h1 className="dh-title">QG de l'<span className="accent">Équipage</span></h1>
            <div className="dh-sub">運営本部 · centre de pilotage du staff</div>
          </div>
          <div className="dh-spacer" />
          <div className="dh-stat">
            <div className="dh-pill"><b style={{ color: "var(--gold)" }}>{concepts.length}</b><span>concepts</span></div>
            <div className="dh-pill"><b style={{ color: "var(--amber)" }}>{activeTasks}</b><span>tâches actives</span></div>
            <div className="dh-pill"><b style={{ color: "var(--cyan)" }}>{members.length}</b><span>équipage</span></div>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <span className="mode-tag">
            <span className="dot" style={{ background: STORAGE_MODE === "shared" ? "var(--green)" : "var(--amber)" }} />
            {STORAGE_MODE === "shared" ? "Stockage partagé · synchro temps réel" : "Stockage local (non partagé) — voir README pour activer le partage"}
          </span>
        </div>

        <div className="dh-tabs">
          <button className={`dh-tab ${tab === "concepts" ? "on" : ""}`} onClick={() => setTab("concepts")}>💡 Concepts <span className="cnt">{concepts.length}</span></button>
          <button className={`dh-tab ${tab === "tasks" ? "on" : ""}`} onClick={() => setTab("tasks")}>⚓ Tâches <span className="cnt">{activeTasks}</span></button>
          <button className={`dh-tab ${tab === "plan" ? "on" : ""}`} onClick={() => setTab("plan")}>🗓 Planning</button>
          <button className={`dh-tab ${tab === "team" ? "on" : ""}`} onClick={() => setTab("team")}>🧑‍✈️ Équipage <span className="cnt">{members.length}</span></button>
        </div>

        {tab === "concepts" && (
          <Board kind="concept" columns={CONCEPT_STATUS} items={concepts} overCol={overCol} setOverCol={setOverCol} onDrop={onDrop}
            onAdd={(st) => setModal({ type: "concept", status: st, data: { type: "Réact anime", prio: "normale", proposedBy: members[0]?.id || "", notes: "" } })}
            renderCard={(c) => (
              <ConceptCard key={c.id} c={c} member={memberById(c.proposedBy)}
                onDragStart={() => setDrag({ id: c.id, kind: "concept" })} onDragEnd={() => setDrag(null)} dragging={drag?.id === c.id}
                onEdit={() => setModal({ type: "concept", status: c.status, data: c })}
                onDelete={() => setConcepts((x) => x.filter((y) => y.id !== c.id))} onToTask={() => conceptToTask(c)} />
            )} />
        )}

        {tab === "tasks" && (
          <Board kind="task" columns={TASK_STATUS} items={tasks} overCol={overCol} setOverCol={setOverCol} onDrop={onDrop}
            onAdd={(st) => setModal({ type: "task", status: st, data: { prio: "normale", assignees: [], due: "", notes: "" } })}
            renderCard={(t) => (
              <TaskCard key={t.id} t={t} members={members}
                onDragStart={() => setDrag({ id: t.id, kind: "task" })} onDragEnd={() => setDrag(null)} dragging={drag?.id === t.id}
                onEdit={() => setModal({ type: "task", status: t.status, data: t })}
                onDelete={() => setTasks((x) => x.filter((y) => y.id !== t.id))} />
            )} />
        )}

        {tab === "plan" && (
          <Calendar events={events}
            onAddDay={(date) => setModal({ type: "event", data: { date, type: "Live", title: "", time: "21:00", notes: "" } })}
            onEdit={(ev) => setModal({ type: "event", data: ev })} />
        )}

        {tab === "team" && (
          <Team members={members}
            onAdd={() => setModal({ type: "member", data: { name: "", role: "" } })}
            onRemove={(id) => setMembers((m) => m.filter((x) => x.id !== id))} />
        )}
      </div>

      {modal?.type === "concept" && <ConceptModal initial={modal.data} status={modal.status} members={members} onClose={() => setModal(null)} onSave={(d) => { saveConcept(d); setModal(null); }} />}
      {modal?.type === "task" && <TaskModal initial={modal.data} status={modal.status} members={members} onClose={() => setModal(null)} onSave={(d) => { saveTask(d); setModal(null); }} />}
      {modal?.type === "event" && <EventModal initial={modal.data} onClose={() => setModal(null)} onDelete={modal.data.id ? () => { setEvents((e) => e.filter((x) => x.id !== modal.data.id)); setModal(null); } : null} onSave={(d) => { saveEvent(d); setModal(null); }} />}
      {modal?.type === "member" && <MemberModal onClose={() => setModal(null)} onSave={(d) => { setMembers((m) => [...m, { ...d, id: uid(), color: AV_COLORS[m.length % AV_COLORS.length] }]); setModal(null); }} />}
    </div>
  );
}

function Board({ kind, columns, items, renderCard, onAdd, onDrop, setOverCol, overCol }) {
  return (
    <div className="kb" style={{ "--cols": columns.length }}>
      {columns.map((col) => {
        const list = items.filter((i) => i.status === col.id);
        return (
          <div key={col.id} className={`col ${overCol === col.id ? "over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setOverCol(col.id); }}
            onDragLeave={() => setOverCol((o) => o === col.id ? null : o)}
            onDrop={() => onDrop(col.id, kind)}>
            <div className="col-head">
              <span className="col-dot" style={{ background: col.color }} />
              <span className="col-name">{col.name}</span>
              <span className="col-cnt">{list.length}</span>
            </div>
            {list.map(renderCard)}
            <button className="add-card" onClick={() => onAdd(col.id)}>+ Ajouter</button>
          </div>
        );
      })}
    </div>
  );
}

function ConceptCard({ c, member, onDragStart, onDragEnd, dragging, onEdit, onDelete, onToTask }) {
  return (
    <div className={`card ${dragging ? "dragging" : ""}`} draggable onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <button className="card-edit" onClick={onEdit} title="Éditer">✎</button>
      <button className="card-x" onClick={onDelete} title="Supprimer">×</button>
      <div className="card-top"><span className="card-title">{c.title}</span></div>
      <span className="tag" style={{ background: (TYPE_COLOR[c.type] || "#8398b1") + "22", color: TYPE_COLOR[c.type] || "#8398b1" }}>{c.type}</span>
      {c.notes && <div className="card-notes">{c.notes}</div>}
      <div className="card-foot">
        {member && <span className="who"><span className="av" style={{ background: member.color, width: 20, height: 20, marginLeft: 0, border: "none" }}>{initials(member.name)}</span>{member.name}</span>}
        <span className="prio" style={{ background: prioOf(c.prio).color + "22", color: prioOf(c.prio).color, marginLeft: "auto" }}>{prioOf(c.prio).name}</span>
      </div>
      {c.status !== "publie" && <button className="btn ghost sm" style={{ marginTop: 10, width: "100%", justifyContent: "center" }} onClick={onToTask}>⚓ Transformer en tâche</button>}
    </div>
  );
}

function TaskCard({ t, members, onDragStart, onDragEnd, dragging, onEdit, onDelete }) {
  const assigned = (t.assignees || []).map((id) => members.find((m) => m.id === id)).filter(Boolean);
  const overdue = t.due && t.status !== "done" && new Date(t.due) < new Date(new Date().toDateString());
  return (
    <div className={`card ${dragging ? "dragging" : ""}`} draggable onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <button className="card-edit" onClick={onEdit} title="Éditer">✎</button>
      <button className="card-x" onClick={onDelete} title="Supprimer">×</button>
      <div className="card-top"><span className="card-title">{t.title}</span></div>
      {t.notes && <div className="card-notes">{t.notes}</div>}
      <div className="card-foot">
        <div className="avs">
          {assigned.length ? assigned.map((m) => <span key={m.id} className="av" style={{ background: m.color }} title={m.name}>{initials(m.name)}</span>)
            : <span className="who" style={{ fontStyle: "italic" }}>Non assigné</span>}
        </div>
        <span className="prio" style={{ background: prioOf(t.prio).color + "22", color: prioOf(t.prio).color, marginLeft: "auto" }}>{prioOf(t.prio).name}</span>
      </div>
      {t.due && <div className="card-foot" style={{ marginTop: 7 }}><span className="due" style={{ color: overdue ? "var(--red)" : "var(--muted)" }}>📅 {fmtDate(t.due)}{overdue ? " · en retard" : ""}</span></div>}
    </div>
  );
}

const DOW = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const EVENT_COLOR = { Live: "#e8b85c", "Sortie clip": "#54d99a", "Vidéo YT": "#57c9e0", Deadline: "#ec6a62", Réunion: "#9b8cf0", Autre: "#8398b1" };
const pad = (n) => String(n).padStart(2, "0");
const dateKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
function fmtDate(s) { const [, m, d] = s.split("-"); return `${d}/${m}`; }

function Calendar({ events, onAddDay, onEdit }) {
  const [cur, setCur] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const today = new Date(); const tk = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const first = new Date(cur.y, cur.m, 1);
  const startDow = (first.getDay() + 6) % 7;
  const daysIn = new Date(cur.y, cur.m + 1, 0).getDate();
  const prevDays = new Date(cur.y, cur.m, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push({ d: prevDays - startDow + 1 + i, muted: true });
  for (let d = 1; d <= daysIn; d++) cells.push({ d, muted: false });
  while (cells.length % 7 !== 0) cells.push({ d: cells.length - daysIn - startDow + 1, muted: true });
  const byDay = useMemo(() => { const m = {}; events.forEach((e) => { (m[e.date] = m[e.date] || []).push(e); }); return m; }, [events]);
  const shift = (delta) => setCur((c) => { let m = c.m + delta, y = c.y; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } return { y, m }; });

  return (
    <div>
      <div className="cal-head">
        <button className="btn ghost sm" onClick={() => shift(-1)}>‹</button>
        <div className="cal-month">{MONTHS[cur.m]} {cur.y}</div>
        <button className="btn ghost sm" onClick={() => shift(1)}>›</button>
        <button className="btn ghost sm" onClick={() => { const n = new Date(); setCur({ y: n.getFullYear(), m: n.getMonth() }); }}>Aujourd'hui</button>
        <span className="note">Clique un jour pour ajouter un événement</span>
      </div>
      <div className="cal-grid">
        {DOW.map((d) => <div key={d} className="cal-dow">{d}</div>)}
        {cells.map((c, i) => {
          const k = c.muted ? null : dateKey(cur.y, cur.m, c.d);
          const evs = k ? (byDay[k] || []) : [];
          return (
            <div key={i} className={`cal-cell ${c.muted ? "muted" : ""} ${k === tk ? "today" : ""} ${evs.length ? "has" : ""}`} onClick={() => !c.muted && onAddDay(k)}>
              <span className="cal-num">{c.d}</span>
              {evs.slice(0, 3).map((e) => (
                <div key={e.id} className="cal-ev" style={{ background: (EVENT_COLOR[e.type] || "#8398b1") + "26", color: EVENT_COLOR[e.type] || "#8398b1" }}
                  onClick={(ev) => { ev.stopPropagation(); onEdit(e); }}>{e.time ? e.time + " " : ""}{e.title}</div>
              ))}
              {evs.length > 3 && <div className="cal-ev" style={{ color: "var(--muted)" }}>+{evs.length - 3}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Team({ members, onAdd, onRemove }) {
  return (
    <div>
      <div className="toolbar"><h2>L'équipage</h2><button className="btn gold sm" onClick={onAdd}>+ Ajouter un membre</button></div>
      {members.length === 0 ? (
        <div className="empty"><div className="big">🧑‍✈️</div><h3>Aucun membre</h3><p>Ajoute ton staff pour pouvoir assigner les tâches.</p></div>
      ) : (
        <div className="team-grid">
          {members.map((m) => (
            <div key={m.id} className="member">
              <span className="av" style={{ background: m.color }}>{initials(m.name)}</span>
              <div><div className="mn">{m.name}</div><div className="mr">{m.role || "—"}</div></div>
              <button className="rm" onClick={() => onRemove(m.id)} title="Retirer">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConceptModal({ initial, status, members, onClose, onSave }) {
  const [d, setD] = useState({ ...initial, status: initial.status || status });
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
  return (
    <Overlay onClose={onClose}>
      <h2>💡 {initial.id ? "Éditer le concept" : "Nouveau concept"}</h2>
      <div className="field"><label>Titre</label><input autoFocus value={d.title || ""} onChange={(e) => set("title", e.target.value)} placeholder="Ex : Découverte Demon Slayer S4" /></div>
      <div className="row2">
        <div className="field"><label>Type</label><select value={d.type} onChange={(e) => set("type", e.target.value)}>{CONCEPT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div className="field"><label>Priorité</label><select value={d.prio} onChange={(e) => set("prio", e.target.value)}>{PRIOS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
      </div>
      <div className="field"><label>Proposé par</label><select value={d.proposedBy || ""} onChange={(e) => set("proposedBy", e.target.value)}><option value="">—</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
      <div className="field"><label>Notes</label><textarea value={d.notes || ""} onChange={(e) => set("notes", e.target.value)} placeholder="Détails, références, contraintes…" /></div>
      <div className="modal-foot"><button className="btn ghost" onClick={onClose}>Annuler</button><button className="btn gold" disabled={!d.title} onClick={() => d.title && onSave(d)}>Enregistrer</button></div>
    </Overlay>
  );
}

function TaskModal({ initial, status, members, onClose, onSave }) {
  const [d, setD] = useState({ ...initial, status: initial.status || status, assignees: initial.assignees || [] });
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
  const toggle = (id) => setD((x) => ({ ...x, assignees: x.assignees.includes(id) ? x.assignees.filter((a) => a !== id) : [...x.assignees, id] }));
  return (
    <Overlay onClose={onClose}>
      <h2>⚓ {initial.id ? "Éditer la tâche" : "Nouvelle tâche"}</h2>
      <div className="field"><label>Intitulé</label><input autoFocus value={d.title || ""} onChange={(e) => set("title", e.target.value)} placeholder="Ex : Monter le clip du best-of" /></div>
      <div className="field"><label>Assigné à</label>
        <div className="chips">
          {members.length === 0 && <span className="note">Ajoute des membres dans l'onglet Équipage</span>}
          {members.map((m) => (
            <span key={m.id} className={`chip ${d.assignees.includes(m.id) ? "on" : ""}`} style={d.assignees.includes(m.id) ? { background: m.color } : {}} onClick={() => toggle(m.id)}>
              <span className="av" style={{ background: m.color, width: 16, height: 16, fontSize: 8, margin: 0, border: "none" }}>{initials(m.name)}</span>{m.name}
            </span>
          ))}
        </div>
      </div>
      <div className="row2">
        <div className="field"><label>Priorité</label><select value={d.prio} onChange={(e) => set("prio", e.target.value)}>{PRIOS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div className="field"><label>Échéance</label><input type="date" value={d.due || ""} onChange={(e) => set("due", e.target.value)} /></div>
      </div>
      <div className="field"><label>Notes</label><textarea value={d.notes || ""} onChange={(e) => set("notes", e.target.value)} placeholder="Précisions…" /></div>
      <div className="modal-foot"><button className="btn ghost" onClick={onClose}>Annuler</button><button className="btn gold" disabled={!d.title} onClick={() => d.title && onSave(d)}>Enregistrer</button></div>
    </Overlay>
  );
}

function EventModal({ initial, onClose, onSave, onDelete }) {
  const [d, setD] = useState({ ...initial });
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
  return (
    <Overlay onClose={onClose}>
      <h2>🗓 {initial.id ? "Éditer l'événement" : "Nouvel événement"}</h2>
      <div className="field"><label>Titre</label><input autoFocus value={d.title || ""} onChange={(e) => set("title", e.target.value)} placeholder="Ex : Live découverte épisode 12" /></div>
      <div className="row2">
        <div className="field"><label>Type</label><select value={d.type} onChange={(e) => set("type", e.target.value)}>{Object.keys(EVENT_COLOR).map((t) => <option key={t}>{t}</option>)}</select></div>
        <div className="field"><label>Heure</label><input type="time" value={d.time || ""} onChange={(e) => set("time", e.target.value)} /></div>
      </div>
      <div className="field"><label>Date</label><input type="date" value={d.date || ""} onChange={(e) => set("date", e.target.value)} /></div>
      <div className="field"><label>Notes</label><textarea value={d.notes || ""} onChange={(e) => set("notes", e.target.value)} /></div>
      <div className="modal-foot">
        {onDelete && <button className="btn danger ghost" onClick={onDelete}>Supprimer</button>}
        <button className="btn ghost" onClick={onClose}>Annuler</button>
        <button className="btn gold" disabled={!d.title} onClick={() => d.title && onSave(d)}>Enregistrer</button>
      </div>
    </Overlay>
  );
}

function MemberModal({ onClose, onSave }) {
  const [d, setD] = useState({ name: "", role: "" });
  return (
    <Overlay onClose={onClose}>
      <h2>🧑‍✈️ Nouveau membre</h2>
      <div className="field"><label>Nom / pseudo</label><input autoFocus value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="Ex : Whosper" /></div>
      <div className="field"><label>Rôle</label><input value={d.role} onChange={(e) => setD({ ...d, role: e.target.value })} placeholder="Ex : Clippeur / Monteur" /></div>
      <div className="modal-foot"><button className="btn ghost" onClick={onClose}>Annuler</button><button className="btn gold" disabled={!d.name.trim()} onClick={() => d.name.trim() && onSave(d)}>Ajouter</button></div>
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return <div className="ov" onClick={(e) => e.target === e.currentTarget && onClose()}><div className="modal">{children}</div></div>;
}
