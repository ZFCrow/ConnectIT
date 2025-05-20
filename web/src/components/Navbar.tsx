import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu"

import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button" 
import ModeToggle from "@/components/ModeToggle"
import DropDownButton from "./DropdownButton"
import { UserCircle, LogOut, Moon, Sun, Computer } from "lucide-react"

import { useTheme } from "./theme-provider"
import clsx from "clsx"
const Navbar = () => { 
    const { theme, setTheme } = useTheme() 
    const isDark = theme === "dark" 

    return(
        <nav className="flex justify-between px-4 pt-3"> 
            <NavigationMenu >
                <NavigationMenuList >
                    <NavigationMenuItem >
                        
                            <Link to="/" className="flex gap-2 dark:hover:bg-zinc-700 rounded-md px-3 py-1">
                            <Computer/><span>It-Connect</span>
                            </Link>
                        
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>

            <NavigationMenu>
                <NavigationMenuList>

                    <NavigationMenuItem>
                        
                        <Link to="/otherpage" className={clsx(
                                navigationMenuTriggerStyle(),
                                "dark:bg-zinc-800 dark:hover:bg-zinc-700")}>Job Opportunies Board </Link>
                        
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <Link to="/otherpage" className={clsx(
                                navigationMenuTriggerStyle(),
                                "dark:bg-zinc-800 dark:hover:bg-zinc-700")}>Messages </Link>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full border ml-2 h-12 w-12">
                                    <UserCircle style={{ width: '1.5rem', height: '1.5rem' }} /> 
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem asChild>
                                    <DropDownButton
                                        icon={<UserCircle className="h-4 w-4" />}
                                        text="Profile"
                                        onClick={() => console.log("Profile clicked")}>
                                    </DropDownButton>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <DropDownButton
                                        icon={isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                        text={isDark ? "Light Mode" : "Dark Mode"}
                                        onClick={() => setTheme(isDark ? "light" : "dark")}>
                                    </DropDownButton>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <DropDownButton
                                        icon={<LogOut className="h-4 w-4 text-red-500" />}
                                        text="Logout"
                                        onClick={() => console.log("Logout clicked")}>
                                    </DropDownButton>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </NavigationMenuItem>


                </NavigationMenuList>
            </NavigationMenu>

        </nav>
        
    )
}

export default Navbar 
