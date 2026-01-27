import Link from 'next/link'
import React from 'react'

export default function Footer() {
  return (
     <footer className="relative z-10  border-t border-[#1E293B] my-20 px-6 py-8">
        <div className="max-w-7xl mx-auto text-center text-[#6B7280] text-sm">
          <p>Built with Next.js, Express, Prisma, and PostgreSQL</p>
          <p className="mt-2">©2026 DevWork. SaaS Demo. By <Link target="_blank" href="https://www.linkedin.com/in/abdulahad-df" className="text-[#14B8A6] hover:underline">AHAD</Link></p>
        </div>
      </footer>
  )
}
