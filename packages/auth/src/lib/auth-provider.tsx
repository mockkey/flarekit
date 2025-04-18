import { createContext, useContext } from "react";
import { Link } from "../types/link";

export type AuthContextType = {
  Link: Link;
};

const DefaultLink: Link = ({ href, className, children }) => (
  <a className={className} href={href}>
    {children}
  </a>
);

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
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
};

export const AuthProvider = ({
  children,
  Link: Link = DefaultLink,
}: AuthProviderProps) => {
  return (
    <AuthContext.Provider value={{ Link }}>{children}</AuthContext.Provider>
  );
};
