<script>
	import { LayerCake, Svg, Html } from 'layercake';
	import { scaleBand, scaleOrdinal } from 'd3-scale';

	import DotPlot from './DotPlot.svelte';
	import DotLabels from './DotLabels.svelte';
	import AxisX from './AxisX.svelte';
	import AxisY from './AxisY.svelte';

	export let data;
	export let height = 400;
	export let labels = false;
	export let cols = null;

	const yKey = 'label';
	const xKey = Object.keys(data[0]).filter(d => d !== yKey);

	const seriesColors = ['#2166ac','#b2182b','grey'];

  data.forEach(d => {
		xKey.forEach(name => {
			d[name] = +d[name];
		});
	});
</script>

<style>
	.chart-container {
		width: 100%;
		height: 100%;
	}
</style>

<div class="chart-container" style="height: {height}px" aria-hidden="true">
	<LayerCake
		padding={{ right: 0, bottom: 20, left: 150 }}
		x={xKey}
		y={yKey}
		yScale={scaleBand().paddingInner([0.05]).round(true)}
		yDomain={data.map(d => d[yKey])}
		xDomain={[0, 0.65]}
		xPadding={[10, 0]}
		zScale={scaleOrdinal()}
		zDomain={xKey}
		zRange={seriesColors}
		data={data}
	>
		<Svg>
			<AxisX
        ticks={[0, 0.2, 0.4, 0.6]}
        formatTick={d => (100 * d).toFixed(0)}
				suffix="%"
      />
			<AxisY
				gridlines={false}
			/>
			<DotPlot/>
		</Svg>
		{#if labels}
		<Html>
			<DotLabels/>
		</Html>
		{/if}
	</LayerCake>
</div>
{#if cols}
<table class="visuallyhidden">
	<thead>
		<tr>
			{#each Object.keys(cols) as key}
			<th>{cols[key]}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each [...data].reverse() as d}
		<tr>
			{#each Object.keys(cols) as key}
			<td>{typeof d[key] == 'number' ? (d[key] * 100).toFixed(1) : d[key]}</td>
			{/each}
		</tr>
		{/each}
	</tbody>
</table>
{/if}