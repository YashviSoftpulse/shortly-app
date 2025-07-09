import {
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Page,
  Badge,
  Button,
  Modal,
  Select,
  Layout,
  DropZone,
  Thumbnail,
  Checkbox,
  FormLayout,
  TextField,
  Grid,
  Banner,
  Bleed,
  BlockStack,
  InlineStack,
  Divider,
  SkeletonDisplayText,
  SkeletonBodyText,
  Box,
} from "@shopify/polaris";
import { NoteIcon } from "@shopify/polaris-icons";
import React, { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { SketchPicker } from "react-color";
import { useNavigate } from "react-router-dom";
import { fetchData, getApiURL } from "../../action";
import { useApiData } from "../../components/ApiDataProvider";

function EmailSettings() {
  const [testModal, setTestModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [isLogo, setIsLogo] = useState(true);
  const [selectedPicker, setSelectedPicker] = useState("");
  const [backgroundColor, setBackgroundcolor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [buttonTextColor, setButtonTextcolor] = useState("#000000");
  const [buttonBackgroundColor, setButtonBackgroundcolor] = useState("#ffffff");
  const [fromEmail, setFromEmail] = useState(undefined);
  const [verifyLoader, setVerifyLoader] = useState(false);
  const [notificationSettingsData, setNotificationSettingsData] = useState({});
  const [verifyEmailErrorMessage, setVerifyEmailErrorMessage] = useState(false);
  const [testEmail, setTestEmail] = useState();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [saveLoader, setSaveLoader] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [emailType, setEmailType] = useState("");
  const [testEmailError, setTestEmailError] = useState(false);
  const navigate = useNavigate();
  const { data, error } = useApiData();

  const urlParams = new URLSearchParams(window.location.search);
  const params = {};
  for (const [key, value] of urlParams.entries()) {
    params[key] = value;
  }

  const validImageTypes = [
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "image/heic",
    "image/jpg",
  ];
  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => {
      setLogoError(false);

      const validFile = acceptedFiles[0];
      const fileSizeLimit = 2 * 1024 * 1024; // 2 MB

      const extensionRegex = /\.(jpg|jpeg|png|gif|webp|svg|heic)$/i;
      const isValidFileType =
        validFile &&
        (validImageTypes.includes(validFile.type) ||
          extensionRegex.test(validFile.name));

      if (validFile && validFile.size > fileSizeLimit) {
        setLogoError("File size exceeds the 2MB limit");
        return;
      }

      if (isValidFileType) {
        setFiles([validFile]);
      } else {
        setLogoError(
          "Please upload a valid image file (JPG, JPEG, PNG, GIF, HEIC, WebP, SVG)"
        );
      }
    },
    [validImageTypes]
  );

  const handleVerify = () => {
    const suffixUrl = "verify";
    if (
      fromEmail === null ||
      fromEmail?.trim() === "" ||
      fromEmail === undefined
    ) {
      setVerifyEmailErrorMessage("Sender Email is required");
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(fromEmail)) {
      setVerifyEmailErrorMessage("Please enter a valid email address");
      return false;
    }
    setVerifyEmailErrorMessage(false);
    setVerifyLoader(true);
    const formdata = new FormData();
    formdata.append("email", fromEmail);

    const response = fetchData(getApiURL(suffixUrl), formdata);

    if (response.status === true) {
      shopify.toast.show(response.message, { duration: 3000 });
      setVerifyLoader(false);
      getEmailData();
    } else {
      shopify.toast.show(response.message, {
        duration: 3000,
      });
      setVerifyLoader(false);
    }

    shopify.toast.show(error, { isError: true, duration: 3000 });
    setVerifyLoader(false);
  };

  const getEmailData = async () => {
    setLoading(true);
    const response = await fetchData(getApiURL(`get-notification-settings`));
    if (response.status === true) {
      setLoading(false);
      setNotificationSettingsData(response?.notification_settings);
      setTextColor(
        response?.notification_settings?.css?.email_template_body_text_color
      );
      setBackgroundcolor(
        response?.notification_settings?.css?.email_template_background
      );
      setButtonBackgroundcolor(
        response?.notification_settings?.css?.btn_background
      );
      setButtonTextcolor(response?.notification_settings?.css?.btn_text_color);
      setFromEmail(response?.notification_settings?.verify_email);
      setFiles(response?.notification_settings?.logo);
      setIsLogo(response?.notification_settings?.enable_logo);
      // if (response?.notification_settings && response?.notification_settings?.active) {
      //    setSelectedTemplate('active');
      //    response?.notification_settings?.active?.subject === "" ?
      //       setTemplateDetails({ ...response.notification_settings.active, subject: null }) :
      //       setTemplateDetails(response?.notification_settings?.active)
      // }
    }
    setLoading(false);
  };

  useEffect(() => {
    getEmailData();
  }, []);

  function capitalizeFirstLetter(string = "") {
    if (string == "") return string;
    string = string?.replace(/_/g, " ");
    return string?.charAt(0)?.toUpperCase() + string?.slice(1);
  }

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
          disabled={data?.plan_details?.name === "Free"}
        />
        {/* {validationError.error == type && (
          <InlineError message="Please enter valid color!" />
        )} */}
        {selectedPicker === type && data?.plan_details?.name !== "Free" && (
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

  const handleLogoCheckbox = useCallback((newChecked) => {
    setIsLogo(newChecked);
  }, []);

  const fileUpload = !files.length && (
    <DropZone.FileUpload actionHint="Accepts .jpg, .jpeg and .png file" />
  );

  const uploadedFiles = files && (
    <div style={{ padding: "30px" }}>
      <BlockStack>
        {typeof files === "string" ? (
          <BlockStack align="center">
            <Thumbnail size="large" source={files} />
          </BlockStack>
        ) : Array.isArray(files) && files.length > 0 ? (
          files.map((file, index) => (
            <BlockStack align="center" gap={200} key={index}>
              <Thumbnail
                size="large"
                alt={file.name}
                source={
                  validImageTypes.includes(file.type)
                    ? window.URL.createObjectURL(file)
                    : NoteIcon
                }
              />
              <Text>{file.name}</Text>
              <Text variant="bodySm" as="p">
                {file.size} bytes
              </Text>
            </BlockStack>
          ))
        ) : null}
      </BlockStack>
    </div>
  );

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
    formdata.append("type", emailType);
    const suffixUrl = "test-email";
    fetchData(getApiURL(suffixUrl), formdata).then((response) => {
      setTestLoading(false);
      if (response.status === 200 || response.error === false) {
        setTestModal(false);
        shopify.toast.show(response.message, { duration: 3000 });
      } else {
        shopify.toast.show(response.message, { duration: 3000, isError: true });
      }
    });
  };

  const handleSave = () => {
    if (
      !textColor ||
      textColor.trim() === "" ||
      !buttonTextColor ||
      !buttonTextColor.trim() === ""
    ) {
      shopify.toast.show("Please enter valid title color.", {
        isError: true,
        duration: 3000,
      });
    } else if (
      !backgroundColor ||
      backgroundColor.trim() === "" ||
      !buttonBackgroundColor ||
      !buttonBackgroundColor.trim() === ""
    ) {
      shopify.toast.show("Please enter valid background color.", {
        isError: true,
        duration: 3000,
      });
    } else {
      const suffixUrl = "/save-notification-settings";
      const formdata = new FormData();
      if (notificationSettingsData?.enable_logo) {
        if (files.length === 0 && !notificationSettingsData?.logo) {
          setLogoError("Logo file is required");
          return false;
        } else {
          formdata.append("logo", files[0]);
        }
      }
      if (!fromEmail.trim()) {
        setVerifyEmailErrorMessage("Email is required");
        return false;
      }

      setSaveLoader(true);
      const css = {
        email_template_body_text_color: textColor,
        email_template_background: backgroundColor,
        btn_background: buttonBackgroundColor,
        btn_text_color: buttonTextColor,
        btn_radius: notificationSettingsData?.css?.btn_radius,
        image_width: notificationSettingsData?.css?.image_width,
        image_align: notificationSettingsData?.css?.image_align,
      };
      formdata.append("css", JSON.stringify(css));
      formdata.append("show_logo", isLogo);
      isLogo === false &&
        formdata.append("logo_title", notificationSettingsData.logo_title);
      formdata.append(
        "invite_enable",
        notificationSettingsData?.invite?.is_enable
      );
      formdata.append(
        "re_invite_enable",
        notificationSettingsData?.re_invite?.is_enable
      );

      formdata.append(
        "verified_status",
        notificationSettingsData?.verified_status
      );
      formdata.append("verify_email", fromEmail);
      fetchData(getApiURL(suffixUrl), formdata).then((response) => {
        setSaveLoader(false);
        if (response.status === true) {
          shopify.toast.show(response.message, { duration: 3000 });
        } else {
          shopify.toast.show(response.message, {
            duration: 3000,
            isError: true,
          });
        }
      });
    }
  };

  return loading ? (
    <Page
      title="Email Notification Settings"
      primaryAction={{
        content: "Save",
      }}
      backAction={{
        onAction: () => navigate(`/settings${window.location.search}`),
      }}
    >
      <Layout>
        <Layout.AnnotatedSection
          title="Email Verification"
          subtitle="Customize email notifications to receive updates on your account status"
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
  ) : (
    <div className="email-page">
      <Page
        title="Email Notification Settings"
        subtitle="Customize email notifications to receive updates on your account status"
        primaryAction={{
          content: "Save",
          onAction: () => handleSave(),
          loading: saveLoader,
          disabled: data?.plan_details?.name === "Free",
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
                    {" "}
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
              title="Email Verification"
              description="Authenticating your sender email helps ensure reliable delivery of your email notifications"
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
                  <FormLayout>
                    <Banner>
                      As per the new security modifications, we need to verify
                      your identity before you can start sending notifications
                      using your email address. Please click the verify button
                      to verify your email.
                    </Banner>
                    {notificationSettingsData?.verified_status == "2" && (
                      <Banner
                        title="Check your Email for verification"
                        status="info"
                      ></Banner>
                    )}

                    <TextField
                      label="Verified Sender Email"
                      value={fromEmail}
                      type="email"
                      autoComplete="off"
                      disabled={
                        notificationSettingsData?.verified_status === "2" ||
                        data?.plan_details?.name === "Free"
                      }
                      helpText={
                        notificationSettingsData?.verified_status === "1" &&
                        notificationSettingsData?.verify_email === fromEmail &&
                        "This Email is already verified"
                      }
                      error={
                        fromEmail === undefined
                          ? false
                          : verifyEmailErrorMessage
                      }
                      onChange={(value) => {
                        setFromEmail(value);
                        if (value.trim()) {
                          setVerifyEmailErrorMessage(false);
                        }
                      }}
                      connectedRight={
                        fromEmail !== "noreply@shopiapps.in" &&
                        !(
                          notificationSettingsData?.verified_status == "1" &&
                          notificationSettingsData?.verify_email === fromEmail
                        ) && (
                          <InlineStack align="end">
                            <Button
                              variant="plain"
                              loading={verifyLoader}
                              disabled={
                                notificationSettingsData?.verified_status ===
                                  "2" || data?.plan_details?.name === "Free"
                              }
                              onClick={() => handleVerify()}
                            >
                              Verify
                            </Button>
                          </InlineStack>
                        )
                      }
                    />
                  </FormLayout>
                </div>
              </Card>
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection
              title="Customize Your Email Logo"
              description="Customize how your logo appears in emails—adjust size, position, and visibility"
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
                  <BlockStack gap={300}>
                    <Checkbox
                      label="Enable Email Logo"
                      checked={isLogo}
                      onChange={handleLogoCheckbox}
                      disabled={data?.plan_details?.name === "Free"}
                    />
                    <Grid>
                      <Grid.Cell
                        columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}
                      >
                        <BlockStack gap={100}>
                          <div className="email-logo-drop-zone-container">
                            <DropZone
                              onDrop={handleDropZoneDrop}
                              allowMultiple={false}
                              disabled={data?.plan_details?.name === "Free"}
                              type="image"
                            >
                              {uploadedFiles}
                              {fileUpload}
                            </DropZone>
                          </div>
                          {logoError !== false && (
                            <Text tone="critical">{logoError}</Text>
                          )}
                        </BlockStack>
                      </Grid.Cell>
                      <Grid.Cell
                        columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}
                      >
                        <FormLayout>
                          <TextField
                            label="Width (in %)"
                            type="number"
                            autoComplete="off"
                            value={notificationSettingsData?.css?.image_width}
                            onChange={(value) =>
                              setNotificationSettingsData((prev) => ({
                                ...prev,
                                css: { ...prev.css, image_width: value },
                              }))
                            }
                            min={0}
                            max={100}
                            disabled={data?.plan_details?.name === "Free"}
                          />
                          <Select
                            label="Alignment"
                            options={[
                              {
                                label: "Center",
                                value: "center",
                              },
                              {
                                label: "Left",
                                value: "left",
                              },
                              {
                                label: "Right",
                                value: "right",
                              },
                            ]}
                            value={notificationSettingsData?.css?.image_align}
                            onChange={(value) =>
                              setNotificationSettingsData((prev) => ({
                                ...prev,
                                css: { ...prev.css, image_align: value },
                              }))
                            }
                            min={0}
                            disabled={data?.plan_details?.name === "Free"}
                          />
                        </FormLayout>
                      </Grid.Cell>
                    </Grid>
                    {!isLogo && (
                      <>
                        <Bleed marginInline={400}>
                          <Divider />
                        </Bleed>
                        <BlockStack gap={300}>
                          <Banner>
                            Customize the appearance of your email template by
                            adding your shop logo. If the logo is not selected,
                            your display name will be displayed instead.
                          </Banner>
                          <TextField
                            label="Display Name"
                            value={notificationSettingsData.logo_title}
                            onChange={(value) =>
                              setNotificationSettingsData((prev) => ({
                                ...prev,
                                logo_title: value,
                              }))
                            }
                            disabled={data?.plan_details?.name === "Free"}
                          />
                        </BlockStack>
                      </>
                    )}
                  </BlockStack>
                </div>
              </Card>
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection
              title="Template Appearance"
              description="Modify color schemes and border radius to align your emails with your store’s visual style."
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
                  <FormLayout>
                    <BlockStack gap={200}>
                      <Text variant=" headingSm" fontWeight="semibold">
                        Email
                      </Text>
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
                    </BlockStack>
                    <Divider />
                    <BlockStack gap={200}>
                      <Text variant=" headingSm" fontWeight="semibold">
                        Button
                      </Text>
                      <FormLayout.Group condensed>
                        {SketchPickermarkup(
                          "buttonTextColor",
                          "Text",
                          buttonTextColor,
                          setButtonTextcolor,
                          setSelectedPicker
                        )}
                        {SketchPickermarkup(
                          "buttonBackgroundColor",
                          "Background",
                          buttonBackgroundColor,
                          setButtonBackgroundcolor,
                          setSelectedPicker
                        )}
                      </FormLayout.Group>

                      <TextField
                        label="Radius (in px)"
                        type="number"
                        min={0}
                        value={notificationSettingsData?.css?.btn_radius}
                        onChange={(value) =>
                          setNotificationSettingsData((prev) => ({
                            ...prev,
                            css: { ...prev.css, btn_radius: value },
                          }))
                        }
                        requiredIndicator={true}
                        disabled={data?.plan_details?.name === "Free"}
                      />
                    </BlockStack>
                  </FormLayout>
                </div>
              </Card>
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection
              title="Manage Email Templates"
              description="Control the look and behavior of your email templates with tools to edit, test, and toggle them on or off as needed."
            >
              <Card padding={0}>
                <div
                  className="Polaris-Box"
                  style={{
                    ...(data?.plan_details?.name === "Free" && {
                      filter: "blur(2px)",
                      opacity: 0.9,
                    }),
                  }}
                >
                  <ResourceList
                    resourceName={{ singular: "template", plural: "templates" }}
                    items={Object.entries(notificationSettingsData).filter(
                      ([key, item]) =>
                        item?.hasOwnProperty("is_enable") &&
                        item?.hasOwnProperty("subject") &&
                        item?.hasOwnProperty("message")
                    )}
                    renderItem={([key, item]) => {
                      const { name, is_enable, subject, message } = item;
                      return (
                        <ResourceItem
                          accessibilityLabel={`View details for ${key}`}
                          disabled={data?.plan_details?.name === "Free"}
                        >
                          <div
                            className="Polaris-InlineStack"
                            style={{
                              "--pc-inline-stack-align": "space-between",
                              "--pc-inline-stack-wrap": "wrap",
                              "--pc-inline-stack-flex-direction-xs": "row",
                              alignItems: "center",
                            }}
                          >
                            <InlineStack gap={200}>
                              <Text variant="bodyMd" as="h3">
                                {name}
                              </Text>
                              <Badge
                                tone={
                                  is_enable == "1" ? "success" : "attention"
                                }
                              >
                                {is_enable == "1" ? "Active" : "Inactive"}
                              </Badge>
                            </InlineStack>
                            <InlineStack gap={300} align="end">
                              <Button
                                tone={is_enable == "1" ? "critical" : "success"}
                                variant="plain"
                                onClick={() =>
                                  setNotificationSettingsData((prev) => ({
                                    ...prev,
                                    [key]: {
                                      ...prev[key],
                                      is_enable: is_enable == "1" ? "0" : "1",
                                    },
                                  }))
                                }
                                disabled={data?.plan_details?.name === "Free"}
                              >
                                {is_enable == "1" ? "Disable" : "Enable"}
                              </Button>
                              <Button
                                variant="plain"
                                disabled={data?.plan_details?.name === "Free"}
                                onClick={() => {
                                  localStorage.setItem(
                                    "emailTemplateType",
                                    key
                                  );
                                  navigate(
                                    `/settings/emailSettings/edit${window.location.search}`,
                                    {
                                      state: {
                                        templateData: notificationSettingsData,
                                        type: key,
                                      },
                                    }
                                  );
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="plain"
                                onClick={() => {
                                  setEmailType(key);
                                  setTestModal(true);
                                }}
                                disabled={data?.plan_details?.name === "Free"}
                              >
                                Test Email
                              </Button>
                            </InlineStack>
                          </div>
                        </ResourceItem>
                      );
                    }}
                  />
                </div>
              </Card>
            </Layout.AnnotatedSection>
            <Modal
              title={`Test ${capitalizeFirstLetter(
                notificationSettingsData?.[emailType]?.name
              )}`}
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
            <Layout.Section></Layout.Section>
          </Layout>
        </BlockStack>
      </Page>
    </div>
  );
}
export default EmailSettings;
