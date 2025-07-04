import { postData } from "@flarekit/common/fetch";
import { useMutation } from "@tanstack/react-query";

export const queryKey = ["file-upload"];

export const useCheckHash = () => {
  return useMutation({
    mutationFn: (queryString: string) => {
      return postData<{ key: string }>("/rpc/file/check-hash", queryString);
    },
    onSuccess: async () => {},
  });
};

export const useGetUploadIdByHash = () => {
  return useMutation({
    mutationFn: (queryString: string) => {
      return postData<{ key: string }>("/rpc/file/check-hash", queryString);
    },
    onSuccess: async () => {},
  });
};
