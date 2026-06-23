import React, { useState } from 'react'
import { FaCheck, FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaInbox } from 'react-icons/fa';
import axios from 'axios'
import ClientProfileModal from './clientProfileModal';
import ProjectsModal from './projectsModal';

const Client = ({req, fetchOffers}) => {

  const getRelativeTime = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + (interval === 1 ? " day ago" : " days ago");
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + (interval === 1 ? " hour ago" : " hours ago");
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + (interval === 1 ? " minute ago" : " minutes ago");
    return "just now";
  };

  
  const [link, setLink] = useState('')
  const [projects, setProjects] = useState([])
  const [isProjectModal, setIsProjectModal] = useState(false)
  const [sentBy, setSentBy] = useState('')
  const [jobId, setJobId] = useState('')


  const setProjectView = (portfolioLink, projectScreenshoot, sentBy, jobId) => {
    setLink(portfolioLink)
    setProjects(projectScreenshoot)
    setIsProjectModal(true)

    setSentBy(sentBy)
    setJobId(jobId)

    
  }


  async function sendApproval(clientId, jobOfferId) {
    try {
      const res = await axios.post(`/api/post-approval`,{
        clientId, jobOfferId
      },{ withCredentials: true })

      fetchOffers()

    } catch (error) {
      (error); 
    }
  }
  const [clientId, setClientId] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const onClose = () => {
    setIsModalOpen(false)
  }
  
  const openProfileModal = (id) => {
    setClientId(id)
    setIsModalOpen(true)
  }

  return (
    <div key={req.id} className="bg-[#042d1d] dark:bg-white/2 border border-white/5 rounded-3xl p-5 hover:border-emerald-500/20 transition-all animate-in fade-in slide-in-from-bottom-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* profile div for name and image/avatar */}
            <div className='flex flex-col gap-1 relative'>
                {/* image card */}
                <div 
                  className="h-14 w-14 rounded-2xl bg-emerald-500/20 flex capitalize items-center justify-center text-xl font-bold text-[var(--active-color)] cursor-pointer" onClick={() => openProfileModal(req.sentBy._id)}>
                  {req.sentBy.image? <img src={req.sentBy.image} className='rounded-2xl h-14 w-14' alt="" /> :req.sentBy.name[0]}
                </div>
                {/* name */}
                <div className='capitalize cursor-pointer text-[var(--active-color)]' onClick={() => openProfileModal(req.sentBy._id)}> {req.sentBy.name}</div>
            </div>

            {/* job details div card */}
            <div className="flex-1">
              <h3 className="font-bold text-lg">{req.jobOfferId.description}</h3> {/* description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-gray-400 text-xs">
                  <div className="flex items-center gap-2"><FaCalendarAlt /> {getRelativeTime(req.createdAt)}</div> {/* date */}
                  <div className="flex items-center gap-2"><FaMapMarkerAlt className='text-[var(--active-color)]' />lagos</div> {/* location */}
              </div>
            </div>

            {/* action buttons for [ approval / view / decline ] */}
            <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
              <button 
                className="flex-1 sm:w-32 bg-white/5 text-[var(--active-color)] border border-white/10 py-2 rounded-xl text-sm" 
                onClick={() => setProjectView(req.portfolioLink, req.projects, req.sentBy._id, req.jobOfferId._id)}
              >view</button>
            </div>

        </div>
        <ClientProfileModal clientId={clientId} isModalOpen={isModalOpen} onClose={onClose} />
        <ProjectsModal 
          link={link} 
          projects={projects} 
          isProjectModal={isProjectModal} 
          setIsProjectModal={setIsProjectModal} 
          sendApproval={sendApproval} 
          sentBy={sentBy} 
          jobId={jobId} 
        />
    </div>
  )
}

export default Client
