// components/KycForm.tsx
'use client';

import React, { useState } from 'react';
import axios from 'axios';

const initialForm = {
  external_id: '',
  product_id: 2736,
  customer: {
    first_name: '',
    middle_name: '',
    last_name: '',
    email_address: '',
  },
  shipping_address: {
    shipping_address_line_1: '',
    shipping_address_line_2: '',
    shipping_address_line_3: '',
    shipping_address_city: '',
    shipping_address_postcode: '',
    shipping_address_state: '',
    shipping_address_country: 'GB',
  },
  subscription: {
    start_date: new Date().toISOString(),
  },
  company: {
    name: '',
    trading_name: '',
    limited_company_number: '',
    abn_number: '',
    acn_number: '',
    organisation_type: 1,
    telephone_number: '',
  },
  members: [
    {
      first_name: '',
      middle_name: '',
      last_name: '',
      phone_number: '',
      date_of_birth: '',
    },
  ],
};

const KycForm = () => {
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    const update = { ...formData };
    if (keys.length === 1) update[name] = value;
    else if (keys.length === 2) update[keys[0]][keys[1]] = value;
    else if (keys.length === 3) update[keys[0]][parseInt(keys[1])][keys[2]] = value;
    setFormData(update);
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const addOwner = () => {
    setFormData((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        { first_name: '', middle_name: '', last_name: '', phone_number: '', date_of_birth: '' },
      ],
    }));
  };

  const removeOwner = (index: number) => {
    const updated = [...formData.members];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, members: updated }));
  };

  const validateForm = () => {
    const requiredFields = [
      'external_id',
      'customer.first_name',
      'customer.last_name',
      'customer.email_address',
      'shipping_address.shipping_address_line_1',
      'shipping_address.shipping_address_city',
      'shipping_address.shipping_address_postcode',
      'shipping_address.shipping_address_country',
      'company.name',
      'company.limited_company_number',
      'company.abn_number',
      'company.acn_number',
      'company.telephone_number',
    ];

    const errors: Record<string, string> = {};

    for (const field of requiredFields) {
      const keys = field.split('.');
      const value = keys.length === 1
        ? formData[keys[0]]
        : formData[keys[0]][keys[1]];
      if (!value) errors[field] = 'This field is required';
    }

    formData.members.forEach((member, i) => {
      ['first_name', 'last_name', 'phone_number', 'date_of_birth'].forEach((key) => {
        if (!member[key]) {
          errors[`members.${i}.${key}`] = 'This field is required';
        }
      });
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        'https://hoxton-api-backend.onrender.com/api/create-subscription',
        formData
      );
      setStatus('✅ Subscription created');
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Unknown error occurred';
      setStatus(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label: string, name: string, type = 'text') => {
    const keys = name.split('.');
    let value = '';
    if (keys.length === 1) value = formData[keys[0]];
    else if (keys.length === 2) value = formData[keys[0]][keys[1]];
    else if (keys.length === 3) value = formData[keys[0]][parseInt(keys[1])][keys[2]];

    return (
      <div>
        <input
          name={name}
          type={type}
          placeholder={label}
          value={value}
          onChange={handleChange}
          className="input"
        />
        {formErrors[name] && <p className="text-red-600 text-sm">{formErrors[name]}</p>}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-xl font-bold mb-4">Dynamic KYC Form</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderField('External ID', 'external_id')}
        <select name="product_id" onChange={handleChange} value={formData.product_id} className="input">
          <option value={2736}>Monthly</option>
          <option value={2737}>Annual</option>
        </select>

        <h3 className="font-semibold">Customer</h3>
        {renderField('First Name', 'customer.first_name')}
        {renderField('Middle Name', 'customer.middle_name')}
        {renderField('Last Name', 'customer.last_name')}
        {renderField('Email', 'customer.email_address')}

        <h3 className="font-semibold">Shipping Address</h3>
        {renderField('Address Line 1', 'shipping_address.shipping_address_line_1')}
        {renderField('Address Line 2', 'shipping_address.shipping_address_line_2')}
        {renderField('Address Line 3', 'shipping_address.shipping_address_line_3')}
        {renderField('City', 'shipping_address.shipping_address_city')}
        {renderField('Postcode', 'shipping_address.shipping_address_postcode')}
        {renderField('State', 'shipping_address.shipping_address_state')}

        <h3 className="font-semibold">Company</h3>
        {renderField('Company Name', 'company.name')}
        {renderField('Trading Name', 'company.trading_name')}
        {renderField('Company Number', 'company.limited_company_number')}
        {renderField('ABN', 'company.abn_number')}
        {renderField('ACN', 'company.acn_number')}
        {renderField('Phone Number', 'company.telephone_number')}

        <h3 className="font-semibold">Business Owners</h3>
        {formData.members.map((member, index) => (
          <div key={index} className="border p-3 rounded mb-2">
            {renderField('First Name', `members.${index}.first_name`)}
            {renderField('Middle Name', `members.${index}.middle_name`)}
            {renderField('Last Name', `members.${index}.last_name`)}
            {renderField('Phone', `members.${index}.phone_number`)}
            {renderField('Date of Birth', `members.${index}.date_of_birth`, 'date')}
            {formData.members.length > 1 && (
              <button type="button" onClick={() => removeOwner(index)} className="text-red-600 text-sm mt-1">
                Remove Owner
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addOwner} className="text-blue-600 text-sm">
          + Add Another Owner
        </button>

        <button
          type="submit"
          className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit KYC & Create Subscription'}
        </button>

        {status && <div className="text-sm mt-4 p-2 bg-gray-100 rounded">{status}</div>}
      </form>
    </div>
  );
};

export default KycForm;
