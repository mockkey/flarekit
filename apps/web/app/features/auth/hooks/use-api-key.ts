import {
  type QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { postData } from "~/lib/fetch";
import { authClient } from "../client/auth";

const queryKey: QueryKey = ["api-key"];

export const useApiKeyList = () => {
  return useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      return (await authClient.apiKey.list()).data;
    },
  });
};

export const useDeleteApiKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keyId: string) => {
      return authClient.apiKey.delete({
        keyId: keyId,
      });
    },
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.refetchQueries({ queryKey });
    },
  });
};

export const createApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (queryString: string) => {
      return postData<{ key: string }>("/rpc/api-key/create", queryString);
    },
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.refetchQueries({ queryKey });
    },
  });
};
