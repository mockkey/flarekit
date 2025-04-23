import { signIn } from "@flarekit/auth/lib/auth-client";
import { toast } from "sonner";
import { type Schema, z } from "zod";
import { SocialActions, type providerPlatform } from "./social-actions";

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
  const isSet = await SocialActions(intent as providerPlatform);
  if (isSet) {
    return {
      success: true,
    };
  }
  switch (intent) {
    case "email": {
      const formData = Object.fromEntries(payload);
      const parsed = signInSchema.safeParse(formData);
      const fields: Record<string, string> = {};
      for (const key of Object.keys(formData)) {
        fields[key] = formData[key].toString();
      }
      if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
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

      return {
        success: true,
      };

      break;
    }
  }
  return {
    success: true,
  };
};
