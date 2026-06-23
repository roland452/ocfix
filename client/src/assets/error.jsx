import { FiAlertCircle } from 'react-icons/fi';
import React from 'react'

const ErrorMessage = ({refresh,setRefresh}) => {
  return (
    <div class="fixed top-[50%] left-[50%] translate-[-50%]">
     <div>
        <div className="flex flex-col items-center justify-center h-64 mt-20 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <FiAlertCircle size={30} />
            </div>
            <h3 className="font-bold text-slate-800">Connection Failed</h3>
            <p className="text-xs text-slate-400 mb-6">We couldn't reach the servers.</p>
            <button className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl" onClick={() => setRefresh(!refresh)}>Retry Connection</button>
        </div>
      </div>
    </div>
  )
}

export default ErrorMessage
