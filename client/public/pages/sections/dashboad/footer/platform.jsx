import React from 'react'

const Platform = ({ data }) => {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-white text-xs font-bold uppercase tracking-[0.2em] opacity-80">
        Platform
      </h3>
      <ul className="flex flex-col gap-3">
        {data.map((item, index) => (
          <li key={index}>
            <a 
              href={item.link} 
              className="text-gray-400 hover:text-[var(--active-color)] text-[14px] transition-all duration-300 ease-in-out hover:translate-x-1 inline-block"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Platform
