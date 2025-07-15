import React, { useState, useEffect } from "react";
import {
  Bleed,
  Button,
  Card,
  IndexFiltersMode,
  IndexTable,
  Layout,
  Page,
  Select,
  Text,
  TextField,
  useIndexResourceState,
  useSetIndexFiltersMode,
} from "@shopify/polaris";

import { useNavigate } from "react-router-dom";
import { fetchData, getApiURL } from "../action";
import { useApiData } from "../components/ApiDataProvider";
import { SearchIcon, XIcon } from "@shopify/polaris-icons";
import moment from "moment";
import { removeShopDomain } from "../utils";

const Orders = ({ selectedTab }) => {
  const [queryValue, setQueryValue] = useState("");
  const [Timer, setTimer] = useState(null);
  const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);
  const navigate = useNavigate();
  const { data, loading, error } = useApiData();
  const [ordersData, setOrdersData] = useState([]);
  const [filteredOrdersData, setFilteredOrdersData] = useState([]);
  const [isLoading, setIsloading] = useState(false);
  const limit = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [sortSelected, setSortSelected] = useState("ASC");
  const urlParams = new URLSearchParams(window.location.search);
  const SHOP = urlParams.get("shop");
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(ordersData);

  useEffect(() => {
    getOrdersData(); // Load orders when the component mounts
  }, [sortSelected]);

  useEffect(() => {
    if (queryValue.trim() === "") {
      setFilteredOrdersData(ordersData);
    } else {
      const filteredData = ordersData.filter((order) => {
        const orderName = order?.order_name?.toLowerCase();
        const customerName = order?.customer_name?.toLowerCase();
        const customerEmail = order?.customer_email?.toLowerCase();
        const query = queryValue.toLowerCase();

        return (
          orderName?.includes(query) ||
          customerName?.includes(query) ||
          customerEmail?.includes(query)
        );
      });
      setFilteredOrdersData(filteredData);
    }

    // Reset the pagination to the first page when the query changes
    setCurrentPage(1);
  }, [ordersData, queryValue]);

  const handleSort = (value) => {
    setSortSelected(value);
  };

  const handleQueryValueRemove = () => {
    setQueryValue("");
    setFilteredOrdersData(ordersData);
  };

  const handleFiltersQueryChange = (newValue) => {
    setIsloading(true);
    clearTimeout(Timer);
    setQueryValue(newValue);
    const myTimeOut = setTimeout(() => {
      setIsloading(false);
    }, 1000);
    setTimer(myTimeOut);
  };

  const getOrdersData = async () => {
    setIsloading(true);
    const data = new FormData();
    data.append("orderby", sortSelected);
    const response = await fetchData(getApiURL("orders"), data);
    setIsloading(false);
    if (response.status == true) {
      setOrdersData(response?.data);
      setFilteredOrdersData(response?.data);
    }
  };

  const changePage = (direction) => {
    let newPage = currentPage;
    if (direction === "next") {
      newPage = currentPage + 1;
    } else if (direction === "previous") {
      newPage = currentPage - 1;
    }
    setCurrentPage(newPage);
  };

  // Slice the data according to the current page and limit
  const paginatedData = filteredOrdersData.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  const rowMarkup = paginatedData.map((val, index) => (
    <IndexTable.Row
      id={index}
      key={index}
      selected={selectedResources?.includes(index)}
      position={index}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          <div
            style={{
              whiteSpace: "normal",
              wordBreak: "break-word",
              maxWidth: "800px",
            }}
          >
            <Button
              onClick={() =>
                window.open(
                  `https://admin.shopify.com/store/${SHOP.replace(
                    ".myshopify.com",
                    ""
                  )}/orders/${val?.order_id}`
                )
              }
              disabled={!data?.plan_details?.features?.orders}
              variant="plain"
            >
              {val?.order_name}
            </Button>
          </div>
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{val?.customer_name || "-"}</IndexTable.Cell>
      <IndexTable.Cell>{val?.customer_email || "-"}</IndexTable.Cell>
      <IndexTable.Cell>
        {moment(val?.updated_at).format("DD MMM YYYY") || "-"}
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page title="Orders">
      <Layout>
        <Layout.Section>
          <Card>
            {!data?.plan_details?.features?.orders && (
              <div className="premium-plan">
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
              className="Polaris-BlockStack"
              style={{
                "--pc-block-stack-order": "column",
                "--pc-block-stack-gap-xs": " var(--p-space-200)",
                ...(!data?.plan_details?.features?.orders && {
                  filter: "blur(3px)",
                  opacity: 0.2,
                }),
              }}
            >
              <TextField
                placeholder="Search by name or email"
                value={queryValue}
                onChange={handleFiltersQueryChange}
                autoComplete="off"
                suffix={
                  queryValue ? (
                    <Button
                      variant="plain"
                      icon={XIcon}
                      marginTop={20}
                      onClick={handleQueryValueRemove}
                    />
                  ) : (
                    <Button variant="plain" icon={SearchIcon} marginTop={10} />
                  )
                }
                disabled={!data?.plan_details?.features?.orders}
                connectedRight={
                  <Select
                    value={sortSelected}
                    onChange={handleSort}
                    disabled={!data?.plan_details?.features?.orders}
                    options={[
                      {
                        label: "Oldest to Newest",
                        value: "ASC",
                      },
                      {
                        label: "Newest to Oldest",
                        value: "DESC",
                      },
                    ]}
                    label="Sort by :"
                    labelInline
                  />
                }
              />
              <Bleed marginInline="400" marginBlockEnd="400">
                <IndexTable
                  resourceName={{ singular: "Order", plural: "Orders" }}
                  itemCount={filteredOrdersData.length}
                  selectedItemsCount={
                    allResourcesSelected ? "All" : selectedResources?.length
                  }
                  onSelectionChange={handleSelectionChange}
                  selectable={false}
                  loading={isLoading}
                  headings={[
                    { title: "Order" },
                    { title: "Name" },
                    { title: "Email" },
                    { title: "Created Date" },
                  ]}
                  pagination={{
                    hasNext: currentPage * limit < filteredOrdersData.length,
                    hasPrevious: currentPage > 1,
                    onNext: () => changePage("next"),
                    onPrevious: () => changePage("previous"),
                  }}
                >
                  {rowMarkup}
                </IndexTable>
              </Bleed>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Orders;
