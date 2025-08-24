import React, { useEffect, useState } from 'react'
import {useAuth, useUser} from '@clerk/clerk-react'
import { dummyPublishedCreationData } from '../assets/assets';
import { Heart } from 'lucide-react';
import {toast} from 'react-hot-toast'
import axios from 'axios'
import Markdown from 'react-markdown';

axios.defaults.baseurl = import.meta.env.VITE_BASE_URL;

function Community() {
  const [creations, setCreations] = useState([]);
  const {user} = useUser();
  const [loading, setLoading] = useState(false);
  
  const {getToken} = useAuth();
  const fetchCreations = async() => {
    loading(true);
    try {
      const {data} = await axios.get('/api/user/get-published-creations',{
        headers:{Authorization: `Bearer ${await getToken()}`}
      });
      if(data.success){
        setCreations(data.creations);
      }else{
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  }


  const imageLikeToggle = async(id) => {
    try {
      const {data} = await axios.post('api/user/toggle-like-creation', {id},{
        headers: {Authorization:  `Bearer ${await getToken()}`}
      });
      if(data.success){
        toast.success(data.message);
        await fetchCreations()
      }else{
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(()=>{
    if(user){
      fetchCreations()
      console.log(creations)
    }
  },[user])
  return !loading ? (
    <div className='flex-1 h-full flex flex-col gap-4 p-6'>
      creations
      <div className='bg-white h-full w-full rounded-xl overflow-y-scroll'>
        {
          creations.map((entry,index)=>(
            <div key={index} className='relative group inline-block pl-3 pt-3 w-full sm:max-w-1/2
            lg:max-w-1/3'>
              <img src={entry.content} alt="" className='w-full h-full object-cover rounded-lg' />
              <div className='absolute bottom-0 top-0 right-0 left-3 flex gap-2 items-end justify-end group-hover:justify-between p-3 
              group-hover:bg-gradient-to-b from-transparent to-black/80 text-white rounded-lg'>
                <p className='text-sm hiden group-hover:block'>{entry.prompt}</p>
                <div className='flex gap-1 items-center'>
                  <p>{entry.likes.length}</p>
                  <Heart onClick={()=>{imageLikeToggle(creations.id)}} className={`min-w-5 h-5 hover:scale-110 cursor-pointer
                    ${entry.likes.includes(user.id) ? 'fill-red-500 text-red-600' : 'text-white'}`}/>

                </div>
              </div>
            </div>
          ))
        }
      </div>

    </div>
  ) : (
    <div>
      <span className='w-10 h-10 my-1 rounded-full border-3 border-primary
      border-t-transparent animate-spin'></span>
    </div>
  )
}

export default Community