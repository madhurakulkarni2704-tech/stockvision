
import { useEffect, useState } from "react";
import { getAdminUsers, updateAdminUser } from "../services/api";
import "./AdminManagement.css";

function AdminManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [draftRoles, setDraftRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminUsers();
      setUsers(Array.isArray(data) ? data : data.results || []);
      setDraftRoles({});
    } catch (err) {
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function saveRole(user) {
    const role = draftRoles[user.id];

    if (!role || role === user.role) return;

    setSavingId(user.id);
    setError("");
    setMessage("");

    try {
      const updatedUser = await updateAdminUser(user.id, role);

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, ...updatedUser } : item
        )
      );

      setDraftRoles((current) => {
        const next = { ...current };
        delete next[user.id];
        return next;
      });

      setMessage(`Role updated successfully for ${user.username}.`);
    } catch (err) {
      setError(err.message || "Unable to update the user's role.");
    } finally {
      setSavingId(null);
    }
  }

  const filteredUsers = users.filter((user) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      user.username.toLowerCase().includes(term) ||
      (user.email || "").toLowerCase().includes(term);

    const matchesRole =
      roleFilter === "ALL" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((user) => user.role === "ADMIN").length;
  const shopkeeperCount = users.filter(
    (user) => user.role === "SHOPKEEPER"
  ).length;

  return (
    <main className="admin-management">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">STOCKVISION / ADMINISTRATION</p>
          <h1>Admin Management</h1>
          <p className="admin-subtitle">
            Manage user accounts and access permissions in one place.
          </p>
        </div>

        <button
          className="admin-refresh-button"
          onClick={loadUsers}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh users"}
        </button>
      </header>

      {error && (
        <div className="admin-notice admin-error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="admin-notice admin-success" role="status">
          {message}
        </div>
      )}

      <section className="admin-summary-grid">
        <article className="admin-summary-card">
          <span className="admin-summary-label">Total users</span>
          <strong>{users.length}</strong>
          <span className="admin-summary-detail">Registered accounts</span>
        </article>

        <article className="admin-summary-card">
          <span className="admin-summary-label">Administrators</span>
          <strong>{adminCount}</strong>
          <span className="admin-summary-detail">Accounts with admin access</span>
        </article>

        <article className="admin-summary-card">
          <span className="admin-summary-label">Shopkeepers</span>
          <strong>{shopkeeperCount}</strong>
          <span className="admin-summary-detail">Inventory user accounts</span>
        </article>
      </section>

      <section className="admin-users-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>User accounts</h2>
            <p>Review accounts and manage their assigned roles.</p>
          </div>
          <span className="admin-result-count">
            {filteredUsers.length} users
          </span>
        </div>

        <div className="admin-toolbar">
          <input
            type="search"
            aria-label="Search users"
            placeholder="Search username or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            aria-label="Filter by role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="ALL">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="SHOPKEEPER">Shopkeeper</option>
          </select>
        </div>

        {loading ? (
          <p className="admin-empty-state">Loading user accounts...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="admin-empty-state">No matching users found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const selectedRole = draftRoles[user.id] ?? user.role;
                  const changed = selectedRole !== user.role;

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-user-cell">
                          <span className="admin-avatar">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <strong>{user.username}</strong>
                            <small>User ID: {user.id}</small>
                          </div>
                        </div>
                      </td>

                      <td>{user.email || "—"}</td>

                      <td>
                        <span
                          className={`admin-role-badge ${
                            user.role === "ADMIN"
                              ? "admin-role-badge-admin"
                              : "admin-role-badge-shopkeeper"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <div className="admin-action-cell">
                          <select
                            aria-label={`Role for ${user.username}`}
                            value={selectedRole}
                            onChange={(event) =>
                              setDraftRoles((current) => ({
                                ...current,
                                [user.id]: event.target.value,
                              }))
                            }
                          >
                            <option value="ADMIN">Admin</option>
                            <option value="SHOPKEEPER">Shopkeeper</option>
                          </select>

                          <button
                            className="admin-save-button"
                            disabled={!changed || savingId === user.id}
                            onClick={() => saveRole(user)}
                          >
                            {savingId === user.id ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="admin-security-note">
        Role changes affect account permissions. Only make changes you are
        authorized to perform.
      </p>
    </main>
  );
}

export default AdminManagement;