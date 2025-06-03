import {
  type QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { unknown } from "zod";
import { postData } from "~/lib/fetch";
import { authClient } from "../client/auth";

interface UpgradeProps {
  plan: string;
  successUrl?: string;
  cancelUrl?: string;
}

const queryKey: QueryKey = ["subscription"];
export const useSubscriptionList = () => {
  return useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      return (await authClient.subscription.list()).data;
    },
  });
};

export const useSubscriptionSession = () => {
  return useMutation({
    mutationFn: async () => {
      return (
        await postData<{ url: string }>("/rpc/subscription/session", unknown)
      ).url;
    },
    onSuccess: async (url: string) => {
      if (url) {
        if (typeof window !== "undefined" && window.location) {
          if (window.location) {
            try {
              window.location.href = url;
            } catch {}
          }
        }
      }
    },
  });
};

export const useSubscriptionUpgrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (query: UpgradeProps) => {
      return authClient.subscription.upgrade(query);
    },
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.refetchQueries({ queryKey });
    },
  });
};
