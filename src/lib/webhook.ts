type WebhookEvent = "nuova_prenotazione_evento" | "nuovo_sopralluogo_giardino" | "cambio_stato" | "cancellazione_cliente" | "test_connection";

export async function triggerWebhook(event: WebhookEvent, data: Record<string, any>) {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, timestamp: new Date().toISOString(), source: "frugale-food-garden", data }),
    });
  } catch (e) {
    console.error("Webhook error:", e);
  }
}
