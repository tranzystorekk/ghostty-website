import Breadcrumbs, { Breadcrumb } from "@/components/breadcrumbs";
import CustomMDX from "@/components/custom-mdx";
import NavTree, { NavTreeNode } from "@/components/nav-tree";
import ScrollToTopButton from "@/components/scroll-to-top";
import Sidecar from "@/components/sidecar";
import { H1, P } from "@/components/text";
import NavFooterLayout from "@/layouts/nav-footer-layout";
import {
  DocsPageData,
  loadAllDocsPageSlugs,
  loadDocsPage,
} from "@/lib/fetch-docs";
import { loadDocsNavTreeData } from "@/lib/fetch-nav";
import { navTreeToBreadcrumbs } from "@/lib/nav-tree-to-breadcrumbs";
import { Pencil } from "lucide-react";
import s from "./DocsPage.module.css";
import { useState } from "react";

// This is the location that we expect our docs mdx files to be located,
// relative to the root of the Next.js project.
const DOCS_DIRECTORY = "./docs";
const GITHUB_REPO_URL = "https://github.com/ghostty-org/website";
// This is the URL path for all of our docs pages
const DOCS_PAGES_ROOT_PATH = "/docs";

export async function getStaticPaths() {
  const docsPageSlugs = await loadAllDocsPageSlugs(DOCS_DIRECTORY);
  return {
    paths: docsPageSlugs.map((slug: string): StaticPropsParams => {
      return {
        params: {
          path: slug.split("/"),
        },
      };
    }),
    fallback: false,
  };
}

interface StaticPropsParams {
  params: {
    path: Array<string>;
  };
}

export async function getStaticProps({ params: { path } }: StaticPropsParams) {
  const activePageSlug = path.join("/");
  const navTreeData = await loadDocsNavTreeData(DOCS_DIRECTORY, activePageSlug);
  const docsPageData = await loadDocsPage(DOCS_DIRECTORY, activePageSlug);
  const breadcrumbs = navTreeToBreadcrumbs(
    "Ghostty Docs",
    DOCS_PAGES_ROOT_PATH,
    navTreeData,
    activePageSlug
  );
  return {
    props: {
      navTreeData,
      docsPageData,
      breadcrumbs,
    },
  };
}

interface DocsPageProps {
  navTreeData: NavTreeNode[];
  docsPageData: DocsPageData;
  breadcrumbs: Breadcrumb[];
}

export default function DocsPage({
  navTreeData,
  docsPageData: { title, description, content, relativeFilePath, pageHeaders },
  breadcrumbs,
}: DocsPageProps) {
  const [inViewHeaderIDs, setInViewHeaderIDs] = useState<string[]>([]);
  return (
    <NavFooterLayout
      meta={{
        title: breadcrumbs
          .slice(1)
          .reverse()
          .slice(0, 2)
          .map((breadcrumb) => breadcrumb.text)
          .join(" - "),
        description,
      }}
    >
      <div className={s.docsPage}>
        <div className={s.sidebar}>
          <div className={s.sidebarContentWrapper}>
            <NavTree
              rootPath={DOCS_PAGES_ROOT_PATH}
              className={s.sidebarNavTree}
              nodes={navTreeData}
            />
          </div>
        </div>

        <main className={s.contentWrapper}>
          <ScrollToTopButton />

          <div className={s.docsContentWrapper}>
            <div className={s.breadcrumbsBar}>
              <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className={s.heading}>
              <H1>{title}</H1>
              <P className={s.description} weight="regular">
                {description}
              </P>
            </div>
            <CustomMDX
              content={content}
              onHeadersInViewChanged={(headerIDs) => {
                setInViewHeaderIDs(headerIDs);
              }}
            />
            <br />
            <div>
              <a href={`${GITHUB_REPO_URL}/edit/main/${relativeFilePath}`}>
                Edit on GitHub <Pencil size={14} />
              </a>
            </div>
          </div>

          <Sidecar
            title="On this page"
            inViewHeaderIDs={inViewHeaderIDs}
            className={s.sidecar}
            items={pageHeaders}
          />
        </main>
      </div>
    </NavFooterLayout>
  );
}
