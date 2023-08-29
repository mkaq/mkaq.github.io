const corsProxy = 'https://corsproxy.io/?';
const validMediafireShortDL = /^(https?:\/\/)?(www\.)?mediafire\.com\/\?[a-zA-Z0-9]+$/m;
const validMediafireLongDL = /^(https?:\/\/)?(www\.)?mediafire\.com\/(file|view|download)\/[a-zA-Z0-9]+(\/[a-zA-Z0-9_~%\.\-]+)?(\/file)?$/m;
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
        mediafireLink = 'a';
        this.document.getElementById("p1").style = "display: none;";
        this.document.getElementById("p2").style = "display: none;";
        this.document.getElementById("p3").style = "";
        return;
    }

    mediafireLink = validationChecker(mediafireLink);

    if(mediafireLink === 'a'){
        this.document.getElementById("p1").style = "display: none;";
        this.document.getElementById("p2").style = "display: none;";
        this.document.getElementById("p3").style = "";
        return;
    } else {
        attemptDownloadRedirect(mediafireLink);
    }

});

var validationChecker = function(url) {

    if(!url){
        return 'a';
    }

    url = url.replace('http://', 'https://'); 
    if (!checkHTTP.test(url)) {
        if (url.startsWith('//')) url = 'https:' + url;
        else url = 'https://' + url;
    };


    if(url.endsWith("/file")) url = url.substring(0, url.length - 5);


    if(!url.startsWith("https://") && !url.startsWith("www.") && !url.startsWith("mediafire.com/")){
        return 'https://www.mediafire.com/file/' + url;
    }

    if(url.includes("mediafire.com/view/")){
        return url.replace("mediafire.com/view/" , "mediafire.com/file/");
    }

    if(url.includes("mediafire.com/download/")){
        return url.replace("mediafire.com/download/" , "mediafire.com/file/");
    }

    let validatedURL = validMediafireIdentifierDL.test(url) || validMediafireShortDL.test(url) || validMediafireLongDL.test(url);

    if (url && validatedURL) {
        return url;
    } else {
        return 'a';
    }
};

var attemptDownloadRedirect = async function(url) {
    console.log(url);

    // try and get the mediafire page to get actual download link
    try {

        let mediafirePageResponse = await fetch(corsProxy+encodeURIComponent(url));
        
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