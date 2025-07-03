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
  Link,
  FormLayout,
} from "@shopify/polaris";
import { ArrowDownIcon, CheckIcon, ClipboardIcon, InfoIcon } from "@shopify/polaris-icons";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode.react";
import { formatNumber, handleCopyClick, removeShopDomain, } from "../../utils";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import NoQrIcon from "/assets/no-qr.svg";
import { useApiData } from "../ApiDataProvider"

/* IMPORT REQUIRED MODULES END */

/* VIEW FUNCTIONAL COMPONENT START */
function View({
  influencerID,
  data,
  setData,
  id,
  isViewModal,
  setIsViewModal,
  type,
  getProductsData,
  limit,
  isPageType,
  queryValue,
  previousData,
  nextData,
  APIPath,
  pageNumber,
}) {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const SHOP = urlParams.get("shop");
  const qrCodeRef = useRef(null);
  const { data: plancheck, loading, error } = useApiData();
  const [copiedItems, setCopiedItems] = useState({});

  /* MORE DETAILS HANDLER START */
  const handleMoreDetails = () => {
    const params = {};
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }
    sessionStorage.setItem(
      "detailsData",
      JSON.stringify({
        influencerID,
        productsData: data,
        productId: id,
        title: data[id]?.title || data[id]?.path,
        type,
        queryValue,
        isPageType,
        limit,
        nextData,
        previousData,
        APIPath,
        pageNumber,
      })
    );

    navigate(`/details${window.location.search}`);
  };
  /* MORE DETAILS HANDLER END */

  const utmData = data[id]?.utm_datas;

  const buildQueryParams = (baseURL, type = "shopify") => {
    const params = new URLSearchParams();
    if (influencerID) params.append("refby", influencerID);

    let utmObj = {};
    if (utmData) {
      if (typeof utmData === "string") {
        try {
          utmObj = JSON.parse(utmData);
        } catch (e) {
          console.error("Invalid JSON in utm_datas");
        }
      } else if (typeof utmData === "object") {
        utmObj = utmData;
      }
    }

    if (utmObj && typeof utmObj === "object") {
      Object.entries(utmObj).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    let domainPrefix = "";
    if (type === "custom") {
      domainPrefix = `https://${SHOP}/`;
    } else if (type === "short") {
      domainPrefix = `srtr.me/`;
    } else {
      domainPrefix = `https://${SHOP}/`;
    }

    return `${domainPrefix}${baseURL}?${params.toString()}`;
  };

  let parsedUtmData = {};
  try {
    parsedUtmData = JSON.parse(utmData || '{}');
  } catch (e) {
    console.error('Invalid JSON in utm_datas');
  }

  const validUtmEntries = Object.entries(parsedUtmData).filter(
    ([key, value]) => value?.trim() !== ''
  );

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

  const downloadQRCode = () => {
    if (qrCodeRef.current) {
      html2canvas(qrCodeRef.current, {
        scale: 2,
        backgroundColor: "#fff",
      })
        .then((canvas) => {
          canvas.toBlob((blob) => {
            saveAs(blob, `${data[id]?.handle}-qrcode.jpg`);
          }, "image/jpeg");
        })
        .catch((err) => {
          console.error("Error generating the canvas:", err);
        });
    } else {
      console.error("qrCodeRef is null");
    }
  };

  return (
    <Modal
      open={isViewModal}
      id="view-modal"
      size="large"
      onClose={() => setIsViewModal(false)}
      title={data[id]?.title}
      primaryAction={{
        content: "More Details",
        onAction: () => handleMoreDetails(),
      }}
    >
      <Modal.Section>
        <Layout>
          <Layout.Section>
            <InlineGrid gap="200" columns={4}>
              <Card>
                {!plancheck?.plan_details?.features
                  ?.total_clicks_listing_page &&
                  !plancheck?.plan_details?.features
                    ?.total_clicks_product_page && (
                    <div class="premium-plan">
                      <p>
                        View total clicks with
                        <Button
                          size="slim"
                          onClick={() =>
                            navigate(`/ plans${window.location.search}`)
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
                    "--pc-block-stack-gap-xs": "var(--p-space-200)",
                    ...(!plancheck?.plan_details?.features
                      ?.total_clicks_listing_page &&
                      !plancheck?.plan_details?.features
                        ?.total_clicks_product_page && {
                      filter: "blur(3px)",
                      opacity: 0.2,
                    }),
                  }}
                >
                  <Text as="h2" tone="subdued" variant="headingSm">
                    TOTAL CLICKS
                  </Text>
                  <Text as="h4" variant="headingLg">
                    {formatNumber(data[id]?.anlytics?.total?.total_clicks || 0)}
                  </Text>
                </div>
              </Card>
              <Card sectioned>
                {!plancheck?.plan_details?.features
                  ?.total_add_to_cart_listing_page &&
                  !plancheck?.plan_details?.features
                    ?.total_add_to_cart_product_page && (
                    <div class="premium-plan">
                      <p>
                        View total add to cart with
                        <Button
                          size="slim"
                          onClick={() =>
                            navigate(`/ plans${window.location.search}`)
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
                    "--pc-block-stack-gap-xs": "var(--p-space-200)",
                    ...(!plancheck?.plan_details?.features
                      ?.total_add_to_cart_listing_page &&
                      !plancheck?.plan_details?.features
                        ?.total_add_to_cart_product_page && {
                      filter: "blur(3px)",
                      opacity: 0.2,
                    }),
                  }}
                >
                  <Text as="h2" tone="subdued" variant="headingSm">
                    TOTAL ADD TO CART
                  </Text>

                  <Text as="h4" variant="headingLg">
                    {formatNumber(
                      data[id]?.anlytics?.total?.total_add_to_cart || 0
                    )}
                  </Text>
                </div>
              </Card>
              <Card>
                {!plancheck?.plan_details?.features
                  ?.total_checkouts_listing_page &&
                  !plancheck?.plan_details?.features
                    ?.total_checkouts_product_page && (
                    <div class="premium-plan">
                      <p>
                        View total checkouts with
                        <Button
                          size="slim"
                          onClick={() =>
                            navigate(`/ plans${window.location.search}`)
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
                    "--pc-block-stack-gap-xs": "var(--p-space-200)",
                    ...(!plancheck?.plan_details?.features
                      ?.total_checkouts_listing_page &&
                      !plancheck?.plan_details?.features
                        ?.total_checkouts_product_page && {
                      filter: "blur(3px)",
                      opacity: 0.2,
                    }),
                  }}
                >
                  <Text as="h2" tone="subdued" variant="headingSm">
                    TOTAL CHECKOUTS
                  </Text>

                  <Text as="h4" variant="headingLg">
                    {formatNumber(
                      data[id]?.anlytics?.total?.total_checkout || 0
                    )}
                  </Text>
                </div>
              </Card>
              <Card>
                {!plancheck?.plan_details?.features?.total_sales_listing_page &&
                  !plancheck?.plan_details?.features
                    ?.total_sales_product_page && (
                    <div class="premium-plan">
                      <p>
                        View total sales with
                        <Button
                          size="slim"
                          onClick={() =>
                            navigate(`/ plans${window.location.search}`)
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
                    "--pc-block-stack-gap-xs": "var(--p-space-200)",
                    ...(!plancheck?.plan_details?.features
                      ?.total_sales_listing_page &&
                      !plancheck?.plan_details?.features
                        ?.total_sales_product_page && {
                      filter: "blur(3px)",
                      opacity: 0.2,
                    }),
                  }}
                >
                  <Text as="h2" tone="subdued" variant="headingSm">
                    TOTAL SALES
                  </Text>

                  <Text as="h4" variant="headingLg">
                    {formatNumber(data[id]?.anlytics?.total?.total_sales || 0)}
                  </Text>
                </div>
              </Card>
            </InlineGrid>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap={200}>
                <BlockStack gap={200}>
                  <InlineStack gap={100}>
                    <Text as="h3">Name</Text>
                  </InlineStack>
                  <TextField readOnly value={data[id]?.title} />
                </BlockStack>

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
                    value={
                      removeShopDomain(
                        data[id]?.onlineStorePreviewUrl,
                        data[id]?.shopify_url
                      )
                    }
                    connectedRight={
                      < Tooltip content="Copy link" >
                        <Button
                          onClick={() =>
                            handleCopy(
                              buildQueryParams(
                                removeShopDomain(
                                  data[id]?.onlineStorePreviewUrl,
                                  data[id]?.shopify_url
                                ), "shopify"
                              ),
                              'shopify-url'
                            )
                          }
                        >
                          <Icon source={copiedItems['shopify-url'] ? CheckIcon : ClipboardIcon} tone="base" />
                        </Button>
                      </Tooltip >
                    }
                  />
                </BlockStack >

                {APIPath !== "influencer-analytics" && (
                  <>
                    <Divider />
                    <BlockStack gap={200}>
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
                        readOnly
                        prefix={`https://${SHOP}/`}
                        value={removeShopDomain(
                          data[id]?.short_link,
                          data[id]?.path
                        )}
                        connectedRight={
                          removeShopDomain(data[id]?.short_link) !== "/" &&
                          removeShopDomain(data[id]?.short_link) !== "" &&
                          removeShopDomain(data[id]?.short_link) !== null &&
                          removeShopDomain(data[id]?.short_link) !==
                          undefined && (
                            <Tooltip content="Copy link">
                              <Button
                                onClick={() =>
                                  handleCopy(
                                    buildQueryParams(
                                      removeShopDomain(data[id]?.short_link, ""), "custom"
                                    ),
                                    'custom-url'
                                  )
                                }
                              >
                                <Icon source={copiedItems['custom-url'] ? CheckIcon : ClipboardIcon} tone="base" />
                              </Button>
                            </Tooltip>
                          )
                        }
                      />
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
                  <TextField
                    readOnly
                    prefix={`${CUSTOM_DOMAIN}`}
                    value={removeShopDomain(data[id]?.custom_url, "")}
                    connectedRight={
                      data[id]?.custom_url !== "/" &&
                      data[id]?.custom_url !== "" &&
                      data[id]?.custom_url !== null &&
                      data[id]?.custom_url !== undefined && (
                        <Tooltip content="Copy link">
                          <Button
                            onClick={() =>
                              handleCopy(
                                buildQueryParams(
                                  removeShopDomain(data[id]?.custom_url, ""),
                                  "short"
                                ),
                                'short-url'
                              )
                            }
                          >
                            <Icon source={copiedItems['short-url'] ? CheckIcon : ClipboardIcon} tone="base" />
                          </Button>
                        </Tooltip>
                      )
                    }
                  />
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
                          <TextField
                            key={key}
                            readOnly
                            value={key}
                          />
                          <TextField
                            key={key}
                            readOnly
                            value={value}
                          />
                        </FormLayout.Group>
                      </FormLayout>
                    ))}
                  </BlockStack>
                )}

              </BlockStack >
            </Card >
          </Layout.Section >

          <Layout.Section variant="oneThird">
            <Card>
              <div
                className="Polaris-BlockStack qr-code"
                style={{
                  "--pc-block-stack-order": "column",
                  "--pc-block-stack-gap-xs": "var(--p-space-500)",
                }}
              >
                <Text as="h3" variant="headingMd">
                  QR Code
                </Text>
                {!plancheck?.plan_details?.features?.qr_code_create && (
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
                    ...(!plancheck?.plan_details?.features?.qr_code_create && {
                      filter: "blur(3px)",
                      opacity: 0.2,
                    }),
                  }}
                >
                  {data[id]?.qr_code ? (
                    <>
                      <div ref={qrCodeRef} className="qr-code-contener">
                        <QRCode
                          value={buildQueryParams(
                            removeShopDomain(
                              data[id]?.onlineStorePreviewUrl,
                              data[id]?.shopify_url,

                            ) + `?${data[id]?.qr_code}`
                          )}
                          size={APIPath === "influencer-analytics" ? 131 : 131}
                        />
                      </div>
                      <Button
                        variant="primary"
                        icon={ArrowDownIcon}
                        onClick={() => downloadQRCode()}
                      >
                        Download
                      </Button>
                    </>
                  ) : (
                    <div className="no-qr">
                      <BlockStack inlineAlign="center" gap={300}>
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
              </div>
            </Card>
          </Layout.Section>
        </Layout >
      </Modal.Section >
    </Modal >
  );
}

export default View;
/* VIEW FUNCTIONAL COMPONENT END */

