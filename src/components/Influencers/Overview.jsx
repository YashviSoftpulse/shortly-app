import {
  BlockStack,
  Card,
  Text,
  InlineStack,
  Badge,
  SkeletonBodyText,
  Icon,
  Layout,
  Tooltip,
  Thumbnail,
  Button,
  Modal,
  IndexTable,
  SkeletonDisplayText,
  InlineGrid,
} from "@shopify/polaris";
import { BarChart, LineChart, SimpleBarChart } from "@shopify/polaris-viz";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchData, getApiURL } from "../../action";
import { ChartVerticalFilledIcon, InfoIcon } from "@shopify/polaris-icons";
import moment from "moment";
import Nodata from "/assets/Nodata.svg";
import { formatDate, formatNumber } from "../../utils";

function Overview({ selectedDates }) {
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [influencerInfo, setInfluencerInfo] = useState();
  const [influencerAnalytics, setInfluencerAnalytics] = useState();
  const [influencerCommission, setInfluencerCommission] = useState();
  const [vistorAnalytics, setVisitorAnalytics] = useState([]);
  const [active, setActive] = useState(false);
  const [storeCurrency, setStoreCurrency] = useState("Rs.");

  const fetchInfluencers = async () => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("uid", id);
    formData.append(
      "start_date",
      moment(selectedDates.start).format("YYYY-MM-DD")
    );
    formData.append("end_date", moment(selectedDates.end).format("YYYY-MM-DD"));

    const response = await fetchData(
      getApiURL("influencer-analytics"),
      formData
    );

    if (response?.status === true) {
      setVisitorAnalytics(response.data);

      const influencerInfo = response?.info;
      setInfluencerInfo({
        commission_based_on: influencerInfo.commission_based_on || "-",
        commission_type: influencerInfo.commission_type || "-",
        commission_value: influencerInfo.commission_value || "-",
        cstatus: influencerInfo.cstatus || "-",
        email: influencerInfo.email || "-",
        first_name: influencerInfo.first_name || "-",
        last_name: influencerInfo.last_name || "-",
        phone: influencerInfo.phone || "-",
        status: influencerInfo.status || "-",
        updated_at: influencerInfo.updated_at || "-",
        created_at: influencerInfo.created_at || "-",
      });

      const influencerAnalytics = response?.data;
      setInfluencerAnalytics({
        total_add_to_cart: influencerAnalytics.total_add_to_cart || "0",
        total_cancelled_orders:
          influencerAnalytics.total_cancelled_orders || "0",
        total_clicks: influencerAnalytics.total_clicks || "0",
        total_gross_revenue: influencerAnalytics.total_gross_revenue || "0",
        total_net_revenue: influencerAnalytics.total_net_revenue || "0",
        total_orders: influencerAnalytics.total_orders || "0",
        total_products_revenue:
          influencerAnalytics.total_products_revenue || "0",
        total_shipping: influencerAnalytics.total_shipping || "0",
        total_tax: influencerAnalytics.total_tax || "0",
      });

      const influencerCommission = response?.commission_summary;
      setInfluencerCommission({
        commission_logs: influencerCommission?.commission_logs,
        total_commission: influencerCommission?.total_commission || "0",
      });

      setStoreCurrency(response?.store_currency);
    } else {
      setVisitorAnalytics([]);
    }
    setIsLoading(false);
  };

  const initClickAnalyticsChart = () => {
    const { x_axis = [], y_axis = [] } = vistorAnalytics.chart || {};
    const data = x_axis.map((date, index) => {
      const utcDate = moment.utc(date);
      const localDate = utcDate.local().format("YYYY-MM-DD HH:mm:ss");
      return {
        key: date?.includes(":") ? localDate : date,
        value: y_axis[index],
      };
    });

    return data.length === 0 ? (
      <div className="fade-in-slide-up">
        <BlockStack inlineAlign="center">
          <Thumbnail source={Nodata} alt="No Data Found" size="large" />
          <Text variant="bodyXs" tone="subdued" alignment="center">
            There was no data found for this date range.
          </Text>
        </BlockStack>
      </div>
    ) : (
      <LineChart
        data={[
          {
            data,
            name: "Clicks",
          },
        ]}
        theme="Light"
      />
    );
  };

  function truncateText(text, maxLength = 25) {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }

  const PlatformsAnalyticsChart = () => {
    const platforms = vistorAnalytics?.platforms || {};
    const data = Object.entries(platforms).map(([name, value]) => ({
      key: name,
      value: value,
    }));

    return data.length === 0 ? (
      <div className="fade-in-slide-up">
        <BlockStack inlineAlign="center">
          <Thumbnail source={Nodata} alt="No Data Found" size="large" />
          <Text variant="bodyXs" tone="subdued" alignment="center">
            There was no data found for this date range.
          </Text>
        </BlockStack>
      </div>
    ) : (
      <BarChart
        data={[
          {
            data,
            name: "Platform",
          },
        ]}
        theme="Light"
      />
    );
  };

  const initDeviceUsageChart = () => {
    const platforms = vistorAnalytics.devices || {};
    const data = Object.entries(platforms).map(([name, value]) => ({
      key: name,
      value: value,
    }));

    return data.length === 0 ? (
      <div className="fade-in-slide-up">
        <BlockStack inlineAlign="center">
          <Thumbnail source={Nodata} alt="No Data Found" size="large" />
          <Text variant="bodyXs" tone="subdued" alignment="center">
            There was no data found for this date range.
          </Text>
        </BlockStack>
      </div>
    ) : (
      <SimpleBarChart
        data={[
          {
            data,
            name: "Device",
          },
        ]}
        theme="Light"
        // state={data.length === 0 ? "Error" : "Success"}
      />
    );
  };

  useEffect(() => {
    if (selectedDates.start && selectedDates.end) {
      fetchInfluencers();
    }
  }, [selectedDates]);

  const handleChange = () => setActive(!active);

  return (
    <>
      {isLoading ? (
        <>
          <Card>
            <InlineGrid gap="200" columns={4}>
              <SkeletonBodyText lines={2} />
              <SkeletonBodyText lines={2} />
              <SkeletonBodyText lines={2} />
              <SkeletonBodyText lines={2} />
            </InlineGrid>
          </Card>
          <BlockStack gap="200">
            <InlineGrid gap="200" columns={2}>
              <InlineGrid gap="200" columns={2}>
                <Card>
                  <SkeletonDisplayText size="medium" />
                </Card>
                <Card>
                  <SkeletonDisplayText size="medium" />
                </Card>
                <Card>
                  <SkeletonDisplayText size="medium" />
                </Card>
                <Card>
                  <SkeletonDisplayText size="medium" />
                </Card>
                <Card>
                  <SkeletonDisplayText size="medium" />
                </Card>
                <Card>
                  <SkeletonDisplayText size="medium" />
                </Card>
              </InlineGrid>
              <Card>
                <SkeletonBodyText lines={10} />
              </Card>
            </InlineGrid>
            <BlockStack gap="400">
              <InlineStack gap={400} align="space-between">
                <InlineStack gap={200} blockAlign="center">
                  <Icon source={ChartVerticalFilledIcon} tone="base" />
                  <Text variant="headingMd" as="h3">
                    Analytics
                  </Text>
                </InlineStack>
              </InlineStack>
              <Card>
                <SkeletonBodyText lines={5} />
              </Card>
              <Card>
                <SkeletonBodyText lines={5} />
              </Card>
              <Card>
                <SkeletonBodyText lines={5} />
              </Card>
            </BlockStack>
          </BlockStack>
        </>
      ) : (
        <div className="OverviewPageInfluncer">
          <BlockStack gap="400">
            <>
              <BlockStack gap="200">
                <div className="influencerPlatform">
                  <Card>
                    <InlineStack gap={400} align="space-between">
                      {[
                        {
                          label: "Total Clicks",
                          value:
                            formatNumber(influencerAnalytics?.total_clicks) ||
                            "0",
                        },
                        {
                          label: "Total Orders",
                          value:
                            formatNumber(influencerAnalytics?.total_orders) ||
                            "0",
                        },
                        {
                          label: "Cancelled Orders",
                          value:
                            formatNumber(
                              influencerAnalytics?.total_cancelled_orders
                            ) || "0",
                        },
                        {
                          label: "Commissions",
                          value:
                            storeCurrency +
                              formatNumber(
                                influencerCommission?.total_commission
                              ) || "0",
                        },
                      ].map(({ label, value }) => (
                        <BlockStack gap={200} key={label}>
                          <Text
                            as="p"
                            fontWeight="bold"
                            tone="subdued"
                            variant="bodyMd"
                            text-decoration="dotted"
                          >
                            {label}
                          </Text>
                          <Text
                            as="h2"
                            tone="base"
                            variant="bodyLg"
                            fontWeight="bold"
                          >
                            {value}
                          </Text>
                        </BlockStack>
                      ))}
                    </InlineStack>
                  </Card>
                </div>
              </BlockStack>

              <Layout>
                <Layout.Section variant="oneHalf">
                  <BlockStack gap="200">
                    <div className="influencerDashboardCards">
                      {[
                        {
                          label: "Add to Cart",
                          value:
                            formatNumber(
                              influencerAnalytics?.total_add_to_cart
                            ) || "0",
                        },
                        {
                          label: "Revenue (Gross)",
                          value:
                            storeCurrency +
                              formatNumber(
                                influencerAnalytics?.total_gross_revenue
                              ) || "0",
                        },
                        {
                          label: "Revenue (Net)",
                          value:
                            storeCurrency +
                              formatNumber(
                                influencerAnalytics?.total_net_revenue
                              ) || "0",
                        },
                        {
                          label: "Product Sales",
                          value:
                           storeCurrency +  formatNumber(
                              influencerAnalytics?.total_products_revenue
                            ) || "0",
                        },
                        {
                          label: "Total Shipping",
                          value:
                            storeCurrency + formatNumber(influencerAnalytics?.total_shipping) ||
                            "0",
                        },
                        {
                          label: "Total Taxes",
                          value:
                           storeCurrency +  formatNumber(influencerAnalytics?.total_tax) || "0",
                        },
                      ].map(({ label, value }) => (
                        <Card key={label}>
                          <BlockStack gap={200}>
                            <Text
                              as="p"
                              fontWeight="bold"
                              tone="subdued"
                              variant="bodyMd"
                            >
                              {label}
                            </Text>
                            <Text
                              as="h2"
                              tone="base"
                              variant="bodyLg"
                              fontWeight="bold"
                            >
                              {value}
                            </Text>
                          </BlockStack>
                        </Card>
                      ))}
                    </div>
                  </BlockStack>
                </Layout.Section>

                <Layout.Section variant="oneHalf">
                  <Card>
                    <BlockStack gap="200">
                      <InlineStack align="space-between">
                        <Text variant="bodyMd">Influencer Name</Text>
                        <Text variant="bodySm" as="h5">
                          {influencerInfo?.first_name}
                          {influencerInfo?.last_name || "-"}
                        </Text>
                      </InlineStack>

                      <InlineStack align="space-between">
                        <Text variant="bodyMd">Last Update</Text>
                        <Text variant="bodySm">
                          {moment(influencerInfo?.created_at).format("DD MMM YYYY") || "-"}
                        </Text>
                      </InlineStack>

                      <InlineStack align="space-between">
                        <Text variant="bodyMd">Email</Text>
                        <Text variant="bodySm">
                          {influencerInfo?.email || "-"}
                        </Text>
                      </InlineStack>

                      <InlineStack align="space-between">
                        <Text variant="bodyMd">Phone</Text>
                        <Text variant="bodySm">
                          {influencerInfo?.phone || "-"}
                        </Text>
                      </InlineStack>

                      <InlineStack align="space-between">
                        <Text variant="bodyMd">Status</Text>
                        <InlineStack align="end">
                          {influencerInfo?.status ? (
                            <Badge
                              tone={
                                influencerInfo.status.toLowerCase() === "active"
                                  ? "success"
                                  : "critical"
                              }
                            >
                              {influencerInfo.status.charAt(0).toUpperCase() +
                                influencerInfo.status.slice(1).toLowerCase()}
                            </Badge>
                          ) : (
                            <Text variant="bodyMd">-</Text>
                          )}
                        </InlineStack>
                      </InlineStack>

                      <InlineStack align="space-between">
                        <Text variant="bodyMd">Commission Rule</Text>
                        <Text tone="attention">
                          {influencerInfo?.commission_value
                            ? `${influencerInfo.commission_value}${
                                influencerInfo.commission_type === "2"
                                  ? "%"
                                  : influencerInfo.commission_type === "3"
                                  ? ` ${storeCurrency}`
                                  : ""
                              }`
                            : "-"}
                        </Text>
                      </InlineStack>

                      <InlineStack align="space-between">
                        <Text variant="bodyMd">Commission On</Text>
                        <Text tone="attention">
                          {influencerInfo?.commission_based_on
                            ? influencerInfo.commission_based_on.toLowerCase() ===
                              "1"
                              ? "Only Product Price"
                              : influencerInfo.commission_based_on.toLowerCase() ===
                                "2"
                              ? "Product Price + Tax"
                              : influencerInfo.commission_based_on.toLowerCase() ===
                                "3"
                              ? "Product Price + Shipping"
                              : influencerInfo.commission_based_on.toLowerCase() ===
                                "4"
                              ? "Total Order (Product + Shipping + Tax)"
                              : "-"
                            : "-"}
                        </Text>
                      </InlineStack>

                      <InlineStack align="space-between">
                        <Text variant="bodyMd">Commission Summary</Text>
                        <Button
                          onClick={handleChange}
                          variant="plain"
                          disabled={
                            !influencerCommission ||
                            influencerCommission?.commission_logs === 0
                          }
                        >
                          View
                        </Button>
                      </InlineStack>

                      <Modal
                        open={active}
                        onClose={handleChange}
                        title="Commission Summary"
                        size="large"
                      >
                        <div className="programTableName">
                          <Modal.Section>
                            <IndexTable
                              resourceName={{
                                singular: "commission",
                                plural: "commissions",
                              }}
                              itemCount={
                                influencerCommission?.commission_logs?.length ||
                                0
                              }
                              headings={[
                                { title: "Commission" },
                                { title: "Commission On" },
                                { title: "Created At" },
                                { title: "From Date" },
                                { title: "To Date" },
                                { title: "Total Commission", alignment: "end" },
                              ]}
                              selectable={false}
                            >
                              {influencerCommission?.commission_logs?.map(
                                (commission, index) => {
                                  const commissionValue =
                                    commission?.commission_value
                                      ? `${commission?.commission_value}${
                                          commission?.commission_type === "2"
                                            ? "%"
                                            : commission?.commission_type ===
                                              "3"
                                            ? " GBP"
                                            : ""
                                        }`
                                      : "0";

                                  const commissionOn =
                                    commission?.commission_based_on
                                      ? commission?.commission_based_on.toLowerCase() ===
                                        "1"
                                        ? "Only Product Price"
                                        : commission?.commission_based_on.toLowerCase() ===
                                          "2"
                                        ? "Product Price + Tax"
                                        : commission?.commission_based_on.toLowerCase() ===
                                          "3"
                                        ? "Product Price + Shipping"
                                        : commission?.commission_based_on.toLowerCase() ===
                                          "4"
                                        ? "Total Order (Product + Shipping + Tax)"
                                        : "-"
                                      : "1";

                                  return (
                                    <IndexTable.Row
                                      id={index.toString()}
                                      key={index}
                                      position={index}
                                    >
                                      <IndexTable.Cell>
                                        {commissionValue}
                                      </IndexTable.Cell>
                                      <IndexTable.Cell>
                                        {commissionOn}
                                      </IndexTable.Cell>
                                      <IndexTable.Cell>
                                        {moment(formatDate(commission?.created_at)).format("DD MMM YYYY")}
                                      </IndexTable.Cell>
                                      <IndexTable.Cell>
                                        {moment(formatDate(commission?.from_date)).format("DD MMM YYYY")}
                                      </IndexTable.Cell>
                                      <IndexTable.Cell>
                                        {formatDate(
                                          commission?.to_date || "current"
                                        )}
                                      </IndexTable.Cell>
                                      <IndexTable.Cell>
                                        <InlineStack align="end">
                                          {storeCurrency +formatNumber(
                                            commission?.total_commission_during_this
                                          )}
                                        </InlineStack>
                                      </IndexTable.Cell>
                                    </IndexTable.Row>
                                  );
                                }
                              )}
                            </IndexTable>
                          </Modal.Section>
                        </div>

                        {/* Footer */}
                        <div
                          style={{
                            borderTop: "1px solid #E1E3E5",
                            backgroundColor: "#f7f7f7",
                            padding: "1rem 0.7rem",
                          }}
                        >
                          <InlineStack align="space-between">
                            <Text variant="bodyLg" fontWeight="bold">
                              Total Commission
                            </Text>
                            <Text variant="bodyLg" fontWeight="bold">
                              {storeCurrency + formatNumber(
                                influencerCommission?.total_commission
                              )}
                            </Text>
                          </InlineStack>
                        </div>
                      </Modal>
                    </BlockStack>
                  </Card>
                </Layout.Section>
              </Layout>
            </>

            <InlineStack gap={400} align="space-between">
              <InlineStack gap={200} blockAlign="center">
                <Icon source={ChartVerticalFilledIcon} tone="base" />
                <Text variant="bodyLg" as="h3" fontWeight="bold">
                  Analytics
                </Text>
              </InlineStack>
            </InlineStack>

            <Layout>
              <Layout.Section>
                <Card>
                  <BlockStack gap={300}>
                    <Text variant="bodyMd" fontWeight="bold">
                      Click Analytics
                    </Text>
                    <div className="Polaris-Box">{initClickAnalyticsChart()}</div>
                  </BlockStack>
                </Card>
              </Layout.Section>

              <Layout.Section>
                <Layout>
                  <Layout.Section variant="oneHalf">
                    <Card>
                      <BlockStack gap={200}>
                        <InlineStack gap={100}>
                          <Text variant="bodyMd" fontWeight="bold">
                            Devices
                          </Text>
                          <Tooltip
                            content={`The Device Analytics of Total clicks as well as Total Add to cart`}
                          >
                            <Icon tone="base" source={InfoIcon} />
                          </Tooltip>
                        </InlineStack>

                        <div className="Polaris-Box">{initDeviceUsageChart()}</div>
                      </BlockStack>
                    </Card>
                  </Layout.Section>

                  <Layout.Section variant="oneHalf">
                    <Card>
                      <BlockStack gap={300}>
                        <InlineStack gap={100}>
                          <Text variant="bodyMd" fontWeight="bold">
                            Platforms
                          </Text>
                          <Tooltip
                            content={`The Platform Analytics of Total clicks as well as Total Add to cart`}
                          >
                            <Icon tone="base" source={InfoIcon} />
                          </Tooltip>
                        </InlineStack>

                        <div className="Polaris-Box">
                          {PlatformsAnalyticsChart()}
                        </div>
                      </BlockStack>
                    </Card>
                  </Layout.Section>
                </Layout>
              </Layout.Section>
            </Layout>
          </BlockStack>
        </div>
      )}
    </>
  );
}

export default Overview;
