import { useAuth } from "@flarekit/auth/lib/auth-provider";
import type { Session } from "better-auth";
import SettingCard from "../setting-card";
import { SettingsCellSkeleton } from "../skeletons/settings-cell-skeleton";
import { SessionCell } from "./session-cell";

interface SessionsCardProps {
  title?: string;
  description?: string;
  isPending?: boolean;
  sessions?: Session[] | null;
  skipHook?: boolean;
  refetch?: () => Promise<void>;
}

export function SessionsCard({
  title = "Active Sessions",
  description = "Manage your active sessions",
  sessions,
  isPending,
  refetch,
}: SessionsCardProps) {
  const {
    hooks: { useListSessions },
  } = useAuth();
  if (!sessions) {
    const result = useListSessions();
    sessions = result.data;
    isPending = result.isPending;
    refetch = result.refetch;
  }

  return (
    <SettingCard title={title} description={description} isPending={isPending}>
      {isPending ? (
        <SettingsCellSkeleton />
      ) : (
        sessions?.map((session) => {
          return (
            <SessionCell refetch={refetch} key={session.id} session={session} />
          );
        })
      )}
    </SettingCard>
  );
}
