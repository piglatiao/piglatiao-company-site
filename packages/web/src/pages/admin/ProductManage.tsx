import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Product } from '@noteapp/shared';
import { adminApi } from '../../lib/adminApi.js';

type ProductForm = {
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  category: string;
  sort: number;
  status: number;
};

const emptyForm: ProductForm = {
  title: '',
  summary: '',
  content: '',
  coverImage: '',
  category: '',
  sort: 0,
  status: 1,
};

export default function ProductManage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-products'], queryFn: () => adminApi.getProducts() });
  const products = data?.data || [];
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);

  const createMut = useMutation({
    mutationFn: (payload: ProductForm) => adminApi.createProduct(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); setShowForm(false); setForm(emptyForm); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductForm }) => adminApi.updateProduct(id, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); setShowForm(false); setEditing(null); setForm(emptyForm); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminApi.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMut.mutate({ id: editing.id, payload: form });
    } else {
      createMut.mutate(form);
    }
  };

  const handleEdit = (p: Product) => {
    setEditing(p);
    setForm({
      title: p.title,
      summary: p.summary || '',
      content: p.content,
      coverImage: p.coverImage || '',
      category: p.category || '',
      sort: p.sort,
      status: p.status,
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('确定删除此产品？')) deleteMut.mutate(id);
  };

  const inputCls = 'w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent focus:outline-none';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">产品管理</h1>
          <p className="text-sm text-ink-muted">共 {data?.meta?.total ?? 0} 条</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}
          className="btn-primary"
        >
          + 添加产品
        </button>
      </div>

      {showForm && (
        <div className="card-paper p-6 mb-6">
          <h2 className="font-display text-xl mb-4">{editing ? '编辑产品' : '新建产品'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-overline block mb-1">标题 *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="label-overline block mb-1">分类</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="label-overline block mb-1">摘要</label>
              <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} className={inputCls} />
            </div>
            <div>
              <label className="label-overline block mb-1">封面图片 URL</label>
              <input
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                placeholder="https://example.com/product-cover.jpg"
                className={inputCls}
              />
              {form.coverImage ? (
                <img
                  src={form.coverImage}
                  alt="产品封面预览"
                  className="mt-3 w-36 h-24 rounded-sm object-cover border border-line"
                />
              ) : null}
            </div>
            <div>
              <label className="label-overline block mb-1">内容 *</label>
              <textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} className={inputCls} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label-overline block mb-1">排序</label>
                <input type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })} className={inputCls} />
              </div>
              <div>
                <label className="label-overline block mb-1">状态</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: Number(e.target.value) })} className={inputCls}>
                  <option value={1}>上架</option>
                  <option value={0}>下架</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary" disabled={createMut.isPending || updateMut.isPending}>
                {createMut.isPending || updateMut.isPending ? '保存中...' : '保存'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-outline">
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <p className="text-center py-10 text-ink-faint">加载中...</p>
      ) : (
        <div className="card-paper overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-paper-warm">
                <th className="text-left px-4 py-3 font-medium text-ink-muted">封面</th>
                <th className="text-left px-4 py-3 font-medium text-ink-muted">标题</th>
                <th className="text-left px-4 py-3 font-medium text-ink-muted">分类</th>
                <th className="text-left px-4 py-3 font-medium text-ink-muted">排序</th>
                <th className="text-left px-4 py-3 font-medium text-ink-muted">状态</th>
                <th className="text-right px-4 py-3 font-medium text-ink-muted">操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: Product) => (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper-warm/50">
                  <td className="px-4 py-3">
                    {p.coverImage ? (
                      <img
                        src={p.coverImage}
                        alt={p.title}
                        className="w-16 h-12 rounded-sm object-cover border border-line"
                      />
                    ) : (
                      <span className="text-xs text-ink-faint">无</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{p.title}</td>
                  <td className="px-4 py-3 text-ink-muted">{p.category || '-'}</td>
                  <td className="px-4 py-3 text-ink-muted">{p.sort}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-sm ${p.status === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.status === 1 ? '上架' : '下架'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(p)} className="text-accent hover:underline mr-3 text-xs">编辑</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-xs">删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
