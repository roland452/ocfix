import React, { useState, useMemo } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { IoMdArrowBack } from "react-icons/io";
import { motion } from 'framer-motion';
import useToast from '../../../../../context/toast'
import axios from 'axios'; // Ensure axios is installed

const Deposit = ({ setBankSection, userEmail, balance }) => {

  const setToast = useToast((state) => state.setToast)

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const config = useMemo(() => ({
    reference: (new Date()).getTime().toString(),
    email: userEmail || "aminuroland452@gmail.com",
    amount: amount * 100, 
    publicKey: 'pk_test_9fdb9aef25200d2b1af783b0028853dc129db313', 
  }), [amount, userEmail]);

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (response) => {
    console.log(response);
    
    setLoading(true);
    try {
      // Send the reference to your backend for verification
      const res = await axios.post('/api/transactions/verify', {
        reference: response.reference,
        amount: Number(amount),
        type: 'deposit'
      });

      if (res.data.success) {
        setToast("Wallet funded successfully!");
        setBankSection(''); // Close the deposit section
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setToast("Payment verified on Paystack but failed to update wallet. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    console.log("User closed the payment window");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="p-6 bg-white dark:bg-[var(--d-bg)] h-[90vh]"
    >
      <button onClick={() => setBankSection('')} className="mb-6 flex items-center gap-2 font-bold opacity-70">
        <IoMdArrowBack /> Back
      </button>
      
      <h2 className="text-2xl font-black mb-2">Fund Wallet</h2>
      <p className="text-sm opacity-60 mb-8">Enter the amount you want to add to your balance.</p>

      <div className="space-y-6">
        <div className="bg-zinc-100 dark:bg-white/5 p-6 rounded-[2rem] border border-transparent focus-within:border-[var(--active-color)] transition-all">
          <label className="text-[10px] uppercase font-bold tracking-widest opacity-50">Amount (₦)</label>
          <input 
            type="number" 
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent text-3xl font-black outline-none mt-2"
            disabled={loading}
          />
        </div>

        <button 
          type="button"
          disabled={loading || !amount}
          onClick={() => {
            if (amount > 0) {
              initializePayment({onSuccess, onClose});
            }
          }}
          className={`w-full py-5 bg-[var(--active-color)] text-white rounded-2xl font-black shadow-lg transition-all ${loading ? 'opacity-50' : 'active:scale-95'}`}
        >
          {loading ? 'Verifying...' : 'Pay with Paystack'}
        </button>
      </div>
    </motion.div>
  );
};

export default Deposit;
