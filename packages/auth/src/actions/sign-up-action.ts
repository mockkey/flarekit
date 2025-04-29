import { toast } from "sonner";
import { type Schema, z } from "zod";
import { useAuth } from "../hooks/use-auth";
import { SocialActions, type providerPlatform } from "./social-actions";

const signInSchema: Schema<{
  name: string;
  email: string;
  password: string;
}> = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type FormState = {
  success: boolean;
  fields?: Record<string, string>;
  errors?: Record<string, string[]>;
};

export const signUpAction = async (_: FormState, payload: FormData) => {
  const intent = payload.get("intent");
  const isSet = await SocialActions(intent as providerPlatform);
  const { authClient, navigate } = useAuth();
  const signUp = authClient?.signUp!;
  if (isSet) {
    return true;
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
      const { data, error } = await signUp.email({
        ...parsed.data,
        callbackURL: "/dashboard",
      });

      if (data) {
        toast.success("Check your email for the verification link.");
        navigate("/dashboard");
      }

      if (error) {
        toast.error(error.message);
      }
      return {
        success: true,
        fields,
      };
    }
  }
  return {
    success: true,
  };
};
