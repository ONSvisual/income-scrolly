<script>
	import { getContext } from 'svelte';

	const { data, xGet, yGet, yRange, xScale } = getContext('LayerCake');

	$: columnWidth = d => {
		const vals = $xGet(d);
		return Math.max(0, (vals[1] - vals[0]));
	};

	$: columnHeight = $yRange[0] - $yRange[1];

	/* --------------------------------------------
	 * Default styles
	 */
	export let stroke = 'black';
	export let strokeWidth = 2;
  export let quintiles = [];

  $: quins = [
    quintiles.includes(1),
    null,
    quintiles.includes(2),
    null,
    quintiles.includes(3),
    null,
    quintiles.includes(4),
    null,
    quintiles.includes(5),
    null
  ];

</script>

<g class="quintile-group">
	{#each $data as d, i}
    {#if quins[i]}
		<rect
			class='group-rect'
			data-id="{i}"
			x="{$xScale.bandwidth ? $xGet(d) : $xGet(d)[0]}"
			y="{$yRange[1]}"
			width="{$xScale.bandwidth ? $xScale.bandwidth() * 2 : columnWidth(d) * 2}"
			height="{columnHeight}"
			fill="none"
			{stroke}
			stroke-width="{strokeWidth}"
		/>
    {/if}
	{/each}
</g>
