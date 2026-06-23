import React, { useState, useEffect, useRef } from 'react';
import { IoMdArrowBack } from "react-icons/io";
import { motion, AnimatePresence } from 'framer-motion';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCheckCircle } from "react-icons/fa";
import { IoSearch, IoChevronDown } from "react-icons/io5";
import axios from 'axios';
import useToast from '../../../../../context/toast';
import useFinance from '../../context/finance';

const Withdrawal = ({ setBankSection }) => {
  const setToast = useToast((state) => state.setToast);
  const balance = useFinance((state) => state.balance);
  const setBalance = useFinance((state) => state.setBalance);

  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedBankName, setSelectedBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(true);

  // Bank search dropdown state
  const [bankSearch, setBankSearch] = useState('');
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setBankDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Nigerian banks list from Paystack
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await axios.get('/api/withdrawal/banks');
        setBanks(res.data.banks || []);
      } catch (err) {
        console.error(err);
        setToast('Failed to load banks');
      } finally {
        setLoadingBanks(false);
      }
    };
    fetchBanks();
  }, []);

  // Verify account number when bank and account number are filled
  useEffect(() => {
    setVerified(false);
    setAccountName('');
    if (accountNumber.length === 10 && selectedBank) {
      verifyAccount();
    }
  }, [accountNumber, selectedBank]);

  const verifyAccount = async () => {
    setVerifying(true);
    try {
      const res = await axios.post('/api/withdrawal/verify-account', {
        accountNumber,
        bankCode: selectedBank
      });
      if (res.data.success) {
        setAccountName(res.data.accountName);
        setVerified(true);
      } else {
        setToast('Account not found. Please check the details.');
      }
    } catch (err) {
      setToast('Could not verify account. Try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleWithdraw = async () => {
    // Validation
    if (!verified) return setToast('Please verify your account first');
    if (!amount || Number(amount) <= 0) return setToast('Enter a valid amount');
    if (Number(amount) > balance) return setToast('Insufficient balance');
    if (Number(amount) < 100) return setToast('Minimum withdrawal is ₦100');

    setLoading(true);
    try {
      const res = await axios.post('/api/withdrawal/initiate', {
        amount: Number(amount),
        accountNumber,
        bankCode: selectedBank,
        accountName,
      });

      if (res.data.success) {
        setBalance(balance - Number(amount));
        setToast('Withdrawal successful! Funds will arrive shortly.');
        setBankSection('');
      } else {
        setToast(res.data.message || 'Withdrawal failed');
      }
    } catch (err) {
      setToast(err.response?.data?.message || 'Withdrawal failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="p-6 bg-white dark:bg-[var(--d-bg)] h-[90vh] overflow-y-auto scrollbar-hide"
    >
      <button 
        onClick={() => setBankSection('')} 
        className="mb-6 flex items-center gap-2 font-bold opacity-70"
      >
        <IoMdArrowBack /> Back
      </button>
      
      <h2 className="text-2xl font-black mb-1">Withdraw Funds</h2>
      <p className="text-sm opacity-50 mb-2">Available: <span className="font-black text-[var(--active-color)]">₦{balance?.toLocaleString()}</span></p>

      <div className="space-y-4 mt-6">
        
        {/* Bank Select */}
        <div ref={dropdownRef} className="relative p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/10">
          <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-2">Select Bank</p>
          {loadingBanks ? (
            <div className="flex items-center gap-2 opacity-50">
              <AiOutlineLoading3Quarters className="animate-spin" size={14} />
              <span className="text-sm">Loading banks...</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setBankDropdownOpen((prev) => !prev)}
                className="w-full flex items-center justify-between font-bold outline-none bg-transparent capitalize text-left"
              >
                <span className={selectedBankName ? '' : 'opacity-40 font-medium'}>
                  {selectedBankName || 'Select Bank'}
                </span>
                <IoChevronDown className={`opacity-50 transition-transform ${bankDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {bankDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 bg-white dark:bg-[var(--d-bg)] rounded-2xl border border-zinc-200 dark:border-white/10 shadow-xl overflow-hidden"
                  >
                    {/* Search input */}
                    <div className="flex items-center gap-2 p-3 border-b border-zinc-200 dark:border-white/10">
                      <IoSearch className="opacity-40 flex-shrink-0" size={16} />
                      <input
                        autoFocus
                        type="text"
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                        placeholder="Search banks..."
                        className="w-full bg-transparent outline-none text-sm font-medium"
                      />
                    </div>

                    {/* Filtered bank list */}
                    <div className="max-h-60 overflow-y-auto scrollbar-hide">
                      {filteredBanks.length === 0 ? (
                        <p className="text-center text-xs opacity-40 font-medium py-6">
                          No banks found
                        </p>
                      ) : (
                        filteredBanks.map((bank) => (
                          <button
                            key={bank.code}
                            type="button"
                            onClick={() => {
                              setSelectedBank(bank.code);
                              setSelectedBankName(bank.name);
                              setBankDropdownOpen(false);
                              setBankSearch('');
                            }}
                            className={`w-full text-left px-4 py-3 text-sm font-bold capitalize transition-colors hover:bg-zinc-100 dark:hover:bg-white/10 ${
                              selectedBank === bank.code ? 'bg-zinc-100 dark:bg-white/10' : ''
                            }`}
                          >
                            {bank.name}
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Account Number */}
        <div className="relative">
          <input 
            type="number" 
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            maxLength={10}
            placeholder="Enter Account Number" 
            className="w-full p-5 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 outline-none font-bold" 
          />
          {/* Verification status */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {verifying && <AiOutlineLoading3Quarters className="animate-spin text-[var(--active-color)]" size={18} />}
            {verified && !verifying && <FaCheckCircle className="text-green-500" size={18} />}
          </div>
        </div>

        {/* Verified Account Name */}
        {accountName && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-green-500 mb-1">Account Name</p>
            <p className="font-black capitalize text-green-600 dark:text-green-400">{accountName}</p>
          </motion.div>
        )}

        {/* Amount */}
        <div className="bg-zinc-100 dark:bg-white/5 p-6 rounded-[2rem] border border-transparent focus-within:border-[var(--active-color)] transition-all">
          <label className="text-[10px] uppercase font-bold tracking-widest opacity-50">Amount (₦)</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent text-3xl font-black outline-none mt-2"
          />
        </div>

        {/* Amount too high warning */}
        {Number(amount) > balance && (
          <p className="text-red-500 text-xs font-bold px-2">⚠️ Amount exceeds available balance</p>
        )}

        {/* Confirm Button */}
        <button 
          onClick={handleWithdraw}
          disabled={loading || !verified || !amount || Number(amount) > balance}
          className={`w-full py-5 bg-black dark:bg-white dark:text-black text-white rounded-2xl font-black transition-all ${
            loading || !verified || !amount || Number(amount) > balance
              ? 'opacity-40 cursor-not-allowed' 
              : 'active:scale-95'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <AiOutlineLoading3Quarters className="animate-spin" size={16} />
              Processing...
            </span>
          ) : 'Confirm Withdrawal'}
        </button>

        <p className="text-center text-[10px] opacity-30 font-medium">
          Withdrawals are processed instantly via Paystack
        </p>
      </div>
    </motion.div>
  );
};

export default Withdrawal;