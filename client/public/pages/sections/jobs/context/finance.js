import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

const useFinance = create()(
    persist((set) => ({
        balance: null,
        escrowBalance: null,
        transactions: [], 

        setBalance: (value) => set({balance: value}),
        setEscrowBalance: (value) => set({escrowBalance: value}),
        setTransactions: (value) => set({transactions: value}),
    }),
    {
        name: 'transactions',
        storage: createJSONStorage(() => sessionStorage)
    }) 
);

export default useFinance;
