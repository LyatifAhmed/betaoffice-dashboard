'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';



interface Props {
  lockedProductId: number;
  customerEmail: string;
}

interface Owner {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  phone_number?: string;
  proof_of_id?: File;
  proof_of_address?: File;
}

export default function KycForm({ lockedProductId, customerEmail }: Props) {
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
    proof_of_address: null as File | null,
    proof_of_id: null as File | null,
  });

  const [owners, setOwners] = useState<Owner[]>([
    {
      first_name: '',
      middle_name: '',
      last_name: '',
      date_of_birth: '',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const updateOwner = (index: number, field: string, value: string | File) => {
    const updated = [...owners];
    (updated[index] as any)[field] = value;
    setOwners(updated);
  };

  const addOwner = () => {
    setOwners((prev) => [...prev, { first_name: '', last_name: '', date_of_birth: '' }]);
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

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value as any);
      });
    
      data.append('product_id', lockedProductId.toString());
    
      owners.forEach((owner, i) => {
        data.append(`members[${i}][first_name]`, owner.first_name);
        data.append(`members[${i}][middle_name]`, owner.middle_name || '');
        data.append(`members[${i}][last_name]`, owner.last_name);
        data.append(`members[${i}][date_of_birth]`, owner.date_of_birth);
        data.append(`members[${i}][phone_number]`, owner.phone_number || '');
        if (owner.proof_of_id) {
          data.append(`members[${i}][proof_of_id]`, owner.proof_of_id);
        }
        if (owner.proof_of_address) {
          data.append(`members[${i}][proof_of_address]`, owner.proof_of_address);
        }
      });
    
      await axios.post('/api/submit-kyc', data);
      router.push('/kyc-submitted');
    } catch (error) {
      console.error(error);
      setMessage('❌ Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white shadow rounded space-y-6">
      <h2 className="text-2xl font-semibold">KYC Form</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input required name="company_name" onChange={handleChange} placeholder="Company Name" className="border p-2 rounded" />
        <input required name="trading_name" onChange={handleChange} placeholder="Trading Name" className="border p-2 rounded" />
        <select required name="organisation_type" onChange={handleChange} className="border p-2 rounded">
          <option value="">Select Organisation Type</option>
          <option value="1">Limited Company</option>
          <option value="3">Sole Trader</option>
          <option value="9">Unregistered</option>
          <option value="10">Charity</option>
        </select>
        <input name="limited_company_number" onChange={handleChange} placeholder="Company Number (optional)" className="border p-2 rounded" />
        <input name="phone_number" onChange={handleChange} placeholder="Business Phone Number" className="border p-2 rounded" />
      </div>

      <h3 className="font-medium mt-6">Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input required name="address_line_1" onChange={handleChange} placeholder="Address Line 1" className="border p-2 rounded" />
        <input name="address_line_2" onChange={handleChange} placeholder="Address Line 2" className="border p-2 rounded" />
        <input required name="city" onChange={handleChange} placeholder="City" className="border p-2 rounded" />
        <input required name="postcode" onChange={handleChange} placeholder="Postcode" className="border p-2 rounded" />
        <input required name="country" onChange={handleChange} placeholder="Country" className="border p-2 rounded" />
        <input required type="file" name="proof_of_address" onChange={handleFileChange} className="p-2" />
        <input required type="file" name="proof_of_id" onChange={handleFileChange} className="p-2" />
      </div>

      <h3 className="font-medium mt-6">Business Owners</h3>
      {owners.map((owner, i) => (
        <div key={i} className="border p-4 rounded mb-4 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input required value={owner.first_name} onChange={(e) => updateOwner(i, 'first_name', e.target.value)} placeholder="First Name" className="border p-2 rounded" />
            <input value={owner.middle_name} onChange={(e) => updateOwner(i, 'middle_name', e.target.value)} placeholder="Middle Name" className="border p-2 rounded" />
            <input required value={owner.last_name} onChange={(e) => updateOwner(i, 'last_name', e.target.value)} placeholder="Last Name" className="border p-2 rounded" />
            <input required type="date" value={owner.date_of_birth} onChange={(e) => updateOwner(i, 'date_of_birth', e.target.value)} className="border p-2 rounded" />
            <input value={owner.phone_number} onChange={(e) => updateOwner(i, 'phone_number', e.target.value)} placeholder="Phone Number" className="border p-2 rounded" />
            <input type="file" onChange={(e) => updateOwner(i, 'proof_of_id', e.target.files?.[0] || '')} className="p-2" />
            <input type="file" onChange={(e) => updateOwner(i, 'proof_of_address', e.target.files?.[0] || '')} className="p-2" />
          </div>
          {owners.length > 1 && (
            <button type="button" onClick={() => removeOwner(i)} className="text-red-500 text-sm">
              Remove Owner
            </button>
          )}
        </div>
      ))}

      <button type="button" onClick={addOwner} className="text-blue-600 underline">
        + Add Another Owner
      </button>

      <div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded mt-4">
          {loading ? 'Submitting…' : 'Submit KYC'}
        </button>
      </div>

      {message && <p className="text-center mt-4 text-sm">{message}</p>}
    </form>
  );
}
