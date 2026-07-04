import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { ArticleListItem } from '@noteapp/shared';
import { api } from '../lib/api.js';
import { useSettings } from '../hooks/useSettings.js';

export default function News() {
  const s = useSettings();
  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: () => api.getArticles(1, 20),
  });
  const articleItems = articles?.data || [];

  return (
    <div className="animate-fade-in">
      <section className="py-20 md:py-32 bg-paper-warm">
        <div className="container-content">
          <p className="label-overline mb-6">{s.news_label || '新闻动态'}</p>
          <h1 className="heading-display text-4xl md:text-6xl mb-6">
            {s.news_title || '最新资讯'}
          </h1>
          <p className="text-ink-muted max-w-xl">
            {s.news_subtitle || '了解 NoteApp 的最新产品动态和行业趋势'}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-content">
          {isLoading ? (
            <div className="text-center py-20 text-ink-faint">加载中...</div>
          ) : (
            <div className="space-y-0">
              {articleItems.map((a: ArticleListItem, i: number) => (
                <Link
                  key={a.id}
                  to={`/news/${a.id}`}
                  className="block py-8 border-t border-line group animate-fade-up opacity-start"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <span className="font-display text-2xl md:text-3xl text-ink-faint group-hover:text-accent transition-colors min-w-[3rem]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {a.isTop && (
                          <span className="text-xs px-2 py-0.5 bg-accent text-white rounded-sm">置顶</span>
                        )}
                        <span className="text-xs text-ink-faint">{a.category}</span>
                        <span className="text-xs text-ink-faint">
                          {new Date(a.publishedAt || a.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <h3 className="font-display text-xl md:text-2xl mb-2 group-hover:text-accent transition-colors">
                        {a.title}
                      </h3>
                      <p className="text-sm text-ink-muted line-clamp-2">{a.summary}</p>
                    </div>
                    {a.coverImage ? (
                      <div className="w-full md:w-48 aspect-[4/3] rounded-sm overflow-hidden bg-paper-warm">
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
          )}
        </div>
      </section>
    </div>
  );
}
