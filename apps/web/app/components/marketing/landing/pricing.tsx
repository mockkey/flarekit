import { Button } from "@flarekit/ui/components/ui/button";
import { Check } from "lucide-react";
import { useTransition } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { authClient } from "~/features/auth/client/auth";
import { cn } from "~/lib/utils";

const plans = [
  {
    name: "Free",
    plan: "free",
    description: "Perfect for side projects and learning",
    price: "Free",
    features: [
      "Unlimited Public Projects",
      "Cloudflare D1 Database",
      "Edge Functions",
      "Basic Auth System",
      "Community Support",
    ],
    link: "/auth/sign-in",
    CTA: {
      type: "link",
      label: "Get Started",
      href: "/auth/sign-in",
    },
    buttonText: "Get Started",
  },
  {
    name: "Pro",
    plan: "pro",
    description: "For production applications and teams",
    price: "$19",
    period: "/month",
    features: [
      "Everything in Free, plus:",
      "Premium Auth Features",
      "Priority CDN Cache",
      "Advanced Analytics",
      "Email Support",
      "Custom Domains",
    ],
    link: "/auth/sign-in",
    CTA: {
      type: "button",
      label: "Start Trial",
    },
    buttonText: "Start Trial",
    highlight: true,
  },
];

export default function Pricing() {
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();
  const upgradeHandle = (plan: string) => {
    startTransition(async () => {
      const { error } = await authClient.subscription.upgrade({
        plan: plan,
        successUrl: "/dashboard",
        cancelUrl: "/billing",
      });
      if (error) {
        if (error.statusText === "Unauthorized") {
          navigate("/billing");
        } else {
          toast.error(error.message);
        }
      }
      return;
    });
  };

  return (
    <section id="pricing" className="py-20 px-4 bg-white dark:bg-black">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-300 dark:to-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Start for free, upgrade when you need it
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "p-8 rounded-2xl border",
                plan.highlight
                  ? "border-blue-500 dark:border-blue-500 shadow-lg"
                  : "border-gray-200 dark:border-gray-800",
                "bg-white dark:bg-gray-900",
              )}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-gray-600 dark:text-gray-400">
                    {plan.period}
                  </span>
                )}
              </div>

              <ul className="mb-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.CTA.type === "link" && (
                <Link to={plan.CTA.href!} className="block">
                  <Button size="lg" className="w-full rounded-full">
                    {plan.CTA.label}
                  </Button>
                </Link>
              )}
              {plan.CTA.type === "button" && (
                <Button
                  size="lg"
                  className="w-full rounded-full"
                  disabled={isPending}
                  onClick={() => {
                    upgradeHandle(plan.plan);
                  }}
                >
                  {plan.CTA.label}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
