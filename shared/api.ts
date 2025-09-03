/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Payments
export interface CreateOrderRequest {
  amount: number; // in paise
  currency: string; // INR
  receipt?: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  keyId: string;
}

export interface ConfirmPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  email: string;
  name: string;
  event: { id: string; title: string; date: string; price: number };
}

export interface Ticket {
  id: string;
  event: { id: string; title: string; date: string; price: number };
  purchaser: { name: string; email: string };
  payment: { id: string; orderId: string };
  issuedAt: string;
}
