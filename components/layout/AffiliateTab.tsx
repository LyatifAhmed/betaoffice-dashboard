"use client";

import { Card, CardContent } from "@/components/ui/card";

type Affiliate = {
  name: string;
  description: string;
  image: string;
  link: string;
};

const affiliates: Affiliate[] = [
  {
    name: "UK Company Formation",
    description: "Easily register your UK company online with our trusted partner.",
    image: "/affiliates/company-formation.jpg",
    link: "https://youraffiliateurl.com/company-formation"
  },
  {
    name: "Business Banking",
    description: "Open a UK business bank account remotely with our banking partner.",
    image: "/affiliates/business-banking.jpg",
    link: "https://youraffiliateurl.com/business-banking"
  },
  {
    name: "Accounting Services",
    description: "Get professional UK accounting and tax services at a fixed monthly fee.",
    image: "/affiliates/accounting.jpg",
    link: "https://youraffiliateurl.com/accounting"
  },
  {
    name: "Virtual Numbers",
    description: "Get a UK business phone number to stay connected with customers.",
    image: "/affiliates/virtual-number.jpg",
    link: "https://youraffiliateurl.com/virtual-number"
  }
];

export default function AffiliateTab() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
        Recommended Partners
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {affiliates.map((a, idx) => (
          <Card
            key={idx}
            className="glass-card hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
            onClick={() => window.open(a.link, "_blank")}
          >
            <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
              <img
                src={a.image}
                alt={a.name}
                className="w-full h-32 object-cover rounded-lg"
              />
              <h2 className="text-lg font-medium">{a.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {a.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
