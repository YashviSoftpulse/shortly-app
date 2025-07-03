import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Badge,
  Button,
  IndexTable,
  LegacyCard,
  Page,
  Tabs,
  Text,
  TextField,
  useIndexResourceState,
  Pagination,
  Link,
  Select,
  InlineStack,
  Tooltip,
  Modal,
  SkeletonTabs,
  SkeletonBodyText,
  Divider,
  EmptySearchResult,
} from "@shopify/polaris";
import { DeleteIcon, EditIcon, ExchangeIcon } from "@shopify/polaris-icons";
import { fetchData, getApiURL } from "../action";
import { useApiData } from "../components/ApiDataProvider";

function Influencers() {
  const [selected, setSelected] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [sortColumnIndex, setSortColumnIndex] = useState(null);
  const [sortDirection, setSortDirection] = useState("ascending");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSort, setSelectedSort] = useState("newest");
  const [influencers, setInfluencers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editModalActive, setEditModalActive] = useState(false);
  const [programToEdit, setProgramToEdit] = useState(null);
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [regeLoading, setRegeLoading] = useState(false);
  const [loadingRowId, setLoadingRowId] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [storeCurrency, setStoreCurrency] = useState("Rs.");

  const { data, loading, error } = useApiData();

  const navigate = useNavigate();
  const itemsPerPage = 10;

  const tabs = [
    { id: "all", content: "All", panelID: "all-content" },
    { id: "active", content: "Active", panelID: "active-content" },
    { id: "deactive", content: "Deactive", panelID: "deactive-content" },
    { id: "pending", content: "Pending", panelID: "pending-content" },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    const fetchInfluencers = async () => {
      setIsLoading(true);
      const response = await fetchData(getApiURL("/get-influencers"));
      if (response?.status === true) {
        setInfluencers(response.data || []);
        setStoreCurrency(response?.store_currency)
      } else {
        console.error("Error fetching influencers:", response?.message);
        setInfluencers([]);
      }
      setIsLoading(false);
    };

    fetchInfluencers();
  }, []);

  const handleTabChange = useCallback((index) => {
    setSelected(index);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchValue(value);
    setCurrentPage(1);
  }, []);

  const handleSort = (columnIndex, direction) => {
    setSortColumnIndex(columnIndex);
    setSortDirection(direction);
  };

  const handleSelectChange = useCallback((value) => setSelectedSort(value), []);

  const sortableColumns = { 0: "name", 5: "revenue" };

  const transformedInfluencers = useMemo(() => {
    return influencers.map((inf) => ({
      id: inf.id,
      name: `${inf.first_name} ${inf.last_name}`,
      commission:
        inf.commission_type === "1"
          ? 0
          : `${inf.commission_value}${inf.commission_type === "2"
            ? "%"
            : inf.commission_type === "3"
              ? ` ${storeCurrency}`
              : ""
          }`,
      cstatus: inf.cstatus,
      status: inf.status,
      applicationTime: inf.updated_at || inf.created_at || "—",
      orders: 0,
      revenue: 0,
    }));
  }, [influencers]);

  const filteredData = useMemo(() => {
    let data = [...transformedInfluencers];

    if (selected === 1) {
      data = data.filter(
        (inf) => inf.status === "active" && inf.cstatus !== "pending"
      );
    } else if (selected === 2) {
      data = data.filter(
        (inf) => inf.status === "inactive" && inf.cstatus !== "pending"
      );
    } else if (selected === 3) {
      data = data.filter((inf) => inf.cstatus === "pending");
    }

    if (searchValue) {
      data = data.filter((inf) =>
        inf.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    data.sort((a, b) => {
      if (selectedSort === "newest" || selectedSort === "oldest") {
        const timeA = new Date(a.applicationTime);
        const timeB = new Date(b.applicationTime);
        return selectedSort === "newest" ? timeB - timeA : timeA - timeB;
      }

      if (
        selectedSort === "firstNameAlpha" ||
        selectedSort === "firstNameReverseAlpha"
      ) {
        const getFirstName = (name) => {
          if (!name || typeof name !== "string") return "";
          const trimmed = name.trim().replace(/\s+/g, " ");
          const parts = trimmed.split(" ");
          return parts.length > 0
            ? parts[0].toLowerCase()
            : trimmed.toLowerCase();
        };
        const nameA = getFirstName(a.name);
        const nameB = getFirstName(b.name);
        return selectedSort === "firstNameAlpha"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }

      return 0;
    });

    if (sortableColumns.hasOwnProperty(sortColumnIndex)) {
      const key = sortableColumns[sortColumnIndex];
      data.sort((a, b) => {
        if (
          selectedSort === "newest" ||
          selectedSort === "oldest"
        ) {
          const timeA = new Date(a.applicationTime);
          const timeB = new Date(b.applicationTime);
          return selectedSort === "newest"
            ? timeB - timeA
            : timeA - timeB;
        }

        if (
          selectedSort === "lastNameAlpha" ||
          selectedSort === "lastNameReverseAlpha"
        ) {
          const getLastName = (name) => {
            if (!name || typeof name !== "string") return "";
            const trimmed = name.trim().replace(/\s+/g, " ");
            const parts = trimmed.split(" ");
            return parts.length > 1
              ? parts[parts.length - 1].toLowerCase()
              : trimmed.toLowerCase();
          };

          const nameA = getLastName(a.name);
          const nameB = getLastName(b.name);
          return selectedSort === "lastNameAlpha"
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        }

        return 0;
      });
    }

    return data;
  }, [
    transformedInfluencers,
    selected,
    searchValue,
    sortColumnIndex,
    sortDirection,
    selectedSort,
  ]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (id) => {
    setProgramToEdit(id);
    setEditModalActive(true);
  };

  const confirmEdit = () => {
    if (programToEdit) {
      navigate(`/influencers/update/${programToEdit}${window.location.search}`);
      setEditModalActive(false);
      setProgramToEdit(null);
    }
  };

  const handleDelete = (id) => {
    setProgramToDelete(id);
    setDeleteModalActive(true);
  };

  const confirmDelete = async () => {
    if (programToDelete) {
      setIsDeleting(true);
      const formData = new FormData();
      formData.append("uid", programToDelete);
      const response = await fetchData(
        getApiURL("/delete-influencer"),
        formData
      );

      if (response?.status === true) {
        const updatedInfluencers = influencers.filter(
          (inf) => inf.id !== programToDelete
        );
        setInfluencers(updatedInfluencers);

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

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(paginatedData);

  const regenrateLink = async (id) => {
    setRegeLoading(true);
    const formData = new FormData();
    formData.append("uid", id);
    const response = await fetchData(getApiURL("/only-invite"), formData);
    if (response?.status === true) {
      shopify.toast.show("New invite link generated successfully.", {
        duration: 3000,
      });
      setRegeLoading(false);
      setLoadingRowId(null);
    } else {
      shopify.toast.show(response?.message, {
        isError: true,
        duration: 3000,
      });
      setRegeLoading(false);
      setLoadingRowId(null);
    }
  };

  const rowMarkup = paginatedData.map(
    ({ id, name, commission, cstatus, status, applicationTime }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {cstatus === "pending" ? (
              <Text fontWeight="bold" tone="subdued">
                {name}
              </Text>
            ) : (
              <Link
                url={`/influencers/dashboard/${id}${window.location.search}`}
                removeUnderline
              >
                {name}
              </Link>
            )}
          </Text>
        </IndexTable.Cell>

        <IndexTable.Cell>{commission}</IndexTable.Cell>

        <IndexTable.Cell>
          <Badge tone={cstatus === "pending" ? "warning" : "success"}>
            {cstatus.charAt(0).toUpperCase() + cstatus.slice(1).toLowerCase()}
          </Badge>
        </IndexTable.Cell>

        <IndexTable.Cell>{formatDate(applicationTime)}</IndexTable.Cell>

        <IndexTable.Cell>
          <InlineStack align="end">
            {cstatus === "pending" ? (
              <Badge tone="warning">
                {cstatus.charAt(0).toUpperCase() +
                  cstatus.slice(1).toLowerCase()}
              </Badge>
            ) : (
              status && (
                <Badge tone={status === "active" ? "success" : "critical"}>
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).toLowerCase()}
                </Badge>
              )
            )}
          </InlineStack>
        </IndexTable.Cell>

        <IndexTable.Cell>
          <InlineStack gap="200" align="end">
            {cstatus === "pending" && (
              <Tooltip content="Re-invite">
                <Button
                  icon={ExchangeIcon}
                  onClick={() => {
                    regenrateLink(id), setLoadingRowId(id);
                  }}
                  loading={loadingRowId === id}
                />
              </Tooltip>
            )}
            <Tooltip content="Edit">
              <Button
                icon={EditIcon}
                onClick={() => handleEdit(id)}
                accessibilityLabel="Edit influencer"
              />
            </Tooltip>

            <Tooltip content="Delete">
              <Button
                icon={DeleteIcon}
                onClick={() => handleDelete(id)}
                tone="critical"
                accessibilityLabel="Delete influencer"
              />
            </Tooltip>
          </InlineStack>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  const options = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "First name A–Z", value: "firstNameAlpha" },
    { label: "First name Z–A", value: "firstNameReverseAlpha" },
  ];

  const handleInviteClick = () => {
    if (data?.plan_details?.features?.influencer_create_limit == 0) {
      setShowUpgradeModal(true);
    } else {
      setShowUpgradeModal(false);
      navigate(`/influencer/invite${window.location.search}`)
    }
  };

  return (
    <Page
      title="Influencers"
      primaryAction={
        <Button variant="primary" onClick={handleInviteClick}>
          Invite Influencer
        </Button>
      }
    >
      <Modal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Invite Influencer"
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setShowUpgradeModal(false),
          },
        ]}
      >
        <Modal.Section>
          {showUpgradeModal && (
            <div class="premium-plan-influencer">
              <p>
                Upgrade to Invite Influencers
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
        </Modal.Section>
      </Modal>

      <div className="influencerListTabs">
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />
      </div>

      <LegacyCard>
        <div className="influencerListSearch">
          <div style={{ flex: 1 }}>
            <TextField
              label="Search Influencers"
              labelHidden
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search by name"
              clearButton
              onClearButtonClick={() => handleSearchChange("")}
            />
          </div>
          <div style={{ paddingLeft: "10px" }}>
            <Select
              label="Sort by"
              labelInline
              options={options}
              onChange={handleSelectChange}
              value={selectedSort}
            />
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <SkeletonTabs count={4} fitted />
            <SkeletonBodyText lines={5} />
          </div>
        ) : (
          <div className="maininfluncerlist">
            <IndexTable
              resourceName={{ singular: "influencer", plural: "influencers" }}
              itemCount={paginatedData.length}
              selectedItemsCount={
                allResourcesSelected ? "All" : selectedResources.length
              }
              onSelectionChange={handleSelectionChange}
              headings={[
                { title: "Influencer Name", isSortable: true },
                { title: "Commission" },
                { title: "Cooperation Status" },
                { title: "Application Time" },
                { title: "Status", alignment: "end" },
                { title: "Actions", alignment: "end" },
              ]}
              sortDirection={sortDirection}
              sortColumnIndex={sortColumnIndex}
              onSort={handleSort}
              selectable={false}
              emptyState={
                <EmptySearchResult
                  title="No influencers found"
                  description="Try adjusting your filters or search criteria to find influencers."
                  withIllustration
                />
              }
            >
              {rowMarkup}
            </IndexTable>

            <Divider borderColor="border" />

            <div
              style={{
                backgroundColor: "#f7f7f7",
                padding: "10px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Pagination
                hasPrevious={currentPage > 1}
                onPrevious={() => setCurrentPage((prev) => prev - 1)}
                hasNext={currentPage < totalPages}
                onNext={() => setCurrentPage((prev) => prev + 1)}
              />
            </div>
          </div>
        )}
      </LegacyCard>

      {/* Delete Modal */}
      <Modal
        open={deleteModalActive}
        onClose={() => {
          setDeleteModalActive(false);
        }}
        title="Delete Influencer"
        primaryAction={{
          content: "Delete",
          destructive: true,
          onAction: confirmDelete,
          loading: isDeleting,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setDeleteModalActive(false),
            disabled: isDeleting,
          },
        ]}
      >
        <Modal.Section>
          <Text as="p">
            Are you sure you want to delete this influencer? This action cannot
            be undone.
          </Text>
        </Modal.Section>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editModalActive}
        onClose={() => setEditModalActive(false)}
        title="Edit Influencer"
        primaryAction={{
          content: "Edit",
          onAction: confirmEdit,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setEditModalActive(false),
          },
        ]}
      >
        <Modal.Section>
          <Text as="p">
            Are you sure you want to edit this influencer’s details?
          </Text>
        </Modal.Section>
      </Modal>

    </Page>
  );
}

export default Influencers;
