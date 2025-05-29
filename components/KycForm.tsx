// KycForm.tsx — Company name autofill only; address via postcode search

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
  stripePriceId: string;
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
  stripePriceId,
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

  const handleCompanySelect = (company: any) => {
    setFormData((prev) => ({
      ...prev,
      company_name: company.name,
      limited_company_number: company.companyNumber,
    }));
    setCompanySuggestions([]);
  };

  const handleAddressSelect = (address: string) => {
    const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
    const postcode = parts.pop() || '';
    const city = parts.pop() || '';
    const line1 = parts.join(', ');

    setFormData((prev) => ({
      ...prev,
      address_line_1: line1,
      city,
      postcode,
    }));
    setAddressSuggestions([]);
  };

  useEffect(() => {
    const debounced = debounce(async () => {
      if (!companyQuery.trim()) return;
      const res = await axios.get(`/api/companies?query=${companyQuery}`);
      setCompanySuggestions(res.data.companies);
    }, 500);
    debounced();
    return () => debounced.cancel();
  }, [companyQuery]);

  useEffect(() => {
    const debounced = debounce(async () => {
      if (!postcodeSearch.trim()) return;
      const res = await axios.get(`/api/address?postcode=${postcodeSearch}`);
      setAddressSuggestions(res.data.addresses || []);
    }, 500);
    debounced();
    return () => debounced.cancel();
  }, [postcodeSearch]);

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
      
      {/* Plan Info */}
      <div className="text-sm bg-blue-50 border border-blue-200 px-4 py-3 rounded">
        <div><strong>Selected Plan:</strong> {selectedPlanLabel}</div>
        {discountedPrice > 0 && <div className="text-green-600">✅ Discounted Price: £{discountedPrice.toFixed(2)}</div>}
        {couponCode && <div className="text-green-500 text-sm">Coupon <strong>{couponCode.toUpperCase()}</strong> applied!</div>}
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <label className="block">First Name<span className="text-red-500">*</span>
          <input required name="customer_first_name" value={formData.customer_first_name} onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Last Name<span className="text-red-500">*</span>
          <input required name="customer_last_name" value={formData.customer_last_name} onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Email Address<span className="text-red-500">*</span>
          <input required type="email" name="email" value={formData.email} onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Phone Number
          <input name="phone_number" value={formData.phone_number} onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
      </div>
      {/* Auto-fill Toggles & Search Inputs */}
      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <label className="font-medium">🔍 Auto-fill UK Company Info</label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useCompanySearch}
              onChange={() => setUseCompanySearch(!useCompanySearch)}
            />
            <span>{useCompanySearch ? "Enabled" : "Manual Entry"}</span>
          </label>
        </div>

        {useCompanySearch && (
          <>
            <input
              type="text"
              placeholder="Search company name..."
              className="border p-2 rounded w-full"
              value={companyQuery}
              onChange={(e) => setCompanyQuery(e.target.value)}
            />
            {companySuggestions.length > 0 && (
              <ul className="border rounded bg-white dark:bg-gray-800 max-h-40 overflow-y-auto text-sm">
                {companySuggestions.map((c, i) => (
                  <li
                    key={i}
                    onClick={() => handleCompanySelect(c)}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer"
                  >
                    {c.name} ({c.companyNumber}) — {c.status}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        

      {/* Company Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <label className="block">Company Name<span className="text-red-500">*</span>
          <input required name="company_name" value={formData.company_name} onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Trading Name
          <input name="trading_name" value={formData.trading_name} onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Organisation Type<span className="text-red-500">*</span>
          <Select options={businessTypes} value={businessTypes.find(opt => opt.value === formData.organisation_type)} onChange={(option) => handleSelectChange('organisation_type', option)} className="w-full" />
        </label>
        <label className="block">Company Number
          <input name="limited_company_number" value={formData.limited_company_number} onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
      </div>

      <div className="flex items-center justify-between">
          <label className="font-medium">📍 Auto-fill UK Address</label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useAddressSearch}
              onChange={() => setUseAddressSearch(!useAddressSearch)}
            />
            <span>{useAddressSearch ? "Enabled" : "Manual Entry"}</span>
          </label>
        </div>

        {useAddressSearch && (
          <>
            <input
              type="text"
              placeholder="Enter UK postcode..."
              className="border p-2 rounded w-full"
              value={postcodeSearch}
              onChange={(e) => setPostcodeSearch(e.target.value)}
            />
            {addressSuggestions.length > 0 && (
              <ul className="border rounded bg-white dark:bg-gray-800 max-h-40 overflow-y-auto text-sm">
                {addressSuggestions.map((a, i) => (
                  <li
                    key={i}
                    onClick={() => handleAddressSelect(a)}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {/* Address Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <label className="block">Address Line 1<span className="text-red-500">*</span>
          <input required name="address_line_1" value={formData.address_line_1} onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Address Line 2
          <input name="address_line_2" value={formData.address_line_2} onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">City<span className="text-red-500">*</span>
          <input required name="city" value={formData.city} onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Postcode<span className="text-red-500">*</span>
          <input required name="postcode" value={formData.postcode} onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Country<span className="text-red-500">*</span>
          <Select options={countries} value={countries.find(c => c.value === formData.country)} getOptionLabel={(e) => `${e.label} (${e.value})`} onChange={(option) => handleSelectChange('country', option)} className="w-full" />
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
            <button type="button" onClick={() => setOwners(owners.filter((_, idx) => idx !== i))} className="text-red-500 text-sm">
              Remove Owner
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => setOwners([...owners, { first_name: '', last_name: '', email: '' }])} className="text-blue-600 underline mt-2">
        + Add Another Owner
      </button>


      {/* Submit Section (as you already had) */}
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
