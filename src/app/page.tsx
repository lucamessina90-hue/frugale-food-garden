import Link from "next/link";

export default function HomePage() {
  return (
    <div className="organic-bg" style={{ minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(249,247,242,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", padding: "0 1.5rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700 }}>Frugale Food Garden</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/eventi" className="btn-outline" style={{ fontSize: "0.82rem", padding: "7px 14px" }}>Prenota evento</Link>
          <Link href="/giardino" className="btn-outline" style={{ fontSize: "0.82rem", padding: "7px 14px" }}>Sopralluogo</Link>
          <Link href="/staff" style={{ fontSize: "0.78rem", color: "var(--muted-fg)" }}>Staff</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "6rem 1.5rem 4rem", textAlign: "center" }} className="fade-in">
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "999px", background: "var(--accent)", color: "var(--accent-fg)", fontSize: "0.82rem", fontWeight: 600, marginBottom: "1.5rem" }}>
          🌿 Natura, sapori e cura del verde
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: "1.25rem", color: "var(--fg)" }}>
          Il tuo spazio verde<br />
          <span style={{ color: "var(--primary)" }}>a Milano</span>
        </h1>
        <p style={{ fontSize: "1.1rem", color: "var(--muted-fg)", maxWidth: 560, margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
          Organizziamo eventi indimenticabili immersi nella natura e offriamo sopralluoghi professionali per trasformare il tuo giardino o terrazzo.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/eventi" className="btn-primary" style={{ fontSize: "1rem", padding: "14px 28px" }}>
            🍽 Prenota un evento
          </Link>
          <Link href="/giardino" className="btn-primary" style={{ fontSize: "1rem", padding: "14px 28px", background: "var(--secondary-fg)" }}>
            🌿 Prenota sopralluogo
          </Link>
        </div>
      </section>

      {/* Services */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {[
            { icon: "🍽", tag: "Cucina & Natura", title: "Eventi & Catering", desc: "Compleanni, feste private, eventi aziendali. Cucina biologica stagionale immersa nel verde, con allestimenti personalizzati.", href: "/eventi", cta: "Prenota un evento" },
            { icon: "🌿", tag: "Giardinaggio Professionale", title: "Sopralluogo Gratuito", desc: "Progettiamo e curiamo giardini, terrazzi, balconi e spazi commerciali. Primo sopralluogo senza impegno.", href: "/giardino", cta: "Prenota sopralluogo" },
          ].map(s => (
            <div key={s.title} className="card" style={{ display: "flex", flexDirection: "column", transition: "box-shadow 0.2s, transform 0.2s" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{s.icon}</div>
              <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700, background: "var(--accent)", color: "var(--accent-fg)", marginBottom: "0.75rem", width: "fit-content" }}>{s.tag}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>{s.title}</h3>
              <p style={{ color: "var(--muted-fg)", fontSize: "0.9rem", lineHeight: 1.7, flex: 1, marginBottom: "1.5rem" }}>{s.desc}</p>
              <Link href={s.href} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>{s.cta} →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, marginBottom: "0.75rem" }}>Come funziona</h2>
          <p style={{ color: "var(--muted-fg)", marginBottom: "3rem" }}>Tre semplici passi per il tuo evento o sopralluogo</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2rem" }}>
            {[
              { n: "1", icon: "📅", title: "Scegli data e orario", desc: "Seleziona il tipo di servizio, la data preferita e la fascia oraria disponibile." },
              { n: "2", icon: "📝", title: "Inserisci i tuoi dati", desc: "Pochi campi: nome, email, telefono e dettagli sulla tua richiesta." },
              { n: "3", icon: "✅", title: "Ricevi la conferma", desc: "Ti contatteremo entro 24 ore per confermare e personalizzare i dettagli." },
            ].map(s => (
              <div key={s.n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700 }}>{s.n}</div>
                <div style={{ fontSize: "2rem" }}>{s.icon}</div>
                <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700 }}>{s.title}</h4>
                <p style={{ color: "var(--muted-fg)", fontSize: "0.875rem", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "4rem 1.5rem", textAlign: "center" }}>
        <div style={{ background: "var(--primary)", borderRadius: "1.5rem", padding: "3rem 2rem", color: "var(--primary-fg)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📍</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, marginBottom: "0.75rem" }}>Dove siamo</h2>
          <p style={{ opacity: 0.85, marginBottom: "1.5rem", lineHeight: 1.7 }}>
            Siamo a Milano e dintorni.<br />
            Raggiungiamo tutta la città e la prima cintura.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/eventi" style={{ padding: "12px 24px", borderRadius: "0.75rem", background: "white", color: "var(--primary)", fontWeight: 700, fontSize: "0.9rem" }}>Prenota evento</Link>
            <Link href="/giardino" style={{ padding: "12px 24px", borderRadius: "0.75rem", border: "2px solid rgba(255,255,255,0.5)", color: "white", fontWeight: 700, fontSize: "0.9rem" }}>Prenota sopralluogo</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "2rem 1.5rem", textAlign: "center", color: "var(--muted-fg)", fontSize: "0.82rem" }}>
        <p>© {new Date().getFullYear()} Frugale Food Garden · Milano</p>
        <p style={{ marginTop: "4px" }}>
          <Link href="/staff" style={{ color: "var(--muted-fg)" }}>Area Staff</Link>
        </p>
      </footer>
    </div>
  );
}
