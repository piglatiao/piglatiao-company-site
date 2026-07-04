import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompanyInfo, SettingMap, UpdateCompanyInfoInput } from "@noteapp/shared";
import { adminApi } from "../../lib/adminApi.js";

type SettingField = {
  key: string;
  label: string;
  area?: boolean;
  hint?: string;
};

type SettingGroup = {
  title: string;
  description?: string;
  fields: SettingField[];
};

const GROUPS: SettingGroup[] = [
  {
    title: "站点设置",
    description: "控制公开网站的全局标题、描述、版权和统计代码。",
    fields: [
      { key: "site_title", label: "站点名称" },
      { key: "site_description", label: "站点描述", hint: "用于浏览器标题描述和页面 SEO 摘要。" },
      { key: "site_copyright", label: "版权信息", hint: "用于页脚底部版权文案和版权 meta 标签。" },
      { key: "site_slogan", label: "站点标语", hint: "用于公开网站页脚底部标语展示。" },
      { key: "icp", label: "ICP 备案号", hint: "显示在公开网站页脚底部。" },
      { key: "google_analytics", label: "Google Analytics ID", hint: "填写 GA Measurement ID，例如 G-XXXXXXX。" },
    ],
  },
  {
    title: "导航栏",
    fields: [
      { key: "nav_home", label: "首页" },
      { key: "nav_about", label: "关于" },
      { key: "nav_products", label: "产品" },
      { key: "nav_news", label: "动态" },
      { key: "nav_contact", label: "联系" },
    ],
  },
  {
    title: "首页 - Hero 区域",
    fields: [
      { key: "home_hero_label", label: "标签文字" },
      { key: "home_hero_title", label: "主标题" },
      { key: "home_hero_accent", label: "强调词（高亮显示）" },
      { key: "home_hero_subtitle", label: "副标题", area: true },
      { key: "home_hero_btn1", label: "按钮1" },
      { key: "home_hero_btn2", label: "按钮2" },
    ],
  },
  {
    title: "首页 - 产品区域",
    fields: [
      { key: "home_products_label", label: "标签" },
      { key: "home_products_title", label: "标题" },
      { key: "home_products_link", label: "链接文字" },
    ],
  },
  {
    title: "首页 - 新闻区域",
    fields: [
      { key: "home_news_label", label: "标签" },
      { key: "home_news_title", label: "标题" },
      { key: "home_news_link", label: "链接文字" },
    ],
  },
  {
    title: "首页 - CTA 行动号召",
    fields: [
      { key: "home_cta_title", label: "标题" },
      { key: "home_cta_subtitle", label: "描述", area: true },
      { key: "home_cta_btn", label: "按钮文字" },
    ],
  },
  {
    title: "关于我们页",
    fields: [
      { key: "about_label", label: "页面标签" },
      { key: "about_title", label: "标题前缀（如：我们是）" },
      { key: "about_mission_label", label: "使命标签" },
      { key: "about_mission", label: "使命内容", area: true },
      { key: "about_vision_label", label: "愿景标签" },
      { key: "about_vision", label: "愿景内容", area: true },
    ],
  },
  {
    title: "关于页 - 数据统计",
    fields: [
      { key: "stat_1_label", label: "统计1 标签" },
      { key: "stat_1_value", label: "统计1 数值" },
      { key: "stat_2_label", label: "统计2 标签" },
      { key: "stat_2_value", label: "统计2 数值" },
      { key: "stat_3_label", label: "统计3 标签" },
      { key: "stat_3_value", label: "统计3 数值" },
      { key: "stat_4_label", label: "统计4 标签" },
      { key: "stat_4_value", label: "统计4 数值" },
    ],
  },
  {
    title: "产品列表页",
    fields: [
      { key: "products_label", label: "标签" },
      { key: "products_title", label: "标题" },
      { key: "products_subtitle", label: "副标题", area: true },
      { key: "products_detail_link", label: "详情链接文字" },
    ],
  },
  {
    title: "产品详情页",
    fields: [
      { key: "products_back", label: "返回链接" },
      { key: "products_cta_title", label: "CTA 标题" },
      { key: "products_cta_btn", label: "CTA 按钮" },
    ],
  },
  {
    title: "新闻列表页",
    fields: [
      { key: "news_label", label: "标签" },
      { key: "news_title", label: "标题" },
      { key: "news_subtitle", label: "副标题", area: true },
    ],
  },
  {
    title: "新闻详情页",
    fields: [
      { key: "news_back", label: "返回链接" },
      { key: "news_cta_text", label: "CTA 文案" },
      { key: "news_cta_btn", label: "CTA 按钮" },
    ],
  },
  {
    title: "联系页 - 标题区",
    fields: [
      { key: "contact_label", label: "标签" },
      { key: "contact_title", label: "标题" },
      { key: "contact_subtitle", label: "副标题", area: true },
    ],
  },
  {
    title: "联系页 - 表单",
    fields: [
      { key: "contact_form_name", label: "姓名标签" },
      { key: "contact_form_email", label: "邮箱标签" },
      { key: "contact_form_phone", label: "电话标签" },
      { key: "contact_form_company", label: "公司标签" },
      { key: "contact_form_message", label: "留言标签" },
      { key: "contact_form_submit", label: "提交按钮" },
    ],
  },
  {
    title: "联系页 - 成功提示",
    fields: [
      { key: "contact_success_title", label: "成功标题" },
      { key: "contact_success_desc", label: "成功描述" },
      { key: "contact_success_btn", label: "成功按钮" },
    ],
  },
  {
    title: "联系页 - 信息标签",
    fields: [
      { key: "contact_info_address", label: "地址标签" },
      { key: "contact_info_email", label: "邮箱标签" },
      { key: "contact_info_phone", label: "电话标签" },
      { key: "contact_info_wechat", label: "微信标签" },
    ],
  },
  {
    title: "页脚",
    description: "页脚中保留真正参与前台展示的字段，避免重复配置造成误解。",
    fields: [
      { key: "footer_about", label: "公司简介", area: true },
      { key: "footer_nav_title", label: "导航标题" },
      { key: "footer_contact_title", label: "联系标题" },
    ],
  },
];

/**
 * 将公司表单状态转换为接口需要的 payload，避免把无关字段一并提交给服务端。
 */
function buildCompanyPayload(company: CompanyInfo): UpdateCompanyInfoInput {
  return {
    name: company.name || "",
    logo: company.logo || "",
    description: company.description || "",
    address: company.address || "",
    phone: company.phone || "",
    email: company.email || "",
    wechat: company.wechat || "",
    aboutUs: company.aboutUs || "",
  };
}

export default function Settings() {
  const queryClient = useQueryClient();
  const { data: company } = useQuery({ queryKey: ["admin-company"], queryFn: () => adminApi.getCompany() });
  const { data: settings } = useQuery({ queryKey: ["admin-settings"], queryFn: () => adminApi.getSettings() });

  const [companyForm, setCompanyForm] = useState<CompanyInfo | null>(null);
  const [form, setForm] = useState<SettingMap>({});
  const [saved, setSaved] = useState(false);
  const [settingsInitialized, setSettingsInitialized] = useState(false);

  useEffect(() => {
    if (company && !companyForm) {
      setCompanyForm(company);
    }
  }, [company, companyForm]);

  useEffect(() => {
    if (settings && !settingsInitialized) {
      setForm(settings);
      setSettingsInitialized(true);
    }
  }, [settings, settingsInitialized]);

  const updateCompanyMut = useMutation({
    mutationFn: (payload: UpdateCompanyInfoInput) => adminApi.updateCompany(payload),
  });

  const updateSettingMut = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => adminApi.updateSetting(key, value),
  });

  const markSaved = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const cls = "w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent focus:outline-none";

  const saveCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!companyForm) {
      return;
    }

    await updateCompanyMut.mutateAsync(buildCompanyPayload(companyForm));
    await queryClient.invalidateQueries({ queryKey: ["admin-company"] });
    await queryClient.invalidateQueries({ queryKey: ["company"] });
    markSaved();
  };

  const saveAll = async () => {
    await Promise.all(
      Object.entries(form).map(([key, value]) =>
        updateSettingMut.mutateAsync({ key, value }),
      ),
    );
    await queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    await queryClient.invalidateQueries({ queryKey: ["settings"] });
    markSaved();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">系统设置</h1>
          <p className="text-sm text-ink-muted">所有公开网站显示的文案均在此配置</p>
        </div>
        {saved && (
          <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-sm">
            保存成功，公开网站已同步
          </span>
        )}
      </div>

      {/* 公司信息 */}
      <div className="card-paper p-6 mb-6">
        <h2 className="font-display text-xl mb-1">公司信息</h2>
        <p className="text-xs text-ink-muted mb-4">显示在导航、页脚、关于我们、联系我们等页面。</p>
        {companyForm && (
          <form onSubmit={saveCompany} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-overline block mb-1">公司名称</label>
                <input value={companyForm.name || ""} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} className={cls} />
              </div>
              <div>
                <label className="label-overline block mb-1">邮箱</label>
                <input value={companyForm.email || ""} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} className={cls} />
              </div>
              <div>
                <label className="label-overline block mb-1">电话</label>
                <input value={companyForm.phone || ""} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} className={cls} />
              </div>
              <div>
                <label className="label-overline block mb-1">微信</label>
                <input value={companyForm.wechat || ""} onChange={(e) => setCompanyForm({ ...companyForm, wechat: e.target.value })} className={cls} />
              </div>
            </div>
            <div>
              <label className="label-overline block mb-1">Logo URL</label>
              <input
                value={companyForm.logo || ""}
                onChange={(e) => setCompanyForm({ ...companyForm, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
                className={cls}
              />
              {companyForm.logo ? (
                <img
                  src={companyForm.logo}
                  alt="公司 Logo 预览"
                  className="mt-3 w-20 h-20 rounded-sm object-cover border border-line"
                />
              ) : null}
            </div>
            <div>
              <label className="label-overline block mb-1">地址</label>
              <input value={companyForm.address || ""} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })} className={cls} />
            </div>
            <div>
              <label className="label-overline block mb-1">公司简介</label>
              <textarea value={companyForm.description || ""} onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })} rows={2} className={cls} />
            </div>
            <div>
              <label className="label-overline block mb-1">关于我们</label>
              <textarea value={companyForm.aboutUs || ""} onChange={(e) => setCompanyForm({ ...companyForm, aboutUs: e.target.value })} rows={4} className={cls} />
            </div>
            <button type="submit" className="btn-primary" disabled={updateCompanyMut.isPending}>
              {updateCompanyMut.isPending ? "保存中..." : "保存公司信息"}
            </button>
          </form>
        )}
      </div>

      {/* 分组文案配置 */}
      {GROUPS.map((group) => (
        <div key={group.title} className="card-paper p-6 mb-6">
          <h2 className="font-display text-xl mb-1">{group.title}</h2>
          {group.description ? (
            <p className="text-xs text-ink-muted mt-2">{group.description}</p>
          ) : null}
          <div className="space-y-4 mt-4">
            {group.fields.map((field) => (
              <div key={field.key}>
                <label className="label-overline block mb-1">{field.label}</label>
                {field.area ? (
                  <textarea
                    value={form[field.key] || ""}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    rows={2}
                    className={cls}
                  />
                ) : (
                  <input
                    value={form[field.key] || ""}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className={cls}
                  />
                )}
                {field.hint ? <p className="text-xs text-ink-faint mt-2">{field.hint}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={saveAll} className="btn-primary" disabled={updateSettingMut.isPending}>
        {updateSettingMut.isPending ? "保存中..." : "保存所有文案配置"}
      </button>
    </div>
  );
}
