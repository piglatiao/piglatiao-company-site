import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";

// 显式读取仓库根目录 `.env`，保证从 workspace 任意位置执行脚本都能连接数据库。
loadEnv({
  path: fileURLToPath(new URL("../../../.env", import.meta.url)),
});

const prisma = new PrismaClient();

const COPYRIGHT_TEXT = "piglatiao";
const CONTACT_EMAIL = "599594629@qq.com";
const CONTACT_ADDRESS = "甘肃兰州";
const CONTACT_WECHAT = "jieyi5170";

/**
 * 同步用户指定的版权与公开联系方式。
 * 这里只更新版权、邮箱、地址、微信，不改动其他业务数据。
 */
async function main() {
  const currentCompany = await prisma.companyInfo.findUnique({
    where: { id: 1 },
  });

  await prisma.companyInfo.upsert({
    where: { id: 1 },
    update: {
      email: CONTACT_EMAIL,
      address: CONTACT_ADDRESS,
      wechat: CONTACT_WECHAT,
    },
    create: {
      id: 1,
      name: currentCompany?.name || "NoteApp 科技",
      logo: currentCompany?.logo || null,
      description: currentCompany?.description || null,
      address: CONTACT_ADDRESS,
      phone: currentCompany?.phone || null,
      email: CONTACT_EMAIL,
      wechat: CONTACT_WECHAT,
      aboutUs: currentCompany?.aboutUs || null,
    },
  });

  await prisma.setting.updateMany({
    where: {
      key: {
        contains: "copyright",
      },
    },
    data: {
      value: COPYRIGHT_TEXT,
    },
  });

  for (const key of ["site_copyright", "footer_copyright"]) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: COPYRIGHT_TEXT },
      create: { key, value: COPYRIGHT_TEXT },
    });
  }

  console.log("Branding values have been updated.");
}

main()
  .catch((error) => {
    console.error("Failed to update branding values:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
