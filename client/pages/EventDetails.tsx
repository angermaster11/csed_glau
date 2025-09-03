import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { loadRazorpay, openRazorpayCheckout } from "@/lib/razorpay";
import type { ConfirmPaymentRequest, CreateOrderRequest, CreateOrderResponse, Ticket } from "@shared/api";
import { sampleEvents } from "@/components/sections/EventsPreview";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const event = useMemo(() => sampleEvents.find((e) => e.id === id) ?? sampleEvents[0], [id]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRazorpay().catch(() => setError("Unable to load Razorpay SDK"));
  }, []);

  const handleBuy = async () => {
    try {
      setLoading(true);
      setError(null);

      const body: CreateOrderRequest = {
        amount: event.price,
        currency: "INR",
        notes: { eventId: event.id },
      };
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as CreateOrderResponse | { error: string };
      if (!res.ok || (json as any).error) {
        throw new Error((json as any).error || "Order creation failed");
      }
      const order = json as CreateOrderResponse;

      openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "CSED Club",
        description: event.title,
        order_id: order.id,
        prefill: { name, email },
        theme: { color: "#4f46e5" },
        handler: async (response) => {
          try {
            const payload: ConfirmPaymentRequest = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email,
              name,
              event: { id: event.id, title: event.title, date: event.date, price: event.price },
            };
            const confirmRes = await fetch("/api/razorpay/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const data = (await confirmRes.json()) as { ok?: boolean; ticket?: Ticket; error?: string };
            if (!confirmRes.ok || !data.ok || !data.ticket) throw new Error(data.error || "Confirmation failed");
            setTicket(data.ticket);
          } catch (e: any) {
            setError(e.message);
          } finally {
            setLoading(false);
          }
        },
      });
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-xl overflow-hidden border bg-card">
            <img src={event.image} alt={event.title} className="w-full aspect-[16/8] object-cover" />
            <div className="p-6">
              <div className="text-xs uppercase tracking-wider text-indigo-600 font-semibold">{new Date(event.date).toLocaleString()}</div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold">{event.title}</h1>
              <p className="mt-3 text-muted-foreground">{event.summary}</p>
            </div>
          </div>
        </div>
        <div>
          <div className="rounded-xl border p-6 sticky top-24">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ticket price</span>
              <span className="font-bold">₹{(event.price / 100).toFixed(2)}</span>
            </div>
            <div className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-md border bg-background px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-md border bg-background px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                onClick={handleBuy}
                disabled={loading || !name || !email}
                className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {loading ? "Processing..." : "Buy ticket"}
              </button>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            {ticket && (
              <div className="mt-8 rounded-lg border bg-card p-4">
                <div className="text-xs uppercase tracking-wider text-green-600 font-semibold">Purchase successful</div>
                <h3 className="mt-1 font-semibold">Your Ticket</h3>
                <div className="mt-3 text-sm">
                  <div className="flex items-center justify-between"><span>Ticket ID</span><span className="font-mono">{ticket.id}</span></div>
                  <div className="flex items-center justify-between mt-1"><span>Event</span><span>{ticket.event.title}</span></div>
                  <div className="flex items-center justify-between mt-1"><span>Date</span><span>{new Date(ticket.event.date).toLocaleString()}</span></div>
                  <div className="flex items-center justify-between mt-1"><span>Payment</span><span className="font-mono">{ticket.payment.id}</span></div>
                </div>
                <button onClick={() => window.print()} className="mt-4 w-full rounded-md border px-4 py-2 hover:bg-accent">Download / Print</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
