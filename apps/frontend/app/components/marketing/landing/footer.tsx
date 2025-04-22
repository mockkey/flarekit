import { RiSparklingFill } from "@remixicon/react";
import { Link } from "react-router";

const footerLinks = {
  Product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ]
};

export default function Footer() {
  return (
    <footer className="border-t bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo Column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <RiSparklingFill className="text-primary size-6" />
              <span className="text-xl font-bold">Flare Kit</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Build amazing web applications with React Router and Cloudflare
            </p>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold mb-3">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={{ pathname:'/', hash:link.href}}
                      className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} Flare Kit. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="https://twitter.com/yourusername"
              className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
            >
              Twitter
            </Link>
            <Link
              to="https://github.com/yourusername"
              className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
            >
              GitHub
            </Link>
            <Link
              to="https://discord.gg/yourinvite"
              className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
            >
              Discord
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
