// components/KycForm.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Select, { SingleValue } from "react-select";
import countryList from "react-select-country-list";
import debounce from "lodash.debounce";
import { loadStripe } from "@stripe/stripe-js";
import AddressPicker from "./AddressPicker";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Props {
  lockedProductId: number;
  selectedPlanLabel: string;
  couponId: string | null;
  discountedPrice: number;
  stripePriceId: string;
}

interface Owner {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
}

interface CountryOption {
  value: string;
  label: string;
}

interface CompanySuggestion {
  name: string;
  companyNumber: string;
  status?: string;
}

const businessTypes: CountryOption[] = [
  { value: "1", label: "Limited company (LTD, LP, LLP, LLC, Corp)" },
  { value: "13", label: "Association, club or society" },
  { value: "10", label: "Charity / non-profit" },
  { value: "3", label: "Individual / sole trader" },
  { value: "12", label: "Trust, foundation or fund" },
  { value: "9",  label: "Unincorporated / not yet registered" },
];

type FieldErrors = Partial<Record<
  | keyof ReturnType<typeof defaultForm>
  | `owner_${number}_first_name`
  | `owner_${number}_last_name`
  | `owner_${number}_email`
  | `owner_${number}_dob`
, string>>;

const defaultForm = () => ({
  company_name: "",
  trading_name: "",
  organisation_type: "",
  limited_company_number: "",
  email: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  postcode: "",
  country: "GB" as string,
  phone_number: "",
  customer_first_name: "",
  customer_middle_name: "",
  customer_last_name: "",
  shipping_address_line_1: "",
  shipping_city: "",
  shipping_postcode: "",
  shipping_country: "GB" as string,
});

export default function KycForm({
  lockedProductId,
  selectedPlanLabel,
  discountedPrice,
  stripePriceId,
  couponId,
}: Props) {
  const [formData, setFormData] = useState(defaultForm());
  const [useUkAddressLookup, setUseUkAddressLookup] = useState(true); // GB ile başlıyoruz
  const [useCompanySearch, setUseCompanySearch] = useState(true);
  const [showShipping, setShowShipping] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([{ first_name: "", last_name: "", email: "", date_of_birth: "" }]);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [summaryErrors, setSummaryErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [companyQuery, setCompanyQuery] = useState("");
  const [companySuggestions, setCompanySuggestions] = useState<CompanySuggestion[]>([]);

  const ipCountryRef = useRef<string>("GB");
  const countryTouchedRef = useRef(false);

  const countries = useMemo(() => countryList().getData() as CountryOption[], []);

  // IP ülkesini çek (UK lookup kapalıyken default atamak için)
  useEffect(() => {
    fetch("/api/geo")
      .then(r => r.json())
      .then(({ country }) => {
        ipCountryRef.current = (country || "GB").toUpperCase();
        if (!useUkAddressLookup && !countryTouchedRef.current) {
          setFormData(prev => ({ ...prev, country: prev.country || ipCountryRef.current }));
        }
      })
      .catch(() => {
        ipCountryRef.current = "GB";
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Şirket arama (Companies House vb.)
  useEffect(() => {
    const run = debounce(async (q: string) => {
      if (!q.trim()) return setCompanySuggestions([]);
      try {
        const res = await axios.get(`/api/companies?query=${encodeURIComponent(q)}`);
        setCompanySuggestions((res.data?.companies as CompanySuggestion[]) || []);
      } catch {
        setCompanySuggestions([]);
      }
    }, 500);
    run(companyQuery);
    return () => run.cancel();
  }, [companyQuery]);

  // Shipping seçildiyse ülkeyi GB’de tut
  useEffect(() => {
    if (showShipping) {
      setFormData(prev => ({ ...prev, shipping_country: "GB" }));
    }
  }, [showShipping]);

  // UK Lookup toggle: açıkken ülke GB ve Country select disabled
  useEffect(() => {
    if (useUkAddressLookup) {
      setFormData(prev => ({ ...prev, country: "GB" }));
    }
  }, [useUkAddressLookup]);

  // ---- helpers ----
  const applyAddressToForm = (a: { line_1: string; line_2?: string; city?: string; postcode?: string; country?: string }) => {
    setFormData(prev => ({
      ...prev,
      address_line_1: a.line_1 || "",
      address_line_2: a.line_2 || "",
      city: a.city || "",
      postcode: a.postcode || "",
      country: useUkAddressLookup ? "GB" : (a.country || prev.country || ipCountryRef.current),
    }));
  };

  const applyShippingToForm = (a: { line_1: string; line_2?: string; city?: string; postcode?: string }) => {
    setFormData(prev => ({
      ...prev,
      shipping_address_line_1: a.line_1 || "",
      shipping_city: a.city || "",
      shipping_postcode: a.postcode || "",
      shipping_country: "GB",
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (field: keyof typeof formData, option: SingleValue<CountryOption>) => {
    const val = option?.value || "";
    setFormData(prev => ({ ...prev, [field]: val }));
    if (field === "country") countryTouchedRef.current = true;
    setFieldErrors(prev => ({ ...prev, [field]: "" }));
  };

  const updateOwner = (index: number, field: keyof Owner, value: string) => {
    setOwners(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setFieldErrors(prev => ({ ...prev, [`owner_${index}_${mapOwnerField(field)}`]: "" }));
  };

  const handleCompanySelect = (company: CompanySuggestion) => {
    setFormData(prev => ({
      ...prev,
      company_name: company.name,
      limited_company_number: company.companyNumber,
    }));
    setCompanySuggestions([]);
  };

  // ---- validation ----
  const validate = (): boolean => {
    const errors: FieldErrors = {};
    const summary: string[] = [];

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.customer_first_name.trim()) {
      errors.customer_first_name = "First name is required";
    }
    if (!formData.customer_last_name.trim()) {
      errors.customer_last_name = "Last name is required";
    }
    if (!formData.email.trim() || !emailRe.test(formData.email)) {
      errors.email = "Valid email is required";
    }

    if (!formData.organisation_type) {
      errors.organisation_type = "Please select an organisation type";
    }

    const isUnincorporated = formData.organisation_type === "9";
    if (!isUnincorporated) {
      if (!formData.company_name.trim()) errors.company_name = "Company name is required";
      if (!formData.limited_company_number.trim()) errors.limited_company_number = "Company number is required";
    }

    if (!useUkAddressLookup) {
      if (!formData.address_line_1.trim()) errors.address_line_1 = "Address line 1 is required";
      if (!formData.city.trim()) errors.city = "City is required";
      if (!formData.postcode.trim()) errors.postcode = "Postcode is required";
      if (!formData.country) errors.country = "Country is required";
    } else {
      // Lookup modunda postcode & city genelde picker'dan gelir, yine de kontrol edelim
      if (!formData.address_line_1.trim()) errors.address_line_1 = "Please select a valid UK address";
      if (!formData.postcode.trim()) errors.postcode = "Please select a valid UK address";
    }

    owners.forEach((o, i) => {
      if (!o.first_name.trim()) errors[`owner_${i}_first_name`] = "Required";
      if (!o.last_name.trim()) errors[`owner_${i}_last_name`] = "Required";
      if (!o.email.trim() || !emailRe.test(o.email)) errors[`owner_${i}_email`] = "Valid email required";
      if (!o.date_of_birth.trim()) errors[`owner_${i}_dob`] = "Date of birth is required";
    });

    // Build summary from field errors (unique messages)
    Object.values(errors).forEach(msg => { if (msg && !summary.includes(msg)) summary.push(msg); });

    setFieldErrors(errors);
    setSummaryErrors(summary);
    return Object.keys(errors).length === 0;
  };

  // ---- submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setSummaryErrors([]);

    if (!agree) {
      setMessage("❌ You must agree to the Terms and Privacy Policy.");
      return;
    }

    if (!validate()) {
      setMessage("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        product_id: lockedProductId,
        members: owners,
        wants_uk_forwarding: showShipping,
      };

      const saveRes = await axios.post("/api/backend/save-kyc-temp", payload);
      const external_id = saveRes.data.external_id as string;

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to initialize");

      const checkoutRes = await axios.post("/api/checkout-session", {
        email: formData.email,
        price_id: stripePriceId,
        external_id,
        coupon_id: couponId || undefined,
      });

      await stripe.redirectToCheckout({ sessionId: checkoutRes.data.sessionId });
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setMessage("❌ This email is already linked to another business. Please use a different email.");
      } else {
        setMessage("❌ An error occurred while saving your details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isUnincorporated = formData.organisation_type === "9";
  const originalPrice = stripePriceId === "price_1RBKvBACVQjWBIYus7IRSyEt" ? 20 : 200;
  const finalPrice = Math.max(0, originalPrice - discountedPrice);

  const inputClass = (name: keyof typeof formData) =>
    `border p-2 rounded w-full dark:bg-white/10 dark:text-white dark:border-white/20 ${fieldErrors[name] ? "border-red-500" : ""}`;

  const ownerInputClass = (hasError: boolean) =>
    `border p-2 rounded w-full dark:bg-white/10 dark:text-white dark:border-white/20 ${hasError ? "border-red-500" : ""}`;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 shadow rounded space-y-6">
      {/* Price/plan box */}
      <div className="text-sm bg-blue-50 border border-blue-200 px-4 py-3 rounded dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-100">
        <div><strong>Selected Plan:</strong> {selectedPlanLabel}</div>
        {discountedPrice > 0 ? (
          <div className="text-green-600 dark:text-green-300">
            ✅ Discounted Price: £{finalPrice.toFixed(2)}{" "}
            <span className="line-through text-gray-400 ml-2">£{originalPrice.toFixed(2)}</span>
          </div>
        ) : (
          <div className="text-gray-700 dark:text-gray-200">Price: £{originalPrice.toFixed(2)}</div>
        )}
        {couponId && <div className="text-green-600 dark:text-green-300 text-sm">Coupon <strong>{couponId.toUpperCase()}</strong> applied!</div>}
      </div>

      

      {/* Customer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <label className="block">
          First Name<span className="text-red-500">*</span>
          <input name="customer_first_name" value={formData.customer_first_name} onChange={handleChange} className={inputClass("customer_first_name")} />
          {fieldErrors.customer_first_name && <p className="text-xs text-red-600 mt-1">{fieldErrors.customer_first_name}</p>}
        </label>
        <label className="block">
          Last Name<span className="text-red-500">*</span>
          <input name="customer_last_name" value={formData.customer_last_name} onChange={handleChange} className={inputClass("customer_last_name")} />
          {fieldErrors.customer_last_name && <p className="text-xs text-red-600 mt-1">{fieldErrors.customer_last_name}</p>}
        </label>
        <label className="block">
          Email Address<span className="text-red-500">*</span>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass("email")} />
          {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
        </label>
        <label className="block">
          Phone Number
          <input name="phone_number" value={formData.phone_number} onChange={handleChange} className={inputClass("phone_number")} />
        </label>
      </div>

      {/* Company Search */}
      <label className="inline-flex items-center gap-2">
        <input type="checkbox" checked={useCompanySearch} onChange={() => setUseCompanySearch(!useCompanySearch)} />
        Autofill UK Company Info
      </label>

      {useCompanySearch && (
        <>
          <input
            type="text"
            placeholder="Search company name..."
            className="border border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none p-2 rounded w-full bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm placeholder-gray-400"
            value={companyQuery}
            onChange={(e) => setCompanyQuery(e.target.value)}
          />
          <ul className="text-sm">
            {companySuggestions.map((c, i) => (
              <li key={`${c.companyNumber}-${i}`} onClick={() => handleCompanySelect(c)} className="cursor-pointer hover:underline">
                {c.name} ({c.companyNumber}) — {c.status}
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2 dark:text-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30">
        ℹ️ If your company is not yet registered at Companies House, select <strong>Unincorporated / not yet registered</strong>. You can still use our service and update your company details later.
      </div>

      {/* Company fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <label className="block">
          Company Name<span className="text-red-500">*</span>
          <input name="company_name" placeholder="My Future Company Ltd" value={formData.company_name} onChange={handleChange}
                 className={inputClass("company_name")} />
          {fieldErrors.company_name && <p className="text-xs text-red-600 mt-1">{fieldErrors.company_name}</p>}
        </label>

        <label className="block">
          Trading Name
          <input name="trading_name" value={formData.trading_name} onChange={handleChange} className={inputClass("trading_name")} />
        </label>

        <label className="block">
          Organisation Type<span className="text-red-500">*</span>
          <Select<CountryOption, false>
            options={businessTypes}
            placeholder="Select organisation type"
            value={businessTypes.find((opt) => opt.value === formData.organisation_type) || null}
            onChange={(option) => handleSelectChange("organisation_type", option)}
            className={`w-full text-black dark:text-white ${fieldErrors.organisation_type ? "ring-1 ring-red-500 rounded" : ""}`}
            styles={{
              control: (base) => ({ ...base, backgroundColor: "transparent", borderColor: fieldErrors.organisation_type ? "#ef4444" : "rgb(229 231 235)" }),
              menu: (base) => ({ ...base, zIndex: 50 }),
            }}
          />
          {fieldErrors.organisation_type && <p className="text-xs text-red-600 mt-1">{fieldErrors.organisation_type}</p>}
        </label>

        <label className="block">
          Company Number
          <input name="limited_company_number" value={formData.limited_company_number} onChange={handleChange}
                 className={inputClass("limited_company_number")} />
          {fieldErrors.limited_company_number && <p className="text-xs text-red-600 mt-1">{fieldErrors.limited_company_number}</p>}
        </label>
      </div>

      {/* UK Lookup toggle */}
      {formData.country === "GB" && (
        <label className="mt-4 inline-flex items-center">
          <input type="checkbox" checked={useUkAddressLookup} onChange={(e) => setUseUkAddressLookup(e.target.checked)} className="form-checkbox" />
          <span className="ml-2">Use UK Postcode Lookup (UK addresses only)</span>
        </label>
      )}

      {/* Address */}
      {useUkAddressLookup && formData.country === "GB" ? (
        <div className="mt-4">
          <AddressPicker defaultPostcode={formData.postcode} onChange={(addr) => applyAddressToForm(addr)} />
          {(formData.address_line_1 || formData.city || formData.postcode) && (
            <p className="mt-2 text-sm text-gray-600 dark:text-white/80">
              {[formData.address_line_1, formData.address_line_2, formData.city, formData.postcode].filter(Boolean).join(", ")}
            </p>
          )}
          {(fieldErrors.address_line_1 || fieldErrors.postcode) && (
            <p className="text-xs text-red-600 mt-1">Please pick a valid UK address.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <label className="block">
            Address Line 1<span className="text-red-500">*</span>
            <input name="address_line_1" value={formData.address_line_1} onChange={handleChange} className={inputClass("address_line_1")} />
            {fieldErrors.address_line_1 && <p className="text-xs text-red-600 mt-1">{fieldErrors.address_line_1}</p>}
          </label>
          <label className="block">
            Address Line 2
            <input name="address_line_2" value={formData.address_line_2} onChange={handleChange} className={inputClass("address_line_2")} />
          </label>
          <label className="block">
            City<span className="text-red-500">*</span>
            <input name="city" value={formData.city} onChange={handleChange} className={inputClass("city")} />
            {fieldErrors.city && <p className="text-xs text-red-600 mt-1">{fieldErrors.city}</p>}
          </label>
          <label className="block">
            Postcode<span className="text-red-500">*</span>
            <input name="postcode" value={formData.postcode} onChange={handleChange} className={inputClass("postcode")} />
            {fieldErrors.postcode && <p className="text-xs text-red-600 mt-1">{fieldErrors.postcode}</p>}
          </label>
        </div>
      )}

      {/* Country (manuel modda değiştirilebilir; UK lookup'ta disabled) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <label className="block">
          Country<span className="text-red-500">*</span>
          <Select<CountryOption, false>
            options={countries}
            value={countries.find((c) => c.value === formData.country) || null}
            getOptionLabel={(opt) => `${opt.label} (${opt.value})`}
            onChange={(option) => handleSelectChange("country", option)}
            isDisabled={useUkAddressLookup}
            className={`w-full text-black dark:text-white ${fieldErrors.country ? "ring-1 ring-red-500 rounded" : ""}`}
            styles={{
              control: (base) => ({ ...base, backgroundColor: "transparent", borderColor: fieldErrors.country ? "#ef4444" : "rgb(229 231 235)" }),
              menu: (base) => ({ ...base, zIndex: 50 }),
            }}
          />
          {useUkAddressLookup && <p className="text-xs text-gray-500 mt-1">UK lookup is on — country is fixed to GB.</p>}
          {fieldErrors.country && <p className="text-xs text-red-600 mt-1">{fieldErrors.country}</p>}
        </label>
      </div>

      {/* Shipping */}
      <label className="mt-4 inline-flex items-center">
        <input type="checkbox" checked={showShipping} onChange={() => setShowShipping(!showShipping)} className="form-checkbox" />
        <span className="ml-2">I want my post forwarded to a UK address</span>
      </label>

      {showShipping && (
        <div className="mt-4">
          <AddressPicker defaultPostcode={formData.shipping_postcode} onChange={(addr) => applyShippingToForm(addr)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <label className="block">
              UK Shipping Address Line 1
              <input name="shipping_address_line_1" value={formData.shipping_address_line_1} className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed dark:bg-white/10 dark:text-white dark:border-white/20" readOnly />
            </label>
            <label className="block">
              City
              <input name="shipping_city" value={formData.shipping_city} className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed dark:bg-white/10 dark:text-white dark:border-white/20" readOnly />
            </label>
            <label className="block">
              Postcode
              <input name="shipping_postcode" value={formData.shipping_postcode} className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed dark:bg-white/10 dark:text-white dark:border-white/20" readOnly />
            </label>
          </div>
        </div>
      )}

      {/* Owners */}
      <h3 className="font-medium mt-6 dark:text-white">Business Owners</h3>
      {owners.map((owner, i) => (
        <div key={i} className="border p-4 rounded mb-4 space-y-2 dark:border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              First Name<span className="text-red-500">*</span>
              <input value={owner.first_name} onChange={(e) => updateOwner(i, "first_name", e.target.value)}
                     className={ownerInputClass(Boolean(fieldErrors[`owner_${i}_first_name`]))} />
              {fieldErrors[`owner_${i}_first_name`] && <p className="text-xs text-red-600 mt-1">{fieldErrors[`owner_${i}_first_name`]}</p>}
            </label>
            <label className="block">
              Last Name<span className="text-red-500">*</span>
              <input value={owner.last_name} onChange={(e) => updateOwner(i, "last_name", e.target.value)}
                     className={ownerInputClass(Boolean(fieldErrors[`owner_${i}_last_name`]))} />
              {fieldErrors[`owner_${i}_last_name`] && <p className="text-xs text-red-600 mt-1">{fieldErrors[`owner_${i}_last_name`]}</p>}
            </label>
            <label className="block md:col-span-2">
              Email Address<span className="text-red-500">*</span>
              <input type="email" value={owner.email} onChange={(e) => updateOwner(i, "email", e.target.value)}
                     className={ownerInputClass(Boolean(fieldErrors[`owner_${i}_email`]))} />
              {fieldErrors[`owner_${i}_email`] && <p className="text-xs text-red-600 mt-1">{fieldErrors[`owner_${i}_email`]}</p>}
            </label>
            <label className="block md:col-span-2">
              Date of Birth<span className="text-red-500">*</span>
              <input type="date" value={owner.date_of_birth} onChange={(e) => updateOwner(i, "date_of_birth", e.target.value)}
                     className={ownerInputClass(Boolean(fieldErrors[`owner_${i}_dob`]))} />
              {fieldErrors[`owner_${i}_dob`] && <p className="text-xs text-red-600 mt-1">{fieldErrors[`owner_${i}_dob`]}</p>}
            </label>
          </div>

          {owners.length > 1 && (
            <button type="button" onClick={() => setOwners(owners.filter((_, idx) => idx !== i))} className="text-red-500 text-sm">
              Remove Owner
            </button>
          )}
        </div>
      ))}

      <button type="button" onClick={() => setOwners([...owners, { first_name: "", last_name: "", email: "", date_of_birth: "" }])}
              className="text-blue-600 underline mt-2">
        + Add Another Owner
      </button>

      {/* Agreements */}
      <div className="mt-6 text-sm text-gray-700 dark:text-gray-300">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="form-checkbox" />
          I agree to the{" "}
          <a href="/terms-of-service" target="_blank" className="underline text-blue-600 dark:text-blue-400">Terms of Service</a>{" "}
          and{" "}
          <a href="/privacy-policy" target="_blank" className="underline text-blue-600 dark:text-blue-400">Privacy Policy</a>.
        </label>
      </div>
      {/* Error summary */}
      {(summaryErrors.length > 0 || message) && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-200">
          {message && <div className="mb-2">{message}</div>}
          {summaryErrors.length > 0 && (
            <ul className="list-disc pl-5 space-y-1">
              {summaryErrors.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          )}
        </div>
      )}
      {/* Submit */}
      <div>
        <button type="submit" disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded mt-4 flex items-center justify-center gap-2 disabled:opacity-50">
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
    </form>
  );
}

// small util
function mapOwnerField(f: keyof Owner) {
  if (f === "first_name") return "first_name";
  if (f === "last_name") return "last_name";
  if (f === "email") return "email";
  return "dob";
}
