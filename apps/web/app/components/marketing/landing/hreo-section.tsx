import { Button } from "@flarekit/ui/components/ui/button";
import { RiGithubFill } from "@remixicon/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

export default function HreoSection() {
  return (
    <section
      className="relative flex flex-col items-center justify-center py-20"
      aria-label="Nextjs Starter Kit Hero"
    >
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#8080800_1px,transparent_1px),linear-gradient(to_bottom,#8080800_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 dark:bg-blue-500 opacity-20 blur-[100px]" />
      </div>
      <div className="space-y-6 text-center max-w-4xl px-4">
        <div className="mx-auto w-fit rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 px-4 py-1 mb-6">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-200">
            <span>The Ultimate remix.js Starter Kit</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-300 dark:to-white animate-gradient-x pb-2">
          Build Faster with <br className="hidden sm:block" />
          React Router Kit
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Launch your web application in minutes with our production-ready React
          Router and Cloudflare starter kit. Everything you need, from auth to
          edge computing.
        </p>
        <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
          <Link to="/dashboard">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 h-12"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Link
            to="https://github.com/mockkey/flarekit"
            target="_blank"
            className="flex items-center gap-2 rounded-full px-6 py-2 h-12 border-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="View on GitHub"
          >
            <RiGithubFill />
            <span>Star on GitHub</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
