// components/layout/DetailsArea.tsx
"use client";

export default function DetailsArea() {
  return (
    <div className="w-full flex justify-center px-2 sm:px-6 lg:px-3 pt-16">
      <div className="w-full max-w-[92rem] space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-xl p-6 space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            📄 Company Details
          </h2>

          <p className="text-sm text-white/80">
            This is a placeholder area for showing company information such as company name, registration number, and other relevant details.
          </p>

          <ul className="text-sm text-white/70 space-y-1 pl-4 list-disc">
            <li>Company Name: <strong>Generation Beta Digital Ltd</strong></li>
            <li>Incorporation Date: <strong>12 May 2023</strong></li>
            <li>Company Number: <strong>14351234</strong></li>
            <li>Registered Address: <strong>86-90 Paul Street, London EC2A 4NE, UK</strong></li>
            <li>Director: <strong>Latif [surname]</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
