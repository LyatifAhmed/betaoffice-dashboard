'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Select from 'react-select';
import countryList from 'react-select-country-list';

interface Props {
  lockedProductId: number;
  customerEmail: string;
  token: string;
}

interface Owner {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  phone_number?: string;
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

export default function KycForm({ lockedProductId, customerEmail, token }: Props) {
  const [formData, setFormData] = useState({
    company_name: '',
    trading_name: '',
    organisation_type: '',
    limited_company_number: '',
    email: customerEmail,
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
    {
      first_name: '',
      middle_name: '',
      last_name: '',
      date_of_birth: '',
      phone_number: '',
      email: '',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const countries = countryList().getData();
  const router = useRouter();

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
    setOwners((prev) => [
      ...prev,
      {
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        phone_number: '',
        email: '',
      },
    ]);
  };

  const removeOwner = (index: number) => {
    if (owners.length > 1) {
      setOwners((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    for (const [i, owner] of owners.entries()) {
      if (!owner.first_name || !owner.last_name || !owner.date_of_birth || !owner.email) {
        setMessage(`❌ All required fields must be filled for owner ${i + 1}`);
        setLoading(false);
        return;
      }

      const age = Math.floor((Date.now() - new Date(owner.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      if (age < 18) {
        setMessage(`❌ Owner ${i + 1} must be at least 18 years old`);
        setLoading(false);
        return;
      }
    }

    try {
      const data = {
        ...formData,
        product_id: lockedProductId,
        token,
        members: owners,
      };

      console.log("Submitting KYC Payload:", data);

      await axios.post('https://hoxton-api-backend.onrender.com/api/submit-kyc', data);
      router.push('/kyc-submitted');
    } catch (err) {
      console.error('❌ KYC Submission Error:', err);
      setMessage('❌ Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white shadow rounded space-y-6">
      <h2 className="text-2xl font-semibold">KYC Form</h2>

      {/* Contact and Company Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">First Name <span className="text-red-500">*</span>
          <input required name="customer_first_name" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Last Name <span className="text-red-500">*</span>
          <input required name="customer_last_name" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Company Name <span className="text-red-500">*</span>
          <input required name="company_name" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Trading Name
          <input name="trading_name" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Organisation Type <span className="text-red-500">*</span>
          <Select
            options={businessTypes}
            onChange={(option) => handleSelectChange('organisation_type', option?.value || '')}
            className="w-full"
          />
        </label>
        <label className="block">Company Number
          <input name="limited_company_number" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Phone Number
          <input name="phone_number" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Email Address <span className="text-red-500">*</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            readOnly
            className="border p-2 rounded w-full bg-gray-100 text-gray-700 cursor-not-allowed"
          />
          <p className="text-sm text-gray-500 mt-1">This email was used during payment and cannot be changed.</p>
        </label>
      </div>

      {/* Address */}
      <h3 className="font-medium mt-6">Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">Address Line 1 <span className="text-red-500">*</span>
          <input required name="address_line_1" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Address Line 2
          <input name="address_line_2" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">City <span className="text-red-500">*</span>
          <input required name="city" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Postcode <span className="text-red-500">*</span>
          <input required name="postcode" onChange={handleChange} className="border p-2 rounded w-full" />
        </label>
        <label className="block">Country <span className="text-red-500">*</span>
          <Select
            options={countries}
            getOptionLabel={(e) => `${e.label} (${e.value})`}
            onChange={(option) => handleSelectChange('country', option?.value || '')}
            className="w-full"
          />
        </label>
      </div>

      {/* Owners */}
      <h3 className="font-medium mt-6">Business Owners</h3>
      {owners.map((owner, i) => (
        <div key={i} className="border p-4 rounded mb-4 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">First Name <span className="text-red-500">*</span>
              <input required value={owner.first_name} onChange={(e) => updateOwner(i, 'first_name', e.target.value)} className="border p-2 rounded w-full" />
            </label>
            <label className="block">Middle Name
              <input value={owner.middle_name} onChange={(e) => updateOwner(i, 'middle_name', e.target.value)} className="border p-2 rounded w-full" />
            </label>
            <label className="block">Last Name <span className="text-red-500">*</span>
              <input required value={owner.last_name} onChange={(e) => updateOwner(i, 'last_name', e.target.value)} className="border p-2 rounded w-full" />
            </label>
            <label className="block">Date of Birth <span className="text-red-500">*</span>
              <input required type="date" value={owner.date_of_birth} onChange={(e) => updateOwner(i, 'date_of_birth', e.target.value)} className="border p-2 rounded w-full" />
            </label>
            <label className="block">Phone Number
              <input value={owner.phone_number} onChange={(e) => updateOwner(i, 'phone_number', e.target.value)} className="border p-2 rounded w-full" />
            </label>
            <label className="block">Email Address <span className="text-red-500">*</span>
              <input type="email" required value={owner.email} onChange={(e) => updateOwner(i, 'email', e.target.value)} className="border p-2 rounded w-full" />
            </label>
          </div>

          {owners.length > 1 && (
            <button type="button" onClick={() => removeOwner(i)} className="text-red-500 text-sm">Remove Owner</button>
          )}
        </div>
      ))}
      <button type="button" onClick={addOwner} className="text-blue-600 underline">+ Add Another Owner</button>
      <div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded mt-4">
          {loading ? 'Submitting…' : 'Submit KYC'}
        </button>
      </div>
      {message && <p className="text-center mt-4 text-sm text-red-600">{message}</p>}
    </form>
  );
}

