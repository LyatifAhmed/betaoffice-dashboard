// Fixed and complete KycForm.tsx with toggleable autofill for UK company and address

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Select from "react-select";
import countryList from "react-select-country-list";
import debounce from "lodash.debounce";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Props {
  lockedProductId: number;
  selectedPlanLabel: string;
  couponCode: string;
  discountedPrice: number;
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

export default function KycForm({
  lockedProductId,
  selectedPlanLabel,
  couponCode,
  discountedPrice,
}: Props) {
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
    country: 'GB',
    phone_number: '',
    customer_first_name: '',
    customer_last_name: '',
  });

  const [owners, setOwners] = useState<Owner[]>([{ first_name: '', last_name: '', email: '' }]);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [companyQuery, setCompanyQuery] = useState('');
  const [companySuggestions, setCompanySuggestions] = useState<any[]>([]);
  const [postcodeSearch, setPostcodeSearch] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [useCompanySearch, setUseCompanySearch] = useState(true);
  const [useAddressSearch, setUseAddressSearch] = useState(true);

  const countries = countryList().getData();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: { value: string } | null) => {
    setFormData((prev) => ({ ...prev, [field]: value?.value || '' }));
  };

  const updateOwner = (index: number, field: keyof Owner, value: string) => {
    const updated = [...owners];
    updated[index] = { ...updated[index], [field]: value };
    setOwners(updated);
  };

  const addOwner = () => {
    setOwners((prev) => [...prev, { first_name: '', last_name: '', email: '' }]);
  };

  const removeOwner = (index: number) => {
    setOwners((prev) => prev.filter((_, i) => i !== index));
  };

  const fetchCompanies = debounce(async (query: string) => {
    if (!query.trim()) return;
    const res = await axios.get(`/api/companies?query=${query}`);
    setCompanySuggestions(res.data.companies);
  }, 500);

  const fetchAddresses = debounce(async (postcode: string) => {
    if (!postcode.trim()) return;
    const res = await axios.get(`/api/address?postcode=${postcode}`);
    setAddressSuggestions(res.data.addresses || []);
  }, 500);

  useEffect(() => {
    if (useCompanySearch) fetchCompanies(companyQuery);
  }, [companyQuery, useCompanySearch]);

  useEffect(() => {
    if (useAddressSearch) fetchAddresses(postcodeSearch);
  }, [postcodeSearch, useAddressSearch]);

  const handleCompanySelect = (company: any) => {
    setFormData((prev) => ({
      ...prev,
      company_name: company.name,
      limited_company_number: company.companyNumber,
      address_line_1: company.address,
    }));
    setCompanySuggestions([]);
  };

  const handleAddressSelect = (address: string) => {
    const [line1, city, postcode] = address.split(',').map(s => s.trim());
    setFormData((prev) => ({
      ...prev,
      address_line_1: line1 || '',
      city: city || '',
      postcode: postcode || '',
    }));
    setAddressSuggestions([]);
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

      const data = { ...formData, product_id, members: owners };

      const res = await axios.post("https://hoxton-api-backend.onrender.com/api/save-kyc-temp", data);
      const external_id = res.data.external_id;

      const stripe = await stripePromise;
      const checkoutRes = await axios.post("/api/checkout-session", {
        email: formData.email,
        price_id: stripePriceId,
        external_id,
        coupon_code: couponCode,
        discounted_price: discountedPrice,
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
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 text-black dark:text-white shadow rounded space-y-6">
      <h2 className="text-2xl font-semibold">KYC Form</h2>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={useCompanySearch} onChange={() => setUseCompanySearch(!useCompanySearch)} />
          Use UK Company Autofill
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={useAddressSearch} onChange={() => setUseAddressSearch(!useAddressSearch)} />
          Use UK Address Autofill
        </label>
      </div>

      {/* Terms + Submit */}
      <div className="mt-6 text-sm text-gray-700 dark:text-gray-300">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="form-checkbox"
          />
          I agree to the{" "}
          <a href="/terms-of-service" target="_blank" className="underline text-blue-600 dark:text-blue-400">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy-policy" target="_blank" className="underline text-blue-600 dark:text-blue-400">
            Privacy Policy
          </a>.
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Processing…
            </>
          ) : (
            <span className="font-semibold">Continue to Payment</span>
          )}
        </button>
      </div>

      {message && (
        <p className="text-center mt-4 text-sm text-red-600 dark:text-red-400">
          {message}
        </p>
      )}


    </form>
  );
}
