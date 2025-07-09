/* IMPORT REQUIRED MODULES START */
import {
  Box,
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
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";
import { fetchData, getApiURL } from "../../action";
import { removeShopDomain } from "../../utils";
import * as XLSX from "xlsx";
import { Details, View } from "..";
import { useApiData } from "../ApiDataProvider";
/* IMPORT REQUIRED MODULES END */

/* MYLINKS FUNCTIONAL COMPONENT START */
function MyLinks({
  LinksData,
  setLinkData,
  queryValue,
  setQueryValue,
  pageNumber,
  setPageNumber,
  previousData,
  setPreviousData,
  nextData,
  setNextData,
}) {
  const [isDetailsModal, setIsDetailsModal] = useState(false);
  const [isRegenerateModal, setIsRegenerateModal] = useState(false);
  const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);
  const navigate = useNavigate();
  const { data, loading, error } = useApiData();
  const [productId, setProductId] = useState("");
  const [isPageType, setIsPageType] = useState("");
  const [isViewModal, setIsViewModal] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(LinksData);
  const [isExporting, setIsExporting] = useState(false);
  const limit = 10;
  const [Timer, setTimer] = useState(null);
  const [isExportModal, setIsExportModal] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const SHOP = urlParams.get("shop");

  const handleQueryValueRemove = () => {
    setQueryValue("");
    const data = new FormData();
    data.append("limit", limit);
    getRedirectLinksData(data);
  };

  /* FILTER QUERY CHANGE HANDLER START */
  const handleFiltersQueryChange = (newValue) => {
    setIsloading(() => true);
    clearTimeout(Timer);
    setQueryValue(newValue);
    const myTimeOut = setTimeout(() => {
      const data = new FormData();
      data.append("limit", limit);
      data.append("search", newValue);
      getRedirectLinksData(data);
    }, 1000);
    setTimer(myTimeOut);
  };
  /* FILTER QUERY CHANGE HANDLER END */
  /* GET REDIRECT LINKS DATA HANDLER START */
  const getRedirectLinksData = async (data) => {
    setPageNumber(data?.get("page"));
    setIsloading(true);
    const response = await fetchData(getApiURL("redirect_list_V2"), data);
    setIsloading(false);
    if (response.status === true) {
      const temp = response?.data.map((val, index) => {
        return {
          ...val,
          id: index,
        };
      });
      setLinkData(temp);
      if (response?.page?.previous) {
        setPreviousData(response?.page?.previous);
      } else {
        setPreviousData(false);
      }
      if (response?.page?.next) {
        setNextData(response?.page?.next);
      } else {
        setNextData(false);
      }
    }
  };

  /* GET REDIRECT LINKS HANDLER END */

  /* CHANGE PAGE HANDLER START */
  const changePage = (type) => {
    setIsloading(true);
    setIsPageType(type);
    const data = new FormData();
    data.append("limit", limit);
    if (queryValue) data.append("search", queryValue);
    if (type === "previous") data.append("page", previousData);
    else if (type === "next") data.append("page", nextData);
    getRedirectLinksData(data);
  };
  /* CHANGE PAGE HANDLER END */

  /* CAPITALIZE FIRST LETTER HANDLER START */
  function capitalizeFirstLetter(string = "") {
    if (string == "") return string;
    string = string?.replace(/_/g, " ");
    return string?.charAt(0)?.toUpperCase() + string?.slice(1);
  }
  /* CAPITALIZE FIRST LETTER HANDLER END */

  /* REGENERATE URL HANDLER START */
  const handleRegenerate = async () => {
    setIsRegenerateModal(false);
    const data = new FormData();
    data.append(
      "shopify_url",
      removeShopDomain(
        LinksData[productId]?.shopify_url
        // LinksData[productId]?.shopify_url
      )
    );
    const params = {};
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }
    // setIsDetailsModal(true);
    const dataToPass = {
      productsData: LinksData,
      productId,
      title: LinksData?.[productId]?.title || LinksData?.[productId]?.path,
      type: LinksData?.[productId]?.page_type,
      queryValue,
      isPageType,
      limit,
      nextData,
      previousData,
      regenerate: true,
      pageNumber,
      APIPath: "redirect_list_V2",
    };
    sessionStorage.setItem("detailsData", JSON.stringify(dataToPass));

    navigate(`/details?${new URLSearchParams(params)}`);
    // }
    // else shopify.toast.show("Something went wrong. try again later")
  };
  /* REGENERATE URL HANDLER END */

  /* REGENERATE CLICK HANDLER START */
  const handleRegenerateClick = (id) => {
    setProductId(id);
    setIsRegenerateModal(true);
  };
  /* REGENERATE CLICK HANDLER END */

  /* VIEW CLICK HANDLER START */
  const handleView = (id, title) => {
    setProductId(id);
    setIsViewModal(true);
    // const data = new FormData();
    // data.append("limit", limit);
    // if (queryValue) data.append("search", queryValue);
    // if (isPageType === "previous") data.append("page", previousData);
    // if (isPageType === "next") data.append("page", nextData);
    // getRedirectLinksData(data);
  };
  /* VIEW CLICK HANDLER END */

  useEffect(() => {
    const data = new FormData();
    data.append("limit", limit);
    if (queryValue) data.append("search", queryValue);
    data.append("page", pageNumber);
    getRedirectLinksData(data);
  }, [isViewModal === true]);

  const exportLinks = async () => {
    // setExportLoader(true)
    // fetch(getApiURL('/cv_exporter'), {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // })
    //   .then((response) => {
    //     if (response.ok) {

    //       return response.blob();
    //     }
    //     throw new Error('Error while downloading the file.');
    //   })
    //   .then((blob) => {
    //     const url = window.URL.createObjectURL(new Blob([blob]));
    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.setAttribute('download', `${SHOP}_links.xls`);
    //     document.body.appendChild(link);
    //     link.click();
    //     link.parentNode.removeChild(link);
    //     setExportLoader(false);
    //   })
    //   .catch((error) => {
    //     console.error('Download failed:', error);
    //     // Ensure loader is turned off on error
    //     setExportLoader(false);
    //   });
    const data = new FormData();
    data.append("type", "export");
    setIsExporting(true);
    const response = await fetchData(getApiURL("register_work"), data);
    if (response?.status === true) {
      setIsExportModal(false);
      setIsExporting(false);
      shopify.toast.show(
        "Success! We’ll send you an email update shortly. Stay tuned!",
        { duration: 3000 }
      );
    } else {
      setIsExporting(false);
      setIsExportModal(false);
      shopify.toast.show(response?.message, { isError: true, duration: 3000 });
    }
  };

  const rowMarkup = LinksData?.map((val, index) => {
    const id = index;
    return (
      <IndexTable.Row
        id={id}
        key={index}
        selected={selectedResources.includes(val.id)}
        position={index}
      >
        <IndexTable.Cell>
          <Button
            onClick={() =>
              window.open(`https://${SHOP}/${val?.page_type}s/${val?.handle}`)
            }
            variant="plain"
          >
            {val?.title || "-"}{" "}
          </Button>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {" "}
          <Text as="span">{capitalizeFirstLetter(val?.page_type) || "-"}</Text>
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
              {/* {data?.plan_details?.features?.regenerate && data?.plan_details?.features?.short_url_create && data?.plan_details?.features?.custom_url_create && data?.plan_details?.features?.qr_code_create && */}

              <Button onClick={() => handleRegenerateClick(index)}>
                <div style={{ width: "var(--p-width-1600)" }}>Regenerate</div>
              </Button>

              {/* } */}
              <div style={{ width: "var(--p-width-1200)" }}>
                <Button
                  size="slim"
                  onClick={() => handleView(index, val?.path)}
                >
                  View
                </Button>
              </div>
            </ButtonGroup>
          </InlineStack>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <LegacyCard>
      <div className={LinksData?.length > 0 ? "export-container" : ""}>
        <InlineStack wrap={false}>
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

          <Box padding={200}>
            <div style={{ width: "var(--p-width-2800)", position: "relative" }}>
              <Button
                variant="Primary"
                size="slim"
                onClick={() => setIsExportModal(true)}
              >
                Export to CSV
              </Button>
            </div>
          </Box>
        </InlineStack>
      </div>
      <IndexTable
        resourceName={{ singular: "Link", plural: "Links" }}
        itemCount={LinksData?.length}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources?.length
        }
        onSelectionChange={handleSelectionChange}
        selectable={false}
        loading={isLoading}
        headings={[
          { title: "Title" },
          { title: "Type" },
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
        data={LinksData}
        id={productId}
        isViewModal={isViewModal}
        type={LinksData[productId]?.page_type}
        setIsViewModal={setIsViewModal}
        getProductsData={getRedirectLinksData}
        limit={limit}
        isPageType={isPageType}
        queryValue={queryValue}
        previousData={previousData}
        nextData={nextData}
        APIPath="redirect_list_V2"
        pageNumber={pageNumber}
      />
      <Details 
        productsData={LinksData}
        productId={productId}
        isDetailsModal={isDetailsModal}
        setIsDetailsModal={setIsDetailsModal}
        type={LinksData[productId]?.page_type}
        getProductsData={getRedirectLinksData}
        limit={limit}
        isPageType={isPageType}
        queryValue={queryValue}
        previousData={previousData}
        nextData={nextData}
        APIPath="redirect_list_V2"
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
        title={"Regenerate the Link ?"}
        buttonText={"Regenerate"}
        buttonAction={() => handleRegenerate()}
        destructive={false}
        show={!data?.plan_details?.features?.regenerate}
      />
      <ConfirmationModal
        isOpen={isExportModal}
        setIsOpen={setIsExportModal}
        text={
          <InlineStack gap={200}>
            <Text as="h2" variant="bodyMd">
              Are you sure you want to Export?
            </Text>
          </InlineStack>
        }
        title={"Export the Links ?"}
        buttonText={"Export"}
        buttonAction={() => exportLinks()}
        destructive={false}
        show={!data?.plan_details?.features?.export}
        loading={isExporting}
      />
    </LegacyCard>
  );
}
export default MyLinks;
/* MYLINKS FUNCTIONAL COMPONENT END */
