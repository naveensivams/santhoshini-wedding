import { Gem } from 'lucide-react'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Gem className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="font-bold text-xl text-gray-900 mb-2">Down for Maintenance</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Santhoshini&apos;s Wedding Planner is temporarily unavailable. We&apos;ll be back shortly!
          </p>
          <div className="mt-6 text-xs text-gray-400">🌸 Something beautiful is being prepared</div>
        </div>
      </div>
    </div>
  )
}
