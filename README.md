# Frugale Food Garden — Web App

App Next.js completa con sistema di prenotazioni eventi, sopralluoghi giardinaggio, area staff e integrazione webhook n8n.

## Stack
- **Next.js 15** (App Router)
- **PostgreSQL** via Supabase
- **Vercel** per il deploy
- **n8n** per automazioni webhook

## Deploy su Vercel (passo per passo)

### 1. Carica su GitHub

```bash
# Dalla cartella del progetto
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/frugale-food-garden.git
git push -u origin main
```

### 2. Configura le variabili su Vercel

Vai su vercel.com → New Project → importa il repo GitHub.

Prima di fare deploy, vai su **Settings → Environment Variables** e aggiungi:

| Nome | Valore |
|------|--------|
| `DATABASE_URL` | `postgresql://postgres:Ux%23FgC32n-4-r5k@db.hdudmxcnvghzeauaizki.supabase.co:5432/postgres` |
| `STAFF_PASSWORD` | la password che scegli per lo staff (es. `frugale2026`) |
| `STAFF_SECRET` | una stringa random (es. `abc123xyz789...`) — minimo 32 caratteri |
| `N8N_WEBHOOK_URL` | `https://frugalefoodgarden.app.n8n.cloud/webhook-test/3971d34d-51ba-4364-a9d9-78ad3b35d88d` |
| `NEXT_PUBLIC_APP_URL` | il tuo dominio Vercel (es. `https://frugale-food-garden.vercel.app`) |

### 3. Deploy

Clicca **Deploy** su Vercel. Al primo deploy, visita:

```
https://TUO-DOMINIO.vercel.app/api/init
```

Questo crea le tabelle nel database. Dovresti vedere: `{"ok":true,"message":"Database initialized"}`

### 4. Test

- **Sito pubblico**: `https://TUO-DOMINIO.vercel.app`
- **Prenota evento**: `/eventi`
- **Prenota sopralluogo**: `/giardino`
- **Area staff**: `/staff` → password: quella impostata in `STAFF_PASSWORD`

## Struttura

```
src/
  app/
    page.tsx              # Homepage
    eventi/page.tsx       # Form prenotazione eventi
    giardino/page.tsx     # Form sopralluogo
    staff/page.tsx        # Dashboard staff
    api/
      auth/route.ts       # Login/logout staff
      init/route.ts       # Inizializzazione DB
      bookings/
        events/route.ts   # API prenotazioni eventi
        garden/route.ts   # API sopralluoghi
      availability/route.ts # Slot e schedule settimanale
      staff/stats/route.ts  # Statistiche
      webhook/test/route.ts # Test n8n
  components/
    BookingForm.tsx        # Form pubblico (eventi + giardino)
    StaffDashboard.tsx     # Dashboard staff completa
  lib/
    db.ts                  # Connessione PostgreSQL
    auth.ts                # Auth staff con cookie
    webhook.ts             # Trigger n8n
    slots.ts               # Generazione slot disponibili
```

## Webhook n8n

Ogni evento trigger invia a n8n un payload JSON:

```json
{
  "event": "nuova_prenotazione_evento",
  "timestamp": "2026-03-03T14:30:00Z",
  "source": "frugale-food-garden",
  "data": { ... }
}
```

**Eventi supportati:**
- `nuova_prenotazione_evento` — quando un cliente prenota un evento
- `nuovo_sopralluogo_giardino` — quando un cliente prenota un sopralluogo
- `cambio_stato` — quando lo staff cambia stato (pending/confirmed/cancelled/completed)
- `cancellazione_cliente` — quando un cliente annulla tramite token
