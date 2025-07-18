import React, { useEffect, useState } from "react";
import { NavMenu } from "@shopify/app-bridge-react";
import { PolarisProvider } from "./components";
import Routes from "./Routes";
import { useLocation } from "react-router";
import { Box, Card, Page } from "@shopify/polaris";
import { fetchData, getApiURL } from "./action";
import { Link } from "react-router-dom";
// import WhatsappIcon from '/assets/icons/WhatsappIcon'

function App() {
  const location = useLocation();
  const currentPath = location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const SHOP = urlParams.get("shop");
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  // console.log('pages', pages)
  const WhatsappLink = `https://api.whatsapp.com/send?phone=+919099272837&text=Hi, I need help for Shortly plugin configuration.%0a%0aShop: ${SHOP}`;
  const [liveChatStatus, setLiveChatStatus] = useState(null);
  const getLiveChatData = async () => {
    const response = await fetchData(getApiURL("live-chat"));
    setLiveChatStatus(response?.status);
  };
  useEffect(() => {
    getLiveChatData();
  }, []);

  return (
    <>
      <PolarisProvider>
        <>
          <NavMenu>
            <Link to={`/dashboard${window.location.search}`} rel="home">
              Dashboard
            </Link>
            <Link to={`/listing${window.location.search}`}>Generate Links</Link>
            <Link to={`/influencers${window.location.search}`}>
              Influencers
            </Link>
            <Link to={`/orders${window.location.search}`}>Orders</Link>
            <Link to={`/settings${window.location.search}`}>Settings</Link>
            <Link to={`/plans${window.location.search}`}>Plans</Link>

            <Link to="/help">Help</Link>
          </NavMenu>
        </>

        <Routes pages={pages} />
        {liveChatStatus === true && (
          <a href={WhatsappLink} className="app-chat" target="_blank">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              width="40"
              height="40"
              viewBox="0 0 512 512"
              style={{ enableBackground: "new 0 0 512 512" }}
            >
              <g>
                <path
                  d="M256.064 0h-.128C114.784 0 0 114.816 0 256c0 56 18.048 107.904 48.736 150.048l-31.904 95.104 98.4-31.456C155.712 496.512 204 512 256.064 512 397.216 512 512 397.152 512 256S397.216 0 256.064 0z"
                  fill="#4caf50"
                />
                <path
                  d="M405.024 361.504c-6.176 17.44-30.688 31.904-50.24 36.128-13.376 2.848-30.848 5.12-89.664-19.264-75.232-31.168-123.68-107.616-127.456-112.576-3.616-4.96-30.4-40.48-30.4-77.216s18.656-54.624 26.176-62.304c6.176-6.304 16.384-9.184 26.176-9.184 3.168 0 6.016.16 8.576.288 7.52.32 11.296.768 16.256 12.64 6.176 14.88 21.216 51.616 23.008 55.392 1.824 3.776 3.648 8.896 1.088 13.856-2.4 5.12-4.512 7.392-8.288 11.744-3.776 4.352-7.36 7.68-11.136 12.352-3.456 4.064-7.36 8.416-3.008 15.936 4.352 7.36 19.392 31.904 41.536 51.616 28.576 25.44 51.744 33.568 60.032 37.024 6.176 2.56 13.536 1.952 18.048-2.848 5.728-6.176 12.8-16.416 20-26.496 5.12-7.232 11.584-8.128 18.368-5.568 6.912 2.4 43.488 20.48 51.008 24.224 7.52 3.776 12.48 5.568 14.304 8.736 1.792 3.168 1.792 18.048-4.384 35.52z"
                  fill="#fafafa"
                />
              </g>
            </svg>
          </a>
        )}
        {liveChatStatus === false && (
          <Page>
            <div
              className="Polaris-ShadowBevel"
              style={{
                "--pc-shadow-bevel-z-index": 32,
                "--pc-shadow-bevel-content-xs": "",
                "--pc-shadow-bevel-box-shadow-xs": "var(--p-shadow-100)",
                "--pc-shadow-bevel-border-radius-xs":
                  "var(--p-border-radius-300)",
              }}
            >
              <div
                className="Polaris-Box"
                style={{
                  "--pc-box-background": "#FFFFD6",
                  "--pc-box-min-height": "100%",
                  "--pc-box-overflow-x": "clip",
                  "--pc-box-overflow-y": "clip",
                  "--pc-box-padding-block-start-xs": "var(--p-space-400)",
                  "--pc-box-padding-block-end-xs": "var(--p-space-400)",
                  "--pc-box-padding-inline-start-xs": "var(--p-space-400)",
                  "--pc-box-padding-inline-end-xs": "var(--p-space-400)",
                }}
              >
                We’re sorry, but our live chat is currently unavailable. Please
                feel free to reach out to us via email at{" "}
                <Link
                  url={`mailto: support@shopiapps.in?subject=I need help for Shortly plugin configuration. shop- ${SHOP}`}
                >
                  support@shopiapps.in
                </Link>
                , and our team will get back to you as soon as possible. Thank
                you for your understanding!
              </div>
            </div>
          </Page>
        )}
      </PolarisProvider>
    </>
  );
}

export default App;
