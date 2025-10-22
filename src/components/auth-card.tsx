"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { X, User, Mail, Lock } from 'lucide-react'

interface AuthCardProps {
  onClose?: () => void
}

export function AuthCard({ onClose }: AuthCardProps) {
  const t = useTranslations('auth')
  const { signIn, signUp, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
    } else {
      onClose?.()
    }
    
    setIsLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    // Validazione conferma password
    if (password !== confirmPassword) {
      setError(t('passwordMismatch'))
      setIsLoading(false)
      return
    }
    
    const { error } = await signUp(email, password)
    
    if (error) {
      setError(error.message)
    } else {
      setError(t('checkEmail'))
    }
    
    setIsLoading(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-[500px] shadow-lg border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-normal">{t('welcome')}</CardTitle>
              <CardDescription className="text-sm">
                {isSignUp ? t('signUpDescription') : t('signInDescription')}
              </CardDescription>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-normal">
                  <Mail className="inline h-4 w-4 mr-2" />
                  {t('email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-normal">
                  <Lock className="inline h-4 w-4 mr-2" />
                  {t('password')}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={isSignUp ? 6 : undefined}
                  className="h-9"
                />
              </div>
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-normal">
                  <Lock className="inline h-4 w-4 mr-2" />
                  {t('confirmPassword')}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-9"
                />
              </div>
            )}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <div className="flex gap-4 items-center">
              <Button 
                type="submit" 
                className="flex-1 font-normal" 
                disabled={isLoading}
              >
                {isLoading 
                  ? (isSignUp ? t('signingUp') : t('signingIn'))
                  : (isSignUp ? t('signUp') : t('signIn'))
                }
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setEmail('')
                  setPassword('')
                  setConfirmPassword('')
                }}
                className="flex-1 font-normal"
              >
                {isSignUp 
                  ? 'Hai già un account? Accedi'
                  : 'Non hai un account? Registrati'
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}