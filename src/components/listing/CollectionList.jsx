/* IMPORT REQUIRED MODULES START */
import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  ButtonGroup,
  IndexFilters,
  IndexFiltersMode,
  IndexTable,
  InlineStack,
  LegacyCard,
  Text,
  useIndexResourceState,
  useSetIndexFiltersMode,
} from "@shopify/polaris";
import { useNavigate } from "react-router-dom";
import { fetchData, getApiURL } from "../../action";
import ConfirmationModal from "./ConfirmationModal";
import { removeShopDomain } from "../../utils";
import { useApiData } from "../ApiDataProvider";
import { Details, View } from "..";
/* IMPORT REQUIRED MODULES END */

/* COLLECTION LIST FUNCTIONAL COMPONENT START */
const CollectionList = ({ selectedTab }) => {
  const [queryValue, setQueryValue] = useState("");
  const [isDetailsModal, setIsDetailsModal] = useState(false);
  const [Timer, setTimer] = useState(null);
  const [isRegenerateModal, setIsRegenerateModal] = useState(false);
  const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);
  const navigate = useNavigate();
  const { data, loading, error } = useApiData();
  const [collectionsData, setCollectionData] = useState([]);
  const [productId, setProductId] = useState("");
  const [isLoading, setIsloading] = useState(false);
  const [isViewModal, setIsViewModal] = useState(false);
  const [isPageType, setIsPageType] = useState("");
  const [nextData, setNextData] = useState(false);
  const limit = 10;
  const [previousData, setPreviousData] = useState(false);
  const [pageData, setPageData] = useState("");
  const urlParams = new URLSearchParams(window.location.search);
  const SHOP = urlParams.get("shop");
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(collectionsData);


  const handleQueryValueRemove = () => {
    setQueryValue("");
    const data = new FormData();
    data.append("limit", limit);
    getCollectionsData(data);
  };

  /* QUERY FILTER CHANGE HANDLER START */
  const handleFiltersQueryChange = (newValue) => {
    setIsloading(() => true);
    clearTimeout(Timer);
    setQueryValue(newValue);
    const myTimeOut = setTimeout(() => {
      const data = new FormData();
      data.append("limit", limit);
      data.append("search", newValue);
      getCollectionsData(data);
    }, 1000);
    setTimer(myTimeOut);
  };
  /* QUERY FILTER CHANGE HANDLER END */

  /* GENERATE HANDLER START */
  const handleGenerate = (id, title) => {
    // setIsDetailsModal(true);
    const params = {};
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }
    setProductId(id);
    // setIsDetailsModal(true);
    const dataToPass = {
      productsData: collectionsData,
      productId: id,
      title,
      type: "collection",
      queryValue,
      isPageType,
      limit,
      nextData: pageData,
      previousData: pageData,
      regenerate: false,
      APIPath: "/collection_list",
    };
    sessionStorage.setItem("detailsData", JSON.stringify(dataToPass));

    navigate(`/details?${new URLSearchParams(params)}`);
  };
  /* GENERATE HANDLER END */

  /* GET PRODUCTS DATA HANDLER START */
  const getCollectionsData = async (data) => {
    setPageData(data?.get("previousPage") || data?.get("nextPage"));
    setIsloading(true);
    const response = await fetchData(getApiURL("/collection_list"), data);
    setIsloading(false);
    if (response.status === true) {
      setCollectionData(response?.data);
      setPreviousData(response?.page?.previous || false);
      setNextData(response?.page?.next || false);
    }
  };
  /* GET PRODUCTS DATA HANDLER END */

  /* CHANGE PAGE HANDLER START */
  const changePage = (type) => {
    setIsloading(() => true);
    setIsPageType(type);
    const data = new FormData();
    data.append("limit", limit);
    if (queryValue) data.append("search", queryValue);
    if (type === "previous") data.append("previousPage", previousData);
    else if (type === "next") data.append("nextPage", nextData);
    getCollectionsData(data);
  };
  /* CHANGE PAGE HANDLER END */

  /* REGENERATE HANDLER START */
  const handleRegenerate = async () => {
    setIsRegenerateModal(false);
    // const data = new FormData();
    // data.append(
    //   "shopify_url",
    //   removeShopDomain(
    //     collectionsData[productId]?.onlineStorePreviewUrl,
    //     collectionsData[productId]?.shopify_url
    //   )
    // );
    // const response = await fetchData(getApiURL("/delete_url_redirect"), data);
    // if(response?.status === true){
    // const collectiondata = new FormData();
    // collectiondata.append("limit", limit);
    // if (queryValue) collectiondata.append("search", queryValue);
    // if (isPageType === "previous") collectiondata.append("previousPage", previousData);
    // if (isPageType === "next") collectiondata.append("nextPage", nextData);
    // const getresponse = await fetchData(getApiURL("/collection_list"), collectiondata);
    // setIsDetailsModal(true);
    const params = {};
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }
    // setIsDetailsModal(true);
    const dataToPass = {
      productsData: collectionsData,
      productId,
      title:
        collectionsData?.[productId]?.title ||
        collectionsData?.[productId]?.path,
      type: "collection",
      queryValue,
      isPageType,
      limit,
      nextData: pageData,
      previousData: pageData,
      regenerate: true,
      APIPath: "/collection_list",
    };
    sessionStorage.setItem("detailsData", JSON.stringify(dataToPass));

    navigate(`/details?${new URLSearchParams(params)}`);
    // }
    // else shopify.toast.show("Something went wrong. try again later")
  };
  /* REGENERATE HANDLER END */

  /* VIEW CLICK HANDLER START */
  const handleView = (id, title) => {
    setProductId(id);
    setIsViewModal(true);
  };
  /* VIEW CLICK HANDLER END */

  /* REGENERATE CLICK HANDLER START */
  const handleRegenerateClick = (id) => {
    setProductId(id);
    setIsRegenerateModal(true);
  };
  /* REGENERATE CLICK HANDLER END */

  useEffect(() => {
    const data = new FormData();
    data.append("limit", limit);
    if (queryValue) data.append("search", queryValue);
    if (isPageType === "previous") data.append("previousPage", pageData);
    if (isPageType === "next") data.append("nextPage", pageData);
    getCollectionsData(data);
  }, [isViewModal]);

  const rowMarkup = collectionsData?.map(
    (val, index) => (
      (
        <IndexTable.Row
          id={index}
          key={index}
          selected={selectedResources.includes(index)}
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
                    window.open(`https://${SHOP}/collections/${val?.handle}`)
                  }
                  variant="plain"
                >
                  {val?.title}
                </Button>
              </div>
            </Text>
          </IndexTable.Cell>
          {data?.plan_details?.features?.total_clicks_listing_page && (
            <IndexTable.Cell>
              <Text as="span" alignment="end">
                {val?.anlytics?.total?.total_clicks || 0}
              </Text>
            </IndexTable.Cell>
          )}
          {data?.plan_details?.features?.total_add_to_cart_listing_page && (
            <IndexTable.Cell>
              <Text as="span" alignment="end">
                {val?.anlytics?.total?.total_add_to_cart || 0}
              </Text>
            </IndexTable.Cell>
          )}
          {data?.plan_details?.features?.total_checkouts_listing_page && (
            <IndexTable.Cell>
              <Text as="span" alignment="end">
                {val?.anlytics?.total?.total_checkout || 0}
              </Text>
            </IndexTable.Cell>
          )}
          <IndexTable.Cell>
            <InlineStack align="center">
              <ButtonGroup alignment="center" variant="segment">
                {
                  // data?.plan_details?.features?.short_url_create &&
                  // data?.plan_details?.features?.custom_url_create &&
                  // data?.plan_details?.features?.qr_code_create &&
                  !removeShopDomain(val?.short_link) &&
                    !removeShopDomain(val?.custom_url) ? (
                    <InlineStack align="start" gap={200}>
                      <Button onClick={() => handleGenerate(index, val?.title)}>
                        <div style={{ width: "var(--p-width-1600)" }}>
                          Generate
                        </div>
                      </Button>
                    </InlineStack>
                  ) : (
                    <InlineStack align="start" gap={200}>
                      {/* {data?.plan_details?.features?.regenerate && ( */}

                      <Button onClick={() => handleRegenerateClick(index)}>
                        <div style={{ width: "var(--p-width-1600)" }}>
                          Regenerate
                        </div>
                      </Button>

                      {/* )} */}
                    </InlineStack>
                  )
                }
                <div style={{ width: "var(--p-width-1200)" }}>
                  <Button
                    size="slim"
                    onClick={() => handleView(index, val?.title)}
                  >
                    View
                  </Button>
                </div>
              </ButtonGroup>
            </InlineStack>
          </IndexTable.Cell>
        </IndexTable.Row>
      )
    )
  );

  return (
    <LegacyCard>
      <IndexFilters
        tabs={[]}
        queryValue={queryValue}
        queryPlaceholder="Searching in all"
        onQueryChange={handleFiltersQueryChange}
        onQueryClear={handleQueryValueRemove}
        mode={mode}
        setMode={setMode}
        filters={[]}
        appliedFilters={[]}
      />
      <IndexTable
        resourceName={{ singular: "Collection", plural: "Collections" }}
        itemCount={collectionsData?.length}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources?.length
        }
        onSelectionChange={handleSelectionChange}
        selectable={false}
        loading={isLoading}
        headings={[
          { title: "Title" },
          ...(data?.plan_details?.features?.total_clicks_listing_page
            ? [{ title: "Clicks", alignment: "end" }]
            : []),
          ...(data?.plan_details?.features?.total_add_to_cart_listing_page
            ? [{ title: "Add to Cart", alignment: "end" }]
            : []),
          ...(data?.plan_details?.features?.total_checkouts_listing_page
            ? [{ title: "Checkouts", alignment: "end" }]
            : []),
          { title: "Actions", alignment: "center" },
        ]}
        pagination={{
          hasNext: nextData,
          hasPrevious: previousData,
          onNext: () => changePage("next"),
          onPrevious: () => changePage("previous"),
        }}
      >
        {rowMarkup}
      </IndexTable>
      <View
        data={collectionsData}
        id={productId}
        isViewModal={isViewModal}
        setIsViewModal={setIsViewModal}
        type={"collection"}
        getProductsData={getCollectionsData}
        limit={limit}
        isPageType={isPageType}
        queryValue={queryValue}
        previousData={pageData}
        nextData={pageData}
        APIPath="/collection_list"
      />
      <Details
        productsData={collectionsData}
        productId={productId}
        isDetailsModal={isDetailsModal}
        setIsDetailsModal={setIsDetailsModal}
        selectedTab={selectedTab}
        getProductsData={getCollectionsData}
        limit={limit}
        type={"collection"}
        isPageType={isPageType}
        queryValue={queryValue}
        previousData={previousData}
        nextData={nextData}
        APIPath="/collection_list"
      />
      <ConfirmationModal
        isOpen={isRegenerateModal}
        setIsOpen={setIsRegenerateModal}
        text={
          <InlineStack gap={200}>
            <Text as="h2" variant="bodyMd">
              Are you sure you want to regenerate the URL?
            </Text>
            <Text as="h4" variant="bodyMd">
              If you regenerate this URL and barcode, all previous analytic
              summaries associated with them will be permanently removed. This
              action cannot be undone.
            </Text>
          </InlineStack>
        }
        title={"Regenerate URL ?"}
        buttonText={"Regenerate"}
        buttonAction={() => handleRegenerate()}
        destructive={false}
        show={!data?.plan_details?.features?.regenerate}
      />
    </LegacyCard>
  );
};

/* COLLECTION LIST FUNCTIONAL COMPONENT END */
export default CollectionList;
