import {
  Card,
  Page,
  BlockStack,
  Layout,
  Text,
  InlineGrid,
} from "@shopify/polaris";
import React from "react";
import { useNavigate } from "react-router";
function Settings() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const params = {};
  for (const [key, value] of urlParams.entries()) {
    params[key] = value;
  }
  return (
    <Page
      title="Settings"
      subtitle="View and manage your logo settings and email notification"
    >
      <Layout>
        <Layout.Section>
          <InlineGrid columns={2} gap={400}>

            <Card sectioned>
              <div
                className="Polaris-InlineStack"
                style={{
                  "--pc-inline-stack-wrap": "nowrap",
                  "--pc-inline-stack-gap-xs": "var(--p-space-400)",
                  "--pc-inline-stack-flex-direction-xs": "row",
                  cursor: "pointer",
                }}
                onClick={() =>
                  navigate(
                    `/settings/general-settings${window.location.search}`
                  )
                }
              >
                <BlockStack gap={200}>
                  <div
                    className="Polaris-InlineStack"
                    style={{
                      "--pc-inline-stack-align": "start",
                      "--pc-inline-stack-wrap": "wrap",
                      "--pc-inline-stack-gap-xs": "var(--p-space-100)",
                      "--pc-inline-stack-flex-direction-xs": "row",
                      alignItems: "start",
                    }}
                  >
                    <span className="Polaris-Icon setting-icon">
                      <svg
                        viewBox="1 1 18 18"
                        className="Polaris-Icon__Svg"
                        focusable="false"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-1.5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
                        ></path>
                        <path
                          fillRule="evenodd"
                          d="M9.377 2.5c-.926 0-1.676.75-1.676 1.676v.688c0 .056-.043.17-.198.251-.153.08-.303.168-.448.262-.147.097-.268.076-.318.048l-.6-.346a1.676 1.676 0 0 0-2.29.613l-.622 1.08a1.676 1.676 0 0 0 .613 2.289l.648.374c.048.028.124.12.119.29a5.484 5.484 0 0 0 .005.465c.009.175-.07.27-.119.299l-.653.377a1.676 1.676 0 0 0-.613 2.29l.623 1.08a1.676 1.676 0 0 0 2.29.613l.7-.405c.048-.028.166-.048.312.043.115.071.233.139.353.202.155.08.198.195.198.251v.811c0 .926.75 1.676 1.676 1.676h1.246c.926 0 1.676-.75 1.676-1.676v-.81c0-.057.042-.171.197-.252.121-.063.239-.13.354-.202.146-.091.264-.07.312-.043l.7.405a1.676 1.676 0 0 0 2.29-.614l.623-1.08a1.676 1.676 0 0 0-.613-2.289l-.653-.377c-.05-.029-.128-.123-.119-.3a5.494 5.494 0 0 0 .005-.463c-.005-.171.07-.263.12-.291l.647-.374a1.676 1.676 0 0 0 .613-2.29l-.623-1.079a1.676 1.676 0 0 0-2.29-.613l-.6.346c-.049.028-.17.048-.318-.048a5.4 5.4 0 0 0-.448-.262c-.155-.081-.197-.195-.197-.251v-.688c0-.926-.75-1.676-1.676-1.676h-1.246Zm-.176 1.676c0-.097.078-.176.176-.176h1.246c.097 0 .176.079.176.176v.688c0 .728.462 1.298 1.003 1.58.11.058.219.122.323.19.517.337 1.25.458 1.888.09l.6-.346a.176.176 0 0 1 .24.064l.623 1.08a.176.176 0 0 1-.064.24l-.648.374c-.623.36-.888 1.034-.868 1.638a4.184 4.184 0 0 1-.004.337c-.032.615.23 1.31.867 1.677l.653.377a.176.176 0 0 1 .064.24l-.623 1.08a.176.176 0 0 1-.24.065l-.701-.405c-.624-.36-1.341-.251-1.855.069a3.91 3.91 0 0 1-.255.145c-.54.283-1.003.853-1.003 1.581v.811a.176.176 0 0 1-.176.176h-1.246a.176.176 0 0 1-.176-.176v-.81c0-.73-.462-1.3-1.003-1.582a3.873 3.873 0 0 1-.255-.146c-.514-.32-1.23-.428-1.855-.068l-.7.405a.176.176 0 0 1-.241-.065l-.623-1.08a.176.176 0 0 1 .064-.24l.653-.377c.637-.368.899-1.062.867-1.677a3.97 3.97 0 0 1-.004-.337c.02-.604-.245-1.278-.868-1.638l-.648-.374a.176.176 0 0 1-.064-.24l.623-1.08a.176.176 0 0 1 .24-.064l.6.346c.638.368 1.37.247 1.888-.09a3.85 3.85 0 0 1 .323-.19c.54-.282 1.003-.852 1.003-1.58v-.688Z"
                        ></path>
                      </svg>
                    </span>
                    <Text variant="headingSm" as="h6">
                      General Settings
                    </Text>
                  </div>
                  <Text variant="bodySm" as="p" tone="subdued">
                    Choose the Brand Name and Logo which suits your overall app.
                  </Text>
                </BlockStack>
              </div>
            </Card>

            <Card sectioned>
              <div
                className="Polaris-InlineStack"
                style={{
                  "--pc-inline-stack-wrap": "nowrap",
                  "--pc-inline-stack-gap-xs": "var(--p-space-400)",
                  "--pc-inline-stack-flex-direction-xs": "row",
                  cursor: "pointer",
                }}
                onClick={() =>
                  navigate(
                    `/settings/email-notification${window.location.search}`
                  )
                }
              >
                <BlockStack gap={200}>
                  <div
                    className="Polaris-InlineStack"
                    style={{
                      "--pc-inline-stack-align": "start",
                      "--pc-inline-stack-wrap": "wrap",
                      "--pc-inline-stack-gap-xs": "var(--p-space-100)",
                      "--pc-inline-stack-flex-direction-xs": "row",
                      alignItems: "center",
                    }}
                  >
                    <span className="Polaris-Icon setting-icon">
                      <svg
                        viewBox="1 1 18 18"
                        className="Polaris-Icon__Svg"
                        focusable="false"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.75 4.5c-1.519 0-2.75 1.231-2.75 2.75v5.5c0 1.519 1.231 2.75 2.75 2.75h8.5c1.519 0 2.75-1.231 2.75-2.75v-5.5c0-1.519-1.231-2.75-2.75-2.75h-8.5Zm-1.25 2.75c0-.69.56-1.25 1.25-1.25h8.5c.69 0 1.25.56 1.25 1.25v5.5c0 .69-.56 1.25-1.25 1.25h-8.5c-.69 0-1.25-.56-1.25-1.25v-5.5Zm2.067.32c-.375-.175-.821-.013-.997.363-.175.375-.013.821.363.997l3.538 1.651c.335.156.723.156 1.058 0l3.538-1.651c.376-.176.538-.622.363-.997-.175-.376-.622-.538-.997-.363l-3.433 1.602-3.433-1.602Z"
                        ></path>
                      </svg>
                    </span>
                    <Text variant="headingSm" as="h6">
                      Email Notifications
                    </Text>
                  </div>
                  <Text variant="bodySm" as="p" tone="subdued">
                    Customize email notifications to receive updates on your account status.
                  </Text>
                </BlockStack>
              </div>
            </Card>

          </InlineGrid>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default Settings;
