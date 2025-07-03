/* IMPORT REQUIRED MODULES START */
import {
  SkeletonPage,
  Layout,
  LegacyCard,
  SkeletonBodyText,
  TextContainer,
  SkeletonDisplayText,
  InlineStack,
  Card,
  InlineGrid,
  SkeletonThumbnail,
} from "@shopify/polaris";
import React from "react";
/* IMPORT REQUIRED MODULES END */

/* SKELETON PAGE FUNCTIONAL COMPONENT START */
export default function SkeletonPage_Cmp() {
  return (
    <SkeletonPage primaryAction >
      <Layout>
        <Layout.Section>
          <InlineGrid gap="200" columns={4}>
            <Card>
              <SkeletonBodyText />
            </Card>
            <Card>
              <SkeletonBodyText />
            </Card>
            <Card>
              <SkeletonBodyText />
            </Card>
            <Card>
              <SkeletonBodyText />
            </Card>
          </InlineGrid>
        </Layout.Section>
        <Layout.Section >
          <Card>
            <TextContainer>
              <SkeletonDisplayText size="small" />
              <InlineStack gap={200}>
                <SkeletonThumbnail size="medium" />
                <SkeletonThumbnail size="medium" />
              </InlineStack>
              <SkeletonBodyText lines={2} />
            </TextContainer>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneHalf">
          <Card>
            <TextContainer>
              <SkeletonDisplayText size="small" />
              <InlineStack gap={200}>
                <SkeletonThumbnail size="medium" />
                <SkeletonThumbnail size="medium" />
                <SkeletonThumbnail size="medium" />
                <SkeletonThumbnail size="medium" />
                <SkeletonThumbnail size="medium" />
                <SkeletonThumbnail size="medium" />
              </InlineStack>
              <SkeletonBodyText lines={2} />
            </TextContainer>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneHalf">
          <Card>
            <TextContainer>
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={6} />
            </TextContainer>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneHalf">
          <Card>
            <TextContainer>
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={6} />

            </TextContainer>
          </Card>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}
/* SKELETON PAGE FUNCTIONAL COMPONENT END */