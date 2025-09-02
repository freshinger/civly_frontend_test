"use client"

import { LoginForm } from "@/components/login-form"
import { CivlyLogo } from "@/components/custom/civly-logo"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FormSeparator } from "@/components/custom/auth-form/form-separator"
import { GoogleAuthButton } from "@/components/custom/auth-form/google-auth-button"
import { Button } from "@/components/ui/button"

enum AuthView {
    Login,
    Register,
    ForgotPassword
}

export default function LoginPage() {
  const [authView, setAuthView] = useState(AuthView.Login)

  const handleAuthViewChange = (view: AuthView) => {
    setAuthView(view)
  }


  const NameField = () => (
    <div className="grid gap-3">
      <Label htmlFor="email">Name</Label>
      <Input
        id="name"
        type="text"
        placeholder="Tom Doe"
        required
      />
    </div>
  )

  const EmailField = () => (
    <div className="grid gap-3">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        placeholder="m@example.com"
        required
      />
    </div>
  )

  const SubmitButton = () => (
    <Button type="submit" className="w-full">
      Continue
    </Button>
  )

  const PasswordField = ({ showForgotPassword }: {
    showForgotPassword?: boolean}) => (
    <div className="grid gap-3">
      <div className="flex items-center">
        <Label htmlFor="password">Password</Label>
        {showForgotPassword && (
          <a
            onClick={() => handleAuthViewChange(AuthView.ForgotPassword)}
            className="ml-auto text-sm underline-offset-4 hover:underline cursor-pointer"
          >
            Forgot your password?
          </a>
        )}
      </div>
      <Input id="password" type="password" required />
    </div>
  )

  const ConfirmPasswordField = () => (
    <div className="grid gap-3">
      <Label htmlFor="password">Confirm Password</Label>
      <Input
        id="confirm-password"
        type="password"
        placeholder=""
        required
      />
    </div>
  )

  const SwitchToRegisterButton = () => (
    <div className="text-center text-sm">
      Don&apos;t have an account?{" "}
      <a onClick={() => handleAuthViewChange(AuthView.Register)}className="underline underline-offset-4">
        Sign up
      </a>
    </div>
  )

  const SwitchToLoginButton = () => (
    <div className="text-center text-sm">
      You already have an account?{" "}
      <a onClick={() => handleAuthViewChange(AuthView.Login)} className="underline underline-offset-4">
        Sign in
      </a>
    </div>
)


  const renderFormChildren = () => {
    switch (authView) {
      case AuthView.Login:
        return (
          <>
            <EmailField />
            <PasswordField showForgotPassword={true} />
            <SubmitButton />
            <FormSeparator />
            <GoogleAuthButton onClick={() => {}} />
            <SwitchToRegisterButton />
          </>
        )
      case AuthView.Register:
        return (
          <>
            <NameField />
            <EmailField />
            <PasswordField showForgotPassword={false} />
            <ConfirmPasswordField />
            <SubmitButton />
            <FormSeparator />
            <GoogleAuthButton onClick={() => {}} />
            <SwitchToLoginButton />
          </>
        )
      case AuthView.ForgotPassword:
        return (
          <>
            <EmailField />
            <SubmitButton />
            <SwitchToLoginButton />
          </>
        )
    }
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <CivlyLogo height={200} width={400}/>
        </a>
        <LoginForm>
          {renderFormChildren()}
        </LoginForm>
      </div>
    </div>
  )
}
