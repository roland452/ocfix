import React from 'react'

const Profession = ({ profession, setProfession }) => {
  const data = ['developer', 'youtuber', 'graphic designer', 'advertiser']
  return (
    <div className="col-span-2 mb-4">
        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 text-green-600">Choose Profession </label>
            <select value={profession} onChange={(e) => setProfession(e.target.value)} className="w-full mt-1.5 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm font-bold outline-none appearance-none focus:border-green-500 text-green-700">
            {
                data.map((x) => {
                    return (
                        <option value={x} onChange={(e) => setProfession(e.target.value)}>{x}</option>
                    )
            })
        }
            </select>
    </div>
  )
}

export default Profession
