"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Phone, Moon, Sun, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const countryCodes = [
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "China", code: "+86", flag: "🇨🇳" },
  { name: "Japan", code: "+81", flag: "🇯🇵" },
  { name: "Brazil", code: "+55", flag: "🇧🇷" },
  { name: "Russia", code: "+7", flag: "🇷🇺" },
  { name: "South Korea", code: "+82", flag: "🇰🇷" },
  { name: "Mexico", code: "+52", flag: "🇲🇽" },
  { name: "Italy", code: "+39", flag: "🇮🇹" },
  { name: "Spain", code: "+34", flag: "🇪🇸" },
  { name: "Netherlands", code: "+31", flag: "🇳🇱" },
  { name: "Sweden", code: "+46", flag: "🇸🇪" },
  { name: "Norway", code: "+47", flag: "🇳🇴" },
  { name: "Denmark", code: "+45", flag: "🇩🇰" },
  { name: "Finland", code: "+358", flag: "🇫🇮" },
  { name: "Switzerland", code: "+41", flag: "🇨🇭" },
  { name: "Austria", code: "+43", flag: "🇦🇹" },
  { name: "Belgium", code: "+32", flag: "🇧🇪" },
  { name: "Poland", code: "+48", flag: "🇵🇱" },
  { name: "Turkey", code: "+90", flag: "🇹🇷" },
  { name: "South Africa", code: "+27", flag: "🇿🇦" },
  { name: "Egypt", code: "+20", flag: "🇪🇬" },
  { name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { name: "Kenya", code: "+254", flag: "🇰🇪" },
  { name: "UAE", code: "+971", flag: "🇦🇪" },
  { name: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
  { name: "Israel", code: "+972", flag: "🇮🇱" },
  { name: "Singapore", code: "+65", flag: "🇸🇬" },
  { name: "Malaysia", code: "+60", flag: "🇲🇾" },
  { name: "Thailand", code: "+66", flag: "🇹🇭" },
  { name: "Philippines", code: "+63", flag: "🇵🇭" },
  { name: "Indonesia", code: "+62", flag: "🇮🇩" },
  { name: "Vietnam", code: "+84", flag: "🇻🇳" },
  { name: "New Zealand", code: "+64", flag: "🇳🇿" },
  { name: "Argentina", code: "+54", flag: "🇦🇷" },
  { name: "Chile", code: "+56", flag: "🇨🇱" },
  { name: "Colombia", code: "+57", flag: "🇨🇴" },
  { name: "Peru", code: "+51", flag: "🇵🇪" },
  { name: "Venezuela", code: "+58", flag: "🇻🇪" },
]

export default function FakeCallGenerator() {
  const [fakeName, setFakeName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [countryCode, setCountryCode] = useState("+1")

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fakeName.trim() || !phoneNumber.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both the caller name and phone number.",
        variant: "destructive",
      })
      return
    }

    if (!phoneNumber.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both the caller name and phone number.",
        variant: "destructive",
      })
      return
    }

    // Basic phone number validation (without country code)
    const phoneRegex = /^[\d]{4,15}$/
    if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ""))) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number (digits only).",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toNumber: countryCode + phoneNumber,
          fakeName: fakeName,
        }),
      })

      if (response.ok) {
        toast({
          title: "Call Initiated! 📞",
          description: "We're calling you now. Act busy 😉",
          duration: 5000,
        })

        // Reset form after successful submission
        setFakeName("")
        setPhoneNumber("")
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fake Caller Name Input */}
              <div className="space-y-2">
                <Label htmlFor="fakeName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fake Caller Name
                </Label>
                <Input
                  id="fakeName"
                  type="text"
                  placeholder="e.g., Mom, Boss, Unknown Number"
                  value={fakeName}
                  onChange={(e) => setFakeName(e.target.value)}
                  className="h-12 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
                  disabled={isLoading}
                />
              </div>

              {/* Phone Number Input with Country Code */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Phone Number
                </Label>
                <div className="flex gap-2">
                  {/* Country Code Dropdown */}
                  <Select value={countryCode} onValueChange={setCountryCode} disabled={isLoading}>
                    <SelectTrigger className="w-32 h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {countryCodes.map((country) => (
                        <SelectItem key={country.code + country.name} value={country.code}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{country.flag}</span>
                            <span className="font-mono text-sm">{country.code}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Phone Number Input */}
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="xxxxxxxxxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 h-12 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Example: {countryCode} 1234567890</p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
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
            </form>

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
