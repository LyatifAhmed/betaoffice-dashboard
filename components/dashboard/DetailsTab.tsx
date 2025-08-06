// components/dashboard/DetailsTab.tsx
import { Card, CardContent } from "@/components/ui/card";
import SubscriptionControls from "./SubscriptionControls";
import WalletSection from "../WalletSection";

export default function DetailsTab({ subscription, wallet }: any) {
  return (
    <Card className="glass-card">
      <CardContent className="p-6 space-y-6">
        <SubscriptionControls
          stripeSubscriptionId={subscription.stripe_subscription_id}
          externalId={subscription.external_id}
          hoxtonStatus={subscription.hoxton_status || ""}
          cancelAtPeriodEnd={subscription.cancel_at_period_end || false}
          reviewStatus={subscription.review_status}
        />
        <WalletSection
          externalId={subscription.external_id}
          balance={wallet?.balance_pennies || 0}
          customerEmail={subscription.customer_email}
        />
      </CardContent>
    </Card>
  );
}
