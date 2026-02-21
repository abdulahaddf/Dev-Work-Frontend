'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth';
import { roleRequestApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Send, 
  CheckCircle2, 
  Clock, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RoleRequest {
  id: string;
  requestedRole: string;
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote: string | null;
  createdAt: string;
}

export default function RoleRequestPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');

  const isAlreadyBuyer = user?.roles.includes('BUYER');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await roleRequestApi.getMyRequests();
      setRequests(res.data.data);
    } catch (err) {
      toast.error('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAlreadyBuyer) return;

    try {
      setSubmitting(true);
      await roleRequestApi.submit({
        requestedRole: 'BUYER',
        reason: reason.trim() || undefined,
      });
      toast.success('Request submitted for approval!');
      setReason('');
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle2 className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#0F172A]/80 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#14B8A6]/5 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">Request Buyer Privileges</h1>
          <p className="text-gray-400 max-w-2xl">
            To start hiring solvers and creating projects, you need to be a Buyer. 
            Submit a request and an admin will review your profile.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Request Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0F172A]/50 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Send className="w-5 h-5 text-[#14B8A6]" />
            New Request
          </h2>

          {isAlreadyBuyer ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">You are already a Buyer!</h3>
              <p className="text-sm text-gray-500">You have full access to create and manage projects.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Why do you want to become a Buyer?
                </label>
                <textarea
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#14B8A6] transition-colors resize-none h-32"
                  placeholder="Tell us about your organization or the types of projects you plan to post..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-400/80 leading-relaxed">
                  Note: Role approval is subjective. Providing a clear reason increases your chances of approval.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !reason.trim()}
                className="w-full bg-[#0F766E] hover:bg-[#14B8A6] disabled:opacity-50 disabled:hover:bg-[#0F766E] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#0F766E]/20 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>

        {/* Request History */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-white px-2">Recent Requests</h2>
          
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-[#0F172A]/30 border border-[#1E293B] border-dashed rounded-2xl p-12 text-center text-gray-500">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No requests found</p>
              </div>
            ) : (
              requests.map((req) => (
                <div 
                  key={req.id}
                  className="bg-[#0F172A]/50 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-5 hover:border-[#334155] transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={`px-3 py-1 rounded-full border text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider ${getStatusColor(req.status)}`}>
                      {getStatusIcon(req.status)}
                      {req.status}
                    </div>
                    <span className="text-[10px] text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                    {req.reason || <span className="italic opacity-50">No reason provided</span>}
                  </p>

                  {req.adminNote && (
                    <div className="bg-[#1E293B] rounded-xl p-3 flex gap-2">
                      <AlertCircle className="w-4 h-4 text-[#14B8A6] flex-shrink-0" />
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Admin Note:</span>
                        <p className="text-[11px] text-gray-400 leading-relaxed italic">
                          "{req.adminNote}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
