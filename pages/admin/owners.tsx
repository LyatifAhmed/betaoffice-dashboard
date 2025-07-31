import { useEffect, useState } from "react";

type Owner = {
  id: number;
  name: string;
  email: string;
  dob: string;
  company: string;
  externalId: string;
};

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);

  useEffect(() => {
    fetch("/api/admin/owners")
      .then((res) => res.json())
      .then((data) => setOwners(data))
      .catch((err) => console.error("Failed to fetch owners:", err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Invited Owners</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">DOB</th>
            <th className="border p-2">Company</th>
            <th className="border p-2">Subscription ID</th>
          </tr>
        </thead>
        <tbody>
          {owners.map((owner) => (
            <tr key={owner.id}>
              <td className="border p-2">{owner.name}</td>
              <td className="border p-2">{owner.email}</td>
              <td className="border p-2">{owner.dob}</td>
              <td className="border p-2">{owner.company}</td>
              <td className="border p-2">{owner.externalId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
