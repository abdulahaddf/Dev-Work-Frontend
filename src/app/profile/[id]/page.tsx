'use client';

import { useAuthStore } from '@/lib/auth';
import { usersApi } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  Edit3,
  MapPin,
  Save,
  Shield,
  Star,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  avatar: string | null;
  skills: string[];
  location: string | null;
  roles: string[];
  createdAt: string;
  stats: {
    completedAsBuyer: number;
    completedAsSolver: number;
    totalCompleted: number;
  };
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const userId = params.id as string;
  const isOwnProfile = currentUser?.id === userId;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    loadProfile();
  }, [userId]);

  async function loadProfile() {
    try {
      setLoading(true);
      const res = await usersApi.getProfile(userId);
      const data = res.data.data;
      setProfile(data);
      setBio(data.bio || '');
      setAvatar(data.avatar || '');
      setSkills(data.skills || []);
      setLocation(data.location || '');
    } catch {
      toast.error('Failed to load profile');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await usersApi.updateProfile({
        bio: bio || undefined,
        avatar: avatar || undefined,
        skills: skills.length > 0 ? skills : undefined,
        location: location || undefined,
      });
      toast.success('Profile updated!');
      setEditing(false);
      loadProfile();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  function addSkill() {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 20) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  // Initials fallback for avatar
  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-500/20 text-red-400 border-red-500/30',
    BUYER: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    SOLVER: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Background effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0F766E]/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#14B8A6]/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0F172A]/80 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#14B8A6] flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-[#0F766E]/20 flex-shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                getInitials(profile.name)
              )}
            </div>

            {/* Name + Meta */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{profile.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {profile.roles.map((role) => (
                  <span
                    key={role}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${roleColors[role] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}
                  >
                    <Shield className="w-3 h-3 inline mr-1" />
                    {role}
                  </span>
                ))}
              </div>
              {profile.location && (
                <p className="text-gray-400 flex items-center gap-1 text-sm">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </p>
              )}
            </div>

            {/* Edit button */}
            {isOwnProfile && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn btn-ghost flex items-center gap-2 text-sm"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </motion.div>

        {/* Edit Form */}
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0F172A]/80 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-8 mb-6"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Edit Profile</h2>

            <div className="space-y-5">
              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people about yourself..."
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#14B8A6] transition-colors resize-none"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{bio.length}/500</p>
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Avatar URL</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#14B8A6] transition-colors"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#14B8A6] transition-colors"
                  maxLength={100}
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Skills ({skills.length}/20)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-[#0F766E]/20 text-[#5EEAD4] rounded-full text-sm flex items-center gap-1 border border-[#0F766E]/30"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill..."
                    className="flex-1 bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#14B8A6] transition-colors text-sm"
                    maxLength={50}
                  />
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-[#0F766E] hover:bg-[#14B8A6] text-white rounded-lg text-sm transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setBio(profile.bio || '');
                  setAvatar(profile.avatar || '');
                  setSkills(profile.skills || []);
                  setLocation(profile.location || '');
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Bio Section */}
        {profile.bio && !editing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0F172A]/80 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-8 mb-6"
          >
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-[#14B8A6]" />
              About
            </h2>
            <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
          </motion.div>
        )}

        {/* Skills Section */}
        {profile.skills.length > 0 && !editing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0F172A]/80 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-8 mb-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#14B8A6]" />
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 bg-[#0F766E]/15 text-[#5EEAD4] rounded-xl text-sm font-medium border border-[#0F766E]/25 hover:bg-[#0F766E]/25 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0F172A]/80 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-8 mb-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#14B8A6]" />
            Project Stats
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#1E293B]/50 rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-[#14B8A6]">{profile.stats.totalCompleted}</p>
              <p className="text-sm text-gray-400 mt-1">Total Completed</p>
            </div>
            <div className="bg-[#1E293B]/50 rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-blue-400">{profile.stats.completedAsBuyer}</p>
              <p className="text-sm text-gray-400 mt-1">As Buyer</p>
            </div>
            <div className="bg-[#1E293B]/50 rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-emerald-400">{profile.stats.completedAsSolver}</p>
              <p className="text-sm text-gray-400 mt-1">As Solver</p>
            </div>
          </div>
        </motion.div>

        {/* Member Since */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-500 text-sm"
        >
          Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </motion.div>
      </div>
    </div>
  );
}
