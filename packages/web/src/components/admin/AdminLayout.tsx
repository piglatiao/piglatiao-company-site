import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

const navItems = [
  { path: '/admin', label: '控制台', icon: '▣' },
  { path: '/admin/products', label: '产品管理', icon: '◇' },
  { path: '/admin/articles', label: '新闻管理', icon: '◈' },
  { path: '/admin/contacts', label: '留言管理', icon: '☰' },
  { path: '/admin/users', label: '用户管理', icon: '◐' },
  { path: '/admin/settings', label: '系统设置', icon: '⚙' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex bg-paper-warm">
      {/* Sidebar */}
      <aside className="w-64 bg-ink text-paper flex flex-col fixed h-screen z-30">
        <div className="p-6 border-b border-paper/10">
          <NavLink to="/admin" className="flex items-center gap-2">
            <span className="inline-block w-8 h-8 bg-accent rounded-sm flex items-center justify-center">
              <span className="font-display text-paper text-lg font-semibold">N</span>
            </span>
            <span className="font-display text-lg">NoteApp</span>
            <span className="text-xs text-paper/40 ml-1">管理</span>
          </NavLink>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-paper/10 text-accent-light border-l-2 border-accent'
                    : 'text-paper/60 hover:text-paper hover:bg-paper/5 border-l-2 border-transparent'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-paper/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-paper/10 rounded-full flex items-center justify-center text-sm font-medium">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{user?.username}</p>
              <p className="text-xs text-paper/40">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-paper/50 hover:text-accent-light transition-colors py-2"
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
