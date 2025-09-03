import { api } from "@/lib/api";

export type CreateTicketOrderInput = {
  name: string;
  email: string;
  phone: string;
  designation: string;
  amount: number; // rupees
};

export type CreateTicketOrderResponse = {
  order_id: string;
  razorpay_key: string;
  amount: number; // paise
  currency: string;
  ticket_id: string;
  message: string;
};

export async function createTicketOrder(eventId: string, input: CreateTicketOrderInput) {
  const fd = new FormData();
  fd.set("name", input.name);
  fd.set("email", input.email);
  fd.set("phone", input.phone);
  fd.set("designation", input.designation);
  fd.set("amount", String(input.amount));
  const { data } = await api.post<CreateTicketOrderResponse>(`/api/tickets/events/${eventId}/buy-ticket`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function verifyPayment(razorpay_payment_id: string, razorpay_order_id: string, razorpay_signature: string) {
  const fd = new FormData();
  fd.set("razorpay_payment_id", razorpay_payment_id);
  fd.set("razorpay_order_id", razorpay_order_id);
  fd.set("razorpay_signature", razorpay_signature);
  const { data } = await api.post<{ status: string; message: string }>(`/api/tickets/verify-payment`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
