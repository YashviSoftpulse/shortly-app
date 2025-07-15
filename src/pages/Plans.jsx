// **Note: Please check image url when you upload file in ftp it will be > base_url + imported image name
import React, { useEffect, useState } from "react";
import {
  Card,
  Layout,
  Page,
  Button,
  Text,
  BlockStack,
  Divider,
  InlineStack,
  Badge,
  List,
  Grid,
  SkeletonBodyText,
  SkeletonTabs,
} from "@shopify/polaris";
import { fetchData, getApiURL } from "../action";
import { useApiData } from "../components/ApiDataProvider";

const Plans = () => {
  const [planDetail, setPlanDetail] = useState("");
  const [isLoding, setIsLoding] = useState(false);
  const { data, loading, error } = useApiData();
  const urlParams = new URLSearchParams(window.location.search);
  const SHOP = urlParams.get("shop");

  const getPricingPlanData = async () => {
    setIsLoding(true);
    const response = await fetchData(getApiURL("plan_list"));
    if (response.status === true) {
      setPlanDetail(response?.plans);
      setIsLoding(false);
    }
  };

  const getPricingPlan = async (index) => {
    const formData = new FormData();
    formData.append("shop", SHOP);
    const encodedIndex = btoa(index.toString());
    formData.append("plan_index", encodedIndex);
    const response = await fetchData(getApiURL("pricing"), formData);
    if (response.status === true) {
      if (response.confirmation_url) {
        window.open(response.confirmation_url, "_blank");
      } else {
        shopify.toast.show(response.message, { duration: 3000 });
        window.location.href = `/dashboard${window.location.search}`;
      }
    }
  };

  const entries = Object.entries(planDetail);
  const visible =
    data?.version === 1
      ? [entries[0], entries[2]].filter(Boolean)
      : data?.version === 2
      ? entries.slice(0, 3)
      : [];


  useEffect(() => {
    getPricingPlanData();
  }, []);

  return (
    <Page title="Plans">
      <Layout>
        <Layout.Section>
          <InlineStack align="center">
            <Text variant="headingLg" as="h5">
              Choose your plan
            </Text>
          </InlineStack>
          <InlineStack align="center">
            <Text>Update your plan whenever you like!</Text>
          </InlineStack>
        </Layout.Section>
        <Layout.Section></Layout.Section>
        <div className="Polaris-Layout__Section plan-card">
          {isLoding ? (
            <Grid>
              {[1, 2, 3].map((item) => (
                <Grid.Cell
                  key={item}
                  columnSpan={{ xs: 3, sm: 2, md: 2, lg: 4, xl: 4 }}
                >
                  <Card>
                    <BlockStack gap="400">
                      <SkeletonTabs count={2} />
                      <SkeletonTabs count={1} />
                      <SkeletonBodyText lines={2} />
                      <Divider />
                      <SkeletonBodyText lines={3} />
                      <SkeletonBodyText lines={3} />
                    </BlockStack>
                  </Card>
                </Grid.Cell>
              ))}
            </Grid>
          ) : (
            visible.map(([key, plan]) => {
              const origIndex = entries.findIndex((e) => e[0] === key);

              return (
                <Card key={key}>
                  <BlockStack gap="300">
                    <InlineStack align="space-between">
                      <InlineStack gap={200}>
                        <Text variant="bodyLg" as="p">
                          {plan.name} Plan
                        </Text>
                      </InlineStack>
                      {data?.plan_details?.name ===
                        key.charAt(0).toUpperCase() +
                          key.slice(1).toLowerCase() && (
                        <Badge tone="success">Active</Badge>
                      )}
                    </InlineStack>
                    <InlineStack gap={100}>
                      <Text variant="headingLg">
                        {plan.price === 0 ? "Free" : `$${plan.price}`}
                      </Text>
                      {key === "grow" && <Text> /month</Text>}
                      {key === "amplify" && <Text> /month</Text>}
                    </InlineStack>

                    <Divider />
                    <BlockStack gap={500}>
                      <List>
                        {origIndex === 0 && data.version === 1 ? (
                          <>
                            <List.Item>Unlimited Short URL</List.Item>
                            <List.Item>Unlimited Custom Link</List.Item>
                            <List.Item>URL & Checkout Tracking,</List.Item>
                            <List.Item>QR Code Generation & Download</List.Item>
                            <List.Item>Bulk Link Generation</List.Item>
                            <List.Item>Export Links to CSV</List.Item>
                            <List.Item>Order Tracking via URL</List.Item>
                            <List.Item>Email & Chat Support</List.Item>
                          </>
                        ) : (
                          origIndex === 0 &&
                          data?.version === 2 && (
                            <>
                              <List.Item>Unlimited Short URL</List.Item>
                              <List.Item>Unlimited Custom Link</List.Item>
                              <List.Item>URL Tracking</List.Item>
                              <List.Item>Email & Chat Support</List.Item>
                            </>
                          )
                        )}
                        {origIndex === 1 &&
                          data?.version === 2 && ( // Grow Plan
                            <>
                              <List.Item>All Features in FREE +</List.Item>
                              <List.Item>
                                QR Code Generation & Download
                              </List.Item>
                              <List.Item>Bulk Link Generation</List.Item>
                              <List.Item>Export Links to CSV</List.Item>
                              <List.Item>Order Tracking via URL</List.Item>
                              <List.Item>Allow 1 Influencer</List.Item>
                              <List.Item>Allow 2 Influencer Links</List.Item>
                              <List.Item>Email & Chat Support</List.Item>
                            </>
                          )}
                        {origIndex === 2 && (
                          <>
                            <List.Item>All Features in Grow +</List.Item>
                            <List.Item>Unlimited Influencers</List.Item>
                            <List.Item>Unlimited Influencer Links</List.Item>
                            <List.Item>Priority Email & Chat Support</List.Item>
                          </>
                        )}
                      </List>

                      {data?.plan_details?.name !==
                        key.charAt(0).toUpperCase() +
                          key.slice(1).toLowerCase() && (
                        <Button
                          variant="primary"
                          onClick={() => getPricingPlan(origIndex)}
                        >
                          {data?.plan_details?.name === "Free" &&
                            origIndex === 1 &&
                            "Upgrade To Grow"}
                          {data?.plan_details?.name === "Free" &&
                            origIndex === 2 &&
                            "Upgrade To Amplify"}
                          {data?.plan_details?.name === "Grow" &&
                            origIndex === 2 &&
                            "Upgrade To Amplify"}
                          {data?.plan_details?.name === "Grow" &&
                            origIndex === 0 &&
                            "Downgrade To Free"}
                          {data?.plan_details?.name === "Amplify" &&
                            origIndex === 1 &&
                            "Upgrade To Grow"}
                          {data?.plan_details?.name === "Amplify" &&
                            origIndex === 0 &&
                            "Downgrade To Free"}
                        </Button>
                      )}
                    </BlockStack>
                  </BlockStack>
                </Card>
              );
            })
          )}
        </div>
      </Layout>
    </Page>
  );
};

export default Plans;
