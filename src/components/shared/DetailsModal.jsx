/* IMPORT REQUIRED MODULES START */
import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  TextField,
  Card,
  InlineGrid,
  Text,
  BlockStack,
  Icon,
  Tooltip,
  Layout,
  InlineStack,
  Modal,
  Divider,
  Thumbnail,
} from "@shopify/polaris";
import { ArrowDownIcon, CheckIcon, ClipboardIcon, InfoIcon } from "@shopify/polaris-icons";
import { fetchData, getApiURL } from "../../action";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode.react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { handleCopyClick, removeShopDomain, } from "../../utils";
import { useApiData } from "../ApiDataProvider";
import NoQrIcon from "/assets/no-qr.svg";
/* IMPORT REQUIRED MODULES END */

/* DETAILS FUNCTIONAL COMPONENT START */
function Details({
  influencerID,
  productsData,
  setProducsData,
  productId,
  isDetailsModal,
  setIsDetailsModal,
  selectedTab,
  getProductsData,
  limit,
  type,
  isPageType,
  queryValue,
  previousData,
  nextData,
  APIPath,
}) {
  const [shortURL, setShortURL] = useState("");
  const [customURL, setCustomURL] = useState("");
  const [generateLoader, setGenerateLoader] = useState(false);
  const [dataTitle, setDataTitle] = useState("");
  const [copiedItems, setCopiedItems] = useState({});
  const navigate = useNavigate();
  const { data, loading, error } = useApiData();
  const urlParams = new URLSearchParams(window.location.search);
  const SHOP = urlParams.get("shop");
  const qrCodeRef = useRef(null);

  /* MORE DETAILS HANDLER START */
  const handleMoreDetails = () => {
    const params = {};
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }

    const dataToPass = {
      productsData,
      productId,
      title: productsData[productId]?.title || productsData[productId]?.path,
      selectedTab,
      type,
      queryValue,
      isPageType,
      limit,
      nextData,
      previousData,
      APIPath,
    };
    sessionStorage.setItem("detailsData", JSON.stringify(dataToPass));

    const path = APIPath === "link-list" ? "/influencers" : "/details";
    navigate(`${path}${window.location.search}`);
  };
  /* MORE DETAILS HANDLER END */

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

  const reloardProductList = () => {
    if (isDetailsModal === true) return false;
    const data = new FormData();
    data.append("limit", limit);
    if (queryValue) data.append("search", queryValue);
    if (isPageType === "previous") data.append("previousPage", previousData);
    else if (isPageType === "next") data.append("nextPage", nextData);
    getProductsData(data);
  };
  // useEffect(() => {
  //   reloardProductList();
  // }, [isDetailsModal]);

  /* GENERATE HANDLER START */
  const handleGenerate = async () => {
    if (
      (customURL === null || customURL === undefined || customURL === "") &&
      (shortURL === null || shortURL === undefined || shortURL === "")
    ) {
      shopify.toast.show("Please enter the Short/Custom URL", {
        isError: true,
        duration: 3000,
      });

      return false;
    }
    setGenerateLoader(true);
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
    const target =
      productsData[productId]?.onlineStorePreviewUrl ||
      productsData[productId]?.shopify_url;
    const newUrl = target.replace(`https://${SHOP}`, "");
    const formdata = new FormData();
    formdata.append("target", newUrl);
    formdata.append(
      "internal_title",
      dataTitle || productsData[productId]?.title
    );
    formdata.append("type", type);
    if (
      shortURL !== null &&
      shortURL !== undefined &&
      shortURL !== "" &&
      data?.plan_details?.features?.short_url_create
    )
      formdata.append("path", shortURL?.trim()?.replace(" ", "_"));
    if (
      customURL !== null &&
      customURL !== undefined &&
      customURL !== "" &&
      data?.plan_details?.features?.custom_url_create
    )
      formdata.append("custom_url", customURL?.trim()?.replace(" ", "_"));
    if (data?.plan_details?.features?.qr_code_create)
      formdata.append("qr_code", `qr=${generateRandomString(20)}`);

    const response = await fetchData(
      getApiURL("create_url_redirect"),
      formdata
    );
    setGenerateLoader(false);

    if (response.status === true) {
      shopify.toast.show(response.message, { duration: 3000 });
      setIsDetailsModal(false);
    } else {
      shopify.toast.show(response?.message, { duration: 3000, isError: true });
      setIsDetailsModal(false);
    }
  };
  /* GENERATE HANDLER END */

  /* DOWNLOAD QR CODE HANDLER START */
  const downloadQRCode = () => {
    if (qrCodeRef.current) {
      html2canvas(qrCodeRef.current, {
        scale: 2,
        backgroundColor: "#fff",
      })
        .then((canvas) => {
          canvas.toBlob((blob) => {
            saveAs(blob, `${productsData[productId]?.handle}-qrcode.jpg`);
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
    setShortURL(removeShopDomain(productsData[productId]?.short_link, ""));
    setCustomURL(
      removeShopDomain(productsData[productId]?.custom_url, "") ||
      generateRandomString(12)
    );
    if (productsData[productId]?.title)
      setDataTitle(productsData[productId]?.title);
  }, [productsData, productId]);

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

  return (
    <Modal
      open={isDetailsModal}
      id="details-modal"
      size="large"
      onClose={() => setIsDetailsModal(false)}
      title="Generate Short URL"
      primaryAction={{
        content: "Regenerate",
        onAction: () => handleGenerate(),
        loading: generateLoader,
      }}
      secondaryActions={[
        {
          content: "More Details",
          onAction: () => handleMoreDetails(),
        },
      ]}
    >
      <Modal.Section>
        <Layout>
          <Layout.Section>
            <InlineGrid gap="200" columns={4}>
              <Card sectioned>
                <BlockStack gap={200}>
                  <Text as="h2" tone="subdued" variant="headingSm">
                    TOTAL CLICKS
                  </Text>
                  <Text as="h4" variant="headingLg">
                    {formatNumber(
                      productsData[productId]?.anlytics?.total?.total_clicks ||
                      0
                    )}
                  </Text>
                </BlockStack>
              </Card>
              <Card sectioned>
                <BlockStack gap={200}>
                  <Text as="h2" tone="subdued" variant="headingSm">
                    TOTAL ADD TO CART
                  </Text>
                  <Text as="h4" variant="headingLg">
                    {formatNumber(
                      productsData[productId]?.anlytics?.total
                        ?.total_add_to_cart || 0
                    )}
                  </Text>
                </BlockStack>
              </Card>
              <Card sectioned>
                <BlockStack gap={200}>
                  <Text as="h2" tone="subdued" variant="headingSm">
                    TOTAL CHECKOUTS
                  </Text>
                  <Text as="h4" variant="headingLg">
                    {formatNumber(
                      productsData[productId]?.anlytics?.total
                        ?.total_checkout || 0
                    )}
                  </Text>
                </BlockStack>
              </Card>
              <Card sectioned>
                <BlockStack gap={200}>
                  <Text as="h2" tone="subdued" variant="headingSm">
                    TOTAL SALES
                  </Text>
                  <Text as="h4" variant="headingLg">
                    {formatNumber(
                      productsData[productId]?.anlytics?.total?.total_sales || 0
                    )}
                  </Text>
                </BlockStack>
              </Card>
            </InlineGrid>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap={200}>
                <BlockStack gap={200}>
                  <Text as="h3">Name (Optional)</Text>
                  <TextField
                    value={dataTitle}
                    onChange={(newValue) => setDataTitle(newValue)}
                  />
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
                    readOnly
                    prefix={`https://${SHOP}/`}
                    value={removeShopDomain(
                      productsData[productId]?.onlineStorePreviewUrl ||
                      productsData[productId]?.shopify_url
                    )}
                    connectedRight={
                      <Tooltip content="Copy link">
                        <Button
                          onClick={() =>
                            handleCopy(
                              removeShopDomain(
                                productsData[productId]?.onlineStorePreviewUrl,
                                productsData[productId]?.shopify_url
                              ),
                              'shopify-url'
                            )
                          }
                        >
                          <Icon source={copiedItems['shopify-url'] ? CheckIcon : ClipboardIcon} tone="base" />
                        </Button>
                      </Tooltip>
                    }
                  />
                </BlockStack>
                <Divider />
                {data?.plan_details?.features?.short_url_create && (
                  <BlockStack gap={200}>
                    <InlineStack gap={100}>
                      <Text as="h3">Custom URL</Text>
                      <Tooltip
                        content={`This custom URL, created with your store '${SHOP}', removes
                       Shopify's predefined words like 'products','pages'and 'collection`}
                      >
                        <Icon tone="base" source={InfoIcon} />
                      </Tooltip>
                    </InlineStack>
                    <TextField
                      prefix={`https://${SHOP}/`}
                      value={shortURL}
                      onChange={(newValue) => setShortURL(newValue)}
                      connectedRight={
                        shortURL !== "/" &&
                        shortURL !== "" &&
                        shortURL !== null &&
                        shortURL !== undefined && (
                          <Tooltip content="Copy link">
                            <Button onClick={() => handleCopy(shortURL, 'custom-url')}>
                              <Icon source={copiedItems['custom-url'] ? CheckIcon : ClipboardIcon} tone="base" />
                            </Button>
                          </Tooltip>
                        )
                      }
                    />
                  </BlockStack>
                )}
                <Divider />
                {data?.plan_details?.features?.custom_url_create && (
                  <BlockStack gap={200}>
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
                      value={customURL}
                      onChange={(newValue) => setCustomURL(newValue)}
                      connectedRight={
                        customURL !== "/" &&
                        customURL !== "" &&
                        customURL !== null &&
                        customURL !== undefined && (
                          <Tooltip content="Copy link">
                            <Button
                              onClick={() =>
                                handleCopy(customURL, "short-url")
                              }
                            >
                              <Icon source={copiedItems['short-url'] ? CheckIcon : ClipboardIcon} tone="base" />
                            </Button>
                          </Tooltip>
                        )
                      }
                    />
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
          {data?.plan_details?.features?.qr_code_create && (
            <Layout.Section variant="oneThird">
              <Card>
                <div
                  className="Polaris-BlockStack qr-code"
                  style={{
                    "--pc-block-stack-order": "column",
                    "--pc-block-stack-gap-xs": "var(--p-space-600)",
                  }}
                >
                  <Text as="h3" variant="headingMd">
                    QR Code
                  </Text>
                  {productsData[productId]?.qr_code &&
                    data?.plan_details?.features?.qr_code_create ? (
                    <>
                      <div ref={qrCodeRef}>
                        <QRCode
                          value={
                            `${SHOP}/` +
                            `${removeShopDomain(
                              productsData[productId]?.onlineStorePreviewUrl,
                              productsData[productId]?.shopify_url
                            )}` +
                            `?${productsData[productId]?.qr_code}`
                          }
                          size={190}
                        />
                      </div>
                      <Button
                        variant="primary"
                        icon={ArrowDownIcon}
                        onClick={() => downloadQRCode()}
                        disabled={!data?.plan_details?.features?.qr_code_create}
                      >
                        Download{" "}
                      </Button>
                    </>
                  ) : (
                    <div className="no-qr">
                      <BlockStack inlineAlign="center" gap={400}>
                        <Thumbnail source={NoQrIcon} size="large" />
                        <Text
                          variant="bodyXs"
                          tone="subdued"
                          alignment="center"
                        >
                          QR Code has been not generated yet!
                        </Text>
                      </BlockStack>
                    </div>
                  )}
                </div>
              </Card>
            </Layout.Section>
          )}
        </Layout>
      </Modal.Section>
    </Modal>
  );
}

export default Details;
/* DETAILS FUNCTIONAL COMPONENT END */
