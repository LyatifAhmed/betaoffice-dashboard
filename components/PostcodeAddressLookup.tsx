"use client";
import { useState } from "react";
import axios from "axios";

export default function PostcodeAddressLookup({
  postcode,
  onPostcodeChange,
  onSelectAddress,
}: {
  postcode: string;
  onPostcodeChange: (value: string) => void;
  onSelectAddress: (fullAddress: string) => void;
}) {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAddresses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `https://api.getAddress.io/find/${postcode}?api-key=${process.env.NEXT_PUBLIC_GETADDRESS_API_KEY}`
      );
      setAddresses(res.data.addresses);
    } catch (err) {
      setError("Postcode not found or invalid.");
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block font-semibold">UK Postcode Lookup</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={postcode}
          onChange={(e) => onPostcodeChange(e.target.value)}
          placeholder="E.g. W1A 1AA"
          className="border p-2 rounded w-full"
        />
        <button
          type="button"
          onClick={fetchAddresses}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Searching…" : "Find Address"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {addresses.length > 0 && (
        <select
          onChange={(e) => onSelectAddress(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option>Select an address</option>
          {addresses.map((addr, i) => (
            <option key={i} value={addr}>
              {addr}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
