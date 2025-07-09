import {
  BlockStack,
  Card,
  Text,
  InlineStack,
  IndexTable,
  Button,
  Tooltip,
  SkeletonBodyText,
  TextField,
  InlineGrid,
  Bleed,
  Layout,
  Select,
} from "@shopify/polaris";
import { CheckIcon, ClipboardIcon, ExportIcon, ViewIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from "react";
import { fetchData, getApiURL } from "../../action";
import { useParams } from "react-router-dom";
import View from "../shared/ViewModal";
import { formatNumber } from "../../utils";

function Links({ selectedDates, setStateTab }) {

  const { id } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const SHOP = urlParams.get("shop");

  const resourceName = {
    singular: "influencer",
    plural: "influencers",
  };

  const [selected, setSelected] = useState("1");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [influencer, setInfluencers] = useState([]);
  const [totalLinksData, setTotalLinksData] = useState([]);
  const [viewModalActive, setViewModalActive] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [productName, setProductName] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [copiedItems, setCopiedItems] = useState({});
const [storeCurrency, setStoreCurrency] = useState(null);
  const handleSelectChange = useCallback((value) => {
    setSelected(value);
  }, []);

  const options = [
    { label: "Newest", value: "1" },
    { label: "Oldest", value: "2" },
    // { label: 'Most spent', value: '3' },
    // { label: 'Most orders', value: '4' },
    { label: "Last name A–Z", value: "5" },
    { label: "Last name Z–A", value: "6" },
  ];

  const handleCopy = (link, itemId) => {
    navigator.clipboard
      .writeText(link)
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

  const handleExport = (data) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "export.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const showViewModal = (index, shopify_url) => {
    setViewData(index);
    setProductName(shopify_url)
    setViewModalActive(true);
  };

  const fetchInfluencers = async (
    page = 1,
    search = "",
    sort = "1",
    showPageLoader = false
  ) => {
    if (showPageLoader) {
      setIsPageLoading(true);
    } else {
      setIsTableLoading(true);
    }

    const formData = new FormData();
    formData.append("uid", id);
    formData.append("search", search);
    formData.append("sort", sort);
    formData.append("page", page);
    formData.append("per_page", 10);

    const response = await fetchData(getApiURL("link-list"), formData);

    if (response?.status === true) {
      setInfluencers(response?.data || []);
      setTotalLinksData(response?.all);
      setTotalPages(response?.pagination?.total_pages);
      setCurrentPage(response?.pagination?.current_page);
      setStoreCurrency(response?.currency_symbol || "Rs.");
    } else {
      setInfluencers([]);
    }

    if (showPageLoader) {
      setIsPageLoading(false);
    } else {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    const shouldFetch =
      id ||
      (!!searchValue || selected !== "1" || !!selectedDates);

    if (!shouldFetch) return;

    const delayDebounce = setTimeout(() => {
      const isFromIdChange = !!id;
      const query = isFromIdChange ? "" : searchValue;
      const applyReset = isFromIdChange;

      fetchInfluencers(1, query, selected, applyReset);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [id, searchValue, selected, selectedDates]);

  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchInfluencers(newPage, searchValue, selected);
    }
  };

  const handleSearchChange = useCallback((value) => {
    setSearchValue(value);
  }, []);

  const queryValue = "";
  const nextData = false;
  const pageNumber = 1;
  const limit = 10;

  return (
    <Layout>
      <Layout.Section>
        {isPageLoading ? (
          <BlockStack gap="400">
            <InlineGrid gap="200" columns={4}>
              {[...Array(4)].map((_, idx) => (
                <Card>
                  <SkeletonBodyText />
                </Card>
              ))}
            </InlineGrid>
            <Card>
              <SkeletonBodyText lines={5} />
            </Card>
          </BlockStack>
        ) : (
          <Layout>
            <Layout.Section>
              <InlineGrid columns={4} gap={400}>
                {[
                  { label: "Total Clicks", key: "total_clicks" },
                  { label: "Total Add To Cart", key: "total_add_to_cart" },
                  { label: "Total Checkouts", key: "total_checkout" },
                  { label: "Total Sales", key: "total_sales" },
                ].map(({ label, key }) => {
                  const total = totalLinksData?.total?.[key] || 0;
                  const short = totalLinksData?.short_url_anlytics?.[key] || 0;
                  const custom =
                    totalLinksData?.custom_url_anlytics?.[key] || 0;
                  const qr = totalLinksData?.qr_code_anlytics?.[key] || 0;

                  return (
                    <Card key={label}>
                      <BlockStack gap={400}>
                        <InlineStack gap={200} align="space-between">
                          <Text variant="bodyLg" fontWeight="bold">
                            {label}
                          </Text>
                          <Text variant="bodyMd" fontWeight="bold">
                            {key === "total_sales" ? storeCurrency + formatNumber(total) : formatNumber(total)}
                          </Text>
                        </InlineStack>
                        <BlockStack gap={200}>
                          <InlineStack align="space-between">
                            <Text>Short URL</Text>
                            <Text>{key === "total_sales" ? storeCurrency + formatNumber(short) : formatNumber(short)}</Text>
                          </InlineStack>
                          {/* <InlineStack align="space-between">
                            <Text>Custom URL</Text>
                            <Text>{formatNumber(custom)}</Text>
                          </InlineStack> */}
                          <InlineStack align="space-between">
                            <Text>QR</Text>
                            <Text>{key === "total_sales" ? storeCurrency + formatNumber(qr) : formatNumber(qr)}</Text>
                          </InlineStack>
                        </BlockStack>
                      </BlockStack>
                    </Card>
                  );
                })}
              </InlineGrid>
            </Layout.Section>
            <Layout.Section>
              <Card>
                <BlockStack gap={300}>
                  <TextField
                    label="Search Influencers"
                    labelHidden
                    value={searchValue}
                    onChange={handleSearchChange}
                    placeholder="Search by title"
                    clearButton
                    onClearButtonClick={() => handleSearchChange("")}
                    connectedRight={
                      <InlineStack gap={200}>
                        <Select
                          label="Sort by"
                          labelInline
                          options={options}
                          onChange={handleSelectChange}
                          value={selected}
                        />
                        <Button
                          icon={ExportIcon}
                          onClick={() => handleExport(influencer)}
                          size="large"
                          disabled={
                            !influencer || Object.keys(influencer).length === 0
                          }
                        >
                          Export All
                        </Button>
                      </InlineStack>
                    }
                  />
                  <Bleed marginInline="400" marginBlockEnd={400}>
                    <IndexTable
                      resourceName={resourceName}
                      itemCount={influencer.length}
                      selectable={false}
                      headings={[
                        { title: "Title" },
                        { title: "Shopify URL" },
                        { title: "Clicks", alignment: "end" },
                        { title: "Add to Cart", alignment: "end" },
                        { title: "Checkouts", alignment: "end" },
                        { title: "Sales", alignment: "end" },
                        { title: "Actions", alignment: "end" },
                      ]}
                      pagination={{
                        hasPrevious: currentPage > 1,
                        hasNext: currentPage < totalPages,
                        onPrevious: () => handlePageChange(currentPage - 1),
                        onNext: () => handlePageChange(currentPage + 1),
                        accessibilityLabel: "Pagination",
                        label: `Page ${currentPage} of ${totalPages}`,
                      }}
                    >
                      {isTableLoading
                        ? [...Array(5)].map((_, index) => (
                          <IndexTable.Row
                            id={`skeleton-${index}`}
                            key={`skeleton-${index}`}
                            position={index}
                          >
                            {Array(6)
                              .fill(null)
                              .map((_, idx) => (
                                <IndexTable.Cell key={idx}>
                                  <SkeletonBodyText lines={1} />
                                </IndexTable.Cell>
                              ))}
                          </IndexTable.Row>
                        ))
                        : influencer?.map((item, index) => {
                          return (
                            <IndexTable.Row
                              id={item.id}
                              key={item.id}
                              position={index}
                            >
                              <IndexTable.Cell>{item.title}</IndexTable.Cell>
                              <IndexTable.Cell>
                                <Button
                                  onClick={() =>
                                    window.open(
                                      `https://${SHOP}${item?.shopify_url}`
                                    )
                                  }
                                  variant="plain"
                                >
                                  {item.shopify_url}
                                </Button>
                              </IndexTable.Cell>
                              <IndexTable.Cell>
                                <InlineStack align="end">
                                  {formatNumber(item.anlytics.total.total_clicks) || 0}
                                </InlineStack>
                              </IndexTable.Cell>
                              <IndexTable.Cell>
                                <InlineStack align="end">
                                  {formatNumber(item.anlytics.total.total_add_to_cart) || 0}
                                </InlineStack>
                              </IndexTable.Cell>
                              <IndexTable.Cell>
                                <InlineStack align="end">
                                  {formatNumber(item.anlytics.total.total_checkout) || 0}
                                </InlineStack>
                              </IndexTable.Cell>
                              <IndexTable.Cell>
                                <InlineStack align="end">
                                  {storeCurrency +formatNumber(item.anlytics.total.total_sales) || 0}
                                </InlineStack>
                              </IndexTable.Cell>
                              <IndexTable.Cell>
                                <InlineStack gap="200" align="end">
                                  <Tooltip content="View Details">
                                    <Button
                                      icon={ViewIcon}
                                      onClick={() => showViewModal(index, item.shopify_url)}
                                      accessibilityLabel="View Details"
                                    />
                                  </Tooltip>
                                  <Tooltip content={copiedItems[item.id] ? "Copied!" : "Copy"}>
                                    <Button
                                      icon={copiedItems[item.id] ? CheckIcon : ClipboardIcon}
                                      onClick={() =>
                                        handleCopy(
                                          `https://${SHOP}${item?.shopify_url}`,
                                          item.id
                                        )
                                      }
                                      accessibilityLabel="Copy Link"
                                    />
                                  </Tooltip>
                                  <Tooltip content="Export">
                                    <Button
                                      icon={ExportIcon}
                                      onClick={() => handleExport(item)}
                                      accessibilityLabel="Export Link"
                                    />
                                  </Tooltip>
                                </InlineStack>
                              </IndexTable.Cell>
                            </IndexTable.Row>
                          );
                        })}
                    </IndexTable>
                  </Bleed>
                </BlockStack>
              </Card>
            </Layout.Section>
            <View
              influencerID={id}
              data={influencer}
              id={viewData}
              isViewModal={viewModalActive}
              type={viewData?.page_type}
              setIsViewModal={setViewModalActive}
              getProductsData={fetchInfluencers}
              limit={limit}
              isPageType={currentPage}
              queryValue={queryValue}
              previousData={totalPages}
              nextData={nextData}
              APIPath="influencer-analytics"
              pageNumber={pageNumber}
              setStateTab={setStateTab}
              storeCurrency={storeCurrency}
            />
          </Layout>
        )}
      </Layout.Section>
      <Layout.Section></Layout.Section>
      <Layout.Section></Layout.Section>
    </Layout>
  );
}

export default Links;
