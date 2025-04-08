import { useState, useEffect, Suspense, lazy } from "react";
import { Form } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@flarekit/ui/components/ui/card";
import { Button } from "@flarekit/ui/components/ui/button";
import { AvatarFallback } from "@flarekit/ui/components/ui/avatar";
import InputField from "~/features/auth/components/input-filed";
import { RiGithubFill, RiUploadCloud2Line } from "@remixicon/react";
import ActiveSessions from "~/components/settings/active-sessions";
import ConnectedCard from "~/components/settings/connected-card";
import ProfileCard from "~/components/settings/profile-card";

export const meta = () => [
  {
    title: "Profile Settings",
  }
]



export default function ProfileSettings() {



  return (
    <div className="space-y-6">
      {/* Profile Section with new layout */}
      <ProfileCard />
      
      {/* Connected Accounts */}
      <ConnectedCard />

      {/* Active Sessions */}
      <Suspense fallback={<div>Loading...</div>}>
        <ActiveSessions />
      </Suspense>
      
    </div>
  );
}
