import {
  Page,
  Card,
  BlockStack,
  Text,
  TextField,
  FormLayout,
  Select,
  SkeletonTabs,
  SkeletonBodyText,
  Divider,
  InlineStack,
  Badge,
  Modal,
  Button,
} from "@shopify/polaris";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchData, getApiURL } from "../../../action";
import { EditIcon } from "@shopify/polaris-icons";
import { formatDate } from "../../../utils";

function UpdateInfluencer() {
  const navigate = useNavigate();
  const { id: uid } = useParams();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cstatus: "",
    status: "",
    created_at: "",
  });

  const [errors, setErrors] = useState({});
  const [commissionType, setCommissionType] = useState("2");
  const [commissionValue, setCommissionValue] = useState(10);
  const [commissionBase, setCommissionBase] = useState("product price only");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [tempStatus, setTempStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [storeCurrency, setStoreCurrency] = useState("Rs.");

  const handleChange = (field) => (value) => {
    const numericValue = value.replace(/\D/g, "");

    setFormData((prev) => ({
      ...prev,
      [field]: numericValue,
    }));
  };

  useEffect(() => {
    getInfluencerDetail();
  }, [uid]);

  async function getInfluencerDetail() {
    setLoading(true);
    const response = await fetchData(getApiURL(`get-influencers`));
    if (response?.status && Array.isArray(response.data)) {
      const getInfluencerInfo = response.data.find((item) => item.id === uid);

      if (getInfluencerInfo) {
        setFormData({
          firstName: getInfluencerInfo.first_name || "-",
          lastName: getInfluencerInfo.last_name || "-",
          email: getInfluencerInfo.email || "-",
          phone: getInfluencerInfo.phone || "-",
          cstatus: getInfluencerInfo.cstatus || "-",
          status: getInfluencerInfo.status || "-",
          created_at: getInfluencerInfo.created_at || "-",
        });
        setCommissionType(getInfluencerInfo.commission_type);
        setCommissionValue(getInfluencerInfo.commission_value || 0);
        setCommissionBase(getInfluencerInfo?.commission_based_on);
      }
      setStoreCurrency(response?.store_currency);
    }
    setLoading(false);
  }

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleToggleClick = () => {
    const newStatus = formData.status === "active" ? "inactive" : "active";
    setTempStatus(newStatus);
    setShowStatusModal(true);
  };

  const handleModalConfirm = () => {
    setFormData((prev) => ({ ...prev, status: tempStatus }));
    setShowStatusModal(false);
  };

  const handleModalCancel = () => {
    setTempStatus("");
    setShowStatusModal(false);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    const formPayload = new FormData();
    formPayload.append("uid", uid);
    // formPayload.append('firstName', formData.firstName);
    // formPayload.append('lastName', formData.lastName);
    // formPayload.append('email', formData.email);
    formPayload.append("phone", formData.phone);
    formPayload.append("commissionType", commissionType);
    formPayload.append("commissionValue", commissionValue);
    formPayload.append("commissionOn", commissionBase);
    formPayload.append("status", tempStatus);

    try {
      const response = await fetchData(
        getApiURL(`update-influencer`),
        formPayload
      );

      if (response?.status === true) {
        shopify.toast.show(response?.message, { duration: 3000 });
        navigate(-1);
        setIsSaving(false);
      } else {
        shopify.toast.show(response?.message, {
          duration: 3000,
          isError: true,
        });
        setIsSaving(false);
      }
    } catch (error) {
      shopify.toast.show(error, { duration: 3000, isError: true });
      setIsSaving(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  return (
    <Page
      title="Update Influencer"
      primaryAction={{
        content: "Update",
        onAction: handleSave,
        loading: isSaving,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onClick: () => navigate(-1),
        },
      ]}
      backAction={{ url: `/influencers${window.location.search}` }}
    >
      {loading ? (
        <FormLayout>
          <FormLayout.Group>
            <Card>
              <SkeletonTabs count={1} />
              <SkeletonBodyText lines={3} />
            </Card>

            <Card>
              <SkeletonTabs count={1} />
              <SkeletonBodyText lines={3} />
            </Card>
          </FormLayout.Group>
        </FormLayout>
      ) : (
        <BlockStack gap="400">
          <FormLayout>
            <FormLayout.Group>
              <Card>
                <BlockStack gap="200">
                  <InlineStack
                    gap={200}
                    align="space-between"
                    blockAlign="center"
                  >
                    <Text variant="bodyMd" fontWeight="bold">
                      Influencer Name
                    </Text>
                    <Text variant="bodySm">
                      {formData.firstName} {formData.lastName}
                    </Text>
                  </InlineStack>

                  <InlineStack
                    gap={200}
                    align="space-between"
                    blockAlign="center"
                  >
                    <Text variant="bodyMd" fontWeight="bold">
                      Email
                    </Text>
                    <Text variant="bodySm">{formData.email}</Text>
                  </InlineStack>

                  <InlineStack
                    gap={200}
                    align="space-between"
                    blockAlign="center"
                  >
                    <Text variant="bodyMd" fontWeight="bold">
                      Phone
                    </Text>

                    {!isEditing ? (
                      <InlineStack gap="200" blockAlign="center">
                        <Text variant="bodySm">
                          {formData?.phone ? formData.phone : "-"}
                        </Text>
                        <Button
                          icon={EditIcon}
                          onClick={handleEditClick}
                          accessibilityLabel="Edit phone"
                          variant="plain"
                        />
                      </InlineStack>
                    ) : (
                      <TextField
                        type="tel"
                        maxLength={10}
                        value={
                          formData?.phone && formData.phone !== "-"
                            ? formData.phone
                            : ""
                        }
                        onChange={handleChange("phone")}
                        autoComplete="off"
                        size="slim"
                        align="right"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    )}
                  </InlineStack>

                  <InlineStack
                    gap={200}
                    align="space-between"
                    blockAlign="center"
                  >
                    <Text variant="bodyMd" fontWeight="bold">
                      Last update
                    </Text>
                    <Text variant="bodySm">
                      {formatDate(formData?.created_at)}
                    </Text>
                  </InlineStack>

                  <InlineStack
                    gap={200}
                    align="space-between"
                    blockAlign="center"
                  >
                    <Text variant="bodyMd" fontWeight="bold">
                      Cooperation Status
                    </Text>
                    <Badge
                      tone={
                        formData.cstatus === "pending" ? "warning" : "success"
                      }
                    >
                      {formData.cstatus.charAt(0).toUpperCase() +
                        formData.cstatus.slice(1).toLowerCase()}
                    </Badge>
                  </InlineStack>

                  {formData.cstatus !== "pending" && (
                    <InlineStack
                      gap={200}
                      align="space-between"
                      blockAlign="center"
                    >
                      <Text variant="bodyMd" fontWeight="bold">
                        Status
                      </Text>
                      <div className="custom-toggle-container">
                        <label className="influencerUpdateswitch">
                          <input
                            type="checkbox"
                            checked={formData?.status === "active"}
                            onChange={handleToggleClick}
                          />
                          <span className="influencerUpdateslider round"></span>
                        </label>
                      </div>
                    </InlineStack>
                  )}
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <BlockStack gap="100">
                    <Text variant="headingMd" as="h5">
                      Commission Terms :
                    </Text>
                    <Text tone="subdued" variant="bodyXs">
                      Rules for earning commissions through your affiliate
                      referrals
                    </Text>
                  </BlockStack>

                  <BlockStack gap="200">
                    <div className="commissionTypes">
                      <div className="commissionTypesInfluencer">
                        <Select
                          label="Type of Commission"
                          options={[
                            { label: "None", value: "1" },
                            { label: "Percentage", value: "2" },
                            { label: "Fixed", value: "3" },
                          ]}
                          value={commissionType}
                          onChange={setCommissionType}
                        />
                      </div>

                      <div className="commissionTypesInfluencer">
                        <TextField
                          type="number"
                          label="Commission Rate"
                          suffix={
                            commissionType === "2"
                              ? "%"
                              : commissionType === "3"
                              ? storeCurrency
                              : ""
                          }
                          min={0}
                          mamax={commissionType === "2" ? 100 : undefined}
                          value={commissionValue}
                          onChange={(val) => {
                            let value = Number(val);
                            if (commissionType === "2" && value > 100) {
                              value = 100;
                            }
                            setCommissionValue(val === "" ? "" : value);
                          }}
                          autoComplete="off"
                          disabled={commissionType === "0"}
                        />
                      </div>
                    </div>

                    <Select
                      label="Commission Applied On"
                      options={[
                        {
                          label: "Only Product Price",
                          value: "1",
                        },
                        // { label: 'Order price (product + shipping + tax)', value: 'order price(product price + shipping cost + tax)' },

                        {
                          label: "Product Price + Tax",
                          value: "2",
                        },
                        {
                          label: "Product Price + Shipping",
                          value: "3",
                        },
                        {
                          label: "Total Order (Product + Shipping + Tax)",
                          value: "4",
                        },
                      ]}
                      value={commissionBase}
                      onChange={(value) => setCommissionBase(value)}
                    />
                  </BlockStack>
                </BlockStack>
              </Card>
            </FormLayout.Group>
          </FormLayout>

          <Modal
            open={showStatusModal}
            onClose={handleModalCancel}
            title="Confirm Status Change"
            primaryAction={{
              content: "Confirm",
              onAction: handleModalConfirm,
            }}
            secondaryActions={[
              {
                content: "Cancel",
                onAction: handleModalCancel,
              },
            ]}
          >
            <Modal.Section>
              <Text as="p">
                Are you sure you want to change status to{" "}
                <strong>{tempStatus}</strong>?
              </Text>
            </Modal.Section>
          </Modal>
        </BlockStack>
      )}
    </Page>
  );
}

export default UpdateInfluencer;
