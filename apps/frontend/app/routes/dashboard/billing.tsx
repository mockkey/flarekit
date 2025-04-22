import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@flarekit/ui/components/ui/card";
import { Button } from "@flarekit/ui/components/ui/button";
import { RiCheckLine } from "@remixicon/react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@flarekit/ui/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { PlansDialog } from "~/components/billing/plans-dialog";

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
    ]
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
    ]
  }
];

export default function Billing() {
  const currentPlan = "Free";
  const [showPlansDialog, setShowPlansDialog] = useState(false);

  return (
    <div className="space-y-6">
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
            <Button onClick={() => setShowPlansDialog(true)}>
              {currentPlan === "Free" ? "Upgrade Now" : "Change Plan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment History Card */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            View your previous transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            No payment history available
          </div>
        </CardContent>
      </Card>

      {/* Plans Dialog */}
      <PlansDialog
        open={showPlansDialog}
        onOpenChange={setShowPlansDialog}
        plans={plans}
        currentPlan={currentPlan}
      />
    </div>
  );
}

// 移到一个单独的组件
function PlanDetailsDialog({ plan, open, onOpenChange }: {
  plan: Plan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{plan.name} Plan</DialogTitle>
          <DialogDescription>{plan.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Plan Features */}
          <div className="space-y-4">
            {plan.features.map((feature) => (
              <div key={feature.name} className="flex items-center gap-2">
                <div className={`rounded-full p-1 ${
                  feature.included 
                    ? "bg-primary/10 text-primary" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  <RiCheckLine className="size-4" />
                </div>
                <span className={feature.included ? undefined : "text-muted-foreground"}>
                  {feature.name}
                </span>
              </div>
            ))}
          </div>
          
          {/* Subscription Button */}
          <Button 
            className="w-full" 
            variant={plan.highlight ? "default" : "outline"}
            onClick={() => {
              // 实现订阅逻辑
              toast.info(`Subscribing to ${plan.name} plan...`);
              onOpenChange(false);
            }}
          >
            Subscribe to {plan.name}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
