<script lang="ts">
	const themes = [
		'Bluey',
		'Jobs',
		'Mario',
		'Minecraft',
		'My Singing Monsters',
		'Numberblocks',
		'Numberjacks',
		'Paw Patrol',
		'Pokemon',
		'Spider-Man',
		'Spongebob',
		'Star Wars',
		'Vania Mania'
	];

	function handleSubmit(event: SubmitEvent) {
		const formData = new FormData(event.target as HTMLFormElement);
		console.log(formData);
	}
</script>

<article class="prose-xl">
	<h1>Toothy Timer 🦷</h1>

	<p>Choose a theme and time</p>

	<form action="/timer">
		<div class="mb-4 grid-cols-2 gap-4 lg:grid">
			<fieldset class="fieldset text-lg">
				<legend class="fieldset-legend">Theme</legend>
				{#each themes as theme}
					<label
						class="label text-base-content text-lg"
						for="theme-{theme.toLowerCase().replaceAll(' ', '')}"
					>
						<input
							type="radio"
							class="radio radio-primary"
							name="theme"
							value={theme.toLowerCase().replaceAll(' ', '').replaceAll('-', '')}
							id="theme-{theme.toLowerCase().replaceAll(' ', '').replaceAll('-', '')}"
						/>
						{theme}
					</label>
				{:else}
					<li>Something went wrong!</li>
				{/each}
			</fieldset>

			<fieldset class="fieldset text-lg">
				<legend class="fieldset-legend">Minutes</legend>

				{#each [1, 2, 3, 4, 5] as minutes}
					<label class="label text-base-content" for="minutes-{minutes}">
						<input
							type="radio"
							class="radio radio-primary"
							name="minutes"
							value={minutes}
							id="minutes-{minutes}"
						/>
						{minutes}
					</label>
				{:else}
					<li>Something went wrong!</li>
				{/each}
			</fieldset>
		</div>

		<input class="btn btn-xl btn-primary mb-4" type="submit" value="Start timer" />
	</form>
</article>
