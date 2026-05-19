import React, { createContext, useContext, useState } from "react";

interface AccountContextType {
  showForgotPassword: boolean;
  setShowForgotPassword: (value: boolean) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <AccountContext.Provider
      value={{ showForgotPassword, setShowForgotPassword }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccountContext must be used within AccountProvider");
  }
  return context;
};
