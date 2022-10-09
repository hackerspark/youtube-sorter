export interface TabSegregation {
	videoTabs: chrome.tabs.Tab[];
	discardedTabs: chrome.tabs.Tab[];
	nonVideoTabs: chrome.tabs.Tab[];
}
