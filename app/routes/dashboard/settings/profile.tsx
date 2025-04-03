import { useState, useEffect } from "react";
import { Form } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@flarekit/ui/components/ui/card";
import { Button } from "@flarekit/ui/components/ui/button";
import { AvatarFallback } from "@flarekit/ui/components/ui/avatar";
import InputField from "~/features/auth/components/input-filed";
import { RiGithubFill, RiUploadCloud2Line } from "@remixicon/react";
import { toast } from "sonner";
import { authClient } from "~/features/auth/client/auth";
import ActiveSessions from "~/components/settings/active-sessions";

export const meta = () => [
  {
    title: "Profile Settings",
  }
]

export const clientLoader = async () =>{  
    const sessions = await authClient.listSessions()
    console.log('sessions',sessions)
    toast.info('developing...')
}


export default function ProfileSettings() {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  return (
    <div className="space-y-6">
      {/* Profile Section with new layout */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your profile image and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left side - Avatar preview and upload */}
            <div className="flex-shrink-0 w-full md:w-[240px] space-y-4">
              <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center relative overflow-hidden">
                {(previewUrl || "/logo.svg") ? (
                  <img
                    src={previewUrl || "/logo.svg"}
                    alt="Avatar preview"
                    className="size-full object-cover"
                  />
                ) : (
                  <AvatarFallback className="size-full">FK</AvatarFallback>
                )}
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <RiUploadCloud2Line className="size-4" />
                  Change Photo
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  />
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  JPG, GIF or PNG. Max size 2MB.
                </p>
              </div>
            </div>

            {/* Right side - Profile form */}
            <div className="flex-1">
              <Form className="space-y-4">
                <InputField
                  label="name"
                  name="name"
                  placeholder="Your name"
                />
                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Connected Accounts */}
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

      {/* Active Sessions */}
      <ActiveSessions />
    </div>
  );
}
