import * as React from "react"
import { Progress } from "@/components/ui/progress"

interface AnimatedProgressProps {
  target: number     // your quiz.score
  isOpen: boolean    // e.g. openSections.includes("chats")
}

const AnimatedProgressBar = ({ target, isOpen }: AnimatedProgressProps) => {
  const [value, setValue] = React.useState(0)

  React.useEffect(() => {
    if (!isOpen) {
      // section closed → reset immediately
      setValue(0)
      return
    }
    // section just opened → give browser a beat, then fill
    const handle = setTimeout(() => {
      setValue(target)
    }, 50)
    
    return () => clearTimeout(handle)
  }, [isOpen, target])

  return (
    <Progress
      value={value}
      className="
        mt-2 
        [&>div]:transition-transform 
        [&>div]:duration-300
        [&>div]:ease-out
      "
    />
  )
}

export default AnimatedProgressBar 
