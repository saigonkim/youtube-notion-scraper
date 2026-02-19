// Default values provided by user
const DEFAULT_NOTION_KEY = 'YOUR_NOTION_API_KEY';
const DEFAULT_DATABASE_ID = 'YOUR_DATABASE_ID';

const saveOptions = () => {
  const notionKey = document.getElementById('notionKey').value;
  const databaseId = document.getElementById('databaseId').value;

  chrome.storage.sync.set(
    { notionKey: notionKey, databaseId: databaseId },
    () => {
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 2000);
    }
  );
};

const restoreOptions = () => {
  chrome.storage.sync.get(
    { notionKey: DEFAULT_NOTION_KEY, databaseId: DEFAULT_DATABASE_ID },
    (items) => {
      document.getElementById('notionKey').value = items.notionKey;
      document.getElementById('databaseId').value = items.databaseId;
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
