import { HiLockOpen } from "react-icons/hi"; 
import { RiLockPasswordFill } from "react-icons/ri"; 
import { MdAttachEmail, MdSupervisorAccount } from "react-icons/md"; 
import { FaPhoneAlt, FaCalendarAlt } from 'react-icons/fa';
import { FaSpinner } from "react-icons/fa"; 


const PhoneAndBirth = ({ birthdate, setBirthDate, phone, setPhone }) => {

    
    return (
        <div className={'flex flex-col gap-5'}>
            <div className="flex items-center gap-2 px-1 mb-1">
                <MdSupervisorAccount className="text-blue-500 text-xl" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Birthdate And Phone </span>
            </div>
            <div className="space-y-4">
                {/* Email Input */}
                <div className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus-within:border-[var(--active-color)]/50 transition-all">
                    <FaCalendarAlt className="text-gray-400 group-focus-within:text-[var(--active-color)]" />
                    <input 
                        className="bg-transparent outline-none w-full text-sm dark:text-white"
                        type="date" placeholder='birthdate'
                        value={birthdate} onChange={(e) => setBirthDate(e.target.value)}
                    />
                </div>
                
                {/* Password Input */}
                <div className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus-within:border-[var(--active-color)]/50 transition-all">
                    <FaPhoneAlt className="text-gray-400 group-focus-within:text-[var(--active-color)]" />
                    <input 
                        className="bg-transparent outline-none w-full text-sm dark:text-white"
                        type="number" placeholder='Enter Phone Number'
                        value={phone} onChange={(e) => setPhone(e.target.value)}
                    />
                </div>

                
            </div>
        </div>
    );
};

export default PhoneAndBirth;
