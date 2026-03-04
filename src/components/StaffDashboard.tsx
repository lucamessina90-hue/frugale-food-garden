"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────
interface EventBooking { id:number; event_type:string; guest_count:number; client_name:string; client_email:string; client_phone:string; notes:string; start_time:number; end_time:number; status:string; staff_notes:string; cancel_token:string; }
interface GardenBooking { id:number; space_type:string; surface_area:string; address:string; client_name:string; client_email:string; client_phone:string; notes:string; start_time:number; end_time:number; status:string; staff_notes:string; cancel_token:string; }
interface Stats { events:{pending:number;confirmed:number;cancelled:number;total:number}; garden:{pending:number;confirmed:number;cancelled:number;completed:number;total:number}; }
interface ScheduleDay { day_of_week:number; is_open:boolean; slots:{from:string;to:string}[]; }

const STATUS_LABELS: Record<string,string> = { pending:"In Attesa", confirmed:"Confermato", cancelled:"Annullato", completed:"Effettuato" };
const EVENT_TYPE_LABELS: Record<string,string> = { compleanno:"Compleanno", festa_privata:"Festa Privata", aziendale:"Aziendale", altro:"Altro" };
const SPACE_TYPE_LABELS: Record<string,string> = { giardino_privato:"Giardino Privato", terrazzo:"Terrazzo", balcone:"Balcone", spazio_commerciale:"Spazio Commerciale" };
const DAYS_OF_WEEK = [{id:1,label:"Lunedì"},{id:2,label:"Martedì"},{id:3,label:"Mercoledì"},{id:4,label:"Giovedì"},{id:5,label:"Venerdì"},{id:6,label:"Sabato"},{id:0,label:"Domenica"}];
const N8N_URL = "https://frugalefoodgarden.app.n8n.cloud/webhook-test/3971d34d-51ba-4364-a9d9-78ad3b35d88d";

function StatusBadge({ status }: { status: string }) {
  return <span className={`status-badge status-${status}`}>{STATUS_LABELS[status] ?? status}</span>;
}

// ── BOOKING MODAL ────────────────────────────────────────────────────────────
function BookingModal({ booking, type, onClose, onSave }: { booking:any; type:string; onClose:()=>void; onSave:(id:number,type:string,status:string,notes:string)=>void; }) {
  const [status, setStatus] = useState(booking.status);
  const [staffNotes, setStaffNotes] = useState(booking.staff_notes ?? "");
  const startDate = new Date(Number(booking.start_time));

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)" }} />
      <div className="fade-in card" style={{ position:"relative", width:"100%", maxWidth:540, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.25rem" }}>
          <div>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"1.4rem", fontWeight:700 }}>{booking.client_name}</h2>
            <p style={{ color:"var(--muted-fg)", fontSize:"0.82rem" }}>{type==="event" ? EVENT_TYPE_LABELS[booking.event_type] : SPACE_TYPE_LABELS[booking.space_type]}</p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:"1.3rem", color:"var(--muted-fg)" }}>✕</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"1.25rem" }}>
          {[
            ["Email", booking.client_email],
            ["Telefono", booking.client_phone],
            ["Data", startDate.toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long",year:"numeric"})],
            ["Orario", `${startDate.toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})} — ${new Date(Number(booking.end_time)).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})}`],
            ...(type==="event" ? [["Ospiti",`${booking.guest_count} persone`]] : [["Indirizzo",booking.address],["Superficie",booking.surface_area||"—"]]),
          ].map(([k,v]) => (
            <div key={k} style={{ background:"var(--muted)", borderRadius:"8px", padding:"10px 12px" }}>
              <p style={{ fontSize:"0.68rem", fontWeight:700, color:"var(--muted-fg)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:"2px" }}>{k}</p>
              <p style={{ fontSize:"0.875rem", fontWeight:500, wordBreak:"break-word" }}>{v}</p>
            </div>
          ))}
        </div>
        {booking.notes && <div style={{ background:"var(--accent)", borderRadius:"8px", padding:"12px", marginBottom:"1rem", fontSize:"0.875rem" }}><strong>Note cliente: </strong>{booking.notes}</div>}
        <div style={{ marginBottom:"1rem" }}>
          <label>Stato prenotazione</label>
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginTop:"6px" }}>
            {Object.entries(STATUS_LABELS).filter(([k])=> type==="event" ? k!=="completed" : true).map(([k,v]) => (
              <button key={k} onClick={() => setStatus(k)} style={{ padding:"7px 14px", borderRadius:"8px", border:`2px solid ${status===k?"var(--primary)":"var(--border)"}`, background: status===k?"var(--primary-light)":"transparent", fontWeight: status===k?700:400, fontSize:"0.82rem", cursor:"pointer" }}>{v}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:"1rem" }}>
          <label>Note staff</label>
          <textarea className="input-field" style={{ marginTop:5, minHeight:72, resize:"vertical" }} value={staffNotes} onChange={e => setStaffNotes(e.target.value)} placeholder="Note interne, preventivo..." />
        </div>
        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={onClose} className="btn-outline" style={{ flex:1 }}>Annulla</button>
          <button onClick={() => { onSave(booking.id, type, status, staffNotes); onClose(); }} className="btn-primary" style={{ flex:2 }}>✅ Salva</button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function StaffDashboard() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [events, setEvents] = useState<EventBooking[]>([]);
  const [garden, setGarden] = useState<GardenBooking[]>([]);
  const [stats, setStats] = useState<Stats|null>(null);
  const [schedule, setSchedule] = useState<{events:ScheduleDay[];garden:ScheduleDay[]}>({events:[],garden:[]});
  const [webhookLog, setWebhookLog] = useState<{id:number;time:string;event:string;status:string}[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (event: string, ok: boolean) => setWebhookLog(l => [{id:Date.now(),time:new Date().toLocaleTimeString("it-IT"),event,status:ok?"✅ OK":"❌ Errore"},...l].slice(0,20));

  const loadData = useCallback(async () => {
    if (!loggedIn) return;
    setLoading(true);
    try {
      const [evRes, gdRes, stRes, schEvRes, schGdRes] = await Promise.all([
        fetch("/api/bookings/events"),
        fetch("/api/bookings/garden"),
        fetch("/api/staff/stats"),
        fetch("/api/availability?action=schedule&type=events"),
        fetch("/api/availability?action=schedule&type=garden"),
      ]);
      if (evRes.ok) setEvents(await evRes.json());
      if (gdRes.ok) setGarden(await gdRes.json());
      if (stRes.ok) setStats(await stRes.json());
      if (schEvRes.ok && schGdRes.ok) {
        setSchedule({ events: await schEvRes.json(), garden: await schGdRes.json() });
      }
    } finally { setLoading(false); }
  }, [loggedIn]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLogin = async () => {
    const res = await fetch("/api/auth", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ password }) });
    if (res.ok) { setLoggedIn(true); setLoginError(""); }
    else setLoginError("Password non valida");
  };

  const handleUpdate = async (id: number, type: string, status: string, staffNotes: string) => {
    const endpoint = type==="event" ? "/api/bookings/events" : "/api/bookings/garden";
    const res = await fetch(endpoint, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({id, status, staffNotes}) });
    if (res.ok) {
      if (type==="event") setEvents(ev => ev.map(e => e.id===id ? {...e,status,staff_notes:staffNotes} : e));
      else setGarden(gd => gd.map(g => g.id===id ? {...g,status,staff_notes:staffNotes} : g));
      addLog("cambio_stato", true);
      if (stats) setStats({ ...stats, [type==="event"?"events":"garden"]: { ...stats[type==="event"?"events":"garden"] } });
      loadData();
    }
  };

  const handleSaveSchedule = async (calType: "events"|"garden", newSchedule: ScheduleDay[]) => {
    const res = await fetch("/api/availability", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"save_schedule", calendarType: calType, schedule: newSchedule.map(d => ({ dayOfWeek: d.day_of_week, isOpen: d.is_open, slots: d.slots })) })
    });
    if (res.ok) {
      setSchedule(s => ({ ...s, [calType]: newSchedule }));
      alert("✅ Disponibilità salvata!");
    }
  };

  const handleTestWebhook = async () => {
    const res = await fetch("/api/webhook/test", { method:"POST" });
    addLog("test_connection", res.ok);
  };

  // ── LOGIN ──
  if (!loggedIn) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div className="fade-in card" style={{ maxWidth:360, width:"100%", textAlign:"center" }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:"var(--primary-light)", margin:"0 auto 1.5rem", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem" }}>🌿</div>
        <h1 style={{ fontFamily:"var(--font-display)", fontSize:"1.8rem", fontWeight:700, marginBottom:"8px" }}>Area Staff</h1>
        <p style={{ color:"var(--muted-fg)", marginBottom:"1.5rem" }}>Frugale Food Garden</p>
        <div style={{ display:"flex", flexDirection:"column", gap:"12px", textAlign:"left" }}>
          <div>
            <label>Password</label>
            <input className="input-field" style={{ marginTop:5 }} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==="Enter" && handleLogin()} />
          </div>
          {loginError && <p style={{ color:"var(--destructive)", fontSize:"0.82rem" }}>{loginError}</p>}
          <button className="btn-primary" onClick={handleLogin} style={{ width:"100%", justifyContent:"center" }}>Accedi</button>
        </div>
        <Link href="/" style={{ display:"block", marginTop:"1rem", fontSize:"0.875rem", color:"var(--muted-fg)" }}>← Torna al sito</Link>
      </div>
    </div>
  );

  // ── SIDEBAR ──
  const navItems = [
    {id:"overview",icon:"📊",label:"Panoramica"},
    {id:"calendar",icon:"📅",label:"Calendario"},
    {id:"events",icon:"🍽",label:"Prenotazioni eventi"},
    {id:"garden",icon:"🌿",label:"Sopralluoghi"},
    {id:"availability",icon:"⚙️",label:"Disponibilità"},
    {id:"export",icon:"📤",label:"Esporta / Webhook"},
  ];
  const pending = (stats?.events.pending??0) + (stats?.garden.pending??0);

  const Sidebar = () => (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:"#132b1a", color:"#e8f0e9" }}>
      <div style={{ padding:"1.25rem", borderBottom:"1px solid #1e3d26" }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:"10px", color:"inherit" }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--primary)", display:"flex", alignItems:"center", justifyContent:"center" }}>🌿</div>
          <div><p style={{ fontFamily:"var(--font-display)", fontSize:"0.875rem", fontWeight:600 }}>Frugale Food Garden</p><p style={{ fontSize:"0.68rem", opacity:0.6 }}>Staff Dashboard</p></div>
        </Link>
      </div>
      <nav style={{ flex:1, padding:"12px", overflowY:"auto" }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} style={{
            width:"100%", display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", borderRadius:"8px",
            border:"none", background: activeTab===item.id ? "var(--primary)" : "transparent",
            color: activeTab===item.id ? "white" : "rgba(232,240,233,0.7)",
            fontSize:"0.875rem", fontWeight:500, cursor:"pointer", marginBottom:"2px", textAlign:"left",
          }}><span>{item.icon}</span>{item.label}</button>
        ))}
      </nav>
      <div style={{ padding:"12px", borderTop:"1px solid #1e3d26" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"8px 12px", borderRadius:"8px", background:"rgba(255,255,255,0.05)" }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"var(--primary)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.8rem", fontWeight:700, color:"white" }}>S</div>
          <div style={{ flex:1 }}><p style={{ fontSize:"0.8rem", fontWeight:600 }}>Staff</p><p style={{ fontSize:"0.68rem", opacity:0.6 }}>Admin</p></div>
          <button onClick={async () => { await fetch("/api/auth",{method:"DELETE"}); setLoggedIn(false); }} style={{ background:"none", border:"none", cursor:"pointer", opacity:0.6, fontSize:"1rem" }} title="Esci">🚪</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="staff-layout">
      {/* Desktop sidebar */}
      <div className="staff-sidebar"><Sidebar /></div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex" }}>
          <div style={{ width:240 }}><Sidebar /></div>
          <div onClick={() => setSidebarOpen(false)} style={{ flex:1, background:"rgba(0,0,0,0.5)" }} />
        </div>
      )}

      {/* Main */}
      <div className="staff-main">
        <header style={{ height:56, borderBottom:"1px solid var(--border)", background:"var(--card)", display:"flex", alignItems:"center", padding:"0 1.25rem", gap:"12px", flexShrink:0 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:"1.3rem", display:"none" }} className="mobile-menu">☰</button>
          <h1 style={{ fontFamily:"var(--font-display)", fontSize:"1.15rem", fontWeight:700 }}>{navItems.find(n=>n.id===activeTab)?.label}</h1>
          {pending > 0 && <span style={{ marginLeft:"auto", fontSize:"0.78rem", color:"var(--muted-fg)", display:"flex", alignItems:"center", gap:"5px" }}><span style={{ width:8, height:8, borderRadius:"50%", background:"#f59e0b", display:"inline-block" }} />{pending} in attesa</span>}
        </header>

        <div className="staff-content">
          {loading && activeTab==="overview" && <p style={{ color:"var(--muted-fg)", fontSize:"0.875rem" }}>⏳ Caricamento...</p>}

          {/* OVERVIEW */}
          {activeTab==="overview" && stats && (
            <OverviewTab stats={stats} setActiveTab={setActiveTab} />
          )}

          {/* CALENDAR */}
          {activeTab==="calendar" && (
            <CalendarTab events={events} garden={garden} />
          )}

          {/* EVENTS */}
          {activeTab==="events" && (
            <BookingsList bookings={events} type="event" onUpdate={handleUpdate} labelMap={EVENT_TYPE_LABELS} />
          )}

          {/* GARDEN */}
          {activeTab==="garden" && (
            <BookingsList bookings={garden} type="garden" onUpdate={handleUpdate} labelMap={SPACE_TYPE_LABELS} />
          )}

          {/* AVAILABILITY */}
          {activeTab==="availability" && (
            <AvailabilityTab schedule={schedule} onSave={handleSaveSchedule} />
          )}

          {/* EXPORT / WEBHOOK */}
          {activeTab==="export" && (
            <ExportTab events={events} garden={garden} webhookLog={webhookLog} onTestWebhook={handleTestWebhook} />
          )}
        </div>
      </div>
      <style>{`@media(max-width:1023px){.mobile-menu{display:block!important;}}`}</style>
    </div>
  );
}

// ── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab({ stats, setActiveTab }: { stats:Stats; setActiveTab:(t:string)=>void }) {
  const cards = [
    {label:"Prenotazioni eventi",value:stats.events.total,icon:"🍽",color:"var(--primary)"},
    {label:"Sopralluoghi",value:stats.garden.total,icon:"🌿",color:"var(--primary)"},
    {label:"In attesa",value:stats.events.pending+stats.garden.pending,icon:"⏳",color:"#d97706"},
    {label:"Confermati",value:stats.events.confirmed+stats.garden.confirmed,icon:"✅",color:"#16a34a"},
    {label:"Annullati",value:stats.events.cancelled+stats.garden.cancelled,icon:"❌",color:"#dc2626"},
    {label:"Sopralluoghi effettuati",value:stats.garden.completed,icon:"⭐",color:"#2563eb"},
  ];
  return (
    <div className="fade-in" style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
      <div><h2 style={{ fontFamily:"var(--font-display)", fontSize:"1.6rem", fontWeight:700 }}>Benvenuto nella Dashboard</h2><p style={{ color:"var(--muted-fg)", fontSize:"0.875rem" }}>Gestisci prenotazioni e sopralluoghi da un unico pannello.</p></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"1rem" }}>
        {cards.map(c => (
          <div key={c.label} className="card" style={{ padding:"1.25rem" }}>
            <div style={{ fontSize:"1.5rem", marginBottom:"0.5rem" }}>{c.icon}</div>
            <p style={{ fontFamily:"var(--font-display)", fontSize:"2rem", fontWeight:700, color:c.color, lineHeight:1 }}>{c.value}</p>
            <p style={{ fontSize:"0.75rem", color:"var(--muted-fg)", marginTop:"4px" }}>{c.label}</p>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"1rem" }}>
        {[{tab:"events",icon:"🍽",title:"Prenotazioni Eventi",sub:`${stats.events.pending} in attesa · ${stats.events.confirmed} confermati`,btn:"Gestisci eventi"},
          {tab:"garden",icon:"🌿",title:"Sopralluoghi",sub:`${stats.garden.pending} in attesa · ${stats.garden.confirmed} confermati`,btn:"Gestisci sopralluoghi"}].map(q => (
          <div key={q.tab} className="card">
            <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"1rem" }}>
              <div style={{ width:40, height:40, borderRadius:"10px", background:"var(--primary-light)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.25rem" }}>{q.icon}</div>
              <div><p style={{ fontWeight:600 }}>{q.title}</p><p style={{ fontSize:"0.75rem", color:"var(--muted-fg)" }}>{q.sub}</p></div>
            </div>
            <button className="btn-primary" onClick={() => setActiveTab(q.tab)} style={{ width:"100%", justifyContent:"center", fontSize:"0.875rem", padding:"9px" }}>{q.btn}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CALENDAR TAB ─────────────────────────────────────────────────────────────
function CalendarTab({ events, garden }: { events:EventBooking[]; garden:GardenBooking[]; }) {
  const [curDate, setCurDate] = useState(new Date());
  const [filter, setFilter] = useState("all");
  const year = curDate.getFullYear(), month = curDate.getMonth();
  const firstDay = (new Date(year, month, 1).getDay()+6)%7;
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells: (number|null)[] = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let i=1;i<=daysInMonth;i++) cells.push(i);
  const MONTHS=["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
  const today=new Date();today.setHours(0,0,0,0);
  const COLORS:Record<string,string>={pending:"#f59e0b",confirmed:"#22c55e",cancelled:"#ef4444",completed:"#3b82f6"};

  const getForDay = (d:number) => {
    const date=new Date(year,month,d);
    const evts = filter!=="garden" ? events.filter(e=>new Date(Number(e.start_time)).toDateString()===date.toDateString() && e.status!=="cancelled") : [];
    const gdns = filter!=="events" ? garden.filter(g=>new Date(Number(g.start_time)).toDateString()===date.toDateString() && g.status!=="cancelled") : [];
    return {evts,gdns};
  };

  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
      <div style={{display:"flex",flexWrap:"wrap",gap:"10px",alignItems:"center"}}>
        <div style={{display:"flex",borderRadius:"8px",border:"1px solid var(--border)",overflow:"hidden"}}>
          {[["all","Tutti"],["events","Solo eventi"],["garden","Solo sopralluoghi"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{padding:"8px 12px",border:"none",fontSize:"0.78rem",fontWeight:600,cursor:"pointer",background:filter===v?"var(--primary)":"var(--card)",color:filter===v?"white":"var(--muted-fg)"}}>{l}</button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"8px",marginLeft:"auto"}}>
          <button onClick={()=>setCurDate(new Date(year,month-1,1))} style={{padding:"6px 12px",borderRadius:"6px",border:"1px solid var(--border)",background:"none",cursor:"pointer"}}>‹</button>
          <span style={{fontWeight:600,minWidth:140,textAlign:"center",fontSize:"0.9rem"}}>{MONTHS[month]} {year}</span>
          <button onClick={()=>setCurDate(new Date(year,month+1,1))} style={{padding:"6px 12px",borderRadius:"6px",border:"1px solid var(--border)",background:"none",cursor:"pointer"}}>›</button>
          <button onClick={()=>setCurDate(new Date())} style={{padding:"6px 12px",borderRadius:"6px",border:"1px solid var(--border)",background:"none",cursor:"pointer",fontSize:"0.8rem",fontWeight:600}}>Oggi</button>
        </div>
      </div>
      <div style={{background:"var(--card)",borderRadius:"1rem",border:"1px solid var(--border)",overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:"1px solid var(--border)"}}>
          {["Lun","Mar","Mer","Gio","Ven","Sab","Dom"].map(d=><div key={d} style={{padding:"8px 0",textAlign:"center",fontSize:"0.7rem",fontWeight:700,color:"var(--muted-fg)",borderRight:"1px solid var(--border)"}}>{d}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
          {cells.map((day,i)=>{
            if(!day) return <div key={i} style={{minHeight:80,borderRight:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}} />;
            const d=new Date(year,month,day);d.setHours(0,0,0,0);
            const isToday=d.toDateString()===today.toDateString();
            const {evts,gdns}=getForDay(day);
            return (
              <div key={i} style={{minHeight:80,padding:"4px",borderRight:"1px solid var(--border)",borderBottom:"1px solid var(--border)",background:isToday?"rgba(58,107,69,0.05)":"transparent"}}>
                <span style={{display:"inline-flex",width:22,height:22,borderRadius:"50%",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",fontWeight:isToday?700:400,background:isToday?"var(--primary)":"transparent",color:isToday?"white":"var(--fg)",marginBottom:"3px"}}>{day}</span>
                {evts.slice(0,2).map(e=><div key={e.id} style={{display:"flex",alignItems:"center",gap:"3px",padding:"2px 5px",borderRadius:"4px",background:"var(--primary-light)",fontSize:"0.65rem",overflow:"hidden",marginBottom:"2px"}}><span style={{width:6,height:6,borderRadius:"50%",background:COLORS[e.status],flexShrink:0}}/><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>🍽 {e.client_name}</span></div>)}
                {gdns.slice(0,2).map(g=><div key={g.id} style={{display:"flex",alignItems:"center",gap:"3px",padding:"2px 5px",borderRadius:"4px",background:"var(--accent)",fontSize:"0.65rem",overflow:"hidden",marginBottom:"2px"}}><span style={{width:6,height:6,borderRadius:"50%",background:COLORS[g.status],flexShrink:0}}/><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>🌿 {g.client_name}</span></div>)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── BOOKINGS LIST ─────────────────────────────────────────────────────────────
function BookingsList({ bookings, type, onUpdate, labelMap }: { bookings:any[]; type:string; onUpdate:(id:number,type:string,status:string,notes:string)=>void; labelMap:Record<string,string>; }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const filtered = bookings.filter(b => {
    const mStatus = filter==="all" || b.status===filter;
    const q=search.toLowerCase();
    const mSearch=!q||b.client_name?.toLowerCase().includes(q)||b.client_email?.toLowerCase().includes(q)||(b.client_phone||"").includes(q);
    return mStatus && mSearch;
  });
  const statusFilters = type==="event" ? ["all","pending","confirmed","cancelled"] : ["all","pending","confirmed","completed","cancelled"];

  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
      <div style={{display:"flex",flexWrap:"wrap",gap:"10px"}}>
        <input className="input-field" style={{flex:1,minWidth:200}} placeholder="Cerca nome, email, telefono..." value={search} onChange={e=>setSearch(e.target.value)} />
        <div style={{display:"flex",borderRadius:"8px",border:"1px solid var(--border)",overflow:"hidden",flexWrap:"wrap"}}>
          {statusFilters.map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{padding:"8px 10px",border:"none",fontSize:"0.72rem",fontWeight:600,cursor:"pointer",background:filter===s?"var(--primary)":"var(--card)",color:filter===s?"white":"var(--muted-fg)"}}>{s==="all"?"Tutti":STATUS_LABELS[s]}</button>
          ))}
        </div>
      </div>
      <p style={{fontSize:"0.82rem",color:"var(--muted-fg)"}}>{filtered.length} {type==="event"?"prenotazioni":"sopralluoghi"} trovati</p>
      {filtered.length===0 ? (
        <div style={{textAlign:"center",padding:"3rem",color:"var(--muted-fg)"}}><p style={{fontSize:"2rem",marginBottom:"8px"}}>{type==="event"?"🍽":"🌿"}</p><p>Nessun risultato</p></div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          {filtered.map(b=>(
            <div key={b.id} style={{background:"var(--card)",borderRadius:"0.75rem",border:"1px solid var(--border)",padding:"1rem",transition:"border-color 0.15s"}} onMouseEnter={e=>(e.currentTarget.style.borderColor="var(--primary)")} onMouseLeave={e=>(e.currentTarget.style.borderColor="var(--border)")}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"12px"}}>
                <div onClick={()=>setSelected(b)} style={{display:"flex",alignItems:"flex-start",gap:"12px",minWidth:0,flex:1,cursor:"pointer"}}>
                  <div style={{width:36,height:36,borderRadius:"8px",background:"var(--primary-light)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"1rem"}}>{type==="event"?"🍽":"🌿"}</div>
                  <div style={{minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap",marginBottom:"4px"}}>
                      <span style={{fontWeight:600,fontSize:"0.9rem"}}>{b.client_name}</span>
                      <StatusBadge status={b.status} />
                      <span style={{padding:"2px 8px",borderRadius:"999px",fontSize:"0.7rem",fontWeight:600,background:"var(--accent)",color:"var(--accent-fg)"}}>{labelMap[b.event_type||b.space_type]}</span>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:"12px",fontSize:"0.75rem",color:"var(--muted-fg)"}}>
                      <span>📅 {new Date(b.start_time).toLocaleDateString("it-IT",{day:"numeric",month:"short",year:"numeric"})}</span>
                      <span>🕐 {new Date(b.start_time).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})}</span>
                      {b.guest_count && <span>👥 {b.guest_count} persone</span>}
                      {b.address && <span>📍 {b.address.slice(0,30)}…</span>}
                    </div>
                    <p style={{fontSize:"0.75rem",color:"var(--muted-fg)",marginTop:"2px"}}>{b.client_email}</p>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"5px",flexShrink:0}}>
                  {b.status!=="confirmed"&&<button onClick={e=>{e.stopPropagation();onUpdate(b.id,type,"confirmed",b.staff_notes??"");}} style={{padding:"5px 10px",borderRadius:"6px",border:"none",background:"#dcfce7",color:"#166534",fontSize:"0.7rem",fontWeight:700,cursor:"pointer"}}>✅ Conferma</button>}
                  {b.status!=="cancelled"&&<button onClick={e=>{e.stopPropagation();onUpdate(b.id,type,"cancelled",b.staff_notes??"");}} style={{padding:"5px 10px",borderRadius:"6px",border:"none",background:"#fef2f2",color:"#991b1b",fontSize:"0.7rem",fontWeight:700,cursor:"pointer"}}>❌ Annulla</button>}
                  <button onClick={()=>setSelected(b)} style={{padding:"5px 10px",borderRadius:"6px",border:"1px solid var(--border)",background:"transparent",fontSize:"0.7rem",fontWeight:600,cursor:"pointer",color:"var(--muted-fg)"}}>✏️ Dettagli</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selected && <BookingModal booking={selected} type={type} onClose={()=>setSelected(null)} onSave={onUpdate} />}
    </div>
  );
}

// ── AVAILABILITY TAB ──────────────────────────────────────────────────────────
function AvailabilityTab({ schedule, onSave }: { schedule:{events:ScheduleDay[];garden:ScheduleDay[]}; onSave:(t:"events"|"garden",s:ScheduleDay[])=>void; }) {
  const [calType, setCalType] = useState<"events"|"garden">("events");
  const [local, setLocal] = useState<ScheduleDay[]>([]);

  useEffect(() => {
    const days = schedule[calType];
    if (days.length > 0) setLocal(JSON.parse(JSON.stringify(days)));
    else {
      // Build default if empty
      setLocal(DAYS_OF_WEEK.map(d => ({
        day_of_week: d.id,
        is_open: d.id >= 1 && d.id <= 5,
        slots: d.id >= 1 && d.id <= 5 ? [{from:"09:00",to:"18:00"}] : [],
      })));
    }
  }, [calType, schedule]);

  const toggleDay = (dow: number) => setLocal(l => l.map(d => d.day_of_week===dow ? {...d, is_open:!d.is_open} : d));
  const updateSlot = (dow: number, i: number, field: "from"|"to", val: string) => setLocal(l => l.map(d => d.day_of_week===dow ? {...d, slots: d.slots.map((s,si)=>si===i?{...s,[field]:val}:s)} : d));
  const addSlot = (dow: number) => setLocal(l => l.map(d => d.day_of_week===dow ? {...d, slots:[...d.slots,{from:"09:00",to:"10:00"}]} : d));
  const removeSlot = (dow: number, i: number) => setLocal(l => l.map(d => d.day_of_week===dow ? {...d, slots:d.slots.filter((_,si)=>si!==i)} : d));

  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:"1.5rem"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
        <div>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",fontWeight:700}}>Disponibilità settimanale</h2>
          <p style={{color:"var(--muted-fg)",fontSize:"0.85rem",marginTop:"4px"}}>Configura orari e fasce disponibili per ogni giorno. Si applicano in modo ricorrente.</p>
        </div>
        <button className="btn-primary" onClick={()=>onSave(calType,local)} style={{fontSize:"0.875rem",padding:"10px 20px"}}>💾 Salva modifiche</button>
      </div>

      <div style={{display:"flex",borderRadius:"10px",border:"1px solid var(--border)",overflow:"hidden",width:"fit-content"}}>
        {[["events","🍽 Prenotazioni eventi"],["garden","🌿 Sopralluoghi"]].map(([v,l])=>(
          <button key={v} onClick={()=>setCalType(v as any)} style={{padding:"10px 20px",border:"none",fontSize:"0.875rem",fontWeight:600,cursor:"pointer",background:calType===v?"var(--primary)":"var(--card)",color:calType===v?"white":"var(--muted-fg)"}}>{l}</button>
        ))}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
        {DAYS_OF_WEEK.map(day=>{
          const dayConfig = local.find(d=>d.day_of_week===day.id) ?? {day_of_week:day.id,is_open:false,slots:[]};
          return (
            <div key={day.id} className="card" style={{padding:"1rem 1.25rem"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:"16px",flexWrap:"wrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px",minWidth:130}}>
                  <button onClick={()=>toggleDay(day.id)} style={{width:44,height:24,borderRadius:"12px",border:"none",cursor:"pointer",background:dayConfig.is_open?"var(--primary)":"var(--border)",position:"relative",transition:"background 0.2s",flexShrink:0}}>
                    <span style={{position:"absolute",top:3,width:18,height:18,borderRadius:"50%",background:"white",transition:"left 0.2s",left:dayConfig.is_open?"calc(100% - 21px)":"3px",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}} />
                  </button>
                  <span style={{fontWeight:700,fontSize:"0.9rem",color:dayConfig.is_open?"var(--fg)":"var(--muted-fg)"}}>{day.label}</span>
                </div>
                {!dayConfig.is_open ? (
                  <span style={{padding:"6px 14px",borderRadius:"6px",background:"var(--muted)",color:"var(--muted-fg)",fontSize:"0.82rem",fontWeight:600}}>🔒 Chiuso</span>
                ) : (
                  <div style={{display:"flex",flexWrap:"wrap",gap:"10px",flex:1,alignItems:"center"}}>
                    {dayConfig.slots.map((slot,si)=>(
                      <div key={si} style={{display:"flex",alignItems:"center",gap:"6px",background:"var(--accent)",borderRadius:"8px",padding:"6px 10px",border:"1px solid var(--border)"}}>
                        <span style={{fontSize:"0.7rem",fontWeight:700,color:"var(--muted-fg)"}}>#{si+1}</span>
                        <input type="time" value={slot.from} onChange={e=>updateSlot(day.id,si,"from",e.target.value)} style={{padding:"4px 8px",borderRadius:"6px",border:"1px solid var(--border)",background:"var(--bg)",fontSize:"0.875rem",fontFamily:"monospace",width:90}} />
                        <span style={{fontSize:"0.8rem",color:"var(--muted-fg)",fontWeight:600}}>→</span>
                        <input type="time" value={slot.to} onChange={e=>updateSlot(day.id,si,"to",e.target.value)} style={{padding:"4px 8px",borderRadius:"6px",border:"1px solid var(--border)",background:"var(--bg)",fontSize:"0.875rem",fontFamily:"monospace",width:90}} />
                        <button onClick={()=>removeSlot(day.id,si)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--destructive)",padding:"2px",lineHeight:1}}>✕</button>
                      </div>
                    ))}
                    {dayConfig.slots.length<4 && (
                      <button onClick={()=>addSlot(day.id)} style={{padding:"6px 12px",borderRadius:"8px",border:"1.5px dashed var(--border)",background:"transparent",color:"var(--muted-fg)",fontSize:"0.8rem",fontWeight:600,cursor:"pointer"}}>+ Aggiungi fascia</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{background:"rgba(58,107,69,0.06)",borderRadius:"10px",padding:"14px 16px",border:"1px solid var(--border)",fontSize:"0.82rem",color:"var(--muted-fg)"}}>
        💡 <strong>Come funziona:</strong> gli orari impostati qui definiscono le fasce prenotabili dai clienti. Le modifiche si applicano alle date future.
      </div>
    </div>
  );
}

// ── EXPORT + WEBHOOK TAB ──────────────────────────────────────────────────────
function ExportTab({ events, garden, webhookLog, onTestWebhook }: { events:EventBooking[]; garden:GardenBooking[]; webhookLog:any[]; onTestWebhook:()=>void; }) {
  const [section, setSection] = useState("export");
  const [testStatus, setTestStatus] = useState<string|null>(null);

  const downloadCSV = (type: string) => {
    const rows: string[] = [];
    if (type!=="garden") {
      rows.push("Tipo,Nome,Email,Telefono,Tipo Evento,Persone,Data,Ora,Stato,Note");
      events.forEach(e=>rows.push(`Evento,"${e.client_name}",${e.client_email},${e.client_phone},${e.event_type},${e.guest_count},${new Date(e.start_time).toLocaleDateString("it-IT")},${new Date(e.start_time).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})},${e.status},"${e.notes||""}"`));
    }
    if (type!=="events") {
      if (type==="all") rows.push("");
      rows.push("Tipo,Nome,Email,Telefono,Tipo Spazio,Superficie,Indirizzo,Data,Ora,Stato");
      garden.forEach(g=>rows.push(`Sopralluogo,"${g.client_name}",${g.client_email},${g.client_phone},${g.space_type},${g.surface_area||""},"${g.address}",${new Date(g.start_time).toLocaleDateString("it-IT")},${new Date(g.start_time).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})},${g.status}`));
    }
    const blob=new Blob(["\uFEFF"+rows.join("\n")],{type:"text/csv;charset=utf-8;"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`frugale-${type}-${new Date().toISOString().slice(0,10)}.csv`;document.body.appendChild(a);a.click();document.body.removeChild(a);
  };

  const handleTest = async () => {
    setTestStatus("sending");
    await onTestWebhook();
    setTestStatus("done");
    setTimeout(()=>setTestStatus(null),3000);
  };

  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:"1.5rem"}}>
      <div style={{display:"flex",borderRadius:"10px",border:"1px solid var(--border)",overflow:"hidden",width:"fit-content"}}>
        {[["export","📄 Esportazione"],["webhook","🔗 Webhook n8n"]].map(([v,l])=>(
          <button key={v} onClick={()=>setSection(v)} style={{padding:"10px 20px",border:"none",fontSize:"0.875rem",fontWeight:600,cursor:"pointer",background:section===v?"var(--primary)":"var(--card)",color:section===v?"white":"var(--muted-fg)"}}>{l}</button>
        ))}
      </div>

      {section==="export" && (
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"12px"}}>
            {[["🍽","Prenotazioni eventi",events.length],["🌿","Sopralluoghi",garden.length]].map(([e,l,v])=>(
              <div key={l as string} className="card" style={{display:"flex",alignItems:"center",gap:"12px",padding:"1rem"}}>
                <span style={{fontSize:"2rem"}}>{e}</span>
                <div><p style={{fontFamily:"var(--font-display)",fontSize:"1.6rem",fontWeight:700,lineHeight:1}}>{v}</p><p style={{fontSize:"0.75rem",color:"var(--muted-fg)"}}>{l}</p></div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{fontFamily:"var(--font-display)",fontSize:"1.15rem",fontWeight:700,marginBottom:"0.5rem"}}>📄 Esporta CSV</h3>
            <p style={{fontSize:"0.82rem",color:"var(--muted-fg)",marginBottom:"1rem"}}>Compatibile con Excel e Google Sheets.</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:"10px"}}>
              <button className="btn-outline" onClick={()=>downloadCSV("events")} disabled={events.length===0}>🍽 Solo eventi ({events.length})</button>
              <button className="btn-outline" onClick={()=>downloadCSV("garden")} disabled={garden.length===0}>🌿 Solo sopralluoghi ({garden.length})</button>
              <button className="btn-primary" onClick={()=>downloadCSV("all")} style={{fontSize:"0.875rem",padding:"10px 20px"}}>⬇ Esporta tutto</button>
            </div>
          </div>
        </>
      )}

      {section==="webhook" && (
        <>
          <div className="card">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px",marginBottom:"1rem"}}>
              <div>
                <h3 style={{fontFamily:"var(--font-display)",fontSize:"1.15rem",fontWeight:700,display:"flex",alignItems:"center",gap:"8px"}}>🔗 Connessione n8n <span style={{padding:"2px 8px",borderRadius:"999px",fontSize:"0.7rem",fontWeight:700,background:"#dcfce7",color:"#166534",border:"1px solid #bbf7d0"}}>Configurato</span></h3>
                <p style={{fontSize:"0.78rem",color:"var(--muted-fg)",marginTop:"3px"}}>URL webhook attivo</p>
              </div>
              <button className="btn-outline" onClick={handleTest} disabled={testStatus==="sending"} style={{fontSize:"0.82rem"}}>
                {testStatus==="sending"?"⏳ Invio...":testStatus==="done"?"✅ Inviato!":"🧪 Testa connessione"}
              </button>
            </div>
            <div style={{background:"var(--muted)",borderRadius:"8px",padding:"10px 14px",fontFamily:"monospace",fontSize:"0.72rem",color:"var(--muted-fg)",wordBreak:"break-all"}}>{N8N_URL}</div>
          </div>

          <div className="card">
            <h3 style={{fontFamily:"var(--font-display)",fontSize:"1.15rem",fontWeight:700,marginBottom:"1rem"}}>⚡ Eventi che triggerano il webhook</h3>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {[["🍽","nuova_prenotazione_evento","Nuova prenotazione evento"],["🌿","nuovo_sopralluogo_giardino","Nuovo sopralluogo giardino"],["🔄","cambio_stato","Cambio di stato prenotazione"],["❌","cancellazione_cliente","Cancellazione da cliente"]].map(([ic,ev,lb])=>(
                <div key={ev} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 14px",borderRadius:"8px",background:"var(--accent)",border:"1px solid var(--border)"}}>
                  <span style={{fontSize:"1.2rem"}}>{ic}</span>
                  <div style={{flex:1}}><p style={{fontWeight:600,fontSize:"0.875rem"}}>{lb}</p><p style={{fontSize:"0.7rem",fontFamily:"monospace",color:"var(--muted-fg)"}}>{ev}</p></div>
                  <span style={{width:8,height:8,borderRadius:"50%",background:"#22c55e"}} />
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
              <h3 style={{fontFamily:"var(--font-display)",fontSize:"1.15rem",fontWeight:700}}>📋 Log invii recenti</h3>
            </div>
            {webhookLog.length===0 ? (
              <div style={{textAlign:"center",padding:"2rem",color:"var(--muted-fg)"}}>
                <p style={{fontSize:"2rem",marginBottom:"8px"}}>📭</p>
                <p style={{fontSize:"0.875rem"}}>Nessun invio registrato</p>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:"6px",maxHeight:280,overflowY:"auto"}}>
                {webhookLog.map(e=>(
                  <div key={e.id} style={{display:"flex",alignItems:"center",gap:"12px",padding:"8px 12px",borderRadius:"8px",background:"var(--muted)",fontSize:"0.82rem"}}>
                    <span style={{fontFamily:"monospace",color:"var(--muted-fg)",flexShrink:0}}>{e.time}</span>
                    <span style={{fontFamily:"monospace",flex:1}}>{e.event}</span>
                    <span>{e.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
