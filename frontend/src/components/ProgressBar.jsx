// import React from 'react'

// function ProgressBar(props) {
//   return (
//     <div className='flex-col h-full justify-end flex items-center'>
//         <div style={{height: props.height}} className='bg-white w-4 flex-col  flex justify-end rounded-full'>
//         </div>
//         <p className='text-[12px] mt-2 font-light uppercase text-white'>{props.day}</p>
//     </div>
    
//   )
// }

// export default ProgressBar


import React from "react";

export default function ProgressBar({ progress = 0, size = 120, strokeWidth = 12 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size}>
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke="#333"          // fond du cercle
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke="#4ade80"       // couleur de progression (vert)
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`} // commence en haut
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="text-white font-bold"
        >
          {progress}%
        </text>
      </svg>
      <p className="text-white/60 mt-2 text-sm">Progression du cours</p>
    </div>
  );
}
