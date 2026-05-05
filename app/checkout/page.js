"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckOutForm from "@/components/CheckOutForm.jsx";
import { useSelector } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import axios from "axios";

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

export default function CheckoutPage() {
  const { cartItems } = useSelector((state) => state.cart);
  const total = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 0),
    0
  );
  const totalCents = Math.round(total * 100);
  const [clientSecret, setClientSecret] = useState("");
  const [isStripeIntentLoading, setIsStripeIntentLoading] = useState(false);
  const [stripeIntentError, setStripeIntentError] = useState("");
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (!stripePromise) {
      return;
    }

    if (totalCents <= 0) {
      setClientSecret("");
      setIsStripeIntentLoading(false);
      setStripeIntentError("");
      return;
    }

    async function createPaymentIntent() {
      setIsStripeIntentLoading(true);
      setStripeIntentError("");
      setClientSecret("");
      try {
        const { data } = await axios.post(
          "/api/create-payment-intent",
          { amount: totalCents, currency: "cad" },
          { headers: { "Content-Type": "application/json" } }
        );

        if (!cancelled) {
          setClientSecret(data.clientSecret);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err.response?.data?.error ||
            err.response?.data?.message ||
            err.message ||
            "Unable to start payment. Please try again.";
          setStripeIntentError(message);
          setClientSecret("");
        }
      } finally {
        if (!cancelled) {
          setIsStripeIntentLoading(false);
        }
      }
    }

    createPaymentIntent();

    return () => {
      cancelled = true;
    };
  }, [totalCents, retryNonce]);

  const appearance = useMemo(() => ({ theme: "stripe" }), []);

  const elementsOptions = clientSecret
    ? { clientSecret, appearance }
    : null;

  return (
    <div className="flex flex-col gap-4 max-w-[500px] mx-auto my-5">
      {totalCents <= 0 && (
        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-800">
          Your cart is empty.{" "}
          <Link href="/cart" className="underline font-medium">
            Return to cart
          </Link>{" "}
          to add items before checkout.
        </div>
      )}

      {totalCents > 0 && !stripePromise && (
        <p className="text-sm text-red-600">
          Stripe could not be initialized. Check your publishable key
          configuration.
        </p>
      )}

      {totalCents > 0 && stripeIntentError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p className="mb-2">{stripeIntentError}</p>
          <button
            type="button"
            onClick={() => setRetryNonce((n) => n + 1)}
            className="text-sm font-medium underline"
          >
            Try again
          </button>
        </div>
      )}

      {totalCents > 0 && isStripeIntentLoading && (
        <p className="text-sm text-neutral-600">Preparing secure checkout…</p>
      )}

      {stripePromise && elementsOptions && (
        <Elements
          key={elementsOptions.clientSecret}
          stripe={stripePromise}
          options={elementsOptions}
        >
          <CheckOutForm clientSecret={clientSecret} cartItems={cartItems} />
        </Elements>
      )}
    </div>
  );
}
