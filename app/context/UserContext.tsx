import React, { createContext, useContext, useMemo, ReactNode } from "react";

type User = {
  _id: string;
  fullName: string;
  phone: string;
};

type UserContextType = {
  user: User;
};

const defaultUser: User = {
  _id: "691fe8341040eac114c9385a",
  fullName: "Nguyễn Văn An",
  phone: "+84912345678",
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const value = useMemo(() => ({ user: defaultUser }), []);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return ctx;
};
