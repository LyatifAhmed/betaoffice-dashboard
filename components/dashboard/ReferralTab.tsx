// components/dashboard/ReferralTab.tsx
import { Card, CardContent } from "@/components/ui/card";
import ReferralSection from "../ReferralSection";
import AffiliateCards from "../AffiliateCards";

export default function ReferralTab({ subscription }: any) {
  return (
    <Card className="glass-card">
      <CardContent className="p-6 space-y-6">
        <ReferralSection
          userEmail={subscription.customer_email}
          walletBalance={subscription.wallet?.balance_pennies / 100 || 0}
          subscriptionId={subscription.id}
        />
        <AffiliateCards />
      </CardContent>
    </Card>
  );
}
