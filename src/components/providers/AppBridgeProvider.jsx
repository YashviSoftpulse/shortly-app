import { Provider } from "@shopify/app-bridge-react";

export function AppBridgeProvider({ children }) {
  return (
    <Provider>
      {children}
    </Provider>
  );
}
