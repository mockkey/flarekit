import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, createContext, useContext, useMemo } from "react";
import type { AnyAuthClient, SocialProvider } from "../types/auth-client";
import type { AuthHooks } from "../types/auth-hooks";
import type { AuthMutators } from "../types/auth-mutators";
import type { Link } from "../types/elements";
import { defaultAuthClient } from "./auth-client";
import { useOptions } from "./use-options";

const queryClient = new QueryClient();

const DefaultLink: Link = ({ href, className, children }) => (
  <a className={className} href={href}>
    {children}
  </a>
);

const defaultNavigate = (href: string) => {
  window.location.href = href;
};

export type AuthContextType = {
  Link: Link;
  hooks: AuthHooks;
  authClient: AnyAuthClient;
  socials: SocialProvider[];
  queryClient?: QueryClient;
  mutators: AuthMutators;
  navigate: typeof defaultNavigate;
  uploadAvatar?: (file: File) => Promise<string | undefined | null>;
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export type AuthProviderProps = {
  children: ReactNode;
  Link: Link;
  hooks?: Partial<AuthHooks>;
  authClient?: AnyAuthClient;
  socials?: SocialProvider[];
  mutators?: Partial<AuthMutators>;
  navigate?: typeof defaultNavigate;
  uploadAvatar?: (file: File) => Promise<string | undefined | null>;
};

export const AuthBaseProvider = ({
  children,
  Link = DefaultLink,
  socials = [],
  authClient = defaultAuthClient,
  hooks: hooksProp,
  mutators: mutatorsProp,
  navigate = defaultNavigate,
  uploadAvatar,
  ...props
}: AuthProviderProps) => {
  const {
    hooks: contextHooks,
    mutators: contextMutators,
  } = useOptions({ authClient });

  const hooks = useMemo(
    () => ({ ...contextHooks, ...hooksProp }),
    [contextHooks, hooksProp],
  );

  const mutators = useMemo(
    () => ({ ...contextMutators, ...mutatorsProp }),
    [contextMutators, mutatorsProp],
  );

  return (
    <AuthContext.Provider
      value={{
        Link,
        socials,
        authClient,
        hooks,
        mutators,
        uploadAvatar,
        navigate,
      }}
      {...props}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider = ({
  children,
  Link = DefaultLink,
  socials = [],
  authClient = defaultAuthClient,
  hooks: hooksProp,
  mutators,
  navigate = defaultNavigate,
  uploadAvatar,
  ...props
}: AuthProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthQueryProvider>
        <AuthBaseProvider
          socials={socials}
          Link={Link}
          authClient={authClient}
          navigate={navigate}
          mutators={mutators}
          uploadAvatar={uploadAvatar}
          {...props}
        >
          {children}
        </AuthBaseProvider>
      </AuthQueryProvider>
    </QueryClientProvider>
  );
};
