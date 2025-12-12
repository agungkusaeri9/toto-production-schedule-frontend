import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { handleError } from "@/utils/handleErrors";

export const useCreateData = <TForm, TResponse>(
  createFunction: (formData: TForm) => Promise<TResponse>,
  queryKey: string[],
  redirectUrl: string,
): UseMutationResult<TResponse, unknown, TForm, unknown> => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: TForm) => {
      return await createFunction(formData);
    },
    onSuccess: (response) => {
      // pastikan TResponse punya properti 'message' kalau ini ingin dipakai langsung
      // toast.success((response as { message: string }).message || "Data berhasil ditambahkan.");
      queryClient.invalidateQueries({ queryKey });
      router.push(redirectUrl);
    },
    onError: (error: unknown) => {
      handleError(error);
    },
  });
};