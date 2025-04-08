import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import { Button } from "@flarekit/ui/components/ui/button";
import { PlansDialog } from "~/components/billing/plans-dialog";
import { useState } from "react";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  name: string;
  description: string;
  price: string;
  features: PlanFeature[];
  highlight?: boolean;
}

const plans: Plan[] = [
  {
    name: "Free",
    description: "Perfect for trying out FlareKit",
    price: "Free",
    features: [
      { name: "3 projects", included: true },
      { name: "Basic analytics", included: true },
      { name: "48-hour support response time", included: true },
      { name: "Discord community access", included: true },
      { name: "API Rate Limit: 1000 req/day", included: false },
      { name: "Team collaboration", included: false },
    ],
  },
  {
    name: "Pro",
    description: "For professional developers",
    price: "$15/month",
    highlight: true,
    features: [
      { name: "Unlimited projects", included: true },
      { name: "Advanced analytics", included: true },
      { name: "12-hour support response time", included: true },
      { name: "Discord community access", included: true },
      { name: "API Rate Limit: 10000 req/day", included: true },
      { name: "Team collaboration", included: true },
    ],
  },
];

export default function Billing() {
  const currentPlan = "Free";
  const [showPlansDialog, setShowPlansDialog] = useState(currentPlan == "Free");
  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>
            Manage your subscription and billing details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Current Plan: {currentPlan}</h3>
              <p className="text-sm text-muted-foreground">
                Your plan renews on January 1, 2025
              </p>
            </div>
            {currentPlan === "Free" ? (
              <Button onClick={() => setShowPlansDialog(true)}>
                Upgrade Now
              </Button>
            ) : (
              <Button variant="outline">Manage Subscription</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View your previous transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            No payment history available
          </div>
        </CardContent>
      </Card>
      {/* plans */}
      <PlansDialog
        asChild
        open={showPlansDialog}
        onOpenChange={setShowPlansDialog}
        plans={plans}
        currentPlan={currentPlan}
      />
    </div>
  );
}
