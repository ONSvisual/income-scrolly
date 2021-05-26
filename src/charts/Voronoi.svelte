<script>
	import { Delaunay } from 'd3-delaunay';
	import { getContext } from 'svelte';

	const { data, width, height, x, y, z, yDomain } = getContext('LayerCake');

	function log (point) {
		console.log(point, point.data);
	}

  export let codeKey = null;
  export let hovered = null;
	export let selected = null;
	export let click = true;

	$: points = $data.map(d => {
		const point = [d.x, d.y];
		return point;
	});

	$: voronoi = $width > 0 && $height > 0 ? Delaunay.from(points).voronoi([0, 0, $width, $height]) : null;

</script>

<style>
	.voronoi-cell {
		fill: none;
		stroke: none;
		pointer-events: all;
	}
</style>

{#if voronoi}
<g class="voronoi-group" on:mouseleave="{() => { if (codeKey) { hovered = null } }}">
{#each $data as d, i}
	<path class="voronoi-cell" d={voronoi.renderCell(i)}
		on:mouseover="{() => { if (codeKey) { hovered = d[codeKey] } }}"
		on:click="{() => { if (codeKey && click) { selected = d[codeKey] } }}"></path>
{/each}
</g>
{/if}