/* IMPORT REQUIRED MODULES START */
import { BlockStack, Button, InlineStack, Modal, Text } from "@shopify/polaris";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
/* IMPORT REQUIRED MODULES END */

/* CONFIRMATION MODAL FUNCTIONAL COMPONENT START */
function ConfirmationModal({
  isOpen,
  setIsOpen,
  text,
  title,
  buttonText,
  buttonAction,
  destructive,
  show,
  loading = false, // Default to false if not provided
}) {
  const navigate = useNavigate();
  // useEffect(() => {
  //   if (show) {
  //     const timer = setTimeout(() => {
  //       const modalElement = document.querySelector(
  //         ".Polaris-Modal-Dialog__Modal"
  //       );
  //       if (modalElement && !modalElement.classList.contains("hide-button")) {
  //         modalElement.classList.add("hide-button");
  //       }
  //     }, 50);

  //     return () => clearTimeout(timer);
  //   }
  // }, [ show]);


  return (
    <Modal
      open={isOpen}
      id="ConfirmationModal"
      onClose={() => setIsOpen(false)}
      title={title}
      primaryAction={
        !show && {
          content: buttonText,
          onAction: () => buttonAction(),
          destructive: destructive,
          loading: loading, 
        }
      }
      secondaryActions={[
        {
          content: "Cancel",
          onAction: () => setIsOpen(false),
        },
      ]}
    >
      <Modal.Section>
        {show && (
          <div class="premium-plan">
            <p>
              Get more insight with{" "}
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
        <div
          class="Polaris-BlockStack"
          style={{
            "--pc-block-stack-order": "column",
            "--pc-block-stack-gap-xs": "var(--p-space-200)",
            ...(show && {
              filter: "blur(3px)",
              opacity: 0.2,
              padding: "20px",
            }),
          }}
        >
          <Text>{text}</Text>
        </div>
      </Modal.Section>
    </Modal>
  );
}

export default ConfirmationModal;
/* CONFIRMATION MODAL FUNCTIONAL COMPONENT END */
