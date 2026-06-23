import React, { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';
import axios from 'axios';
import { FiX, FiPlus, FiTrash2, FiCreditCard } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';

const FundProject = ({ onClose, jobData, clientInfo, userBalance }) => {
    const [loading, setLoading] = useState(false);
    const [payMethod, setPayMethod] = useState('paystack');
    
    // Manage dynamic stages
    const [stages, setStages] = useState([{ title: 'Initial Phase', description: jobData.description, amount: jobData.price }]);

    const addStage = () => setStages([...stages, { title: '', description: '', amount: 0 }]);
    const removeStage = (index) => setStages(stages.filter((_, i) => i !== index));
    
    const updateStage = (index, field, value) => {
        const newStages = [...stages];
        newStages[index][field] = value;
        setStages(newStages);
    };

    const totalAmount = stages.reduce((sum, s) => sum + Number(s.amount), 0);

    const config = {
        reference: (new Date()).getTime().toString(),
        email: "client@octfix.com", 
        amount: totalAmount * 100, 
        publicKey: 'pk_test_your_key_here',
    };

    const initializePayment = usePaystackPayment(config);

    const handleFunding = async (reference = null) => {
        setLoading(true);
        try {
            const payload = {
                jobOfferId: jobData._id,
                clientId: clientInfo._id,
                amount: totalAmount,
                milestones: stages,
                payMethod: payMethod,
                reference: reference?.reference || null
            };

            const res = await axios.post('/api/fund-project', payload);
            if (res.data.success) onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Funding failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[90] h-[100vh] flex items-center justify-center md:p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-hide">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-black">Define Contract Stages</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><FiX /></button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Stage Builder */}
                    <div className="space-y-4">
                        {stages.map((stage, index) => (
                            <div key={index} className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl border border-white/5 relative">
                                {index > 0 && (
                                    <button onClick={() => removeStage(index)} className="absolute top-2 right-2 text-red-500"><FiTrash2 /></button>
                                )}
                                <input 
                                    className="bg-transparent font-bold w-full mb-2 outline-none" 
                                    placeholder="Stage Title"
                                    value={stage.title}
                                    onChange={(e) => updateStage(index, 'title', e.target.value)}
                                />
                                <textarea 
                                    className="bg-transparent text-sm w-full h-16 outline-none opacity-70" 
                                    placeholder="What are the requirements for this stage?"
                                    value={stage.description}
                                    onChange={(e) => updateStage(index, 'description', e.target.value)}
                                />
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs font-bold opacity-50">₦</span>
                                    <input 
                                        type="number" 
                                        className="bg-transparent font-black text-[var(--active-color)] w-24 outline-none"
                                        value={stage.amount}
                                        onChange={(e) => updateStage(index, 'amount', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                        <button onClick={addStage} className="flex items-center gap-2 text-xs font-bold text-[var(--active-color)]">
                            <FiPlus /> ADD ANOTHER STAGE
                        </button>
                    </div>

                    {/* Total & Payment Method */}
                    <div className="text-center py-4 border-t border-white/5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Total Escrow Amount</p>
                        <h1 className="text-4xl font-black">₦{totalAmount.toLocaleString()}</h1>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-1 bg-slate-200 dark:bg-white/10 rounded-2xl">
                        <button onClick={() => setPayMethod('paystack')} className={`py-3 rounded-xl text-xs font-bold ${payMethod === 'paystack' ? 'bg-white dark:bg-zinc-800 text-[var(--active-color)]' : 'opacity-50'}`}>
                            Paystack
                        </button>
                        <button onClick={() => setPayMethod('balance')} className={`py-3 rounded-xl text-xs font-bold ${payMethod === 'balance' ? 'bg-white dark:bg-zinc-800 text-[var(--active-color)]' : 'opacity-50'}`}>
                            Balance
                        </button>
                    </div>

                    <button 
                        onClick={() => payMethod === 'paystack' ? initializePayment(handleFunding) : handleFunding()}
                        disabled={loading || (payMethod === 'balance' && userBalance < totalAmount)}
                        className="w-full py-4 bg-[var(--active-color)] text-white rounded-2xl font-black shadow-lg"
                    >
                        {loading ? "Processing..." : "Confirm & Hire"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FundProject;
