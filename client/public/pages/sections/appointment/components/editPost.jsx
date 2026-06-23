import React, { useState, useEffect } from 'react'; // ADDED useEffect here
import useToast from '../../../../context/toast';
import { HiArrowLeft, HiX, HiCheckCircle, HiCash, HiClock, HiTag } from "react-icons/hi";
import axios from 'axios'
import { FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';


const EditPost = ({ onBack, activeList, editActive, refresh, setRefresh }) => {

  // console.log(activeList); // Keep for debugging if needed

  const setToast = useToast((state) => state.setToast);
  
  // Existing States
  const [description, setDescription] = useState('');
  const [about, setAbout] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  const [tags, setTags] = useState([]);
  
  // New States for Pricing and Category
  const [priceType, setPriceType] = useState('fixed'); // 'fixed' or 'hourly'
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Web Development');

  // categories array remains unchanged
  const categories = ['Web Development', 'Graphic Design', 'Video Editing', 'Writing', 'Marketing'];

  // =========================================================
  // NEW: Populate fields when the edit modal opens
  // =========================================================
  useEffect(() => {
    // Only populate if the edit modal is active AND we have data
    if (editActive && activeList) {
      setDescription(activeList.description || '');
      setAbout(activeList.about || '');
      setPriceType(activeList.priceType || 'fixed');
      // Ensure price is a string for the number input
      setPrice(activeList.price ? activeList.price.toString() : '');
      setCategory(activeList.category || 'Web Development');
      // Spread the tags array to create a new reference
      setTags(activeList.tags ? [...activeList.tags] : []);
    }
  }, [editActive, activeList]); // Re-run when modal opens or data changes
  // =========================================================


  // All handler functions (handleTagInput, removeTag, handleSubmit) remain 100% UNCHANGED
  const handleTagInput = (e) => {
    const value = e.target.value;
    setCurrentTag(value);
    if (value.endsWith(' ') || value.endsWith('#')) {
      const newTag = value.trim().replace('#', '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if(!description || !about || !price || tags.length === 0) {
      return setToast('All fields, including price and tags, are required');
    }
    
    // Changing toast message to reflect 'Updating' instead of 'Publishing'
    setToast('Updating post on Octfix...');
    try {
      // Assuming your backend uses PUT or PATCH for updates based on _id
      const res = await axios.patch(`/api/joboffer/${activeList._id}`, {
        description,
        about, 
        tags,
        price,
        priceType,
        category
      }, { withCredentials: true });
      
      setToast(res.data.message);
      setRefresh(!refresh);
      onBack(); // Auto-close on success
    } catch (error) {
      setToast('Failed to update post. Try again.');
      console.error(error);
    }
  };

  // =========================================================
  // JSX remains 100% UNCHANGED. 
  // It will naturally display the populated state values.
  // =========================================================
  return (
    <div className={`fixed z-10 top-0 right-0 transition-all ease-in-out duration-[.5s] ${editActive? 'translate-x-[0%]' : 'translate-x-[100%]'} w-full flex flex-col h-full bg-[var(--l-bg)] dark:bg-[var(--d-bg)] rounded-2xl  p-6`}>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <FaTimes size={20} className="text-zinc-600 dark:text-white" />
          </button>
          <h2 className="text-lg font-black uppercase tracking-widest text-zinc-900 dark:text-white">Edit <span className='text-[10px]'>({category})</span>  </h2>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      

      
        <div className="space-y-6">
          {/* Category Selector */}
          <div className="p-5 rounded-3xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 block">Professional Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${category === cat ? 'bg-[var(--active-color)] text-white shadow-lg' : 'bg-zinc-200 dark:bg-black/20 text-zinc-500'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl  bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 block">Budget Type</label>
              <div className="flex bg-zinc-200 dark:bg-black/30 p-1 rounded-2xl">
                <button 
                  onClick={() => setPriceType('fixed')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold transition-all ${priceType === 'fixed' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'}`}
                >
                  <HiCash size={16} /> FIXED
                </button>
                <button 
                  onClick={() => setPriceType('hourly')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold transition-all ${priceType === 'hourly' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'}`}
                >
                  <HiClock size={16} /> HOURLY
                </button>
              </div>
            </div>

            <div className="p-5 rounded-3xl  bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 block">Amount (₦)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-2xl font-black text-zinc-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Description & About */}
          <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Project Title</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-zinc-900 dark:text-white outline-none border-b border-zinc-300 dark:border-zinc-800 pb-2 focus:border-[var(--active-color)] transition-colors"
                placeholder="e.g. Modern E-commerce Website"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Project Details</label>
              <textarea
                rows="4"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/30 p-4 rounded-2xl text-xs text-zinc-900 dark:text-zinc-300 outline-none focus:ring-1 focus:ring-[var(--active-color)]"
                placeholder="Describe the requirements..."
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block flex items-center gap-2">
                <HiTag /> Skills & Tags
              </label>
              <input
                type="text"
                value={currentTag}
                onChange={handleTagInput}
                className="w-full bg-transparent text-xs font-medium text-zinc-900 dark:text-white outline-none border-b border-zinc-100 dark:border-zinc-800 pb-2"
                placeholder="Press space after each tag..."
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map((tag, index) => (
                  <span key={index} className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-[9px] font-black uppercase px-3 py-1.5 rounded-lg">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500"><HiX size={12} /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Update Button (UI unchanged, functionality tweaked for PATCH) */}
          <button 
            onClick={handleSubmit}
            className="w-full bg-zinc-900 dark:bg-white py-5 rounded-3xl text-white dark:text-black font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <HiCheckCircle size={18} /> Update on Octfix
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPost;
