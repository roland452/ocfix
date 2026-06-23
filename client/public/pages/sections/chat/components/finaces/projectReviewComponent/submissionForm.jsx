import React from 'react'
import { FiPlus, FiUpload, FiTrash2 } from 'react-icons/fi';

const SubmissionForm = ({ 
    userType, 
    currentProof,
    contract,
    activeMilestoneIndex,
    notes, 
    setNotes, 
    selectedFiles, 
    setSelectedFiles, 
    handleNewSubmission, 
    loading
  }) => {
  return (
    <>
        {userType === 'developer' && contract?.milestones?.[activeMilestoneIndex]?.status !== 'approved' && currentProof.submissions?.filter(s => Number(s.milestoneIndex) === activeMilestoneIndex).length === 0 && (
            <div className="bg-[var(--active-color)]/5 border-2 border-dashed border-[var(--active-color)]/20 p-6 rounded-[2.5rem] space-y-4">
                <textarea 
                    className="w-full h-28 p-4 bg-white dark:bg-black/20 rounded-2xl text-sm outline-none border border-zinc-100 dark:border-white/5"
                    placeholder="Describe how your work matches the stage requirements..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                    {selectedFiles.map(file => (
                        <div key={file.id} className="relative group w-16 h-16 rounded-xl overflow-hidden border-2 border-[var(--active-color)]">
                            <img src={file.preview} className="w-full h-full object-cover" />
                            <button onClick={() => setSelectedFiles(prev => prev.filter(f => f.id !== file.id))} className="absolute inset-0 bg-red-500/80 flex items-center justify-center text-white"><FiTrash2 /></button>
                        </div>
                    ))}
                    <label className="w-16 h-16 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-xl cursor-pointer">
                        <input type="file" multiple className="hidden" onChange={(e) => {
                            const files = Array.from(e.target.files).map(f => ({ id: Math.random(), file: f, preview: URL.createObjectURL(f) }));
                            setSelectedFiles(prev => [...prev, ...files]);
                        }} />
                        <FiUpload className="text-zinc-400" />
                    </label>
                </div>
                <button onClick={handleNewSubmission} disabled={loading} className="w-full py-4 bg-[var(--active-color)] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg">
                    {loading ? "Uploading..." : "Submit Progress"}
                </button>
            </div>
        )}
        
    </>
  )
}

export default SubmissionForm
