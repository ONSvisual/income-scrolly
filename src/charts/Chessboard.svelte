<script>
	const functions = [
		{
			name: 'Uniformly distributed',
			func: (val) => dim % 2 == 0 && Math.floor(val / dim) % 2 == 1 ? (val + 1) % 2 : val % 2
		},
		{
			name: 'Fully separated',
			func: (val) => val < (dim * dim) / 2 ? 1 : 0
		},
		{
			name: 'Randomly distributed',
			func: (val) => Math.floor(Math.random() * 2)
		}
	];
	
	export let dim = 4;
	export let dist = 0;
	
	let func = functions[dist].func;
	
	let cells = [];
	
	$: if (dim) {
		let newcells = [];
		for (let i = 0; i < dim; i++) {
			let row = [];
			for (let j = 0; j < dim; j++) {
				row.push((i * dim) + j);
			}
			newcells.push(row);
		}
		cells = newcells;
	}
	
</script>

<style>
	.row:after {
  	clear: both;
  	content: "";
  	display: table;
	}
	.cell {
		color: white;
		border: 1px solid #999;
  	float: left;
  	font-size: 24px;
  	font-weight: bold;
  	line-height: 34px;
  	height: 34px;
  	margin-right: -1px;
  	margin-top: -1px;
  	padding: 0;
  	text-align: center;
  	width: 34px;
	}
	.black {
		color: black;
		background-color: black;
	}
</style>

<div>
	{#each cells as row, i}
	<div class="row">
		{#each cells[i] as col}
		<div class="cell" class:black={func(col)}/>
		{/each}
	</div>
	{/each}
</div>