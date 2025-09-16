'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

export default function ToastDemoPage() {
  const { toast } = useToast()

  const handleAllTypes = () => {
    toast.success('Success! Your action was completed successfully.')
    
    setTimeout(() => {
      toast.error('Error! Something went wrong. Please try again.')
    }, 800)
    
    setTimeout(() => {
      toast.warning('Warning! Please check your input before proceeding.')
    }, 1600)
    
    setTimeout(() => {
      toast.info('Info: Here is some useful information for you.')
    }, 2400)
  }

  const handleMultipleToasts = () => {
    toast.success('CV saved successfully!')
    toast.info('Data synchronized')
    toast.warning('Profile picture is missing')
    toast.error('Network connection failed')
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Toast Component Demo</h1>
        <p className="text-muted-foreground mt-2">
          Simple toast notifications for user feedback.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Toast Types</CardTitle>
            <CardDescription>
              Four simple toast types with fixed durations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleAllTypes} className="w-full">
              Show All Types (Staggered)
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={() => toast.success('Success!')}
              >
                Success (3s)
              </Button>
              <Button 
                variant="outline" 
                onClick={() => toast.error('Error!')}
              >
                Error (5s)
              </Button>
              <Button 
                variant="outline" 
                onClick={() => toast.warning('Warning!')}
              >
                Warning (4s)
              </Button>
              <Button 
                variant="outline" 
                onClick={() => toast.info('Info!')}
              >
                Info (3s)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Real-world Examples</CardTitle>
            <CardDescription>
              Common feedback messages in CV applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => toast.success('CV saved successfully!')}
              variant="outline" 
              className="w-full justify-start"
            >
              CV Saved
            </Button>
            
            <Button 
              onClick={() => toast.error('Failed to save CV. Please try again.')}
              variant="outline" 
              className="w-full justify-start"
            >
              Save Error
            </Button>
            
            <Button 
              onClick={() => toast.warning('Please fill all required fields.')}
              variant="outline" 
              className="w-full justify-start"
            >
              Validation Warning
            </Button>
            
            <Button 
              onClick={() => toast.info('Profile updated successfully.')}
              variant="outline" 
              className="w-full justify-start"
            >
              Profile Updated
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Multiple Toasts</CardTitle>
            <CardDescription>
              Test multiple toasts at once
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleMultipleToasts} variant="secondary" className="w-full">
              Show Multiple Toasts
            </Button>
            
            <Separator />
            
            <Button 
              onClick={() => toast.dismissAll()} 
              variant="destructive" 
              className="w-full"
            >
              Clear All Toasts
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Always Dismissible</CardTitle>
            <CardDescription>
              All toasts can be manually dismissed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Every toast has an X button for immediate dismissal, even during auto-dismiss countdown.
            </p>
            
            <Button 
              onClick={() => toast.error('Try clicking the X button to dismiss this error immediately!')}
              variant="outline"
              className="w-full"
            >
              Test Manual Dismiss
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Simple Usage:</h4>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()

// Simple feedback messages
toast.success('CV saved successfully!')
toast.error('Failed to save CV')
toast.warning('Please fill required fields')
toast.info('Profile updated')`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Features:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Fixed durations: Success & Info (3s), Warning (4s), Error (5s)</li>
                <li>• Always dismissible with X button</li>
                <li>• Auto-stacking for multiple toasts</li>
                <li>• Dark mode support</li>
                <li>• Accessible (ARIA labels, screen reader support)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}