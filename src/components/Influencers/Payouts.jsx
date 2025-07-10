import {
  useCallback,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
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
  Bleed,
  Layout,
  Box,
  Tooltip,
  Button,
  Modal,
  FormLayout,
  Thumbnail,
  DropZone,
  Spinner,
  InlineGrid,
  Popover,
  Icon,
} from "@shopify/polaris";
import { fetchData, getApiURL } from "../../action";
import { formatDate, formatNumber } from "../../utils";
import {
  CalendarIcon,
  DeleteIcon,
  EditIcon,
  InfoIcon,
} from "@shopify/polaris-icons";
import moment from "moment";

// function Payouts() {
const Payouts = forwardRef((props, ref) => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [influencerPayouts, setInfluencersPayouts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState("3");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [influencersPayoutsTotal, setInfluencersPayoutsTotal] = useState([]);
  const [storeCurrency, setStoreCurrency] = useState("Rs.");
  const [isConfirmEditLoading, setIsConfirmEditLoading] = useState(false);
  const [editModalActive, setEditModalActive] = useState(false);
  const [confirmEditModalActive, setConfirmEditModalActive] = useState(false);
  const [programToEdit, setProgramToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    processed_by: "",
    amount: "",
    payout_date: "",
    payout_method: "",
    status: "",
    note: "",
  });

  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [files, setFiles] = useState([]);
  const [logoError, setLogoError] = useState(false);
  const [errors, setErrors] = useState({ amount: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [influencerInfo, setInfluencerInfo] = useState(null);
  const [loadingIcons, setLoadingIcons] = useState({});
  const [editFiles, setEditFiles] = useState([]);
  const [pandingPayouts, setPendingPayouts] = useState(0);
  const [payoutDetailsMap, setPayoutDetailsMap] = useState({});
  const [visible, setVisible] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const isFirstRun = useRef(true);
  const payoutStatusOptions = [
    { label: "Pending", value: "1" },
    { label: "Processing", value: "2" },
    { label: "Completed", value: "3" },
    { label: "Failed", value: "4" },
    { label: "Cancelled", value: "5" },
  ];

  const sortOrderOptions = [
    { label: "Descending", value: "DESC" },
    { label: "Ascending", value: "ASC" },
  ];

  function handleOnClose({ relatedTarget }) {
    setVisible(false);
  }

  const fetchInfluencersPayouts = async (
    page = 1,
    search = "",
    payoutMethod = "3",
    order = "DESC",
    initial = false
  ) => {
    if (initial) setIsInitialLoading(true);
    else setIsLoading(true);

    const formData = new FormData();
    formData.append("search", search);
    formData.append("sortBy", "created_at");
    formData.append("sortOrder", order);
    formData.append("page", page);
    formData.append("payoutMethod", payoutMethod);
    formData.append("uid", id);

    if (payoutMethod !== "3") formData.append("method", payoutMethod);
    try {
      const response = await fetchData(getApiURL("get-payouts"), formData);
      if (response?.status === true) {
        const payouts = response?.records || [];
        setInfluencersPayouts(payouts);
        setInfluencersPayoutsTotal(response.totals || []);
        setTotalPages(response?.pagination?.total_pages || 1);
        setCurrentPage(response?.pagination?.current_page || 1);
        setPendingPayouts(response?.pending_commissions);
        localStorage.setItem("pandingPayouts", response?.pending_commissions);
        setStoreCurrency(response?.store_currency);
        // Cache payouts by UID
        const map = {};
        for (const payout of payouts) {
          map[payout.uid] = payout;
        }
        setPayoutDetailsMap((prev) => ({ ...prev, ...map }));
      } else {
        setInfluencersPayouts([]);
        setTotalPages(1);
      }
    } catch (error) {
      setInfluencersPayouts([]);
      setTotalPages(1);
    } finally {
      if (initial) setIsInitialLoading(false);
      else setIsLoading(false);
    }
  };

  useEffect(() => {
    const isInitial = isFirstRun.current;
    if (isInitial) isFirstRun.current = false;

    const handler = setTimeout(
      () => {
        fetchInfluencersPayouts(
          currentPage,
          searchValue,
          selectedPayoutMethod,
          sortOrder,
          isInitial
        );
      },
      isInitial ? 0 : 700
    );

    return () => clearTimeout(handler);
  }, [id, currentPage, searchValue, selectedPayoutMethod, sortOrder]);

  const handleSearchChange = useCallback(
    (value) => {
      setSearchValue(value);
      setCurrentPage(1);
    },
    [selectedPayoutMethod, sortOrder]
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSortOrderChange = useCallback((value) => {
    setSortOrder(value);
    setCurrentPage(1);
  }, []);

  const fetchPayoutDetails = async (uid, key) => {
    setLoading(true);
    let payoutInfo = payoutDetailsMap[uid];

    // If not cached, fallback to API call
    if (!payoutInfo) {
      const formData = new FormData();
      formData.append("uid", id);
      const response = await fetchData(getApiURL(`get-payouts`), formData);
      if (response?.status && Array.isArray(response?.records)) {
        payoutInfo = response.records.find((item) => item.uid === uid);
        setPayoutDetailsMap((prev) => ({
          ...prev,
          [uid]: payoutInfo,
        }));
      }
    }

    if (payoutInfo) {
      let amount = payoutInfo.amount;
      if (amount) {
        amount = amount.split(".")[0];
        amount = amount.replace(/,/g, "");
      }
      const statusMap = {
        pending: 1,
        processing: 2,
        completed: 3,
        failed: 4,
        cancelled: 5,
      };
      const statusValue = String(
        statusMap[payoutInfo?.status?.toLowerCase()] || 1
      );
      setEditFormData({
        processed_by: payoutInfo?.processed_by || "",
        amount: amount || "",
        payout_date: payoutInfo?.payout_date || "",
        payout_method: payoutInfo?.payout_method || "",
        status: statusValue,
        note: payoutInfo?.note || "",
      });

      if (payoutInfo?.payment_proof) {
        setEditFiles([
          {
            name: payoutInfo.payment_proof,
            type: "image/jpeg",
            url: payoutInfo.payment_proof,
          },
        ]);
      } else {
        setEditFiles([]);
      }
      if (key === "info") {
        setInfluencerInfo(payoutInfo);
      } else {
        setEditModalActive(true);
      }
    }
    setLoading(false);
  };

  const handleEdit = (uid) => {
    setProgramToEdit(uid);
    setConfirmEditModalActive(true);
  };

  const infoPayout = async (uid) => {
    setLoadingIcons((prev) => ({ ...prev, [uid]: true }));
    await fetchPayoutDetails(uid, "info");
    setLoadingIcons((prev) => ({ ...prev, [uid]: false }));
    openModal(true);
  };

  const confirmEdit = async () => {
    setIsConfirmEditLoading(true);
    if (programToEdit) {
      await fetchPayoutDetails(programToEdit);
      setConfirmEditModalActive(false);
    }
    setIsConfirmEditLoading(false);
  };

  const updatePayout = async () => {
    let hasError = false;
    const newErrors = { amount: "" };
    if (!editFormData?.amount || parseFloat(editFormData?.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0.";
      hasError = true;
    }
    setErrors(newErrors);
    if (hasError) return;
    const formData = new FormData();
    formData.append("uid", programToEdit);
    formData.append("amount", editFormData?.amount);
    formData.append("status", editFormData?.status);
    formData.append("type", "update");
    formData.append("note", editFormData?.note);
    // formData.append("uid", id);

    if (files.length > 0 && !files[0].url) {
      formData.append("payment_proof", files[0]);
    }

    setLoading(true);
    const response = await fetchData(getApiURL("update-payout"), formData);
    setLoading(false);

    if (response?.status === true) {
      setEditModalActive(false);
      fetchInfluencersPayouts(
        currentPage,
        searchValue,
        selectedPayoutMethod,
        sortOrder,
        false
      );
      shopify.toast.show("Payout updated successfully", { duration: 3000 });
    } else {
      shopify.toast.show(response?.message || "Update failed", {
        isError: true,
        duration: 3000,
      });
    }
  };

  useImperativeHandle(ref, () => ({
    refreshData: () => {
      fetchInfluencersPayouts(
        1,
        searchValue,
        selectedPayoutMethod,
        sortOrder,
        true
      );
    },
  }));

  const handleDelete = (uid) => {
    setProgramToDelete(uid);
    setDeleteModalActive(true);
  };

  const confirmDelete = async () => {
    if (programToDelete) {
      setIsDeleting(true);
      const formData = new FormData();
      formData.append("uid", programToDelete);
      formData.append("type", "delete");

      const response = await fetchData(getApiURL("update-payout"), formData);
      if (response?.status === true) {
        setIsDeleting(false);
        setDeleteModalActive(false);
        setProgramToDelete(null);
        const updatedInfluencers = influencerPayouts.filter(
          (inf) => inf.uid !== programToDelete
        );
        setInfluencersPayouts(updatedInfluencers);
        shopify.toast.show(response?.message, { duration: 3000 });
      } else {
        shopify.toast.show(response?.message, {
          isError: true,
          duration: 3000,
        });
      }
      setIsDeleting(false);
      setDeleteModalActive(false);
      setProgramToDelete(null);
    }
  };

  const getAmountByMethod = () => {
    const entry = influencersPayoutsTotal.find((item) => item.total_amount);
    return entry ? entry.total_amount : "0.00";
  };

  const statusToneMap = {
    pending: "warning",
    processing: "info",
    completed: "success",
    failed: "critical",
    cancelled: "neutral",
  };

  const handleDropZoneDrop = useCallback((_dropFiles, acceptedFiles) => {
    setLogoError(false);
    const file = acceptedFiles[0];
    const fileSizeLimit = 2 * 1024 * 1024;

    if (!file) {
      setLogoError("No file selected. Please upload a PNG or JPEG image.");
      return;
    }
    const isValid = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
    ].includes(file.type);

    if (file.size > fileSizeLimit) {
      setLogoError("File size must be less than 2MB.");
      return;
    }

    if (!isValid) {
      setLogoError("Only PNG , JPG , JPEG or GIF images are supported.");
      return;
    }

    setEditFiles([]);
    setFiles([file]);
  }, []);

  const showUploadedFiles = files.length > 0 || editFiles.length > 0;
  const finalFiles = files.length > 0 ? files : editFiles;
  const uploadedFiles = showUploadedFiles ? (
    <div style={{ padding: "15px" }}>
      <BlockStack>
        {finalFiles.map((file, index) => (
          <div
            key={index}
            style={{ position: "relative", display: "inline-block" }}
          >
            <InlineStack align="space-between" blockAlign="start">
              <Thumbnail
                size="large"
                alt={file.name}
                source={
                  file.url
                    ? file.url
                    : [
                        "image/gif",
                        "image/jpeg",
                        "image/png",
                        "image/jpg",
                      ].includes(file.type)
                    ? window.URL.createObjectURL(file)
                    : NoteIcon
                }
              />
              <Button
                icon={DeleteIcon}
                tone="critical"
                variant="plain"
                size="slim"
                onClick={() => {
                  setFiles([]);
                  setEditFiles([]);
                }}
                accessibilityLabel="Remove file"
              />
            </InlineStack>
          </div>
        ))}
      </BlockStack>
    </div>
  ) : null;

  if (isInitialLoading) {
    return (
      <BlockStack gap="400">
        <InlineGrid gap="200" columns={3}>
          {[...Array(2)].map((_, idx) => (
            <Card key={idx}>
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
    <>
      <Layout>
        <Layout.Section>
          <InlineGrid columns={3} gap={400}>
            <Card>
              <BlockStack gap={200}>
                <Text
                  as="p"
                  fontWeight="bold"
                  tone="subdued"
                  variant="bodyMd"
                  text-decoration="dotted"
                >
                  Total Manual Paid
                </Text>
                <Text as="h2" tone="base" variant="bodyLg" fontWeight="bold">
                  {storeCurrency} {formatNumber(getAmountByMethod())}
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap={200}>
                <Text as="p" fontWeight="bold" tone="subdued" variant="bodyMd">
                  Pending Commissions
                </Text>
                <Text as="h2" tone="base" variant="bodyLg" fontWeight="bold">
                  {storeCurrency} {formatNumber(pandingPayouts)}
                </Text>
              </BlockStack>
            </Card>
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
                <Bleed marginInline="400" marginBlockEnd={400}>
                  <IndexTable
                    resourceName={{ singular: "Payout", plural: "Payouts" }}
                    itemCount={influencerPayouts?.length}
                    selectable={false}
                    headings={[
                      { title: "Name" },
                      { title: "Amount" },
                      { title: "Payment Date" },
                      { title: "Action", alignment: "end" },
                    ]}
                    emptyState={
                      <EmptySearchResult
                        title="No Payouts found"
                        description="Try changing the filters or search term"
                        withIllustration
                      />
                    }
                    pagination={{
                      hasNext: currentPage < totalPages,
                      hasPrevious: currentPage > 1,
                      onNext: () => handlePageChange(currentPage + 1),
                      onPrevious: () => handlePageChange(currentPage - 1),
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
                          {storeCurrency} {formatNumber(item.amount) || "0.00"}
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          {moment(formatDate(item.payout_date || "-")).format(
                            "DD MMM YYYY"
                          )}
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <InlineStack gap="200" align="end">
                            <Tooltip content="Info">
                              <Button
                                icon={
                                  loadingIcons[item.uid] ? (
                                    <Spinner size="small" />
                                  ) : (
                                    InfoIcon
                                  )
                                }
                                onClick={() => infoPayout(item.uid)}
                                accessibilityLabel="Info Payout"
                              />
                            </Tooltip>
                            {(item.status === "pending" ||
                              item.status === "processing") && (
                              <Tooltip content="Edit">
                                <Button
                                  icon={EditIcon}
                                  onClick={() => handleEdit(item.uid)}
                                  accessibilityLabel="Edit Payout"
                                />
                              </Tooltip>
                            )}
                            {/* {item.status !== "completed" && (
                              <Tooltip content="Delete">
                                <Button
                                  icon={DeleteIcon}
                                  onClick={() => handleDelete(item.uid)}
                                  tone="critical"
                                  accessibilityLabel="Delete Payout"
                                />
                              </Tooltip>
                            )} */}
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
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title="Payout Info"
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => closeModal(),
          },
        ]}
        size="small"
      >
        <Modal.Section>
          <BlockStack gap="200">
            <InlineStack align="space-between">
              <Text variant="bodyMd">Influencer Name</Text>
              <Text variant="bodySm" as="h5">
                {influencerInfo?.influencer_name}{" "}
              </Text>
            </InlineStack>
            <InlineStack align="space-between">
              <Text variant="bodyMd">Amount</Text>
              <Text variant="bodySm">
                {storeCurrency} {formatNumber(influencerInfo?.amount || "-")}
              </Text>
            </InlineStack>

            <InlineStack align="space-between">
              <Text variant="bodyMd">Payment Date</Text>
              <Text variant="bodySm">
                {formatDate(influencerInfo?.payout_date || "-")}
              </Text>
            </InlineStack>

            <InlineStack align="space-between">
              <Text variant="bodyMd">Payout Method</Text>
              <Text variant="bodySm">
                {/* {influencerInfo?.payout_method
                  ? influencerInfo.payout_method.charAt(0).toUpperCase() + influencerInfo.payout_method.slice(1).toLowerCase()
                  : "-"} */}
                Manual Paid
              </Text>
            </InlineStack>
            <InlineStack align="space-between">
              <Text variant="bodyMd">Note</Text>
              <Text variant="bodySm">{influencerInfo?.note || "-"}</Text>
            </InlineStack>
            <InlineStack align="space-between">
              <Text variant="bodyMd">Status</Text>
              <Text variant="bodySm">
                <Badge tone={statusToneMap[influencerInfo?.status]}>
                  {typeof influencerInfo?.status === "string"
                    ? influencerInfo?.status.charAt(0).toUpperCase() +
                      influencerInfo?.status.slice(1).toLowerCase()
                    : ""}
                </Badge>
              </Text>
            </InlineStack>

            <InlineStack align="space-between">
              <Text variant="bodyMd">Payment Proof</Text>
              {influencerInfo?.payment_proof ? (
                <Thumbnail
                  source={influencerInfo.payment_proof}
                  alt="Payment Proof"
                />
              ) : (
                <Text variant="bodySm">No file uploaded</Text>
              )}
            </InlineStack>
          </BlockStack>
        </Modal.Section>
      </Modal>
      <Modal
        open={confirmEditModalActive}
        onClose={() => setConfirmEditModalActive(false)}
        title="Edit Payout"
        primaryAction={{
          content: "Yes, Edit",
          onAction: confirmEdit,
          loading: isConfirmEditLoading,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setConfirmEditModalActive(false),
            disabled: isConfirmEditLoading,
          },
        ]}
      >
        <Modal.Section>
          <Text>Are you sure you want to edit this payout?</Text>
        </Modal.Section>
      </Modal>
      <Modal
        open={editModalActive}
        onClose={() => setEditModalActive(false)}
        title="Edit Payout"
        primaryAction={{
          content: "Save",
          onAction: updatePayout,
          loading,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setEditModalActive(false),
            disabled: loading,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap={200}>
            <FormLayout>
              <FormLayout.Group>
                <TextField
                  label="Amount"
                  type="number"
                  value={editFormData.amount}
                  suffix={storeCurrency}
                  onChange={(value) =>
                    setEditFormData({ ...editFormData, amount: value })
                  }
                  requiredIndicator
                  min={0}
                  error={errors.amount}
                />
                <Popover
                  active={visible}
                  autofocusTarget="none"
                  preferredAlignment="left"
                  fullWidth
                  preferInputActivator={false}
                  preferredPosition="below"
                  preventCloseOnChildOverlayClick
                  onClose={handleOnClose}
                  activator={
                    <TextField
                      role="combobox"
                      label={"Payout Date"}
                      suffix={<Icon source={CalendarIcon} />}
                      value={moment(editFormData.payout_date).format(
                        "DD MMM YYYY"
                      )}
                      // onFocus={() => setVisible(true)}
                      // onChange={handleInputValueChange}
                      autoComplete="off"
                    />
                  }
                >
                  {/* <DatePicker
                    month={month}
                    year={year}
                    selected={selectedDate}
                    onMonthChange={handleMonthChange}
                    onChange={handleDateSelection}
                  /> */}
                </Popover>
              </FormLayout.Group>
              <Select
                label="Payout Status"
                options={payoutStatusOptions}
                value={editFormData?.status}
                onChange={(value) =>
                  setEditFormData({ ...editFormData, status: value })
                }
              />
            </FormLayout>
            <TextField
              label="Notes"
              type="text"
              value={editFormData?.note}
              onChange={(value) =>
                setEditFormData({ ...editFormData, note: value })
              }
              autoComplete="off"
              multiline={4}
            />
            <BlockStack gap={100}>
              <DropZone onDrop={handleDropZoneDrop} allowMultiple={false}>
                {showUploadedFiles ? (
                  uploadedFiles
                ) : (
                  <DropZone.FileUpload actionHint="Only PNG and JPEG files under 2MB are accepted." />
                )}
              </DropZone>

              {logoError && <Text tone="critical">{logoError}</Text>}
            </BlockStack>
          </BlockStack>
        </Modal.Section>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteModalActive}
        onClose={() => setDeleteModalActive(false)}
        title="Delete Payout"
        primaryAction={{
          content: "Delete",
          destructive: true,
          onAction: confirmDelete,
          loading: isDeleting,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => {
              setDeleteModalActive(false);
            },
          },
        ]}
      >
        <Modal.Section>
          <Text>Are you sure you want to delete this payout?</Text>
        </Modal.Section>
      </Modal>
    </>
  );
});

export default Payouts;
