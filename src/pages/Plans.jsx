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
  const [planDetail, setPlanDetail] = useState({});
  const [isLoding, setIsLoding] = useState(false);
  const { data, loading, error } = useApiData();
  const [isloading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    const response = await fetchData(getApiURL("pricing"), formData);
    if (response.status === true) {
      if (response.confirmation_url) {
        window.open(response.confirmation_url, "_blank");
        setIsLoading(false);
      } else {
        shopify.toast.show(response.message, { duration: 3000 });
        setIsLoading(false);
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
            Object.entries(planDetail).map(([key, plan], origIndex) => {
              const activePlanName = data?.plan_details?.name;
              const currentPlanName = plan.name;
              const isActive = activePlanName === currentPlanName;
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
                        plan.name.charAt(0).toUpperCase() +
                          plan.name.slice(1).toLowerCase() && (
                        <Badge tone="success">Active</Badge>
                      )}
                    </InlineStack>
                    <InlineStack gap={100}>
                      <Text variant="headingLg">
                        {plan.price === 0 ? "Free" : `$${plan.price}`}
                      </Text>
                      {key === "grow" && <Text> /month</Text>}
                      {key === "premium" && <Text> /month</Text>}
                    </InlineStack>

                    <Divider />
                    <BlockStack gap={500}>
                      <List>
                        {Object.entries(plan.content)?.map(
                          ([index, content]) => {
                            return <List.Item key={index}>{content}</List.Item>;
                          }
                        )}
                      </List>

                      {!isActive && (
                        <Button
                          variant="primary"
                          onClick={() => getPricingPlan(origIndex)}
                        >
                          {key === "grow" && "Upgrade To Groww"}
                          {key === "premium" && "Upgrade To Premium"}
                          {key === "free" && "Downgrade To Free"}
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
