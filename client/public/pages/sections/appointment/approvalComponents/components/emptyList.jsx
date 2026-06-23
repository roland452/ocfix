import React from 'react'
import { FaInbox } from 'react-icons/fa';

const EmptyList = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center">
        <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
            <FaInbox className="text-3xl text-emerald-500/40" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">No Pending Requests</h3>

        <p className="text-gray-500 max-w-xs mx-auto text-sm">
            Everything has been processed. New booking requests and client registrations will appear here.
        </p>
        <button 
            onClick={() => window.location.reload()} 
            className="mt-6 text-[var(--accent-green)] text-sm font-bold hover:underline"
        >
            Refresh Dashboard
        </button>
    </div>
  )
}

export default EmptyList
