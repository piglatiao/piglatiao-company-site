import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { ArticleListItem, ProductListItem } from "@noteapp/shared";
import { api } from "../lib/api.js";
import { useSettings } from "../hooks/useSettings.js";

export default function Home() {
  const s = useSettings();
  const { data: company } = useQuery({ queryKey: ["company"], queryFn: api.getCompany });
  const { data: productResponse } = useQuery({
    queryKey: ["products-home"],
    queryFn: () => api.getProducts(1, 3),
  });
  const { data: articleResponse } = useQuery({
    queryKey: ["articles-home"],
    queryFn: () => api.getArticles(1, 3),
  });
  const products = productResponse?.data || [];
  const articles = articleResponse?.data || [];

  const heroTitle = s.home_hero_title || "让每一次记录都有价值";
  const heroSubtitle = s.home_hero_subtitle || company?.description || "";
  const heroAccent = s.home_hero_accent || "记录";
  const ctaTitle = s.home_cta_title || "开始你的知识管理之旅";
  const ctaSubtitle = s.home_cta_subtitle || "联系我们，了解如何通过 NoteApp 的产品和服务提升团队效率";

  // 将标题中的强调词替换为带样式的版本
  const renderTitle = (title: string, accent: string) => {
    if (title.includes(accent)) {
      const parts = title.split(accent);
      return (
        <>
          {parts[0]}<span className="text-accent italic">{accent}</span>{parts[1]}
        </>
      );
    }
    return title;
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-paper-warm via-paper to-paper" />
        <div className="absolute top-1/2 right-0 w-[40%] h-[60%] bg-accent/5 rounded-full blur-3xl" />

        <div className="container-content relative z-10 py-20">
          <div className="max-w-3xl">
            <p className="label-overline animate-fade-in opacity-start mb-6">
              {s.home_hero_label || "NoteApp 科技 · 知识管理"}
            </p>
            <h1 className="heading-display text-5xl md:text-7xl lg:text-8xl mb-8 animate-fade-up opacity-start delay-100">
              {renderTitle(heroTitle, heroAccent)}
            </h1>
            <p className="text-lg md:text-xl text-ink-muted leading-relaxed max-w-xl mb-10 animate-fade-up opacity-start delay-300">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up opacity-start delay-500">
              <Link to="/products" className="btn-primary">{s.home_hero_btn1 || "探索产品"}</Link>
              <Link to="/about" className="btn-outline">{s.home_hero_btn2 || "了解更多"}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-24 md:py-32">
        <div className="container-content">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="label-overline mb-3">{s.home_products_label || "产品与服务"}</p>
              <h2 className="heading-section">{s.home_products_title || "我们的解决方案"}</h2>
            </div>
            <Link to="/products" className="hidden md:inline-block text-sm text-ink-muted hover:text-accent transition-colors link-underline">
              {s.home_products_link || "查看全部 →"}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((p: ProductListItem, i: number) => (
              <Link key={p.id} to={`/products/${p.id}`} className="card-paper p-8 group animate-fade-up opacity-start" style={{ animationDelay: `${i * 120}ms` }}>
                {p.coverImage ? (
                  <div className="aspect-[4/3] overflow-hidden rounded-sm mb-6 bg-paper-warm">
                    <img
                      src={p.coverImage}
                      alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-accent-subtle rounded-sm flex items-center justify-center mb-6">
                    <span className="font-display text-accent text-xl font-medium">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                )}
                <h3 className="font-display text-xl mb-3 group-hover:text-accent transition-colors">{p.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed line-clamp-3">{p.summary}</p>
                <span className="inline-block mt-6 text-xs text-ink-faint group-hover:text-accent transition-colors">{p.category} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section className="py-24 md:py-32 bg-paper-warm">
        <div className="container-content">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="label-overline mb-3">{s.home_news_label || "新闻动态"}</p>
              <h2 className="heading-section">{s.home_news_title || "最新资讯"}</h2>
            </div>
            <Link to="/news" className="hidden md:inline-block text-sm text-ink-muted hover:text-accent transition-colors link-underline">
              {s.home_news_link || "查看全部 →"}
            </Link>
          </div>
          <div className="space-y-0">
            {articles.map((a: ArticleListItem, i: number) => (
              <Link key={a.id} to={`/news/${a.id}`} className="block py-8 border-t border-line group animate-fade-up opacity-start" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8">
                  <span className="font-display text-2xl md:text-3xl text-ink-faint group-hover:text-accent transition-colors min-w-[3rem]">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {a.isTop && <span className="text-xs px-2 py-0.5 bg-accent text-white rounded-sm">置顶</span>}
                      <span className="text-xs text-ink-faint">{a.category}</span>
                      <span className="text-xs text-ink-faint">{new Date(a.publishedAt || a.createdAt).toLocaleDateString("zh-CN")}</span>
                    </div>
                    <h3 className="font-display text-xl md:text-2xl mb-2 group-hover:text-accent transition-colors">{a.title}</h3>
                    <p className="text-sm text-ink-muted line-clamp-2">{a.summary}</p>
                  </div>
                  {a.coverImage ? (
                    <div className="w-full md:w-44 aspect-[4/3] rounded-sm overflow-hidden bg-paper">
                      <img
                        src={a.coverImage}
                        alt={a.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32">
        <div className="container-content text-center">
          <h2 className="heading-display text-4xl md:text-5xl mb-6">
            {ctaTitle}
          </h2>
          <p className="text-ink-muted mb-8 max-w-lg mx-auto">{ctaSubtitle}</p>
          <Link to="/contact" className="btn-primary">{s.home_cta_btn || "联系我们"}</Link>
        </div>
      </section>
    </div>
  );
}
