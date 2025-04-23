import { Session, User } from "better-auth";
import { createContext, useContext, use } from "react";

interface AuthContextType {
  user: User;
  session: Session;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
  userSession,
}: { children: React.ReactNode; userSession: AuthContextType }) {
  return (
    <AuthContext.Provider value={userSession}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
