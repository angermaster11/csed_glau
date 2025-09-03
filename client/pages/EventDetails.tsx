import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchEvent, type ApiEvent } from "@/lib/eventsApi";
import { useToast } from "@/hooks/use-toast";
import { loadRazorpay, openRazorpayCheckout } from "@/lib/razorpay";
import { createTicketOrder, verifyPayment } from "@/lib/ticketsApi";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data, isLoading, error, refetch } = useQuery<ApiEvent>({
    queryKey: ["event", id],
    queryFn: () => fetchEvent(id as string),
    enabled: Boolean(id),
  });

  const [buyer, setBuyer] = useState({ name: "", email: "", phone: "", designation: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) refetch();
    loadRazorpay().catch(() => {});
  }, [id, refetch]);

  if (isLoading) return <div className="container mx-auto py-12">Loading...</div>;
  if (error || !data) return <div className="container mx-auto py-12">Event not found</div>;

  const event = data;

  const handleBook = async () => {
    if (!buyer.name || !buyer.email) {
      toast({ title: "Please fill name and email", variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      const rupees = (event as any).amount ? Math.max(1, Number((event as any).amount)) : 1;
      const order = await createTicketOrder(event._id, {
        name: buyer.name,
        email: buyer.email,
        phone: buyer.phone,
        designation: buyer.designation,
        amount: rupees,
      });

      openRazorpayCheckout({
        key: order.razorpay_key,
        amount: order.amount,
        currency: order.currency,
        name: "CSED Club",
        description: event.title,
        order_id: order.order_id,
        prefill: { name: buyer.name, email: buyer.email, contact: buyer.phone },
        theme: { color: "#4f46e5" },
        handler: async (resp) => {
          try {
            const result = await verifyPayment(resp.razorpay_payment_id, resp.razorpay_order_id, resp.razorpay_signature);
            toast({ title: "Payment success", description: result.message });
            setBuyer({ name: "", email: "", phone: "", designation: "" });
          } catch (e: any) {
            toast({ title: "Verification failed", description: e?.message || "Try again", variant: "destructive" });
          } finally {
            setSubmitting(false);
          }
        },
      });
    } catch (e: any) {
      toast({ title: "Booking failed", description: e?.response?.data?.detail || e?.message || "Try again", variant: "destructive" });
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-xl overflow-hidden border bg-card">
            {event.banner && (
              <img
                src={event.banner}
                alt={event.title}
                className="w-full aspect-[16/8] object-cover"
              />
            )}
            <div className="p-6">
              <div className="text-xs uppercase tracking-wider text-indigo-600 font-semibold">
                {`${event.date} ${event.time}`}
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold">
                {event.title}
              </h1>
              <p className="mt-3 text-muted-foreground">{event.summary}</p>
              <div className="mt-4 text-sm text-muted-foreground">
                <div>Venue: {event.venue}</div>
                <div>Category: {event.category}</div>
                <div>Status: {event.status}</div>
                <div>Capacity: {event.capacity}</div>
                <div>Price: ₹{(event as any).amount ?? 0}</div>
              </div>
              <div className="mt-6 prose prose-sm dark:prose-invert">
                <p>{event.description}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border p-6 sticky top-24">
            <h3 className="font-semibold">Book this event</h3>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Full name" value={buyer.name} onChange={(e) => setBuyer({ ...buyer, name: e.target.value })} />
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Email" type="email" value={buyer.email} onChange={(e) => setBuyer({ ...buyer, email: e.target.value })} />
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Phone" value={buyer.phone} onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })} />
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Designation" value={buyer.designation} onChange={(e) => setBuyer({ ...buyer, designation: e.target.value })} />
              <button onClick={handleBook} disabled={submitting} className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                {submitting ? "Booking..." : "Book"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border p-6">
            <h3 className="font-semibold">Speakers</h3>
            <div className="mt-4 grid gap-4">
              {(event.speakers || []).map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  {s.image && (
                    <img src={s.image} alt={s.name} className="h-12 w-12 rounded-full object-cover border" />
                  )}
                  <div>
                    <div className="font-medium leading-tight">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.title} • {s.company}</div>
                  </div>
                </div>
              ))}
              {(!event.speakers || event.speakers.length === 0) && (
                <div className="text-sm text-muted-foreground">No speakers added.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
