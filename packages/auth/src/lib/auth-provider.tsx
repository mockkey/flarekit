import { createContext, JSX, useContext } from "react";
import { Link } from "../types/elements";
import { socialProviders } from "better-auth/social-providers";

export interface SocialProvider {
  name: keyof typeof socialProviders;
  icon?: JSX.Element;
  label: string;
}

export type AuthContextType = {
  Link: Link;
  socials?: SocialProvider[];
};

const DefaultLink: Link = ({ href, className, children }) => (
  <a className={className} href={href}>
    {children}
  </a>
);

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
  children: React.ReactNode;
  Link: Link;
  socials?: SocialProvider[];
};

export const AuthProvider = ({
  children,
  Link = DefaultLink,
  socials = [],
}: AuthProviderProps) => {
  return (
    <AuthContext.Provider value={{ Link, socials }}>
      {children}
    </AuthContext.Provider>
  );
};
