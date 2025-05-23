import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label, Input } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom" 
import { cn } from "@/lib/utils"
import { useState } from "react"

export function RegisterForm() {
  const [accountType, setAccountType] = useState("student")

  return (
    <Card className="max-w-md mx-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <CardHeader>
        <CardTitle className="text-2xl">Register</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" className="dark:bg-gray-800 dark:border-gray-600" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" className="dark:bg-gray-800 dark:border-gray-600" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" className="dark:bg-gray-800 dark:border-gray-600" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input id="confirm-password" type="password" className="dark:bg-gray-800 dark:border-gray-600" />
        </div>

        <div className="space-y-2">
          <Label className="block">I am signing up as a...</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="accountType"
                value="student"
                checked={accountType === "student"}
                onChange={() => setAccountType("student")}
              />
              Student / IT Enthusiast
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="accountType"
                value="company"
                checked={accountType === "company"}
                onChange={() => setAccountType("company")}
              />
              Company
            </label>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-3">
        <Link to="/login" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Already have an account? Click here to log in
        </Link>
        <Button className="w-full">Sign Up</Button>
      </CardFooter>
    </Card>
  )
}