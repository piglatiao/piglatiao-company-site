import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminRole, type AdminUser, type CreateAdminInput, type UpdateAdminInput } from "@noteapp/shared";
import { adminApi } from "../../lib/adminApi.js";
import { useAuth } from "../../context/AuthContext.js";

type AdminForm = {
  username: string;
  email: string;
  password: string;
  role: AdminRole;
};

const emptyForm: AdminForm = { username: "", email: "", password: "", role: AdminRole.EDITOR };

export default function UserManage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ["admin-admins"], queryFn: () => adminApi.getAdmins() });
  const admins = data?.data || [];
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(emptyForm);

  const createMut = useMutation({
    mutationFn: (payload: CreateAdminInput) => adminApi.createAdmin(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-admins"] }); setShowForm(false); setForm(emptyForm); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAdminInput }) =>
      adminApi.updateAdmin(id, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-admins"] }); setShowForm(false); setEditing(null); setForm(emptyForm); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminApi.deleteAdmin(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-admins"] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const payload: UpdateAdminInput = { email: form.email, role: form.role };
      if (form.password) payload.password = form.password;
      updateMut.mutate({ id: editing.id, payload });
    } else {
      createMut.mutate(form);
    }
  };

  const handleEdit = (u: AdminUser) => {
    setEditing(u);
    setForm({ username: u.username, email: u.email, password: "", role: u.role });
    setShowForm(true);
  };

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const inputCls = "w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent focus:outline-none";

  const roleLabel = (r: AdminRole) => r === "SUPER_ADMIN" ? "超级管理员" : r === "ADMIN" ? "管理员" : "编辑";
  const roleClass = (r: AdminRole) => r === "SUPER_ADMIN" ? "bg-accent-subtle text-accent" : r === "ADMIN" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">用户管理</h1>
          <p className="text-sm text-ink-muted">共 {data?.meta?.total ?? 0} 位管理员</p>
        </div>
        {isSuperAdmin && (
          <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }} className="btn-primary">
            + 添加管理员
          </button>
        )}
      </div>

      {showForm && isSuperAdmin && (
        <div className="card-paper p-6 mb-6">
          <h2 className="font-display text-xl mb-4">{editing ? "编辑管理员" : "添加管理员"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-overline block mb-1">用户名 *</label>
                <input required disabled={!!editing} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className={inputCls + (editing ? " bg-gray-50" : "")} />
              </div>
              <div>
                <label className="label-overline block mb-1">邮箱 *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="label-overline block mb-1">{editing ? "新密码（留空不改）" : "密码 *"}</label>
                <input type="password" required={!editing} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="label-overline block mb-1">角色</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })} className={inputCls}>
                  <option value={AdminRole.EDITOR}>编辑</option>
                  <option value={AdminRole.ADMIN}>管理员</option>
                  <option value={AdminRole.SUPER_ADMIN}>超级管理员</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary" disabled={createMut.isPending || updateMut.isPending}>
                {createMut.isPending || updateMut.isPending ? "保存中..." : "保存"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-outline">取消</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <p className="text-center py-10 text-ink-faint">加载中...</p>
      ) : (
        <div className="card-paper overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-paper-warm">
                <th className="text-left px-4 py-3 font-medium text-ink-muted">用户名</th>
                <th className="text-left px-4 py-3 font-medium text-ink-muted">邮箱</th>
                <th className="text-left px-4 py-3 font-medium text-ink-muted">角色</th>
                <th className="text-left px-4 py-3 font-medium text-ink-muted">最近登录</th>
                <th className="text-right px-4 py-3 font-medium text-ink-muted">操作</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((u: AdminUser) => (
                <tr key={u.id} className="border-b border-line last:border-0 hover:bg-paper-warm/50">
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3 text-ink-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={"text-xs px-2 py-0.5 rounded-sm " + roleClass(u.role)}>
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-faint">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString("zh-CN") : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.id === currentUser?.id ? (
                      <span className="text-xs text-ink-faint">当前账号</span>
                    ) : isSuperAdmin && u.role !== "SUPER_ADMIN" ? (
                      <>
                        <button onClick={() => handleEdit(u)} className="text-accent hover:underline mr-3 text-xs">编辑</button>
                        <button onClick={() => { if (confirm("确认删除？")) deleteMut.mutate(u.id); }} className="text-red-500 hover:underline text-xs">删除</button>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
