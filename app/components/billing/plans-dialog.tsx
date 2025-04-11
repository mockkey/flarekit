import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@flarekit/ui/components/ui/dialog";
import { Button } from "@flarekit/ui/components/ui/button";
import { RiCheckLine } from "@remixicon/react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import { Badge } from "@flarekit/ui/components/ui/badge";
import { cn } from "~/lib/utils";
import { authClient } from "~/features/auth/client/auth";

interface Plan {
  name: string;
  description: string;
  price: string;
  features: { name: string; included: boolean }[];
  highlight?: boolean;
}

interface PlansDialogProps extends React.ComponentProps<typeof Button> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: Plan[];
  currentPlan: string;
}

export function PlansDialog({
  open,
  onOpenChange,
  plans,
  currentPlan,
}: PlansDialogProps) {

  const subscriptionHandle = async()=>{
    await authClient.subscription.upgrade({
        plan: "pro",
        successUrl: "/dashboard",
        cancelUrl: "/billing",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[720px] !max-w-[96%] ">
        <DialogHeader>
          <DialogTitle>Choose a Plan</DialogTitle>
          <DialogDescription>
            Select the plan that best fits your needs
          </DialogDescription>
        </DialogHeader>
        <div className=" flex flex-row  gap-6  mt-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn('w-[320px]',plan.highlight ? "border-primary" : undefined) }
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  {plan.highlight && <Badge variant="secondary">Popular</Badge>}
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.price !== "Free" && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature.name} className="flex items-center gap-2">
                      <div
                        className={`rounded-full p-1 ${
                          feature.included
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <RiCheckLine className="size-4" />
                      </div>
                      <span
                        className={
                          feature.included ? undefined : "text-muted-foreground"
                        }
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  className="mt-6 w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  onClick={() => {
                    subscriptionHandle()
                    toast.info(`Subscribing to ${plan.name} plan...`);
                    onOpenChange(false);
                  }}
                >
                  {currentPlan === plan.name
                    ? "Current Plan"
                    : `Subscribe to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
