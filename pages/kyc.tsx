import React, { useState } from "react";
import { useRouter } from "next/router";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import axios from "axios";
import Select from "react-select";
import countryList from "react-select-country-list";

export default function KYCForm() {
  const router = useRouter();
  const [owners, setOwners] = useState([
    { id: Date.now(), first_name: '', last_name: '', dob: '', phone: '', proof_id: null, proof_address: null }
  ]);
  const [manualAddress, setManualAddress] = useState(false);
  const [manualCompany, setManualCompany] = useState(false);
  const [postcode, setPostcode] = useState("");
  const [addressOptions, setAddressOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState<{ label: string; value: string } | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<{ label: string; value: string } | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<{ label: string; value: string } | null>(null);
  const [contact, setContact] = useState({ first_name: '', last_name: '', email: '', phone: '' });
  const [manualAddressData, setManualAddressData] = useState({ line1: '', line2: '', city: '', postcode: '' });
  const [companyData, setCompanyData] = useState({ name: '', trading_name: '', number: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  const addOwner = () => setOwners([
    ...owners,
    { id: Date.now(), first_name: '', last_name: '', dob: '', phone: '', proof_id: null, proof_address: null }
  ]);

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
        <section>
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <input type="text" placeholder="First Name" className="border p-2 rounded w-full mb-2" required value={contact.first_name} onChange={(e) => setContact({ ...contact, first_name: e.target.value })} />
          <input type="text" placeholder="Last Name" className="border p-2 rounded w-full mb-2" required value={contact.last_name} onChange={(e) => setContact({ ...contact, last_name: e.target.value })} />
          <input type="email" placeholder="Email" className="border p-2 rounded w-full mb-2" required value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
          <PhoneInput country={'gb'} value={contact.phone} onChange={(value) => setContact({ ...contact, phone: value })} inputStyle={{ width: "100%" }} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Address</h2>
          {!manualAddress ? (
            <>
              <div className="flex gap-2 mb-4">
                <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="Postcode" className="border p-2 rounded w-full" />
                <button type="button" onClick={fetchAddresses} className="bg-blue-500 text-white px-4 rounded">Lookup</button>
              </div>
              <Select options={addressOptions} value={selectedAddress} onChange={setSelectedAddress} placeholder="Select an address" />
              <button type="button" className="text-blue-600 underline mt-2" onClick={() => setManualAddress(true)}>Enter address manually</button>
            </>
          ) : (
            <>
              <input type="text" placeholder="Address Line 1" className="border p-2 rounded w-full mb-2" value={manualAddressData.line1} onChange={(e) => setManualAddressData({ ...manualAddressData, line1: e.target.value })} />
              <input type="text" placeholder="Address Line 2" className="border p-2 rounded w-full mb-2" value={manualAddressData.line2} onChange={(e) => setManualAddressData({ ...manualAddressData, line2: e.target.value })} />
              <input type="text" placeholder="City" className="border p-2 rounded w-full mb-2" value={manualAddressData.city} onChange={(e) => setManualAddressData({ ...manualAddressData, city: e.target.value })} />
              <input type="text" placeholder="Postcode" className="border p-2 rounded w-full mb-2" value={manualAddressData.postcode} onChange={(e) => setManualAddressData({ ...manualAddressData, postcode: e.target.value })} />
              <Select options={countryList().getData()} value={selectedCountry} onChange={setSelectedCountry} placeholder="Select Country" />
              <button type="button" className="text-blue-600 underline mt-2" onClick={() => setManualAddress(false)}>Use postcode lookup instead</button>
            </>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Company Info</h2>
          {!manualCompany ? (
            <>
              <Select onInputChange={fetchCompanies} options={companyOptions} value={selectedCompany} onChange={setSelectedCompany} placeholder="Search company" />
              <button type="button" className="text-blue-600 underline mt-2" onClick={() => setManualCompany(true)}>Enter manually</button>
            </>
          ) : (
            <>
              <input type="text" placeholder="Company Name" className="border p-2 rounded w-full mb-2" value={companyData.name} onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })} />
              <input type="text" placeholder="Trading Name" className="border p-2 rounded w-full mb-2" value={companyData.trading_name} onChange={(e) => setCompanyData({ ...companyData, trading_name: e.target.value })} />
              <input type="text" placeholder="Company Number" className="border p-2 rounded w-full mb-2" value={companyData.number} onChange={(e) => setCompanyData({ ...companyData, number: e.target.value })} />
              <select value={companyData.type} onChange={(e) => setCompanyData({ ...companyData, type: e.target.value })} className="border p-2 rounded w-full">
                <option value="">Select Organisation Type</option>
                <option value="limited">Limited Company</option>
                <option value="unincorporated">Unincorporated</option>
              </select>
              <button type="button" className="text-blue-600 underline mt-2" onClick={() => setManualCompany(false)}>Use search instead</button>
            </>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Business Owners</h2>
          {owners.map((owner) => (
            <div key={owner.id} className="border p-4 rounded mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" value={owner.first_name} onChange={(e) => handleOwnerChange(owner.id, 'first_name', e.target.value)} className="border p-2 rounded w-full" />
                <input type="text" placeholder="Last Name" value={owner.last_name} onChange={(e) => handleOwnerChange(owner.id, 'last_name', e.target.value)} className="border p-2 rounded w-full" />
                <input type="date" value={owner.dob} onChange={(e) => handleOwnerChange(owner.id, 'dob', e.target.value)} className="border p-2 rounded w-full" />
                <PhoneInput country={'gb'} value={owner.phone} onChange={(value) => handleOwnerChange(owner.id, 'phone', value)} inputStyle={{ width: "100%" }} />
                <input type="file" onChange={(e) => handleOwnerChange(owner.id, 'proof_id', e.target.files?.[0])} className="border p-2 rounded w-full" />
                <input type="file" onChange={(e) => handleOwnerChange(owner.id, 'proof_address', e.target.files?.[0])} className="border p-2 rounded w-full" />
              </div>
              {owners.length > 1 && (
                <button type="button" onClick={() => removeOwner(owner.id)} className="text-red-500 mt-2 block">Remove Owner</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addOwner} className="bg-gray-200 px-4 py-2 rounded">Add Another Owner</button>
        </section>

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
