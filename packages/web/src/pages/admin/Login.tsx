import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { adminApi } from '../../lib/adminApi.js';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const json = await adminApi.login(form);
      if (json.success && json.data) {
        login(json.data.accessToken, json.data.user);
        navigate('/admin');
      } else {
        setError(json.error?.message || '登录失败');
      }
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-2xl" />

      <div className="relative z-10 w-full max-w-md px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="inline-block w-10 h-10 bg-accent rounded-sm flex items-center justify-center">
              <span className="font-display text-paper text-xl font-semibold">N</span>
            </span>
            <span className="font-display text-2xl text-paper">NoteApp</span>
          </div>
          <h1 className="font-display text-3xl text-paper mb-2">管理后台</h1>
          <p className="text-sm text-paper/40">登录以管理你的网站内容</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-paper/50 uppercase tracking-wider mb-2">
              用户名
            </label>
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full bg-transparent border-b border-paper/20 py-3 text-paper placeholder-paper/30 focus:border-accent focus:outline-none transition-colors"
              placeholder="请输入用户名"
            />
          </div>
          <div>
            <label className="block text-xs text-paper/50 uppercase tracking-wider mb-2">
              密码
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-transparent border-b border-paper/20 py-3 text-paper placeholder-paper/30 focus:border-accent focus:outline-none transition-colors"
              placeholder="请输入密码"
            />
          </div>

          {error && (
            <p className="text-sm text-accent-light bg-accent/10 px-4 py-2 rounded-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent text-paper text-sm font-medium tracking-wide hover:bg-accent-light transition-colors disabled:opacity-50"
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>

        <p className="text-center text-xs text-paper/30 mt-8">
          测试账号：admin / admin123
        </p>
      </div>
    </div>
  );
}
