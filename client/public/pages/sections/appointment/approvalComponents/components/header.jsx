import React from 'react'

const Header = ({isEmpty, pendingRequests}) => {
  return (
    <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">Pending Approvals</h1>
        <p className="text-gray-400 text-sm">
          {isEmpty ? "You're all caught up!" : `You have ${pendingRequests.length} items requiring attention.`}
        </p>
    </div>
  )
}

export default Header
