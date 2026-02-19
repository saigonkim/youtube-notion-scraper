console.log("YouTube Notion Scraper Loaded");

function getVideoData() {
    const title = document.querySelector('h1.ytd-watch-metadata')?.innerText || document.title;
    const url = window.location.href;
    const channelName = document.querySelector('ytd-channel-name a')?.innerText || "Unknown Channel";

    // Upload Date Logic
    let uploadDate = "";

    // 1. Try finding date in the description info row (often "May 20, 2023")
    const infoSpans = document.querySelectorAll('#info-container span');
    infoSpans.forEach(span => {
        const text = span.innerText;
        if (text.match(/\d{4}\.\s\d{1,2}\.\s\d{1,2}/) || text.includes('ago') || text.includes('전') || text.match(/[A-Z][a-z]+ \d{1,2}, \d{4}/)) {
            uploadDate = text;
        }
    });

    // 2. Fallback: Detailed Description Header
    if (!uploadDate) {
        const descriptionDate = document.querySelector('#info-strings yt-formatted-string')?.innerText;
        if (descriptionDate) uploadDate = descriptionDate;
    }

    // Description Logic - Enhanced Fallbacks
    // #description-inline-expander is the container. 
    // Sometimes the text is inside #attributed-description-content
    let description = "";

    // Try the modern inline expander text
    const expanderText = document.querySelector('#description-inline-expander .ytd-text-inline-expander')?.innerText;

    // Try the full description container (might include date/views, but better than nothing)
    const fullDescriptionBox = document.querySelector('#description-inner')?.innerText;

    // Try meta tag as last resort (often truncated but reliable)
    const metaDescription = document.querySelector('meta[name="description"]')?.content;

    if (expanderText) {
        description = expanderText;
    } else if (fullDescriptionBox) {
        // Clean up "Show less" buttons etc if possible, but keep it simple
        description = fullDescriptionBox.replace(/Show more|Show less/g, '').trim();
    } else if (metaDescription) {
        description = metaDescription;
    }

    return {
        title: title.trim(),
        url,
        channelName: channelName.trim(),
        uploadDate: uploadDate.trim(),
        description: description.trim()
    };
}

function handleLikeClick() {
    console.log("Like button clicked! Starting scrape...");

    setTimeout(() => {
        const videoData = getVideoData();
        console.log("Scraped Data:", videoData);

        chrome.runtime.sendMessage({
            action: 'saveToNotion',
            data: videoData
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Runtime Error:", chrome.runtime.lastError.message);
                return;
            }

            if (response && response.success) {
                console.log("Successfully saved to Notion!");
                alert("Video saved to Notion! 🎉");
            } else {
                console.error("Failed to save to Notion:", response?.error);
                alert("Failed to save to Notion: " + (response?.error || "Unknown error"));
            }
        });
    }, 500);
}

// Event Delegation for "Like" button
document.addEventListener('click', (e) => {
    // Find the closest button element
    const button = e.target.closest('button');
    if (!button) return;

    // Check if it's the valid Like button (aria-label checks)
    const ariaLabel = button.getAttribute('aria-label') || "";
    const isLikeButton = (ariaLabel.toLowerCase().includes('like') || ariaLabel.includes('좋아요')) &&
        (ariaLabel.toLowerCase().includes('video') || ariaLabel.includes('동영상'));

    const isMainVideoAction = button.closest('ytd-menu-renderer') || button.closest('segmented-like-dislike-button-view-model');

    if (isLikeButton && isMainVideoAction) {
        handleLikeClick();
    }
}, true);
