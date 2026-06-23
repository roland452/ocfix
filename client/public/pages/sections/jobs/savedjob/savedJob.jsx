import React from 'react'
import useSection from '../../../../context/sectionState'
import SavedLists from './savedList'

const SavedJob = () => {
    const activeSection = useSection((state) => state.activeSection)
  return (
    <div className={`absolute w-[100%] h-[95vh] ${activeSection === 'saved jobs'? 'translate-x-[0%]' : 'translate-x-[100%]'} transition-all duration-[.5s] ease-in-out`}>
      <SavedLists />
    </div>
  )
}

export default SavedJob
