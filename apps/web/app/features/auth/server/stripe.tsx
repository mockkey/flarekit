import Stripe from "stripe";

export function StripeClient(key: string) {
  return new Stripe(key);
}
