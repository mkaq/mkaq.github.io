var proxy = 'https://corsproxy.io/?';
const fallback = "https://api.allorigins.win/raw?url="
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

    const useFallback = urlParams.get('f');
    if(useFallback && useFallback === "true"){
        proxy = fallback;
    }

    const fullMediafireLink = `https://www.mediafire.com/?${mediafireLink}`;
    document.getElementById("mf-link").href = fullMediafireLink;
    handleMediafireRedirect(fullMediafireLink);
});

async function handleMediafireRedirect(url) {
    try {
        const response = await fetch(proxy + encodeURIComponent(url));
        if (!response.ok) throw new Error("Failed to fetch MediaFire page.");

        const pageContent = await response.text();
        let downloadUrl = null;

        // check for direct download link in content
        const directMatch = pageContent.match(validDynamicDL);
        if (directMatch) {
            downloadUrl = directMatch[0];
        }

        // check for decoded link
        if (!downloadUrl) {
            const scrambledMatch = pageContent.match(scrambledPattern);
            if (scrambledMatch) {
                const scrambled = scrambledMatch[1];
                const decodedUrl = atob(scrambled);
                const decodedMatch = decodedUrl.match(validDynamicDL);
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