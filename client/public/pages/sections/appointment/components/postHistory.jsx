import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  HiSearch, 
  HiOutlinePencilAlt, 
  HiOutlineTrash, 
  HiOutlineX, 
  HiHeart, 
  HiCalendar 
} from "react-icons/hi";
import EditPost from './editPost';
import LoaderAnimation from '../../../../../src/assets/loader';
import ErrorMessage from '../../../../../src/assets/error';

const PostHistory = () => {
   // Dummy Data
  const [posts, setPosts] = useState([]);

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editActive, setEditActive] = useState(false)
  const [activeList, setActiveList] = useState({})
  const [refresh, setRefresh] = useState(false)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  

  const onBack = () => {
    setEditActive(false)
  }

  const setEditContent = (content) => {
    setEditActive(true)
    setActiveList(content)
  }

 

  const filteredPosts = posts.filter(post => 
    post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.about.toLowerCase().includes(searchQuery.toLowerCase())
  );


   // function for fetching jobOffers
    async function fetchJobOffers() {
      try {
        const res = await axios.get('/api/joboffer/history',{ withCredentials: true })
  
        const data = res.data
        console.log(data);
        setPosts(data.data || [])
        setIsLoading(false)
        setError(false)
        
      } catch (error) {
        console.log(error);
        setIsLoading(false)
        setError(true)
      }
    }
  
    useEffect(() => {
      fetchJobOffers()
    },[refresh])

  return (
    <div className="w-full h-full bg-zinc-100 dark:bg-[#0b141a] p-6 overflow-hidden flex flex-col">
      
      
      <EditPost 
        editActive={editActive}
        refresh={refresh}
        setRefresh={setRefresh}
        onBack={onBack}
        activeList={activeList}
      />


      {/* Header with Expanding Search */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Post History</h2>
        
        <div className={`flex items-center bg-white dark:bg-zinc-900 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-800 transition-all duration-300 overflow-hidden ${isSearchExpanded ? 'w-64 px-3' : 'w-10 h-10 justify-center'}`}>
          <HiSearch 
            className="cursor-pointer  hover:text-[var(--active-color)] flex-shrink-0"
            size={20}
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
          />
          {isSearchExpanded && (
            <input
              autoFocus
              type="text"
              placeholder="Search history..."
              className="bg-transparent outline-none text-sm ml-2 w-full text-zinc-700 dark:text-zinc-300 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Scrollable Post Cards Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
        {
        isLoading? <LoaderAnimation /> :
        error? (
          <div>
            <ErrorMessage /> 
          </div>
        ):
        posts.length === 0? (
          <div className="text-center py-20 bg-[#eee8e8] dark:bg-[#000] rounded-3xl border border-dashed border-gray-800">
              <p className="text-gray-500">no job history</p>
          </div>
        ) :
        filteredPosts.length === 0 ?(
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <HiSearch size={40} />
            <p className="mt-2 text-sm">No post history found</p>
          </div>
        ):
        filteredPosts.map((post,i) => (
          <div 
            key={post._id} 
            className="group relative bg-white dark:bg-white/2 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 transition-all hover:border-[var(--active-color)] hover:shadow-lg"
          >
            {/* Close Button (Top Right) */}
            <button className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <HiOutlineX size={18} />
            </button>

            <div className="flex flex-col gap-3">
              {/* Category & Date */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--active-color)] bg-[var(--active-color)]/10 px-2 py-1 rounded">
                  {post.description}
                </span>
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <HiCalendar size={14} />
                  {new Date(post.updatedAt).toDateString()}
                </span>
              </div>

              {/* Text - break-words handles the wrapping issue we fixed earlier */}
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed break-words">
                {post.about}
              </p>

              {/* Tags Array Map */}
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, i) => (
                  <span key={i} className="text-xs text-zinc-400 font-medium italic">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="h-[1px] w-full bg-zinc-100 dark:bg-zinc-800 my-1" />

              {/* Bottom Actions */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/10 px-3 py-1 rounded-full">
                  <HiHeart className="text-red-500" size={16} />
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">{post.liked.length}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    className="flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-[var(--active-color)] transition-colors"
                    onClick={() => setEditContent(post)}
                  >
                    <HiOutlinePencilAlt size={16} />
                    Edit
                  </button>
                  <button className="flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-red-500 transition-colors">
                    <HiOutlineTrash size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default PostHistory;
