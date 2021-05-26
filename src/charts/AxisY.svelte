<script>
	import { getContext } from 'svelte';

	const { padding, xRange, xScale, yScale } = getContext('LayerCake');

	export let ticks = 4;
	export let prefix = '';
	export let suffix = '';
	export let gridlines = true;
	export let formatTick = d => d;
	export let xTick = 0;
	export let yTick = 0;
	export let dxTick = 0;
	export let dyTick = -4;
	export let textAnchor = 'start';
	export let lineColor = '#aaa';
	export let textColor = '#666';
	export let solid = false;

	$: isBandwidth = typeof $yScale.bandwidth === 'function';

	$: tickVals = Array.isArray(ticks) ? ticks :
		isBandwidth ?
			$yScale.domain() :
			$yScale.ticks(ticks);
</script>

<g class='axis y-axis' transform='translate({-$padding.left}, 0)'>
	{#each tickVals as tick, i}
		<g class='tick tick-{tick}' transform='translate({$xRange[0] + (isBandwidth ? $padding.left : 0)}, {$yScale(tick)})'>
			{#if gridlines !== false}
				<line
					x2='100%'
					y1='{yTick + (isBandwidth ? ($yScale.bandwidth() / 2) : 0)}'
					y2='{yTick + (isBandwidth ? ($yScale.bandwidth() / 2) : 0)}'
					stroke='{lineColor}'
					class:baseline={solid}
				></line>
			{/if}
			<text
				x='{xTick}'
				y='{yTick + (isBandwidth ? $yScale.bandwidth() / 2 : 0)}'
				dx='{isBandwidth ? 3 : dxTick}'
				dy='{isBandwidth ? 4 : dyTick}'
				fill='{textColor}'
				style="text-anchor:{isBandwidth ? 'end' : textAnchor};"
			>
				{#if i == tickVals.length - 1}
				{prefix}{formatTick(tick)}{suffix}
				{:else}
				{formatTick(tick)}
				{/if}
			</text>
		</g>
	{/each}
</g>

<style>
	.tick {
		font-size: 14px;
		font-weight: 200;
	}

	.tick line {
		stroke-dasharray: 2;
	}

	.tick.tick-0 line {
		stroke-dasharray: 0;
	}
	
	.baseline {
		stroke-dasharray: 0 !important;
	}
</style>