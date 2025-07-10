import {
  Modal,
  TextField,
  BlockStack,
  FormLayout,
  DropZone,
  Thumbnail,
  Text,
  Popover,
  DatePicker,
  Icon,
  Card,
} from "@shopify/polaris";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchData, getApiURL } from "../../action";
import { CalendarIcon, NoteIcon } from "@shopify/polaris-icons";
import moment from "moment";

function Create({ onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("3");
  const [status, setStatus] = useState(1);
  const [loading, setLoading] = useState(false);
  const [storeCurrency, setStoreCurrency] = useState("Rs.");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState([]);
  const [logoError, setLogoError] = useState(false);
  const [errors, setErrors] = useState({
    amount: "",
    payoutDate: "",
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visible, setVisible] = useState(false);
  const payoutDate = moment(selectedDate).format("YYYY-MM-DD");
  const [{ month, year }, setDate] = useState({
    month: selectedDate.getMonth(),
    year: selectedDate.getFullYear(),
  });
  const { id } = useParams();
  const pendingAmount = localStorage.getItem("pandingPayouts");

  const fetchStoreCurrency = async () => {
    const response = await fetchData(getApiURL("get-influencers"));
    if (response?.status === true) {
      setStoreCurrency(response?.store_currency);
    }
  };

  useEffect(() => {
    fetchStoreCurrency();
  }, []);

  const handleInputValueChange = () => {
    console.log("handleInputValueChange");
  };
  const handleOnClose = ({ relatedTarget }) => {
    setVisible(false);
  };
  const handleMonthChange = (month, year) => {
    setDate({ month, year });
  };
  const handleDateSelection = ({ end: newSelectedDate }) => {
    setSelectedDate(newSelectedDate);
    setVisible(false);
  };

  useEffect(() => {
    if (selectedDate) {
      setDate({
        month: selectedDate.getMonth(),
        year: selectedDate.getFullYear(),
      });
    }
  }, [selectedDate]);

  // const payoutMethodOptions = [
  //     { label: "Bank Transfer", value: "1" },
  //     { label: "PayPal", value: "2" },
  //     { label: "Manual Paid", value: "3" },
  // ];

  const handleCreate = async () => {
    const newErrors = {
      amount: "",
      payoutDate: "",
    };

    let hasError = false;

    const numericAmount = parseFloat(amount);

    if (!amount || numericAmount <= 0) {
      newErrors.amount = "Amount must be greater than 0.";
      hasError = true;
    }

    if (numericAmount > pendingAmount) {
      newErrors.amount =
        "Amount exceeds pending commission.";
      hasError = true;
    }

    if (!payoutDate) {
      newErrors.payoutDate = "Payout Date is required.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    setLoading(true);
    await savePayouts();
    setLoading(false);
    if (onSuccess) onSuccess();
    onClose();
  };

  const savePayouts = async () => {
    const formData = new FormData();
    formData.append("uid", id);
    formData.append("amount", amount);
    formData.append("payoutDate", moment(selectedDate).format("YYYY-MM-DD"));
    formData.append("payoutMethod", payoutMethod);
    formData.append("status", status);
    formData.append("note", note);

    if (files.length > 0 && !files[0].url) {
      formData.append("payment_proof", files[0]);
    }
    const response = await fetchData(getApiURL("save-payout"), formData);
    if (response?.status === true) {
      shopify.toast.show(response?.message, { duration: 3000 });
      onClose();
    } else {
      shopify.toast.show(response?.message, { isError: true, duration: 3000 });
      onClose();
    }
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

  return (
    <Modal
      open
      onClose={onClose}
      title="Create Payout"
      primaryAction={{
        content: "Create",
        onAction: handleCreate,
        loading: loading,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <FormLayout>
          <BlockStack gap="300">
            <FormLayout.Group>
              <TextField
                label="Amount"
                type="number"
                value={amount }
                onChange={(value) => {
                  const numericAmount = parseFloat(value);
                  if (numericAmount > pendingAmount) {
                    setErrors((prev) => ({
                      ...prev,
                      amount:
                        "Amount exceeds pending commission.",
                    }));
                  } else {
                    setErrors((prev) => ({ ...prev, amount: "" }));
                  }
                  setAmount(value);
                }}
                autoComplete="off"
                suffix={storeCurrency}
                min={0}
                requiredIndicator
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
                    value={moment(payoutDate).format("DD MMM YYYY")}
                    onFocus={() => setVisible(true)}
                    onChange={handleInputValueChange}
                    autoComplete="off"
                  />
                }
              >
                <DatePicker
                  month={month}
                  year={year}
                  selected={selectedDate}
                  onMonthChange={handleMonthChange}
                  onChange={handleDateSelection}
                />
              </Popover>
              {/* <div className="Polaris-TextField__Input inputDate">
                <TextField
                  label="Payout Date"
                  type="date"
                  value={payoutDate}
                  onChange={setPayoutDate}
                  autoComplete="off"
                  requiredIndicator
                  error={errors.payoutDate}
                />
              </div> */}
              {/* <Select
                                label="Payment Method"
                                options={payoutMethodOptions}
                                value={payoutMethod}
                                onChange={setPayoutMethod}
                            /> */}
            </FormLayout.Group>

            <TextField
              label="Notes"
              type="text"
              value={note}
              onChange={setNote}
              autoComplete="off"
              multiline={4}
            />
            <BlockStack gap={100}>
              <DropZone
                onDrop={handleDropZoneDrop}
                allowMultiple={false}
                label={"Add Files"}
              >
                {uploadedFiles}
                {fileUpload}
              </DropZone>
              {logoError && <Text tone="critical">{logoError}</Text>}
            </BlockStack>
          </BlockStack>
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
}

export default Create;
