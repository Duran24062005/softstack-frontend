"use client";

import { ArrowCounterClockwise, Check, CircleNotch, MagnifyingGlass, Pause, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { StatusNotice } from "@/components/ui/status-notice";
import { apiFetch } from "@/lib/api";
import type { AccountStatus, AdminUser, UserRole } from "@/lib/types";

const roleLabels: Record<UserRole, string> = {
  user: "Estudiante",
  trainer: "Trainer",
  admin: "Administrador",
};

const statusLabels: Record<AccountStatus, string> = {
  pending: "Pendiente",
  active: "Activa",
  rejected: "Rechazada",
  inactive: "Inactiva",
};

const statusClasses: Record<AccountStatus, string> = {
  pending: "border-gold/40 bg-gold/10 text-twilight",
  active: "border-seaweed/30 bg-seaweed/10 text-teal",
  rejected: "border-danger/25 bg-danger-soft text-danger",
  inactive: "border-twilight/15 bg-twilight/5 text-twilight/60",
};

const dateFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function AccountStatusBadge({ status }: { status: AccountStatus }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[status]}`}>{statusLabels[status]}</span>;
}

export function UserManagement({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AccountStatus>("all");
  const [search, setSearch] = useState("");
  const [busyUserId, setBusyUserId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.account_status === statusFilter;
      const matchesSearch = !normalizedSearch || `${user.full_name} ${user.email}`.toLowerCase().includes(normalizedSearch);
      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [roleFilter, search, statusFilter, users]);

  async function changeStatus(user: AdminUser, accountStatus: AccountStatus) {
    setBusyUserId(user.id);
    setMessage("");
    setError("");
    try {
      const updated = await apiFetch<AdminUser>(`/admin/users/${user.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ account_status: accountStatus }),
      });
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setMessage(`${updated.full_name}: cuenta ${statusLabels[updated.account_status].toLowerCase()}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos actualizar el estado de la cuenta.");
    } finally {
      setBusyUserId("");
    }
  }

  return (
    <section className="mt-8 surface p-6 sm:p-9">
      <div className="flex flex-col justify-between gap-5 border-b border-twilight/10 pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow text-seaweed">Directorio administrativo</p>
          <h2 className="display mt-3 text-3xl">Revisa quién puede entrar.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-twilight/55">Aprueba nuevas solicitudes, conserva una lectura clara de los roles y pausa cuentas cuando sea necesario.</p>
        </div>
        <p className="metric-number text-sm font-bold text-teal">{filteredUsers.length} de {users.length} cuentas</p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
        <label className="field">
          <span>Buscar</span>
          <span className="relative block">
            <MagnifyingGlass size={17} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-twilight/40" />
            <input className="pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre o correo" />
          </span>
        </label>
        <label className="field">
          <span>Rol</span>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as "all" | UserRole)}>
            <option value="all">Todos los roles</option>
            <option value="user">Estudiantes</option>
            <option value="trainer">Trainers</option>
            <option value="admin">Administradores</option>
          </select>
        </label>
        <label className="field">
          <span>Estado</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | AccountStatus)}>
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="active">Activas</option>
            <option value="rejected">Rechazadas</option>
            <option value="inactive">Inactivas</option>
          </select>
        </label>
      </div>

      {message ? <StatusNotice tone="success" className="mt-5">{message}</StatusNotice> : null}
      {error ? <StatusNotice tone="error" className="mt-5">{error}</StatusNotice> : null}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-twilight/10">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <caption className="sr-only">Usuarios y estados de cuenta</caption>
          <thead className="bg-canvas text-xs uppercase tracking-[.12em] text-twilight/50">
            <tr>
              <th scope="col" className="px-5 py-4 font-semibold">Usuario</th>
              <th scope="col" className="px-5 py-4 font-semibold">Rol</th>
              <th scope="col" className="px-5 py-4 font-semibold">Estado</th>
              <th scope="col" className="px-5 py-4 font-semibold">Email</th>
              <th scope="col" className="px-5 py-4 font-semibold">Registro</th>
              <th scope="col" className="px-5 py-4 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-twilight/10 bg-white">
            {filteredUsers.map((user) => {
              const busy = busyUserId === user.id;
              return (
                <tr key={user.id}>
                  <td className="px-5 py-4 align-top">
                    <span className="block text-sm font-semibold text-twilight">{user.full_name}</span>
                    <span className="mt-1 block text-xs text-twilight/50">{user.email}</span>
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-twilight/70">{roleLabels[user.role]}</td>
                  <td className="px-5 py-4 align-top"><AccountStatusBadge status={user.account_status} /></td>
                  <td className="px-5 py-4 align-top text-sm text-twilight/70">{user.email_verified ? "Verificado" : "Pendiente"}</td>
                  <td className="px-5 py-4 align-top text-sm text-twilight/70">{formatDate(user.created_at)}</td>
                  <td className="px-5 py-4 align-top">
                    {user.role === "admin" ? <span className="text-xs font-semibold text-twilight/45">Cuenta protegida</span> : (
                      <div className="flex flex-wrap gap-2">
                        {user.role === "user" ? <Link href={`/admin/users/${user.id}/academic-profile`} className="button button-quiet">Perfil académico</Link> : null}
                        {user.account_status === "pending" ? <>
                          <button type="button" className="button button-quiet" disabled={busyUserId !== ""} onClick={() => changeStatus(user, "active")}><Check size={15} />Aprobar</button>
                          <button type="button" className="button button-quiet text-danger" disabled={busyUserId !== ""} onClick={() => changeStatus(user, "rejected")}><X size={15} />Rechazar</button>
                        </> : null}
                        {user.account_status === "rejected" ? <button type="button" className="button button-quiet" disabled={busyUserId !== ""} onClick={() => changeStatus(user, "pending")}><ArrowCounterClockwise size={15} />Reabrir</button> : null}
                        {user.account_status === "active" ? <button type="button" className="button button-quiet text-danger" disabled={busyUserId !== ""} onClick={() => changeStatus(user, "inactive")}><Pause size={15} />Inactivar</button> : null}
                        {user.account_status === "inactive" ? <button type="button" className="button button-quiet" disabled={busyUserId !== ""} onClick={() => changeStatus(user, "active")}><ArrowCounterClockwise size={15} />Reactivar</button> : null}
                        {busy ? <CircleNotch size={18} className="mt-2 animate-spin text-teal" aria-label="Actualizando" /> : null}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredUsers.length === 0 ? <p className="empty-state m-4">No hay cuentas que coincidan con estos filtros.</p> : null}
      </div>
    </section>
  );
}
