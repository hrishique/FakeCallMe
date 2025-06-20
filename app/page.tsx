"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Phone, Moon, Sun, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"

const presetCallers = [
  { name: "Mom", number: "+1234567890" },
  { name: "Jake", number: "+1987654321" },
  { name: "Boss", number: "+1555123456" },
]

export default function FakeCallGenerator() {
  const [selectedCaller, setSelectedCaller] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async () => {
    if (!selectedCaller) {
      toast({
        title: "No Caller Selected",
        description: "Please select a caller first.",
        variant: "destructive",
      })
      return
    }

    const caller = presetCallers.find((c) => c.name === selectedCaller)
    if (!caller) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toNumber: caller.number,
          fakeName: caller.name,
        }),
      })

      if (response.ok) {
        toast({
          title: "Call Initiated! 📞",
          description: "We're calling you now. Act busy 😉",
          duration: 5000,
        })

        // Reset selection after successful submission
        setSelectedCaller(null)
      } else {
        throw new Error("Failed to initiate call")
      }
    } catch (error) {
      toast({
        title: "Oops! Something went wrong",
        description: "Failed to initiate the call. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md space-y-6">
        {/* Dark Mode Toggle */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-200"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </Button>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-300 hover:shadow-3xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Fake Call Me Now
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Need an excuse to leave? Trigger a real call to your phone instantly.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Preset Caller Buttons */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                Choose who's calling you:
              </h3>
              <div className="flex gap-3 justify-center">
                {presetCallers.map((caller) => (
                  <Button
                    key={caller.name}
                    variant={selectedCaller === caller.name ? "default" : "outline"}
                    onClick={() => setSelectedCaller(caller.name)}
                    disabled={isLoading}
                    className={`flex-1 h-12 text-base font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                      selectedCaller === caller.name
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400"
                    }`}
                  >
                    {caller.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Call Button */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !selectedCaller}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Calling...
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-5 w-5" />
                  Call Me Now
                </>
              )}
            </Button>

            {/* Additional Info */}
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-500 dark:text-gray-400">Your call will arrive within 10-30 seconds</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Use responsibly. Perfect for awkward situations! 😅
          </p>
        </div>
      </div>
    </div>
  )
}
