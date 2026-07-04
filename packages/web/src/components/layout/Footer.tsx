import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { useSettings } from '../../hooks/useSettings.js';

export default function Footer() {
  const s = useSettings();
  const { data: company } = useQuery({ queryKey: ['company'], queryFn: api.getCompany });
  const copyrightText = s.site_copyright || s.footer_copyright || '© 2026 NoteApp 科技. All rights reserved.';
  const sloganText = s.site_slogan || s.footer_slogan || '现代简约 · 精致极简';
  const icpText = s.icp?.trim();

  const navItems = [
    { path: '/', label: s.nav_home || '首页' },
    { path: '/about', label: s.nav_about || '关于' },
    { path: '/products', label: s.nav_products || '产品' },
    { path: '/news', label: s.nav_news || '动态' },
    { path: '/contact', label: s.nav_contact || '联系' },
  ];

  return (
    <footer className="bg-ink text-paper mt-24">
      <div className="container-content py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              {company?.logo ? (
                <img
                  src={company.logo}
                  alt={company.name || s.site_title || '站点 Logo'}
                  className="w-8 h-8 rounded-sm object-cover border border-paper/10 bg-paper"
                />
              ) : (
                <span className="inline-block w-8 h-8 bg-accent rounded-sm flex items-center justify-center">
                  <span className="font-display text-paper text-lg font-semibold">N</span>
                </span>
              )}
              <span className="font-display text-lg font-medium">{s.site_title || 'NoteApp 科技'}</span>
            </div>
            {s.site_description ? (
              <p className="text-xs text-paper/40 mb-3">{s.site_description}</p>
            ) : null}
            <p className="text-sm text-paper/60 leading-relaxed max-w-sm">
              {s.footer_about || company?.description || '专注于高效笔记与知识管理解决方案，通过创新的产品和服务，帮助用户更好地记录、整理和分享信息。'}
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="label-overline text-paper/40 mb-4">{s.footer_nav_title || '导航'}</p>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-sm text-paper/70 hover:text-accent-light transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="label-overline text-paper/40 mb-4">{s.footer_contact_title || '联系'}</p>
            <ul className="space-y-2 text-sm text-paper/70">
              <li>{company?.email || 'contact@noteapp.com'}</li>
              <li>{company?.phone || '021-1234-5678'}</li>
              <li>{company?.address || '中国 · 上海'}</li>
              <li className="pt-2">
                <a href="#" className="text-paper/70 hover:text-accent-light transition-colors">
                  {company?.wechat ? `${s.contact_info_wechat || '微信'}：${company.wechat}` : (s.contact_info_wechat || '微信：NoteAppTech')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-paper/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-paper/40">
            {copyrightText}
          </p>
          <div className="flex flex-col items-center md:items-end gap-1">
            {icpText ? <p className="text-xs text-paper/40">{icpText}</p> : null}
            <p className="text-xs text-paper/40">{sloganText}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
