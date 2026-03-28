import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ACCOUNT_MODE_KEY = "account_mode";

const AccountModeContext = createContext({
  accountMode: "personal",
  setAccountMode: () => {},
  isShopMode: false,
});

export function AccountModeProvider({ children }) {
  const [accountMode, setAccountModeState] = useState(
    () => localStorage.getItem(ACCOUNT_MODE_KEY) || "personal",
  );

  const setAccountMode = (nextMode) => {
    setAccountModeState(nextMode === "shop" ? "shop" : "personal");
  };

  useEffect(() => {
    localStorage.setItem(ACCOUNT_MODE_KEY, accountMode);
  }, [accountMode]);

  const value = useMemo(
    () => ({
      accountMode,
      setAccountMode,
      isShopMode: accountMode === "shop",
    }),
    [accountMode],
  );

  return <AccountModeContext.Provider value={value}>{children}</AccountModeContext.Provider>;
}

export function useAccountMode() {
  return useContext(AccountModeContext);
}
