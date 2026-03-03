"use client";
import { useState } from "react";
import Link from "next/link";

const MONTHS_IT = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const DAYS_IT = ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"];

function MiniCalendar({ selected, onSelect }: { selected: Date|null; onSelect: (d:Date)=>void }) {
  const [view, setView] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const year = view.getFullYear(), month = view.getMonth();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);
  const cells: (number|null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1rem", width: 280, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <button onClick={() => setView(new Date(year, month-1, 1))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "var(--muted-fg)", padding: "4px 8px" }}>‹</button>
        <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{MONTHS_IT[month]} {year}</span>
        <button onClick={() => setView(new Date(year, month+1, 1))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "var(--muted-fg)", padding: "4px 8px" }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
        {DAYS_IT.map(d => <div key={d} style={{ textAlign: "center", fontSize: "0.65rem", fontWeight: 700, color: "var(--muted-fg)", padding: "2px 0" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const d = new Date(year, month, day);
          const isPast = d < today;
          const isSel = selected && d.toDateString() === selected.toDateString();
          const isToday = d.toDateString() === today.toDateString();
          return (
            <button key={i} onClick={() => !isPast && onSelect(d)} disabled={isPast} style={{
              width: "100%", aspectRatio: "1", borderRadius: "6px", border: "none", cursor: isPast ? "not-allowed" : "pointer",
              fontSize: "0.8rem", fontWeight: isSel || isToday ? 700 : 400,
              background: isSel ? "var(--primary)" : isToday ? "var(--accent)" : "transparent",
              color: isSel ? "white" : isPast ? "var(--border)" : "var(--fg)",
              transition: "background 0.1s",
            }}>{day}</button>
          );
        })}
      </div>
    </div>
  );
}

interface BookingFormProps { type: "eventi" | "giardino"; }

const EVENT_TYPES = [
  { value: "compleanno", label: "🎂 Compleanno" },
  { value: "festa_privata", label: "🎉 Festa privata" },
  { value: "aziendale", label: "🏢 Evento aziendale" },
  { value: "altro", label: "✨ Altro" },
];
const SPACE_TYPES = [
  { value: "giardino_privato", label: "🌳 Giardino privato" },
  { value: "terrazzo", label: "🪴 Terrazzo" },
  { value: "balcone", label: "🌺 Balcone" },
  { value: "spazio_commerciale", label: "🏪 Spazio commerciale" },
];

export default function BookingForm({ type }: BookingFormProps) {
  const isEvent = type === "eventi";

  // Step 1
  const [serviceType, setServiceType] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [date, setDate] = useState<Date|null>(null);
  const [showCal, setShowCal] = useState(false);
  const [slots, setSlots] = useState<{start:string;end:string;available:boolean}[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  // Step 2
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [address, setAddress] = useState("");
  const [surfaceArea, setSurfaceArea] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [cancelToken, setCancelToken] = useState("");
  const [error, setError] = useState("");

  const loadSlots = async (d: Date) => {
    setDate(d); setShowCal(false); setSelectedSlot(""); setSlots([]);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/availability?action=slots&type=${isEvent?"events":"garden"}&date=${dateStr}`);
      const data = await res.json();
      setIsBlocked(data.isBlocked);
      setSlots(data.slots ?? []);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.slice(0, 5 - photos.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setPhotos(p => [...p, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!serviceType || !date || !selectedSlot || !clientName || !clientEmail || !clientPhone) {
      setError("Compila tutti i campi obbligatori"); return;
    }
    if (!isEvent && !address) { setError("Inserisci l'indirizzo"); return; }

    setSubmitting(true); setError("");
    const [slotStart] = selectedSlot.split("-");
    const [sh, sm] = slotStart.split(":").map(Number);
    const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), sh, sm).getTime();
    const duration = isEvent ? 30 : 60;
    const endTime = startTime + duration * 60 * 1000;

    const body = isEvent
      ? { eventType: serviceType, guestCount: parseInt(guestCount)||1, startTime, endTime, clientName, clientEmail, clientPhone, notes }
      : { spaceType: serviceType, surfaceArea, startTime, endTime, clientName, clientEmail, clientPhone, address, notes, photoUrls: photos };

    const endpoint = isEvent ? "/api/bookings/events" : "/api/bookings/garden";
    try {
      const res = await fetch(endpoint, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Errore");
      setCancelToken(data.cancelToken);
      setStep(3);
    } catch(e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: Date) => d.toLocaleDateString("it-IT", { weekday:"long", day:"numeric", month:"long", year:"numeric" });

  if (step === 3) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1.5rem" }}>
      <div className="fade-in card" style={{ maxWidth:480, width:"100%", textAlign:"center" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.5rem", fontSize:"2rem" }}>✅</div>
        <h1 style={{ fontFamily:"var(--font-display)", fontSize:"1.8rem", fontWeight:700, marginBottom:"0.5rem" }}>Richiesta inviata!</h1>
        <p style={{ color:"var(--muted-fg)", marginBottom:"1.5rem" }}>Ti contatteremo entro 24 ore per confermare.</p>
        <div style={{ background:"var(--muted)", borderRadius:"0.75rem", padding:"1rem", marginBottom:"1.5rem", fontSize:"0.85rem" }}>
          <p style={{ fontWeight:600, marginBottom:"4px" }}>Codice prenotazione</p>
          <p style={{ fontFamily:"monospace", fontSize:"0.8rem", color:"var(--muted-fg)", wordBreak:"break-all" }}>{cancelToken}</p>
          <p style={{ fontSize:"0.75rem", color:"var(--muted-fg)", marginTop:"6px" }}>Conservalo per modificare o cancellare</p>
        </div>
        <Link href="/" className="btn-primary" style={{ width:"100%", justifyContent:"center" }}>← Torna alla home</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      {/* Nav */}
      <nav style={{ borderBottom:"1px solid var(--border)", background:"var(--card)", padding:"0 1.5rem", height:60, display:"flex", alignItems:"center", gap:"12px" }}>
        <Link href="/" style={{ color:"var(--muted-fg)", fontSize:"0.875rem" }}>← Home</Link>
        <span style={{ color:"var(--border)" }}>/</span>
        <span style={{ fontWeight:600, fontSize:"0.875rem" }}>{isEvent ? "Prenota evento" : "Prenota sopralluogo"}</span>
      </nav>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"2rem 1.5rem" }}>
        {/* Progress */}
        <div style={{ display:"flex", gap:"8px", marginBottom:"2rem" }}>
          {[1,2].map(n => (
            <div key={n} style={{ flex:1, height:4, borderRadius:2, background: step >= n ? "var(--primary)" : "var(--border)", transition:"background 0.3s" }} />
          ))}
        </div>

        <h1 style={{ fontFamily:"var(--font-display)", fontSize:"2rem", fontWeight:700, marginBottom:"0.5rem" }}>
          {isEvent ? "🍽 Prenota il tuo evento" : "🌿 Prenota un sopralluogo"}
        </h1>
        <p style={{ color:"var(--muted-fg)", marginBottom:"2rem" }}>
          {step === 1 ? "Scegli tipologia, data e orario" : "Inserisci i tuoi dati di contatto"}
        </p>

        {error && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:"0.75rem", padding:"12px 16px", color:"#991b1b", fontSize:"0.875rem", marginBottom:"1rem" }}>{error}</div>}

        {step === 1 && (
          <div className="fade-in" style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
            {/* Type */}
            <div>
              <label>{isEvent ? "Tipo di evento *" : "Tipo di spazio *"}</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginTop:"6px" }}>
                {(isEvent ? EVENT_TYPES : SPACE_TYPES).map(t => (
                  <button key={t.value} onClick={() => setServiceType(t.value)} style={{
                    padding:"12px", borderRadius:"0.75rem", border:`2px solid ${serviceType===t.value?"var(--primary)":"var(--border)"}`,
                    background: serviceType===t.value ? "var(--primary-light)" : "var(--card)",
                    fontWeight: serviceType===t.value ? 700 : 400, fontSize:"0.875rem", cursor:"pointer", textAlign:"left",
                  }}>{t.label}</button>
                ))}
              </div>
            </div>

            {isEvent && (
              <div>
                <label>Numero di ospiti *</label>
                <input className="input-field" style={{ marginTop:6 }} type="number" min="1" placeholder="Es. 40" value={guestCount} onChange={e => setGuestCount(e.target.value)} />
              </div>
            )}

            {/* Date */}
            <div style={{ position:"relative" }}>
              <label>Data *</label>
              <button onClick={() => setShowCal(!showCal)} style={{
                width:"100%", padding:"10px 14px", borderRadius:"8px", border:`1.5px solid ${showCal ? "var(--primary)" : "var(--border)"}`,
                background:"var(--card)", display:"flex", alignItems:"center", gap:"8px", cursor:"pointer",
                fontSize:"0.9rem", color: date ? "var(--fg)" : "var(--muted-fg)", marginTop:6,
              }}>
                📅 {date ? formatDate(date) : "Seleziona una data"}
              </button>
              {showCal && (
                <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:20 }}>
                  <MiniCalendar selected={date} onSelect={loadSlots} />
                </div>
              )}
            </div>

            {/* Slots */}
            {date && (
              <div>
                <label>Orario *</label>
                {loadingSlots ? (
                  <p style={{ color:"var(--muted-fg)", fontSize:"0.875rem", marginTop:6 }}>⏳ Caricamento orari...</p>
                ) : isBlocked ? (
                  <p style={{ color:"var(--destructive)", fontSize:"0.875rem", marginTop:6 }}>❌ Giorno non disponibile. Scegli un'altra data.</p>
                ) : slots.length === 0 ? (
                  <p style={{ color:"var(--muted-fg)", fontSize:"0.875rem", marginTop:6 }}>Nessun orario disponibile per questo giorno.</p>
                ) : (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginTop:6 }}>
                    {slots.map(slot => (
                      <button key={slot.start} disabled={!slot.available} onClick={() => setSelectedSlot(`${slot.start}-${slot.end}`)} style={{
                        padding:"8px 14px", borderRadius:"8px", fontSize:"0.875rem", fontWeight:600, cursor: slot.available ? "pointer" : "not-allowed",
                        border:`2px solid ${selectedSlot===`${slot.start}-${slot.end}` ? "var(--primary)" : "var(--border)"}`,
                        background: !slot.available ? "var(--muted)" : selectedSlot===`${slot.start}-${slot.end}` ? "var(--primary-light)" : "var(--card)",
                        color: !slot.available ? "var(--border)" : "var(--fg)",
                        textDecoration: !slot.available ? "line-through" : "none",
                      }}>{slot.start}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button className="btn-primary" onClick={() => { if (!serviceType || !date || !selectedSlot) { setError("Compila tutti i campi"); return; } setError(""); setStep(2); }} style={{ marginTop:"0.5rem" }}>
              Continua →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in" style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            {/* Summary */}
            <div style={{ background:"var(--accent)", borderRadius:"0.75rem", padding:"12px 16px", fontSize:"0.875rem", marginBottom:"0.5rem" }}>
              <strong>{date && formatDate(date)}</strong> alle <strong>{selectedSlot.split("-")[0]}</strong>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ gridColumn:"1/-1" }}>
                <label>Nome e cognome *</label>
                <input className="input-field" style={{ marginTop:5 }} placeholder="Mario Rossi" value={clientName} onChange={e => setClientName(e.target.value)} />
              </div>
              <div>
                <label>Email *</label>
                <input className="input-field" style={{ marginTop:5 }} type="email" placeholder="mario@email.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
              </div>
              <div>
                <label>Telefono *</label>
                <input className="input-field" style={{ marginTop:5 }} placeholder="+39 333 1234567" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
              </div>
              {!isEvent && (
                <>
                  <div style={{ gridColumn:"1/-1" }}>
                    <label>Indirizzo *</label>
                    <input className="input-field" style={{ marginTop:5 }} placeholder="Via Roma 45, Milano" value={address} onChange={e => setAddress(e.target.value)} />
                  </div>
                  <div>
                    <label>Superficie (opzionale)</label>
                    <input className="input-field" style={{ marginTop:5 }} placeholder="Es. 50 mq" value={surfaceArea} onChange={e => setSurfaceArea(e.target.value)} />
                  </div>
                </>
              )}
              <div style={{ gridColumn:"1/-1" }}>
                <label>Note (opzionale)</label>
                <textarea className="input-field" style={{ marginTop:5, resize:"vertical", minHeight:80 }} placeholder={isEvent ? "Allergie, preferenze, richieste speciali..." : "Descrivici lo spazio e le tue idee..."} value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              {!isEvent && (
                <div style={{ gridColumn:"1/-1" }}>
                  <label>Foto dello spazio (opzionale, max 5)</label>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ marginTop:5, fontSize:"0.875rem" }} />
                  {photos.length > 0 && (
                    <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginTop:"8px" }}>
                      {photos.map((p,i) => <img key={i} src={p} alt="" style={{ width:60, height:60, objectFit:"cover", borderRadius:"6px", border:"1px solid var(--border)" }} />)}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display:"flex", gap:"10px", marginTop:"0.5rem" }}>
              <button className="btn-outline" onClick={() => setStep(1)} style={{ flex:1 }}>← Indietro</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting} style={{ flex:2 }}>
                {submitting ? "⏳ Invio..." : "✅ Conferma prenotazione"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
