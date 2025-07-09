import {
  Card,
  Text,
  Page,
  Layout,
  FormLayout,
  TextField,
  BlockStack,
  Modal,
  SkeletonBodyText,
  Icon,
  Badge,
  InlineStack,
} from "@shopify/polaris";
import { CheckIcon, ClipboardIcon } from "@shopify/polaris-icons";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchData, getApiURL } from "../../../action";

function EditTemplate() {
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPreviewDetails, setIsPreviewDetails] = useState(false);
  const [templateSettings, setTemplateSettings] = useState();
  const [testLoading, setTestLoading] = useState(false);
  const [testEmail, setTestEmail] = useState();
  const [testEmailError, setTestEmailError] = useState(false);
  const [testModal, setTestModal] = useState(false);
  const [subjectError, setSubjectError] = useState(false);
  const [copiedItems, setCopiedItems] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const type =
    location.state?.type || localStorage.getItem("emailTemplateType");

  async function getEmailNotification() {
    setIsFetching(true);
    const response = await fetchData(getApiURL(`get-notification-settings`));
    if (response.status === true) {
      setTemplateSettings(response?.notification_settings?.[type]);
      setIsPreviewDetails(
        response?.notification_settings?.[type]?.preview_email
      );
    }
    setIsFetching(false);
  }

  useEffect(() => {
    getEmailNotification();
  }, []);

  const sendTestEmail = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (
      testEmail === null ||
      testEmail === undefined ||
      testEmail?.trim() === ""
    ) {
      setTestEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(testEmail)) {
      setTestEmailError("Please enter a valid email address");
      return false;
    }
    setTestEmailError(false);
    setTestLoading(true);
    const formdata = new FormData();
    formdata.append("email", testEmail);
    formdata.append(
      "type",
      templateSettings?.name === "Invite" ? "invite" : "re_invite"
    );
    const suffixUrl = "test-email";
    const response = fetchData(getApiURL(suffixUrl), formdata);
    if (response.status === 200 || response.error === false) {
      setTestModal(false);
      setTestLoading(false);
      shopify.toast.show(response.message, { duration: 3000 });
    } else {
      setTestLoading(false);
      setTestModal(false);
      shopify.toast.show(response.message, { duration: 3000, isError: true });
    }
  };

  const handleSave = async () => {
    const formdata = new FormData();
    if (templateSettings?.is_enable == "1") {
      if (
        templateSettings?.subject === undefined ||
        templateSettings?.subject === null ||
        templateSettings?.subject?.trim() === ""
      ) {
        setSubjectError("Subject is Required");
        return false;
      }
    }
    setSubjectError(false);
    setIsSaving(true);
    formdata.append(`${type}_enable`, templateSettings?.is_enable);
    formdata.append(`${type}_subject`, templateSettings?.subject);
    formdata.append(`${type}_body`, templateSettings?.message);
    const response = await fetchData(
      getApiURL("save-notification-settings"),
      formdata
    );
    setIsSaving(false);
    if (response.status === true) {
      shopify.toast.show(response.message, { duration: 3000 });
      getEmailNotification();
    } else {
      setIsSaving(false);
      shopify.toast.show(response.message, { duration: 3000, isError: true });
    }
  };

  if (isFetching) {
    return (
      <Page
        title=""
        primaryAction={{
          content: "Save",
          loading: testLoading,
        }}
        secondaryActions={[
          { content: "Disable", destructive: 1 },
          { content: "Preview" },
          { content: "Test Email" },
        ]}
        backAction={{
          onAction: () =>
            navigate(`/settings/emailSettings${window.location.search}`),
        }}
      >
        <Layout>
          <Layout.Section
            title=""
            description={
              <Card>
                <BlockStack gap={300}>
                  <SkeletonBodyText lines={6} />
                </BlockStack>
              </Card>
            }
          >
            <Card>
              <BlockStack gap={300}>
                <SkeletonBodyText lines={10} />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  const handleCopy = (variable, itemId) => {
    navigator.clipboard
      .writeText(variable)
      .then(() => {
        setCopiedItems((prev) => ({ ...prev, [itemId]: true }));
        shopify.toast.show("Copied to Clipboard", { duration: 3000 });
        setTimeout(() => {
          setCopiedItems((prev) => ({ ...prev, [itemId]: false }));
        }, 1500);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        shopify.toast.show("Failed to copy to clipboard", {
          duration: 3000,
          isError: true,
        });
      });
  };

  function capitalizeFirstLetter(string = "") {
    if (string == "") return string;
    string = string?.replace(/_/g, " ");
    return string?.charAt(0)?.toUpperCase() + string?.slice(1);
  }

  return (
    <Page
      title={
        <InlineStack gap={200}>
          <Text variant="headingLg" as="h6">
            Edit {capitalizeFirstLetter(templateSettings?.name)} Template{" "}
          </Text>
          <Badge
            size="small"
            tone={templateSettings?.is_enable == "1" ? "success" : "attention"}
          >
            {templateSettings?.is_enable == "1" ? "Active" : "Inactive"}
          </Badge>
        </InlineStack>
      }
      primaryAction={{
        content: "Save",
        loading: isSaving,
        onAction: () => handleSave(),
      }}
      secondaryActions={[
        {
          content: templateSettings?.is_enable == "1" ? "Disable" : "Enable",
          destructive: templateSettings?.is_enable == "1",
          plain: true,

          onAction: () =>
            setTemplateSettings((prev) => ({
              ...prev,
              is_enable: prev.is_enable == "0" ? "1" : "0",
            })),
        },
        {
          content: "Preview",
          onAction: () => setIsPreviewModalOpen(true),
        },
        {
          content: "Test Email",
          onAction: () => setTestModal(true),
        },
      ]}
      backAction={{
        onAction: () =>
          navigate(`/settings/emailSettings${window.location.search}`),
      }}
    >
      <Layout>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap={200}>
              <Text variant="headingMd" as="h6" tone="base">
                Reference Variables
              </Text>
              {templateSettings?.reference_variables.map((variable, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "4px",
                    backgroundColor: "#f1f8f5",
                    borderRadius: "5px",
                    border: "1px solid #dfe3e8",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ marginRight: "5px" }}>{variable}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(variable, index);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <Icon
                      source={copiedItems[index] ? CheckIcon : ClipboardIcon}
                      tone="success"
                    />
                  </span>
                </div>
              ))}
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap={200}>
              <Text variant="headingMd" as="h6">
                Email Details
              </Text>
              <FormLayout>
                <TextField
                  label="Subject"
                  type="text"
                  autoComplete="off"
                  requiredIndicator
                  value={templateSettings?.subject}
                  onChange={(value) => {
                    setSubjectError(false);
                    setTemplateSettings((prev) => ({
                      ...prev,
                      subject: value,
                    }));
                  }}
                  error={subjectError}
                />
                <TextField
                  label="Body"
                  type="text"
                  autoComplete="off"
                  requiredIndicator
                  value={templateSettings?.message}
                  onChange={(value) =>
                    setTemplateSettings((prev) => ({
                      ...prev,
                      message: value,
                    }))
                  }
                  multiline={10}
                />
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section></Layout.Section>
         <Layout.Section></Layout.Section>
      </Layout>
      <Modal
        size="large"
        open={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Email Preview"
        secondaryActions={[
          { content: "Close", onAction: () => setIsPreviewModalOpen(false) },
        ]}
      >
        <Modal.Section>
          <div dangerouslySetInnerHTML={{ __html: isPreviewDetails }} />
        </Modal.Section>
      </Modal>
      <Modal
        title={`Test ${capitalizeFirstLetter(templateSettings?.name)}`}
        open={testModal}
        onClose={() => setTestModal(false)}
        primaryAction={{
          content: "Send Test Email",
          loading: testLoading,
          onAction: () => sendTestEmail(),
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setTestModal(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack>
            <TextField
              label="Email"
              requiredIndicator={true}
              value={testEmail}
              onChange={(value) => {
                setTestEmailError(false);
                setTestEmail(value);
              }}
              error={testEmailError}
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}

export default EditTemplate;
