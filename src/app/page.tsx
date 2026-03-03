import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "var(--teal-darker)", height: 68,
        padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 20px rgba(0,0,0,0.2)",
      }}>
        <Link href="/">
          <Image src="/logo-white-teal.png" alt="Frugale Food Garden" width={140} height={40} style={{ objectFit: "contain", height: 40, width: "auto" }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link href="/eventi" style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Servizi</Link>
          <Link href="/eventi" style={{ padding: "9px 20px", borderRadius: 4, background: "white", color: "var(--teal-darker)", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.03em" }}>Prenota appuntamento</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "88vh", background: "var(--teal-darker)", position: "relative", overflow: "hidden", display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 30%,rgba(74,138,140,0.5) 0%,transparent 60%),radial-gradient(ellipse at 20% 70%,rgba(30,69,71,0.9) 0%,transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1100, margin: "0 auto", padding: "5rem 2rem", display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "4rem", alignItems: "center", width: "100%" }}>
          <div>
            <div className="fu" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: "1.5rem", padding: "6px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>
              🌿 Roma · Via Adolfo Marco Boroli 23
            </div>
            <h1 className="fu d1" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem,6vw,5.5rem)", fontWeight: 600, lineHeight: 1.05, color: "white", letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
              Il giardino<br />dove <em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.55)" }}>il cibo</em><br />incontra <em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.55)" }}>la natura</em>
            </h1>
            <p className="fu d2" style={{ fontSize: "1rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: "2.5rem", fontWeight: 300, maxWidth: 480 }}>
              Prenota un appuntamento con il nostro Event Manager per organizzare il tuo evento, o richiedi un sopralluogo gratuito per il tuo spazio verde a Roma.
            </p>
            <div className="fu d3" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/eventi" style={{ padding: "13px 26px", borderRadius: 4, background: "white", color: "var(--teal-darker)", fontWeight: 700, fontSize: "0.875rem", display: "inline-flex", alignItems: "center", gap: 8 }}>
                🍽 Parla con un Event Manager
              </Link>
              <Link href="/giardino" style={{ padding: "13px 26px", borderRadius: 4, border: "2px solid rgba(255,255,255,0.4)", color: "white", fontWeight: 600, fontSize: "0.875rem", display: "inline-flex", alignItems: "center", gap: 8 }}>
                🌿 Sopralluogo gratuito
              </Link>
            </div>
          </div>
          <div className="fu d2" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Prossima disponibilità", val: "Questa settimana", sub: "Slot mattina e pomeriggio" },
              { label: "Primo sopralluogo", val: "Gratuito ✓", valColor: "#7dd3a8", sub: "Senza impegno" },
            ].map(c => (
              <div key={c.label} style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "1.1rem 1.4rem", color: "white" }}>
                <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.55, marginBottom: 4 }}>{c.label}</p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 600, color: c.valColor }}>{c.val}</p>
                <p style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: 3 }}>{c.sub}</p>
              </div>
            ))}
            <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "1.1rem 1.4rem", color: "white" }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.55, marginBottom: 10 }}>I nostri servizi</p>
              <div style={{ display: "flex", gap: 8 }}>
                {[["🍽", "Catering & Eventi"], ["🌿", "Giardini & Verde"]].map(([ic, lb]) => (
                  <div key={lb} style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "1.4rem" }}>{ic}</div>
                    <div style={{ fontSize: "0.68rem", opacity: 0.75, marginTop: 4 }}>{lb}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TEXTURE STRIP */}
      <div style={{ height: 100, overflow: "hidden", position: "relative" }}>
        <img src="/texture.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.3 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,var(--cream) 0%,transparent 12%,transparent 88%,var(--cream) 100%)" }} />
      </div>

      {/* SERVICES */}
      <section style={{ padding: "5rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--teal)", marginBottom: "1rem" }}>· I nostri servizi ·</p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 600, lineHeight: 1.15, marginBottom: "3rem" }}>Cosa facciamo<br />per te</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.5rem" }}>
          {[
            { icon: "🍽", bg: "var(--teal-darker)", tag: "Cucina & Natura", title: "Eventi & Catering", desc: "Compleanni, feste private, eventi aziendali. Parlaci del tuo evento: un appuntamento con il nostro Event Manager per definire ogni dettaglio.", cta: "Parla con un Event Manager →", href: "/eventi", btnBg: "var(--teal-darker)" },
            { icon: "🌳", bg: "#f2e8dc", tag: "Giardinaggio professionale", title: "Sopralluogo gratuito", desc: "Progettiamo e curiamo giardini, terrazzi, balconi e spazi commerciali a Roma. Il primo sopralluogo è completamente gratuito e senza impegno.", cta: "Prenota sopralluogo →", href: "/giardino", btnBg: "var(--brown)" },
          ].map(s => (
            <div key={s.title} style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", background: "white" }}>
              <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4.5rem", background: s.bg }}>{s.icon}</div>
              <div style={{ padding: "1.5rem" }}>
                <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 999, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--teal-light)", color: "var(--teal-darker)", marginBottom: "0.75rem" }}>{s.tag}</span>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.7rem", fontWeight: 600, marginBottom: "0.6rem" }}>{s.title}</h3>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "0.875rem", marginBottom: "1.25rem" }}>{s.desc}</p>
                <Link href={s.href} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 20px", borderRadius: 4, background: s.btnBg, color: "white", fontWeight: 600, fontSize: "0.85rem" }}>{s.cta}</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: "var(--teal-darker)", padding: "5rem 2rem", color: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "1rem" }}>· Come funziona ·</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 600, lineHeight: 1.15, marginBottom: "3rem" }}>Tre passi verso<br />il tuo evento</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "2rem" }}>
            {[
              { n: "1", title: "Scegli data e orario", desc: "Seleziona tipo di servizio, data e fascia oraria nel nostro calendario online." },
              { n: "2", title: "Inserisci i tuoi dati", desc: "Pochi campi: nome, email, telefono e dettagli sulla tua richiesta. In meno di 2 minuti." },
              { n: "3", title: "Ricevi la conferma", desc: "Ti contatteremo entro 24 ore per confermare e personalizzare ogni dettaglio." },
            ].map(s => (
              <div key={s.n} style={{ textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 600 }}>{s.n}</div>
                <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>{s.title}</h4>
                <p style={{ fontSize: "0.85rem", opacity: 0.65, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section style={{ padding: "5rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ background: "var(--teal-darker)", borderRadius: 18, padding: "3.5rem", color: "white", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "3rem", alignItems: "center", position: "relative", overflow: "hidden" }}>
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.5, marginBottom: "0.75rem" }}>· Dove siamo ·</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2.8rem", fontWeight: 600, lineHeight: 1.1, marginBottom: "1rem" }}>Siamo<br />a Roma</h2>
            <p style={{ opacity: 0.7, lineHeight: 1.8, marginBottom: "2rem", fontSize: "0.9rem" }}>Raggiungiamo tutta la città e la prima cintura. Il nostro spazio è facilmente accessibile nel cuore di Roma.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/eventi" style={{ padding: "11px 22px", borderRadius: 4, background: "white", color: "var(--teal-darker)", fontWeight: 700, fontSize: "0.85rem" }}>Event Manager</Link>
              <Link href="/giardino" style={{ padding: "11px 22px", borderRadius: 4, border: "2px solid rgba(255,255,255,0.4)", color: "white", fontWeight: 600, fontSize: "0.85rem" }}>Sopralluogo gratuito</Link>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { ic: "📍", label: "Indirizzo", val: "Via Adolfo Marco Boroli 23, Roma" },
              { ic: "📧", label: "Email", val: "frugaleroma@gmail.com" },
              { ic: "🕐", label: "Orari", val: "Lun–Ven 9:00–19:00 · Sab 9:00–13:00" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 14px" }}>
                <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: 1 }}>{item.ic}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.82rem", marginBottom: 1 }}>{item.label}</p>
                  <p style={{ fontSize: "0.75rem", opacity: 0.6 }}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#163335", color: "rgba(255,255,255,0.6)", padding: "3rem 2rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "2rem" }}>
            <div>
              <Image src="/logo-white-teal.png" alt="Frugale" width={120} height={34} style={{ objectFit: "contain", height: 34, width: "auto", opacity: 0.8 }} />
              <p style={{ fontSize: "0.75rem", marginTop: 8, opacity: 0.45 }}>Via Adolfo Marco Boroli 23, Roma</p>
            </div>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
              <Link href="/eventi" style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8rem" }}>Prenota appuntamento</Link>
              <Link href="/giardino" style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8rem" }}>Sopralluogo</Link>
              <Link href="/staff" style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8rem" }}>Area Staff</Link>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem", fontSize: "0.72rem", opacity: 0.35 }}>
            © {new Date().getFullYear()} Frugale Food Garden · Roma
          </div>
        </div>
      </footer>

    </div>
  );
}
