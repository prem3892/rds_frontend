import { LucideProps } from "lucide-react"

const HomeIcon  = (props: LucideProps) => {
  return (
    <svg
    width={28}
    height={28}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M14 21V17.5"
      stroke="#E7E7E7"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.7483 3.29L3.66332 9.765C2.75332 10.4883 2.16998 12.0167 2.36832 13.16L3.91998 22.4467C4.19998 24.1033 5.78665 25.445 7.46665 25.445H20.5333C22.2017 25.445 23.8 24.0917 24.08 22.4467L25.6317 13.16C25.8183 12.0167 25.235 10.4883 24.3367 9.765L16.2517 3.30167C15.0033 2.29833 12.985 2.29833 11.7483 3.29Z"
      stroke="#E7E7E7"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
  )
}




export {
  HomeIcon
}