
export const fetchData = function (url, data, dataType, queryParams) {
    return new Promise((resolve, reject) => {
        const method = 'post';
        data = (!data) ? {} : data;
        dataType = (!dataType) ? 'json' : dataType;
        if (!url) {
            return resolve({
                status: false,
                message: `Request url is required or invalid! ${url}`
            });
        }
        /* API REQUEST URL START */
        /*if (apiPath.indexOf(process.env.APP_PROXY_PATH) === -1 && apiPath[0] !== '/')
            apiPath = `/${apiPath}`;
        const url = (apiPath.indexOf(process.env.APP_PROXY_PATH) !== -1) ? apiPath : `${process.env.API_URL}${apiPath}`;*/
        /* API REQUEST URL END */

        var headerContentType = 'text/plain;charset=UTF-8';
        if (dataType === 'json' || dataType === 'text')
            headerContentType = 'application/json';

        // Object.keys(data).forEach(key => {
        //     data.append(key, data[key]);
        // });
        // data.append('shop', SHOP)

        var isFormData = data instanceof FormData;

        if (isFormData !== true) {
            data = JSON.stringify(data);
        }

        const myheaders = new Headers();
        myheaders.append('Content-Type', headerContentType);

        const fetchBody = {
            method: method,
            body: data
        };

        if (isFormData !== true)
            fetchBody.headers = myheaders;
        fetch(url, fetchBody).then(function (response) {
            return response.text();
        }).then(function (response) {

            if (dataType == 'json') {
                try {
                    response = JSON.parse(response);
                } catch (errorMessage) {

                    errorMessage = (errorMessage.stack) ? errorMessage.stack : errorMessage;
                    errorMessage += `\n Request URL at ${url}`;

                    return resolve({
                        status: false,
                        message: "Something went wrong. Please try after sometime"
                    });
                }
            }
            return resolve(response);
        }, function (errorMessage) {

            errorMessage = (errorMessage.stack) ? errorMessage.stack : errorMessage;
            errorMessage += `\n Request URL at ${url}`;

            return resolve({
                status: false,
                message: "Something went wrong. Please try after sometime"
            });
        });
    });
};

const isset = function (accessor, compare = null) {
    try {

        const isExists = !['[object Undefined]'].includes(Object.prototype.toString.call(accessor()));
        if (['[object Undefined]', '[object Null]'].includes(Object.prototype.toString.call(compare)) === false)
            return (accessor() === compare);
        return isExists;
    } catch (ex) { }
    return false;
};

const getTypeOf = function (value) {
    const valueName = Object.prototype.toString.call(value);
    const valueNameExtract = /\b(object) (\w+)\b/.exec(valueName);
    if (isset(() => valueNameExtract[2]))
        return valueNameExtract[2].toLowerCase();
    return 'undefined';
};

/* ENCODE REQUEST STRING START */
export const encode = function (string, increment = 2) {

    string = JSON.stringify({
        data: string,
        type: getTypeOf(string)
    });

    if (!string)
        return false;
    string = btoa(unescape(encodeURIComponent(string)));

    var encodeString = '';
    string.split('').forEach(function (charcter) {
        encodeString += charcterIncrement(charcter, increment);
    });

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
/* ENCODE REQUEST STRING END */

/* DECODE REQUEST STRING START */
export const decode = function (string, decrement = 2) {

    if (!string)
        return false;

    var decodeString = '';
    string.split('').forEach(function (charcter) {
        decodeString += charcterDecrement(charcter, decrement);
    });
    decodeString = decodeURIComponent(escape(atob(decodeString)));

    decodeString = JSON.parse(decodeString);

    /* CHARCHTER CODE INCREAMENT HANDLER START */
    function charcterDecrement(charcter, increment) {

        if ((/[a-zA-Z]/).test(charcter) !== true)
            return charcter;

        var range = alphaRange();
        if ((/[A-Z]/).test(charcter))
            range = alphaRange(true);

        var charIndex = range.indexOf(charcter);
        for (var i = 1; i <= increment; i++) {
            charIndex = (range[parseInt(charIndex) - 1]) ? parseInt(charIndex) - 1 : 25;
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
    return decodeString.data;
};
/* DECODE REQUEST STRING END */

/* GET API URL HANDLER START */
export const getApiURL = (path) => {

    const urlParams = new URLSearchParams(window.location.search);
    const params = {};
    for (const [key, value] of urlParams.entries()) {
        params[key] = value;
    }

    const url = `${API_URL}${path}?${new URLSearchParams(params)}`;

    return url;
}
/* GET API URL HANDLER END */

/* CHECK OBJECT PROPERTY HANDLER START */
export const hasProperty = (object, key, compare) => {
    if (typeof key != 'string')
        return false;

    var value = key.split('.').reduce(function (o, x) {
        return (typeof o === 'undefined' || o === null) ? undefined : o[x];
    }, object);

    if (typeof compare != 'undefined')
        return (typeof value != 'undefined' && value === compare);
    return (typeof value != 'undefined');
};
/* CHECK OBJECT PROPERTY HANDLER END */



// For Live
// export const APP_URL ='https://shopiapps.in/testapp/shortner_url_dev'
// export const DOMAIN = 'https://sp-tanvi.myshopify.com/'
// export const SHOPIFY_API_VERSION = '2023-07'
// export const ACCCESS_TOKEN = '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'
// export const SHOP = 'url-shortner-dev.myshopify.com'


// For DEvlopment
// export const APP_URL ='https://shortlydev.srtr.me/api/'
// export const DOMAIN = 'https://adspdev.myshopify.com/'
// export const SHOPIFY_API_VERSION = '2024-04'
// export const ACCCESS_TOKEN = 'shpua_a7d53706dbc22f6a730f1d47ec7833a5'
// export const SHOP = 'adspdev.myshopify.com'