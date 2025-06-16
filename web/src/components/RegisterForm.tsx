import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { RadioButton } from "@/components/ui/radio-button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom" 
import { useState } from "react"
import axios from "axios"
import { Role } from "@/contexts/AuthContext"

export function RegisterForm() {
  const [accountType, setAccountType] = useState<Role>(Role.User)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirm] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password != confirmPassword){
      setError("Passwords do not match.")
      return
    }

    try {
      const response = await axios.post("/api/register", {
        name,
        email,
        password,
        role: accountType 
      })

      console.log("Registered", response.data)
      navigate("/login")
    } catch (err: any){
      console.log("Registration failed", err)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="Your name" className="dark:bg-gray-800 dark:border-gray-600"
              onChange={(e) => setName(e.target.value)} value={name} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="You@example.com" className="dark:bg-gray-800 dark:border-gray-600"
              onChange={(e) => setEmail(e.target.value)} value={email} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="********" className="dark:bg-gray-800 dark:border-gray-600"
              onChange={(e) => setPassword(e.target.value)} value={password} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" placeholder="********" className="dark:bg-gray-800 dark:border-gray-600"
              onChange={(e) => setConfirm(e.target.value)} value={confirmPassword} />
            </div>

            <div className="space-y-2">
              <Label className="block">I am signing up as a...</Label>
              <div className="flex gap-4">
                <RadioButton
                  label="IT Enthusiast"
                  name="accountType"
                  value={Role.User}
                  checked={accountType === Role.User}
                  onChange={() => setAccountType(Role.User)}
                />
                <RadioButton
                  label="Company"
                  name="accountType"
                  value={Role.Company}
                  checked={accountType === Role.Company}
                  onChange={() => setAccountType(Role.Company)}
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>

          <CardFooter className="flex flex-col items-start gap-3">
            <Link to="/login" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Already have an account? Click here to log in
            </Link>
            <Button className="w-full">Sign Up</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}