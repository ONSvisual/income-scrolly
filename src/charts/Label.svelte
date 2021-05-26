<script>
  import { getContext } from 'svelte';

  const { data, xGet, yGet, yScale, zScale, config } = getContext('LayerCake');

  export let selected = null;
  export let hovered = null;
  export let highlighted = null;
	export let codeKey = null;
  export let nameKey = null;
</script>

{#if Array.isArray(highlighted)}
  {#each $data.filter(d => highlighted.includes(d[codeKey])) as d}
    <div class="label" style="top:{d.y}px; left:{d.x}px;">{d[nameKey]}</div>
	{/each}
{/if}
{#if selected}
  {#each [ $data.find(d => d[codeKey] == selected) ] as d}
    <div class="label" style="top:{d.y}px; left:{d.x}px;">{d[nameKey]}</div>
  {/each}
{/if}
{#if hovered}
  {#each [ $data.find(d => d[codeKey] == hovered) ] as d}
    <div class="label" style="top:{d.y}px; left:{d.x}px;">{d[nameKey]}</div>
	{/each}
{/if}

<style>
.label {
  transform: translate(0, -100%)translateY(-8px)translateX(0px);
  padding: 0 2px;
  position: absolute;
  font-size: 14px;
  line-height: 1.2;
  max-width: 130px;
  background-color: #ffffffdd;
}
</style>