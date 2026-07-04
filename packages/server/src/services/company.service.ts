import { prisma } from "@noteapp/database";
import { AppError } from "../middleware/error.js";

export async function getCompanyInfo() {
  const info = await prisma.companyInfo.findUnique({ where: { id: 1 } });
  if (!info) {
    throw new AppError(404, "公司信息未配置", "NOT_FOUND");
  }
  return info;
}

export async function updateCompanyInfo(data: any) {
  return prisma.companyInfo.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, name: data.name || "公司名称", ...data },
  });
}

export async function getPublicSettings() {
  const settings = await prisma.setting.findMany();
  return settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);
}
