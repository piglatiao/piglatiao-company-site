import type { SettingMap } from "@noteapp/shared";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.js";

/**
 * 读取公开站点配置，供导航、页脚和页面文案统一消费。
 */
export function useSettings(): SettingMap {
  const { data } = useQuery({ queryKey: ["settings"], queryFn: api.getSettings });
  return data || {};
}
