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
        <div class="Polaris-Layout__Section plan-card">
          {isLoding ? (
            <Grid>
              {[1, 2, 3].map((item) => (
                <Grid.Cell key={item} columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
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
            Object.entries(planDetail || {}).map(([key, plan], index) => (
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
                  <InlineStack gap={100} >
                    <Text variant="headingLg">
                      {plan.price === 0 ? "Free" : `$${plan.price}`}
                    </Text>

                    {key === "grow" && <Text> /month</Text>}
                    {key === "amplify" && <Text> /month</Text>}
                  </InlineStack>

                  <Divider />
                  <BlockStack gap={500}>
                    <List>
                      {index === 0 && (  // Free Plan
                        <>
                          <List.Item>Unlimited Short URL</List.Item>
                          <List.Item>Unlimited Custom Link</List.Item>
                          <List.Item>URL Tracking</List.Item>
                          <List.Item>Email Support</List.Item>
                          <List.Item>URL & Checkout Tracking</List.Item>
                          <List.Item>Email & Chat Support</List.Item>
                        </>
                      )}
                      {index === 1 && ( // Grow Plan
                        <>
                          <List.Item>All Features in FREE +</List.Item>
                          <List.Item>QR Code Generation & Download</List.Item>
                          <List.Item>Bulk Link Generation</List.Item>
                          <List.Item>Export Links to CSV</List.Item>
                          <List.Item>URL Tracking</List.Item>
                          <List.Item>Order Tracking via URL</List.Item>
                          <List.Item>Email & Chat Support</List.Item>
                          <List.Item>Create 1 Influencer</List.Item>
                          <List.Item>Each Influencer can create up to 2 Links</List.Item>
                        </>
                      )}
                      {index === 2 && ( // Amplify Plan
                        <>
                          <List.Item>All Features in FREE +</List.Item>
                          <List.Item>QR Code Generation & Download</List.Item>
                          <List.Item>Bulk Link Generation</List.Item>
                          <List.Item>Export Links to CSV</List.Item>
                          <List.Item>URL Tracking</List.Item>
                          <List.Item>Order Tracking via URL</List.Item>
                          <List.Item>Email & Chat Support</List.Item>
                          <List.Item>Unlimited Influencer</List.Item>
                          <List.Item>Unlimited Link creation per Influencer</List.Item>
                        </>
                      )}
                    </List>
                    {data?.plan_details?.name?.toLowerCase() !== key.toLowerCase() && (
                      <Button variant="primary" onClick={() => getPricingPlan(index)}>
                        {data?.plan_details?.name === "Grow" && index === 0 && "Downgrade to Free"}
                        {data?.plan_details?.name === "Free" && index === 1 && "Upgrade to Grow"}
                        {data?.plan_details?.name === "Grow" && index === 2 && "Upgrade to Amplify"}
                        {data?.plan_details?.name === "Amplify" && index === 1 && "Downgrade to Grow"}
                        {!(
                          (data?.plan_details?.name === "Grow" && index === 0) ||
                          (data?.plan_details?.name === "Free" && index === 1) ||
                          (data?.plan_details?.name === "Grow" && index === 2) ||
                          (data?.plan_details?.name === "Amplify" && index === 1)
                        ) && "Choose Plan"}
                      </Button>
                    )}

                  </BlockStack>
                </BlockStack>
              </Card>
            ))
          )}
        </div>
      </Layout>
    </Page >
  );
};

export default Plans;
