<script>
	import { getContext } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	const { data, xGet, yGet, zGet, width, height, yDomain, y, z, zScale } = getContext('LayerCake');

	export let radius = 4;
	export let padding = 1;
	export let selected = null;
	export let hovered = null;
	export let highlighted = null;
	export let color = 'lightgrey';
	export let selColor = 'rgb(32, 96, 149)';
	export let hovColor = 'orange';
	export let hiColor = 'black';
	export let codeKey = null;
	export let animation = true;

	const TOP = 0; // constant for AccurateBeeswarm classes
	
	class AccurateBeeswarm {
		constructor(items, radius, xFun) {
			this.items = [...items].sort((a, b) => xFun(a) - xFun(b));
			this.diameter = radius * 2;
			this.diameterSq = this.diameter * this.diameter;
			this.xFun = xFun;
			this.tieBreakFn = (x) => x;
			this._oneSided = false;
		}

		withTiesBrokenRandomly() {
			this.tieBreakFn = this._sfc32(0x9e3779b9, 0x243f6a88, 0xb7e15162, 1);
			return this;
		}

		oneSided() {
			this._oneSided = true;
			return this;
		}

		calculateYPositions() {
			let all = this.items.map((d, i) => ({
				datum: d,
				index: i,
				x: this.xFun(d),
				y: null,
				placed: false,
				minPositiveY: 0,
				maxNegativeY: 0,
				score: 0,
				bestPosition: 0,
				heapPos: -1,
			}));
			let tieBreakFn = this.tieBreakFn;
			all.forEach(function (d) {
				d.tieBreaker = tieBreakFn(d.x);
			});
			let pq = new AccurateBeeswarmPriorityQueue();
			pq.push(...all);
			while (!pq.isEmpty()) {
				let item = pq.pop();
				item.placed = true;
				item.y = item.bestPosition;
				this._updateYBounds(item, all, pq);
			}
			return all.map((d) => ({ ...d.datum, x: d.x, y: d.y + ($height / 2)})); // y coord patched to plot in the middle of chart
		}

		// Random number generator
		// https://stackoverflow.com/a/47593316
		_sfc32(a, b, c, d) {
			let rng = function () {
				a >>>= 0;
				b >>>= 0;
				c >>>= 0;
				d >>>= 0;
				var t = (a + b) | 0;
				a = b ^ (b >>> 9);
				b = (c + (c << 3)) | 0;
				c = (c << 21) | (c >>> 11);
				d = (d + 1) | 0;
				t = (t + d) | 0;
				c = (c + t) | 0;
				return (t >>> 0) / 4294967296;
			};
			for (let i = 0; i < 10; i++) {
				rng();
			}
			return rng;
		}

		_updateYBounds(item, all, pq) {
			for (let step of [-1, 1]) {
				let xDist;
				for (
					let i = item.index + step;
					i >= 0 &&
					i < all.length &&
					(xDist = Math.abs(item.x - all[i].x)) < this.diameter;
					i += step
				) {
					let other = all[i];
					if (other.placed) continue;
					let yDist = Math.sqrt(this.diameterSq - xDist * xDist);
					other.minPositiveY = Math.max(other.minPositiveY, item.y + yDist);
					let prevScore = other.score;
					other.score = other.minPositiveY;
					other.bestPosition = other.minPositiveY;
					if (!this._oneSided) {
						other.maxNegativeY = Math.min(other.maxNegativeY, item.y - yDist);
						if (-other.maxNegativeY < other.score) {
							other.score = -other.maxNegativeY;
							other.bestPosition = other.maxNegativeY;
						}
					}
					if (other.score > prevScore) {
						// It is never the case that other.score < prevScore here.
						// The if statement is unnecessary, but makes the algorithm
						// run a little faster.
						pq.deprioritise(other);
					}
				}
			}
		}
	}

	class AccurateBeeswarmPriorityQueue {
		// Based on https://stackoverflow.com/a/42919752

		parent(i) {
			return ((i + 1) >>> 1) - 1;
		}
		left(i) {
			return (i << 1) + 1;
		}
		right(i) {
			return (i + 1) << 1;
		}

		constructor() {
			this._heap = [];
		}
		size() {
			return this._heap.length;
		}
		isEmpty() {
			return this.size() == 0;
		}
		peek() {
			return this._heap[TOP];
		}
		push(...values) {
			values.forEach((value) => {
				value.heapPos = this.size();
				this._heap.push(value);
				this._siftUp();
			});
			return this.size();
		}
		pop() {
			const poppedValue = this.peek();
			const bottom = this.size() - 1;
			if (bottom > TOP) {
				this._swap(TOP, bottom);
			}
			this._heap.pop();
			this._siftDown();
			return poppedValue;
		}
		// Caution: this only works if new priority is less than or equal to old one.
		deprioritise(item) {
			this._siftDown(item.heapPos);
		}
		_greater(i, j) {
			let a = this._heap[i];
			let b = this._heap[j];
			if (a.score < b.score) return true;
			if (a.score > b.score) return false;
			return a.tieBreaker < b.tieBreaker;
		}
		_swap(i, j) {
			let tmp = this._heap[i];
			this._heap[i] = this._heap[j];
			this._heap[j] = tmp;
			this._heap[i].heapPos = i;
			this._heap[j].heapPos = j;
		}
		_siftUp() {
			let node = this.size() - 1;
			while (node > TOP && this._greater(node, this.parent(node))) {
				this._swap(node, this.parent(node));
				node = this.parent(node);
			}
		}
		_siftDown(node = TOP) {
			let l, r;
			let sz = this.size();
			while (
				((l = this.left(node)),
				(r = this.right(node)),
				(l < sz && this._greater(l, node)) ||
					(r < sz && this._greater(r, node)))
			) {
				let maxChild = r < sz && this._greater(r, l) ? r : l;
				this._swap(node, maxChild);
				node = maxChild;
			}
		}
	}

	let points

	function updateData() {
		let pointdata;
		if ($y) {
			$data = $data.map(d => d = {...d, x: $xGet(d), y: $yGet(d)});
		} else {
			$data = new AccurateBeeswarm($data, radius + padding, d => $xGet(d))
			.withTiesBrokenRandomly()
    	.calculateYPositions();
		}
		pointdata = $data.map(d => { return {x: d.x, y: d.y} });

		if (points) {
			points.set(pointdata);
		} else {
			points = tweened(pointdata, {
				duration: animation ? 400 : 0,
				easing: cubicOut
			});
		}
	}

	updateData(); // Initial calculation of points

	$: ($data || $height || $width || $y || !$y) && updateData();
	$: if (animation || !animation) {
		points = null;
		updateData();
	}

</script>

{#if points}
<g class='plot-group'>
	{#each $points as d, i}
		<circle
			fill={$z ? $zGet($data[i]) : color}
			stroke='none'
			cx='{d.x}'
			cy='{d.y}'
			r='{radius}'
		/>
		{#if $data[i][codeKey] == selected}
		<circle
			fill='{selColor}'
			stroke='{selColor}'
			stroke-width='3'
			cx='{d.x}'
			cy='{d.y}'
			r='{radius}'
		/>
		{/if}
		{#if $data[i][codeKey] == hovered}
		<circle
			fill='none'
			stroke='{hovColor}'
			stroke-width='3'
			cx='{d.x}'
			cy='{d.y}'
			r='{radius}'
			/>
		{/if}
	{/each}
	{#if Array.isArray(highlighted)}
	{#each $data.filter(d => highlighted.includes(d[codeKey])) as d}
		<circle
		fill='none'
		stroke='{hiColor}'
			stroke-width='3'
			cx='{d.x}'
			cy='{d.y}'
			r='{radius}'
			/>
	{/each}
	{/if}
</g>
{/if}