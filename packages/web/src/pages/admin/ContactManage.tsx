import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Contact } from '@noteapp/shared';
import { adminApi } from '../../lib/adminApi.js';

export default function ContactManage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-contacts'], queryFn: () => adminApi.getContacts() });
  const contacts = data?.data || [];
  const [replyTarget, setReplyTarget] = useState<Contact | null>(null);
  const [replyText, setReplyText] = useState('');

  const replyMut = useMutation({
    mutationFn: ({ id, reply }: { id: number; reply: string }) => adminApi.replyContact(id, reply),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-contacts'] }); setReplyTarget(null); setReplyText(''); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminApi.deleteContact(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-contacts'] }),
  });

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyTarget) replyMut.mutate({ id: replyTarget.id, reply: replyText });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl">留言管理</h1>
        <p className="text-sm text-ink-muted">共 {data?.meta?.total ?? 0} 条留言</p>
      </div>

      {isLoading ? (
        <p className="text-center py-10 text-ink-faint">加载中...</p>
      ) : (
        <div className="space-y-4">
          {contacts.length === 0 ? (
            <p className="text-center py-10 text-ink-faint">暂无留言</p>
          ) : (
            contacts.map((c: Contact) => (
              <div key={c.id} className="card-paper p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium">{c.name}</span>
                      {c.company && <span className="text-sm text-ink-muted">· {c.company}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-sm ${c.status === 1 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {c.status === 1 ? '已处理' : '待处理'}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-ink-faint">
                      {c.email && <span>{c.email}</span>}
                      {c.phone && <span>{c.phone}</span>}
                      <span>{new Date(c.createdAt).toLocaleString('zh-CN')}</span>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => { setReplyTarget(c); setReplyText(c.reply || ''); }}
                      className="text-accent hover:underline text-xs mr-3"
                    >
                      {c.status === 1 ? '查看回复' : '回复'}
                    </button>
                    <button
                      onClick={() => { if (confirm('确认删除？')) deleteMut.mutate(c.id); }}
                      className="text-red-500 hover:underline text-xs"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <p className="text-sm text-ink-light mb-2 bg-paper-warm p-3 rounded-sm">{c.message}</p>
                {c.reply && (
                  <p className="text-sm text-ink-muted italic">
                    <span className="text-accent">回复：</span>{c.reply}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Reply Modal */}
      {replyTarget && (
        <div className="fixed inset-0 bg-ink/50 z-50 flex items-center justify-center p-4" onClick={() => setReplyTarget(null)}>
          <div className="bg-paper-card rounded-sm max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl mb-4">回复留言</h2>
            <div className="mb-4 p-3 bg-paper-warm rounded-sm">
              <p className="text-sm font-medium mb-1">{replyTarget.name}</p>
              <p className="text-sm text-ink-muted">{replyTarget.message}</p>
            </div>
            <form onSubmit={handleReply} className="space-y-4">
              <div>
                <label className="label-overline block mb-1">回复内容 *</label>
                <textarea
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent focus:outline-none"
                  placeholder="输入回复内容"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary" disabled={replyMut.isPending}>
                  {replyMut.isPending ? '发送中...' : '发送回复'}
                </button>
                <button type="button" onClick={() => setReplyTarget(null)} className="btn-outline">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
