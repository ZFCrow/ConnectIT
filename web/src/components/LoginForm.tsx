import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom" 
import { useState } from "react"
import { useAuth, Role } from "@/contexts/AuthContext"
import { UserSchema, CompanySchema, AccountSchema } from "@/type/account"
import axios from "axios"
import { ApplicationToaster } from "./CustomToaster"
import toast from "react-hot-toast"
import { parse } from "path"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try{
      const response = await axios.post("/api/login", {
        email,
        password
      })
      const data = response.data

      let parsed;
      switch (data.role) {
        case Role.User:
          parsed = UserSchema.parse(data);
          break;
        case Role.Company:
          parsed = CompanySchema.parse(data);
          break;
        case Role.Admin:
          parsed = AccountSchema.parse(data);
          break;
        default:
          throw new Error("Unsupported account role");
      }

      login(parsed.accountId, parsed.role, parsed.name, {
        userId: 'userId' in parsed ? parsed.userId : undefined,
        companyId: 'companyId' in parsed ? parsed.companyId : undefined,
        profilePicUrl: 'profilePicUrl' in parsed ? parsed.profilePicUrl : undefined,
      })

      navigate("/")

    } catch (err: any){
      toast.error("Error logging in, please try again.")
      console.log("Login failed", err)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Log In</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="********" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Don’t have an account?{" "}
              <Link to="/register" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Sign up here
              </Link>
            </p>
          </CardContent>

          <CardFooter>
            <Button className="w-full">Log In</Button>
          </CardFooter>
        </form>
      </Card>
      <ApplicationToaster /> {" "}
    </div>
  )
}