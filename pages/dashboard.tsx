import DashboardLayout from "@/components/layout/DashboardLayout";
import MailArea from "@/components/layout/MailArea";

// TEST VERİLERİ
const dummyMails = [
  {
    id: "1",
    sender: "HMRC",
    category: "government",
    summary: "Your tax documents are ready.",
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
    fileUrl: "https://example.com/fake.pdf",
  },
  {
    id: "2",
    sender: "Barclays",
    category: "bank",
    summary: "New statement available.",
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 27).toISOString(),
    fileUrl: "https://example.com/fake.pdf",
  },
  {
    id: "3",
    sender: "DVLA",
    category: "urgent",
    summary: "Vehicle tax payment is due.",
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    fileUrl: null, // expired
  },
    {
    id: "1",
    sender: "HMRC",
    category: "government",
    summary: "Your tax documents are ready.",
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
    fileUrl: "https://example.com/fake.pdf",
  },
  {
    id: "2",
    sender: "Barclays",
    category: "bank",
    summary: "New statement available.",
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 27).toISOString(),
    fileUrl: "https://example.com/fake.pdf",
  },
  {
    id: "3",
    sender: "DVLA",
    category: "urgent",
    summary: "Vehicle tax payment is due.",
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    fileUrl: null, // expired
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <MailArea mails={dummyMails} />
    </DashboardLayout>
  );
}
