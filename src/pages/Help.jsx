/* IMPORT REQUIRED MODULES START */
import React, { useState } from 'react';
import { Collapsible, Card, TextContainer, Text, Layout, BlockStack, Page, Link, Modal, InlineStack, Icon, Button, MediaCard } from '@shopify/polaris';
import { ArrowDiagonalIcon } from '@shopify/polaris-icons';
/* IMPORT REQUIRED MODULES END */

/* HELP FUNCTIONAL COMPONENT START */
function Help() {
    const [active, setActive] = useState(false);
    const handleToggle = () => setActive(!active);

    return (
        <Page title='Help'>
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap={200}>
                            <Text variant='headingMd' as='h2'>What is Shopify URL?</Text>
                            <Text >This URL is the Shopify default URL. This URL is the  original URL of Shopify. For Example: <Link url='https://domain.myshopify.com/pages/about'>https://domain.myshopify.com/pages/about </Link></Text>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Card>
                        <BlockStack gap={200}>
                            <Text variant='headingMd' as='h2'>What is short link?</Text>
                            <Text >Easily track traffic sources, devices, and other metrics with a Short URL. This tool offers a fixed domain for consistent and streamlined link management.
                                For Example: <Link url='https://srtr.me/huyt'>https://srtr.me/huyt</Link>
                            </Text>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Card>
                        <BlockStack gap={200}>
                            <Text variant='headingMd' as='h2'>What is custom URL?</Text>

                            <Text >This custom URL, created with your store , removes Shopify's predefined words like 'products,' 'pages,' 'collection,'
                                For Example: <Link url='https://domain.myshopify.com/about'>https://domain.myshopify.com/about </Link>
                            </Text>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Card>
                        <BlockStack gap={200}>
                            <Text variant='headingMd' as='h2'>How to check tracking?</Text>
                            <Text >To check Tracking navigate to the Dashboard of the APP where you can track the Total clicks, Total sales, Total checkouts, Total add to cart, Device, Platform and Browser</Text>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Card>
                        <BlockStack gap={200}>
                            <Text variant='headingMd' as='h2'>How do I activate the app widget?</Text>
                            <InlineStack gap={200}>
                                <Text >To activate the app, go to the app dashboard and click the "<strong>Activate</strong>" button. 
                                This will take you to the theme settings page. In the "App Embed" section, enable the "ShortLink - URL Shortener & Track" widget and save your changes. 
                                 {/* <Button variant='plain'> <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" x="0" y="0" viewBox="0 0 438.536 438.536" style={{EnableBackground:"new 0 0 512 512"}} xml:space="preserve" class=""><g><path d="M414.41 24.123C398.333 8.042 378.963 0 356.315 0H82.228C59.58 0 40.21 8.042 24.126 24.123 8.045 40.207.003 59.576.003 82.225v274.084c0 22.647 8.042 42.018 24.123 58.102 16.084 16.084 35.454 24.126 58.102 24.126h274.084c22.648 0 42.018-8.042 58.095-24.126 16.084-16.084 24.126-35.454 24.126-58.102V82.225c-.001-22.649-8.043-42.021-24.123-58.102zm-48.961 204.279c0 7.994-3.717 13.606-11.136 16.844-2.471.951-4.859 1.427-7.139 1.427-5.134 0-9.418-1.811-12.847-5.424l-41.11-41.112-152.453 152.462c-3.621 3.614-7.9 5.425-12.85 5.425-4.952 0-9.235-1.811-12.851-5.425l-29.121-29.126c-3.617-3.61-5.426-7.901-5.426-12.847 0-4.944 1.809-9.229 5.426-12.843l152.462-152.464-41.113-41.112c-5.902-5.52-7.233-12.178-3.999-19.985 3.234-7.421 8.852-11.136 16.846-11.136h137.037c4.948 0 9.232 1.81 12.854 5.428 3.613 3.614 5.421 7.898 5.421 12.847v137.041z" fill="#000000" opacity="1" data-original="#000000" class=""></path></g></svg></Button>*/}
                                {/* <Button onClick={()=>setActive(true)} variant='plain'> <Icon source={ArrowDiagonalIcon} /> </Button> */}
                                </Text> 
                            </InlineStack>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Card>
                        <BlockStack gap={200}>
                            <Text variant='headingMd' as='h2'>How do I deactivate the app widget?</Text>
                            <Text >To deactivate the app, go to the theme settings page. In the "App Embed" section, disable the "ShortLink - URL Shortener & Track" widget and save your changes.</Text>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Card>
                        <BlockStack gap={200}>
                            <Text variant='headingMd' as='h2'>How to reach us?</Text>
                            <Text >Please send your query on <Link target='_blank' url='https://support@shopiapps.in'> support@shopiapps.in </Link></Text>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section></Layout.Section>
            </Layout>
            {/* <Modal
                large
                open={active}
                onClose={() => setActive(false)}
                title={""}
            >
                <Modal.Section>
                        <MediaCard portrait>
                            <img
                                alt=""
                                width="100%"
                                height="100%"
                                style={{
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                }}
                                src={""}
                            />
                        </MediaCard>
                </Modal.Section>
            </Modal> */}
        </Page>
    );
}

export default Help;
/* HELP FUNCTIONAL COMPONENT END */