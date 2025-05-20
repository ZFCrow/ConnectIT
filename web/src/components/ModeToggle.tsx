import { useTheme } from "@/components/theme-provider"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

const ModeToggle = () =>  {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <Button
      variant="ghost"
      className="w-full flex items-center justify-start gap-2"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      
      <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
    </Button>
  )
}

export default ModeToggle