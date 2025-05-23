import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input, Label } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom" 
import * as React from "react"

export function LoginForm() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Log In</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="********" />
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
      </Card>
    </div>
  )
}