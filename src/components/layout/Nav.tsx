import { useAuthStore } from '@/lib/auth';
import { BriefcaseBusiness } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function Nav() {
    const { isAuthenticated } = useAuthStore();
  return (
    <nav className=" w-11/12 mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0F766E] to-[#14B8A6] flex items-center justify-center">
              <BriefcaseBusiness className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">DevWork</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? <>
            <Link href="/dashboard" className="btn btn-primary text-lg px-4 py-1">Dashboard</Link>
            <button onClick={() => {useAuthStore.getState().logout()}} className="btn btn-primary text-lg px-4 py-1">Logout</button>
            </> : <><Link href="/login" className="btn btn-ghost">
              Sign In
            </Link>
            <Link href="/register" className="btn btn-primary">
              Get Started
            </Link></>}
            
          </div>
        </nav>
  )
}
