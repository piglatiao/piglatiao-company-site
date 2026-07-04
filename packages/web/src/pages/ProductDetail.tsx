import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { useSettings } from '../hooks/useSettings.js';

export default function ProductDetail() {
  const s = useSettings();
  const { id } = useParams();
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.getProduct(Number(id)),
    enabled: !!id,
  });

  if (isLoading) return <div className="container-content py-40 text-center text-ink-faint">加载中...</div>;
  if (!product) return <div className="container-content py-40 text-center">产品不存在</div>;

  return (
    <div className="animate-fade-in">
      <article className="py-16 md:py-24">
        <div className="container-content">
          <Link to="/products" className="text-sm text-ink-muted hover:text-accent transition-colors mb-8 inline-block">
            ← {s.products_back || '返回产品列表'}
          </Link>

          <div className="max-w-4xl">
            {product.coverImage ? (
              <div className="aspect-[16/9] overflow-hidden rounded-sm mb-8 bg-paper-warm">
                <img
                  src={product.coverImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            <div className="flex items-center gap-4 mb-6">
              {product.category && (
                <span className="text-xs px-3 py-1 bg-paper-warm text-ink-muted rounded-sm">
                  {product.category}
                </span>
              )}
              <span className="text-xs text-ink-faint">
                {new Date(product.createdAt).toLocaleDateString('zh-CN')}
              </span>
            </div>

            <h1 className="heading-display text-4xl md:text-6xl mb-6">{product.title}</h1>
            <p className="text-lg text-ink-muted mb-12 leading-relaxed">{product.summary}</p>

            <div className="divider-fade mb-12" />

            <div
              className="prose prose-lg max-w-none text-ink-light leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.content?.replace(/\n/g, '<br/>') }}
            />

            <div className="mt-16 pt-8 border-t border-line">
              <h3 className="font-display text-2xl mb-6">{s.products_cta_title || '想要了解更多？'}</h3>
              <Link to="/contact" className="btn-primary">
                {s.products_cta_btn || '咨询此产品 →'}
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
