const proxies = [
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
];
const validPattern = /https?:\/\/download[0-9]+\.mediafire\.com\/[^\s"']+/;
const scrambledPattern = /data-scrambled-url="([^"]+)"/;
const paramDL_mediafireWebDelay = 1500;

const p1 = document.getElementById("p1");
const p2 = document.getElementById("p2");
const p3 = document.getElementById("p3");
const p4 = document.getElementById("p4");

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mediafireLink = urlParams.get('a');

    if (!mediafireLink) {
        p1.style.display = "none";
        p2.style.display = "block";
        p3.style.display = "none";
        p4.style.display = "none";
        return;
    }

    const fullMediafireLink = `https://www.mediafire.com/?${mediafireLink}`;
    document.getElementById("mf-link").href = fullMediafireLink;
    handleMediafireRedirect(fullMediafireLink);
});

async function fetchContent(url) {
    for (let buildProxy of proxies) {
        try {
            const response = await fetch(buildProxy(url));
            if (!response.ok) throw new Error("Proxy failed: " + buildProxy(url));
            return await response.text();
        } catch (e) {
            console.warn("Proxy failed, trying next. Error:", e);
        }
    }
    throw new Error("Failed to load MediaFire page. All proxies failed.");
}

async function handleMediafireRedirect(url) {
    try {
        const pageContent = await fetchContent(url);
        let downloadUrl = null;

        // check for direct download link in content
        const directMatch = pageContent.match(validPattern);
        if (directMatch) {
            downloadUrl = directMatch[0];
        }

        // check for decoded link
        if (!downloadUrl) {
            const scrambledMatch = pageContent.match(scrambledPattern);
            if (scrambledMatch) {
                const scrambled = scrambledMatch[1];
                const decodedUrl = atob(scrambled);
                const decodedMatch = decodedUrl.match(validPattern);
                if (decodedMatch) {
                    downloadUrl = decodedMatch[0];
                }
            }
        }

        if (!downloadUrl) {
            throw new Error("No valid download link found.");
        } else {
            setTimeout(() => triggerDownload(downloadUrl), paramDL_mediafireWebDelay);
        }        

    } catch (error) {
        console.error(error);
        p1.style.display = "none";
        p2.style.display = "none";
        p3.style.display = "none";
        p4.style.display = "block";
    }
}

function triggerDownload(filePath) {
    const downloadLinkElement = document.getElementById('dl-link');
    downloadLinkElement.href = filePath;
    downloadLinkElement.click();

    p1.style.display = "none";
    p2.style.display = "none";
    p3.style.display = "block";
    p4.style.display = "none";
}