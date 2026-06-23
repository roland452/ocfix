import { BsFillXCircleFill } from "react-icons/bs"; 
import React, { useState } from 'react';
import { HiArrowLeft, HiX, HiCheckCircle, HiCash, HiClock, HiTag } from "react-icons/hi";
import useToast from '../../../context/toast';
import axios from 'axios';
import { FaPlus } from "react-icons/fa";

const CreatePost = ({ onBack, postPage, refresh, setRefresh }) => {
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

  const [categories, setCategories] = useState(['Web Development', 'Graphic Design', 'Video Editing', 'Writing', 'Marketing'])
  const [customCategory, setCustomCategory] = useState(false)

  

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

  const handleCustomCategory = () => {
    const value = category;
    if(!value) return setToast('enter a category')
   
    const newCategory = value.trim();
    setCategories([newCategory]);
    setCustomCategory(false)
    setCategory(value.trim());
  };

  const handleFilterCustomCategory = () => {
    setCategory('Web Development')
    setCategories(['Web Development', 'Graphic Design', 'Video Editing', 'Writing', 'Marketing']) 
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if(!description || !about || !price || tags.length === 0) {
      return setToast('All fields, including price and tags, are required');
    }
    
    setToast('Publishing to Octfix...');
    try {
      const res = await axios.post('/api/joboffer', {
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
      setToast('Failed to create post. Try again.');
      console.error(error);
    }
  };

  return (
    <div className={`fixed top-0 left-0 z-50 transition-all cubic-bezier(0.4, 0, 0.2, 1) duration-500 ${postPage ? 'translate-y-0' : 'translate-y-full'} w-full h-full bg-[var(--l-bg)] dark:bg-[var(--d-bg)] p-4 md:p-8 overflow-y-auto  [&::-webkit-scrollbar]:hidden`}>
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <BsFillXCircleFill size={20}  className="text-zinc-600 dark:text-white" /> 
          </button>
          <h2 className="text-lg font-black uppercase tracking-widest text-zinc-900 dark:text-white">New Job Offer</h2>
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
                  className={`flex items-center gap-4 px-4 py-2 rounded-xl text-xs font-bold transition-all ${category === cat ? 'bg-[var(--active-color)] text-white shadow-lg' : 'bg-zinc-200 dark:bg-black/20 text-zinc-500'}`}
                >
                  {cat} 
                  {categories.length === 1 &&(
                    <HiX onClick={() => handleFilterCustomCategory()}/>
                  )}
                </button>
              ))}
            </div>
            {!customCategory && (
              <button onClick={() => setCustomCategory(!customCategory)} className="my-5 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center bg-black/5"><FaPlus /> Add custom category</button>
            )}
            {customCategory &&(
              <input 
                type="text" className="my-5 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center bg-black/5" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomCategory()}
                placeholder="Press space to add custom category..."
              />
            )}
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

          {/* Publish Button */}
          <button 
            onClick={handleSubmit}
            className="w-full bg-zinc-900 dark:bg-white py-5 rounded-3xl text-white dark:text-black font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <HiCheckCircle size={18} /> Publish to Octfix
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
