import moment from "moment";
import { encode } from "./action";

const urlParams = new URLSearchParams(window.location.search);
const SHOP = urlParams.get("shop");

/* EXPORT REMOVE SHOP DOMAIN HANDLER START */
export const removeShopDomain = (url, pathurl) => {
    let newUrl = url || pathurl
    if (url) {
        if (url?.includes(`https://${CUSTOM_DOMAIN}`))
            newUrl = url.replace(`https://${CUSTOM_DOMAIN}`, "");
        else if (url?.includes(CUSTOM_DOMAIN))
            newUrl = url.replace(CUSTOM_DOMAIN, "")
        else if (url?.includes(`https://${SHOP}`))
            newUrl = url.replace(`https://${SHOP}`, "");
        else if (url?.includes(`${SHOP}`))
            newUrl = url.replace(`${SHOP}`, "");
        else {
            if (newUrl?.[0] === '/')
                newUrl = newUrl?.slice(1, newUrl.length);
        }
        if (newUrl?.[0] === '/')
            newUrl = newUrl?.slice(1, newUrl.length);
    }

    else {
        if (newUrl?.[0] === '/')
            newUrl = newUrl?.slice(1, newUrl.length);
    }
    return newUrl
}
/* EXPORT REMOVE SHOP DOMAIN HANDLER END */

/* EXPORT COPY CLICK HANDLER START */
export const handleCopyClick = (value, type, influencerID, key) => {
    const copyText = type === "custom" 
        ? `${CUSTOM_DOMAIN}${value}${influencerID ? `?refby=${encode(influencerID)}` : ''}`
        : `https://${SHOP}/${value}${influencerID ? `?refby=${encode(influencerID)}` : ''}`;
    
    navigator.clipboard.writeText(copyText)
        .then(() => {
            // Show toast notification immediately
            shopify.toast.show("Copied to Clipboard", { duration: 3000 });
        })
        .catch((err) => {
            console.error("Failed to copy: ", err);
            // Show error toast if copy fails
            shopify.toast.show("Failed to copy to clipboard", { 
                duration: 3000, 
                isError: true 
            });
        });
};
/* COPY CLICK HANDLER END */

/* Function for date format */
export function formatDate(dateString) {
    if (!dateString) return '-';

    const date = moment(dateString);
    if (!date.isValid()) return '-';

    return date.format('DD MMMM, YYYY');
}


/* Function for Format Number */
export const formatNumber = num => {
    num = +(`${num}`.replace(/,/g, ''));
    if (isNaN(num)) return '-';
    const units = ["", "K", "M", "B", "T"];
    let i = 0;
    while (num >= 1000 && i < units.length - 1) num /= 1000, i++;
    return num.toFixed(1).replace(/\.0$/, '') + units[i];
};



