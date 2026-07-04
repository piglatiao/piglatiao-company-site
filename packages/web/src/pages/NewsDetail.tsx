import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { useSettings } from '../hooks/useSettings.js';

export default function NewsDetail() {
  const s = useSettings();
  const { id } = useParams();
  const { data: article, isLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: () => api.getArticle(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="container-content py-40 text-center text-ink-faint">加载中...</div>;
  }

  if (!article) {
    return (
      <div className="container-content py-40 text-center">
        <p className="text-ink-muted mb-4">文章不存在</p>
        <Link to="/news" className="btn-outline">返回列表</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <article>
        <section className="py-20 md:py-32 bg-paper-warm">
          <div className="container-content">
            <Link to="/news" className="text-sm text-ink-muted hover:text-accent transition-colors mb-8 inline-block">
              ← {s.news_back || '返回新闻列表'}
            </Link>
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                {article.isTop && (
                  <span className="text-xs px-2 py-0.5 bg-accent text-white rounded-sm">置顶</span>
                )}
                <span className="label-overline">{article.category}</span>
                <span className="text-xs text-ink-faint">
                  {new Date(article.publishedAt || article.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <h1 className="heading-display text-3xl md:text-5xl mb-6">
                {article.title}
              </h1>
              <p className="text-lg text-ink-muted leading-relaxed">
                {article.summary}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container-reading">
            {article.coverImage ? (
              <div className="aspect-[16/9] overflow-hidden rounded-sm mb-10 bg-paper-warm">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
            {article.content?.includes('<') ? (
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : (
              <div className="whitespace-pre-wrap text-ink-light leading-relaxed text-lg">
                {article.content}
              </div>
            )}
          </div>
        </section>
      </article>

      <section className="py-16 bg-paper-warm">
        <div className="container-content flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-ink-muted">{s.news_cta_text || '阅读完毕，还有其他想了解的吗？'}</p>
          <Link to="/contact" className="btn-outline">{s.news_cta_btn || '联系我们 →'}</Link>
        </div>
      </section>
    </div>
  );
}
