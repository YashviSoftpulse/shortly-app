(function (urlShortnerWindow, urlShortnerDocument, urlShopify, urlShortnerShopifyAnalytics, urlShortnerProxyPath) {

    'use strict';

    /* CHECK IF SCRIPT IS ALREADY LOADED OR NOT START */
    if (urlShortnerWindow.isUrlShortnerLoaded === true)
        return false;
    var scriptEndTime = new Date().getTime();
    urlShortnerWindow.isUrlShortnerLoaded = true;
    /* CHECK IF SCRIPT IS ALREADY LOADED OR NOT END */

    var logMessages;
    const browserName = getBrowser();
    const platform = getOs();
    const device = getDevice();
    let ip = '';
    let reference = '';
    let qr_code = '';
    let custom_url = '';
    let startTime = '';
    let onetimeAddToCart = false;
    var settings = null;

    var json_settings = urlShortnerWindow.urlConfig.timer;
    if (!empty(json_settings))
        settings = JSON.parse(json_settings);

    delete urlShortnerWindow.urlConfig;

    /* GET BROWSER NAME START */
    function getBrowser() {
        const navigatorAgent = navigator.userAgent;
        if (navigatorAgent.indexOf('OPR') !== -1 || navigatorAgent.indexOf('Opera') !== -1)
            return 'Opera';
        if (navigatorAgent.indexOf('Firefox') !== -1)
            return 'Firefox';
        if (navigatorAgent.indexOf('SamsungBrowser') !== -1)
            return 'SamsungBrowser';
        if (navigatorAgent.indexOf('Edg') !== -1 || navigatorAgent.indexOf('Edge') !== -1)
            return 'Edge';
        if (navigatorAgent.indexOf('MSIE') !== -1 || navigatorAgent.indexOf('Trident') !== -1)
            return 'MicrosoftInternetExplorer';
        if (navigatorAgent.indexOf('UCBrowser') !== -1)
            return 'UCBrowser';
        if (typeof navigator.brave !== 'undefined')
            return 'Brave';
        if (navigatorAgent.indexOf('Chrome') !== -1)
            return 'Chrome';
        if (navigatorAgent.indexOf('Safari') !== -1)
            return 'Safari';
        return 'Unidentified browser';
    }
    /* GET BROWSER NAME END */

    /* GET OS NAME START */
    function getOs() {
        const navigatorAgent = navigator.userAgent;
        if (navigatorAgent.match(/Android/i)) return 'Android';
        if (navigatorAgent.match(/webOS/i)) return 'webOS';
        if (navigatorAgent.match(/iPhone/i)) return 'iPhone';
        if (navigatorAgent.match(/iPad/i)) return 'iPad';
        if (navigatorAgent.match(/iPod/i)) return 'iPod';
        if (navigatorAgent.match(/BlackBerry/i)) return 'BlackBerry';
        if (navigatorAgent.match(/Windows Phone/i)) return 'Windows Phone';
        if (navigatorAgent.match(/Linux/i)) return 'Linux';
        if (navigatorAgent.match('X11')) return 'UNIX';
        if (navigatorAgent.match(/Windows/i)) return 'Windows';
        if (navigatorAgent.match(/Mac/i)) return 'Mac';
        return navigatorAgent;
    }
    /* GET OS NAME END */

    /* GET DEVICE TYPE START */
    function getDevice() {
        const navigatorAgent = navigator.userAgent;
        if (navigatorAgent.match(/mobile/i)) return 'Mobile';
        if (navigatorAgent.match(/iPad|Android|Touch/i)) return 'Tablet';
        return 'Desktop';
    }
    /* GET DEVICE TYPE END */

    /* ENCODE REUEST STRING START */
    function encode(string, increment = 2) {

        if (!string)
            return false;
        string = btoa(string);

        var encodeString = '';
        string.split('').forEach(charcter => encodeString += charcterIncrement(charcter, increment));

        /* CHARCHTER CODE INCREAMENT HANDLER START */
        function charcterIncrement(charcter, increment) {

            if ((/[a-zA-Z]/).test(charcter) !== true)
                return charcter;

            var range = alphaRange();
            if ((/[A-Z]/).test(charcter))
                range = alphaRange(true);

            var charIndex = range.indexOf(charcter);
            for (var i = 1; i <= increment; i++) {
                charIndex = (range[parseInt(charIndex) + 1]) ? parseInt(charIndex) + 1 : 0;
            }

            return range[charIndex];
        };
        /* CHARCHTER CODE INCREAMENT HANDLER END */

        /* ALPHA RANDGE RANGE HANDLER START */
        function alphaRange(capital = false) {
            var rangeArray = [];
            var charcter = 'a';
            if (capital === true)
                var charcter = 'A';
            for (const x of Array(26).keys()) {
                rangeArray.push(String.fromCharCode(charcter.charCodeAt(0) + x));
            }
            return rangeArray;
        };
        /* ALPHA RANDGE RANGE HANDLER END */
        return encodeString;
    };
    /* ENCODE REUEST STRING END */

    /* SET COOKIE START */
    function setCookie(cname, cvalue, expire, expireType = 'day') {

        var currentDate, expires;

        if (expireType == 'hour')
            expire = expire * 60 * 60 * 1000;
        else if (expireType == 'minute')
            expire = expire * 60 * 1000;
        else if (expireType == 'second')
            expire = expire * 1000;
        else
            expire = expire * 24 * 60 * 60 * 1000;

        currentDate = new Date();
        currentDate.setTime(currentDate.getTime() + expire);
        expires = "expires=" + currentDate.toUTCString();
        urlShortnerDocument.cookie = `${cname}=${cvalue};${expires};path=/`;
        return cvalue;
    };
    /* SET COOKIE END */

    /* GET COOKIE START */
    function getCookie(cname) {

        var name, decodedCookie, cookieSplit;

        name = `${cname}=`;
        decodedCookie = urlShortnerDocument.cookie;
        try {
            decodedCookie = decodeURIComponent(decodedCookie);
        } catch (errorMessage) { }

        cookieSplit = decodedCookie.split(';');
        for (var i = 0; i < cookieSplit.length; i++) {

            var cookie;

            cookie = cookieSplit[i];
            while (cookie.charAt(0) == ' ') {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(name) == 0) {
                return cookie.substring(name.length, cookie.length);
            }
        }
        return null;
    };
    /* GET COOKIE END */

    /* DELETE COOKIE START */
    function deleteCookie(cname) {
        urlShortnerDocument.cookie = `${cname}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
    /* DELETE COOKIE END */

    /* GENERATE SCRIPT PROCESS & LOG START */
    function applog(messageType, type = 'info', handler = null) {

        var messageType = messageType.toString();
        if (!(/\s/g.test(messageType)) && !messageType)
            return false;

        if (!logMessages)
            logMessages = {};

        handler = type == 'error' ? type : handler;

        handler = (handler == null) ? 'Process' : handler;
        if (!logMessages[handler])
            logMessages[handler] = [];


        var message = {
            type: type,
            message: messageType,
            time: `${(((new Date).getTime() - scriptEndTime) / 1000).toFixed(2)} Seconds`
        };

        logMessages[handler].push(message);
        return false;
    };
    /* GENERATE SCRIPT PROCESS & LOG END */

    /* CHECK VARIABLE EMPTY OR NOT START */
    function empty(value) {
        try {

            /* CHECK VARIABLE VALID OR NOT START */
            if (typeof value == 'undefined' || value == null || (typeof value == 'string' && value.trim() == ''))
                return true;
            /* CHECK VARIABLE VALID OR NOT END */

            /* CHECK ARRAY/OBJECT/JSON EMPTY/BLANK OR NOT START */
            if (typeof value == 'object') {

                /* CHECK ARRAY EMPTY/BLANK OR NOT START */
                if (Array.isArray(value) === true) {
                    if (value.length === 0)
                        return true;
                }
                /* CHECK ARRAY EMPTY/BLANK OR NOT END */

                /* CHECK OBJECT/JSON EMPTY/BLANK OR NOT START */
                if (Array.isArray(value) === false) {
                    if (Object.keys(value).length === 0 && (value.constructor === Object || /^\[object (HTMLCollection|NodeList|Object)\]$/.test(value)))
                        return true;
                }
                /* CHECK OBJECT/JSON EMPTY/BLANK OR NOT END */
            }
            /* CHECK ARRAY/OBJECT/JSON EMPTY/BLANK OR NOT END */

            /* CHECK BOOLEAN FALSE OR NOT START */
            if (typeof value == 'boolean')
                return (value === false)
            /* CHECK BOOLEAN FALSE OR NOT END */
        } catch (e) {
            return true;
        }

        return false;
    };
    /* CHECK VARIABLE EMPTY OR NOT END */

    /* APP SCRIPT INIT START */
    (function () {
        // var browserCookieEnable = 'Browser cookies enabled';
        // var browserCookieDisable = 'Browser cookies are disabled';

        // /* CHECK COOKIE ENABLE OR NOT START */
        // setCookie('urlShorterCookie', 'usaa', 5, 'minute');
        // let wow = !empty(getCookie('urlShorterCookie'));
        // if (wow == true)
        //     applog(browserCookieEnable);
        // else
        //     applog(browserCookieDisable, 'warn');
        // /* CHECK COOKIE ENABLE OR NOT END */

        // Store the initial time when the script starts executing
        startTime = performance.now();

        let cookieData = getCookie('click');
        // let cookieData = null;
        let currentUrl = new URL(urlShortnerWindow.location.href);
        qr_code = currentUrl.searchParams.get('qr');
        custom_url = currentUrl.searchParams.get('custom');

        // console.log(settings.expireTime);
        // console.log(settings.expireType);

        if (empty(cookieData)) {
            console.log("newly created_click");
            urlShortnerWindow.addEventListener('load', handlePageLoad);
        } else {
            console.log("old one created_click");
            urlShortnerWindow.addEventListener('load', () => {
                if (!empty(getCookie('shorterUrl')))
                    deleteCookie('shorterUrl');

                let data = [];
                let variantId = ShopifyAnalytics.meta.page.resourceId;
                data.push(variantId);
                data.push(!empty(currentUrl.searchParams.get('REF')) ? currentUrl.searchParams.get('REF') : (!empty(qr_code) ? 'qr_code' : (!empty(custom_url) ? 'custom_url' : 'short-url')));
                setCookie('shorterUrl', JSON.stringify(data), 24, 'hour');

                // console.log("old click => shorterUrl new =>" + getCookie('shorterUrl'));

                currentUrl.searchParams.delete('REF');
                currentUrl.searchParams.delete('qr');
                currentUrl.searchParams.delete('custom');
                urlShortnerWindow.history.replaceState({}, urlShortnerDocument.title, currentUrl.toString());
                register_checkout();
            });
        }

    }());
    /* APP SCRIPT INIT END */

    /* GET IP START */
    async function fetchIp() {
        try {
            const response = await urlShortnerWindow.fetch('https://api.ipify.org?format=json');
            const data = await response.text();
            const jsonData = JSON.parse(data);
            ip = jsonData.ip;
        } catch (error) {
            console.error('Error fetching IP:', error);
        }
    }
    /* GET IP END */

    /* REGISTERING THE CLICK START */
    async function handlePageLoad() {

        let currentUrl = new URL(urlShortnerWindow.location.href);
        let refData = currentUrl.searchParams.get('REF');

        let page = currentUrl.pathname;
        let shop = Shopify.shop;
        let pageType = ShopifyAnalytics.meta.page.pageType;

        if (!empty(refData) || !empty(qr_code) || !empty(custom_url)) {
            reference = empty(refData) ? page : ("/" + refData);

            /* UNCOMMENT THE BELOW TO CLEAN THE URL */
            currentUrl.searchParams.delete('REF');
            currentUrl.searchParams.delete('qr');
            currentUrl.searchParams.delete('custom');
            urlShortnerWindow.history.replaceState({}, urlShortnerDocument.title, currentUrl.toString());
            await fetchIp();

            let formdata = new FormData();
            formdata.append("shop", shop);
            formdata.append("browserName", browserName);
            formdata.append("platform", platform);
            formdata.append("device", device);
            formdata.append("ip", encode(JSON.stringify(ip)));
            formdata.append("page", page);
            formdata.append("reference", reference);
            formdata.append("pageType", pageType);
            formdata.append("type", 'clicks');
            formdata.append("from_where", !empty(qr_code) ? 'qr_code' : (!empty(custom_url) ? 'custom_url' : 'short-url'));

            // console.log( !empty(qr_code) ? 'qr_code': (!empty(custom_url) ? 'custom_url' : 'short-url'));
            let requestOptions = {
                method: "POST",
                body: formdata,
                redirect: "follow"
            };

            try {
                let response = await urlShortnerWindow.fetch(`https://${shop}${urlShortnerProxyPath}/create_click`, requestOptions);
                let result = await response.json();
                setCookie('click', "Done", !empty(settings) ? settings.expireTime : 5, !empty(settings) ? settings.expireType : 'second');
                // setCookie('click', "Done", 5, 'second');

                // Setting the cookie
                if (result.status == 'success') {
                    if (!empty(getCookie('shorterUrl')))
                        deleteCookie('shorterUrl');

                    let data = [];
                    let variantId = ShopifyAnalytics.meta.page.resourceId;

                    if (empty(variantId)) {
                        // console.log("No varient id found");
                        return false;
                    }

                    data.push(variantId);
                    data.push(!empty(refData) ? refData : (!empty(qr_code) ? 'qr_code' : (!empty(custom_url) ? 'custom_url' : 'short-url')));

                    setCookie('shorterUrl', JSON.stringify(data), 24, 'hour')
                    register_checkout();
                }
            } catch (error) {
                console.error('Error sending form data:', error);
            }
        }
    }
    /* REGISTERING THE CLICK END */

    /* REGISTERING THE ADD TO CART START */
    async function addToCart(refData) {
        let currentUrl = new URL(urlShortnerWindow.location.href);
        let page = currentUrl.pathname;
        // console.log("refer Data = " + refData);
        // // console.log("page = " + page);
        // console.log('from add to cart');

        let shop = Shopify.shop;
        let pageType = ShopifyAnalytics.meta.page.pageType;

        // reference = !empty(refData) && (refData == 'qr_code' || refData == 'custom_url') ? page : ("/" + refData);
        reference = page;
        await fetchIp();

        let formdata = new FormData();
        formdata.append("shop", shop);
        formdata.append("browserName", browserName);
        formdata.append("platform", platform);
        formdata.append("device", device);
        formdata.append("ip", encode(JSON.stringify(ip)));
        formdata.append("page", page);
        formdata.append("reference", reference);
        formdata.append("pageType", pageType);
        formdata.append("type", 'add_to_cart');
        formdata.append("from_where", refData == 'qr_code' ? 'qr_code' : (refData == 'custom_url' ? 'custom_url' : 'short-url'));

        let requestOptions = {
            method: "POST",
            body: formdata,
            redirect: "follow"
        };

        try {
            /* STORING THE ADD TO CART EVENT START */
            const response = await urlShortnerWindow.fetch(`https://${shop}${urlShortnerProxyPath}/create_click`, requestOptions);
            const result = await response.json();
            // console.log(result);
            /* STORING THE ADD TO CART EVENT END */
        } catch (error) {
            console.error('Error sending form data:', error);
        }
    }
    /* REGISTERING THE ADD TO CART END */

    /* PROCESS THE ADD_TO_CART AND SAVING CHECKOUT IN DATABASE START */
    function register_checkout() {
        let cart = getCookie('shorterUrl');
        // console.log("from Cart");
        // console.log(cart);

        if (cart) {
            let order_summary = cart.replace(/[\[\]"]+/g, '').split(',');
            let vid = order_summary[0];
            // console.log("order_summary => " + order_summary);

            // console.log("Varient ID:- ", vid);
            let originalFetch = urlShortnerWindow.fetch;

            // OVERRIDIING THE ORIGINAL GLOBAL FETCH CALL
            urlShortnerWindow.fetch = async function (url, options) {
                if (url.includes('cart/add') && (options && options.body)) {
                    // CHECKING IF IT IS FORMDATA
                    if (options.body instanceof FormData) {

                        const formData = options.body;
                        for (let [key, value] of formData.entries()) {
                            /* IF COOKIE OF THE REFERENCE AND ADD TO CART PRODUCT MATCHES REGISTER THE EVENT ATC */
                            if (key == 'product-id' && value == vid) {
                                await addToCart(order_summary[1]);
                                break;
                            }
                        }
                    }
                }

                // Proceed with the original fetch
                const response = await originalFetch(url, options);

                // Check if the URL contains 'cart/add' and the response is successful and insert the add to cart
                if (url.includes('cart/add') && !onetimeAddToCart) {
                    // if (url.includes('cart/add')) {

                    // Check if the response status is successful
                    if (response.ok) {
                        // Set the flag to true to prevent running this code again
                        onetimeAddToCart = true;

                        // Run the code to handle cart token
                        const cartResponse = await originalFetch('/cart.js');
                        const cartData = await cartResponse.json();
                        const cartToken = cartData.token.split('?');
                        // console.log("Cart Token:", cartToken[0]);

                        // Calculate the time taken to initialize the cart
                        const cartInitializationTime = performance.now() - startTime;
                        // console.log(`Cart Initialization Time: ${cartInitializationTime.toFixed(2)} ms`);

                        // Prepare new FormData for the second request
                        let trackFormData = new FormData();
                        trackFormData.append("shop", Shopify.shop);
                        trackFormData.append("reference", reference);
                        trackFormData.append("from_where", !empty(qr_code) ? 'qr_code' : (!empty(custom_url) ? 'custom_url' : 'short-url'));
                        trackFormData.append("cartToken", cartToken[0]);

                        let trackRequestOptions = {
                            method: "POST",
                            body: trackFormData
                        };

                        // Await the second fetch call
                        let response2 = await originalFetch(`https://${Shopify.shop}${urlShortnerProxyPath}/track_store`, trackRequestOptions);
                        deleteCookie('shorterUrl');
                        deleteCookie('click');
                        // console.log("Done tracking now deleteing. All ")
                    }
                }
                return response;
            };
        }
    }
    /* PROCESS THE ADD_TO_CART AND SAVING CHECKOUT IN DATABASE END */

}(window, document, window.Shopify, window.ShopifyAnalytics, '/apps/url-shortner'))