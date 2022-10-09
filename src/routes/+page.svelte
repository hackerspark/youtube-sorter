<script lang="ts">
	import { YOUTUBE_URL_PATTERN, sortGroupYoutubeTabs } from '$lib/utils';

	let loading = true;
	async function runExtension() {
		await sortGroupYoutubeTabs(YOUTUBE_URL_PATTERN);
		loading = false;
	}

	runExtension();
</script>

{#if loading}
	<div class="loader" />
{/if}

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
