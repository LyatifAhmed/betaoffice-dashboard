import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";

interface Owner {
  id: number;
  name: string;
  email: string;
  subscriptionId: string;
  companyName: string;
  reviewStatus: string;
}

export default function OwnersPanel() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await axios.get("/api/admin/owners");
        setOwners(res.data);
      } catch {
        toast.error("Sahipler yüklenemedi");
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);

  if (loading) return <p className="text-sm text-gray-600">Yükleniyor...</p>;

  return (
    <Card className="p-4">
      <CardContent>
        <h2 className="text-xl font-semibold mb-4">Şirket Üyeleri (Owners)</h2>
        {owners.length === 0 ? (
          <p className="text-gray-500">Hiç üye bulunamadı.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İsim</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Şirket</TableHead>
                <TableHead>KYC Durumu</TableHead>
                <TableHead>Aksiyon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {owners.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell>{owner.name}</TableCell>
                  <TableCell>{owner.email}</TableCell>
                  <TableCell>{owner.companyName}</TableCell>
                  <TableCell>
                    <Badge variant={owner.reviewStatus === "SUBMITTED" ? "default" : "secondary"}>
                      {owner.reviewStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {owner.reviewStatus === "NO_ID" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const kycUrl = `/kyc?email=${encodeURIComponent(owner.email)}`;
                          navigator.clipboard.writeText(kycUrl);
                          toast.success("KYC linki panoya kopyalandı");
                        }}
                      >
                        Link Kopyala
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
