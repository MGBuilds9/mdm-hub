import React, { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Building2, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  onSuccess?: () => void
  className?: string
}

export function LoginForm({ onSuccess, className }: LoginFormProps) {
  const { signInWithEmail, signInWithAzure, signUp } = useAuth()
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  })

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    isInternal: false,
  })

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await signInWithEmail(signInData.email, signInData.password)
    
    if (error) {
      setError(error.message || 'Failed to sign in')
    } else {
      onSuccess?.()
    }
    
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const { error } = await signUp(signUpData.email, signUpData.password, {
      first_name: signUpData.firstName,
      last_name: signUpData.lastName,
      phone: signUpData.phone,
      is_internal: signUpData.isInternal,
    })
    
    if (error) {
      setError(error.message || 'Failed to create account')
    } else {
      setSuccess('Account created successfully! Please check your email to verify your account.')
      setSignUpData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        isInternal: false,
      })
    }
    
    setLoading(false)
  }

  const handleAzureSignIn = async () => {
    setLoading(true)
    setError(null)

    const { error } = await signInWithAzure()
    
    if (error) {
      setError(error.message || 'Failed to sign in with Azure AD')
    }
    
    setLoading(false)
  }

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-500">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome to MDM Hub</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {error && (
              <Alert className="mt-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4" variant="default">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    leftIcon={<Mail className="h-4 w-4" />}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    leftIcon={<Lock className="h-4 w-4" />}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" loading={loading}>
                  Sign In
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-charcoal-500">Or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleAzureSignIn}
                disabled={loading}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Sign in with Azure AD
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="First Name"
                    value={signUpData.firstName}
                    onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                    leftIcon={<User className="h-4 w-4" />}
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Last Name"
                    value={signUpData.lastName}
                    onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                    leftIcon={<User className="h-4 w-4" />}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    leftIcon={<Mail className="h-4 w-4" />}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                    leftIcon={<Phone className="h-4 w-4" />}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    leftIcon={<Lock className="h-4 w-4" />}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    leftIcon={<Lock className="h-4 w-4" />}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" loading={loading}>
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
