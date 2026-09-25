
function BigTitle(props) {
  return (
    <>
      {props.primary && <h1 {...props} className='text-[36px] leading-[36px] text-text-primary font-black'>{props.title}</h1>}
      {props.secondary && <h2 {...props}  className={`text-[34px] mb-8 uppercase ${props.center && "text-center"} leading-[34px] ${props.dark ? "text-dark-300" : "text-text-primary"} font-bold`}>{props.title}</h2>}
    </>
  )
}

export default BigTitle