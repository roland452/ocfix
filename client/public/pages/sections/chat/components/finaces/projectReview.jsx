import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useChat from '../../context/chat.js'; 
import { FiX, FiPlus, FiUpload, FiTrash2, FiMessageSquare, FiClock, FiEdit3, FiAlertTriangle, FiCheckCircle, FiSave, FiCamera } from 'react-icons/fi';
import useToast from '../../../../../context/toast.js';
import SubmittedHistory from './projectReviewComponent/submittedHistory.jsx';
import SubmissionForm from './projectReviewComponent/submissionForm.jsx';
import SubmissionHeader from './projectReviewComponent/submissionHeader.jsx';

const ReviewProject = ({ contract, userType, onClose }) => {
    const proofKey = `${contract?._id}_${contract?.jobOfferId}`;
    const setToast = useToast((state) => state.setToast);
    const setProjectProof = useChat((state) => state.setProjectProof);
    const projectProofs = useChat((state) => state.projectProofs);
    const activeChat = useChat((state) => state.activeChat);

    const currentProof = projectProofs[proofKey] || { submissions: [] };
    //const userType = 'client';
    console.log(userType);
    

    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(contract?.currentMilestone || 0);
    const [previewMedia, setPreviewMedia] = useState(null);

    // New Interaction States
    const [editMode, setEditMode] = useState(null); 
    const [activeActionId, setActiveActionId] = useState(null);
    const [disputeReason, setDisputeReason] = useState("");
    const [timeLeft, setTimeLeft] = useState("");

    const fetchWorkProgress = async () => {
        try {
            const res = await axios.get(`/api/escrow/submitted-work?contractId=${contract?._id}`, { withCredentials: true });
            if (res.data) setProjectProof(proofKey, res.data);
        } catch (error) { console.error(error); }
    };

    // Timer Logic
    useEffect(() => {
        const timer = setInterval(() => {
            const end = new Date(contract?.autoReleaseDate).getTime();
            const now = new Date().getTime();
            const distance = end - now;

            if (distance < 0) {
                setTimeLeft("EXPIRED");
                clearInterval(timer);
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                setTimeLeft(`${days}d ${hours}h remaining`);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [contract?.autoReleaseDate]);

    useEffect(() => { if (contract?._id) fetchWorkProgress(); }, [contract?._id]);

    const handleNewSubmission = async () => {
        if (!notes && selectedFiles.length === 0) return setToast("Please add notes or files", "error");
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('notes', notes);
            formData.append('contractId', contract?._id);
            formData.append('milestoneIndex', activeMilestoneIndex);
            selectedFiles.forEach(item => formData.append('submissions', item.file));
            
            await axios.post(`/api/escrow/submit-work`, formData, { withCredentials: true });
            setNotes("");
            setSelectedFiles([]);
            await fetchWorkProgress();
            setToast("Stage work submitted successfully!", "success");
        } catch (err) { setToast("Submission failed", "error"); } 
        finally { setLoading(false); }
    };

    const handleUpdateSubmission = async (submissionId) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('contractId', contract?._id);
            formData.append('submissionId', submissionId);
            formData.append('notes', notes);
            selectedFiles.forEach(item => formData.append('submissions', item.file));

            await axios.put(`/api/escrow/update-submission`, formData, { withCredentials: true });
            setEditMode(null);
            setSelectedFiles([]);
            fetchWorkProgress();
            setToast("Submission updated successfully!", "success");
        } catch (err) { setToast("Update failed", "error"); }
        finally { setLoading(false); }
    };

    const handleDispute = async (submissionId) => {
        if (!disputeReason) return setToast("Please provide a reason", "error");
        setLoading(true);
        try {
            await axios.post(`/api/escrow/dispute-stage`, {
                contractId: contract?._id,
                milestoneIndex: activeMilestoneIndex,
                reason: disputeReason
            }, { withCredentials: true });
            setActiveActionId(null);
            setDisputeReason("");
            fetchWorkProgress();
            setToast("Dispute submitted", "success");
        } catch (err) { setToast("Action failed", "error"); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 h-[100vh] z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md">
            <div className="w-full max-w-2xl bg-white dark:bg-[#212020] rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[100vh]">
                
                {/* HEADER */}
                <SubmissionHeader 
                    contract={contract}
                    onClose={onClose}
                    timeLeft={timeLeft}
                    setActiveMilestoneIndex={setActiveMilestoneIndex}
                    activeMilestoneIndex={activeMilestoneIndex}
                    setEditMode={setEditMode}
                    setSelectedFiles={setSelectedFiles}
                />

                <div className="flex-1 overflow-y-auto p-4 md:p-6 sm:p-8 space-y-8 scrollbar-hide">
                    {/* Judgment Criteria */}
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem]">
                        <p className="text-[10px] font-black text-emerald-500 uppercase mb-2 tracking-widest">Judgment Criteria (Stage {activeMilestoneIndex + 1})</p>
                        <p className="text-sm font-medium opacity-80 leading-relaxed">
                            {contract?.milestones?.[activeMilestoneIndex]?.description || "No specific requirements listed."}
                        </p>
                    </div>

                    {/* NEW SUBMISSION FORM (If Stage is Empty) */}
                    <SubmissionForm 
                        userType={userType} 
                        currentProof={currentProof}
                        contract={contract}
                        activeMilestoneIndex={activeMilestoneIndex}
                        notes={notes} 
                        setNotes={setNotes} 
                        selectedFiles={selectedFiles} 
                        setSelectedFiles={setSelectedFiles} 
                        handleNewSubmission={handleNewSubmission} 
                        loading={loading}
                    />

                    {/* SUBMISSION HISTORY */}
                    <SubmittedHistory 
                        currentProof={currentProof}
                        editMode={editMode}
                        setEditMode={setEditMode}
                        setNotes={setNotes}
                        notes={notes}
                        setPreviewMedia={setPreviewMedia}
                        activeActionId={activeActionId} 
                        setActiveActionId={setActiveActionId}
                        userType={userType}
                        activeMilestoneIndex={activeMilestoneIndex}
                        selectedFiles={selectedFiles}
                        setSelectedFiles={setSelectedFiles}
                        handleDispute={handleDispute}
                        disputeReason={disputeReason}
                        setDisputeReason={setDisputeReason}
                        handleUpdateSubmission={handleUpdateSubmission}
                        fetchWorkProgress={fetchWorkProgress}
                    />
                </div>
            </div>

            {previewMedia && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4" onClick={() => setPreviewMedia(null)}>
                    <img src={previewMedia} className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl" />
                </div>
            )}
        </div>
    );
};

export default ReviewProject;
