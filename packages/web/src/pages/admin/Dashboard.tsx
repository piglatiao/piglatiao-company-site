import { useQuery } from '@tanstack/react-query';
import type { Contact } from '@noteapp/shared';
import { adminApi } from '../../lib/adminApi.js';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data: products } = useQuery({ queryKey: ['admin-products'], queryFn: () => adminApi.getProducts() });
  const { data: articles } = useQuery({ queryKey: ['admin-articles'], queryFn: () => adminApi.getArticles() });
  const { data: contacts } = useQuery({ queryKey: ['admin-contacts'], queryFn: () => adminApi.getContacts() });
  const { data: admins } = useQuery({ queryKey: ['admin-admins'], queryFn: () => adminApi.getAdmins() });

  const stats = [
    { label: '产品总数', value: products?.meta?.total ?? 0, path: '/admin/products', icon: '◇' },
    { label: '新闻文章', value: articles?.meta?.total ?? 0, path: '/admin/articles', icon: '◈' },
    { label: '联系留言', value: contacts?.meta?.total ?? 0, path: '/admin/contacts', icon: '☰' },
    { label: '管理员', value: admins?.meta?.total ?? 0, path: '/admin/users', icon: '◐' },
  ];

  const recentContacts = contacts?.data.slice(0, 5) || [];

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">控制台</h1>
      <p className="text-ink-muted text-sm mb-8">网站数据概览</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((stat, i) => (
          <Link
            key={stat.label}
            to={stat.path}
            className="card-paper p-6 group animate-fade-up opacity-start"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl text-ink-faint group-hover:text-accent transition-colors">
                {stat.icon}
              </span>
            </div>
            <p className="font-display text-3xl text-ink mb-1">{stat.value}</p>
            <p className="text-xs text-ink-muted uppercase tracking-wider">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Contacts */}
      <div className="card-paper p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">最近留言</h2>
          <Link to="/admin/contacts" className="text-sm text-accent hover:underline">
            查看全部 →
          </Link>
        </div>

        {recentContacts.length === 0 ? (
          <p className="text-sm text-ink-faint py-8 text-center">暂无留言</p>
        ) : (
          <div className="space-y-3">
            {recentContacts.map((c: Contact) => (
              <div
                key={c.id}
                className="flex items-center justify-between py-3 border-b border-line last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-ink-muted line-clamp-1">{c.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-sm ${
                      c.status === 1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {c.status === 1 ? '已处理' : '待处理'}
                  </span>
                  <span className="text-xs text-ink-faint">
                    {new Date(c.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/products" className="card-paper p-6 group">
          <p className="label-overline mb-2">快捷操作</p>
          <p className="font-display text-lg group-hover:text-accent transition-colors">添加产品 →</p>
        </Link>
        <Link to="/admin/articles" className="card-paper p-6 group">
          <p className="label-overline mb-2">快捷操作</p>
          <p className="font-display text-lg group-hover:text-accent transition-colors">发布新闻 →</p>
        </Link>
        <Link to="/admin/settings" className="card-paper p-6 group">
          <p className="label-overline mb-2">快捷操作</p>
          <p className="font-display text-lg group-hover:text-accent transition-colors">修改设置 →</p>
        </Link>
      </div>
    </div>
  );
}
