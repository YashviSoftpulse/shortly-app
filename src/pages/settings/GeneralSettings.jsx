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
  FormLayout,
  Button,
  Banner,
  InlineStack,
  Checkbox,
  Divider,
} from "@shopify/polaris";
import { NoteIcon } from "@shopify/polaris-icons";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData, getApiURL } from "../../action";
import { SketchPicker } from "react-color";
import { useApiData } from "../../components/ApiDataProvider";

function GeneralSettings() {
  const [files, setFiles] = useState([]);
  const [logoError, setLogoError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [frontName, setFrontName] = useState("");
  const [frontLogo, setFrontLogo] = useState(false);
  const [customCss, setCustomCss] = useState("");
  const [storefrontView, setStorefrontView] = useState("2");
  const [selectedPicker, setSelectedPicker] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [backgroundColor, setBackgroundcolor] = useState("#fafaf9");
  const [menuActiveBackground, seMenuActiveBackground] = useState("#fafaf9");
  const [influncerTagBackground, setInfluncerTagBackground] =
    useState("#fafaf9");
  const [brandNameError, setBrandNameError] = useState("");
  const { data, loading, error } = useApiData();
  const navigate = useNavigate();

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
      "image/gif",
      "image/jpg",
      "image/svg+xml",
    ].includes(file.type);

    if (file.size > fileSizeLimit) {
      setLogoError("File size must be less than 2MB.");
      return;
    }

    if (!isValid) {
      setLogoError("Only PNG, JPG, JPEG, GIF or SVG images are supported.");
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
                  : [
                      "image/gif",
                      "image/jpeg",
                      "image/png",
                      "image/jpg",
                      "image/svg+xml",
                    ].includes(file.type)
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
      const response = await fetchData(getApiURL(`get-notification-settings`));
      if (response?.status) {
        const data = response?.notification_settings;
        if (data?.front_logo) {
          setIsFetching(false);
          setFiles([
            {
              name: data?.front_logo || "",
              type: "image/jpeg",
              url: data?.front_logo || "",
            },
          ]);
        }
        setFrontLogo(data?.front_show_logo);
        setFrontName(data?.front_title || "");
        setCustomCss(data?.custom_css || "");
        setStorefrontView(data?.storefront_view || "2");
        setBackgroundcolor(data?.storefront_css?.background_color || "");
        setTextColor(data?.storefront_css?.text_color || "");
        seMenuActiveBackground(data?.storefront_css?.menu_active_bg || "");
        setInfluncerTagBackground(data?.storefront_css?.influncer_tag_bg || "");
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

  function cssTextToJSON(cssText) {
    const cssObject = {};
    const regex = /([^{]+){([^}]+)}/g;
    let match;

    while ((match = regex.exec(cssText)) !== null) {
      const selector = match[1].trim();
      const rules = match[2].trim().split(";").filter(Boolean);

      const ruleObject = {};
      for (let rule of rules) {
        const [property, value] = rule.split(":");
        if (property && value) {
          ruleObject[property.trim()] = value.trim();
        }
      }

      if (Object.keys(ruleObject).length > 0) {
        cssObject[selector] = ruleObject;
      }
    }

    return cssObject;
  }

  const handleSave = async () => {
    const validationErrors = [];

    if (frontLogo && (!files.length || (!files[0].url && !files[0].type))) {
      validationErrors.push("Please upload a logo file.");
    }
    const isValidHex = (color) => /^#[0-9A-F]{6}$/i.test(color);

    if (!isValidHex(textColor)) {
      validationErrors.push("Text color must be a valid hex code.");
    }

    if (!isValidHex(backgroundColor)) {
      validationErrors.push("Background color must be a valid hex code.");
    }

    if (!isValidHex(menuActiveBackground)) {
      validationErrors.push("Menu Active Background must be a valid hex code.");
    }

    if (!isValidHex(influncerTagBackground)) {
      validationErrors.push(
        "Influencer Tag Background must be a valid hex code."
      );
    }

    let brandNameValid = true;

    if (frontLogo === false && !frontName.trim()) {
      brandNameValid = false;
      setBrandNameError("Brand Name is required.");
      validationErrors.push("Brand Name is required.");
    } else {
      setBrandNameError("");
    }

    let cssJsonObject = {};

    if (typeof customCss === "string") {
      try {
        cssJsonObject = JSON.parse(customCss);
      } catch {
        cssJsonObject = cssTextToJSON(customCss);
      }
    } else {
      cssJsonObject = customCss;
    }

    if (validationErrors.length > 0) {
      validationErrors.forEach((msg) =>
        shopify.toast.show(msg, { duration: 3000, isError: true })
      );
      return;
    }

    setIsSaving(true);
    const formdata = new FormData();
    if (files.length > 0 && !files[0].url) {
      formdata.append("front_logo", files[0]);
    }

    const updatedStorefrontCSS = {
      text_color: textColor,
      background_color: backgroundColor,
      menu_active_bg: menuActiveBackground,
      influncer_tag_bg: influncerTagBackground,
    };

    formdata.append("front_title", frontName);
    formdata.append("custom_css", JSON.stringify(cssJsonObject));
    formdata.append("storefront_view", storefrontView);
    formdata.append("storefront_css", JSON.stringify(updatedStorefrontCSS));
    formdata.append("front_show_logo", frontLogo);

    const response = await fetchData(
      getApiURL("save-notification-settings"),
      formdata
    );

    if (response?.status === true) {
      setIsSaving(false);
      shopify.toast.show("Settings save successfully!", { duration: 3000 });
    } else {
      setIsSaving(false);
      shopify.toast.show(response?.message, { duration: 3000, isError: true });
    }
  };

  const SketchPickermarkup = (
    type,
    label,
    inputVal,
    setInputVal,
    setSelectedPicker
  ) => {
    return (
      <div className="sketch-picker-box" style={{ position: "relative" }}>
        <TextField
          maxLength={7}
          autoComplete="off"
          prefix={
            <div
              onClick={(name) => {
                setSelectedPicker(type);
              }}
              style={{
                border: "1px solid #ccc",
                width: "22px",
                height: "22px",
                borderRadius: "2px",
                background: inputVal,
                cursor: "pointer",
              }}
            ></div>
          }
          type="text"
          label={label}
          value={inputVal}
          error={inputVal === undefined || inputVal === "" ? true : false}
          requiredIndicator={true}
          onChange={(newValue) =>
            setInputVal(newValue.replace(/\s+/g, " ").trim())
          }
          disabled={data?.plan_details?.name === "Free" ? true : false}
        />
        {/* {validationError.error == type && (
          <InlineError message="Please enter valid color!" />
        )} */}
        {selectedPicker == type && data?.plan_details?.name !== "Free" && (
          <div
            className="sketch-picker-wrap"
            style={{
              position: "absolute",
              zIndex: "999",
              bottom: `calc(100% - 23px)`,
              // bottom: "unset",
              top: `calc(100% - 63px)`,
            }}
          >
            <div
              style={{
                position: "fixed",
                top: "0px",
                right: "0px",
                bottom: "0px",
                left: "0px",
              }}
              onClick={() => {
                setSelectedPicker("unselected");
              }}
            />
            <SketchPicker
              color={inputVal}
              disableAlpha
              onChange={(newValue) => setInputVal(newValue.hex)}
            />
          </div>
        )}
      </div>
    );
  };

  if (isFetching) {
    return (
      <Page
        title="Influencer Dashboard"
        primaryAction={{
          content: "Save",
        }}
        backAction={{
          onAction: () => navigate(`/settings${window.location.search}`),
        }}
      >
        <Layout>
          <Layout.AnnotatedSection
            title="Storefront Appearance"
            description="Customize how your storefront appears to users."
          >
            <Card>
              <BlockStack gap={300}>
                <SkeletonDisplayText size="medium" />
                <SkeletonBodyText lines={8} />
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
    <div className="email-page">
      <Page
        title="Influencer Dashboard"
        primaryAction={{
          content: "Save",
          onAction: handleSave,
          loading: isSaving,
          disabled: data?.plan_details?.name === "Free" ? true : false,
        }}
        backAction={{
          onAction: () => navigate(`/settings${window.location.search}`),
        }}
      >
        <BlockStack gap={300}>
          {data?.plan_details?.name === "Free" && (
            <Banner
              title="Premium Features Unlocked"
              action={{
                content: (
                  <InlineStack gap={200}>
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
                    </svg>{" "}
                    Upgrade plan
                  </InlineStack>
                ),
                url: `/plans${window.location.search}`,
              }}
              status="info"
            >
              Unlock these features by upgrading your Plan!
            </Banner>
          )}
          <Layout>
            <Layout.AnnotatedSection
              title="Storefront Appearance"
              description="Customize how your storefront appears to influencer."
            >
              <Card padding={data?.plan_details?.name === "Free" ? 400 : 400}>
                <div
                  className="Polaris-Box"
                  style={{
                    ...(data?.plan_details?.name === "Free" && {
                      filter: "blur(2px)",
                      opacity: 0.9,
                    }),
                  }}
                >
                  <BlockStack gap={400}>
                    <BlockStack gap={300}>
                      <Text variant="headingSm" as="h5">
                        Logo
                      </Text>
                      <Checkbox
                        label="Logo Enable"
                        checked={frontLogo}
                        onChange={(val) => setFrontLogo(val)}
                        disabled={data?.plan_details?.name === "Free"}
                      />
                      {frontLogo === true && (
                        <BlockStack gap={100}>
                          <DropZone
                            onDrop={handleDropZoneDrop}
                            allowMultiple={false}
                            disabled={data?.plan_details?.name === "Free"}
                          >
                            {uploadedFiles}
                            {fileUpload}
                          </DropZone>
                          {logoError && (
                            <Text tone="critical">{logoError}</Text>
                          )}
                        </BlockStack>
                      )}

                      {frontLogo === false && (
                        <BlockStack gap={200}>
                          <Banner>
                            Customize your brand appearance by adding a logo. If
                            logo is not enable, your brand name will be
                            displayed instead.
                          </Banner>
                          <TextField
                            label="Brand Name"
                            type="text"
                            autoComplete="off"
                            requiredIndicator
                            value={frontName}
                            onChange={setFrontName}
                            disabled={data?.plan_details?.name === "Free"}
                            error={brandNameError}
                          />
                        </BlockStack>
                      )}
                    </BlockStack>
                    <Divider />
                    <BlockStack gap={300}>
                      <Text variant=" headingSm" fontWeight="semibold">
                        Header
                      </Text>
                      <FormLayout>
                        <FormLayout.Group condensed>
                          {SketchPickermarkup(
                            "textColor",
                            "Text",
                            textColor,
                            setTextColor,
                            setSelectedPicker
                          )}
                          {SketchPickermarkup(
                            "backgroundColor",
                            "Background",
                            backgroundColor,
                            setBackgroundcolor,
                            setSelectedPicker
                          )}
                        </FormLayout.Group>
                      </FormLayout>
                      <FormLayout>
                        <FormLayout.Group condensed>
                          {SketchPickermarkup(
                            "menubackgroundColor",
                            "Menu Background (Active)",
                            menuActiveBackground,
                            seMenuActiveBackground,
                            setSelectedPicker
                          )}
                          {SketchPickermarkup(
                            "influencerTagebackgroundColor",
                            "Influencer Label Background",
                            influncerTagBackground,
                            setInfluncerTagBackground,
                            setSelectedPicker
                          )}
                        </FormLayout.Group>
                      </FormLayout>
                    </BlockStack>
                    <Divider />
                    <BlockStack gap={300}>
                      <Text variant="headingSm" as="h5">
                        Custom CSS
                      </Text>
                      <TextField
                        label="Custom CSS"
                        labelHidden
                        multiline={5}
                        autoComplete="off"
                        value={
                          typeof customCss === "string"
                            ? customCss
                            : JSON.stringify(customCss, null, 2)
                        }
                        onChange={(value) => {
                          try {
                            setCustomCss(JSON.parse(value));
                          } catch {
                            setCustomCss(value);
                          }
                        }}
                        disabled={data?.plan_details?.name === "Free"}
                      />
                    </BlockStack>
                  </BlockStack>
                </div>
              </Card>
            </Layout.AnnotatedSection>

            <Layout.AnnotatedSection></Layout.AnnotatedSection>
          </Layout>
        </BlockStack>
      </Page>
    </div>
  );
}

export default GeneralSettings;
