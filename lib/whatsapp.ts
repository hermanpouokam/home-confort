interface WhatsAppOrderPayload {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  createdAt: Date;
}

export async function sendOrderNotification(payload: WhatsAppOrderPayload): Promise<void> {
  const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER;
  const apiToken = process.env.WHATSAPP_API_TOKEN;

  if (!adminNumber || !apiToken) {
    console.warn("WhatsApp credentials not configured, skipping notification.");
    return;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://homeconfort.com";

  const date = payload.createdAt.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = payload.createdAt.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const message = `🛒 *Nouvelle commande Vitalis Home and Wellness !*
📦 Commande : *#${payload.orderNumber}*
⏰ Reçue le : ${date} à ${time}

👤 Client : ${payload.customerName}
📞 Téléphone : ${payload.customerPhone}

Connectez-vous au dashboard pour traiter cette commande.
🔗 ${siteUrl}/admin/orders/${payload.orderNumber}`;

  // Try 360dialog API first
  if (apiToken.startsWith("360_")) {
    await send360Dialog(adminNumber, message, apiToken);
    return;
  }

  // Fallback to Twilio
  await sendTwilio(adminNumber, message, apiToken);
}

async function send360Dialog(to: string, message: string, token: string): Promise<void> {
  const response = await fetch("https://waba.360dialog.io/v1/messages", {
    method: "POST",
    headers: {
      "D360-API-KEY": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient_type: "individual",
      to,
      type: "text",
      text: { body: message },
    }),
  });

  if (!response.ok) {
    console.error("360dialog WhatsApp error:", await response.text());
  }
}

async function sendTwilio(to: string, message: string, token: string): Promise<void> {
  const [accountSid, authToken] = token.split(":");
  if (!accountSid || !authToken) {
    console.error("Invalid Twilio token format. Expected: accountSid:authToken");
    return;
  }

  const fromNumber = "whatsapp:+14155238886"; // Twilio sandbox number
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const body = new URLSearchParams({
    From: fromNumber,
    To: `whatsapp:${to}`,
    Body: message,
  });

  const response = await fetch(twilioUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    console.error("Twilio WhatsApp error:", await response.text());
  }
}
