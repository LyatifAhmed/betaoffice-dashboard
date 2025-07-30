// pages/admin/owners.tsx
import { useEffect, useState } from "react";
import axios from "axios";

type Owner = {
  id: number;
  name: string;
  email: string;
  subscriptionId: string;
  companyName: string;
};

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await axios.get("/api/admin/owners");
        setOwners(res.data);
      } catch (err) {
        console.error("Failed to fetch owners:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Company Owners</h1>

      {loading ? (
        <p>Loading...</p>
      ) : owners.length === 0 ? (
        <p>No owners found.</p>
      ) : (
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2 border-b">Name</th>
              <th className="text-left p-2 border-b">Email</th>
              <th className="text-left p-2 border-b">Company Name</th>
              <th className="text-left p-2 border-b">Subscription ID</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((owner) => (
              <tr key={owner.id} className="hover:bg-gray-50">
                <td className="p-2 border-b">{owner.name}</td>
                <td className="p-2 border-b">{owner.email}</td>
                <td className="p-2 border-b">{owner.companyName}</td>
                <td className="p-2 border-b">{owner.subscriptionId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
