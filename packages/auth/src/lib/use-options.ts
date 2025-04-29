import { createAuthHooks } from "@daveyplate/better-auth-tanstack";
import { useIsRestoring } from "@tanstack/react-query";
import { useMemo } from "react";
import type { AnyAuthClient, AuthClient } from "../types/auth-client";
import type { AuthHooks } from "../types/auth-hooks";
import type { AuthMutators } from "../types/auth-mutators";

export function useOptions({ authClient }: { authClient: AnyAuthClient }) {
  const {
    useUnlinkAccount,
    useUpdateUser,
    useDeletePasskey,
    useRevokeSession,
    useRevokeDeviceSession,
    useSetActiveSession,
  } = createAuthHooks(authClient);

  const { mutateAsync: updateUserAsync } = useUpdateUser();
  const { mutateAsync: deletePasskeyAsync } = useDeletePasskey();
  const { mutateAsync: unlinkAccountAsync } = useUnlinkAccount();
  const { mutateAsync: revokeSessionAsync } = useRevokeSession();
  const { mutateAsync: revokeDeviceSessionAsync } = useRevokeDeviceSession();
  const { setActiveSessionAsync } = useSetActiveSession();

  const hooks = useMemo(
    () => ({
      ...(createAuthHooks(authClient as AuthClient) as AuthHooks),
      useIsRestoring,
    }),
    [authClient],
  );

  const mutators = useMemo(
    () =>
      ({
        updateUser: async (params) => {
          const { error } = await updateUserAsync({
            ...params,
            fetchOptions: { throw: false },
          });
          if (error) throw error;
        },
        unlinkAccount: async (params) => {
          const { error } = await unlinkAccountAsync({
            ...params,
            fetchOptions: { throw: false },
          });
          if (error) throw error;
        },
        deletePasskey: async (params) => {
          const { error } = await deletePasskeyAsync({
            ...params,
            fetchOptions: { throw: false },
          });
          if (error) throw error;
        },
        revokeSession: async (params) => {
          const { error } = await revokeSessionAsync({
            ...params,
            fetchOptions: { throw: false },
          });
          if (error) throw error;
        },
        setActiveSession: async (params) => {
          const { error } = await setActiveSessionAsync({
            ...params,
            fetchOptions: { throw: false },
          });
          if (error) throw error;
        },
        revokeDeviceSession: async (params) => {
          const { error } = await revokeDeviceSessionAsync({
            ...params,
            fetchOptions: { throw: false },
          });
          if (error) throw error;
        },
      }) as AuthMutators,
    [
      updateUserAsync,
      deletePasskeyAsync,
      unlinkAccountAsync,
      revokeSessionAsync,
      revokeDeviceSessionAsync,
      setActiveSessionAsync,
    ],
  );

  return {
    hooks,
    mutators,
    optimistic: true,
  };
}
