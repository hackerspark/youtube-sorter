<script lang="ts">
	import { YOUTUBE_URL_PATTERN, sortGroupYoutubeTabs, pauseYoutubeVideos } from '$lib/utils';

	let processing = false;

	async function runSortGroup() {
		processing = true;
		await sortGroupYoutubeTabs(YOUTUBE_URL_PATTERN);
		processing = false;
	}

	async function runPauseVideos() {
		processing = true;
		await pauseYoutubeVideos(YOUTUBE_URL_PATTERN);
		processing = false;
	}
</script>

{#if processing}
	<div class="loader" />
{/if}

<button on:click={runSortGroup} disabled={processing}>Sort & Group</button>
<button on:click={runPauseVideos} disabled={processing}>Pause Videos</button>

<style>
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.loader {
		border: 2px solid #f3f3f3;
		border-radius: 50%;
		border-top: 2px solid #3498db;
		width: 30px;
		height: 30px;
		animation: spin 2s linear infinite;
	}
</style>
