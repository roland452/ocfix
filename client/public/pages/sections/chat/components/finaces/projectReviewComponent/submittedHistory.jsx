import React from 'react'
import { 
   FiCamera, FiEdit3, FiAlertTriangle
} from 'react-icons/fi';
import axios from 'axios';
import useToast from '../../../../../../context/toast';


const SubmittedHistory = ({
    currentProof,
    editMode,
    setEditMode,
    setNotes,
    notes,
    setPreviewMedia,
    activeActionId, 
    setActiveActionId,
    userType,
    activeMilestoneIndex,
    selectedFiles,
    setSelectedFiles,
    handleDispute,
    disputeReason,
    setDisputeReason,
    handleUpdateSubmission,
    fetchWorkProgress
}) => {

    const setToast = useToast((state) => state.setToast)

    
    const handleReleaseFunds = async (submissionId) => {
        // if (!window.confirm("Are you sure you want to release funds for this stage?")) return;
        
        try {
            const res = await axios.post('/api/escrow/release-funds', {
                contractId: currentProof._id, // Ensure your proof object has this
                milestoneIndex: activeMilestoneIndex,
                submissionId: submissionId
            }, { withCredentials: true });
    
            if (res.data.success) {
                // Trigger a refresh of the work progress in the parent
                fetchWorkProgress(); 
                setToast("Funds released successfully!");
            }
        } catch (err) {
            setToast(err.response?.data?.message || "Action failed");
        }
    };
  return (
    <div className="space-y-6">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2">Stage Timeline</p>
        {currentProof.submissions?.filter(s => Number(s.milestoneIndex) === activeMilestoneIndex).length > 0 ? (
            currentProof.submissions.filter(s => Number(s.milestoneIndex) === activeMilestoneIndex).map((submission, sIdx) => (
                <div key={submission._id || sIdx} className="p-6 bg-zinc-50 dark:bg-white/2 rounded-[2.5rem] border border-zinc-100 dark:border-white/5 space-y-4">
                    
                    {editMode === submission._id ? (
                        /* DEVELOPER UPDATE FORM */
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <textarea className="w-full h-24 p-4 bg-white dark:bg-black/20 rounded-2xl text-sm outline-none border border-blue-500/30" value={notes} onChange={(e) => setNotes(e.target.value)} />
                            <div className="flex flex-wrap gap-2">
                                {selectedFiles.map(file => (
                                    <div key={file.id} className="w-14 h-14 rounded-xl overflow-hidden border-2 border-blue-500"><img src={file.preview} className="w-full h-full object-cover" /></div>
                                ))}
                                <label className="w-14 h-14 flex items-center justify-center border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer">
                                    <input type="file" multiple className="hidden" onChange={(e) => {
                                        const files = Array.from(e.target.files).map(f => ({ id: Math.random(), file: f, preview: URL.createObjectURL(f) }));
                                        setSelectedFiles(prev => [...prev, ...files]);
                                    }} />
                                    <FiCamera className="text-zinc-400" />
                                </label>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditMode(null)} className="flex-1 py-3 bg-zinc-100 dark:bg-white/5 rounded-xl text-[9px] font-black uppercase">Cancel</button>
                                <button onClick={() => handleUpdateSubmission(submission._id)} className="flex-[2] py-3 bg-[var(--active-color)] text-white rounded-xl text-[9px] font-black uppercase shadow-lg">Save Changes</button>
                            </div>
                        </div>
                    ) : (
                        /* NORMAL SUBMISSION VIEW */
                        <>
                            <div className="flex justify-between items-center">
                                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${submission.status === 'disputed' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    Version {sIdx + 1} • {submission.status || 'Pending'}
                                </span>
                                <span className="text-[9px] font-bold text-zinc-400 italic">{new Date(submission.submittedAt).toLocaleDateString()}</span>
                            </div>
                            <p className='py-2 px-4 bg-[var(--active-color)]/5 rounded-2xl border border-[var(--active-color)]/10'>
                                <p className='py-3 text-[var(--active-color)]'>Developer Notes • (stage {submission.milestoneIndex + 1}) </p>
                                <p className="text-sm font-medium opacity-80">{submission.notes}</p>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {submission.files?.map((url, i) => (
                                    <img key={i} src={url} onClick={() => setPreviewMedia(url)} className="w-20 h-20 rounded-full border-3 border-[var(--active-color)]/25 object-cover cursor-pointer hover:scale-105 transition-transform" />
                                ))}
                            </div>

                            {/* ACTIONS */}
                            <div className="pt-2">
                                {userType === 'developer' && submission.status !== 'approved' && (
                                    <button onClick={() => { setEditMode(submission._id); setNotes(submission.notes); setSelectedFiles([]); }} className="w-full py-3 bg-zinc-100 dark:bg-white/5 text-zinc-500 rounded-xl font-black uppercase text-[9px] flex items-center justify-center gap-2"><FiEdit3 /> Update Content</button>
                                )}

                                {userType === 'poster' && submission.status === 'pending_approval' && (
                                    <div className="space-y-3">
                                        {activeActionId === submission._id ? (
                                            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-3">
                                                <input className="w-full p-3 bg-white dark:bg-black/20 rounded-xl text-xs outline-none" placeholder="Reason for dispute..." value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} />
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleDispute(submission._id)} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase">Confirm</button>
                                                    <button onClick={() => setActiveActionId(null)} className="flex-1 py-2 bg-zinc-100 dark:bg-white/5 rounded-lg text-[9px] font-black uppercase">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button onClick={() => setActiveActionId(submission._id)} className="flex-1 py-3 bg-red-500/10 text-red-500 rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2"><FiAlertTriangle /> Dispute</button>
                                                <button onClick={() => handleReleaseFunds(submission._id)} className="flex-[2] py-3 bg-green-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-md">Release Funds</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            ))
        ) : (
            userType === 'poster' && <div className="text-center py-10 opacity-30 font-bold text-[10px] uppercase italic tracking-[0.2em]">Awaiting developer submission</div>
        )}
    </div>
  )
}

export default SubmittedHistory
