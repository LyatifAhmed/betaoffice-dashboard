import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import axios from "axios";
import Select from "react-select";
import countryList from "react-select-country-list";

interface OptionType {
  label: string;
  value: string;
}

export default function KYCForm() {
  const router = useRouter();
  const [owners, setOwners] = useState([
    { id: Date.now(), first_name: '', last_name: '', dob: '', phone: '', proof_id: null, proof_address: null }
  ]);
  const [manualAddress, setManualAddress] = useState(false);
  const [manualCompany, setManualCompany] = useState(false);
  const [postcode, setPostcode] = useState("");
  const [addressOptions, setAddressOptions] = useState<OptionType[]>([]);
  const [companyOptions, setCompanyOptions] = useState<OptionType[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<OptionType | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<OptionType | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<OptionType | null>(null);
  const [contact, setContact] = useState({ first_name: '', last_name: '', email: '', phone: '' });
  const [manualAddressData, setManualAddressData] = useState({ line1: '', line2: '', city: '', postcode: '' });
  const [companyData, setCompanyData] = useState({ name: '', trading_name: '', number: '', type: '' });
  const [submitting, setSubmitting] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);

  // 👇 Map Stripe price ID → Hoxton Mix product_id
  useEffect(() => {
    const stripePriceId = localStorage.getItem("stripePriceId");
    if (stripePriceId === "price_1RBKvBACVQjWBIYus7IRSyEt") {
      setProductId(2736); // Monthly
    } else if (stripePriceId === "price_1RBKvlACVQjWBIYuVs4Of01v") {
      setProductId(2737); // Annual
    }
  }, []);

  const organizationTypes = [
    "Limited company (LTD, LP, LLP, LLC, Corp)",
    "Association, club or society",
    "Charity / non-profit",
    "Individual / sole trader",
    "Trust, foundation or fund",
    "Unincorporated / not yet registered"
  ];

  const addOwner = () => setOwners([...owners, {
    id: Date.now(), first_name: '', last_name: '', dob: '', phone: '', proof_id: null, proof_address: null
  }]);

  const removeOwner = (id: number) => setOwners(owners.filter(o => o.id !== id));

  const handleOwnerChange = (id: number, field: string, value: any) => {
    setOwners(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const fetchAddresses = async () => {
    if (!postcode) return;
    try {
      const res = await axios.get(`https://hoxton-api-backend.onrender.com/api/address-lookup?postcode=${postcode}`);
      setAddressOptions(res.data.addresses.map((a: string) => ({ label: a, value: a })));
    } catch (err) {
      console.error("Address lookup failed", err);
    }
  };

  const fetchCompanies = async (inputValue: string) => {
    if (!inputValue || inputValue.length < 2) return;
    try {
      const res = await axios.get(`https://hoxton-api-backend.onrender.com/api/company-search?q=${inputValue}`);
      const options = res.data.companies.map((c: { title: string; company_number: string }) => ({
        label: c.title,
        value: c.company_number,
      }));
      setCompanyOptions(options);
    } catch (err) {
      console.error("Company search failed", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("contact[first_name]", contact.first_name);
      formData.append("contact[last_name]", contact.last_name);
      formData.append("contact[email]", contact.email);
      formData.append("contact[phone]", contact.phone);

      if (manualAddress) {
        formData.append("address[line1]", manualAddressData.line1);
        formData.append("address[line2]", manualAddressData.line2);
        formData.append("address[city]", manualAddressData.city);
        formData.append("address[postcode]", manualAddressData.postcode);
        formData.append("address[country]", selectedCountry?.value || '');
      } else {
        formData.append("address[address]", selectedAddress?.value || '');
      }

      if (manualCompany) {
        formData.append("company[name]", companyData.name);
        formData.append("company[trading_name]", companyData.trading_name);
        formData.append("company[number]", companyData.number);
        formData.append("company[type]", companyData.type);
      } else {
        formData.append("company[label]", selectedCompany?.label || '');
        formData.append("company[value]", selectedCompany?.value || '');
      }

      if (productId) {
        formData.append("product_id", productId.toString());
      }

      owners.forEach((owner, index) => {
        formData.append(`owners[${index}][first_name]`, owner.first_name);
        formData.append(`owners[${index}][last_name]`, owner.last_name);
        formData.append(`owners[${index}][dob]`, owner.dob);
        formData.append(`owners[${index}][phone]`, owner.phone);
        if (owner.proof_id) formData.append(`owners[${index}][proof_id]`, owner.proof_id);
        if (owner.proof_address) formData.append(`owners[${index}][proof_address]`, owner.proof_address);
      });

      await axios.post("https://hoxton-api-backend.onrender.com/api/submit-kyc", formData);
      router.push("/kyc-submitted");
    } catch (err) {
      console.error("KYC submission failed:", err);
      alert("Submission failed. Please check your input and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">KYC Form</h1>
      <form className="space-y-10" onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Form sections stay here */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
    <label className="block font-medium mb-1">
      First Name <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      value={contact.first_name}
      onChange={(e) => setContact({ ...contact, first_name: e.target.value })}
      required
      className="w-full border px-4 py-2 rounded"
    />
  </div>

  <div>
    <label className="block font-medium mb-1">
      Last Name <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      value={contact.last_name}
      onChange={(e) => setContact({ ...contact, last_name: e.target.value })}
      required
      className="w-full border px-4 py-2 rounded"
    />
  </div>

  <div>
    <label className="block font-medium mb-1">
      Email <span className="text-red-500">*</span>
    </label>
    <input
      type="email"
      value={contact.email}
      onChange={(e) => setContact({ ...contact, email: e.target.value })}
      required
      className="w-full border px-4 py-2 rounded"
    />
  </div>

  <div>
    <label className="block font-medium mb-1">Phone</label>
    <PhoneInput
      country={"gb"}
      value={contact.phone}
      onChange={(value) => setContact({ ...contact, phone: value })}
      inputStyle={{ width: "100%" }}
    />
  </div>
</div>
<div className="mt-10">
  <h2 className="text-xl font-semibold mb-4">Address</h2>

  <div className="mb-4">
    <label className="flex items-center gap-2 font-medium">
      <input
        type="checkbox"
        checked={manualAddress}
        onChange={() => setManualAddress(!manualAddress)}
      />
      Enter address manually
    </label>
  </div>

  {!manualAddress ? (
    <>
      <label className="block font-medium mb-1">
        UK Postcode <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          className="border px-4 py-2 rounded w-full"
          placeholder="e.g. SW1A 1AA"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
        />
        <button
          type="button"
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
          onClick={fetchAddresses}
        >
          Lookup
        </button>
      </div>
      <label className="block font-medium mb-1">
        Select Address <span className="text-red-500">*</span>
      </label>
      <Select
        options={addressOptions}
        value={selectedAddress}
        onChange={(option) => setSelectedAddress(option)}
        className="mb-6"
      />
    </>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block font-medium mb-1">
          Address Line 1 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full border px-4 py-2 rounded"
          value={manualAddressData.line1}
          onChange={(e) => setManualAddressData({ ...manualAddressData, line1: e.target.value })}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Address Line 2</label>
        <input
          type="text"
          className="w-full border px-4 py-2 rounded"
          value={manualAddressData.line2}
          onChange={(e) => setManualAddressData({ ...manualAddressData, line2: e.target.value })}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">
          City <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full border px-4 py-2 rounded"
          value={manualAddressData.city}
          onChange={(e) => setManualAddressData({ ...manualAddressData, city: e.target.value })}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">
          Postcode <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full border px-4 py-2 rounded"
          value={manualAddressData.postcode}
          onChange={(e) => setManualAddressData({ ...manualAddressData, postcode: e.target.value })}
        />
      </div>

      <div className="md:col-span-2">
        <label className="block font-medium mb-1">
          Country <span className="text-red-500">*</span>
        </label>
        <Select
          options={countryList().getData()}
          value={selectedCountry}
          onChange={(value) => setSelectedCountry(value)}
        />
      </div>
    </div>
  )}
</div>
<div className="mt-10">
  <h2 className="text-xl font-semibold mb-4">Company Info</h2>

  <div className="mb-4">
    <label className="flex items-center gap-2 font-medium">
      <input
        type="checkbox"
        checked={manualCompany}
        onChange={() => setManualCompany(!manualCompany)}
      />
      Enter company manually
    </label>
  </div>

  {!manualCompany ? (
    <>
      <label className="block font-medium mb-1">
        Search Company <span className="text-red-500">*</span>
      </label>
      <Select
        options={companyOptions}
        onInputChange={fetchCompanies}
        onChange={(option) => setSelectedCompany(option)}
        value={selectedCompany}
        placeholder="Type to search Companies House..."
        className="mb-4"
      />
    </>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
      <div>
        <label className="block font-medium mb-1">
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full border px-4 py-2 rounded"
          value={companyData.name}
          onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Trading Name</label>
        <input
          type="text"
          className="w-full border px-4 py-2 rounded"
          value={companyData.trading_name}
          onChange={(e) => setCompanyData({ ...companyData, trading_name: e.target.value })}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">
          Company Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full border px-4 py-2 rounded"
          value={companyData.number}
          onChange={(e) => setCompanyData({ ...companyData, number: e.target.value })}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">
          Business Type <span className="text-red-500">*</span>
        </label>
        <select
          value={companyData.type}
          onChange={(e) => setCompanyData({ ...companyData, type: e.target.value })}
          className="w-full border px-4 py-2 rounded"
        >
          <option value="">Select type</option>
          <option value="Limited company (LTD, LP, LLP, LLC, Corp)">
            Limited company (LTD, LP, LLP, LLC, Corp)
          </option>
          <option value="Association, club or society">Association, club or society</option>
          <option value="Charity / non-profit">Charity / non-profit</option>
          <option value="Individual / sole trader">Individual / sole trader</option>
          <option value="Trust, foundation or fund">Trust, foundation or fund</option>
          <option value="Unincorporated / not yet registered">
            Unincorporated / not yet registered
          </option>
        </select>
      </div>
    </div>
  )}
</div>
<div className="mt-10">
  <h2 className="text-xl font-semibold mb-4">Business Owners</h2>

  {owners.map((owner, index) => (
    <div
      key={owner.id}
      className="mb-6 border rounded p-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
    >
      <div>
        <label className="block font-medium mb-1">
          First Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full border px-4 py-2 rounded"
          value={owner.first_name}
          onChange={(e) => handleOwnerChange(owner.id, "first_name", e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">
          Last Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full border px-4 py-2 rounded"
          value={owner.last_name}
          onChange={(e) => handleOwnerChange(owner.id, "last_name", e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">
          Date of Birth <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          className="w-full border px-4 py-2 rounded"
          value={owner.dob}
          onChange={(e) => handleOwnerChange(owner.id, "dob", e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Phone Number</label>
        <PhoneInput
          country={"gb"}
          value={owner.phone}
          onChange={(value) => handleOwnerChange(owner.id, "phone", value)}
          inputStyle={{ width: "100%" }}
          containerStyle={{ width: "100%" }}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">
          Proof of ID (e.g., Passport)
        </label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="w-full"
          onChange={(e) =>
            handleOwnerChange(owner.id, "proof_id", e.target.files?.[0] || null)
          }
        />
      </div>

      <div>
        <label className="block font-medium mb-1">
          Proof of Address (e.g., Bank Statement)
        </label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="w-full"
          onChange={(e) =>
            handleOwnerChange(owner.id, "proof_address", e.target.files?.[0] || null)
          }
        />
      </div>

      {owners.length > 1 && (
        <div className="col-span-full text-right">
          <button
            type="button"
            onClick={() => removeOwner(owner.id)}
            className="text-red-500 hover:underline"
          >
            Remove Owner
          </button>
        </div>
      )}
    </div>
  ))}

  <div className="text-right">
    <button
      type="button"
      onClick={addOwner}
      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
    >
      Add Another Owner
    </button>
  </div>
</div>

        {/* Submit button */}
        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}