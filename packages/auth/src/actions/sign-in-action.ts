import { signIn } from "@flarekit/auth/lib/auth-client";
import { toast } from "sonner";
import { Schema, z } from "zod";

const signInSchema: Schema<{
  email: string;
  password: string;
}> = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type FormState = {
  success: boolean;
  fields?: Record<string, string>;
  errors?: Record<string, string[]>;
};

export const signInAction = async (_: FormState, payload: FormData) => {
  const intent = payload.get("intent");
  switch (intent) {
    case "github":
      signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
      break;
    case "email":
      const formData = Object.fromEntries(payload);
      const parsed = signInSchema.safeParse(formData);
      if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        const fields: Record<string, string> = {};

        for (const key of Object.keys(formData)) {
          fields[key] = formData[key].toString();
        }
        return {
          success: false,
          fields,
          errors,
        };
      }
      const { data, error } = await signIn.email({
        ...parsed.data,
        callbackURL: "/dashboard",
      });

      if (error) {
        toast.error(error.message);
      }

      console.log("signInRes", data, error);

      break;
  }
  return {
    success: true,
  };
};
