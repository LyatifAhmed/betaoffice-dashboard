// pages/success.tsx
import { useEffect } from "react";

export default function SuccessPage() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const priceId = urlParams.get("price_id");
    if (priceId) {
      localStorage.setItem("stripe_price_id", priceId);
    }
  }, []);

  return <h1>Thank you for your payment!</h1>;
}


  