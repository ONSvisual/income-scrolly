<script>
	import { getContext } from 'svelte';
	import { scaleOrdinal } from 'd3-scale';

	const { data, xGet, yGet, yScale, zScale, config } = getContext('LayerCake');

	export let r = 5;

	$: midHeight = $yScale.bandwidth() / 2;
</script>

<g class="dot-plot">
	{#each $data as row}
		<g class="dot-row">
			<line
				x1="{Math.min(...$xGet(row))}"
				y1="{$yGet(row) + midHeight}"
				x2="{Math.max(...$xGet(row))}"
				y2="{$yGet(row) + midHeight}"
				stroke="{$zScale($config.x[2])}"
				stroke-width="{2 * r}"
				opacity="0.4"
			></line>

			{#each $xGet(row) as circleX, i}
				<circle
					cx="{circleX}"
					cy="{$yGet(row) + midHeight}"
					r="{r}"
					fill="{$zScale($config.x[i])}"
				></circle>
			{/each}
		</g>
	{/each}
</g>

<style>
	circle {
		stroke: none;
	}
</style>
