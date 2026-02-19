const DEFAULT_NOTION_KEY = 'YOUR_NOTION_API_KEY';
const DEFAULT_DATABASE_ID = 'YOUR_DATABASE_ID';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'saveToNotion') {
        handleSaveToNotion(request.data)
            .then(response => sendResponse(response))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Will respond asynchronously
    }
});

// Helper to calculate date from relative strings or parse absolute strings
function parseDate(text) {
    if (!text) return new Date().toISOString().split('T')[0]; // Default to today

    const today = new Date();

    // Handle "2 days ago", "1 week ago", "방금 전"
    if (text.includes('ago') || text.includes('전')) {
        const num = parseInt(text.match(/\d+/)?.[0] || '0');
        if (text.includes('year') || text.includes('년')) today.setFullYear(today.getFullYear() - num);
        else if (text.includes('month') || text.includes('개월')) today.setMonth(today.getMonth() - num);
        else if (text.includes('week') || text.includes('주')) today.setDate(today.getDate() - (num * 7));
        else if (text.includes('day') || text.includes('일')) today.setDate(today.getDate() - num);
        // Ignore hours/minutes for simplicity, stick to today
        return today.toISOString().split('T')[0];
    }

    // Handle "2023. 5. 20." (Korean style) or "2023-05-20"
    let dateStr = text.replace(/[^0-9.\- ]/g, '').trim();
    const parts = dateStr.split(/[\.\- ]+/).filter(Boolean);

    if (parts.length === 3) {
        const y = parts[0];
        const m = parts[1].padStart(2, '0');
        const d = parts[2].padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    const parsed = Date.parse(text);
    if (!isNaN(parsed)) {
        return new Date(parsed).toISOString().split('T')[0];
    }

    return new Date().toISOString().split('T')[0];
}

async function handleSaveToNotion(videoData) {
    try {
        const { notionKey, databaseId } = await getNotionCredentials();

        // Parse Types
        const uploadDateStr = parseDate(videoData.uploadDate);

        // Construct Notion Page Properties
        // REMOVED: '구독자 수', '조회수' as requested
        const properties = {
            '제목': {
                title: [
                    {
                        text: {
                            content: videoData.title
                        }
                    }
                ]
            },
            '링크': {
                url: videoData.url
            },
            '채널명': {
                rich_text: [
                    {
                        text: {
                            content: videoData.channelName
                        }
                    }
                ]
            },
            '설명': {
                rich_text: [
                    {
                        text: {
                            content: (videoData.description || "").substring(0, 2000) // Safety check and limit
                        }
                    }
                ]
            },
            '업로드 일자': {
                date: {
                    start: uploadDateStr
                }
            }
        };

        const response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${notionKey}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify({
                parent: { database_id: databaseId },
                properties: properties
            })
        });

        const data = await response.json();

        if (!response.ok) {
            let msg = data.message || 'Failed to save to Notion';
            if (data.code === 'validation_error') {
                msg = `Validation Error: ${data.message}`;
            }
            throw new Error(msg);
        }

        return { success: true, url: data.url };

    } catch (error) {
        console.error('Error saving to Notion:', error);
        return { success: false, error: error.message };
    }
}

async function getNotionCredentials() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(
            { notionKey: DEFAULT_NOTION_KEY, databaseId: DEFAULT_DATABASE_ID },
            (items) => {
                resolve(items);
            }
        );
    });
}
