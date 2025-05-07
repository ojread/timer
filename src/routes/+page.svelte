<script lang="ts">
	const themes = ['Numberjacks', 'Star Wars'];

	function handleSubmit(event: SubmitEvent) {
		const formData = new FormData(event.target as HTMLFormElement);
		console.log(formData);
	}
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<h2>Choose a theme and time</h2>

<h3>Theme:</h3>
<form action="/timer">
	<ul>
		{#each themes as theme}
			<li>
				<input
					type="radio"
					name="theme"
					value={theme.toLowerCase().replace(' ', '')}
					id="theme-{theme}"
				/>
				<label for="theme-{theme}">
					{theme}
				</label>
			</li>
		{:else}
			<li>Something went wrong!</li>
		{/each}
	</ul>

	<h3>Minutes:</h3>

	<ul>
		{#each [1, 2, 3, 4, 5] as minutes}
			<li>
				<input type="radio" name="minutes" value={minutes} id="minutes-{minutes}" />
				<label for="minutes-{minutes}">
					{minutes}
				</label>
			</li>
		{:else}
			<li>Something went wrong!</li>
		{/each}
	</ul>

	<input type="submit" value="Start timer" />
</form>
