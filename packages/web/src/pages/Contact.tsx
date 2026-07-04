import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { useSettings } from '../hooks/useSettings.js';

export default function Contact() {
  const s = useSettings();
  const { data: company } = useQuery({ queryKey: ['company'], queryFn: api.getCompany });
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setError('');

    try {
      await api.submitContact(form);
      setStatus('success');
      setForm({ name: '', email: '', phone: '', company: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setError(err.message || '提交失败，请稍后重试');
    }
  };

  const inputClass = 'w-full bg-transparent border-b border-line py-3 text-ink placeholder-ink-faint focus:border-accent focus:outline-none transition-colors';

  return (
    <div className="animate-fade-in">
      <section className="py-20 md:py-32 bg-paper-warm">
        <div className="container-content">
          <p className="label-overline mb-6">{s.contact_label || '联系我们'}</p>
          <h1 className="heading-display text-4xl md:text-6xl mb-6">
            {s.contact_title || '让我们聊聊'}
          </h1>
          <p className="text-ink-muted max-w-xl">
            {s.contact_subtitle || '无论是产品咨询、技术合作还是其他事宜，我们都很乐意倾听'}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20">
            {/* Form */}
            <div>
              {status === 'success' ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-6 bg-accent-subtle rounded-full flex items-center justify-center">
                    <span className="text-3xl text-accent">✓</span>
                  </div>
                  <h3 className="font-display text-2xl mb-3">{s.contact_success_title || '提交成功'}</h3>
                  <p className="text-ink-muted mb-6">{s.contact_success_desc || '我们会尽快与您联系'}</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="btn-outline"
                  >
                    {s.contact_success_btn || '再发一条'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="label-overline block mb-2">{s.contact_form_name || '姓名'} *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputClass}
                      placeholder="您的姓名"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label-overline block mb-2">{s.contact_form_email || '邮箱'}</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={inputClass}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="label-overline block mb-2">{s.contact_form_phone || '电话'}</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className={inputClass}
                        placeholder="13800000000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label-overline block mb-2">{s.contact_form_company || '公司'}</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className={inputClass}
                      placeholder="公司名称（选填）"
                    />
                  </div>
                  <div>
                    <label className="label-overline block mb-2">{s.contact_form_message || '留言'} *</label>
                    <textarea
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={4}
                      className={inputClass + ' resize-none'}
                      placeholder="请描述您的需求或问题"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-sm text-accent">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    {status === 'submitting' ? '发送中...' : (s.contact_form_submit || '发送留言')}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <p className="label-overline mb-3">{s.contact_info_address || '地址'}</p>
                <p className="font-display text-xl">{company?.address || '中国 · 上海'}</p>
              </div>
              <div className="divider-fade" />
              <div>
                <p className="label-overline mb-3">{s.contact_info_email || '邮箱'}</p>
                <p className="font-display text-xl">{company?.email || 'contact@noteapp.com'}</p>
              </div>
              <div className="divider-fade" />
              <div>
                <p className="label-overline mb-3">{s.contact_info_phone || '电话'}</p>
                <p className="font-display text-xl">{company?.phone || '021-1234-5678'}</p>
              </div>
              <div className="divider-fade" />
              <div>
                <p className="label-overline mb-3">{s.contact_info_wechat || '微信'}</p>
                <p className="font-display text-xl">{company?.wechat || 'NoteAppTech'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
