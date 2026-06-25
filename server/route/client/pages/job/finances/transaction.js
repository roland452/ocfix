import express from 'express';
import axios from 'axios';
import Transaction from '../../../../../model/client/pages/job/finances/transaction.js';
import Approved from '../../../../../model/client/pages/appointment/approved.js';
import User from '../../../../../model/client/pages/profile/user.js';
import EscrowContract from '../../../../../model/client/pages/chat/finances/escrow.js';
import userAuth from '../../../../../controller/userAuth.js';
import Upload from '../../../../../multer.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv'
dotenv.config()

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const paystackHeaders = { Authorization: `Bearer ${PAYSTACK_SECRET}` };

const route = express.Router();


// route for getting user balance
route.get('/api/balance', userAuth, async(req, res) => {
    const userId = req.user.userId;
    const user = await User.findOne({_id: userId})
    if(!user) return res.status(402).json({message:'invalid user', success: false})
    const balance = user.balance;
    const escrowBalance = user.escrowBalance
    res.status(201).json({balance, escrowBalance})
})



route.get('/api/escrow/submitted-work',userAuth, async(req, res) => {
    const {contractId, posterId, clientId, jobOfferId} = req.query;
        

    try {
        const projectProof = await EscrowContract.findOne({_id: contractId})

        if(!projectProof) return res.status(201).json({message:'project not proof not found'})
        
        return res.status(201).json(projectProof)
        
    } catch (error) {
        res.status(500).json({message:'failed to fetch project proof'})
        console.log(error,'khkjhkjhk');
        
    }
    
    
})



// GET: Fetch all transactions for the logged-in user
route.get('/api/escrow/my-transactions', userAuth, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Find transactions where the user is either the sender or receiver
        const transactions = await Transaction.find({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        })
        .populate('senderId', 'name email')    // Populates sender info 
        .populate('receiverId', 'name email')  // Populates receiver info
        .populate('jobOfferId', 'title description category')  // Populates receiver info
        .sort({ createdAt: -1 });              // Newest first

        if (!transactions || transactions.length === 0) {
            return res.status(200).json({ 
                success: true, 
                message: "No transactions found",
                data: [] 
            });
        }

        const user = await User.findOne({_id: userId})


        res.status(200).json({
            success: true,
            data: transactions,
        });
        

    } catch (error) {
        console.error("Fetch User Transactions Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
        console.log(error);
        
    }
});



// 1. Unified Route for funding (Paystack or Balance) and creating the Stage-based Contract
route.post('/api/fund-project', userAuth, async (req, res) => {
    const { jobOfferId, clientId, amount, milestones, reference, payMethod } = req.body;
    const posterId = req.user.userId;

    try {
        if (payMethod === 'balance') {
            const poster = await User.findById(posterId);
            if (poster.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });
            poster.balance -= amount;
            await poster.save();
        }

        const contract = new EscrowContract({
            jobOfferId,
            clientId,
            posterId,
            amount,
            milestones, // The stages defined in the frontend
            status: 'escrowed',
            paymentReference: reference
        });
        await contract.save();

        await Approved.findOneAndUpdate({ jobOfferId, clientId }, { isHired: true });

        res.status(200).json({ success: true, message: "Contract created and funded" });
    } catch (error) {
        res.status(500).json({ message: 'Failed to initialize contract' });
    }
});

// 2. Updated Submission Route to include the Milestone Index
route.post('/api/escrow/submit-work', userAuth, Upload.array('submissions', 10), async (req, res) => {
    try {
        const { contractId, notes, link, milestoneIndex } = req.body;
        const contract = await EscrowContract.findById(contractId);
        
        const fileUrls = [];
        if (req.files) {
            const uploadPromises = req.files.map(file => 
                cloudinary.uploader.upload(file.path, { folder: "octfix/submissions" })
            );
            const results = await Promise.all(uploadPromises);
            results.forEach(r => fileUrls.push(r.secure_url));
        }

        const newSubmission = {
            milestoneIndex: parseInt(milestoneIndex), // Judging this specific stage
            notes,
            externalLink: link,
            files: fileUrls
        };

        await EscrowContract.findByIdAndUpdate(contractId, {
            $push: { submissions: newSubmission },
            $set: { 
                status: 'pending_approval',
                [`milestones.${milestoneIndex}.status`]: 'submitted' // Mark specific stage as submitted
            }
        });

        res.status(200).json({ success: true, message: "Stage work submitted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Submission failed", error });
        console.log(error)
    }
});



// PUT: Developer updates an existing submission (notes + files)
route.put('/api/escrow/update-submission', userAuth, Upload.array('submissions', 10), async (req, res) => {
    try {
        const { contractId, submissionId, notes } = req.body;
        let updateFields = { 
            "submissions.$.notes": notes, 
            "submissions.$.status": 'pending_approval' 
        };

        if (req.files && req.files.length > 0) {
            const fileUrls = [];
            const uploadPromises = req.files.map(file => cloudinary.uploader.upload(file.path, { folder: "octfix/submissions" }));
            const results = await Promise.all(uploadPromises);
            results.forEach(r => fileUrls.push(r.secure_url));
            updateFields["submissions.$.files"] = fileUrls;
        }

        await EscrowContract.updateOne(
            { _id: contractId, "submissions._id": submissionId },
            { $set: updateFields }
        );
        res.status(200).json({ success: true, message: "Submission updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Update failed" });
    }
});

// POST: Client raises a dispute with a reason
route.post('/api/escrow/dispute-stage', userAuth, async (req, res) => {
    try {
        const { contractId, milestoneIndex, reason } = req.body;
        await EscrowContract.findByIdAndUpdate(contractId, {
            $set: { [`milestones.${milestoneIndex}.status`]: 'disputed' },
            $push: { 
                submissions: { 
                    notes: `DISPUTE REASON: ${reason}`, 
                    status: 'disputed', 
                    milestoneIndex,
                    submittedAt: new Date()
                }
            }
        });
        res.status(200).json({ success: true, message: "Dispute submitted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Dispute failed" });
    }
});






// POST: Release funds for a specific milestone
route.post('/api/escrow/release-funds', userAuth, async (req, res) => {
    
    try {
        const { contractId, milestoneIndex, submissionId } = req.body;
        const userId = req.user.userId;
        


        // 1. Find and verify the contract
        const contract = await EscrowContract.findById(contractId);
        if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });

        // 2. SECURITY: Only the Client (sender) can release funds
        if (contract.posterId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Only the client can release funds" });
        }

        const milestone = contract.milestones[milestoneIndex];
        if (!milestone) return res.status(400).json({ success: false, message: "Invalid milestone" });

        // 3. Update Statuses
        milestone.status = 'approved'; // Mark stage as completed
        
        // Update the specific submission status
        const submission = contract.submissions.id(submissionId);
        if (submission) {
            submission.status = 'released';
        }

        // 4. Create the Transaction Record 
        const newTransaction = new Transaction({
            senderId: userId, // The Client
            receiverId: contract.clientId, // The Developer
            jobOfferId: contract.jobOfferId,
            amount: milestone.amount,
            type: 'milestone_release',
            reference: `REL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            status: 'success'
        });

        await Promise.all([contract.save(), newTransaction.save()]);
        await User.findByIdAndUpdate(contract.clientId, {
            $inc: { escrowBalance: milestone.amount }
        });

        res.status(200).json({
            success: true,
            message: "Funds released and transaction recorded",
            data: newTransaction
        });

    } catch (error) {
        console.error("Release Funds Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});









// Route for funding internal balance
route.post('/api/transactions/verify', userAuth, async (req, res) => {
    const { reference, amount, type } = req.body;

    try {
        // 1. Verify with Paystack API
        const paystackRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` // Use your sk_test key here
            }
        });

        const data = paystackRes.data.data;

        // 2. Check if Paystack confirms success and amount matches
        if (data.status === 'success' && data.amount === amount * 100) {
            
            // 3. Check if transaction already exists (prevent double funding)
            const existingTx = await Transaction.findOne({ reference });
            if (existingTx) {
                return res.status(400).json({ success: false, message: "Transaction already processed" });
            }

            // 4. Save to Transaction Schema
            const newTransaction = new Transaction({
                senderId: req.user.userId, // The logged-in user
                receiverId: req.user.userId, // For a deposit, the receiver is also the user
                type: type, // 'deposit'
                amount: amount,
                reference: reference,
                status: 'success',
                jobOfferId: null // Optional for simple deposits
            });

            await newTransaction.save();

            // 5. Update User Balance
            await User.findByIdAndUpdate(req.user.userId, {
                $inc: { balance: amount }
            });

            return res.status(200).json({ success: true, message: "Balance updated" });
        } else {
            return res.status(400).json({ success: false, message: "Invalid transaction" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});






// 1. GET: Fetch list of Nigerian banks from Paystack
route.get('/api/withdrawal/banks', userAuth, async (req, res) => {
  try {
    const response = await axios.get('https://api.paystack.co/bank?currency=NGN', {
      headers: paystackHeaders
    });
    const banks = response.data.data.map(bank => ({
      name: bank.name,
      code: bank.code
    }));
    res.status(200).json({ success: true, banks });
  } catch (error) {
    console.error('Banks fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch banks' });
  }
});


// 2. POST: Verify account number with bank code
route.post('/api/withdrawal/verify-account', userAuth, async (req, res) => {
  const { accountNumber, bankCode } = req.body;

  if (!accountNumber || !bankCode) {
    return res.status(400).json({ success: false, message: 'Account number and bank code required' });
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      { headers: paystackHeaders }
    );

    if (response.data.status) {
      res.status(200).json({
        success: true,
        accountName: response.data.data.account_name,
        accountNumber: response.data.data.account_number
      });
    } else {
      res.status(400).json({ success: false, message: 'Account not found' });
    }
  } catch (error) {
    console.error('Account verify error:', error?.response?.data || error);
    res.status(400).json({ success: false, message: 'Could not verify account' });
  }
});


// 3. POST: Initiate withdrawal (Paystack Transfer)
route.post('/api/withdrawal/initiate', userAuth, async (req, res) => {
  const { amount, accountNumber, bankCode, accountName } = req.body;
  const userId = req.user.userId;

  try {
    // 1. Check user balance
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.balance < amount) return res.status(400).json({ success: false, message: 'Insufficient balance' });
    if (amount < 100) return res.status(400).json({ success: false, message: 'Minimum withdrawal is ₦100' });

    // 2. Create transfer recipient on Paystack
    const recipientRes = await axios.post('https://api.paystack.co/transferrecipient', {
      type: 'nuban',
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: 'NGN'
    }, { headers: paystackHeaders });

    if (!recipientRes.data.status) {
      return res.status(400).json({ success: false, message: 'Failed to create transfer recipient' });
    }

    const recipientCode = recipientRes.data.data.recipient_code;
    const reference = `WD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 3. Initiate the transfer
    const transferRes = await axios.post('https://api.paystack.co/transfer', {
      source: 'balance',
      amount: amount * 100, // Paystack uses kobo
      recipient: recipientCode,
      reason: 'Octfix Wallet Withdrawal',
      reference
    }, { headers: paystackHeaders });

    if (!transferRes.data.status) {
      return res.status(400).json({ success: false, message: 'Transfer failed' });
    }

    // 4. Deduct balance from user
    user.balance -= amount;
    await user.save();

    // 5. Save transaction record
    const newTransaction = new Transaction({
      senderId: userId,
      receiverId: userId,
      amount,
      type: 'withdrawal',
      reference,
      status: 'success',
      jobOfferId: null
    });
    await newTransaction.save();

    res.status(200).json({
      success: true,
      message: 'Withdrawal initiated successfully',
      reference
    });

  } catch (error) {
    console.error('Withdrawal error:', error?.response?.data || error);
    res.status(500).json({
      success: false,
      message: error?.response?.data?.message || 'Withdrawal failed. Try again.'
    });
  }
});






export default route;