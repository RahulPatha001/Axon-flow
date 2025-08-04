import React from 'react'
import { AiToolsData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react';

function AiTools() {

    const navigate = useNavigate();
    const {user} = useUser();
  return (
    <div className='px-4 sm:px-20 xl:px:32 my-24'>
        <div className='text-center'>
        <h2 className='text-slate-700 text-[42px] font-semibold'>Powerful AI Tools</h2>
        <p className='text-gray-500 max-w-lg mx-auto'>Everything you need to create, enhance, and optimize your content 
            with cutting-edge AI Technology.</p>
        </div>

        <div className='flex flex-wrap justify-center'>
        {
            AiToolsData.map((entry, Index)=>(
                <div className='p-8 m-4 max-w-xs rounded-lg bg-[#FDFDFE] shadow-lg
                border border-gray-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer' key={Index}
                onClick={()=>user && navigate(entry.path)}>
                    <entry.Icon className='w-12 h-12 p-3 text-white rounded-xl' 
                    style={{background:`linear-gradient(to bottom,${entry.bg.from}, ${entry.bg.to})`}}/>
                    <h3 className='mt-6 mb-3 text-lg font-semibold'>{entry.title}</h3>
                    <h3 className='text-gray-400 text-sm max-w-[95%]'>{entry.description}</h3>
                </div>
            ))
        }
        </div>

    </div>
  )
}

export default AiTools