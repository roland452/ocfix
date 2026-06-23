import React, { useState } from 'react';
import { HiLockOpen } from "react-icons/hi"; 
import { RiLockPasswordFill } from "react-icons/ri"; 
import { MdAttachEmail, MdSupervisorAccount } from "react-icons/md"; 
import { FaSpinner, FaChevronLeft, FaChevronRight   } from "react-icons/fa"; 
import axios from 'axios';
import Switch from '../components/signup/switch';
import useSignupContext from '../components/signup/signupContext';
import PasswordAndEmail from '../components/signup/sections/passwordAndemail';
import PhoneAndBirth from '../components/signup/sections/phoneAndBirth';
import Profession from '../components/signup/sections/profession';

const Signup = ({ authSection, setPopup, submitting, setSubmitting }) => {

    const signupActiveSection = useSignupContext((state) => state.signupSection)
    const setSignupActiveSection = useSignupContext((state) => state.setSignupSection)

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [birthdate, setBirthDate] = useState('');
    const [phone, setPhone] = useState('');
    const [profession, setProfession] = useState('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const sections = ['email_password', 'phone_birthday', 'profession',];
    const currentIndex = sections.indexOf(signupActiveSection);

    const apiRequest = async () => {
        setSubmitting(true);
        try {
            const res = await axios.post('/api/signup', { email, password, birthdate, phone, profession }, { withCredentials: true });
            setPopup(res.data.message);
        } catch (error) {
            setPopup('Signup failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = () => {
        if (!email || !password) return setPopup('Fields cannot be empty');
        if (!emailRegex.test(email)) return setPopup('Invalid email format');
        if (!birthdate || !phone) return setPopup('Fields cannot be empty');
        if (!profession) return setPopup('please enter profession');
        apiRequest();
    };

    const handleNext = () => {
      // Logic for Section 1
      if (signupActiveSection === 'email_password') {
        if (!email || !password) return setPopup('Input cannot be empty')
        if (!emailRegex.test(email)) return setPopup('Invalid email format (KASU/XXX/XXX/00/0000)')
        if (password.length < 6) return setPopup('Password must be at least 6 characters')
        setSignupActiveSection('phone_birthday')
      } 

      if(signupActiveSection === 'phone_birthday') {
        if(!birthdate || !phone) return setPopup('Input cannot be empty')
        setSignupActiveSection('profession')
      }
     
      else {
        if (!profession) return setPopup('Please enter profession')
        apiRequest()
      }
    }

    const handleBack = () => {
      if (signupActiveSection === 'profession') setSignupActiveSection('phone_birthday') 
        else {
            setSignupActiveSection('email_password') 
        }
    }


    return (
        
        <div className={`${authSection === 'signup' ? 'flex flex-col gap-4' : 'hidden'}`}>
            {/* progress bar */}
            <div className="flex items-center justify-between mb-2 px-2">
                {sections.map((step, index) => (
                <React.Fragment key={step}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${index <= currentIndex ? 'bg-blue-500 border-blue-800 text-white' : 'border-gray-300 text-gray-300'}`}>
                    {index + 1}
                    </div>
                    {index < sections.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${index < currentIndex ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    )}
                </React.Fragment>
                ))}
            </div>
            

            <div className="">
                {signupActiveSection === 'email_password' && (
                <PasswordAndEmail
                    email={email} 
                    setEmail={setEmail} 
                    password={password} 
                    setPassword={setPassword} 
                />
                )}
                {signupActiveSection === 'phone_birthday' && (
                <PhoneAndBirth 
                    birthdate={birthdate}
                    setBirthDate={setBirthDate}
                    phone={phone}
                    setPhone={setPhone}
                />
                )}
                {signupActiveSection === 'profession' && (
                <Profession
                    profession={profession}
                    setProfession={setProfession} 
                />
                )}
            </div>





           <div className="flex gap-1 mt-0">
                {signupActiveSection !== 'email_password' && (
                <button 
                    className="w-full py-2 px-2 bg-blue-300 rounded-2xl font-bold text-white shadow-lg shadow-red-400/20 flex justify-center items-center gap-2"
                    onClick={handleBack}
                >
                    <FaChevronLeft size={12}/> Back
                </button>
                )}
                
                <button
                    className="w-full py-2 px-6 bg-blue-500 rounded-2xl font-bold text-white shadow-lg shadow-red-400/20 flex justify-center items-center gap-2" 
                    onClick={handleNext}
                >
                {submitting ? <FaSpinner className="animate-spin"/> : (
                    signupActiveSection === 'profession' ? 'Signup' : <>Next <FaChevronRight size={12}/></>
                )}
                </button>
            </div>
        </div>
        
    );
};

export default Signup;
