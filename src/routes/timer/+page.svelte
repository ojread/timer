<script lang="ts">
	import { onMount } from 'svelte';
	import Jigsaw from '$lib/jigsaw';

	const imageModules = import.meta.glob('$lib/assets/**/*.{jpg,png,webp}', {
		import: 'default',
		eager: true
	});

	// console.log(imageModules);

	onMount(async () => {
		const canvas = document.getElementById('canvas');

		const urlParams = new URLSearchParams(window.location.search);
		const theme = urlParams.get('theme') ?? '/';
		const minutes = parseInt(urlParams.get('minutes')) ?? 2;

		const themeImageModuleKeys = Object.keys(imageModules).filter((key) => key.includes(theme));
		const themeImageModuleKey =
			themeImageModuleKeys[Math.floor(Math.random() * themeImageModuleKeys.length)];

		const image = await imageModules[themeImageModuleKey];

		const puzzle1 = new Jigsaw({
			image,
			container: document.getElementById('puzzle-container')!,
			rows: 10,
			cols: 10,
			totalDuration: minutes * 60000,
			maxRotation: 360
		});
	});
</script>

<div id="puzzle-container"></div>
