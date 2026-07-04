// ==================== 文章分类 ====================
export const ARTICLE_CATEGORIES = {
  COMPANY_NEWS: '公司新闻',
  INDUSTRY: '行业资讯',
  PRODUCT_UPDATE: '产品动态',
} as const;

// ==================== 产品分类 ====================
export const PRODUCT_CATEGORIES = {
  SOFTWARE: '软件产品',
  SERVICE: '技术服务',
  SOLUTION: '解决方案',
} as const;

// ==================== 留言状态 ====================
export const CONTACT_STATUS = {
  PENDING: 0,
  PROCESSED: 1,
} as const;

// ==================== 通用状态 ====================
export const STATUS = {
  DISABLED: 0,
  ACTIVE: 1,
} as const;

// ==================== 默认值 ====================
export const DEFAULTS = {
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PORT: 3000,
} as const;

// ==================== 消息提示 ====================
export const MESSAGES = {
  SUCCESS: '操作成功',
  CREATED: '创建成功',
  UPDATED: '更新成功',
  DELETED: '删除成功',
  NOT_FOUND: '资源不存在',
  UNAUTHORIZED: '未授权访问',
  FORBIDDEN: '禁止访问',
  VALIDATION_ERROR: '参数校验失败',
  INTERNAL_ERROR: '服务器内部错误',
} as const;
