import {
  RiDatabase2Line,
  RiMailSendLine,
  RiReactjsLine,
} from "@remixicon/react";
import { Cloud, Lock, Paintbrush, Rocket, Zap } from "lucide-react";

interface FeatureItem {
  title: string;
  description: string;
  icon: React.JSX.Element;
}

const features: FeatureItem[] = [
  {
    title: "React 19 & React Router",
    description:
      "Experience modern development with the latest React 19 and React Router",
    icon: (
      <RiReactjsLine className="h-6 w-6 text-blue-600 dark:text-blue-400" />
    ),
  },
  {
    title: "Cloudflare Deploy",
    description:
      "One-click deployment to Cloudflare Worker with global CDN acceleration",
    icon: <Cloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
  },
  {
    title: "D1 Database",
    description:
      "Integrated Cloudflare D1 SQLite database with edge computing capabilities",
    icon: (
      <RiDatabase2Line className="h-6 w-6 text-blue-600 dark:text-blue-400" />
    ),
  },
  {
    title: "HonoJS Integration",
    description: "Handle API requests with the lightweight HonoJS framework",
    icon: <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
  },
  {
    title: "Tailwind CSS",
    description:
      "Built-in Tailwind CSS support for rapid and beautiful UI development",
    icon: <Paintbrush className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
  },
  {
    title: "React Email",
    description:
      "Send beautiful email notifications with React Email and Resend",
    icon: (
      <RiMailSendLine className="h-6 w-6 text-blue-600 dark:text-blue-400" />
    ),
  },
  {
    title: "Better Auth",
    description:
      "Enhanced authentication solution supporting multiple login methods",
    icon: <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
  },
  {
    title: "Quick Start",
    description:
      "Pre-configured development environment to focus on business logic",
    icon: <Rocket className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 bg-white dark:bg-black">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-300 dark:to-white">
            Powerful Features
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Integrated with all the core functionalities needed for modern web
            development
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <div className="mb-4 inline-block p-3 rounded-full bg-blue-50 dark:bg-blue-900/30">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
