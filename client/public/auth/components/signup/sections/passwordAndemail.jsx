import { HiLockOpen } from "react-icons/hi"; 
import { RiLockPasswordFill } from "react-icons/ri"; 
import { MdAttachEmail, MdSupervisorAccount } from "react-icons/md"; 
import { FaSpinner } from "react-icons/fa"; 


const PasswordAndEmail = ({ email, setEmail, password, setPassword}) => {
    
    return (
        <div className={'flex flex-col gap-5'}>
            <div className="flex items-center gap-2 px-1 mb-1">
                <MdSupervisorAccount className="text-blue-500 text-xl" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Password And Email </span>
            </div>
            <div className="space-y-4">
                {/* Email Input */}
                <div className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus-within:border-[var(--active-color)]/50 transition-all">
                    <MdAttachEmail className="text-gray-400 group-focus-within:text-[var(--active-color)]" />
                    <input 
                        className="bg-transparent outline-none w-full text-sm dark:text-white"
                        type="email" placeholder='Email address'
                        value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                
                {/* Password Input */}
                <div className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus-within:border-[var(--active-color)]/50 transition-all">
                    <HiLockOpen className="text-gray-400 group-focus-within:text-[var(--active-color)]" />
                    <input 
                        className="bg-transparent outline-none w-full text-sm dark:text-white"
                        type="password" placeholder='Create password'
                        value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                
            </div>
        </div>
    );
};

export default PasswordAndEmail;
