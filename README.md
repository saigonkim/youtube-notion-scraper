# YouTube to Notion Scraper

A lightweight Chrome Extension that automatically scrapes YouTube video metadata (title, channel, URL, upload date, description, etc.) and saves it directly to your Notion database when you click the "Like" button on a video.

## Features

- **Automatic Scraping**: Triggered seamlessly when you "Like" a YouTube video.
- **Detailed Metadata**: Captures essential video information:
  - Video Title
  - Channel Name
  - Video URL
  - Upload Date (Parsed from relative dates like "2 days ago")
  - Video Description (Truncated to prevent errors)
- **Customizable**: Set your own Notion API Key and Database ID via the Options page.
- **Secure**: Sensitive keys are stored in your localized Chrome storage, not hardcoded in the source.

## Prerequisites

Before installing, you need:
1.  **Notion Integration Token**: Create an integration at [Notion My Integrations](https://www.notion.so/my-integrations) and get the `Internal Integration Token`.
2.  **Notion Database ID**: Create a database in Notion and share it with your integration.
    - The database should have the following properties:
      - `Name` (Title): 제목
      - `URL`: 링크
      - `Rich Text`: 채널명, 설명
      - `Date`: 업로드 일자
    - Copy the ID from the database URL.

## Installation

1.  **Clone this repository**:
    ```bash
    git clone https://github.com/saigonkim/youtube-notion-scraper.git
    ```
2.  Open Chrome and navigate to `chrome://extensions`.
3.  Enable **Developer mode** in the top right corner.
4.  Click **Load unpacked** (압축해제된 확장 프로그램을 로드합니다).
5.  Select the `youtube-notion-scraper` directory from the cloned repository.

## Configuration

1.  Click the extension icon in Chrome or go to the extension details.
2.  Open **Extension Options**.
3.  Enter your **Notion API Key** and **Database ID**.
4.  Click **Save**.

## Usage

1.  Go to any YouTube video page.
2.  Click the **Like (Thumbs Up)** button.
3.  The extension will capture the video details and send them to your configured Notion database.
4.  A success (or error) message will be logged in the console (or visual feedback if implemented).

## Tech Stack

- **Frontend**: HTML, Pure CSS, Vanilla JavaScript
- **Chrome API**: `chrome.scripting`, `chrome.storage`, `chrome.runtime`
- **Backend Service**: Notion API (Direct communication from Background Service Worker)

## License

This project is licensed under the MIT License.
