const corsProxy = 'https://corsproxy.io/?';
const validMediafireIdentifierDL = /^[a-zA-Z0-9]+$/m;
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

    if(validationChecker(mediafireLink)){
        this.document.getElementById("p1").style("display: none;");
        this.document.getElementById("p2").style("");

        attemptDownloadRedirect(mediafireLink);
        
    } else {
        this.document.getElementById("p1").style("display: none;");
        this.document.getElementById("p3").style("");
    }

});

var validationChecker = function(url) {
    let validatedURL = validMediafireIdentifierDL.test(url) || validMediafireShortDL.test(url) || validMediafireLongDL.test(url);
    if (url && validatedURL) {
        return true;
    } else {
        return false;
    }
};

// normal way to download file
var downloadFile = function(filePath) {
    let link=document.createElement('a');
    link.href = filePath;
    link.download = filePath.substr(filePath.lastIndexOf('/') + 1);
    link.click();
};
  
  // alternative way when using parameters, to know when the download starts
  var downloadFileStarting = function() {
    // will try to redirect to previous page or new tab when download starts after a tiny delay
    setTimeout(function() {

      if (window.history.length >= 2) window.history.back();
      else window.location.href = 'about:blank';

    }, paramDL_loadDelay);
};


var attemptDownloadRedirect = async function(url) {
    // modify the link to work with proxy
    url = url.replace('http://', 'https://'); // not required, but makes them secure
    // if it's just the download identifier, add on mediafire pre-link
    if (validMediafireIdentifierDL.test(url)) url = 'https://mediafire.com/?' + url;
    // if the link doesn't have http(s), it needs to be appended
    if (!checkHTTP.test(url)) {
      if (url.startsWith('//')) url = 'https:' + url;
      else url = 'https://' + url;
    };
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
  
      // all else should produce an error
      console.error(`No valid download button at "${url}".`);
      if (invalidPageP.classList.contains('hide')) invalidPageP.classList.remove('hide');
      if (!containerNewUrl.classList.contains('hide')) containerNewUrl.classList.add('hide');
      spanMediafireNewUrl.innerText = '';
  
      return false;
    } catch (err) {
      // There was an error
      console.warn('Something went wrong.', err);
      console.error(`No valid download button at "${url}".`);
      if (invalidPageP.classList.contains('hide')) invalidPageP.classList.remove('hide');
      if (!containerNewUrl.classList.contains('hide')) containerNewUrl.classList.add('hide');
      spanMediafireNewUrl.innerText = '';
  
      return false;
    }
};

var downloadFile = function(filePath) {
    let downloadLinkElement = document.getElementById('dl-link');
    downloadLinkElement.href = filePath;
    downloadLinkElement.click();
  };