import { Badge } from '@flarekit/ui/components/ui/badge'
import { Button } from '@flarekit/ui/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@flarekit/ui/components/ui/card'
import { Separator } from '@flarekit/ui/components/ui/separator'
import { useEffect } from 'react'



export default function ActiveSessions() {

  return (
    <Card>
    <CardHeader>
      <CardTitle>Active Sessions</CardTitle>
      <CardDescription>
        Manage your active sessions
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">Chrome on Windows</p>
              <Badge variant="secondary">Current</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Last active: 2 minutes ago
            </p>
            <p className="text-sm text-muted-foreground">
              IP: 192.168.1.1
            </p>
          </div>
          <Button variant="ghost" size="sm" disabled>
            Current Session
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Safari on iPhone</p>
            <p className="text-sm text-muted-foreground">
              Last active: 2 hours ago
            </p>
            <p className="text-sm text-muted-foreground">
              IP: 192.168.1.2
            </p>
          </div>
          <Button variant="destructive" size="sm">
            Log Out
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
  )
}
