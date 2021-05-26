<script>
	import { LayerCake, Svg } from 'layercake';
	import { scaleBand, scaleOrdinal } from 'd3-scale';

	import Column from './Column.svelte';
	import AxisX from './AxisX.svelte';
	import AxisY from './AxisY.svelte';
	import Quintile from './Quintile.svelte';

	export let data;
  export let colors;

	export let xKey = 'label';
	export let yKey = 'value';
  export let zKey = 'label';
	export let yDomain = [0, null];
	export let quintiles = null;
</script>

<style>
	.chart-container {
		width: 100%;
		height: 100%;
		min-width: 50px;
	}
</style>

<div class="chart-container">
	<LayerCake
		padding={{ top: 40, right: 0, bottom: 20, left: 25 }}
		x={xKey}
		y={yKey}
    z={zKey}
		xScale={scaleBand().paddingInner([0.02]).round(true)}
		xDomain={data.map(d => d[xKey])}
		yDomain={yDomain}
		zScale={scaleOrdinal()}
		zDomain={data.map(d => d[zKey])}
		zRange={colors ? colors : null}
		data={data}
	>
		<Svg>
			<Column
        colors={true}
      />
			<AxisY
				gridlines={true}
				suffix="%"
			/>
			{#if Array.isArray(quintiles)}
			<Quintile
				{quintiles}
			/>
			{/if}
		</Svg>
	</LayerCake>
</div>