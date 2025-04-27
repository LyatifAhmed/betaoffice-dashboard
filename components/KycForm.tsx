"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Select from "react-select";
import countryList from "react-select-country-list";

interface Props {
  lockedProductId: number;
  selectedPlanLabel: string;
  couponCode: string;
  discountedPrice: number; // ✅ added here
}

interface Owner {
  first_name: string;
  last_name: string;
  email: string;
}

const businessTypes = [
  { value: '1', label: 'Limited company (LTD, LP, LLP, LLC, Corp)' },
  { value: '13', label: 'Association, club or society' },
  { value: '10', label: 'Charity / non-profit' },
  { value: '3', label: 'Individual / sole trader' },
  { value: '12', label: 'Trust, foundation or fund' },
  { value: '9', label: 'Unincorporated / not yet registered' },
];

export default function KycForm({ lockedProductId, selectedPlanLabel, couponCode, discountedPrice }: Props) {
  const [formData, setFormData] = useState({
    company_name: '',
    trading_name: '',
    organisation_type: '',
    limited_company_number: '',
    email: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    postcode: '',
    country: '',
    phone_number: '',
    customer_first_name: '',
    customer_last_name: '',
  });

  const [owners, setOwners] = useState<Owner[]>([
    { first_name: '', last_name: '', email: '' },
  ]);

  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const countries = countryList().getData();
  const router = useRouter();
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateOwner = (index: number, field: string, value: string) => {
    const updated = [...owners];
    (updated[index] as any)[field] = value;
    setOwners(updated);
  };

  const addOwner = () => {
    setOwners((prev) => [...prev, { first_name: '', last_name: '', email: '' }]);
  };

  const removeOwner = (index: number) => {
    if (owners.length > 1) {
      setOwners((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
  
    if (!agree) {
      setMessage("❌ You must agree to the Terms and Privacy Policy.");
      setLoading(false);
      return;
    }
  
    for (const [i, owner] of owners.entries()) {
      if (!owner.first_name.trim() || !owner.last_name.trim() || !owner.email.trim()) {
        setMessage(`❌ All required fields must be filled for owner ${i + 1}`);
        setLoading(false);
        return;
      }
    }
  
    try {
      const stripePriceId = localStorage.getItem("selected_plan");
      const productIdMap: Record<string, number> = {
        "price_1RBKvBACVQjWBIYus7IRSyEt": 2736,
        "price_1RBKvlACVQjWBIYuVs4Of01v": 2737,
      };
      const product_id = productIdMap[stripePriceId || ""] || 0;
  
      if (!product_id) {
        setMessage("❌ No valid subscription plan selected.");
        setLoading(false);
        return;
      }
  
      const data = {
        ...formData,
        product_id,
        members: owners,
      };
  
      // ✅ Step 1: Save KYC temp to backend
      const res = await axios.post("https://hoxton-api-backend.onrender.com/api/save-kyc-temp", data);
      const external_id = res.data.external_id;
  
      // ✅ Step 2: Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const checkoutRes = await axios.post("/api/checkout-session", {
        email: formData.email,
        price_id: stripePriceId,
        external_id,
        coupon_code: couponCode, // ✅ Pass coupon to backend
        discounted_price: discountedPrice, // ✅ Pass discounted price
      });
  
      await stripe?.redirectToCheckout({ sessionId: checkoutRes.data.sessionId });
  
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setMessage("❌ This email is already linked to another business. Please use a different email.");
      } else {
        setMessage("❌ An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white shadow rounded space-y-6">
      <h2 className="text-2xl font-semibold">KYC Form</h2>

      <div className="mb-4 text-sm text-gray-700 bg-blue-50 border border-blue-200 px-4 py-3 rounded">
        <strong>Selected Plan:</strong> {selectedPlanLabel}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <label className="block">First Name<span className="text-red-500">*</span>
          <input required name="customer_first_name" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Last Name<span className="text-red-500">*</span>
          <input required name="customer_last_name" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Email Address<span className="text-red-500">*</span>
          <input required type="email" name="email" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Phone Number
          <input name="phone_number" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Company Name<span className="text-red-500">*</span>
          <input required name="company_name" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Trading Name
          <input name="trading_name" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Organisation Type<span className="text-red-500">*</span>
          <Select options={businessTypes} onChange={(option) => handleSelectChange('organisation_type', option?.value || '')} className="w-full" />
        </label>
        <label className="block">Company Number
          <input name="limited_company_number" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
      </div>

      <h3 className="font-medium mt-6">Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">Address Line 1<span className="text-red-500">*</span>
          <input required name="address_line_1" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Address Line 2
          <input name="address_line_2" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">City<span className="text-red-500">*</span>
          <input required name="city" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Postcode<span className="text-red-500">*</span>
          <input required name="postcode" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Country<span className="text-red-500">*</span>
          <Select options={countries} getOptionLabel={(e) => `${e.label} (${e.value})`} onChange={(option) => handleSelectChange('country', option?.value || '')} className="w-full" />
        </label>
      </div>

      {/* Business Owners */}
      <h3 className="font-medium mt-6">Business Owners</h3>
      {owners.map((owner, i) => (
        <div key={i} className="border p-4 rounded mb-4 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">First Name<span className="text-red-500">*</span>
              <input required value={owner.first_name} onChange={(e) => updateOwner(i, 'first_name', e.target.value)} className="border p-2 rounded w-full" />
            </label>
            <label className="block">Last Name<span className="text-red-500">*</span>
              <input required value={owner.last_name} onChange={(e) => updateOwner(i, 'last_name', e.target.value)} className="border p-2 rounded w-full" />
            </label>
            <label className="block md:col-span-2">Email Address<span className="text-red-500">*</span>
              <input type="email" required value={owner.email} onChange={(e) => updateOwner(i, 'email', e.target.value)} className="border p-2 rounded w-full" />
            </label>
          </div>
          {owners.length > 1 && (
            <button type="button" onClick={() => removeOwner(i)} className="text-red-500 text-sm">Remove Owner</button>
          )}
        </div>
      ))}

      <button type="button" onClick={addOwner} className="text-blue-600 underline">+ Add Another Owner</button>

      {/* Terms + Submit */}
      <div className="mt-6 text-sm text-gray-700">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="form-checkbox" />
          I agree to the{" "}
          <a href="/terms-of-service" target="_blank" className="underline text-blue-600">Terms of Service</a>{" "}
          and{" "}
          <a href="/privacy-policy" target="_blank" className="underline text-blue-600">Privacy Policy</a>.
        </label>
      </div>

      <div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded mt-4 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Processing…
            </>
          ) : (
            <span className="font-semibold">Continue to Payment</span>
          )}
        </button>
      </div>

      {message && <p className="text-center mt-4 text-sm text-red-600">{message}</p>}
    </form>
  );
}
