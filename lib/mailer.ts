import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT ?? 587),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

interface OrderConfirmationOptions {
  to: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  items: OrderItem[];
  total: number;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryDistrict: string;
  deliveryMode: string;
  deliverySlot: string;
  notes?: string;
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

function deliveryModeLabel(mode: string) {
  if (mode === "express") return "Livraison express";
  if (mode === "relay") return "Point relais";
  return "Livraison standard";
}

function deliverySlotLabel(slot: string) {
  if (slot === "morning") return "Matin (8h - 12h)";
  if (slot === "afternoon") return "Après-midi (12h - 17h)";
  if (slot === "evening") return "Soir (17h - 20h)";
  return slot;
}

function itemsTableRows(items: OrderItem[]) {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #E8E8E3;font-size:14px;">${item.name}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #E8E8E3;text-align:center;font-size:14px;">${item.quantity}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #E8E8E3;text-align:right;font-size:14px;white-space:nowrap;">${formatPrice(item.unitPrice)}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #E8E8E3;text-align:right;font-size:14px;font-weight:600;white-space:nowrap;">${formatPrice(item.unitPrice * item.quantity)}</td>
      </tr>`
    )
    .join("");
}

// ─── Mail client : confirmation de commande ───────────────────────────────────

export async function sendOrderConfirmation(opts: OrderConfirmationOptions) {
  const { to, orderNumber, firstName, lastName, items, total, deliveryAddress, deliveryCity, deliveryMode } = opts;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F4F4F1;font-family:Arial,sans-serif;color:#111210;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F1;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:#111210;padding:28px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:-0.5px;">Vitalis Home and Wellness</h1>
            <p style="margin:6px 0 0;color:#9CA3AF;font-size:13px;">Confirmation de commande</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="font-size:16px;margin:0 0 8px;">Bonjour <strong>${firstName} ${lastName}</strong>,</p>
            <p style="color:#6B7280;margin:0 0 24px;font-size:14px;">Votre commande a bien été enregistrée. Nous vous contacterons prochainement pour confirmer la livraison.</p>

            <div style="background:#F4F4F1;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0;font-size:12px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Numéro de commande</p>
              <p style="margin:6px 0 0;font-size:20px;font-weight:700;letter-spacing:1px;">${orderNumber}</p>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8E8E3;border-radius:12px;overflow:hidden;margin-bottom:24px;">
              <thead>
                <tr style="background:#F4F4F1;">
                  <th style="text-align:left;padding:10px 14px;font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Article</th>
                  <th style="text-align:center;padding:10px 14px;font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Qté</th>
                  <th style="text-align:right;padding:10px 14px;font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Prix unit.</th>
                  <th style="text-align:right;padding:10px 14px;font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Sous-total</th>
                </tr>
              </thead>
              <tbody>${itemsTableRows(items)}</tbody>
              <tfoot>
                <tr style="background:#F4F4F1;">
                  <td colspan="3" style="padding:12px 14px;font-weight:700;font-size:14px;">Total</td>
                  <td style="padding:12px 14px;font-weight:700;font-size:16px;text-align:right;color:#111210;white-space:nowrap;">${formatPrice(total)}</td>
                </tr>
              </tfoot>
            </table>

            <div style="border:1px solid #E8E8E3;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">Livraison</p>
              <p style="margin:0;font-size:14px;font-weight:600;">${deliveryModeLabel(deliveryMode)}</p>
              <p style="margin:4px 0 0;font-size:14px;color:#6B7280;">${deliveryAddress}, ${deliveryCity}</p>
            </div>

            <p style="font-size:13px;color:#9CA3AF;margin:0;">
              Des questions ? Contactez-nous à <a href="mailto:${process.env.MAIL_USER}" style="color:#111210;">${process.env.MAIL_USER}</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#F4F4F1;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9CA3AF;">© ${new Date().getFullYear()} Vitalis Home and Wellness — Douala, Cameroun</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `Confirmation de commande #${orderNumber} — Vitalis Home and Wellness`,
    html,
  });
}

// ─── Mail admin : nouvelle commande reçue ─────────────────────────────────────

export async function sendAdminOrderNotification(opts: OrderConfirmationOptions) {
  const {
    orderNumber, firstName, lastName, email, phone,
    items, total, deliveryAddress, deliveryCity, deliveryDistrict,
    deliveryMode, deliverySlot, notes,
  } = opts;

  const adminEmail = process.env.MAIL_ADMIN ?? process.env.MAIL_USER ?? "";

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F0F0ED;font-family:Arial,sans-serif;color:#111210;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F0ED;padding:32px 0;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:620px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#111210;padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:28px 32px;">
                  <p style="margin:0;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Vitalis Home and Wellness</p>
                  <h1 style="margin:6px 0 0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Nouvelle commande</h1>
                </td>
                <td style="padding:28px 32px;text-align:right;vertical-align:top;">
                  <div style="background:#1F2937;border-radius:10px;padding:10px 16px;display:inline-block;">
                    <p style="margin:0;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">Référence</p>
                    <p style="margin:4px 0 0;color:#ffffff;font-size:16px;font-weight:700;letter-spacing:1px;">${orderNumber}</p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Alert band -->
        <tr>
          <td style="background:#1D4ED8;padding:12px 32px;">
            <p style="margin:0;color:#ffffff;font-size:13px;font-weight:600;">
              Une nouvelle commande a été passée — traitez-la dans les meilleurs délais.
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">

            <!-- Section : Client -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="padding-bottom:12px;border-bottom:2px solid #111210;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#111210;text-transform:uppercase;letter-spacing:1px;">Informations client</p>
                </td>
              </tr>
              <tr>
                <td style="padding-top:16px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:50%;padding-bottom:12px;vertical-align:top;">
                        <p style="margin:0;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Nom complet</p>
                        <p style="margin:4px 0 0;font-size:15px;font-weight:600;">${firstName} ${lastName}</p>
                      </td>
                      <td style="width:50%;padding-bottom:12px;vertical-align:top;">
                        <p style="margin:0;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Téléphone</p>
                        <p style="margin:4px 0 0;font-size:15px;font-weight:600;">
                          <a href="tel:${phone}" style="color:#111210;text-decoration:none;">${phone}</a>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding-bottom:4px;">
                        <p style="margin:0;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Adresse email</p>
                        <p style="margin:4px 0 0;font-size:14px;">
                          <a href="mailto:${email}" style="color:#1D4ED8;text-decoration:none;">${email}</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Section : Produits commandés -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="padding-bottom:12px;border-bottom:2px solid #111210;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#111210;text-transform:uppercase;letter-spacing:1px;">Produits commandés</p>
                </td>
              </tr>
              <tr>
                <td style="padding-top:16px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8E8E3;border-radius:10px;overflow:hidden;">
                    <thead>
                      <tr style="background:#F4F4F1;">
                        <th style="text-align:left;padding:10px 14px;font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Désignation</th>
                        <th style="text-align:center;padding:10px 14px;font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Qté</th>
                        <th style="text-align:right;padding:10px 14px;font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">P.U.</th>
                        <th style="text-align:right;padding:10px 14px;font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Montant</th>
                      </tr>
                    </thead>
                    <tbody>${itemsTableRows(items)}</tbody>
                    <tfoot>
                      <tr style="background:#111210;">
                        <td colspan="3" style="padding:14px;font-weight:700;font-size:14px;color:#ffffff;">Total à encaisser</td>
                        <td style="padding:14px;font-weight:700;font-size:18px;text-align:right;color:#ffffff;white-space:nowrap;">${formatPrice(total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Section : Livraison -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:${notes ? "28px" : "0"};">
              <tr>
                <td style="padding-bottom:12px;border-bottom:2px solid #111210;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#111210;text-transform:uppercase;letter-spacing:1px;">Informations de livraison</p>
                </td>
              </tr>
              <tr>
                <td style="padding-top:16px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:50%;padding-bottom:12px;vertical-align:top;">
                        <p style="margin:0;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Mode</p>
                        <p style="margin:4px 0 0;font-size:14px;font-weight:600;">${deliveryModeLabel(deliveryMode)}</p>
                      </td>
                      <td style="width:50%;padding-bottom:12px;vertical-align:top;">
                        <p style="margin:0;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Créneau</p>
                        <p style="margin:4px 0 0;font-size:14px;font-weight:600;">${deliverySlotLabel(deliverySlot)}</p>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2">
                        <p style="margin:0;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Adresse</p>
                        <p style="margin:4px 0 0;font-size:14px;">${deliveryAddress}, ${deliveryDistrict}, ${deliveryCity}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            ${notes ? `
            <!-- Section : Notes -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:12px;border-bottom:2px solid #111210;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#111210;text-transform:uppercase;letter-spacing:1px;">Notes du client</p>
                </td>
              </tr>
              <tr>
                <td style="padding-top:16px;">
                  <div style="background:#FFFBEB;border-left:3px solid #F59E0B;border-radius:0 8px 8px 0;padding:14px 16px;">
                    <p style="margin:0;font-size:14px;color:#92400E;font-style:italic;">${notes}</p>
                  </div>
                </td>
              </tr>
            </table>
            ` : ""}

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F4F4F1;padding:20px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;font-size:12px;color:#9CA3AF;">Notification interne — Vitalis Home and Wellness</p>
                  <p style="margin:2px 0 0;font-size:12px;color:#9CA3AF;">© ${new Date().getFullYear()} — Douala, Cameroun</p>
                </td>
                <td style="text-align:right;">
                  <p style="margin:0;font-size:11px;color:#D1D5DB;">${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: adminEmail,
    subject: `[Nouvelle commande] #${orderNumber} — ${firstName} ${lastName} — ${formatPrice(total)}`,
    html,
  });
}
