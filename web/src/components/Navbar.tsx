import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import DropDownButton from "./DropdownButton";
import { UserCircle, LogOut, Moon, Sun, Computer } from "lucide-react";

import { useTheme } from "./theme-provider";
import clsx from "clsx";

import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const { accountId, role, logout } = useAuth();

  console.log("Navbar rendered with role:", role);
  console.log("Navbar rendered with accountId:", accountId);

  return (
    <nav
      className="sticky top-0 z-50 flex justify-between px-4 pt-3 h-16
+                 bg-amber-200/70 backdrop-blur dark:bg-zinc-900/70"
    >
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link
              to="/"
              className="bg-amber-200 flex gap-2 dark:bg-zinc-900 dark:hover:!bg-zinc-700 rounded-md px-3 py-1 hover:!bg-amber-100"
            >
              <Computer />
              <span>ConnectIT</span>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link
              to="/jobListing"
              className={clsx(
                navigationMenuTriggerStyle(),
                "!bg-amber-200 hover:!bg-amber-100 dark:!bg-zinc-800 dark:hover:!bg-zinc-700 "
              )}
            >
              Job Opportunies Board{" "}
            </Link>
          </NavigationMenuItem>

          {role === "company" && (
            <NavigationMenuItem>
              <Link
                to="/company/recruitmentDashboard"
                className={clsx(
                  navigationMenuTriggerStyle(),
                  "!bg-amber-200 hover:!bg-amber-100 dark:!bg-zinc-800 dark:hover:!bg-zinc-700"
                )}
              >
                Recruitment Dashboard
              </Link>
            </NavigationMenuItem>
          )}

          {role === "user" && (
            <NavigationMenuItem>
              <Link
                to="/quiz"
                className={clsx(
                  navigationMenuTriggerStyle(),
                  "!bg-amber-200 hover:!bg-amber-100 dark:!bg-zinc-800 dark:hover:!bg-zinc-700"
                )}
              >
                Quiz
              </Link>
            </NavigationMenuItem>
          )}

          <NavigationMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:!bg-amber-100 rounded-full border ml-2 h-12 w-12 dark:!bg-zinc-800 dark:hover:!bg-zinc-700 !bg-amber-200 "
                >
                  <UserCircle style={{ width: "1.5rem", height: "1.5rem" }} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <DropDownButton
                    icon={<UserCircle className="h-4 w-4" />}
                    text="Profile"
                    onClick={() => console.log("Profile clicked")}
                  ></DropDownButton>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <DropDownButton
                    icon={
                      isDark ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )
                    }
                    text={isDark ? "Light Mode" : "Dark Mode"}
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                  ></DropDownButton>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <DropDownButton
                    icon={<LogOut className="h-4 w-4 text-red-500" />}
                    text="Logout"
                    onClick={() => console.log("Logout clicked")}
                  ></DropDownButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
};

export default Navbar;
