/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { TabSegregation, VideoTabDuration } from 'src/lib/types';

/* Constants */
export const YOUTUBE_URL_PATTERN = 'https://www.youtube.com/*';

/* Scripts */
export function extractVideoDurationScript(): number {
	const videoDuration = (document.querySelector('video[src]') as HTMLVideoElement)?.duration || 0;
	return videoDuration;
}

export function hasVideoScript(): boolean {
	return !!document.querySelector('video[src]');
}

export function isDummyTabScript(): boolean {
	return !document.querySelector('body');
}

/* Executors */
export async function tabHasVideo(tab: chrome.tabs.Tab): Promise<boolean> {
	let hasVideo = false;
	try {
		[{ result: hasVideo }] = await chrome.scripting.executeScript({
			target: {
				tabId: tab.id!
			},
			func: hasVideoScript
		});
	} catch (e) {
		console.log(e);
	}
	return hasVideo;
}

export async function extractTabVideoDuration(tab: chrome.tabs.Tab): Promise<number> {
	let duration = 0;
	try {
		[{ result: duration }] = await chrome.scripting.executeScript({
			target: {
				tabId: tab.id!
			},
			func: extractVideoDurationScript
		});
	} catch (e) {
		console.log(e);
	}
	return duration;
}

export async function isDummyTab(tab: chrome.tabs.Tab): Promise<boolean> {
	let isDummy = true;
	try {
		[{ result: isDummy }] = await chrome.scripting.executeScript({
			target: {
				tabId: tab.id!
			},
			func: isDummyTabScript
		});
	} catch (e) {
		console.log(e);
	}
	return isDummy;
}

/* Utils */
export async function getAllYoutubeTabs(pattern: string): Promise<chrome.tabs.Tab[]> {
	return await chrome.tabs.query({
		url: pattern,
		windowType: 'normal',
		currentWindow: true
	});
}

export async function segregateYoutubeTabs(tabs: chrome.tabs.Tab[]): Promise<TabSegregation> {
	const segregation: TabSegregation = {
		videoTabs: [], // active & video
		discardedTabs: [], // nonActive
		nonVideoTabs: [] // active & nonVideo
	};

	for (const tab of tabs) {
		if (tab.discarded || tab.status !== 'complete' || (await isDummyTab(tab))) {
			segregation.discardedTabs.push(tab);
		} else if (tab.status === 'complete') {
			if (await tabHasVideo(tab)) {
				segregation.videoTabs.push(tab);
			} else {
				segregation.nonVideoTabs.push(tab);
			}
		}
	}
	return segregation;
}

export async function getVideoTabDurationDetails(
	tabs: chrome.tabs.Tab[]
): Promise<VideoTabDuration[]> {
	const videoTabDurationDetails: VideoTabDuration[] = [];
	let duration;
	for (const tab of tabs) {
		duration = await extractTabVideoDuration(tab);
		videoTabDurationDetails.push({
			tab,
			duration
		});
	}
	return videoTabDurationDetails;
}

export function sortVideoTabDurationDetails(
	videoTabDurationDetails: VideoTabDuration[]
): VideoTabDuration[] {
	const videoTabDurationDetailsCopy = [...videoTabDurationDetails];
	return videoTabDurationDetailsCopy.sort(
		(videoTabDurationDetails1, videoTabDurationDetails2) =>
			videoTabDurationDetails1.duration - videoTabDurationDetails2.duration
	);
}

export async function moveTabs(tabs: chrome.tabs.Tab[]): Promise<chrome.tabs.Tab[]> {
	const movedTabs = [];
	let movedTab;
	for (const tab of tabs) {
		movedTab = await chrome.tabs.move(tab.id!, {
			index: -1
		});
		movedTabs.push(movedTab);
	}
	return movedTabs;
}

/* Orchestrators */
export async function sortGroupYoutubeTabs(urlPattern: string) {
	/* Process tabs */
	const tabs = await getAllYoutubeTabs(urlPattern);
	const tabSegregation: TabSegregation = await segregateYoutubeTabs(tabs);
	const videoTabDurationDetails = await getVideoTabDurationDetails(tabSegregation.videoTabs);
	const sortedVideoTabDurationDetails = sortVideoTabDurationDetails(videoTabDurationDetails);

	/ * Get processed tabs */;
	const sortedVideoTabs = sortedVideoTabDurationDetails.map(
		(videoTabDurationDetails) => videoTabDurationDetails.tab
	);
	const discardedTabs = tabSegregation.discardedTabs;
	const nonVideoTabs = tabSegregation.nonVideoTabs;
	const processedTabs = [...sortedVideoTabs, ...discardedTabs, ...nonVideoTabs];

	/* Move and group processed tabs */
	const movedTabs = await moveTabs(processedTabs);
	const youtubeGroup = await chrome.tabs.group({
		tabIds: movedTabs.map((tab) => tab.id!)
	});
	await chrome.tabGroups.update(youtubeGroup, {
		title: `Youtube (${sortedVideoTabs.length}|${discardedTabs.length}|${nonVideoTabs.length})`,
		collapsed: true
	});
}
