import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export const StyledCard = () => {
  const navigate = useNavigate()

  return (
    <Card className="max-w-sm border border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Welcome to ConnectIT</CardTitle>
        <CardDescription>Get answers from IT pros—and share your own knowledge.</CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-600">
          Dive into quizzes, forums, and real-time chat. Level up your skills today!
        </p>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button onClick={() => navigate("/otherpage")}>
          Get Started
        </Button>
      </CardFooter>
    </Card>
  )
}
