import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  BlockStack,
  Card,
  Text,
  InlineStack,
  IndexTable,
  Select,
  SkeletonBodyText,
  TextField,
  SkeletonTabs,
  Badge,
  EmptySearchResult,
  InlineGrid,
  Bleed,
  Layout,
  Box,
} from "@shopify/polaris";
import { fetchData, getApiURL } from "../../action";
import { formatDate, formatNumber } from "../../utils";

function Payouts() {
  const { id } = useParams();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [influencerPayouts, setInfluencersPayouts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState("1");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [influencersPayoutsTotal, setInfluencersPayoutsTotal] = useState([]);
  const [storeCurrency, setStoreCurrency] = useState("Rs.");

  const payoutMethodOptions = [
    { label: "All", value: "0" },
    { label: "Bank Transfer", value: "bank_transfer" },
    { label: "PayPal", value: "paypal" },
    { label: "Manual Paid", value: "manual" },
  ];

  const sortOrderOptions = [
    { label: "Descending", value: "DESC" },
    { label: "Ascending", value: "ASC" },
  ];

  const fetchInfluencersPayouts = async (
    page = 1,
    search = "",
    payoutMethod = "1",
    order = "DESC",
    initial = false
  ) => {
    if (initial) {
      setIsInitialLoading(true);
    } else {
      setIsLoading(true);
    }

    const formData = new FormData();
    formData.append("search", search);
    formData.append("sortBy", "created_at");
    formData.append("sortOrder", order);
    formData.append("page", page);
    formData.append("payoutMethod", payoutMethod);

    if (payoutMethod !== "1") {
      formData.append("method", payoutMethod);
    }

    try {
      const response = await fetchData(getApiURL("/get-payouts"), formData);

      if (response?.status === true) {
        setInfluencersPayouts(response.records || []);
        setInfluencersPayoutsTotal(response.totals || []);
        setTotalPages(response?.pagination?.total_pages || 1);
        setCurrentPage(response?.pagination?.current_page || 1);

      } else {
        setInfluencersPayouts([]);
        setTotalPages(1);
      }
    } catch (error) {
      setInfluencersPayouts([]);
      setTotalPages(1);
    } finally {
      if (initial) {
        setIsInitialLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const fetchStoreCurrency = async () => {
    const response = await fetchData(getApiURL("/get-influencers"));
    if (response?.status === true) {
      setStoreCurrency(response?.store_currency)
    } else {
      console.error("Error fetching influencers:", response?.message);
    }
  };

  useEffect(() => {
    fetchStoreCurrency();
  }, []);

  const handlePayoutChange = useCallback(
    (value) => {
      setSelectedPayoutMethod(value);
      setCurrentPage(1);
      fetchInfluencersPayouts(1, searchValue, value, sortOrder, false);
    },
    [searchValue, sortOrder]
  );

  const handleSearchChange = useCallback(
    (value) => {
      setSearchValue(value);
      setCurrentPage(1);
      fetchInfluencersPayouts(1, value, selectedPayoutMethod, sortOrder, false);
    },
    [selectedPayoutMethod, sortOrder]
  );

  const handleSortOrderChange = useCallback(
    (value) => {
      setSortOrder(value);
      setCurrentPage(1);
      fetchInfluencersPayouts(
        1,
        searchValue,
        selectedPayoutMethod,
        value,
        false
      );
    },
    [searchValue, selectedPayoutMethod]
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchInfluencersPayouts(
        newPage,
        searchValue,
        selectedPayoutMethod,
        sortOrder,
        false
      );
    }
  };

  useEffect(() => {
    fetchInfluencersPayouts(
      1,
      searchValue,
      selectedPayoutMethod,
      sortOrder,
      true
    );
  }, [id]);

  const getAmountByMethod = (method) => {
    const entry = influencersPayoutsTotal.find(
      (item) => item.payout_method === method
    );
    return entry ? entry.total_amount : "0.00";
  };

  if (isInitialLoading) {
    return (
      <BlockStack gap="400">
        <InlineGrid gap="200" columns={3}>
          {[...Array(3)].map((_, idx) => (
            <Card>
              <SkeletonBodyText />
            </Card>
          ))}
        </InlineGrid>
        <Card>
          <SkeletonBodyText lines={10} />
        </Card>
      </BlockStack>
    );
  }

  return (
    <Layout>
      <Layout.Section>
        <InlineGrid columns={3} gap={400}>
          {[
            { label: "PayPal Payouts", method: "paypal" },
            { label: "Manual Paid", method: "manual" },
            { label: "Bank Transfer", method: "bank_transfer" },
          ].map(({ label, method }) => (
            <Card key={label}>
              <BlockStack gap={200}>
                <Text as="p" fontWeight="bold" tone="subdued" variant="bodyMd">
                  {label}
                </Text>
                <Text as="h1" tone="base" variant="bodyMd" fontWeight="bold">
                  {storeCurrency} {formatNumber(getAmountByMethod(method))}
                </Text>
              </BlockStack>
            </Card>
          ))}
        </InlineGrid>
      </Layout.Section>
      <Layout.Section>
        <Card>
          <BlockStack gap={300}>
            <TextField
              label="Search Payouts"
              labelHidden
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search Payouts"
              clearButton
              onClearButtonClick={() => handleSearchChange("")}
              connectedRight={
                <InlineStack gap={200}>
                  <Select
                    label="Sort by"
                    labelInline
                    options={sortOrderOptions}
                    onChange={handleSortOrderChange}
                    value={sortOrder}
                  />{" "}
                  <Select
                    options={payoutMethodOptions}
                    onChange={handlePayoutChange}
                    value={selectedPayoutMethod}
                  />
                </InlineStack>
              }
            />
            {isLoading ? (
              <>
                <Box style={{ padding: "15px" }}>
                  <SkeletonTabs count={1} />
                  <SkeletonBodyText lines={5} />
                </Box>
              </>
            ) : (
              <Bleed marginInline="400" marginBlockEnd={300}>
                <IndexTable
                  resourceName={{ singular: "Payout", plural: "Payouts" }}
                  itemCount={influencerPayouts.length}
                  selectable={false}
                  headings={[
                    { title: "Influencer Name" },
                    { title: "Amount", alignment: "end" },
                    { title: "Payment Method", alignment: "end" },
                    { title: "Payment Date", alignment: "end" },
                    { title: "Status", alignment: "end" },
                  ]}
                  emptyState={
                    <EmptySearchResult
                      title="No Payouts found"
                      description="Try changing the filters or search term"
                      withIllustration
                    />
                  }
                  pagination={{
                    hasPrevious: currentPage > 1,
                    hasNext: currentPage < totalPages,
                    onPrevious: () => handlePageChange(currentPage - 1),
                    onNext: () => handlePageChange(currentPage + 1),
                    accessibilityLabel: "Pagination",
                    label: `Page ${currentPage} of ${totalPages}`,
                  }}
                >
                  {influencerPayouts.map((item, index) => (
                    <IndexTable.Row
                      id={`row-${index}`}
                      key={`row-${index}`}
                      position={index}
                    >
                      <IndexTable.Cell>
                        {item.influencer_name || "-"}
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <InlineStack align="end">
                          £{formatNumber(item.amount) || "0.00"}
                        </InlineStack>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <InlineStack align="end">
                          {payoutMethodOptions.find(
                            (opt) => opt.value === item.payout_method
                          )?.label || "-"}
                        </InlineStack>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <InlineStack align="end">
                          {formatDate(item.payout_date || "-")}
                        </InlineStack>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <InlineStack align="end">
                          <Badge
                            tone={
                              item.status === "pending" ? "warning" : "success"
                            }
                          >
                            {item.status.charAt(0).toUpperCase() +
                              item.status.slice(1).toLowerCase()}
                          </Badge>
                        </InlineStack>
                      </IndexTable.Cell>
                    </IndexTable.Row>
                  ))}
                </IndexTable>
              </Bleed>
            )}
          </BlockStack>
        </Card>
      </Layout.Section>
      <Layout.Section></Layout.Section>
      <Layout.Section></Layout.Section>
    </Layout>
  );
}

export default Payouts;
