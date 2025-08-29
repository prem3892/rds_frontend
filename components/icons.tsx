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



    const ChatIcon = (props: LucideProps) => {
  return (
    <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M18.4698 16.83L18.8598 19.99C18.9598 20.82 18.0698 21.4 17.3598 20.97L13.1698 18.48C12.7098 18.48 12.2599 18.45 11.8199 18.39C12.5599 17.52 12.9998 16.42 12.9998 15.23C12.9998 12.39 10.5398 10.09 7.49985 10.09C6.33985 10.09 5.26985 10.42 4.37985 11C4.34985 10.75 4.33984 10.5 4.33984 10.24C4.33984 5.68998 8.28985 1.99999 13.1698 1.99999C18.0498 1.99999 21.9998 5.68998 21.9998 10.24C21.9998 12.94 20.6098 15.33 18.4698 16.83Z"
      stroke="white"
      strokeWidth={1.27778}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 15.23C13 16.42 12.56 17.52 11.82 18.39C10.83 19.59 9.26 20.36 7.5 20.36L4.89 21.91C4.45 22.18 3.89 21.81 3.95 21.3L4.2 19.33C2.86 18.4 2 16.91 2 15.23C2 13.47 2.94 11.92 4.38 11C5.27 10.42 6.34 10.09 7.5 10.09C10.54 10.09 13 12.39 13 15.23Z"
      stroke="white"
      strokeWidth={1.27778}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
  )
}



export {
  HomeIcon,
  ChatIcon
}