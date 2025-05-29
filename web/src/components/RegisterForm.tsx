import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { RadioButton } from "@/components/ui/radio-button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom" 
import { useState } from "react"

export function RegisterForm() {
  const [accountType, setAccountType] = useState("student")

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" placeholder="Your name" className="dark:bg-gray-800 dark:border-gray-600" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="You@example.com" className="dark:bg-gray-800 dark:border-gray-600" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="********" className="dark:bg-gray-800 dark:border-gray-600" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" type="password" placeholder="********" className="dark:bg-gray-800 dark:border-gray-600" />
          </div>

          <div className="space-y-2">
            <Label className="block">I am signing up as a...</Label>
            <div className="flex gap-4">
              <RadioButton
                label="Student / IT Enthusiast"
                name="accountType"
                value="student"
                checked={accountType === "student"}
                onChange={() => setAccountType("student")}
              />
              <RadioButton
                label="Company"
                name="accountType"
                value="company"
                checked={accountType === "company"}
                onChange={() => setAccountType("company")}
              />
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
    </div>
  )
}