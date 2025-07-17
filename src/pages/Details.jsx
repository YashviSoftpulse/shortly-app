/* IMPORT REQUIRED MODULES START */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  TextField,
  Card,
  Page,
  InlineGrid,
  Text,
  BlockStack,
  Icon,
  Tooltip,
  Layout,
  InlineStack,
  Divider,
  Thumbnail,
  Box,
  Link,
  FormLayout,
} from "@shopify/polaris";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowDownIcon,
  CartDownFilledIcon,
  CashDollarFilledIcon,
  CheckIcon,
  ClipboardIcon,
  CursorFilledIcon,
  DeliveryFilledIcon,
  InfoIcon,
} from "@shopify/polaris-icons";
import { fetchData, getApiURL } from "../action";
import QRCode from "qrcode.react";
import ChromeIcon from "/assets/Chrome.svg";
import FirefoxIcon from "/assets/Firefox.svg";
import MicrosoftEdgeIcon from "/assets/Microsoft-Edge.svg";
import OperaIcon from "/assets/Opera.svg";
import SafariIcon from "/assets/Safari.svg";
import SamsunginternetIcon from "/assets/Samsung-internet.svg";
import BraveIcon from "/assets/Brave.svg";
import MicrosoftExplore from "/assets/MicrosoftExplore.svg";
import UC_BrowserIcon from "/assets/UC_Browser.svg";
import NoQrIcon from "/assets/no-qr.svg";
import HC_patternFill from "highcharts-pattern-fill";
import Highcharts from "highcharts";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { formatNumber, handleCopyClick, removeShopDomain } from "../utils";
import moment from "moment";
import {
  BarChart,
  DonutChart,
  LineChart,
  SimpleBarChart,
} from "@shopify/polaris-viz";
import Nodata from "/assets/Nodata.svg";
import SkeletonPage_Cmp from "../components/SkeletonPage";
import { useApiData } from "../components/ApiDataProvider";
import ConfirmationModal from "../components/listing/ConfirmationModal";
import { DateRangePicker } from "../components";
HC_patternFill(Highcharts);
/* IMPORT REQUIRED MODULES END */

/* DETAILS FUNCTIONAL COMPONENT START */
function Details() {
  const [withShopURL, setWithShopURL] = useState("");
  const [customURL, setCustomURL] = useState(undefined);
  const [dataTitle, setDataTitle] = useState("");
  const [generateLoader, setGenerateLoader] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [productAnalytics, setProductAnalytics] = useState([]);
  const [influencerProductAnalytics, setInfluencerProductAnalytics] = useState(
    []
  );
  const [copiedItems, setCopiedItems] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const { data, loading, error } = useApiData();
  const storedData = JSON.parse(sessionStorage.getItem("detailsData"));
  var productsData = storedData?.productsData;
  var title = storedData?.title;
  var type = storedData?.type;
  var selectedTab = storedData?.selectedTab;
  var queryValue = storedData?.queryValue;
  var isPageType = storedData?.isPageType;
  var limit = storedData?.limit;
  var nextData = storedData?.nextData;
  var previousData = storedData?.previousData;
  var APIPath = storedData?.APIPath;
  var influencerID = storedData?.influencerID;
  var storeCurrency = storedData?.storeCurrency;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegenerate, setIsRegenerate] = useState(storedData?.regenerate);
  const [pageNumber, setPageNumber] = useState(
    parseInt(storedData?.pageNumber)
  );
  const [productId, setProductId] = useState(storedData?.productId);
  const [isLoading, setIsLoading] = useState(false);
  const [responseData, setResponseData] = useState(productsData || []);
  const urlParams = new URLSearchParams(window.location.search);
  const SHOP = urlParams.get("shop");
  const qrCodeRef = useRef(null);
  const checkAPIForAnalytics =
    APIPath === "influencer-analytics"
      ? influencerProductAnalytics
      : productAnalytics;

  const getLast30DaysRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return { start, end };
  };
  const [selectedDates, setSelectedDates] = useState(getLast30DaysRange());

  const handleCopy = (text, itemId) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Show checkmark icon immediately for better UX
        setCopiedItems((prev) => ({ ...prev, [itemId]: true }));

        // Show toast notification
        shopify.toast.show("Copied to Clipboard", { duration: 3000 });

        // Return to clipboard icon after 1.5 seconds (faster response)
        setTimeout(() => {
          setCopiedItems((prev) => ({ ...prev, [itemId]: false }));
        }, 1500);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        shopify.toast.show("Failed to copy to clipboard", {
          duration: 3000,
          isError: true,
        });
      });
  };

  const reloardProductList = async (state, page) => {
    const shopifyurl = responseData?.[productId]?.shopify_url;
    const data = new FormData();
    data.append("limit", limit);
    if (queryValue) data.append("search", queryValue);
    if (APIPath === "redirect_list_V2") {
      data.append("page", page);
    } else {
      if (isPageType === "previous") data.append("previousPage", previousData);
      else if (isPageType === "next") data.append("nextPage", nextData);
    }
    let response = await fetchData(getApiURL(APIPath), data);
    if (response?.status === true) {
      const index = response?.data?.findIndex(
        (obj) => obj.shopify_url === shopifyurl && obj.title === title
      );
      if (index === -1) {
        let temp = data?.get("page");
        temp = parseInt(temp) + 1;
        reloardProductList(state, temp);
        return false;
      }

      setProductId(index);
      if (state) {
        setWithShopURL(null);
        setCustomURL(generateRandomString(12));
        let data = response?.data;
        data[index].short_link = null;
        data[index].custom_url = null;
        data[index].qr_code = null;
        setResponseData(data);
      } else {
        setResponseData(response?.data);
        setWithShopURL(removeShopDomain(response?.data?.[index]?.short_link));
        setCustomURL(
          removeShopDomain(response?.data?.[index]?.custom_url) ||
            generateRandomString(12)
        );
      }
    }
  };

  const showErrorMessage = (url, type) => {
    const regex = /^[a-zA-Z0-9-]+$/;
    if (type === "Short URL") {
      if (!url) return `${type} is required`;
      if (url?.length <= 4) return `${type} is too short`;

      if (url?.length > 12)
        return `${type} is too long. Limit it to 12 characters`;
    }

    if (url && !regex.test(url))
      return `${type} must contain only letters, numbers and dashes.`;
    return false;
  };

  /* GENERATE URL HANDLER START */
  const handleGenerate = async () => {
    const shortUrlError = showErrorMessage(customURL, "Short URL");
    if (shortUrlError) {
      shopify.toast.show(shortUrlError, { duration: 3000, isError: true });
      return false;
    }

    const customUrlError = showErrorMessage(withShopURL, "Custom URL");
    if (customUrlError) {
      shopify.toast.show(customUrlError, { duration: 3000, isError: true });
      return false;
    }
    setGenerateLoader(true);
    if (isRegenerate === true) {
      const deleteData = new FormData();
      deleteData.append(
        "shopify_url",
        removeShopDomain(
          productsData[productId]?.onlineStorePreviewUrl,
          productsData[productId]?.shopify_url
        )
      );
      const deleteResponse = await fetchData(
        getApiURL("delete_url_redirect"),
        deleteData
      );
      if (deleteResponse?.status === true) setIsRegenerate(false);
    }

    let newUrl = removeShopDomain(
      responseData?.[productId]?.onlineStorePreviewUrl,
      responseData?.[productId]?.shopify_url
    );
    const formdata = new FormData();
    formdata.append("target", newUrl);
    formdata.append(
      "internal_title",
      dataTitle || responseData?.[productId]?.title
    );
    formdata.append("type", type);
    if (
      withShopURL !== null &&
      withShopURL !== undefined &&
      withShopURL !== "" &&
      !removeShopDomain(responseData?.[productId]?.short_link, "") &&
      data?.plan_details?.features?.short_url_create
    )
      formdata.append("path", withShopURL?.trim()?.replace(" ", "_"));
    if (
      customURL !== null &&
      customURL !== undefined &&
      customURL !== "" &&
      !removeShopDomain(responseData?.[productId]?.custom_url, "") &&
      data?.plan_details?.features?.custom_url_create
    )
      formdata.append("custom_url", customURL?.trim()?.replace(" ", "_"));
    if (
      data?.plan_details?.features?.qr_code_create &&
      (responseData?.[productId]?.qr_code === null ||
        responseData?.[productId]?.qr_code === "" ||
        responseData?.[productId]?.qr_code === undefined)
    )
      formdata.append("qr_code", `qr=${generateRandomString(20)}`);
    const response = await fetchData(
      getApiURL("create_url_redirect"),
      formdata
    );
    setGenerateLoader(false);
    if (response.status === true) {
      reloardProductList(false, pageNumber);
      shopify.toast.show(response.message, { duration: 3000 });
      navigate(`/listing${window.location.search}`)
    } else {
      shopify.toast.show(response?.message, { duration: 3000, isError: true });
    }
  };
  /* GENERATE URL HANDLER END */

  /* DOWNLOAD QR CODE HANDLER START */
  const downloadQRCode = () => {
    if (qrCodeRef.current) {
      html2canvas(qrCodeRef.current, {
        scale: 2,
        backgroundColor: "#fff",
      })
        .then((canvas) => {
          canvas.toBlob((blob) => {
            saveAs(
              blob,
              `${(responseData?.[productId]?.title || "")
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, "")
                .replace(/\s+/g, "-")}-qrcode.jpg`
            );
          }, "image/jpeg");
        })
        .catch((err) => {
          console.error("Error generating the canvas:", err);
        });
    } else {
      console.error("qrCodeRef is null");
    }
  };
  /* DOWNLOAD QR CODE HANDLER END */

  const generateRandomString = (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  useEffect(() => {
    if (APIPath !== "influencer-analytics") {
      reloardProductList(isRegenerate, pageNumber);
    }
    if (responseData?.[productId]?.title) {
      setDataTitle(responseData?.[productId]?.title);
    }
  }, []);

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

  useEffect(() => {
    if (selectedTab !== undefined) {
      sessionStorage?.setItem("selectedTab", selectedTab);
    }

    if (APIPath === "influencer-analytics") {
      influncerAnaliytics();
    } else {
      analiytics();
    }
  }, [selectedTab, selectedDates]);

  const analiytics = async () => {
    setIsLoading(true);
    const target =
      responseData?.[productId]?.onlineStorePreviewUrl ||
      responseData?.[productId]?.shopify_url;
    let newUrl = target?.replace(`https://${SHOP}`, "");
    const data = new FormData();
    data.append("start_date", changeFormat(selectedDates.start));
    data.append("end_date", changeFormat(selectedDates.end));
    data.append("shopify_url", newUrl);
    const response = await fetchData(getApiURL("analytics"), data);
    if (response.status === true) {
      setProductAnalytics(response?.data);
    }
    setIsLoading(false);
  };

  const influncerAnaliytics = async () => {
    setIsLoading(true);
    const target =
      responseData?.[productId]?.onlineStorePreviewUrl ||
      responseData?.[productId]?.shopify_url;
    let newUrl = target?.replace(`https://${SHOP}`, "");
    const data = new FormData();
    data.append("uid", influencerID);
    data.append("start_date", changeFormat(selectedDates.start));
    data.append("end_date", changeFormat(selectedDates.end));
    data.append("shopify_url", newUrl);
    const response = await fetchData(getApiURL("influencer-analytics"), data);

    if (response.status === true) {
      setInfluencerProductAnalytics(response?.data);
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

  const initClickAnalyticsChart = () => {
    const { x_axis = [], y_axis = [] } = checkAPIForAnalytics?.chart || {};
    const clicks = x_axis.map((date, index) => {
      const utcDate = moment.utc(date);
      const localDate = utcDate.local().format("YYYY-MM-DD HH:mm:ss");
      return {
        key: date?.includes(":") ? localDate : date,
        value: y_axis[index],
      };
    });

    return clicks.length === 0 ? (
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
            data: data?.plan_details?.features?.click_analytics_product_page
              ? clicks
              : [],
            name: "Clicks",
          },
        ]}
        theme="Light"
      />
    );
  };

  const PlatformsAnalyticsChart = () => {
    const platforms = checkAPIForAnalytics?.platforms || {};
    const platform = Object.entries(platforms).map(([name, value]) => ({
      key: name,
      value: value,
    }));

    return platform.length === 0 ? (
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
            data: data?.plan_details?.features?.platform_analytics_product_page
              ? platform
              : [{}],
            name: "Platform",
          },
        ]}
        theme="Light"
      />
    );
  };

  const initDeviceUsageChart = () => {
    const platforms = checkAPIForAnalytics?.devices || {};
    const devices = Object.entries(platforms).map(([name, value]) => ({
      key: name,
      value: value,
    }));

    return devices.length === 0 ? (
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
            data: data?.plan_details?.features?.device_analytics_product_page
              ? devices
              : [{}],
            name: "Device",
          },
        ]}
        theme="Light"
      />
    );
  };

  const initBrowserAnalyticsChart = () => {
    const categories = Object.entries(checkAPIForAnalytics?.browsers || {}).map(
      ([name, value]) => ({
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

  const citiesChart = () => {
    const categories = Object.entries(checkAPIForAnalytics?.cities || {}).map(
      ([name, value]) => ({
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
    const categories = Object.entries(checkAPIForAnalytics?.states || {}).map(
      ([name, value]) => ({
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

  let utmData = {};
  try {
    utmData = JSON.parse(productsData[productId]?.utm_datas || {});
  } catch (e) {
    console.error("Invalid JSON in utm_datas");
  }

  const utmQueryString = Object.entries(utmData).length
    ? Object.entries(utmData)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        )
        .join("&")
    : "";

  let qrQueryParams = `?${productsData[productId]?.qr_code || ""}`;

  if (influencerID) {
    qrQueryParams += `&refby=${influencerID}`;
  }

  if (utmQueryString) {
    qrQueryParams += `&${utmQueryString}`;
  }

  const buildQueryParams = (baseURL, type = "shopify") => {
    let domainPrefix = "";
    if (type === "custom") {
      domainPrefix = `https://${SHOP}/`;
    } else if (type === "short") {
      domainPrefix = `srtr.me/`;
    } else {
      domainPrefix = `https://${SHOP}/`;
    }

    return `${domainPrefix}${baseURL}`;
  };

  const validUtmEntries = Object.entries(utmData || {}).filter(
    ([key, value]) => value?.trim() !== ""
  );

  const CountriesChart = () => {
    const categories = Object.entries(
      checkAPIForAnalytics?.countries || {}
    ).map(([name, value]) => ({
      name: name,
      data: [
        {
          key: name,
          value: value,
        },
      ],
    }));

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

  const calculateHeight = (type) => {
    if (type == "blank") {
      if (
        showErrorMessage(withShopURL, "Custom URL") &&
        showErrorMessage(customURL, "Short URL")
      )
        return { height: "18.5rem" };
      if (
        showErrorMessage(withShopURL, "Custom URL") ||
        showErrorMessage(customURL, "Short URL")
      )
        return { height: "17rem" };
    } else {
      if (
        showErrorMessage(withShopURL, "Custom URL") &&
        showErrorMessage(customURL, "Short URL")
      )
        return { height: "15rem" };
      if (
        showErrorMessage(withShopURL, "Custom URL") ||
        showErrorMessage(customURL, "Short URL")
      )
        return {
          height:
            APIPath === "influencer-analytics" && validUtmEntries.length === 0
              ? "8.8rem"
              : "13.6rem",
        };
    }
  };

  const deleteUrl = async () => {
    setIsDeleting(true);
    const data = new FormData();
    data.append(
      "shopify_url",
      removeShopDomain(
        responseData[productId]?.onlineStorePreviewUrl,
        responseData[productId]?.shopify_url
      )
    );
    const response = await fetchData(getApiURL("delete_url_redirect"), data);
    setIsDeleteModal(false);
    if (response?.status === true) {
      setIsDeleting(false);
      shopify.toast.show(response?.message, { duration: 3000 });
      navigate({ pathname: "/listing", search: window.location.search });
    } else {
      setIsDeleting(false);
      shopify.toast.show(response?.message, { duration: 3000, isError: true });
    }
  };

  const shortURLRef = useRef(null);

  useEffect(() => {
    if (shortURLRef.current) {
      shortURLRef.current.addEventListener("input", function (e) {
        var defaultText = withShopURL,
          defaultTextLength = defaultText.length;
        if (
          this.selectionStart === this.selectionEnd &&
          this.selectionStart < defaultTextLength
        ) {
          this.value = defaultText;
        }
      });
    }
  }, [withShopURL]);

  return isLoading ? (
    <SkeletonPage_Cmp />
  ) : (
    <Page
      title={title}
      backAction={{
        content: "listing",
        onAction: () => {
          sessionStorage.setItem("influencerTab", "links");
          navigate(-1);
        },
      }}
      primaryAction={
        !removeShopDomain(responseData[productId]?.short_link) ||
        !removeShopDomain(responseData[productId]?.custom_url) ? (
          !removeShopDomain(responseData[productId]?.short_link) &&
          !removeShopDomain(responseData[productId]?.custom_url) ? (
            <Button
              variant="primary"
              loading={generateLoader}
              onClick={() => handleGenerate()}
            >
              Generate
            </Button>
          ) : (
            APIPath !== "influencer-analytics" && (
              <Button
                variant="primary"
                loading={generateLoader}
                onClick={() => handleGenerate()}
              >
                Save
              </Button>
            )
          )
        ) : (
          <Button
            tone="critical"
            variant="primary"
            accessibilityLabel="delete"
            onClick={() => setIsDeleteModal(true)}
          >
            Remove & Reset
          </Button>
        )
      }
      secondaryActions={
        <InlineStack gap={200}>
          <DateRangePicker
            onDateRangeSelect={handleDateRangeChange}
            value={selectedDates}
          />
        </InlineStack>
      }
    >
      <Layout>
        <Layout.Section>
          <InlineGrid gap="200" columns={4}>
            <Card>
              {!data?.plan_details?.features?.total_clicks_product_page && (
                <div className="premium-plan">
                  <p>
                    View total clicks with
                    <Button
                      size="slim"
                      onClick={() =>
                        navigate(`/plans${window.location.search} `)
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
                className="Polaris-BlockStack"
                style={{
                  "--pc-block-stack-order": "column",
                  "--pc-block-stack-gap-xs": "var(--p-space-400)",
                  ...(!data?.plan_details?.features
                    ?.total_clicks_product_page && {
                    filter: "blur(3px)",
                    opacity: 0.2,
                  }),
                }}
              >
                <InlineStack align="space-between" gap={200}>
                  <InlineStack gap={200}>
                    <Icon source={CursorFilledIcon} size="large" tone="info" />
                    <Text as="h2" tone="subdued" variant="headingSm">
                      TOTAL CLICKS
                    </Text>
                  </InlineStack>
                  {data?.plan_details?.features?.total_clicks_product_page && (
                    <Text variant="headingLg">
                      {formatNumber(
                        checkAPIForAnalytics?.product_analytics?.total
                          ?.total_clicks || 0
                      )}
                    </Text>
                  )}
                </InlineStack>

                <Divider />
                {!data?.plan_details?.features
                  ?.detailed_clicks_product_page && (
                  <div className="premium-plan">
                    <p>
                      Get more insight with
                      <Button
                        size="slim"
                        onClick={() =>
                          navigate(`/plans${window.location.search} `)
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
                  className="Polaris-BlockStack"
                  style={{
                    "--pc-block-stack-order": "column",
                    "--pc-block-stack-gap-xs": "var(--p-space-300)",
                    ...(!data?.plan_details?.features
                      ?.detailed_clicks_product_page && {
                      filter: "blur(3px)",
                      opacity: 0.2,
                    }),
                  }}
                >
                  <InlineStack align="space-between">
                    <Text>Short URL</Text>
                    <Text>
                      {formatNumber(
                        checkAPIForAnalytics?.product_analytics
                          ?.short_url_anlytics?.total_clicks || 0
                      )}
                    </Text>
                  </InlineStack>

                  {APIPath !== "influencer-analytics" && (
                    <InlineStack align="space-between">
                      <Text>Custom URL</Text>
                      <Text>
                        {formatNumber(
                          productAnalytics?.product_analytics
                            ?.custom_url_anlytics?.total_clicks || 0
                        )}
                      </Text>
                    </InlineStack>
                  )}
                  <InlineStack align="space-between">
                    <Text>QR</Text>
                    <Text>
                      {formatNumber(
                        checkAPIForAnalytics?.product_analytics
                          ?.qr_code_anlytics?.total_clicks || 0
                      )}
                    </Text>
                  </InlineStack>
                </div>
              </div>
            </Card>
            <Card>
              {!data?.plan_details?.features
                ?.total_add_to_cart_product_page && (
                <div className="premium-plan">
                  <p>
                    View total add to cart with
                    <Button
                      size="slim"
                      onClick={() =>
                        navigate(`/plans${window.location.search} `)
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
                className="Polaris-BlockStack"
                style={{
                  "--pc-block-stack-order": "column",
                  "--pc-block-stack-gap-xs": "var(--p-space-400)",
                  ...(!data?.plan_details?.features
                    ?.total_add_to_cart_product_page && {
                    filter: "blur(3px)",
                    opacity: 0.2,
                  }),
                }}
              >
                <InlineStack align="space-between" gap={200}>
                  <InlineStack gap={200}>
                    <Icon
                      source={CartDownFilledIcon}
                      size="large"
                      tone="info"
                    />
                    <Text as="h2" tone="subdued" variant="headingSm">
                      TOTAL ADD TO CART
                    </Text>
                  </InlineStack>
                  {data?.plan_details?.features
                    ?.total_add_to_cart_product_page && (
                    <Text variant="headingLg">
                      {formatNumber(
                        checkAPIForAnalytics?.product_analytics?.total
                          ?.total_add_to_cart || 0
                      )}
                    </Text>
                  )}
                </InlineStack>
                <Divider />
                {!data?.plan_details?.features
                  ?.detailed_add_to_cart_product_page && (
                  <div className="premium-plan">
                    <p>
                      Get more insight with
                      <Button
                        size="slim"
                        onClick={() =>
                          navigate(`/plans${window.location.search} `)
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
                  className="Polaris-BlockStack"
                  style={{
                    "--pc-block-stack-order": "column",
                    "--pc-block-stack-gap-xs": "var(--p-space-300)",
                    ...(!data?.plan_details?.features
                      ?.detailed_add_to_cart_product_page && {
                      filter: "blur(3px)",
                      opacity: 0.2,
                    }),
                  }}
                >
                  <InlineStack align="space-between">
                    <Text>Short URL</Text>
                    <Text>
                      {formatNumber(
                        checkAPIForAnalytics?.product_analytics
                          ?.short_url_anlytics?.total_add_to_cart || 0
                      )}
                    </Text>
                  </InlineStack>
                  {APIPath !== "influencer-analytics" && (
                    <InlineStack align="space-between">
                      <Text>Custom URL</Text>
                      <Text>
                        {formatNumber(
                          productAnalytics?.product_analytics
                            ?.custom_url_anlytics?.total_add_to_cart || 0
                        )}
                      </Text>
                    </InlineStack>
                  )}
                  <InlineStack align="space-between">
                    <Text>QR</Text>
                    <Text>
                      {formatNumber(
                        checkAPIForAnalytics?.product_analytics
                          ?.qr_code_anlytics?.total_add_to_cart || 0
                      )}
                    </Text>
                  </InlineStack>
                </div>
              </div>
            </Card>
            <Card>
              {!data?.plan_details?.features?.total_checkouts_product_page && (
                <div className="premium-plan">
                  <p>
                    View total checkouts with
                    <Button
                      size="slim"
                      onClick={() =>
                        navigate(`/plans${window.location.search} `)
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
                className="Polaris-BlockStack"
                style={{
                  "--pc-block-stack-order": "column",
                  "--pc-block-stack-gap-xs": "var(--p-space-400)",
                  ...(!data?.plan_details?.features
                    ?.total_checkouts_product_page && {
                    filter: "blur(3px)",
                    opacity: 0.2,
                  }),
                }}
              >
                <InlineStack align="space-between" gap={200}>
                  <InlineStack gap={200}>
                    <Icon
                      source={CashDollarFilledIcon}
                      size="large"
                      tone="info"
                    />
                    <Text as="h2" tone="subdued" variant="headingSm">
                      TOTAL CHECKOUTS
                    </Text>
                  </InlineStack>
                  {data?.plan_details?.features
                    ?.total_checkouts_product_page && (
                    <Text variant="headingLg">
                      {formatNumber(
                        checkAPIForAnalytics?.product_analytics?.total
                          ?.total_checkout || 0
                      )}
                    </Text>
                  )}
                </InlineStack>
                <Divider />
                {!data?.plan_details?.features
                  ?.detailed_checkouts_product_page && (
                  <div className="premium-plan">
                    <p>
                      Get more insight with
                      <Button
                        size="slim"
                        onClick={() =>
                          navigate(`/plans${window.location.search} `)
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
                  className="Polaris-BlockStack"
                  style={{
                    "--pc-block-stack-order": "column",
                    "--pc-block-stack-gap-xs": "var(--p-space-300)",
                    ...(!data?.plan_details?.features
                      ?.detailed_checkouts_product_page && {
                      filter: "blur(3px)",
                      opacity: 0.2,
                    }),
                  }}
                >
                  <InlineStack align="space-between">
                    <Text>Short URL</Text>
                    <Text>
                      {formatNumber(
                        checkAPIForAnalytics?.product_analytics
                          ?.short_url_anlytics?.total_checkout || 0
                      )}
                    </Text>
                  </InlineStack>
                  {APIPath !== "influencer-analytics" && (
                    <InlineStack align="space-between">
                      <Text>Custom URL</Text>
                      <Text>
                        {formatNumber(
                          productAnalytics?.product_analytics
                            ?.custom_url_anlytics?.total_checkout || 0
                        )}
                      </Text>
                    </InlineStack>
                  )}
                  <InlineStack align="space-between">
                    <Text>QR</Text>
                    <Text>
                      {formatNumber(
                        checkAPIForAnalytics?.product_analytics
                          ?.qr_code_anlytics?.total_checkout || 0
                      )}
                    </Text>
                  </InlineStack>
                </div>
              </div>
            </Card>
            <Card>
              {!data?.plan_details?.features?.total_sales_product_page && (
                <div className="premium-plan">
                  <p>
                    View total sales with
                    <Button
                      size="slim"
                      onClick={() =>
                        navigate(`/plans${window.location.search} `)
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
                className="Polaris-BlockStack"
                style={{
                  "--pc-block-stack-order": "column",
                  "--pc-block-stack-gap-xs": "var(--p-space-400)",
                  ...(!data?.plan_details?.features
                    ?.total_sales_product_page && {
                    filter: "blur(3px)",
                    opacity: 0.2,
                  }),
                }}
              >
                <InlineStack align="space-between" gap={200}>
                  <InlineStack gap={200}>
                    <Icon
                      source={DeliveryFilledIcon}
                      size="large"
                      tone="info"
                    />
                    <Text as="h2" tone="subdued" variant="headingSm">
                      TOTAL SALES
                    </Text>
                  </InlineStack>

                  {data?.plan_details?.features?.total_sales_product_page && (
                    <Text variant="headingLg">
                      {storeCurrency === undefined
                        ? formatNumber(
                            checkAPIForAnalytics?.product_analytics?.total
                              ?.total_sales || 0
                          )
                        : storeCurrency +
                          " " +
                          formatNumber(
                            checkAPIForAnalytics?.product_analytics?.total
                              ?.total_sales || 0
                          )}
                    </Text>
                  )}
                </InlineStack>
                <Divider />
                {!data?.plan_details?.features?.detailed_sales_product_page && (
                  <div className="premium-plan">
                    <p>
                      Get more insight with
                      <Button
                        size="slim"
                        onClick={() =>
                          navigate(`/plans${window.location.search} `)
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
                  className="Polaris-BlockStack"
                  style={{
                    "--pc-block-stack-order": "column",
                    "--pc-block-stack-gap-xs": "var(--p-space-300)",
                    ...(!data?.plan_details?.features
                      ?.detailed_sales_product_page && {
                      filter: "blur(3px)",
                      opacity: 0.2,
                    }),
                  }}
                >
                  <InlineStack align="space-between">
                    <Text>Short URL</Text>
                    <Text>
                      {storeCurrency === undefined
                        ? formatNumber(
                            checkAPIForAnalytics?.product_analytics
                              ?.short_url_anlytics?.total_sales || 0
                          )
                        : storeCurrency +
                          " " +
                          formatNumber(
                            checkAPIForAnalytics?.product_analytics
                              ?.short_url_anlytics?.total_sales || 0
                          )}
                    </Text>
                  </InlineStack>
                  {APIPath !== "influencer-analytics" && (
                    <InlineStack align="space-between">
                      <Text>Custom URL</Text>
                      <Text>
                        {storeCurrency === undefined
                          ? formatNumber(
                              productAnalytics?.product_analytics
                                ?.custom_url_anlytics?.total_sales || 0
                            )
                          : storeCurrency +
                            " " +
                            formatNumber(
                              productAnalytics?.product_analytics
                                ?.custom_url_anlytics?.total_sales || 0
                            )}
                      </Text>
                    </InlineStack>
                  )}
                  <InlineStack align="space-between">
                    <Text>QR</Text>
                    <Text>
                      {storeCurrency === undefined
                        ? formatNumber(
                            checkAPIForAnalytics?.product_analytics
                              ?.qr_code_anlytics?.total_sales || 0
                          )
                        : storeCurrency +
                          " " +
                          formatNumber(
                            checkAPIForAnalytics?.product_analytics
                              ?.qr_code_anlytics?.total_sales || 0
                          )}
                    </Text>
                  </InlineStack>
                </div>
              </div>
            </Card>
          </InlineGrid>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <BlockStack gap={200}>
              <Text as="h3">Name (Optional)</Text>
              <TextField
                value={dataTitle}
                onChange={(newValue) => setDataTitle(newValue)}
              />
              <Divider />

              <BlockStack gap={200}>
                <InlineStack gap={100}>
                  <Text as="h3">Shopify URL</Text>
                  <Tooltip content="This URL is the original Shopify link that you can copy and use.">
                    <Icon tone="base" source={InfoIcon} />
                  </Tooltip>
                </InlineStack>
                <TextField
                  readOnly
                  prefix={`https://${SHOP}/`}
                  value={removeShopDomain(
                    responseData[productId]?.onlineStorePreviewUrl,
                    responseData[productId]?.shopify_url
                  )}
                  connectedRight={
                    <Tooltip content="Copy link">
                      <Button
                        onClick={() =>
                          handleCopy(
                            buildQueryParams(
                              removeShopDomain(
                                responseData[productId]?.onlineStorePreviewUrl,
                                responseData[productId]?.shopify_url
                              ),
                              "shopify"
                            ),
                            "shopify-url"
                          )
                        }
                      >
                        <Icon
                          source={
                            copiedItems["shopify-url"]
                              ? CheckIcon
                              : ClipboardIcon
                          }
                          tone="base"
                        />
                      </Button>
                    </Tooltip>
                  }
                />
              </BlockStack>
              {APIPath !== "influencer-analytics" && (
                <>
                  <Divider />
                  <BlockStack gap={200}>
                    <InlineStack align="space-between">
                      <InlineStack gap={100}>
                        <Text as="h3">Custom URL</Text>
                        <Tooltip
                          content={`This custom URL, created with your store '${SHOP}', removes
                       Shopify's predefined words like 'products','pages' and 'collection'`}
                        >
                          <Icon tone="base" source={InfoIcon} />
                        </Tooltip>
                      </InlineStack>
                    </InlineStack>
                    {!data?.plan_details?.features?.short_url_create && (
                      <div className="premium-plan">
                        <p>
                          Get more insight with
                          <Button
                            size="slim"
                            onClick={() =>
                              navigate(`/plans${window.location.search}`)
                            }
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
                      class="Polaris-Box"
                      style={{
                        ...(!data?.plan_details?.features?.short_url_create && {
                          filter: "blur(3px)",
                          opacity: 0.2,
                        }),
                      }}
                    >
                      <TextField
                        prefix={`https://${SHOP}/`}
                        value={withShopURL}
                        readOnly={removeShopDomain(
                          responseData[productId]?.short_link
                        )}
                        error={showErrorMessage(withShopURL, "Custom URL")}
                        onChange={(newValue) => setWithShopURL(newValue)}
                        connectedRight={
                          removeShopDomain(
                            responseData?.[productId]?.short_link
                          ) !== "/" &&
                          removeShopDomain(
                            responseData?.[productId]?.short_link
                          ) !== "" &&
                          removeShopDomain(
                            responseData?.[productId]?.short_link
                          ) !== null &&
                          removeShopDomain(
                            responseData?.[productId]?.short_link
                          ) !== undefined && (
                            <Tooltip content="Copy link">
                              <Button
                                onClick={() =>
                                  handleCopy(
                                    buildQueryParams(
                                      removeShopDomain(
                                        responseData?.[productId]?.short_link,
                                        ""
                                      ),
                                      "custom"
                                    ),
                                    "custom-url"
                                  )
                                }
                              >
                                <Icon
                                  source={
                                    copiedItems["custom-url"]
                                      ? CheckIcon
                                      : ClipboardIcon
                                  }
                                  tone="base"
                                />
                              </Button>
                            </Tooltip>
                          )
                        }
                      />
                    </div>
                  </BlockStack>
                </>
              )}
              <Divider />
              <BlockStack gap={200}>
                <InlineStack gap={100}>
                  <Text as="h3">Short URL</Text>
                  <Tooltip
                    content="Easily track traffic sources, devices, and other metrics with a  Short URL. This tool offers a fixed domain for
                  consistent and streamlined link management."
                  >
                    <Icon tone="base" source={InfoIcon} />
                  </Tooltip>
                </InlineStack>
                {!data?.plan_details?.features?.custom_url_create && (
                  <div className="premium-plan">
                    <p>
                      Get more insight with
                      <Button
                        size="slim"
                        onClick={() =>
                          navigate(`/plans${window.location.search}`)
                        }
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
                  class="Polaris-Box"
                  style={{
                    ...(!data?.plan_details?.features?.custom_url_create && {
                      filter: "blur(3px)",
                      opacity: 0.2,
                    }),
                  }}
                >
                  <TextField
                    prefix={`${CUSTOM_DOMAIN}`}
                    readOnly={removeShopDomain(
                      responseData[productId]?.custom_url
                    )}
                    value={responseData?.[productId]?.custom_url}
                    error={
                      responseData?.[productId]?.custom_url != undefined
                        ? showErrorMessage(
                            responseData?.[productId]?.custom_url,
                            "Short URL"
                          )
                        : false
                    }
                    onChange={(newValue) => setCustomURL(newValue)}
                    connectedRight={
                      removeShopDomain(
                        responseData?.[productId]?.custom_url
                      ) !== "/" &&
                      removeShopDomain(
                        responseData?.[productId]?.custom_url
                      ) !== "" &&
                      removeShopDomain(
                        responseData?.[productId]?.custom_url
                      ) !== null &&
                      removeShopDomain(
                        responseData?.[productId]?.custom_url
                      ) !== undefined && (
                        <Tooltip content="Copy link">
                          <Button
                            onClick={() =>
                              handleCopy(
                                buildQueryParams(
                                  removeShopDomain(
                                    responseData?.[productId]?.custom_url,
                                    ""
                                  ),
                                  "short"
                                ),
                                "short-url"
                              )
                            }
                          >
                            <Icon
                              source={
                                copiedItems["short-url"]
                                  ? CheckIcon
                                  : ClipboardIcon
                              }
                              tone="base"
                            />
                          </Button>
                        </Tooltip>
                      )
                    }
                  />
                </div>
              </BlockStack>
              {validUtmEntries.length > 0 && (
                <BlockStack gap={200}>
                  <InlineStack gap={100}>
                    <Text as="h3">UTM</Text>
                    <Tooltip content="Easily track campaign sources, mediums, and performance by adding UTM parameters to your links">
                      <Icon tone="base" source={InfoIcon} />
                    </Tooltip>
                  </InlineStack>

                  {validUtmEntries.map(([key, value]) => (
                    <FormLayout>
                      <FormLayout.Group>
                        <TextField key={key} readOnly value={key} />
                        <TextField key={key} readOnly value={value} />
                      </FormLayout.Group>
                    </FormLayout>
                  ))}
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <div
              className="Polaris-BlockStack qr-code"
              style={{
                "--pc-block-stack-order": "column",
                "--pc-block-stack-gap-xs": "var(--p-space-400)",
              }}
            >
              <Text as="h3" variant="headingMd">
                QR Code
              </Text>
              {!data?.plan_details?.features?.qr_code_create && (
                <div className="premium-plan">
                  <p>
                    Get more insight with
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
                  ...(!data?.plan_details?.features?.qr_code_create && {
                    filter: "blur(3px)",
                    opacity: 0.2,
                  }),
                }}
              >
                {responseData[productId]?.qr_code &&
                data?.plan_details?.features?.qr_code_create ? (
                  <BlockStack gap={200}>
                    <div style={calculateHeight()} ref={qrCodeRef}>
                      <QRCode
                        value={buildQueryParams(
                          removeShopDomain(
                            responseData[productId]?.onlineStorePreviewUrl,
                            responseData[productId]?.shopify_url
                          ) + `${qrQueryParams}`
                        )}
                        size={
                          APIPath === "influencer-analytics" &&
                          validUtmEntries.length === 0
                            ? 145
                            : 210
                        }
                      />
                    </div>
                    <Button
                      variant="primary"
                      icon={ArrowDownIcon}
                      onClick={() => downloadQRCode()}
                      disabled={!data?.plan_details?.features?.qr_code_create}
                    >
                      Download
                    </Button>
                  </BlockStack>
                ) : (
                  <div className="no-qr" style={calculateHeight("blank")}>
                    <BlockStack inlineAlign="center" gap={400}>
                      <Thumbnail source={NoQrIcon} size="large" />
                      <Text variant="bodyXs" tone="subdued" alignment="center">
                        QR Code has been not generated yet!
                      </Text>
                    </BlockStack>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
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
            {!data?.plan_details?.features?.click_analytics_product_page && (
              <div
                className="premium-plan"
                style={{ position: "absolute", zIndex: 1 }}
              >
                <p>
                  Get more insight with
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
                position: "relative",
              }}
            >
              <BlockStack gap={300}>
                <Text variant="headingMd">Click Analytics</Text>
                <div
                  style={{
                    ...(data?.plan_details?.features
                      ?.click_analytics_product_page
                      ? {}
                      : {
                          filter: "blur(3px)",
                          opacity: 0.2,
                          pointerEvents: "none",
                        }),
                  }}
                >
                  {initClickAnalyticsChart()}
                </div>
              </BlockStack>
            </div>
          </div>
        </Layout.Section>

        <Layout.Section>
          <Layout>
            <Layout.Section variant="oneHalf">
              <Card>
                <BlockStack gap={200}>
                  <InlineStack gap={100}>
                    <Text variant="headingMd">Devices</Text>
                    <Tooltip
                      content={`The Device Analytics of Total clicks as well as Total Add to cart`}
                    >
                      <Icon tone="base" source={InfoIcon} />
                    </Tooltip>
                  </InlineStack>
                  {!data?.plan_details?.features
                    ?.device_analytics_product_page && (
                    <div className="premium-plan">
                      <p>
                        Get more insight with
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
                    className="Polaris-Box"
                    style={{
                      ...(!data?.plan_details?.features
                        ?.device_analytics_product_page && {
                        filter: "blur(3px)",
                        opacity: 0.2,
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
                {!data?.plan_details?.features
                  ?.browser_analytics_product_page && (
                  <div class="premium-plan">
                    <p>
                      Get more insight with
                      <Button
                        size="slim"
                        onClick={() =>
                          navigate(`/plans${window.location.search}`)
                        }
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
                      ?.browser_analytics_product_page && {
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

            <Layout.Section variant="">
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
                    ?.platform_analytics_product_page && (
                    <div className="premium-plan">
                      <p>
                        Get more insight with
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
                    className="Polaris-Box"
                    style={{
                      ...(!data?.plan_details?.features
                        ?.platform_analytics_product_page && {
                        filter: "blur(3px)",
                        opacity: 0.2,
                      }),
                    }}
                  >
                    {PlatformsAnalyticsChart()}
                  </div>
                </BlockStack>
              </Card>
            </Layout.Section>

            <ConfirmationModal
              isOpen={isDeleteModal}
              setIsOpen={setIsDeleteModal}
              title={"Remove & Reset URL"}
              text={
                <BlockStack gap={200}>
                  <Text as="h2" tone="critical" variant="headingMd">
                    Warning: Are You Sure You Want to Remove?
                  </Text>
                  <Text as="h4" variant="headingSm">
                    If you delete this URL and barcode, all previous analytic
                    summaries associated with them will be permanently removed.
                    This action cannot be undone.
                  </Text>
                </BlockStack>
              }
              buttonText={"Delete"}
              buttonAction={() => deleteUrl()}
              destructive={true}
              show={!data?.plan_details?.features?.remove_reset}
              loading={isDeleting}
            />

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
                  ?.location_analytics_product_page && (
                  <div class="premium-plan">
                    <p>
                      Get more insight with
                      <Button
                        size="slim"
                        onClick={() =>
                          navigate(`/plans${window.location.search}`)
                        }
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
                      ?.location_analytics_product_page && {
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
                  ?.location_analytics_product_page && (
                  <div class="premium-plan">
                    <p>
                      Get more insight with
                      <Button
                        size="slim"
                        onClick={() =>
                          navigate(`/plans${window.location.search}`)
                        }
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
                      ?.location_analytics_product_page && {
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
                  ?.location_analytics_product_page && (
                  <div class="premium-plan">
                    <p>
                      Get more insight with
                      <Button
                        size="slim"
                        onClick={() =>
                          navigate(`/plans${window.location.search}`)
                        }
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
                      ?.location_analytics_product_page && {
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
        <Layout.Section></Layout.Section>
      </Layout>
    </Page>
  );
}

export default Details;
/* DETAILS FUNCTIONAL COMPONENT END */
