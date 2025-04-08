import { Button } from '@flarekit/ui/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@flarekit/ui/components/ui/card'
import { RiGithubFill } from '@remixicon/react'
import { useEffect } from 'react'
import { authClient } from '~/features/auth/client/auth'

export default function ConnectedCard() {

  useEffect(() => {
    authClient.listAccounts()
  },[])  

  return (
    <Card>
    <CardHeader>
      <CardTitle>Connected Accounts</CardTitle>
      <CardDescription>
        Manage your connected accounts
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RiGithubFill className="size-6" />
          <div>
            <p className="font-medium">GitHub</p>
            <p className="text-sm text-muted-foreground">
              Access with GitHub account
            </p>
          </div>
        </div>
        <Button variant="outline">Connect</Button>
      </div>
    </CardContent>
  </Card>
  )
}
