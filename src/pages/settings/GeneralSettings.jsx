import {
  Card,
  Text,
  Page,
  Layout,
  DropZone,
  Thumbnail,
  TextField,
  BlockStack,
  SkeletonDisplayText,
  SkeletonBodyText,
  RadioButton,
  InlineStack,
} from "@shopify/polaris";
import { NoteIcon } from "@shopify/polaris-icons";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData, getApiURL } from "../../action";

function GeneralSettings() {
  const [files, setFiles] = useState([]);
  const [logoError, setLogoError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [frontName, setFrontName] = useState("");
  const [customCss, setCustomCss] = useState("");
  const [storefrontView, setStorefrontView] = useState("2");

  const navigate = useNavigate();

  const handleDropZoneDrop = useCallback((_dropFiles, acceptedFiles) => {
    setLogoError(false);
    const file = acceptedFiles[0];
    const fileSizeLimit = 2 * 1024 * 1024;

    if (!file) {
      setLogoError("No file selected. Please upload a PNG or JPEG image.");
      return;
    }

    const isValid = ["image/jpeg", "image/png"].includes(file.type);

    if (file.size > fileSizeLimit) {
      setLogoError("File size must be less than 2MB.");
      return;
    }

    if (!isValid) {
      setLogoError("Only PNG or JPEG images are supported.");
      return;
    }

    setFiles([file]);
  }, []);

  const fileUpload = !files.length && (
    <DropZone.FileUpload actionHint="Only PNG and JPEG files under 2MB are accepted." />
  );

  const uploadedFiles = files.length > 0 && (
    <div style={{ padding: "30px" }}>
      <BlockStack>
        {files.map((file, index) => (
          <BlockStack align="center" key={index}>
            <Thumbnail
              size="large"
              alt={file.name}
              source={
                file.url
                  ? file.url
                  : ["image/gif", "image/jpeg", "image/png"].includes(file.type)
                    ? window.URL.createObjectURL(file)
                    : NoteIcon
              }
            />
          </BlockStack>
        ))}
      </BlockStack>
    </div>
  );

  const getEmailNotification = async () => {
    setIsFetching(true);
    try {
      const response = await fetchData(getApiURL(`/get-notification-settings`));

      if (response?.status) {

        const data = response.notification_settings;

        if (data?.front_logo) {
          setFiles([
            {
              name: data?.front_logo || "",
              type: "image/jpeg",
              url: data?.front_logo || "",
            },
          ]);
        }
        setFrontName(data?.front_title || "");
        setCustomCss(data?.custom_css || "");
        setStorefrontView(data?.storefront_view || "2");
      }
    } catch (error) {
      console.error("Error fetching notification settings:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    getEmailNotification();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const formdata = new FormData();

    if (files.length > 0 && !files[0].url) {
      formdata.append("front_logo", files[0]);
    }
    formdata.append("front_title", frontName);
    formdata.append("custom_css", JSON.stringify(customCss));
    formdata.append("storefront_view", storefrontView);

    try {
      const response = await fetchData(
        getApiURL("/save-notification-settings"),
        formdata
      );

      if (response?.status === true) {
        shopify.toast.show("Settings save successfully!", { duration: 3000 });
      }
    } catch (error) {
      shopify.toast.show(response?.message, { duration: 3000, isError: true });
    } finally {
      setIsSaving(false);
      shopify.toast.show(response?.message, { duration: 3000, isError: true });
    }
  };


  if (isFetching) {
    return (
      <Page
        title="General Settings"
        primaryAction={{
          content: "Save",
        }}
        backAction={{
          onAction: () => navigate(`/settings${window.location.search}`),
        }}
      >
        <Layout>
          <Layout.AnnotatedSection
            title="Logo & Brand Name"
            description="Give your brand a fresh look with a custom logo and new identity."
          >
            <Card>
              <BlockStack gap={300}>
                <SkeletonDisplayText size="medium" />
                <SkeletonBodyText lines={8} />
              </BlockStack>
            </Card>
          </Layout.AnnotatedSection>

          <Layout.AnnotatedSection
            title="Storefront Appearance"
            description="Customize how your storefront appears to users."
          >
            <Card>
              <BlockStack gap={300}>
                <SkeletonDisplayText size="medium" />
                <SkeletonBodyText lines={8} />
              </BlockStack>
            </Card>
          </Layout.AnnotatedSection>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="General Settings"
      primaryAction={{
        content: "Save",
        onAction: handleSave,
        loading: isSaving,
      }}
      backAction={{
        onAction: () => navigate(`/settings${window.location.search}`),
      }}
    >
      <Layout>
        <Layout.AnnotatedSection
          title="Logo & Brand Name"
          description="Give your brand a fresh look with a custom logo and new identity."
        >
          <Card>
            <BlockStack gap={300}>
              <Text variant="headingSm" as="h5">
                Brand Name
              </Text>

              <TextField
                label="Brand Name"
                labelHidden
                type="text"
                autoComplete="off"
                requiredIndicator
                value={frontName}
                onChange={setFrontName}
              />

              <Text variant="headingSm" as="h5" >
                Logo
              </Text>

              <BlockStack gap={100}>
                <DropZone onDrop={handleDropZoneDrop} allowMultiple={false}>
                  {uploadedFiles}
                  {fileUpload}
                </DropZone>
                {logoError && <Text tone="critical">{logoError}</Text>}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title="Storefront Appearance"
          description="Customize how your storefront appears to users."
        >
          <Card>
            <BlockStack gap={300}>
              <Text variant="headingSm" as="h5">
                Container Layout
              </Text>
              <InlineStack gap={400}>
                <RadioButton
                  label="Container"
                  checked={storefrontView === "1"}
                  onChange={() => setStorefrontView("1")}
                />
                <RadioButton
                  label="Full Container"
                  checked={storefrontView === "2"}
                  onChange={() => setStorefrontView("2")}
                />
              </InlineStack>

              <Text variant="headingSm" as="h5">
                Custom CSS
              </Text>
              <TextField
                label="Custom CSS"
                labelHidden
                multiline={5}
                autoComplete="off"
                value={typeof customCss === "string" ? customCss : JSON.stringify(customCss, null, 2)}
                onChange={(value) => {
                  try {
                    setCustomCss(JSON.parse(value));
                  } catch {
                    setCustomCss(value);
                  }
                }}
              />
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection></Layout.AnnotatedSection>
      </Layout>
    </Page>
  );
}

export default GeneralSettings;
