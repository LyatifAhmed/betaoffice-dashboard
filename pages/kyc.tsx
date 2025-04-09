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
        {/* Form JSX with labels and red asterisks goes here */}
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