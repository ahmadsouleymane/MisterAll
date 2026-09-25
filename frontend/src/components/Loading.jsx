import React from 'react'

export const Loading = (props) => {
  return (
    <div className='min-h-dvh flex-col gap-5 bg-primaryBlack w-screen absolute top-0 left-0 flex justify-center items-center'>
        <img src="/icon.svg" className='w-[80px] h-[80px] animate-spin' alt="" />
        <p className='text-white text-[24px] font-bold uppercase'>{props.title}</p>
    </div>
  )
}