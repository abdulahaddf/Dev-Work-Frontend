'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '@/lib/api';
import { RoleBadge } from '@/components/status/StatusBadge';
import Modal from '@/components/modals/Modal';
import { Search, UserPlus, Shield, Briefcase, Wrench } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [pagination.page, search]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getUsers({
        page: pagination.page,
        limit: 10,
        search: search || undefined,
      });
      setUsers(response.data.data.users);
      setPagination({
        page: response.data.data.pagination.page,
        totalPages: response.data.data.pagination.totalPages,
        total: response.data.data.pagination.total,
      });
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignRole = async (roleName: 'ADMIN' | 'BUYER' | 'SOLVER') => {
    if (!selectedUser) return;
    
    try {
      setIsActionLoading(true);
      await adminApi.assignRole({
        userId: selectedUser.id,
        roleName,
      });
      toast.success(`${roleName} role assigned!`);
      setShowRoleModal(false);
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign role');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRemoveRole = async (userId: string, roleName: 'ADMIN' | 'BUYER' | 'SOLVER') => {
    try {
      setIsActionLoading(true);
      await adminApi.removeRole({ userId, roleName });
      toast.success(`${roleName} role removed!`);
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove role');
    } finally {
      setIsActionLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#E5E7EB]">User Management</h1>
        <p className="text-[#6B7280]">Manage user roles and permissions</p>
      </div>

      {/* Search */}
     <div className="relative max-w-md">
  {/* The Icon */}
     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none z-10" />
  
        <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users by name or email..."
        className="input w-full pl-10!"/>
        </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner" />
        </div>
      ) : users.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="card overflow-hidden p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1E293B]">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-[#6B7280]">User</th>
                  <th className="text-left p-4 text-sm font-medium text-[#6B7280]">Roles</th>
                  <th className="text-left p-4 text-sm font-medium text-[#6B7280]">Projects</th>
                  <th className="text-left p-4 text-sm font-medium text-[#6B7280]">Joined</th>
                  <th className="text-right p-4 text-sm font-medium text-[#6B7280]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {users.map((user) => (
                  <motion.tr key={user.id} variants={itemVariants} className="hover:bg-[#1E293B]/50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-[#E5E7EB]">{user.name}</p>
                        <p className="text-sm text-[#6B7280]">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map((role: string) => (
                          <span key={role} className="group relative">
                            <RoleBadge role={role} />
                            <button
                              onClick={() => handleRemoveRole(user.id, role as any)}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs hidden group-hover:flex items-center justify-center"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-[#6B7280]">
                        <p>{user.stats.projectsAsBuyer} as buyer</p>
                        <p>{user.stats.projectsAsSolver} as solver</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[#6B7280]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRoleModal(true);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Role
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-[#6B7280]">No users found</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span className="flex items-center px-4 text-[#6B7280]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page === pagination.totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}

      {/* Role Assignment Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title={`Assign Role to ${selectedUser?.name}`}
      >
        <div className="space-y-4">
          <p className="text-[#6B7280]">Select a role to assign:</p>
          <div className="grid gap-3">
            <button
              onClick={() => handleAssignRole('ADMIN')}
              disabled={isActionLoading || selectedUser?.roles.includes('ADMIN')}
              className="flex items-center gap-3 p-4 bg-[#1E293B] rounded-lg hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shield className="w-6 h-6 text-red-400" />
              <div className="text-left">
                <p className="font-medium text-[#E5E7EB]">Admin</p>
                <p className="text-sm text-[#6B7280]">Full system access and role management</p>
              </div>
            </button>
            <button
              onClick={() => handleAssignRole('BUYER')}
              disabled={isActionLoading || selectedUser?.roles.includes('BUYER')}
              className="flex items-center gap-3 p-4 bg-[#1E293B] rounded-lg hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Briefcase className="w-6 h-6 text-blue-400" />
              <div className="text-left">
                <p className="font-medium text-[#E5E7EB]">Buyer</p>
                <p className="text-sm text-[#6B7280]">Create projects and manage solvers</p>
              </div>
            </button>
            <button
              onClick={() => handleAssignRole('SOLVER')}
              disabled={isActionLoading || selectedUser?.roles.includes('SOLVER')}
              className="flex items-center gap-3 p-4 bg-[#1E293B] rounded-lg hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wrench className="w-6 h-6 text-green-400" />
              <div className="text-left">
                <p className="font-medium text-[#E5E7EB]">Solver</p>
                <p className="text-sm text-[#6B7280]">Work on projects and submit deliverables</p>
              </div>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
