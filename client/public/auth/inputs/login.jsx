import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import useRefresh from "../../context/refresh";
import useLoginContext from "../components/login/context";

// Sub-components
import LoginContent from "../components/login/login";
import Email from "../components/login/email";
import FaceVerification from "../components/login/faceVerification";
import { MdLogin } from 'react-icons/md';
import TwoTactor from '../components/login/twofactor';

const Login = ({ authSection, setPopup, submitting, setSubmitting }) => {
    const navigate = useNavigate();
    const setRefresh = useRefresh((state) => state.setRefresh);
    const refresh = useRefresh((state) => state.refresh);
    const loginActiveSection = useLoginContext((state) => state.loginSection);
    const setLoginActiveSection = useLoginContext((state) => state.setLoginSection);


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const apiRequest = async () => {
        setSubmitting(true);
        try {
            const res = await axios.post('/api/login', { email, password }, { withCredentials: true });
            
            // Check if backend says we need 2FA
            if (res.data.mfaRequired) {
                setPopup(res.data.message);
                setLoginActiveSection('2fa'); // This swaps the UI to the code input
                sessionStorage.setItem('pendingEmail',email)
            } else {
                // Normal login
                setPopup(res.data.message);
                setRefresh(!refresh);
                setTimeout(() => navigate('/dashboard'), 2000);
            }
        } catch (error) {
            setPopup(error.response?.data?.message || 'Login failed');
        } finally {
            setSubmitting(false);
        }
    };


    const onBack = () => {
        setLoginActiveSection('login')
    }

    const handleSubmit = () => {
        if (!email || !password) return setPopup('Input cannot be empty');
        if (!emailRegex.test(email)) return setPopup('Invalid email');
        if (password.length < 6) return setPopup('Password too short');
        apiRequest();
    };

    return (
        <div className={`${authSection === 'login' ? 'flex flex-col gap-4' : 'hidden'}`}>
          <div className="flex items-center gap-2 px-1 mb-1">
              <MdLogin className="text-red-400 text-xl" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Login To Account</span>
          </div>
            { loginActiveSection === 'login' && (
                <LoginContent 
                    email={email} setEmail={setEmail}
                    password={password} setPassword={setPassword}
                    handleSubmit={handleSubmit} submitting={submitting}
                /> ) 
            }
            { loginActiveSection === 'email' && ( <Email /> ) }
            { loginActiveSection === 'faceId' && ( <FaceVerification /> ) }
            { loginActiveSection === '2fa' && ( <TwoTactor onBack={onBack} /> ) }
        </div>
    );
};

export default Login;
