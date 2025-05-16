import type { Subscription } from "@better-auth/stripe";
import { Badge } from "@flarekit/ui/components/ui/badge";
import { Button } from "@flarekit/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@flarekit/ui/components/ui/table";
import { useEffect, useState } from "react";
import { PlansDialog } from "~/components/billing/plans-dialog";
import {
  useSubscriptionList,
  useSubscriptionSession,
} from "~/features/auth/hooks/use-subscription";
import { formatDateToLong } from "~/lib/utils";

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
  const [currentPlan, setCurrentPlan] = useState<Subscription>();
  const [showPlansDialog, setShowPlansDialog] = useState(false);
  const getSubscriptionSession = useSubscriptionSession();
  const { isPending, data: list } = useSubscriptionList();

  useEffect(() => {
    if (list) {
      const activeSubscription = list?.find(
        (sub) => sub.status === "active" || sub.status === "trialing",
      );

      activeSubscription &&
        setCurrentPlan({
          ...activeSubscription,
        });
    }
  }, []);

  const subscriptionSession = async () => {
    getSubscriptionSession.mutate();
  };

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
              <h3 className="font-medium">
                Current Plan: {currentPlan?.plan ? currentPlan.plan : "free"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentPlan?.periodStart &&
                  `Your plan renews on ${formatDateToLong(currentPlan?.periodStart)}`}
              </p>
            </div>
            {!currentPlan || currentPlan?.plan === "Free" ? (
              <Button
                disabled={isPending}
                onClick={() => setShowPlansDialog(true)}
              >
                Upgrade Now
              </Button>
            ) : currentPlan?.cancelAtPeriodEnd ? (
              <Button
                disabled={getSubscriptionSession.isPending}
                onClick={() => {
                  subscriptionSession();
                }}
              >
                Manage Subscription
              </Button>
            ) : (
              <Button
                disabled={getSubscriptionSession.isPending}
                variant="destructive"
                onClick={() => {
                  subscriptionSession();
                }}
              >
                Manage Subscription
              </Button>
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
          {list && list.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period Start</TableHead>
                  <TableHead>Period End</TableHead>
                  <TableHead>Auto Renew</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium capitalize">
                      {subscription.plan}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          subscription.status === "trialing"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDateToLong(subscription.periodStart!)}
                    </TableCell>
                    <TableCell>
                      {formatDateToLong(subscription.periodEnd!)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          subscription.cancelAtPeriodEnd
                            ? "destructive"
                            : "default"
                        }
                      >
                        {subscription.cancelAtPeriodEnd ? "No" : "Yes"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No payment history available
            </div>
          )}
        </CardContent>
      </Card>
      {/* plans */}
      <PlansDialog
        asChild
        open={showPlansDialog}
        onOpenChange={setShowPlansDialog}
        plans={plans}
        currentPlan={"free"}
      />
    </div>
  );
}
