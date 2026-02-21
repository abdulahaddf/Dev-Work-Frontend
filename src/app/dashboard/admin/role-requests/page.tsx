'use client';

import { useEffect, useState } from 'react';
import { roleRequestApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  User,
  ExternalLink,
  Check,
  X,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface RoleRequest {
  id: string;
  requestedRole: string;
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminRoleRequestsPage() {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const statusValue = filter === 'ALL' ? undefined : filter;
      const res = await roleRequestApi.getAll(statusValue);
      setRequests(res.data.data);
    } catch (err) {
      toast.error('Failed to load role requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      setSubmitting(true);
      await roleRequestApi.review(id, {
        status,
        adminNote: adminNote.trim() || undefined,
      });
      toast.success(`Request ${status.toLowerCase()} successfully`);
      setReviewingId(null);
      setAdminNote('');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to review request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'APPROVED': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'REJECTED': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Role Requests</h1>
          <p className="text-sm text-gray-400">Manage user requests for elevated account privileges</p>
        </div>

        <div className="flex items-center gap-2 bg-[#1E293B] p-1 rounded-xl">
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === s ? 'bg-[#0F766E] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-[#0F172A]/30 border border-[#1E293B] border-dashed rounded-2xl p-20 text-center text-gray-500">
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="text-lg">No role requests found</p>
            <p className="text-sm opacity-60">Wait for users to submit requests or change filters</p>
          </div>
        ) : (
          requests.map((req) => (
            <motion.div
              layout
              key={req.id}
              className="bg-[#0F172A]/80 backdrop-blur-xl border border-[#1E293B] rounded-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#1E293B] flex items-center justify-center text-[#14B8A6]">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {req.user.name}
                        <Link 
                          href={`/profile/${req.user.id}`} 
                          className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-[#14B8A6]"
                          target="_blank"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-400">{req.user.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(req.status)}`}>
                      {req.status}
                    </div>
                    <span className="text-[10px] text-gray-500">
                      Requested: {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">Requested Role</div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-xs font-bold">
                    {req.requestedRole}
                  </div>
                </div>

                <div className="bg-[#1E293B]/50 rounded-xl p-4 mb-6">
                  <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">Internal Reason</div>
                  <p className="text-sm text-gray-300 italic">"{req.reason || 'No reason specified'}"</p>
                </div>

                {reviewingId === req.id ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-4 border-t border-[#1E293B]"
                  >
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Admin Note (Visible to User)</label>
                      <textarea
                        className="w-full bg-[#020617] border border-[#334155] rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#14B8A6] transition-colors h-24"
                        placeholder="Provide reasoning for your decision..."
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(req.id, 'APPROVED')}
                        disabled={submitting}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Approve</>}
                      </button>
                      <button
                        onClick={() => handleReview(req.id, 'REJECTED')}
                        disabled={submitting}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><X className="w-4 h-4" /> Reject</>}
                      </button>
                      <button
                        onClick={() => { setReviewingId(null); setAdminNote(''); }}
                        className="px-4 bg-[#1E293B] text-gray-400 hover:text-white rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : req.status === 'PENDING' ? (
                  <div className="pt-4 border-t border-[#1E293B]">
                    <button
                      onClick={() => setReviewingId(req.id)}
                      className="w-full bg-[#1E293B] border border-[#334155] hover:border-[#14B8A6] text-white font-bold py-2 rounded-lg transition-all text-sm"
                    >
                      Make Decision
                    </button>
                  </div>
                ) : req.adminNote && (
                  <div className="pt-4 border-t border-[#1E293B]">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">Your response</div>
                    <p className="text-xs text-gray-400 italic">"{req.adminNote}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
