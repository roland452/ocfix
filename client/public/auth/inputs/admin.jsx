import React, { useState } from 'react';
import { RiLockPasswordFill } from "react-icons/ri"; 
import { MdAttachEmail, MdAdminPanelSettings } from "react-icons/md"; 
import { FaSpinner } from "react-icons/fa"; 
import axios from 'axios';

const Admin = ({ authSection, setPopup, submitting, setSubmitting }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const apiRequest = async () => {
        setSubmitting(true);
        try {
            const res = await axios.post('/api/admin-login', { email, password }, { withCredentials: true });
            setPopup(res.data.message);
        } catch (error) {
            setPopup(error.response?.data?.message || 'Login failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = () => {
        if (!email || !password) return setPopup('Input cannot be empty');
        if (!emailRegex.test(email)) return setPopup('Invalid email');
        apiRequest();
    };

    return (
        <div className={`${authSection === 'admin' ? 'flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}`}>
            <div className="flex items-center gap-2 px-1 mb-1">
                <MdAdminPanelSettings className="text-green-500 text-xl" />
                <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Admin Portal</span>
            </div>

            <div className="space-y-4">
                <div className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus-within:border-green-500/50 transition-all">
                    <MdAttachEmail className="text-gray-400 group-focus-within:text-green-500" />
                    <input 
                        className="bg-transparent outline-none w-full text-sm dark:text-white"
                        type="text" placeholder='Admin Email'
                        value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus-within:border-green-500/50 transition-all">
                    <RiLockPasswordFill className="text-gray-400 group-focus-within:text-green-500" />
                    <input 
                        className="bg-transparent outline-none w-full text-sm dark:text-white"
                        type="password" placeholder='Master Password'
                        value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <button 
                className="w-full py-4 bg-green-500 rounded-2xl font-bold text-white shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center"
                onClick={handleSubmit}
            >
                {submitting ? <FaSpinner className="animate-spin" /> : 'Verify & Enter'}
            </button>
        </div>
    );
};

export default Admin;
