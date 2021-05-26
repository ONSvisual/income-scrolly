<script>
	import { LayerCake, Svg, Html } from 'layercake';
	import { scaleOrdinal } from 'd3-scale';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	import Beeswarm from './Beeswarm.svelte';
	import AxisX from './AxisX.svelte';
	import AxisY from './AxisY.svelte';
	import Voronoi from './Voronoi.svelte';
	import Label from './Label.svelte';

	export let data;
	export let radius = 4;
	export let padding = 1;
	export let xKey = 'income';
	export let yKey = null;
	export let zKey = null;
	export let codeKey = 'lad19cd';
	export let nameKey = 'lad19nm';
	export let selected = null;
	export let hovered = null;
	export let highlighted = null;
	export let margins = { top: 0, bottom: 70, left: 3, right: 3 };
	export let click = true;
	export let animation = true;
	export let colors = ['#0571b0', '#85a0c2', '#d3d3d3', '#dc8175', '#ca0020'];

	const stroke = 'orange';
	const strokeWidth = 2;
	const formatTick = d => (d * 100) + '%';

	function selectArea() {
		if (selectedInt != selected) {
			selected = selectedInt;
			dispatch('select', {
				code: selected
			});
		}
	}

	let selectedInt = selected;

	$: zDomain = zKey && Number.isInteger(data[0][zKey]) ? data.map(d => d[zKey]).filter((item, i, ar) => ar.indexOf(item) === i).sort((a, b) => a - b) : zKey ? data.map(d => d[zKey]).filter((item, i, ar) => ar.indexOf(item) === i).sort((a, b) => (a ? a : '').localeCompare(b ? b : '')) : null;

	$: click && selectedInt && selectArea();
	
</script>

<style>
	.chart-container {
		width: 100%;
		height: 100%;
		min-height: 300px;
		min-width: 200px;
	}
</style>

<div class="chart-container">
	<LayerCake
		padding={margins}
		x={xKey}
		y={yKey}
		z={zKey}
		zScale={scaleOrdinal()}
		zRange={colors}
		zDomain={zDomain}
		data={data}
	>
		<Svg>
			<AxisX
				ticks={5}
				{formatTick}
			/>
			{#if yKey}
			<AxisY/>
			{/if}
			<Beeswarm
				{radius}
				{padding}
				{codeKey}
				{selected}
				{hovered}
				{highlighted}
				{animation} />
		</Svg>
		<Html>
			<Label
				{selected}
				{hovered}
				{highlighted}
				{codeKey}
				{nameKey} />
		</Html>
		<Svg>
			<Voronoi {codeKey} bind:hovered bind:selected={selectedInt} {click}/>
		</Svg>
	</LayerCake>
</div>
