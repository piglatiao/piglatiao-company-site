import { fileURLToPath } from "node:url";
import { PrismaClient, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config as loadEnv } from "dotenv";

// 显式读取仓库根目录 `.env`，保证从 workspace 任意位置执行种子脚本都能连接数据库。
loadEnv({
  path: fileURLToPath(new URL("../../../.env", import.meta.url)),
});

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始种子数据初始化...\n");

  // ==================== 管理员 ====================
  const adminPassword = await bcrypt.hash("admin123", 12);

  const superAdmin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@noteapp.com",
      password: adminPassword,
      role: AdminRole.SUPER_ADMIN,
      status: 1,
    },
  });
  console.log(`✅ 管理员: admin / admin123 (ID: ${superAdmin.id})`);

  const editor = await prisma.admin.upsert({
    where: { username: "editor" },
    update: {},
    create: {
      username: "editor",
      email: "editor@noteapp.com",
      password: await bcrypt.hash("editor123", 12),
      role: AdminRole.EDITOR,
      status: 1,
    },
  });
  console.log(`✅ 编辑: editor / editor123 (ID: ${editor.id})`);

  // ==================== 公司信息 ====================
  await prisma.companyInfo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "NoteApp 科技",
      description: "专注于高效笔记与知识管理解决方案的科技公司",
      address: "甘肃兰州",
      phone: "021-1234-5678",
      email: "599594629@qq.com",
      wechat: "jieyi5170",
      aboutUs: "我们是一家致力于提升个人与企业知识管理效率的科技公司。通过创新的产品和服务，帮助用户更好地记录、整理和分享信息。",
    },
  });
  console.log("✅ 公司信息初始化完成");

  // ==================== 产品 ====================
  const products = [
    { title: "NoteApp Pro - 智能笔记", summary: "支持 Markdown、思维导图、多端同步的智能笔记应用", content: "NoteApp Pro 是一款功能强大的智能笔记应用，支持 Markdown 编辑、思维导图、标签管理、全文搜索等功能。多端同步让您随时随地记录灵感。", category: "软件产品", sort: 1 },
    { title: "知识库管理系统", summary: "为企业打造的团队知识协作与共享平台", content: "企业级知识库管理系统，支持团队协作、权限管理、版本控制和全文搜索，帮助企业构建内部知识体系。", category: "解决方案", sort: 2 },
    { title: "技术咨询服务", summary: "提供全栈开发、架构设计、性能优化等专业咨询服务", content: "我们拥有经验丰富的技术团队，提供从架构设计到开发实施的全程咨询服务，助力您的业务快速发展。", category: "技术服务", sort: 3 },
  ];
  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { title: p.title } });
    if (!existing) await prisma.product.create({ data: p });
  }
  console.log(`✅ 产品数据: ${products.length} 条`);

  // ==================== 新闻 ====================
  const articles = [
    { title: "NoteApp Pro 2.0 正式发布", summary: "全新界面设计，新增 AI 辅助写作功能，性能提升 200%", content: "我们很高兴地宣布 NoteApp Pro 2.0 正式发布！本次更新带来了全新的界面设计、AI 辅助写作功能、更强大的搜索能力以及 200% 的性能提升。", category: "公司新闻", isTop: true, status: 1, publishedAt: new Date(), authorId: superAdmin.id },
    { title: "2026 年知识管理行业趋势报告", summary: "深入分析知识管理领域的发展趋势与技术创新方向", content: "随着 AI 技术的快速发展，知识管理领域正在经历深刻变革。本报告从市场、技术、用户三个维度分析 2026 年的行业趋势。", category: "行业资讯", isTop: false, status: 1, publishedAt: new Date(), authorId: editor.id },
    { title: "企业知识库最佳实践指南", summary: "从 0 到 1 搭建企业知识库的完整方法论", content: "本文分享了如何从零开始搭建企业知识库的完整流程，包括需求分析、工具选型、内容规划和推广落地。", category: "产品动态", isTop: false, status: 1, publishedAt: new Date() },
  ];
  for (const a of articles) {
    const existing = await prisma.article.findFirst({ where: { title: a.title } });
    if (!existing) await prisma.article.create({ data: a });
  }
  console.log(`✅ 新闻数据: ${articles.length} 条`);

  // ==================== 系统设置 ====================
  const settings = [
    // 站点设置
    { key: "site_title", value: "NoteApp 科技" },
    { key: "site_description", value: "专注于高效笔记与知识管理解决方案" },
    { key: "site_copyright", value: "piglatiao" },
    { key: "site_slogan", value: "现代简约 · 精致极简" },
    { key: "icp", value: "" },
    { key: "google_analytics", value: "" },

    // 导航
    { key: "nav_home", value: "首页" },
    { key: "nav_about", value: "关于" },
    { key: "nav_products", value: "产品" },
    { key: "nav_news", value: "动态" },
    { key: "nav_contact", value: "联系" },

    // 首页 Hero
    { key: "home_hero_label", value: "NoteApp 科技 · 知识管理" },
    { key: "home_hero_title", value: "让每一次记录都有价值" },
    { key: "home_hero_accent", value: "记录" },
    { key: "home_hero_subtitle", value: "专注于高效笔记与知识管理解决方案的科技公司" },
    { key: "home_hero_btn1", value: "探索产品" },
    { key: "home_hero_btn2", value: "了解更多" },

    // 首页 产品区
    { key: "home_products_label", value: "产品与服务" },
    { key: "home_products_title", value: "我们的解决方案" },
    { key: "home_products_link", value: "查看全部" },

    // 首页 新闻区
    { key: "home_news_label", value: "新闻动态" },
    { key: "home_news_title", value: "最新资讯" },
    { key: "home_news_link", value: "查看全部" },

    // 首页 CTA
    { key: "home_cta_title", value: "开始你的知识管理之旅" },
    { key: "home_cta_subtitle", value: "联系我们，了解如何通过 NoteApp 的产品和服务提升团队效率" },
    { key: "home_cta_btn", value: "联系我们" },

    // 关于我们
    { key: "about_label", value: "关于我们" },
    { key: "about_title", value: "我们是" },
    { key: "about_mission_label", value: "使命" },
    { key: "about_mission", value: "通过创新的产品和服务，帮助用户更好地记录、整理和分享信息。" },
    { key: "about_vision_label", value: "愿景" },
    { key: "about_vision", value: "成为最值得信赖的知识管理解决方案提供商。" },
    { key: "stat_1_label", value: "成立年份" },
    { key: "stat_1_value", value: "2024" },
    { key: "stat_2_label", value: "服务客户" },
    { key: "stat_2_value", value: "500+" },
    { key: "stat_3_label", value: "团队规模" },
    { key: "stat_3_value", value: "50+" },
    { key: "stat_4_label", value: "产品线" },
    { key: "stat_4_value", value: "3 条" },

    // 产品页
    { key: "products_label", value: "产品与服务" },
    { key: "products_title", value: "为知识而生的解决方案" },
    { key: "products_subtitle", value: "从个人笔记到企业知识库，我们提供全方位的知识管理产品和服务" },
    { key: "products_detail_link", value: "了解详情" },
    { key: "products_back", value: "返回产品列表" },
    { key: "products_cta_title", value: "对这款产品感兴趣？" },
    { key: "products_cta_btn", value: "咨询此产品" },

    // 新闻页
    { key: "news_label", value: "新闻动态" },
    { key: "news_title", value: "最新资讯" },
    { key: "news_subtitle", value: "了解 NoteApp 的最新产品动态和行业趋势" },
    { key: "news_back", value: "返回新闻列表" },
    { key: "news_cta_text", value: "阅读完毕，还有其他想了解的吗？" },
    { key: "news_cta_btn", value: "联系我们" },

    // 联系页
    { key: "contact_label", value: "联系我们" },
    { key: "contact_title", value: "让我们聊聊" },
    { key: "contact_subtitle", value: "无论是产品咨询、技术合作还是其他事宜，我们都很乐意倾听" },
    { key: "contact_form_name", value: "姓名" },
    { key: "contact_form_email", value: "邮箱" },
    { key: "contact_form_phone", value: "电话" },
    { key: "contact_form_company", value: "公司" },
    { key: "contact_form_message", value: "留言" },
    { key: "contact_form_submit", value: "发送留言" },
    { key: "contact_success_title", value: "提交成功" },
    { key: "contact_success_desc", value: "我们会尽快与您联系" },
    { key: "contact_success_btn", value: "再发一条" },
    { key: "contact_info_address", value: "地址" },
    { key: "contact_info_email", value: "邮箱" },
    { key: "contact_info_phone", value: "电话" },
    { key: "contact_info_wechat", value: "微信" },

    // 页脚
    { key: "footer_about", value: "专注于高效笔记与知识管理解决方案，通过创新的产品和服务，帮助用户更好地记录、整理和分享信息。" },
    { key: "footer_nav_title", value: "导航" },
    { key: "footer_contact_title", value: "联系" },
    { key: "footer_copyright", value: "piglatiao" },
    { key: "footer_slogan", value: "现代简约 · 精致极简" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log(`✅ 系统设置: ${settings.length} 项`);

  console.log("\n🎉 种子数据初始化完成！");
  console.log("\n📋 登录信息:");
  console.log("   超级管理员: admin / admin123");
  console.log("   编辑:      editor / editor123");
}

main()
  .catch((e) => {
    console.error("❌ 种子数据初始化失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
