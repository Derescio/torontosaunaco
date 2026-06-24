"use client";

import { useEffect, useMemo, useState } from "react";

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "editor", label: "Editor" },
  { value: "marketing", label: "Marketing" },
  { value: "admin", label: "Admin" },
];

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

export default function RoleManagementPanel() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState("");
  const [status, setStatus] = useState("");

  const debouncedQuery = useMemo(() => query.trim(), [query]);

  async function loadUsers(currentQuery = "") {
    setLoading(true);
    setStatus("");
    try {
      const params = new URLSearchParams();
      if (currentQuery) params.set("query", currentQuery);
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch users");
      }
      const data = await response.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers(debouncedQuery);
  }, [debouncedQuery]);

  async function handleRoleChange(user, role) {
    if (!role || role === user.role) return;

    setBusyUserId(user.id);
    setStatus("");
    try {
      const response = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update role");
      }

      setUsers((prev) =>
        prev.map((existing) =>
          existing.id === user.id ? { ...existing, role, isAdmin: role === "admin" } : existing
        )
      );
      setStatus(`Updated role for ${user.email} to ${role}.`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusyUserId("");
    }
  }

  return (
    <section className="mt-10 rounded-lg border border-gray-200 p-5">
      <h2 className="text-xl font-semibold text-gray-900">Role Management</h2>
      <p className="mt-2 text-sm text-gray-600">
        Search users and assign `user`, `editor`, `marketing`, or `admin` roles.
      </p>

      <div className="mt-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-gray-600">Loading users...</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="px-2 py-2 font-medium">User</th>
                <th className="px-2 py-2 font-medium">Email</th>
                <th className="px-2 py-2 font-medium">Role</th>
                <th className="px-2 py-2 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-2 py-2 text-gray-900">{user.username || "—"}</td>
                  <td className="px-2 py-2 text-gray-700">{user.email}</td>
                  <td className="px-2 py-2">
                    <select
                      value={user.role}
                      disabled={busyUserId === user.id}
                      onChange={(event) => handleRoleChange(user, event.target.value)}
                      className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 text-gray-600">{formatDate(user.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
    </section>
  );
}

