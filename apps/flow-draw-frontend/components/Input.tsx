interface InputProps {
    placeholder: string,
    className?: string,
    onClick?: () => void
  }
  
  export default function Input(props : InputProps) {
    return (
      <div className="p-8">
        <input onClick={props.onClick} type="text" name="" id="" placeholder={props.placeholder} className={`bg-gray-100 rounded-lg placeholder-gray-500 font-normal text-sm pl-2 py-2 w-[25vw] flex justify-center ${props.className}`} />
      </div>
    )
  };