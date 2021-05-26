<script>
  import { getContext } from 'svelte';

  const { data, xGet, yGet, yScale, zScale, config } = getContext('LayerCake');

  $: midHeight = $yScale.bandwidth() / 2;
</script>

{#each $data as row}
{#each $xGet(row) as circleX, i}
<div
  class="label {i == 2 ? 'below' : 'above'}"
  style="top:{$yGet(row) + midHeight}px; left:{circleX}px;"
>{i == 0 ? 'least deprived' : i == 1 ? 'most deprived' : 'average'}</div>
{/each}
{/each}

<style>
.label {
  position: absolute;
  font-size: 13px;
  line-height: 1.2;
  max-width: 60px;
}
.above {
  transform: translate(0, -100%)translateY(-8px)translateX(-4px);
}
.below {
  transform: translate(0, 0)translateY(6px)translateX(-4px);
}
</style>