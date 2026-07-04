import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { ProductListItem } from '@noteapp/shared';
import { api } from '../lib/api.js';
import { useSettings } from '../hooks/useSettings.js';

export default function Products() {
  const s = useSettings();
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.getProducts(1, 20),
  });
  const productItems = products?.data || [];

  return (
    <div className="animate-fade-in">
      <section className="py-20 md:py-32 bg-paper-warm">
        <div className="container-content">
          <p className="label-overline mb-6">{s.products_label || '产品与服务'}</p>
          <h1 className="heading-display text-4xl md:text-6xl mb-6">
            {s.products_title || '为知识而生的解决方案'}
          </h1>
          <p className="text-ink-muted max-w-xl">
            {s.products_subtitle || '从个人笔记到企业知识库，我们提供全方位的知识管理产品和服务'}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-content">
          {isLoading ? (
            <div className="text-center py-20 text-ink-faint">加载中...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {productItems.map((p: ProductListItem, i: number) => (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="card-paper p-8 md:p-10 group animate-fade-up opacity-start"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {p.coverImage ? (
                    <div className="aspect-[16/10] overflow-hidden rounded-sm mb-6 bg-paper-warm">
                      <img
                        src={p.coverImage}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : null}
                  <div className="flex items-start justify-between mb-6">
                    <span className="font-display text-3xl text-ink-faint group-hover:text-accent transition-colors">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs px-3 py-1 bg-paper-warm text-ink-muted rounded-sm">
                      {p.category || '未分类'}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl mb-4 group-hover:text-accent transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-ink-muted leading-relaxed mb-6 line-clamp-2">
                    {p.summary}
                  </p>
                  <span className="text-sm text-accent link-underline">{s.products_detail_link || '了解详情 →'}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
