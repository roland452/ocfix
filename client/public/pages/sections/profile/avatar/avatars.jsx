import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaCheckCircle } from 'react-icons/fa';
import useToast from '../../../../../src/assets/toast';

import useProfile from '../../../../context/profile';

// DiceBear styles available
const STYLES = [
  { id: 'avataaars', label: 'Cartoon' },
  { id: 'personas', label: 'Persona' },
  { id: 'bottts', label: 'Robot' },
  { id: 'fun-emoji', label: 'Emoji' },
  { id: 'lorelei', label: 'Lorelei' },
  { id: 'notionists', label: 'Notion' },
];

// Generate 12 avatar seeds per style
const SEEDS = [
  'Felix', 'Aneka', 'Zara', 'Kai', 'Mia', 'Leo',
  'Nova', 'Ace', 'Luna', 'Max', 'Sky', 'Rio',
];

const getAvatarUrl = (style, seed) =>
  `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

const Avatars = () => {
  const setToast = useToast((state) => state.setToast);
  const profile = useProfile((state) => state.profile);
  const setProfile = useProfile((state) => state.setProfile);

  const [activeStyle, setActiveStyle] = useState('avataaars');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSelect = (url) => {
    setSelectedAvatar(url);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!selectedAvatar) return setToast('Please select an avatar first');
    setSaving(true);
    try {
      await axios.patch('/api/user/update-avatar', {
        image: selectedAvatar
      }, { withCredentials: true });

      // Update profile context so header updates immediately
      if (setProfile) {
        setProfile({
          ...profile,
          data: { ...profile?.data, image: selectedAvatar }
        });
      }

      setSaved(true);
      setToast('Avatar updated successfully!');
    } catch (err) {
      setToast('Failed to save avatar. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto scrollbar-hide">
      <h1 className="text-2xl font-black mb-1">Choose Avatar</h1>
      <p className="text-xs opacity-50 mb-6">Pick a style then select your avatar</p>

      {/* Style Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-6">
        {STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => {
              setActiveStyle(style.id);
              setSelectedAvatar(null);
              setSaved(false);
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              activeStyle === style.id
                ? 'bg-[var(--active-color)] text-white'
                : 'bg-white/5 opacity-60'
            }`}
          >
            {style.label}
          </button>
        ))}
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        {SEEDS.map((seed) => {
          const url = getAvatarUrl(activeStyle, seed);
          const isSelected = selectedAvatar === url;

          return (
            <motion.button
              key={seed}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSelect(url)}
              className={`relative p-3 rounded-2xl transition-all border-2 ${
                isSelected
                  ? 'border-[var(--active-color)] bg-[var(--active-color)]/10'
                  : 'border-transparent bg-white/5'
              }`}
            >
              <img
                src={url}
                alt={seed}
                className="w-full aspect-square rounded-xl"
                loading="lazy"
              />
              {isSelected && (
                <div className="absolute top-1 right-1 bg-[var(--active-color)] rounded-full p-0.5">
                  <FaCheckCircle className="text-white" size={12} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Preview + Save */}
      {selectedAvatar && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-[var(--active-color)]/20 mb-4"
        >
          <img
            src={selectedAvatar}
            alt="selected"
            className="w-14 h-14 rounded-full border-2 border-[var(--active-color)]"
          />
          <div className="flex-1">
            <p className="font-bold text-sm">Selected Avatar</p>
            <p className="text-xs opacity-50">Click save to update your profile</p>
          </div>
        </motion.div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !selectedAvatar || saved}
        className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${
          saved
            ? 'bg-green-500 text-white'
            : selectedAvatar
            ? 'bg-[var(--active-color)] text-white active:scale-95'
            : 'bg-white/5 opacity-40 cursor-not-allowed'
        }`}
      >
        {saving ? (
          <span className="flex items-center justify-center gap-2">
            <AiOutlineLoading3Quarters className="animate-spin" size={16} />
            Saving...
          </span>
        ) : saved ? (
          '✓ Avatar Saved!'
        ) : (
          'Save Avatar'
        )}
      </button>
    </div>
  );
};

export default Avatars;




