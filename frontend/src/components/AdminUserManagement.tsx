import React, { useEffect, useState } from 'react';
import { History, Shield, UserCheck, UserX, Users } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { AuditLogItem, Role, User } from '../types';

export const AdminUserManagement: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'USERS' | 'AUDIT'>('USERS');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsersAndLogs = async () => {
    setIsLoading(true);
    try {
      const [usersData, logsData] = await Promise.all([
        api.admin.getAllUsers(),
        api.admin.getAuditLogs(0, 30),
      ]);
      setUsers(usersData);
      setAuditLogs(logsData.content || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch admin data';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndLogs();
  }, []);

  const handleUpdateStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.admin.updateUserStatus(userId, newStatus);
      showToast(`User status updated to ${newStatus}`, 'success');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, accountStatus: newStatus as any } : u))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      showToast(msg, 'error');
    }
  };

  const handleUpdateRole = async (userId: number, newRole: Role) => {
    try {
      await api.admin.updateUserRole(userId, newRole);
      showToast(`User role updated to ${newRole}`, 'success');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Role change failed';
      showToast(msg, 'error');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      {/* Sub tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setActiveSubTab('USERS')}
            className="btn btn-sm"
            style={{
              background: activeSubTab === 'USERS' ? 'var(--primary)' : 'var(--bg-tertiary)',
              color: activeSubTab === 'USERS' ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Users size={16} /> User Directory ({users.length})
          </button>

          <button
            onClick={() => setActiveSubTab('AUDIT')}
            className="btn btn-sm"
            style={{
              background: activeSubTab === 'AUDIT' ? 'var(--primary)' : 'var(--bg-tertiary)',
              color: activeSubTab === 'AUDIT' ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <History size={16} /> Audit Trail ({auditLogs.length})
          </button>
        </div>

        <button onClick={fetchUsersAndLogs} className="btn btn-secondary btn-sm">
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
          Loading admin records...
        </div>
      ) : activeSubTab === 'USERS' ? (
        /* User Directory Table */
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>User Profile</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.fullName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{u.email}</div>
                  </td>

                  <td>
                    <select
                      className="input-field"
                      style={{ padding: '0.35rem 1.75rem 0.35rem 0.65rem', fontSize: '0.8rem', width: 'auto' }}
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value as Role)}
                    >
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="OPERATOR">OPERATOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>

                  <td>
                    <span
                      className={`badge badge-${
                        u.accountStatus === 'ACTIVE' ? 'available' : 'occupied'
                      }`}
                    >
                      {u.accountStatus}
                    </span>
                  </td>

                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  <td>
                    <button
                      onClick={() => handleUpdateStatus(u.id, u.accountStatus)}
                      className={`btn btn-sm ${u.accountStatus === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`}
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      {u.accountStatus === 'ACTIVE' ? (
                        <>
                          <UserX size={14} /> Suspend
                        </>
                      ) : (
                        <>
                          <UserCheck size={14} /> Activate
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Audit Trail Table */
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target Resource</th>
                <th>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    No audit records recorded yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{log.actorName}</div>
                      {log.actorEmail && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{log.actorEmail}</div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {log.resourceType} {log.resourceId ? `#${log.resourceId}` : ''}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono' }}>
                      {log.metadata || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
