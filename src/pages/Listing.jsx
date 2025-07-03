/* IMPORT REQUIRED MODULES START */
import {
  Button,
  Modal,
  Page,
  Tabs,
  Layout,
  BlockStack,
  Text,
  TextField,
  Divider,
  Card,
  InlineStack,
  Tooltip,
  Icon,
  FormLayout,
  Select,
  Box,
  Link,
} from "@shopify/polaris";
import React, { useEffect, useState } from "react";
import { fetchData, getApiURL } from "../action";
import { CheckIcon, ClipboardIcon, InfoIcon } from "@shopify/polaris-icons";
import { useApiData } from "../components/ApiDataProvider";
import { handleCopyClick, removeShopDomain } from "../utils";
import { useNavigate } from "react-router-dom";
import { CollectionList, MyLinks, ProductList } from "../components";

/* IMPORT REQUIRED MODULES END */
const generateRandomString = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
/* LISTING FUNCTIONAL COMPONENT START */
const Listing = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const SHOP = urlParams.get("shop");
  const { data, loading, error } = useApiData();
  const [generateModal, setGenerateModal] = useState(false);
  const [generateLoader, setGenerateLoader] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [previousData, setPreviousData] = useState(false);
  const [nextData, setNextData] = useState(false);
  const [queryValue, setQueryValue] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    title: "",
    shopifyUrl: "",
    shortURL: "",
    customURL: "",
  });
  const [LinksData, setLinkData] = useState([]);
  const [title, setTitle] = useState(undefined);
  const [shopifyUrl, setShopifyUrl] = useState(undefined);
  const [customURL, setCustomURL] = useState(generateRandomString(12));
  const [shortURL, setShortURL] = useState(undefined);
  const [selectedTab, setSelectedTab] = useState(() => {
    const storedTab = sessionStorage.getItem("selectedTab");
    return storedTab !== null ? parseInt(storedTab, 10) : 0;
  });
  const [copiedItems, setCopiedItems] = useState({});
  const navigate = useNavigate();

  /* TAB CHANGE HANDLER START */
  const handleTabChange = (index) => {
    setSelectedTab(index);
    sessionStorage.setItem("selectedTab", index);
  };
  /* TAB CHANGE HANDLER END */

  const handleCopy = (text, itemId) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Show checkmark icon immediately for better UX
        setCopiedItems(prev => ({ ...prev, [itemId]: true }));
        
        // Show toast notification
        shopify.toast.show("Copied to Clipboard", { duration: 3000 });
        
        // Return to clipboard icon after 1.5 seconds (faster response)
        setTimeout(() => {
          setCopiedItems(prev => ({ ...prev, [itemId]: false }));
        }, 1500);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        // Show error toast if copy fails
        shopify.toast.show("Failed to copy to clipboard", { duration: 3000, isError: true });
      });
  };

  const tabs = [
    {
      id: "my-link-list",
      content: "My Links",
      accessibilityLabel: "MyLinks List",
      panelID: "my-link-list-content",
    },
    {
      id: "product-list",
      content: "Products",
      panelID: "product-list-content",
    },
    {
      id: "collection-list",
      content: "Collections",
      panelID: "collection-list-content",
    },
    (SHOP === "shortly-app-demo.myshopify.com" ||
      SHOP === "44d065-83.myshopify.com") && {
      id: "other-links",
      content: "Others",
      panelID: "other-links-content",
    },
  ];

  const showErrorMessage = (url, type) => {
    if (type === "title") {
      if (title === undefined || title.trim() === "" || title === null) {
        setValidationErrors({
          title: "Name is required",
          shopifyUrl: "",
          shortURL: "",
          customURL: "",
        });
        return "Name is required";
      }
    } else {
      const regex = /[^a-zA-Z0-9]/;
      if (type === "shopifyURL") {
        if (url === null || url === undefined || url?.trim() === "") {
          setValidationErrors({
            title: "",
            shopifyUrl: "Shopify URL is required",
            shortURL: "",
            customURL: "",
          });
          return "Shopify URL is required";
        }
        const startRegex = /^(pages|blogs|articles|collections)/;
        if (!startRegex.test(url?.trim())) {
          setValidationErrors({
            title: "",
            shopifyUrl:
              "Shopify URL must start with 'pages', 'blogs', 'articles', or 'collections'.",
            shortURL: "",
            customURL: "",
          });
          return 'Shopify URL must start with "pages", "blogs", "articles", or "collections".';
        }
        const validCharsRegex = /[^a-zA-Z0-9-_\/]/;
        if (validCharsRegex.test(url?.trim())) {
          setValidationErrors({
            title: "",
            shopifyUrl:
              "Shopify URL must only have letters, numbers, hyphens, underscores, and slashes.",
            shortURL: "",
            customURL: "",
          });
          return "Shopify URL must only have letters, numbers, hyphens, underscores, and slashes.";
        }
      } else if (type === "Short URL") {
        if (url === null || url === undefined || url?.trim() === "") {
          setValidationErrors({
            title: "",
            shopifyUrl: "",
            shortURL: "Short URL is required",
            customURL: "",
          });
          return "Short URL is required";
        }
        if (url?.length <= 4) {
          setValidationErrors({
            title: "",
            shopifyUrl: "",
            shortURL: "Short URL is too short",
            customURL: "",
          });
          return "Short URL is too short";
        }
        if (url?.length > 12) {
          setValidationErrors({
            title: "",
            shopifyUrl: "",
            shortURL: "Short URL is too long. Limit it to 12 characters",
            customURL: "",
          });
          return "Short URL is too long";
        }
        if (regex.test(url)) {
          setValidationErrors({
            title: "",
            shopifyUrl: "",
            shortURL: "Short URL must be letters and numbers",
            customURL: "",
          });
          return "Short URL must be letters and numbers";
        }
      } else if (type === "Custom URL") {
        if (regex.test(url)) {
          setValidationErrors({
            title: "",
            shopifyUrl: "",
            shortURL: "",
            customURL: "Custom URL must be letters and numbers",
          });
          return "Custom URL must be letters and numbers";
        }
      }
      setValidationErrors({
        title: "",
        shopifyUrl: "",
        shortURL: "",
        customURL: "",
      });
      return false;
    }
  };
  useEffect(() => {
    setValidationErrors({
      title: "",
      shopifyUrl: "",
      shortURL: "",
      customURL: "",
    });
    setTitle("");
    setShopifyUrl("");
    setCustomURL(generateRandomString(12));
    setShortURL("");
  }, [generateModal]);

  const handleGenerate = async () => {
    if (showErrorMessage(title, "title")) return false;
    if (showErrorMessage(shopifyUrl, "shopifyURL")) return false;
    if (showErrorMessage(customURL, "Short URL")) return false;
    if (showErrorMessage(shortURL, "Custom URL")) return false;

    setGenerateLoader(true);

    const formdata = new FormData();

    formdata.append("target", shopifyUrl?.trim()?.replace(/\s+/g, "_"));
    formdata.append("internal_title", title);
    if (
      shortURL !== null &&
      shortURL !== undefined &&
      shortURL !== "" &&
      data?.plan_details?.features?.short_url_create
    )
      formdata.append("path", shortURL?.trim()?.replace(/\s+/g, "_"));
    if (
      customURL !== null &&
      customURL !== undefined &&
      customURL !== "" &&
      data?.plan_details?.features?.custom_url_create
    )
      formdata.append("custom_url", customURL?.trim()?.replace(/\s+/g, "_"));
    formdata.append("type", "others");
    if (data?.plan_details?.features?.qr_code_create)
      formdata.append("qr_code", `qr=${generateRandomString(20)}`);
    const response = await fetchData(
      getApiURL("/create_url_redirect"),
      formdata
    );
    setGenerateLoader(false);
    if (response.status === true) {
      setGenerateModal(false);
      // setPageNumber(1);
      // setQueryValue("")
      // const data = new FormData();
      // data.append("limit", 10);
      // data.append("page", 1)
      // const result = await fetchData(getApiURL("/redirect_list_V2"), data);
      // if (result.status === true) {
      //   const temp = result?.data.map((val, index) => {
      //     return {
      //       ...val,
      //       id: index
      //     };
      //   });
      //   setLinkData(temp)
      //   if (result?.page?.previous) {
      //     setPreviousData(result?.page?.previous);
      //   } else {
      //     setPreviousData(false);
      //   }
      //   if (result?.page?.next) {
      //     setNextData(result?.page?.next);
      //   } else {
      //     setNextData(false);
      //   }
      // }
      shopify.toast.show(response.message, { duration: 3000 });
    } else {
      shopify.toast.show(response?.message, { duration: 3000, isError: true });
    }
  };

  return (
    <>
      <Page
        title="Generate Links"
      // primaryAction={selectedTab === 0 && SHOP === 'shortly-app-demo.myshopify.com' && { content: "Generate", onAction: () => setGenerateModal(true) }}
      >
        <Layout>
          <Layout.Section>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
              {selectedTab === 0 && (
                <MyLinks
                  LinksData={LinksData}
                  setLinkData={setLinkData}
                  queryValue={queryValue}
                  setQueryValue={setQueryValue}
                  pageNumber={pageNumber}
                  setPageNumber={setPageNumber}
                  previousData={previousData}
                  setPreviousData={setPreviousData}
                  nextData={nextData}
                  setNextData={setNextData}
                />
              )}
              {selectedTab === 1 && <ProductList selected={selectedTab} />}
              {selectedTab === 2 && <CollectionList selected={selectedTab} />}
              {selectedTab === 3 &&
                (SHOP === "shortly-app-demo.myshopify.com" ||
                  SHOP === "44d065-83.myshopify.com") && (
                  <Card>
                    <Box paddingBlockStart={600} paddingBlockEnd={600}>
                      <InlineStack align="center">
                        <Button
                          size="large"
                          variant="primary"
                          onClick={() => setGenerateModal(true)}
                        >
                          Generate other Link
                        </Button>
                      </InlineStack>
                    </Box>
                  </Card>
                )}
            </Tabs>
          </Layout.Section>
          <Layout.Section></Layout.Section>
        </Layout>
        <Modal
          open={generateModal}
          id="ConfirmationModal"
          onClose={() => {
            setGenerateModal(false);
          }}
          title={"Generate other Link"}
          primaryAction={{
            content: "Generate",
            onAction: () => handleGenerate(),
            loading: generateLoader,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setGenerateModal(false),
            },
          ]}
        >
          <Modal.Section>
            <Layout>
              <Layout.Section>
                <Card>
                  <BlockStack gap={200}>
                    <BlockStack gap={200}>
                      <FormLayout>
                        <FormLayout.Group>
                          <TextField
                            label="Name"
                            value={title}
                            placeholder="Name of the link"
                            autoComplete="off"
                            requiredIndicator={true}
                            error={validationErrors.title}
                            onChange={(value) => {
                              setValidationErrors((prevErrors) => ({
                                ...prevErrors,
                                title: "",
                              }));
                              setTitle(value);
                            }}
                          />
                        </FormLayout.Group>
                      </FormLayout>
                    </BlockStack>
                    <Divider />
                    <BlockStack gap={200}>
                      <InlineStack gap={100}>
                        <Text as="h3">Shopify URL</Text>
                        <Tooltip content="This URL is the original Shopify link that you can copy and use.">
                          <Icon tone="base" source={InfoIcon} />
                        </Tooltip>
                      </InlineStack>
                      <TextField
                        prefix={`https://${SHOP}/`}
                        value={shopifyUrl}
                        autoComplete="off"
                        error={validationErrors.shopifyUrl}
                        requiredIndicator={true}
                        onChange={(value) => {
                          setShopifyUrl(value);
                          setValidationErrors((prevErrors) => ({
                            ...prevErrors,
                            shopifyUrl: "",
                          }));
                        }}
                        connectedRight={
                          shopifyUrl !== null &&
                          shopifyUrl !== undefined &&
                          shopifyUrl?.trim() !== "" && (
                            <Tooltip content="Copy link">
                              <Button
                                onClick={() =>
                                  handleCopy(removeShopDomain(shopifyUrl), 'shopify-url')
                                }
                              >
                                <Icon source={copiedItems['shopify-url'] ? CheckIcon : ClipboardIcon} tone="base" />
                              </Button>
                            </Tooltip>
                          )
                        }
                      />
                    </BlockStack>
                    <Divider />

                    {!data?.plan_details?.features?.short_url_create && (
                      <div class="premium-plan">
                        <p>
                          Get more insight with{" "}
                          <Button
                            size="slim"
                            disabled={
                              !data?.plan_details?.features?.bulk_create
                            }
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
                      className="Polaris-BlockStack"
                      style={{
                        "--pc-block-stack-order": "column",
                        "--pc-block-stack-gap-xs": "var(--p-space-300)",
                        ...(!data?.plan_details?.features?.short_url_create && {
                          filter: "blur(3px)", opacity: 0.2,
                        }),
                      }}
                    >
                      <InlineStack gap={100}>
                        <Text as="h3">Custom URL</Text>
                        <Tooltip
                          content={`This custom URL, created with your store '${SHOP}', removes
                                     Shopify's predefined words like 'products,' 'pages,'
                                     'collection,`}
                        >
                          <Icon tone="base" source={InfoIcon} />
                        </Tooltip>
                      </InlineStack>
                      <TextField
                        prefix={`https://${SHOP}/`}
                        requiredIndicator={true}
                        value={shortURL}
                        error={validationErrors.customURL}
                        autoComplete="off"
                        onChange={(value) => {
                          setValidationErrors((prevErrors) => ({
                            ...prevErrors,
                            customURL: "",
                          }));
                          setShortURL(value);
                        }}
                        connectedRight={
                          shortURL !== null &&
                          shortURL !== undefined &&
                          shortURL?.trim() !== "" && (
                            <Tooltip content="Copy link">
                              <Button
                                onClick={() =>
                                  handleCopy(removeShopDomain(shortURL), 'custom-url')
                                }
                              >
                                <Icon source={copiedItems['custom-url'] ? CheckIcon : ClipboardIcon} tone="base" />
                              </Button>
                            </Tooltip>
                          )
                        }
                      />
                    </div>

                    <Divider />

                    {!data?.plan_details?.features?.custom_url_create && (
                      <div class="premium-plan">
                        <p>
                          Get more insight with{" "}
                          <Button
                            size="slim"
                            disabled={
                              !data?.plan_details?.features?.bulk_create
                            }
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
                      className="Polaris-BlockStack"
                      style={{
                        "--pc-block-stack-order": "column",
                        "--pc-block-stack-gap-xs": "var(--p-space-300)",
                        ...(!data?.plan_details?.features
                          ?.custom_url_create && {
                          filter: "blur(3px)", opacity: 0.2,
                        }),
                      }}
                    >
                      <InlineStack gap={100}>
                        <Text as="h3">Short URL</Text>
                        <Tooltip
                          content="Easily track traffic sources, devices, and other metrics with a Short URL. This tool offers a fixed domain for
                                consistent and streamlined link management."
                        >
                          <Icon tone="base" source={InfoIcon} />
                        </Tooltip>
                      </InlineStack>
                      <TextField
                        prefix={`${CUSTOM_DOMAIN}`}
                        autoComplete="off"
                        value={customURL}
                        error={validationErrors.shortURL}
                        onChange={(value) => setCustomURL(value)}
                        requiredIndicator={true}
                        connectedRight={
                          customURL !== null &&
                          customURL !== undefined &&
                          customURL?.trim() !== "" && (
                            <Tooltip content="Copy link">
                              <Button
                                onClick={() =>
                                  handleCopy(
                                    removeShopDomain(customURL),
                                    "short-url"
                                  )
                                }
                              >
                                <Icon source={copiedItems['short-url'] ? CheckIcon : ClipboardIcon} tone="base" />
                              </Button>
                            </Tooltip>
                          )
                        }
                      />
                    </div>
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>
          </Modal.Section>
        </Modal>
      </Page>
    </>
  );
};

export default Listing;
/* LISTING FUNCTIONAL COMPONENT END */
