import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import { useSettings } from "../hooks/useSettings.js";

export default function About() {
  const s = useSettings();
  const { data: company } = useQuery({ queryKey: ["company"], queryFn: api.getCompany });

  const mission = s.about_mission || "通过创新的产品和服务，帮助用户更好地记录、整理和分享信息。";
  const vision = s.about_vision || "成为最值得信赖的知识管理解决方案提供商。";

  const stats = [
    { label: s.stat_1_label || "成立年份", value: s.stat_1_value || "2024" },
    { label: s.stat_2_label || "服务客户", value: s.stat_2_value || "500+" },
    { label: s.stat_3_label || "团队规模", value: s.stat_3_value || "50+" },
    { label: s.stat_4_label || "产品线", value: s.stat_4_value || "3 条" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="py-24 md:py-40 bg-paper-warm">
        <div className="container-content">
          <p className="label-overline mb-6 animate-fade-up opacity-start">{s.about_label || "关于我们"}</p>
          <h1 className="heading-display text-5xl md:text-7xl mb-8 animate-fade-up opacity-start delay-200">
            {s.about_title || "我们是"}<br />
            <span className="text-accent italic">{s.site_title || "NoteApp"}</span>
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl leading-relaxed animate-fade-up opacity-start delay-300">
            {company?.aboutUs || "致力于提升个人与企业知识管理效率的科技公司"}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="container-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
            <div>
              <p className="label-overline mb-4">{s.about_mission_label || "使命"}</p>
              <p className="font-display text-2xl leading-relaxed">{mission}</p>
            </div>
            <div>
              <p className="label-overline mb-4">{s.about_vision_label || "愿景"}</p>
              <p className="font-display text-2xl leading-relaxed">{vision}</p>
            </div>
          </div>

          <div className="divider-fade my-16" />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center animate-fade-up opacity-start" style={{ animationDelay: `${i * 100}ms` }}>
                <p className="font-display text-4xl md:text-5xl text-accent mb-2">{stat.value}</p>
                <p className="text-xs text-ink-muted uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-24 bg-paper-warm">
        <div className="container-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-paper p-8">
              <p className="label-overline mb-3">{s.contact_info_address || "地址"}</p>
              <p className="text-ink-light">{company?.address || "中国 · 上海"}</p>
            </div>
            <div className="card-paper p-8">
              <p className="label-overline mb-3">{s.contact_info_email || "邮箱"}</p>
              <p className="text-ink-light">{company?.email || "contact@noteapp.com"}</p>
            </div>
            <div className="card-paper p-8">
              <p className="label-overline mb-3">{s.contact_info_phone || "电话"}</p>
              <p className="text-ink-light">{company?.phone || "021-1234-5678"}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
