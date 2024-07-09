const corsProxy = 'https://corsproxy.io/?';
const validMediafirePreDL = /(?<=['\"])(https?:)?(\/\/)?(www\.)?mediafire\.com\/(file|view|download)\/[^'\"\?]+\?dkey\=[^'\"]+(?=['\"])/;
const validDynamicDL = /(?<=['\"])https?:\/\/download[0-9]+\.mediafire\.com\/[^'\"]+(?=['\"])/;
const checkHTTP = /^https?:\/\//m;
const paramDL_initialDelay = 50; // ms
const paramDL_loadDelay = 750; // ms
const paramDL_mediafireWebDelay = 1500; // ms; Mediafire's specified delay is 1000ms to redirect to parametered download URLs, and needs another 500ms to time things properly


window.addEventListener('load', function() {
    // Get the mediafire link parameter from the URL
    var urlParams = new URLSearchParams(window.location.search);
    var mediafireLink = urlParams.get('a');

    if (mediafireLink === null || mediafireLink === undefined) {

        this.document.getElementById("p1").style = "display: none;";
        this.document.getElementById("p2").style = "display: none;";
        this.document.getElementById("p3").style = "";
        return;
    }

    mediafireLink = 'https://www.mediafire.com/?' + mediafireLink;
    attemptDownloadRedirect(mediafireLink);
    
});

var attemptDownloadRedirect = async function(url) {
    // try and get the mediafire page to get actual download link
    try {

        let mediafirePageResponse = await fetch(corsProxy+encodeURIComponent(url), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        // make sure the response was ok
        if (await mediafirePageResponse.ok) {
            let data = await mediafirePageResponse.text();
    
            // if we received a page
            if (data) {
                // check if download parameter link was instead used on website
                let dlPreUrls = data.match(validMediafirePreDL);
                if (dlPreUrls) {
                    let dlPreUrl = dlPreUrls[0];
                    return setTimeout(function() {
                        return attemptDownloadRedirect(dlPreUrl);
                    }, paramDL_mediafireWebDelay); // delay is required, or else Mediafire's Cloudflare protection will not connect
                }
        
                // we try to find URL by regex matching
                let dlUrls = data.match(validDynamicDL);
                if (dlUrls) {
                    let dlUrl = dlUrls[0];
                    downloadFile(dlUrl);
                    return dlUrl;
                }
            }
        }
        this.document.getElementById("p1").style = "display: none;";
        this.document.getElementById("p2").style = "display: none;";
        this.document.getElementById("p3").style = "";
        return false;

    } catch (err) {
        this.document.getElementById("p1").style = "display: none;";
        this.document.getElementById("p2").style = "display: none;";
        this.document.getElementById("p3").style = "";
        return false;
    }
};

var downloadFile = function(filePath) {
    let downloadLinkElement = document.getElementById('dl-link');
    downloadLinkElement.href = filePath;
    downloadLinkElement.click();
    this.document.getElementById("p1").style = "display: none;";
    this.document.getElementById("p2").style = "";
    this.document.getElementById("p3").style = "display: none;";
};
