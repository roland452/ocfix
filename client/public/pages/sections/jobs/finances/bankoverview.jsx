import React, { useState, useEffect } from 'react';
import WalletSection from './extras/wallet';
import Deposit from './extras/deposit';
import History from './extras/history';
import Withdrawal from './extras/withdrawal';
import { motion } from 'framer-motion';
import axios from 'axios';
import useToast from '../../../../context/toast';
import useFinance from '../context/finance';

const BankOverview = () => {
  const setToast = useToast((state) => state.setToast)
  const transactions = useFinance((state) => state.transactions)
  const setTransactions = useFinance((state) => state.setTransactions)
  const balance = useFinance((state) => state.balance)
  const setBalance = useFinance((state) => state.setBalance)
  const setEscrowBalance = useFinance((state) => state.setEscrowBalance)

  const [bankSection, setBankSection] = useState('');
  const [loadingBal, setLoadingBal] = useState(true); 
  const [balError, setBalError] = useState(false); 
  const [refreshBal, setRefreshBal] = useState(false)

  async function fetchBalace() {
    setLoadingBal(true)
    try {
      const res = await axios.get('/api/balance',({ withCredentials: true }))
      const data = res.data;

      console.log(data.balance);
      
      setLoadingBal(false)
      setBalance(data.balance)
      setEscrowBalance(data.escrowBalance)
    } catch (error) {
      setLoadingBal(false)
      setBalError(true)
      setToast(error.message)
    }
    
  }

  async function fetchTransactions() {
    setLoadingBal(true)
    try {
      const res = await axios.get('/api/escrow/my-transactions',({ withCredentials: true }))
      const data = res.data;
      console.log(data);
      if(data.success) {
        setTransactions(data.data)
      }
    } catch (error) {
      setToast(error.message)
    }
    
  }

  useEffect(() => {
    fetchBalace()
    fetchTransactions()
  },[refreshBal])

  // const transactions = [
  //   { type: "Project Payment: Octfix UI", amount: 12000, type: "deposit", date: "Apr 02, 2026", status: "success" },
  //   { type: "Wallet Withdrawal", amount: 1550000, type: "withdrawal", date: "Mar 30, 2026", status: "failed" },
  //   { type: "Wallet Withdrawal", amount: 2000, type: "deposit", date: "Mar 30, 2026", status: "success" },
  //   { type: "Wallet Withdrawal", amount: 5000, type: "deposit", date: "Mar 30, 2026", status: "failed" },

  // ];



  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      className="transition-all duration-300">
      { bankSection === '' && ( 
        <WalletSection 
          loadingBal={loadingBal}
          balError={balError}
          refreshBal={refreshBal}
          setRefreshBal={setRefreshBal}
          balance={balance} 
          transactions={transactions} 
          setBankSection={setBankSection} 
        /> 
      )}
      { bankSection === 'deposit' && ( <Deposit setBankSection={setBankSection} userEmail="user@gmail.com" /> )}
      { bankSection === 'withdrawal' && ( <Withdrawal setBankSection={setBankSection} /> )}
      { bankSection === 'history' && ( <History setBankSection={setBankSection} transactions={transactions} /> )}
    </motion.div>
  );
};

export default BankOverview;
