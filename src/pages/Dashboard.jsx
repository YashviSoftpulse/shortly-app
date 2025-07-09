import React, { useState, useEffect } from "react";
import {
  Page,
  Card,
  Layout,
  Text,
  InlineGrid,
  Icon,
  BlockStack,
  Thumbnail,
  Banner,
  Tooltip,
  InlineStack,
  Link,
  Button,
  Box,
} from "@shopify/polaris";
import Highcharts from "highcharts";
import moment from "moment";
import HC_patternFill from "highcharts-pattern-fill";
import {
  CartDownFilledIcon,
  CashDollarFilledIcon,
  CursorFilledIcon,
  DeliveryFilledIcon,
  InfoIcon,
} from "@shopify/polaris-icons";
import { fetchData, getApiURL } from "../action";
import ChromeIcon from "/assets/Chrome.svg";
import FirefoxIcon from "/assets/Firefox.svg";
import MicrosoftEdgeIcon from "/assets/Microsoft-Edge.svg";
import OperaIcon from "/assets/Opera.svg";
import SafariIcon from "/assets/Safari.svg";
import SamsunginternetIcon from "/assets/Samsung-internet.svg";
import BraveIcon from "/assets/Brave.svg";
import MicrosoftExplore from "/assets/MicrosoftExplore.svg";
import UC_BrowserIcon from "/assets/UC_Browser.svg";
import Nodata from "/assets/Nodata.svg";
import SkeletonPage_Cmp from "../components/SkeletonPage";
import {
  BarChart,
  DonutChart,
  LineChart,
  SimpleBarChart,
} from "@shopify/polaris-viz";
import "@shopify/polaris-viz/build/esm/styles.css";
import { DateRangePicker } from "../components";
import { useApiData } from "../components/ApiDataProvider";
import { useNavigate } from "react-router-dom";
HC_patternFill(Highcharts);

function Dashboard() {
  const [vistorAnalytics, setVisitorAnalytics] = useState([]);
  const getLast30DaysRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return { start, end };
  };
  const [selectedDates, setSelectedDates] = useState(getLast30DaysRange());
  const [isLoading, setIsLoading] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState([]);
  const [htmlContent, setHtmlContent] = useState("");
  const navigate = useNavigate();

  const { data, loading, error } = useApiData();
  const handleDateRangeChange = (value) => {
    if (value && value.start && value.end) {
      setSelectedDates({
        start: new Date(value.start),
        end: new Date(value.end),
      });
    } else {
      console.error("Invalid date range selected");
    }
  };

  const changeFormat = (val) => {
    return moment(val).format("yyyy-MM-DD");
  };

  const getAnalyticsData = async () => {
    const formdata = new FormData();
    formdata.append("start_date", changeFormat(selectedDates.start));
    formdata.append("end_date", changeFormat(selectedDates.end));
    setIsLoading(true);
    const response = await fetchData(getApiURL("analytics"), formdata);
    if (response?.status === true) {
      setVisitorAnalytics(response.data);
    }
    setIsLoading(false);
  };

  const icons = {
    Chrome: ChromeIcon,
    Firefox: FirefoxIcon,
    Edge: MicrosoftEdgeIcon,
    Safari: SafariIcon,
    UCBrowser: UC_BrowserIcon,
    Brave: BraveIcon,
    Opera: OperaIcon,
    SamsungBrowser: SamsunginternetIcon,
    MicrosoftInternetExplorer: MicrosoftExplore,
  };

  const deshboardSetup = async () => {
    setIsLoading(true);
    const fetchApi = await fetchData(getApiURL("app_status"));
    if (fetchApi?.status === true) {
      setBannerDismissed(fetchApi.extension_banner);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getAnalyticsData();
    deshboardSetup();
    // fetchVacationContent()
  }, [selectedDates]);

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
        // state={data.length === 0 ? "Error" : "Success"}
      />
    );
  };

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
  const fetchVacationContent = async () => {
    const response = await fetchData(getApiURL("holiday"));
    if (response?.status === true) {
      setHtmlContent(response?.html);
    }
  };
  const initBrowserAnalyticsChart = () => {
    const categories = Object.entries(vistorAnalytics?.browsers || {}).map(
      ([name, value], index) => ({
        name: name,
        data: [
          {
            key: name,
            value: value,
          },
        ],
      })
    );

    return categories.length === 0 ? (
      <div className="fade-in-slide-up">
        <BlockStack inlineAlign="center">
          <Thumbnail source={Nodata} alt="No Data Found" size="large" />
          <Text variant="bodyXs" tone="subdued" alignment="center">
            There was no data found for this date range.
          </Text>
        </BlockStack>
      </div>
    ) : (
      <DonutChart legendPosition="left" data={categories} theme="Light" />
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
  const citiesChart = () => {
    const categories = Object.entries(vistorAnalytics?.cities || {}).map(
      ([name, value], index) => ({
        name: name,
        data: [
          {
            key: name,
            value: value,
          },
        ],
      })
    );

    return categories.length === 0 ? (
      <div className="fade-in-slide-up">
        <BlockStack inlineAlign="center">
          <Thumbnail source={Nodata} alt="No Data Found" size="large" />
          <Text variant="bodyXs" tone="subdued" alignment="center">
            There was no data found for this date range.
          </Text>
        </BlockStack>
      </div>
    ) : (
      <DonutChart
        legendPosition="left"
        data={categories}
        theme="Light"
        state={categories.length === 0 ? "Error" : "Success"}
      />
    );
  };
  const initStatesChart = () => {
    const categories = Object.entries(vistorAnalytics?.states || {}).map(
      ([name, value], index) => ({
        name: name,
        data: [
          {
            key: name,
            value: value,
          },
        ],
      })
    );

    return categories.length === 0 ? (
      <div className="fade-in-slide-up">
        <BlockStack inlineAlign="center">
          <Thumbnail source={Nodata} alt="No Data Found" size="large" />
          <Text variant="bodyXs" tone="subdued" alignment="center">
            There was no data found for this date range.
          </Text>
        </BlockStack>
      </div>
    ) : (
      <DonutChart
        legendPosition="left"
        data={categories}
        theme="Light"
        state={categories.length === 0 ? "Error" : "Success"}
      />
    );
  };
  const CountriesChart = () => {
    const categories = Object.entries(vistorAnalytics?.countries || {}).map(
      ([name, value], index) => ({
        name: name,
        data: [
          {
            key: name,
            value: value,
          },
        ],
      })
    );

    return categories.length === 0 ? (
      <div className="fade-in-slide-up">
        <BlockStack inlineAlign="center">
          <Thumbnail source={Nodata} alt="No Data Found" size="large" />
          <Text variant="bodyXs" tone="subdued" alignment="center">
            There was no data found for this date range.
          </Text>
        </BlockStack>
      </div>
    ) : (
      <DonutChart legendPosition="left" data={categories} theme="Light" />
    );
  };
  function formatNumber(value) {
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(2) + "B";
    } else if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + "M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(2) + "K";
    } else {
      return value?.toLocaleString();
    }
  }
  return isLoading && loading ? (
    <SkeletonPage_Cmp />
  ) : (
    <Page
      title="Dashboard"
      primaryAction={
        <DateRangePicker
          onDateRangeSelect={handleDateRangeChange}
          value={selectedDates}
        />
      }
    >
      <Layout>
        {htmlContent && (
          <Layout.Section>
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </Layout.Section>
        )}

        {bannerDismissed?.status === true && (
          <Layout.Section>
            <Banner
              title={bannerDismissed?.title}
              tone="warning"
              action={{
                content: bannerDismissed?.button?.label,
                url: bannerDismissed?.button?.link,
                target: "_blank",
              }}
            >
              <p>{bannerDismissed?.desc}</p>
            </Banner>
          </Layout.Section>
        )}
        <Layout.Section>
          <InlineGrid columns={4} gap={400}>
            <Card>
              {!data?.plan_details?.features?.total_clicks_dashboard && (
                <div class="premium-plan">
                  <p>
                    View total clicks with
                    <Button
                      size="slim"
                      onClick={() =>
                        navigate(`/plans${window.location.search}`)
                      }
                      icon={
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 6L7 12L12 6L17 12L21 6V20H3V6Z"
                            fill="#FFD700"
                            stroke="#FFD700"
                            strokeWidth="2"
                          />
                        </svg>
                      }
                    >
                      Upgrade Plan
                    </Button>
                  </p>
                </div>
              )}

              <div
                className="Polaris-InlineGrid dashbord-icon"
                style={{
                  "--pc-inline-grid-grid-template-columns-xs":
                    " minmax(0, 0.5fr) minmax(0, 2fr)",
                  "--pc-inline-grid-gap-xs": "var(--p-space-400)",
                  ...(!data?.plan_details?.features?.total_clicks_dashboard && {
                    filter: "blur(3px)",
                    opacity: 0.2,
                  }),
                }}
              >
                <Icon source={CursorFilledIcon} size="large" tone="info" />
                <BlockStack gap={200}>
                  <Text as="h2" tone="subdued" variant="headingSm">
                    TOTAL CLICKS
                  </Text>
                  {vistorAnalytics?.total_clicks === null ? (
                    <SkeletonBodyText />
                  ) : (
                    <Text as="h4" variant="headingLg">
                      {formatNumber(vistorAnalytics?.total_clicks)}
                    </Text>
                  )}
                </BlockStack>
              </div>
            </Card>
            <Card>
              {!data?.plan_details?.features?.total_add_to_cart_dashboard && (
                <div class="premium-plan">
                  <p>
                    View total add to cart with
                    <Button
                      size="slim"
                      onClick={() =>
                        navigate(`/plans${window.location.search}`)
                      }
                      icon={
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 6L7 12L12 6L17 12L21 6V20H3V6Z"
                            fill="#FFD700"
                            stroke="#FFD700"
                            strokeWidth="2"
                          />
                        </svg>
                      }
                    >
                      Upgrade Plan
                    </Button>
                  </p>
                </div>
              )}
              <div
                className="Polaris-InlineGrid dashbord-icon"
                style={{
                  "--pc-inline-grid-grid-template-columns-xs":
                    " minmax(0, 0.5fr) minmax(0, 2fr)",
                  "--pc-inline-grid-gap-xs": "var(--p-space-400)",
                  ...(!data?.plan_details?.features
                    ?.total_add_to_cart_dashboard && {
                    filter: "blur(3px)",
                    opacity: 0.2,
                  }),
                }}
              >
                <Icon source={CartDownFilledIcon} size="large" tone="info" />
                <InlineGrid gap={200}>
                  <Text as="h2" tone="subdued" variant="headingSm">
                    TOTAL ADD TO CART
                  </Text>

                  <Text as="h4" variant="headingLg">
                    {formatNumber(vistorAnalytics?.total_add_to_cart)}
                  </Text>
                </InlineGrid>
              </div>
            </Card>
            <Card>
              {!data?.plan_details?.features?.total_checkouts_dashboard && (
                <div class="premium-plan">
                  <p>
                    View total checkouts with
                    <Button
                      size="slim"
                      onClick={() =>
                        navigate(`/plans${window.location.search}`)
                      }
                      icon={
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 6L7 12L12 6L17 12L21 6V20H3V6Z"
                            fill="#FFD700"
                            stroke="#FFD700"
                            strokeWidth="2"
                          />
                        </svg>
                      }
                    >
                      Upgrade Plan
                    </Button>
                  </p>
                </div>
              )}
              <div
                className="Polaris-InlineGrid dashbord-icon"
                style={{
                  "--pc-inline-grid-grid-template-columns-xs":
                    " minmax(0, 0.5fr) minmax(0, 2fr)",
                  "--pc-inline-grid-gap-xs": "var(--p-space-400)",
                  ...(!data?.plan_details?.features
                    ?.total_checkouts_dashboard && {
                    filter: "blur(3px)",
                    opacity: 0.2,
                  }),
                }}
              >
                <Icon source={DeliveryFilledIcon} size="large" tone="info" />
                <BlockStack gap={200}>
                  <Text as="h2" tone="subdued" variant="headingSm">
                    TOTAL CHECKOUTS
                  </Text>

                  <Text as="h4" variant="headingLg">
                    {formatNumber(vistorAnalytics?.total_checkout)}
                  </Text>
                </BlockStack>
              </div>
            </Card>
            <Card>
              {!data?.plan_details?.features?.total_sales_dashboard && (
                <div class="premium-plan">
                  <p>
                    View total sales with
                    <Button
                      size="slim"
                      onClick={() =>
                        navigate(`/plans${window.location.search}`)
                      }
                      icon={
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 6L7 12L12 6L17 12L21 6V20H3V6Z"
                            fill="#FFD700"
                            stroke="#FFD700"
                            strokeWidth="2"
                          />
                        </svg>
                      }
                    >
                      Upgrade Plan
                    </Button>
                  </p>
                </div>
              )}
              <div
                className="Polaris-InlineGrid dashbord-icon"
                style={{
                  "--pc-inline-grid-grid-template-columns-xs":
                    " minmax(0, 0.5fr) minmax(0, 2fr)",
                  "--pc-inline-grid-gap-xs": "var(--p-space-400)",
                  ...(!data?.plan_details?.features
                    ?.click_analytics_dashboard && {
                    filter: "blur(3px)",
                    opacity: 0.2,
                  }),
                }}
              >
                <Icon source={CashDollarFilledIcon} size="large" tone="info" />
                <BlockStack gap={200}>
                  <Text as="h2" tone="subdued" variant="headingSm">
                    TOTAL SALES
                  </Text>

                  <Text as="h4" variant="headingLg">
                    {formatNumber(vistorAnalytics?.total_sales)}
                  </Text>
                </BlockStack>
              </div>
            </Card>
          </InlineGrid>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap={300}>
              <Text variant="headingMd">Click Analytics</Text>
              {!data?.plan_details?.features?.click_analytics_dashboard && (
                <div class="premium-plan">
                  <p>
                    Get more insight with{" "}
                    <Button
                      size="slim"
                      onClick={() =>
                        navigate(`/plans${window.location.search}`)
                      }
                      icon={
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 6L7 12L12 6L17 12L21 6V20H3V6Z"
                            fill="#FFD700"
                            stroke="#FFD700"
                            strokeWidth="2"
                          />
                        </svg>
                      }
                    >
                      Upgrade Plan
                    </Button>
                  </p>
                </div>
              )}

              <div
                class="Polaris-Box"
                style={{
                  ...(!data?.plan_details?.features
                    ?.click_analytics_dashboard && {
                    filter: "blur(3px)",
                    opacity: 0,
                    pointerEvents: "none",
                  }),
                }}
              >
                {initClickAnalyticsChart()}
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Layout>
            <Layout.Section variant="oneHalf">
              <Card>
                <BlockStack gap={200}>
                  <InlineStack gap={100}>
                    <Text variant="headingMd">Devices </Text>
                    <Tooltip
                      content={`The Device Analytics of Total clicks as well as Total Add to cart`}
                    >
                      <Icon tone="base" source={InfoIcon} />
                    </Tooltip>
                  </InlineStack>
                  {!data?.plan_details?.features
                    ?.device_analytics_dashboard && (
                    <div class="premium-plan">
                      <p>
                        Get more insight with{" "}
                        <Button
                          size="slim"
                          onClick={() =>
                            navigate(`/plans${window.location.search}`)
                          }
                          icon={
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                              style={{ display: "block" }}
                            >
                              <path
                                d="M3 6L7 12L12 6L17 12L21 6V20H3V6Z"
                                fill="gold"
                                stroke="gold"
                                strokeWidth="2"
                              />
                            </svg>
                          }
                        >
                          Upgrade Plan
                        </Button>
                      </p>
                    </div>
                  )}
                  <div
                    class="Polaris-Box"
                    style={{
                      ...(!data?.plan_details?.features
                        ?.device_analytics_dashboard && {
                        filter: "blur(3px)",
                        opacity: 0,
                        pointerEvents: "none",
                      }),
                    }}
                  >
                    {initDeviceUsageChart()}
                  </div>
                </BlockStack>
              </Card>
            </Layout.Section>

            {/* <Layout.Section variant="oneHalf">
              <div
                className="Polaris-ShadowBevel"
                style={{
                  "--pc-shadow-bevel-z-index": 32,
                  "--pc-shadow-bevel-content-xs": "",
                  "--pc-shadow-bevel-box-shadow-xs": "var(--p-shadow-100)",
                  "--pc-shadow-bevel-border-radius-xs":
                    "var(--p-border-radius-300)",
                }}
              >
                {!data?.plan_details?.features?.browser_analytics_dashboard && (
                  <div class="premium-plan">
                    <p>
                      Get more insight with{" "}
                      <Button
                        size="slim"
                        onClick={() => navigate(`/plans${window.location.search}`)}
                        icon={
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 6L7 12L12 6L17 12L21 6V20H3V6Z"
                              fill="#FFD700"
                              stroke="#FFD700"
                              strokeWidth="2"
                            />
                          </svg>
                        }
                      >
                        Upgrade Plan
                      </Button>
                    </p>
                  </div>
                )}
                <div
                  className="Polaris-Box"
                  style={{
                    "--pc-box-background": "var(--p-color-bg-surface)",
                    "--pc-box-min-height": "100%",
                    "--pc-box-overflow-x": "clip",
                    "--pc-box-overflow-y": "clip",
                    "--pc-box-padding-block-start-xs": "var(--p-space-400)",
                    "--pc-box-padding-block-end-xs": "var(--p-space-400)",
                    "--pc-box-padding-inline-start-xs": "var(--p-space-400)",
                    "--pc-box-padding-inline-end-xs": "var(--p-space-400)",
                    ...(!data?.plan_details?.features
                      ?.browser_analytics_dashboard && {
                      filter: "blur(3px)",opacity: 0.2,
                    }),
                  }}
                >
                  <BlockStack gap={200}>
                    <Text variant="headingMd">Browsers</Text>
                    {initBrowserAnalyticsChart()}
                  </BlockStack>
                </div>
              </div>
            </Layout.Section> */}

            <Layout.Section>
              <Card>
                <BlockStack gap={300}>
                  <InlineStack gap={100}>
                    <Text variant="headingMd">Platforms</Text>
                    <Tooltip
                      content={`The Platform Analytics of Total clicks as well as Total Add to cart`}
                    >
                      <Icon tone="base" source={InfoIcon} />
                    </Tooltip>
                  </InlineStack>
                  {!data?.plan_details?.features
                    ?.platform_analytics_dashboard && (
                    <div class="premium-plan">
                      <p>
                        Get more insight with{" "}
                        <Button
                          size="slim"
                          onClick={() =>
                            navigate(`/plans${window.location.search}`)
                          }
                          icon={
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3 6L7 12L12 6L17 12L21 6V20H3V6Z"
                                fill="#FFD700"
                                stroke="#FFD700"
                                strokeWidth="2"
                              />
                            </svg>
                          }
                        >
                          Upgrade Plan
                        </Button>
                      </p>
                    </div>
                  )}
                  <div
                    class="Polaris-Box"
                    style={{
                      ...(!data?.plan_details?.features
                        ?.platform_analytics_dashboard && {
                        filter: "blur(3px)",
                        opacity: 0,
                        pointerEvents: "none",
                      }),
                    }}
                  >
                    {PlatformsAnalyticsChart()}
                  </div>
                </BlockStack>
              </Card>
            </Layout.Section>
            <Layout.Section></Layout.Section>
          </Layout>

          {/* <Layout>
            <Layout.Section variant="oneThird">
              <div
                className="Polaris-ShadowBevel"
                style={{
                  "--pc-shadow-bevel-z-index": 32,
                  "--pc-shadow-bevel-content-xs": "",
                  "--pc-shadow-bevel-box-shadow-xs": "var(--p-shadow-100)",
                  "--pc-shadow-bevel-border-radius-xs":
                    "var(--p-border-radius-300)",
                }}
              >
                {!data?.plan_details?.features
                  ?.location_analytics_dashboard && (
                  <div class="premium-plan">
                    <p>
                      Get more insight with{" "}
                      <Button
                        size="slim"
                        onClick={() => navigate(`/plans${window.location.search}`)}
                        icon={
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 6L7 12L12 6L17 12L21 6V20H3V6Z"
                              fill="#FFD700"
                              stroke="#FFD700"
                              strokeWidth="2"
                            />
                          </svg>
                        }
                      >
                        Upgrade Plan
                      </Button>
                    </p>
                  </div>
                )}
                <div
                  className="Polaris-Box"
                  style={{
                    "--pc-box-background": "var(--p-color-bg-surface)",
                    "--pc-box-min-height": "100%",
                    "--pc-box-overflow-x": "clip",
                    "--pc-box-overflow-y": "clip",
                    "--pc-box-padding-block-start-xs": "var(--p-space-400)",
                    "--pc-box-padding-block-end-xs": "var(--p-space-400)",
                    "--pc-box-padding-inline-start-xs": "var(--p-space-400)",
                    "--pc-box-padding-inline-end-xs": "var(--p-space-400)",
                    ...(!data?.plan_details?.features
                      ?.location_analytics_dashboard && {
                      filter: "blur(3px)",opacity: 0.2,
                    }),
                  }}
                >
                  <BlockStack gap={300}>
                    <Text variant="headingMd">Countries</Text>
                    {CountriesChart()}
                  </BlockStack>
                </div>
              </div>
            </Layout.Section>
            <Layout.Section variant="oneThird">
              <div
                className="Polaris-ShadowBevel"
                style={{
                  "--pc-shadow-bevel-z-index": 32,
                  "--pc-shadow-bevel-content-xs": "",
                  "--pc-shadow-bevel-box-shadow-xs": "var(--p-shadow-100)",
                  "--pc-shadow-bevel-border-radius-xs":
                    "var(--p-border-radius-300)",
                }}
              >
                {!data?.plan_details?.features
                  ?.location_analytics_dashboard && (
                  <div class="premium-plan">
                    <p>
                      Get more insight with{" "}
                      <Button
                        size="slim"
                        onClick={() => navigate(`/plans${window.location.search}`)}
                        icon={
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="gold"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 6L7 12L12 6L17 12L21 6V20H3V6Z"
                              stroke="gold"
                              strokeWidth="2"
                              fill="gold"
                            />
                          </svg>
                        }
                      >
                        Upgrade Plan
                      </Button>
                    </p>
                  </div>
                )}
                <div
                  className="Polaris-Box"
                  style={{
                    "--pc-box-background": "var(--p-color-bg-surface)",
                    "--pc-box-min-height": "100%",
                    "--pc-box-overflow-x": "clip",
                    "--pc-box-overflow-y": "clip",
                    "--pc-box-padding-block-start-xs": "var(--p-space-400)",
                    "--pc-box-padding-block-end-xs": "var(--p-space-400)",
                    "--pc-box-padding-inline-start-xs": "var(--p-space-400)",
                    "--pc-box-padding-inline-end-xs": "var(--p-space-400)",
                    ...(!data?.plan_details?.features
                      ?.location_analytics_dashboard && {
                      filter: "blur(3px)",opacity: 0.2,
                    }),
                  }}
                >
                  <BlockStack gap={200}>
                    <Text variant="headingMd">States</Text>
                    {initStatesChart()}
                  </BlockStack>
                </div>
              </div>
            </Layout.Section>
            <Layout.Section variant="oneThird">
              <div
                className="Polaris-ShadowBevel"
                style={{
                  "--pc-shadow-bevel-z-index": 32,
                  "--pc-shadow-bevel-content-xs": "",
                  "--pc-shadow-bevel-box-shadow-xs": "var(--p-shadow-100)",
                  "--pc-shadow-bevel-border-radius-xs":
                    "var(--p-border-radius-300)",
                }}
              >
                {!data?.plan_details?.features
                  ?.location_analytics_dashboard && (
                  <div class="premium-plan">
                    <p>
                      Get more insight with{" "}
                      <Button
                        size="slim"
                        onClick={() => navigate(`/plans${window.location.search}`)}
                        icon={
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="gold"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 6L7 12L12 6L17 12L21 6V20H3V6Z"
                              stroke="gold"
                              strokeWidth="2"
                              fill="gold"
                            />
                          </svg>
                        }
                      >
                        Upgrade Plan
                      </Button>
                    </p>
                  </div>
                )}
                <div
                  className="Polaris-Box"
                  style={{
                    "--pc-box-background": "var(--p-color-bg-surface)",
                    "--pc-box-min-height": "100%",
                    "--pc-box-overflow-x": "clip",
                    "--pc-box-overflow-y": "clip",
                    "--pc-box-padding-block-start-xs": "var(--p-space-400)",
                    "--pc-box-padding-block-end-xs": "var(--p-space-400)",
                    "--pc-box-padding-inline-start-xs": "var(--p-space-400)",
                    "--pc-box-padding-inline-end-xs": "var(--p-space-400)",
                    ...(!data?.plan_details?.features
                      ?.location_analytics_dashboard && {
                      filter: "blur(3px)",opacity: 0.2,
                    }),
                  }}
                >
                  <BlockStack gap={200}>
                    <Text variant="headingMd">Cities</Text>
                    {citiesChart()}
                  </BlockStack>
                </div>
              </div>
            </Layout.Section>

            <Layout.Section></Layout.Section>
          </Layout> */}
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default Dashboard;
