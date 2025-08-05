import { Button } from "@flarekit/ui/components/ui/button";
import { ScrollArea } from "@flarekit/ui/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@flarekit/ui/components/ui/sheet";
import { RiMenu2Fill } from "@remixicon/react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "~/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface Breadcrumb {
  href: string;
  label: string;
}

type NavigationItem = {
  title: string;
  href: string;
  target?: string;
};

const navigation: {
  title: string;
  items: NavigationItem[];
}[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/introduction" },
      { title: "Quick Start", href: "/getting-started" },
      { title: "Quick Start with API", href: "/api/getting-started" },
    ],
  },
  {
    title: "API Reference",
    items: [{ title: "Swagger", href: "/api/swagger" }],
  },
  {
    title: "LLM resources",
    items: [{ title: "llms", href: "/llms.txt", target: "_blank" }],
  },
];

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Extract headings from content and ensure they have IDs
  useEffect(() => {
    // Reset state on route change
    setHeadings([]);
    setActiveHeading("");

    if (!contentRef.current) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // Only look for headings in the main content area
    const mainContent = contentRef.current.querySelector(".prose");
    if (!mainContent) return;

    const headingElements = mainContent.querySelectorAll(
      "h1, h2, h3, h4, h5, h6",
    );
    const extractedHeadings = Array.from(headingElements)
      .filter((el) => {
        // Check if heading is in a response example or code block
        const isInResponse = el.closest(".response-example") !== null;
        const isInCodeBlock = el.closest("pre") !== null;
        const isInCode = el.closest("code") !== null;
        const isInExample = el.closest(".example") !== null;

        // Include headings that are not in response examples or code blocks
        return !isInResponse && !isInCodeBlock && !isInCode && !isInExample;
      })
      .map((el) => {
        // Generate ID if not exists
        if (!el.id) {
          const text = el.textContent || "";
          el.id = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        }
        return {
          id: el.id,
          text: el.textContent || "",
          level: Number.parseInt(el.tagName[1], 10),
        };
      });

    // Only set headings if we found valid ones
    if (extractedHeadings.length > 0) {
      setHeadings(extractedHeadings);
    }

    // Set up new intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
            // Update URL hash without scrolling
            window.history.replaceState(null, "", `#${entry.target.id}`);
          }
        });
      },
      {
        rootMargin: "-100px 0px -66% 0px",
        threshold: 0,
      },
    );

    observerRef.current = observer;
    headingElements.forEach((el) => observer.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [location.pathname]);

  // Handle anchor clicks
  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Generate breadcrumbs
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment: string, index: number) => {
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
    return {
      href,
      label:
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
    };
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)] mt-16">
      {/* Mobile menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild className="lg:hidden fixed top-20 left-4 z-50">
          <Button variant="outline" size="icon">
            <RiMenu2Fill className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0">
          <ScrollArea className="h-full py-6">
            <div className="px-4">
              <Link to="/" className="flex items-center space-x-2 mb-6">
                <span className="font-bold text-xl">FlareKit</span>
              </Link>
              <nav className="space-y-6">
                {navigation.map((group) => (
                  <div key={group.title}>
                    <h3 className="font-semibold mb-2 text-sm text-muted-foreground">
                      {group.title}
                    </h3>
                    <ul className="space-y-1">
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            to={item.href}
                            className={cn(
                              "block py-1 text-sm hover:text-foreground",
                              location.pathname === item.href
                                ? "text-foreground font-medium"
                                : "text-muted-foreground",
                            )}
                            target={item.target}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar - Fixed */}
      <aside className="hidden lg:block fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] border-r bg-muted/40 z-30">
        <ScrollArea className="h-full py-6">
          <div className="px-4">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <span className="font-bold text-xl">FlareKit</span>
            </Link>
            <nav className="space-y-6">
              {navigation.map((group) => (
                <div key={group.title}>
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground">
                    {group.title}
                  </h3>
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          target={item.target}
                          className={cn(
                            "block py-1 text-sm hover:text-foreground",
                            location.pathname === item.href
                              ? "text-foreground font-medium"
                              : "text-muted-foreground",
                          )}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </ScrollArea>
      </aside>

      {/* Main content - With padding for fixed sidebars */}
      <main className="flex-1 lg:ml-64 xl:mr-48">
        <div className="container max-w-3xl mx-auto px-6 py-8 lg:py-12">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            {breadcrumbs.map((crumb: Breadcrumb, index: number) => (
              <div key={crumb.href} className="flex items-center">
                <span className="mx-2">/</span>
                <Link
                  to={crumb.href}
                  className={cn(
                    "hover:text-foreground",
                    index === breadcrumbs.length - 1 &&
                      "text-foreground font-medium",
                  )}
                >
                  {crumb.label}
                </Link>
              </div>
            ))}
          </nav>

          {/* Content */}
          <div
            ref={contentRef}
            className="prose prose-slate dark:prose-invert max-w-none"
          >
            {children}
          </div>

          {/* Documentation Footer */}
          <footer className="mt-16 pt-8 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  FlareKit
                </Link>
                <span className="text-sm text-muted-foreground">·</span>
                <Link
                  to="/docs"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Documentation
                </Link>
                <span className="text-sm text-muted-foreground">·</span>
                <Link
                  to="https://github.com/mockkey/flarekit"
                  target="_blank"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  GitHub
                </Link>
              </div>
              <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} FlareKit. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* Table of contents - Fixed */}
      {headings.length > 0 && (
        <aside className="hidden xl:block fixed right-0 top-16 w-48 h-[calc(100vh-4rem)] border-l bg-muted/40 z-30">
          <ScrollArea className="h-full py-6">
            <div className="px-4">
              <h4 className="font-semibold mb-4 text-sm">On This Page</h4>
              <nav className="space-y-1">
                {headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    onClick={(e) => handleAnchorClick(e, heading.id)}
                    className={cn(
                      "block py-1 text-sm hover:text-foreground",
                      "text-muted-foreground",
                      heading.level === 1 && "font-medium",
                      heading.level === 2 && "pl-2",
                      heading.level === 3 && "pl-4",
                      heading.level === 4 && "pl-6",
                      heading.level === 5 && "pl-8",
                      heading.level === 6 && "pl-10",
                      activeHeading === heading.id &&
                        "text-foreground font-medium",
                    )}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </div>
          </ScrollArea>
        </aside>
      )}
    </div>
  );
}
