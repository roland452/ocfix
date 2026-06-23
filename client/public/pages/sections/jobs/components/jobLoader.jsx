import React from 'react'

const JobLoader = () => {
  return (
    [1,1,1,1,1,1,1,1,1,1,1,1,1,].map((x) => {
    return (
        <div className="p-2 animate-pulse h-50 border-b-1 border-black/10 dark:border-white/10">
          <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-black/10 dark:bg-white/10 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
              <div className="h-3 bg-black/10 dark:bg-white/10 rounded animate-pulse w-3/4" />
              <div className="h-2 bg-black/10 dark:bg-white/10 rounded animate-pulse w-1/4" />
              </div>
          </div>  

          <div className="flex align-bottom gap-4 mt-7.5">
              <div className="flex-1 space-y-2">
              <div className="h-5 bg-black/10 dark:bg-white/10 rounded animate-pulse w-3/4" />
              <div className="h-2 bg-black/10 dark:bg-white/10 rounded animate-pulse w-1/4" />
              <div className="h-2 bg-black/10 dark:bg-white/10 rounded animate-pulse w-1/4" />
              </div>
          </div>  
          <div className="h-2 bg-black/10 dark:bg-white/10 rounded-[10px] animate-pulse flex p-3 mt-4"></div>
        </div>
    )
    })
  )
}

export default JobLoader
