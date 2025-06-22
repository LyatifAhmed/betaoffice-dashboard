import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Mail, Info } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("mail");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Welcome, LYATIF</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="mail"><Mail className="w-4 h-4 mr-2" />Incoming Mail</TabsTrigger>
          <TabsTrigger value="details"><Info className="w-4 h-4 mr-2" />Details</TabsTrigger>
        </TabsList>

        <TabsContent value="mail">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">No scanned mail yet.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status: <span className="text-green-600">Active</span></span>
                <div className="flex gap-2">
                  <Button variant="destructive">Cancel Subscription</Button>
                  <Button>Generate PDF Certification</Button>
                </div>
              </div>

              <div>
                <h2 className="text-md font-semibold">Company</h2>
                <p>gen beta office services</p>
                <p>3 primrose close<br />london, SE63NR<br />GB</p>
              </div>

              <div>
                <h2 className="text-md font-semibold">Plan</h2>
                <p>Scan Lite (Monthly Generation Beta Digital)</p>
                <p className="text-sm text-gray-500">Start Date: 21st Jun 2025 – Ongoing</p>
              </div>

              <div>
                <h2 className="text-md font-semibold">Contact Info</h2>
                <p>Name: LYATIF REDZHEB</p>
                <p>Email: lyatifredzheb@gmail.com</p>
                <p>Phone: +44 7721810561</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
