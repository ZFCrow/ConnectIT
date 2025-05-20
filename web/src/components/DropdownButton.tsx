import type { FC, ReactNode, MouseEventHandler } from "react";
import { Button } from "./ui/button";


interface DropDownButtonProps {
  icon: ReactNode
  text: string
  /** click handler for the underlying button */
  onClick: MouseEventHandler<HTMLButtonElement>
}

const DropDownButton : FC<DropDownButtonProps> = ({icon, text, onClick}) => {
    return (
        <>
        <Button
            variant="outline"
            className="w-full flex items-center justify-start gap-2"
            onClick={onClick}
        >
            {icon}
            <span>{text}</span>
        </Button>
        </>
    )

}

export default DropDownButton; 