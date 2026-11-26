import Link from 'next/link'
import { LayoutDashboard, Globe, Linkedin, GraduationCap, Building2, Flame, FileText } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f2557] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="text-xs text-blue-300 uppercase tracking-widest mb-1">KOST GROUP</div>
          <div className="font-bold text-lg">Africa CRM</div>
          <div className="text-xs text-blue-300 mt-1">DGR IATA — Prospection B2B</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/dashboard/blitz" icon={<Flame size={16} />} label="🔥 Blitz Septembre" urgent />
          <NavLink href="/dashboard" icon={<LayoutDashboard size={16} />} label="Vue globale" />
          <NavLink href="/dashboard/prospects" icon={<Building2 size={16} />} label="Prospects B2B" />
          <NavLink href="/dashboard/instructors" icon={<GraduationCap size={16} />} label="Instructeurs CBTA" />
          <NavLink href="/dashboard/proposal" icon={<FileText size={16} />} label="Propositions" />
          <NavLink href="/dashboard/linkedin" icon={<Linkedin size={16} />} label="LinkedIn Agent" />
        </nav>
        <div className="p-4 border-t border-white/10">
          <a
            href="https://dgr.kostacademy.com"
            target="_blank"
            className="flex items-center gap-2 text-xs text-blue-300 hover:text-white transition-colors"
          >
            <Globe size={12} />
            dgr.kostacademy.com
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, icon, label, urgent }: { href: string; icon: React.ReactNode; label: string; urgent?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
        urgent
          ? 'bg-red-600/30 text-red-300 hover:bg-red-600/50 hover:text-white font-semibold border border-red-500/30'
          : 'text-blue-100 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}
