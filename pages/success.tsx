// pages/success.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");

    if (sessionId) {
      axios.post("https://hoxton-api-backend.onrender.com/api/create-token", { session_id: sessionId })
        .then((res) => {
          const { token, price_id } = res.data;
    
          if (price_id) {
            localStorage.setItem("stripe_price_id", price_id);
    
            if (price_id === "price_1RBKvBACVQjWBIYus7IRSyEt") {
              localStorage.setItem("hoxton_product_id", "2736");
            } else if (price_id === "price_1RBKvlACVQjWBIYuVs4Of01v") {
              localStorage.setItem("hoxton_product_id", "2737");
            }
          }
    
          if (token) {
            router.push(`/kyc?token=${token}`);
          }
        })
        .catch((err) => {
          console.error("Failed to create KYC token:", err);
        });
    }
    
  }, [router]);

  return (
    <div className="text-center mt-20">
      <h1 className="text-2xl font-bold">Processing your payment...</h1>
      <p className="mt-4 text-gray-600">You’ll be redirected shortly.</p>
    </div>
  );
}



  