import React, { useState, useEffect } from 'react';
import { getUsers, createUser, deleteUser } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ModalShell from '../components/ModalShell';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Form states
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('ROLE_USER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      toast.error('Username and password are required');
      return;
    }
    setIsSubmitting(true);
    try {
      await createUser({
        username: newUsername.trim(),
        password: newPassword.trim(),
        role: newRole,
      });
      toast.success(`User "${newUsername}" created successfully!`);
      setIsCreateOpen(false);
      // Reset form
      setNewUsername('');
      setNewPassword('');
      setNewRole('ROLE_USER');
      // Refresh list
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteUser(deleteCandidate.id);
      toast.success(`User "${deleteCandidate.username}" deleted successfully.`);
      setDeleteCandidate(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 max-w-5xl mx-auto font-body-md text-on-surface">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container border-2 border-[#000000] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded">
        <div>
          <h1 className="text-headline-lg font-bold text-primary">User Directory</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Manage application access roles and create/delete tenant accounts.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="h-[48px] px-6 bg-primary text-on-primary border-2 border-[#000000] font-label-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none rounded self-start sm:self-auto shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Create New User
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative border-2 border-[#000000] bg-surface flex items-center rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <span className="material-symbols-outlined absolute left-4 text-on-surface-variant">search</span>
        <input
          type="text"
          placeholder="Search users by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-[48px] pl-12 pr-4 bg-transparent outline-none font-body-md"
        />
      </div>

      {/* Users List Container */}
      <div className="border-2 border-[#000000] bg-surface-container-lowest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden rounded">
        {isLoading ? (
          <div className="py-16 flex items-center justify-center">
            <LoadingSpinner message="Fetching user accounts..." />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 px-6 text-center text-on-surface-variant flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[48px] text-outline">group_off</span>
            <div className="font-headline-md font-bold text-on-surface mt-2">No users found</div>
            <p className="text-sm">Try modifying your search query or add a new user account.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-variant border-b-2 border-[#000000] font-label-bold text-xs uppercase tracking-wider text-on-surface-variant">
                  <th className="p-4 pl-6">Username</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">Account ID</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#000000]">
                {filteredUsers.map((u) => {
                  const isSelf = currentUser && currentUser.username === u.username;
                  const isAdmin = u.role === 'ROLE_ADMIN';

                  return (
                    <tr key={u.id} className="hover:bg-surface-container-low transition-colors font-body-md">
                      <td className="p-4 pl-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold">{u.username}</span>
                          {isSelf && (
                            <span className="ml-2 px-2 py-0.5 text-[10px] font-label-bold bg-secondary-container text-on-secondary-fixed border border-outline rounded">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 font-label-bold text-xs rounded border border-[#000000] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                            isAdmin
                              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                              : 'bg-primary-fixed text-on-primary-fixed'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {isAdmin ? 'shield_person' : 'person'}
                          </span>
                          {isAdmin ? 'Administrator' : 'Standard User'}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs text-on-surface-variant">
                        {u.id}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        {!isSelf ? (
                          <button
                            onClick={() => setDeleteCandidate(u)}
                            className="w-10 h-10 inline-flex items-center justify-center border-2 border-[#000000] hover:bg-error-container hover:text-on-error-container text-error rounded transition-colors cursor-pointer"
                            title="Delete User Account"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        ) : (
                          <span className="text-xs text-on-surface-variant font-label-bold italic px-3">
                            Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <ModalShell
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New User Account"
        size="md"
      >
        <form onSubmit={handleCreateUser} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-label-bold">Username</label>
            <input
              type="text"
              required
              placeholder="e.g. farmer_manager"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="h-[48px] px-4 border-2 border-[#000000] bg-surface outline-none transition-all rounded focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-label-bold">Initial Password</label>
            <input
              type="password"
              required
              placeholder="Min 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-[48px] px-4 border-2 border-[#000000] bg-surface outline-none transition-all rounded focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-label-bold">System Role</label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex items-center gap-3 p-4 border-2 border-[#000000] rounded cursor-pointer transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                  newRole === 'ROLE_USER'
                    ? 'bg-primary-fixed text-on-primary-fixed'
                    : 'bg-surface hover:bg-surface-container'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="ROLE_USER"
                  checked={newRole === 'ROLE_USER'}
                  onChange={() => setNewRole('ROLE_USER')}
                  className="accent-primary h-4 w-4"
                />
                <div className="flex flex-col">
                  <span className="font-label-bold text-sm">Standard User</span>
                  <span className="text-[10px] opacity-85">Manage purchases & transactions</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-4 border-2 border-[#000000] rounded cursor-pointer transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                  newRole === 'ROLE_ADMIN'
                    ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                    : 'bg-surface hover:bg-surface-container'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="ROLE_ADMIN"
                  checked={newRole === 'ROLE_ADMIN'}
                  onChange={() => setNewRole('ROLE_ADMIN')}
                  className="accent-tertiary h-4 w-4"
                />
                <div className="flex flex-col">
                  <span className="font-label-bold text-sm">Administrator</span>
                  <span className="text-[10px] opacity-85">Full settings and user rights</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-4 justify-end mt-4 pt-4 border-t-2 border-[#000000]">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-6 h-[48px] border-2 border-[#000000] text-on-surface hover:bg-surface-variant font-label-bold transition-colors cursor-pointer rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 h-[48px] bg-primary text-on-primary border-2 border-[#000000] font-label-bold hover:opacity-90 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none rounded"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </ModalShell>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm User Account Deletion"
        message={`Are you sure you want to delete the user account "${deleteCandidate?.username}"? This action cannot be undone and they will lose all access to their isolated workspace details.`}
      />
    </div>
  );
}
