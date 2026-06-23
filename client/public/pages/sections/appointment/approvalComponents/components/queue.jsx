import React from 'react'
import { FaCheck, FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaInbox } from 'react-icons/fa';
import { MdOutlineDoubleArrow } from 'react-icons/md';


const Queue = ({ pendingRequests, setQueueId }) => {
  const queue = pendingRequests.filter((x) => x.isNew === true)
  return (
    <div className="hidden lg:block w-80">
        <div className="bg-[#042d1d] dark:bg-white/2 border border-white/5 rounded-3xl p-6 sticky top-8">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-white">
                <MdOutlineDoubleArrow className="text-white" />
                Quick Queue
            </h3>
            <div className="space-y-6">
            {queue.map((req) => (
                <div key={req.id} className="flex items-center gap-3" onClick={() => setQueueId(req._id)}>
                    <div className="h-10 w-10 rounded-full border-1 text-[var(--active-color)] border-[var(--active-color)] flex items-center justify-center text-sm font-bold">{req.avatar}</div>
                <div>
                    <p className="text-sm font-bold">{req.client}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{req.time}</p>
                </div>
                {req.isNew? <span className='w-[5px] h-[5px] rounded-full bg-green-400'></span> : ''}
                </div>
            ))}
            </div>
        </div>
    </div>
  )
}

export default Queue
