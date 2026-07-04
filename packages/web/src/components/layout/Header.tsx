import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSettings } from "../../hooks/useSettings.js";
import { api } from '../../lib/api.js';

export default function Header() {
  const s = useSettings();
  const { data: company } = useQuery({ queryKey: ['company'], queryFn: api.getCompany });
  const navItems = [
    { path: '/', label: s.nav_home || '首页' },
    { path: '/about', label: s.nav_about || '关于' },
    { path: '/products', label: s.nav_products || '产品' },
    { path: '/news', label: s.nav_news || '动态' },
    { path: '/contact', label: s.nav_contact || '联系' },
  ];
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-paper/85 backdrop-blur-md border-b border-line'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="container-content flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            {company?.logo ? (
              <img
                src={company.logo}
                alt={company.name || s.site_title || '站点 Logo'}
                className="w-8 h-8 rounded-sm object-cover border border-line/60 bg-paper"
              />
            ) : (
              <span className="inline-block w-8 h-8 bg-ink rounded-sm flex items-center justify-center transition-colors group-hover:bg-accent">
                <span className="font-display text-paper text-lg font-semibold">N</span>
              </span>
            )}
            <span className="font-display text-lg font-medium tracking-tight">
              {s.site_title || 'NoteApp'}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm tracking-wide transition-colors duration-300 link-underline ${
                  location.pathname === item.path
                    ? 'text-accent'
                    : 'text-ink-light hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Toggle */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="菜单"
          >
            <span className={`block w-5 h-px bg-ink transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
            <span className={`block w-5 h-px bg-ink transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-px bg-ink transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-paper transition-transform duration-500 md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="flex flex-col items-center justify-center h-full gap-8">
          {navItems.map((item, i) => (
            <Link
              key={item.path}
              to={item.path}
              className="font-display text-3xl text-ink hover:text-accent transition-colors"
              style={{
                animation: mobileOpen ? `fadeUp 0.4s ease forwards` : 'none',
                animationDelay: `${i * 80}ms`,
                opacity: mobileOpen ? 0 : 1,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
