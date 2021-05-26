<script>
	import { getContext } from 'svelte';

	const { data, width, height, xScale, yScale, yRange } = getContext('LayerCake');

	export let gridlines = true;
	export let formatTick = d => d;
	export let baseline = false;
	export let flipped = false;
	export let snapTicks = false;
	export let ticks = undefined;
	export let prefix = '';
	export let suffix = '';
	export let xTick = undefined;
	export let yTick = 15;
	export let dxTick = 0;
	export let dyTick = 0;
	export let lineColor = '#aaa';
	export let textColor = '#666';
	export let solid = false;

	$: isBandwidth = typeof $xScale.bandwidth === 'function';

	$: tickVals = Array.isArray(ticks) ? ticks :
		isBandwidth ?
			$xScale.domain() :
			$xScale.ticks(ticks);

	function textAnchor(i) {
		if (snapTicks === true) {
			if (i === 0) {
				return 'start';
			}
			if (i === tickVals.length - 1) {
				return 'end';
			}
		}
		return 'middle';
	}
</script>

<g class='axis x-axis'>
	{#each tickVals as tick, i}
		<g class='tick tick-{ tick }' transform='translate({$xScale(tick)},{$yRange[0]})'>
			{#if gridlines !== false}
				<line y1='{($height * -1)}' y2='{dyTick}' x1='0' x2='0' stroke='{lineColor}' class:baseline={solid}></line>
			{/if}
			<text
				x="{xTick || isBandwidth ? $xScale.bandwidth() / 2 : 0 }"
				y='{flipped ? ($height * -1) - 6 : yTick}'
				dx="{textAnchor(i) == 'start' ? dxTick - 2 : textAnchor(i) == 'end' ? dxTick + 2 : dxTick}"
				dy='{dyTick}'
				text-anchor='{textAnchor(i)}'
				fill='{textColor}'>
				{#if i == tickVals.length - 1}
				{prefix}{formatTick(tick)}{suffix}
				{:else}
				{formatTick(tick)}
				{/if}
			</text>
		</g>
	{/each}
	{#if baseline === true}
		<line class="baseline" y1='{$height}' y2='0' x1='0' x2='0' stroke='{lineColor}'></line>
	{/if}
</g>

<style>
	.tick {
		font-size: 14px;
		font-weight: 200;
	}

	line,
	.tick line {
		stroke-dasharray: 2;
	}

	.baseline {
		stroke-dasharray: 0 !important;
	}
</style>