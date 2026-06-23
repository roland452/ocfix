import React from 'react'
import { useState } from 'react'
import useSection from '../../../context/sectionState'
import Content from './content'
import CreatePost from './createPost'
import useRefresh from './context/refresh'
const Jobs = () => {

  const activeSection = useSection((state) => state.activeSection)
  const [postPage, setPostPage] = useState(false)
  const refresh = useRefresh((state) => state.refresh)
  const setRefresh = useRefresh((state) => state.setRefresh)
  
  const onBack = () => { setPostPage(false) }
  return (
    <div className={`absolute w-[100%] h-[95vh] ${activeSection === 'jobs'? 'translate-x-[0%]' : 'translate-x-[100%]'} transition-all duration-[.5s] ease-in-out`}>
      <div className='relative'>
        <Content 
          setPostPage={setPostPage} 
          refresh={refresh} 
          setRefresh={setRefresh} 
        /> 
        <CreatePost 
          postPage={postPage}
          onBack={onBack}  
          refresh={refresh} 
          setRefresh={setRefresh} 
        />
      </div>
       
      
      
    </div>
  )
}

export default Jobs
