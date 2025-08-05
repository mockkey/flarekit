import type { ComponentType } from "react";
import { matchPath, useLocation } from "react-router";
import { DocsLayout } from "~/components/docs/DocsLayout";
import { MDXProviderWrapper } from "~/components/docs/MDXProvider";

// Pre-import known MDX files
const contentModules = import.meta.glob<{ default: ComponentType }>(
  "./content/**/*.mdx",
  {
    eager: true,
  },
);

const DocsPage = () => {
  const { pathname } = useLocation();
  // Match the path pattern
  const match = matchPath(
    {
      path: "/:section?/:subsection?",
      end: false,
    },
    pathname,
  );

  // Handle the path segments
  let path = "introduction";
  if (match?.params) {
    const { section, subsection } = match.params;
    if (section && subsection) {
      path = `${section}/${subsection}`;
    } else if (section) {
      path = section;
    }
  }

  // Get the MDX content
  const modulePath = `./content/${path}.mdx`;
  const Content =
    contentModules[modulePath]?.default ||
    contentModules["./content/404.mdx"].default;
  return (
    <DocsLayout>
      <MDXProviderWrapper>
        <Content />
      </MDXProviderWrapper>
    </DocsLayout>
  );
};

export default DocsPage;
