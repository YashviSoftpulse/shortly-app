import {
  Page,
  Card,
  BlockStack,
  Text,
  TextField,
  FormLayout,
  Select,
} from "@shopify/polaris";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData, getApiURL } from "../../action";

function InviteInfluencer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    commissionRule: "",
  });

  const [errors, setErrors] = useState({});
  const [commissionType, setCommissionType] = useState("2");
  const [commissionValue, setCommissionValue] = useState(10);
  const [commissionBase, setCommissionBase] = useState("1");

  const [storeCurrency, setStoreCurrency] = useState("Rs.");

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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

  const fetchStoreCurrency = async () => {
    const response = await fetchData(getApiURL("get-influencers"));
    if (response?.status === true) {
      setStoreCurrency(response?.store_currency);
    } else {
      console.error("Error fetching influencers:", response?.message);
    }
  };

  useEffect(() => {
    fetchStoreCurrency();
  }, []);

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    const formPayload = new FormData();
    formPayload.append("firstName", formData.firstName);
    formPayload.append("lastName", formData.lastName);
    formPayload.append("email", formData.email);
    formPayload.append("phone", formData.phone);
    formPayload.append("commissionType", commissionType);
    formPayload.append("commissionValue", commissionValue);
    formPayload.append("commissionOn", commissionBase);

    const response = await fetchData(getApiURL("invite"), formPayload);
    if (response?.status === true) {
      shopify.toast.show(response?.message, { duration: 3000 });
      navigate(`/influencers${window.location.search}`);
      setIsSaving(false);
    } else {
      setIsSaving(false);
      shopify.toast.show(
        response?.error?.email || response?.error?.phone || response?.message,
        {
          duration: 3000,
          isError: true,
        }
      );
    }
  };

  return (
    <Page
      title="Invite New Influencer"
      primaryAction={{
        content: "Invite",
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
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="200">
            <FormLayout>
              <Text variant="headingMd" as="h5">
                New Influencer Info :
              </Text>

              <FormLayout.Group>
                <TextField
                  requiredIndicator
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange("firstName")}
                  error={errors.firstName}
                  autoComplete="off"
                />
                <TextField
                  requiredIndicator
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange("lastName")}
                  error={errors.lastName}
                  autoComplete="off"
                />
              </FormLayout.Group>

              <FormLayout.Group>
                <TextField
                  requiredIndicator
                  label="Email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  error={errors.email}
                  autoComplete="off"
                />

                <TextField
                  type="tel"
                  maxLength={10}
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  error={errors.phone}
                  autoComplete="off"
                />
              </FormLayout.Group>
            </FormLayout>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text variant="headingMd" as="h5">
                Commission Terms :
              </Text>
              <Text tone="subdued" variant="bodyXs">
                Rules for earning commissions through your affiliate referrals
              </Text>
            </BlockStack>
            <BlockStack gap="200">
              <div className="commissionTypes">
                <Select
                  label="Commission Type"
                  options={[
                    { label: "None", value: "1" },
                    { label: "Percentage", value: "2" },
                    { label: "Fixed", value: "3" },
                  ]}
                  value={commissionType}
                  onChange={(value) => setCommissionType(value)}
                  style={{ flex: 1 }}
                />

                {commissionType !== "1" && (
                  <TextField
                    type="number"
                    label="Influencer Commission"
                    suffix={
                      commissionType === "2"
                        ? "%"
                        : commissionType === "3"
                        ? storeCurrency
                        : ""
                    }
                    min={0}
                    value={commissionValue}
                    onChange={setCommissionValue}
                    autoComplete="off"
                    style={{ flex: 1 }}
                  />
                )}
              </div>

              {commissionType !== "1" && (
                <Select
                  label="Commission Base"
                  options={[
                    { label: "Only Product Price", value: "1" },
                    { label: "Product Price + Tax", value: "2" },
                    { label: "Product Price + Shipping", value: "3" },
                    {
                      label: "Total Order (Product + Shipping + Tax)",
                      value: "4",
                    },
                  ]}
                  value={commissionBase}
                  onChange={(value) => setCommissionBase(value)}
                />
              )}
            </BlockStack>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}

export default InviteInfluencer;
