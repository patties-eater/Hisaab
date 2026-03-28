import React, { useEffect, useState } from "react";
import { getAuthHeaders } from "../components/api";
import { formatDisplayDateTime } from "../utils/dates";

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

const initialCreateForm = { email: "", password: "" };
const initialEditForm = { userId: "", email: "", password: "" };

export default function AdminDashboardPage() {
  const [data, setData] = useState({
    stats: {
      totalUsers: 0,
      totalTransactions: 0,
      totalDebtCredit: 0,
    },
    users: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchOverview = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/overview", {
        headers: getAuthHeaders(),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || result.message || "Failed to load admin data");
        return;
      }

      setData(result.data);
      setError("");
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const submitCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(createForm),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || result.error || "Failed to create user");
        return;
      }

      setMessage(`User ${result.data.email} created successfully.`);
      setCreateForm(initialCreateForm);
      await fetchOverview();
    } catch (err) {
      setError("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditUser = (user) => {
    setEditForm({
      userId: user.id,
      email: user.email,
      password: "",
    });
    setMessage("");
    setError("");
  };

  const submitEditUser = async (e) => {
    e.preventDefault();
    if (!editForm.userId) return;

    setSubmitting(true);
    setError("");
    setMessage("");

    const payload = {};
    if (editForm.email.trim()) payload.email = editForm.email.trim();
    if (editForm.password.trim()) payload.password = editForm.password.trim();

    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${editForm.userId}`, {
        method: "PATCH",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || result.error || "Failed to update user");
        return;
      }

      setMessage(`User ${result.data.email} updated successfully.`);
      setEditForm(initialEditForm);
      await fetchOverview();
    } catch (err) {
      setError("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteUser = async (user) => {
    const confirmed = window.confirm(`Delete user ${user.email}? This will remove their related data too.`);
    if (!confirmed) return;

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || result.error || "Failed to delete user");
        return;
      }

      setMessage(`User ${result.data.email} deleted successfully.`);
      if (editForm.userId === user.id) {
        setEditForm(initialEditForm);
      }
      await fetchOverview();
    } catch (err) {
      setError("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-200">Loading admin dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-amber-400">Admin Panel</p>
        <h1 className="mt-3 text-4xl font-black">User Control Dashboard</h1>
        <p className="mt-2 text-slate-300">
          Create users, reset passwords, edit accounts, and remove accounts.
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Passwords cannot be shown because they are stored securely as hashes.
        </p>
      </div>

      {(error || message) && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${error ? "border-rose-700 bg-rose-950 text-rose-200" : "border-emerald-700 bg-emerald-950 text-emerald-200"}`}>
          {error || message}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label="Total Users" value={data.stats.totalUsers} />
        <StatCard label="Transactions" value={data.stats.totalTransactions} />
        <StatCard label="Debt/Credit Records" value={data.stats.totalDebtCredit} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <form
          onSubmit={submitCreateUser}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg space-y-4"
        >
          <h2 className="text-lg font-semibold">Create New User</h2>
          <input
            type="email"
            placeholder="User email"
            value={createForm.email}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Temporary password"
            value={createForm.password}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-70"
          >
            Create User
          </button>
        </form>

        <form
          onSubmit={submitEditUser}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg space-y-4"
        >
          <h2 className="text-lg font-semibold">Edit Or Reset User</h2>
          <input
            type="text"
            value={editForm.userId}
            readOnly
            placeholder="Select a user from the table"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-400"
          />
          <input
            type="email"
            placeholder="Update email"
            value={editForm.email}
            onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
          />
          <input
            type="text"
            placeholder="New password to reset"
            value={editForm.password}
            onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || !editForm.userId}
              className="rounded-lg bg-sky-400 px-4 py-2 font-semibold text-slate-950 hover:bg-sky-300 disabled:opacity-70"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditForm(initialEditForm)}
              className="rounded-lg border border-slate-700 px-4 py-2 font-semibold text-slate-200 hover:bg-slate-800"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-lg overflow-hidden">
        <div className="border-b border-slate-800 px-6 py-4">
          <h2 className="text-lg font-semibold">All User Accounts</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-950/60 text-left text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Transactions</th>
                <th className="px-6 py-4">Debt/Credit</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => (
                <tr key={user.id} className="border-t border-slate-800 text-sm text-slate-200">
                  <td className="px-6 py-4">
                    <div>{user.email}</div>
                    <div className="mt-1 text-xs text-slate-500">{user.id}</div>
                  </td>
                  <td className="px-6 py-4">{formatDisplayDateTime(user.created_at)}</td>
                  <td className="px-6 py-4">{user.transactions_count}</td>
                  <td className="px-6 py-4">{user.debt_credit_count}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => startEditUser(user)}
                        className="text-sky-300 hover:text-sky-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUser(user)}
                        className="text-rose-300 hover:text-rose-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
