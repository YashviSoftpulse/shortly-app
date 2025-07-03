
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import en from "@shopify/polaris/locales/en.json";

export function PolarisProvider({ children }) {
  return (
    <AppProvider i18n={en}>
      {children}
    </AppProvider>
  );
}
