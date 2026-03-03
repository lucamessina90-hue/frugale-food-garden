const N8N_URL = process.env.N8N_WEBHOOK_URL ?? "";

export type WebhookEvent =
  | "nuova_prenotazione_evento"
  | "nuovo_sopralluogo_giardino"
  | "cambio_stato"
  | "cancellazione_cliente";

export async function triggerWebhook(event: WebhookEvent, data: Record<string, any>) {
  if (!N8N_URL) return;
  try {
    await fetch(N8N_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        source: "frugale-food-garden",
        data,
      }),
    });
  } catch (err) {
    console.warn("[webhook] n8n unreachable:", err);
  }
}
