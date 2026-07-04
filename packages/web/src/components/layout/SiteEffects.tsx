import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSettings } from "../../hooks/useSettings.js";

const PAGE_TITLE_RULES: Array<{ title: string; match: (pathname: string) => boolean }> = [
  { title: "首页", match: (pathname) => pathname === "/" },
  { title: "关于我们", match: (pathname) => pathname === "/about" },
  { title: "产品中心", match: (pathname) => pathname === "/products" },
  { title: "产品详情", match: (pathname) => pathname.startsWith("/products/") },
  { title: "新闻动态", match: (pathname) => pathname === "/news" },
  { title: "新闻详情", match: (pathname) => pathname.startsWith("/news/") },
  { title: "联系我们", match: (pathname) => pathname === "/contact" },
];

/**
 * 根据当前路由解析浏览器标题前缀。
 */
function resolvePageTitle(pathname: string): string {
  return PAGE_TITLE_RULES.find((rule) => rule.match(pathname))?.title || "NoteApp";
}

/**
 * 更新或创建指定名称的 meta 标签，保证站点描述等配置能同步到页面头部。
 */
function syncMetaTag(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!content.trim()) {
    meta?.remove();
    return;
  }

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}

/**
 * 清理由站点配置动态注入的 GA 脚本，避免 React 严格模式下重复插入。
 */
function cleanupAnalyticsScripts() {
  document
    .querySelectorAll('script[data-noteapp-ga="true"]')
    .forEach((script) => script.remove());
}

export default function SiteEffects() {
  const { pathname } = useLocation();
  const settings = useSettings();

  useEffect(() => {
    const siteTitle = settings.site_title?.trim() || "NoteApp";
    const pageTitle = resolvePageTitle(pathname);
    document.title = pathname === "/" ? siteTitle : `${pageTitle} - ${siteTitle}`;

    syncMetaTag(
      "description",
      settings.site_description?.trim() || "专注于高效笔记与知识管理解决方案",
    );
    syncMetaTag("copyright", settings.site_copyright?.trim() || "");
  }, [
    pathname,
    settings.site_copyright,
    settings.site_description,
    settings.site_title,
  ]);

  useEffect(() => {
    const measurementId = settings.google_analytics?.trim() || "";
    cleanupAnalyticsScripts();

    if (!measurementId) {
      return;
    }

    const externalScript = document.createElement("script");
    externalScript.async = true;
    externalScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      measurementId,
    )}`;
    externalScript.dataset.noteappGa = "true";

    const inlineScript = document.createElement("script");
    inlineScript.dataset.noteappGa = "true";
    inlineScript.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', ${JSON.stringify(measurementId)});
    `;

    document.head.appendChild(externalScript);
    document.head.appendChild(inlineScript);

    return () => {
      externalScript.remove();
      inlineScript.remove();
    };
  }, [settings.google_analytics]);

  return null;
}
