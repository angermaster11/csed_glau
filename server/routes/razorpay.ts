import type { RequestHandler } from "express";
import crypto from "crypto";

// Utility: Create an order via Razorpay REST API using key_id/key_secret Basic Auth
async function createRazorpayOrder(params: {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error(
      "RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET environment variables are required",
    );
  }

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      receipt: params.receipt,
      notes: params.notes ?? {},
      payment_capture: 1,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create order: ${res.status} ${text}`);
  }

  const data = (await res.json()) as {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
  };

  return { ...data, keyId };
}

export const handleCreateOrder: RequestHandler = async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body as {
      amount: number;
      currency: string;
      receipt?: string;
      notes?: Record<string, string>;
    };

    if (!amount || !currency) {
      return res
        .status(400)
        .json({ error: "amount and currency are required" });
    }

    const order = await createRazorpayOrder({
      amount,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes,
    });

    res.status(200).json(order);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to create order" });
  }
};

function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  keySecret: string,
) {
  const hmac = crypto.createHmac("sha256", keySecret);
  hmac.update(`${orderId}|${paymentId}`);
  const digest = hmac.digest("hex");
  return digest === signature;
}

export const handleConfirmPayment: RequestHandler = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, name, event } =
      req.body as {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        email: string;
        name: string;
        event: { id: string; title: string; date: string; price: number };
      };

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res
        .status(500)
        .json({ error: "Missing RAZORPAY_KEY_SECRET on server" });
    }

    const valid = verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret,
    );

    if (!valid) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // Generate a simple ticket
    const ticketId = `TICKET-${razorpay_order_id}-${Date.now()}`;
    const ticket = {
      id: ticketId,
      event,
      purchaser: { name, email },
      payment: { id: razorpay_payment_id, orderId: razorpay_order_id },
      issuedAt: new Date().toISOString(),
    };

    // Optionally email the ticket if SMTP env provided
    try {
      const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } =
        process.env as Record<string, string>;
      if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM) {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: Number(SMTP_PORT),
          secure: Number(SMTP_PORT) === 465,
          auth: { user: SMTP_USER, pass: SMTP_PASS },
        });
        const html = `
          <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
            <h2>Your CSED Club Ticket</h2>
            <p>Hi ${name},</p>
            <p>Thanks for your purchase. Here are your ticket details:</p>
            <ul>
              <li><strong>Ticket ID:</strong> ${ticketId}</li>
              <li><strong>Event:</strong> ${event.title}</li>
              <li><strong>Date:</strong> ${event.date}</li>
              <li><strong>Amount:</strong> ₹${(event.price / 100).toFixed(2)}</li>
            </ul>
            <p>Payment ID: ${razorpay_payment_id}</p>
          </div>
        `;
        await transporter.sendMail({
          from: SMTP_FROM,
          to: email,
          subject: `Your ticket for ${event.title}`,
          html,
        });
      }
    } catch (e) {
      // Swallow email errors to not block payment confirmation, but return info
      console.warn("Email send failed:", (e as any)?.message);
    }

    res.status(200).json({ ok: true, ticket });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Payment confirmation failed" });
  }
};
