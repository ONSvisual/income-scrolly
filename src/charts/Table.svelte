<script>
	export let data;
	export let sort = null;
	export let asc = null;
	export let height = 200;
	export let rank = false;
	export let filter = null;
	export let filterCol = null;
	export let selected = null;
	export let selectedCol = null;
	export let collapse = [];

	$: regex = filter && filterCol ? new RegExp(filter, 'i') : null;
	$: filtered = regex ? data.filter(d => regex.test(d[filterCol])).map(d => d[filterCol]) : data.map(d => d[filterCol]);
	
	let headers = Object.keys(data[0]);
	let types = headers.map(h => !isNaN(data[0][h]));
	
	let scrollbox;
	let rankWidth;
	let headerHeight = 0;
	let colWidths = [];
	
	function sortBy(header) {
		if (sort == header) {
			asc = !asc;
		} else if (types[headers.indexOf(header)]) {
			sort = header;
			asc = false;
		} else {
			sort = header;
			asc = true;
		}
	}
	
	$: padding = data && scrollbox ? scrollbox.offsetWidth - scrollbox.clientWidth : 0;
	$: sorted = data.sort((a, b) => {
		if (!types[headers.indexOf(sort)]) {
			return asc ? (a[sort] ? a[sort] : '').localeCompare(b[sort] ? b[sort] : '') : (b[sort] ? b[sort] : '').localeCompare(a[sort] ? a[sort] : '');
		} else {
			return asc ? a[sort] - b[sort] : b[sort] - a[sort];
		}
	});
</script>

<style>
	@import url('https://fonts.googleapis.com/css2?family=B612+Mono&display=swap');
	table {
		clear: both;
		border-collapse: collapse;
		border-spacing: 0;
    font-size: 16px;
	}
	td, th {
		box-sizing: border-box;
		padding: 2px 8px;
	}
	.header th {
		padding-bottom: 5px;
	}
	tbody tr + tr {
		border-top: 1px solid lightgrey;
	}
	tbody tr:hover {
		background: #f6f6f6;
	}
	tbody tr:hover td.active {
		background-color: #e0e0e0;
	}
	th {
		text-transform: uppercase;
		text-align: left;
		font-size: 0.85rem;
		vertical-align: bottom;
		border-bottom: 2px solid black;
		cursor: pointer;
	}
	.scroll-box {
		padding: 0;
		margin: 0;
		overflow-y: auto;
		overflow-x: hidden;
	}
	.number {
		text-align: right;
		min-width: 80px;
	}
	.right {
		text-align: right;
	}
	.hidden {
		height: 0;
    line-height: 0;
		color: rgba(255,255,255,0);
		overflow: hidden;
		pointer-events: none;
	}
	.hidden th {
		padding: 0 !important;
		border-bottom: none !important;
	}
	.selected {
		background-color: rgba(255, 192, 0, 0.65) !important;
	}
	.selected .active {
		background-color: rgba(255, 192, 0, 0.8) !important;
	}
	.active {
		background-color: #f6f6f6;
	}
	.invisible {
		display: none;
	}
	@media (max-width: 991px) {
		.collapse {
			display: none;
		}
	}
	@media (max-width: 700px) {
		table {
			font-size: 14px;
		}
		th {
			font-size: 0.75rem;
		}
		.number {
			min-width: 60px;
		}
		td, th {
			box-sizing: border-box;
			padding: 2px 4px;
		}
	}
</style>

<div class="container">
<table class="header" style="{padding > 0 ? 'min-width: calc(100% - ' + padding + 'px)' : ''}" bind:clientHeight={headerHeight}>
	<thead>
		<tr>
			{#if rank}
			<th class="right" style="{rankWidth ? 'width: ' + rankWidth + 'px' : ''}">#</th>
			{/if}
			{#each headers as h, i}
				<th on:click="{() => sortBy(h)}" style="{colWidths[i] ? 'width: ' + colWidths[i] + 'px' : ''}" class:number={types[i]} class:collapse={collapse.includes(h)}>{h}</th>
			{/each}
		</tr>
	</thead>
</table>

<div class="scroll-box" bind:this={scrollbox} style="height: {height - headerHeight}px">
	<table class="body">
		<thead>
			<tr class="hidden">
				{#if rank}
					<th class="right" bind:clientWidth={rankWidth}>#</th>
				{/if}
				{#each headers as h, i}
					<th bind:clientWidth={colWidths[i]} class:number={types[i]} class:collapse={collapse.includes(h)}>{h}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each sorted as d, i}
				<tr class:invisible={filterCol && !filtered.includes(d[filterCol])} class:selected={selected && selectedCol && d[selectedCol] == selected}>
					{#if rank}
						<td class="right">{i + 1}</td>
					{/if}
					{#each headers as h, j}
						<td class:number={types[j]} class:active={sort == h} class:collapse={collapse.includes(h)}>{d[h] != null ? d[h].toLocaleString() : ''}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
</div>