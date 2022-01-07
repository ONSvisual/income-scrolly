<script>
	import { setContext, onMount } from "svelte";
	import { bbox, union } from '@turf/turf';
	import { getData, getTopo, setColors, suffixer } from "./utils";
	import { themes, dataurl, lsoaBldg, ladBounds, colors, scatterColors, hiColor, fillColor, distributions } from './config';
	import ONSHeader from "./layout/ONSHeader.svelte";
	import ONSFooter from "./layout/ONSFooter.svelte";
	import Header from "./layout/Header.svelte";
	import Section from "./layout/Section.svelte";
	import Media from "./layout/Media.svelte";
	import Scroller from "./layout/Scroller.svelte";
	import Filler from "./layout/Filler.svelte";
	import Divider from "./layout/Divider.svelte";
	import Map from "./maps/Map.svelte";
	import MapSource from "./maps/MapSource.svelte";
	import MapLayer from "./maps/MapLayer.svelte";
	import BeeswarmChart from './charts/BeeswarmChart.svelte';
	import ColumnChart from './charts/ColumnChart.svelte';
	import DotPlotChart from './charts/DotPlotChart.svelte';
	import RankChart from './charts/RankChart.svelte';
	import Chessboard from './charts/Chessboard.svelte';
	import Table from './charts/Table.svelte';
	import Toggle from './ui/Toggle.svelte';
	import Arrow from './ui/Arrow.svelte';
	import Em from './ui/Em.svelte';

	// STYLE CONFIG
	// Set theme globally (options are defined in config.js)
	let theme = "light";
	setContext("theme", theme);
	setColors(themes, theme);

	// SCROLLYTELLING CONFIG
	// Config
	const threshold = 0.65;
	// State
	let index = [];
	let indexPrev = [];

	// APP STATE
	let data = {
		lad: null,
		lsoa: null,
		indexed: null,
		geojson: null
	};
	let mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)"); // Check if browser prefers reduced motion
	let animation = !mediaQuery || mediaQuery.matches ? false : true; // Set animation default on/off based on browser preference
	let legend = 'bars'; // Current legend type for the map
	let selected = null; // Selected area (object)
	let selectedPrev = null; // Previous selected area (to compare for changes)
	let selectedCode = null; // Selected area code
	let highlighted = []; // Array of area codes (to highlight on maps/charts)
	let highlightedData = []; // The data objects for the above codes
	let highlightedTitle = null; // Title for map legend (for relevant legend types)
	let highlightedDist = 'left'; // Selected distribution type
	let filled = []; // Like 'highlighted' array, but for filled areas on map
	let hovered = null; // Area code hovered on map or chart
	let hoveredArea = null; // Data object for hovered area
	let observer = false; // "true" when IntersectionObserver for map DIVs are set
	let explorer = false; // "true" if map in explorer mode (allowing to select areas by clicking)
	let quintiles = null; // Highlighted quintiles on bar chart (array of active quintiles,  between 1 and 5)
	let filter = ""; // Text filter for table at end of article

	onMount(() => {
		indexPrev = [...index];
	});
	
	// MAP CODE
	// Config
	const mapstyle = './lib/style-ons-light.json';
	const mapbounds = {
		eng: [[-5.816, 49.864], [1.863, 55.872]]
	};
	// Map-specific state
	let map = null; // Map object (used to call map functions once map is initialised)
	let element = []; // Array for map container DOM elements. The map DIV itself jumps up and down the article to avoid initialising multiple maps

	// Map-specific functions

	// Fit map to one or more features, based on their geographic code
	function fitFeatures(codes, animate = animation) {
		if (map) {
			if (!Array.isArray(codes)) {
				codes = [codes];
			}
			let features = data.geojson.features.filter(f => codes.includes(f.properties[ladBounds.code]));
			let polygon = union(...features);
			let bounds = bbox(polygon);
			map.fitBounds(bounds, { padding: 50, speed: 0.6, animate });
		}
	}

	// Fit map to specified min/max bounds [[xmin, ymin], [xmax, ymax]]
	function fitBounds(bounds, animate = animation) {
		if (map) {
			map.fitBounds(bounds, { speed: 0.6, animate });
		}
	}

	// Actions for MAP scroller
	// These arrays of functions correspond to the <section/> tags within each of the map <Scroller/> components
	const mapActions = [
		[
			() => {
				highlighted = [ selected.lad19cd ];
				filled = [];
				fitFeatures(highlighted);
				legend = 'bars';
				explorer = false;
				quintiles = [1];
			},
			() => {
				highlighted = [ selected.lad19cd ];
				fitFeatures(highlighted);
				legend = 'bars';
				quintiles = [5];
			},
			() => {
				highlighted = [ selected.lad19cd ];
				fitBounds(mapbounds.eng);
				legend = 'bars';
				quintiles = null;
			},
			() => {
				highlighted = [];
				filled = [];
				fitBounds(mapbounds.eng);
				legend = 'bars';
				quintiles = null;
			},
			() => {
				// Highlight 20 left-skew areas
				highlightedTitle = "More income-deprived";
				highlightedDist = "left";
				highlightedData = data.lad.filter(d => d.type == "left");
				filled = highlightedData.map(d => d.lad19cd);
				highlighted = [];
				fitBounds(mapbounds.eng);
				legend = 'skew';
			},
			() => {
				highlightedTitle = "More income-deprived";
				highlightedDist = "left";
				highlightedData = data.lad.filter(d => d.type == "left");
				filled = highlightedData.map(d => d.lad19cd);
				highlighted = ['E07000145', 'E06000009', 'E07000062'];
				fitFeatures(highlighted);
				legend = 'skew';
			},
			() => {
				// Highlight 20 highest income areas
				highlightedTitle = "Less income-deprived";
				highlightedDist = "right";
				highlightedData = data.lad.filter(d => d.type == "right");
				filled = highlightedData.map(d => d.lad19cd);
				highlighted = [];
				fitBounds(mapbounds.eng);
				legend = 'skew';
			},
			() => {
				highlightedTitle = "Less income-deprived";
				highlightedDist = "right";
				highlightedData = data.lad.filter(d => d.type == "right");
				filled = highlightedData.map(d => d.lad19cd);
				highlighted = ['E07000089', 'E06000041', 'E07000155'];
				fitFeatures(highlighted);
				legend = 'skew';
			},
			() => {
				highlightedTitle = "Less income-deprived";
				highlightedDist = "right";
				highlightedData = data.lad.filter(d => d.type == "right");
				filled = highlightedData.map(d => d.lad19cd);
				highlighted = [];
				fitBounds(mapbounds.eng);
				legend = 'skew';
			},
			() => {
				highlightedTitle = "'n'-shaped profile";
				highlightedDist = "nshape";
				highlightedData = data.lad.filter(d => d.type == "nshape");
				filled = highlightedData.map(d => d.lad19cd);
				highlighted = [];
				fitBounds(mapbounds.eng);
				legend = 'skew';
			},
			() => {
				highlightedTitle = "'n'-shaped profile";
				highlightedDist = "nshape";
				highlightedData = data.lad.filter(d => d.type == "nshape");
				filled = highlightedData.map(d => d.lad19cd);
				highlighted = [];
				fitBounds(mapbounds.eng);
				legend = 'skew';
			},
			() => {
				// Highlight 20 flat distributions
				highlightedTitle = "Flat profile";
				highlightedDist = "flat";
				highlightedData = data.lad.filter(d => d.type == "flat");
				filled = highlightedData.map(d => d.lad19cd);
				highlighted = [];
				fitBounds(mapbounds.eng);
				legend = 'skew';
			},
			() => {
				highlightedTitle = "Flat profile";
				highlightedDist = "flat";
				highlightedData = data.lad.filter(d => d.type == "flat");
				filled = highlightedData.map(d => d.lad19cd);
				highlighted = ['E06000023', 'E07000178', 'E07000237', 'E07000154'];
				fitFeatures(highlighted);
				legend = 'skew';
			},
			() => {
				highlightedTitle = "Flat profile";
				highlightedDist = "flat";
				highlightedData = data.lad.filter(d => d.type == "flat");
				filled = highlightedData.map(d => d.lad19cd);
				highlighted = ['E06000015', 'E08000010'];
				fitFeatures(highlighted);
				legend = 'skew';
			}
		],
		[
			() => {
				filled = [];
				highlighted = [ 'E06000002' ];
				fitFeatures(highlighted, false);
				legend = 'hibars';
				quintiles = null;
				explorer = false;
			},
			() => {
				filled = [];
				highlighted = [ 'E09000020' ];
				fitFeatures(highlighted);
				legend = 'hibars';
				explorer = false;
			},
			() => {
				filled = [];
				highlighted = [ 'E07000199' ];
				fitFeatures(highlighted);
				legend = 'hibars';
				explorer = false;
			},
			() => {
				filled = [];
				highlighted = [ 'E07000009' ];
				fitFeatures(highlighted);
				legend = 'hibars';
				explorer = false;
			},
			() => {
				filled = [];
				highlighted = [ 'E06000024' ];
				fitFeatures(highlighted);
				legend = 'hibars';
				explorer = false;
			},
			() => {
				filled = [];
				highlighted = [ 'E08000014' ];
				fitFeatures(highlighted);
				legend = 'hibars';
				explorer = false;
			},
			() => {
				filled = [];
				highlighted = [];
				legend = 'hibars';
				explorer = false;
			}
		],
		[
			() => {
				// Zoom to selected area
				highlighted = [selectedCode];
				highlightedTitle = null;
				fitBounds(mapbounds.eng, false);
				legend = 'bars';
				quintiles = null;
				explorer = true;
			}
		]
	];
	
	// Reactive code to trigger MAP actions
	// Note: This code is a messy and could definitely be improved!
	$: if (map && data.lad && index[0] != indexPrev[0]) {
		if (mapActions[0][+index[0]]) {
			mapActions[0][+index[0]]();
		}
		indexPrev[0] = index[0];
	}
	$: if (map && data.lad && index[0] >= mapActions[0].length && index[1] != indexPrev[1]) {
		if (mapActions[1][+index[1]]) {
			mapActions[1][+index[1]]();
		}
		indexPrev[1] = index[1];
	}
	$: if (map && data.lad && index[1] >= mapActions[1].length && index[2] != indexPrev[2]) {
		if (mapActions[2][+index[2]]) {
			mapActions[2][+index[2]]();
		}
		indexPrev[2] = index[2];
	}

	// CHART CODE
	// Config (for dot plots)
	const dot = {
		cols: d => ({label: d.lad19nm, min: d.min, max: d.max, avg: d.income }),
		labels: {label: "Local authority", min: "Minimum, %", min: "Maximum, %", avg: "Average, %"}
	};

	// State
	let scatter = {
		xKey: "income",
		yKey: null,
		zKey: null,
		selected: null,
		colors: scatterColors.quintiles
	};

	// Actions for CHART scroller
	// This array of functions correspond to the <section/> tags within the scatter/beeswarm chart <Scroller/> component
	const chartActions = [
		[
			() => {
				scatter.selected = selectedCode;
				scatter.yKey = null;
				scatter.zKey = null;
				scatter.colors = scatterColors.quintiles;
				highlighted = [];
			},
			() => {
				scatter.selected = selectedCode;
				scatter.yKey = "moran";
				scatter.zKey = null;
				scatter.colors = scatterColors.quintiles;
				highlighted = [];
			},
			() => {
				scatter.selected = selectedCode;
				scatter.yKey = "moran";
				scatter.zKey = null;
				scatter.colors = scatterColors.quintiles;
				highlighted = [];
			},
			() => {
				scatter.selected = null;
				scatter.yKey = "moran";
				scatter.zKey = "quintile";
				scatter.colors = scatterColors.quintiles;
				highlighted = [];
			},
			() => {
				scatter.selected = null;
				scatter.yKey = "moran";
				scatter.zKey = "quintile";
				scatter.colors = scatterColors.quintiles;
				highlighted = ['E08000014', 'E08000008'];
			},
			() => {
				scatter.selected = null;
				scatter.yKey = "moran";
				scatter.zKey = "quintile";
				scatter.colors = scatterColors.quintiles;
				highlighted = [];
			},
			() => {
				scatter.selected = null;
				scatter.yKey = "moran";
				scatter.zKey = "quintile";
				scatter.colors = scatterColors.quintiles;
				highlighted = ['E06000002', 'E08000012', 'E07000127', 'E08000029'];
			},
			() => {
				scatter.selected = null;
				scatter.yKey = "moran";
				scatter.zKey = "ruc";
				scatter.colors = scatterColors.ruc;
				highlighted = [];
			},
			() => {
				scatter.selected = null;
				scatter.yKey = "moran";
				scatter.zKey = "ruc";
				scatter.colors = scatterColors.ruc;
				highlighted = [];
			},
			() => {
				scatter.selected = null;
				scatter.yKey = "moran";
				scatter.zKey = "ruc";
				scatter.colors = scatterColors.ruc;
				highlighted = [];
			}
		]
	];

	// Reactive code to trigger CHART actions
	// Note: This code is a messy and could definitely be improved!
	$: if (data.lad && index[3] != indexPrev[3]) {
		if (chartActions[0][+index[3]]) {
			chartActions[0][+index[3]]();
		}
		indexPrev[3] = index[3];
	}

	// INTERSECITON OBSERVER FUNCTION FOR MAP
	// There is only a single Mapbox map node in the article.
	// It is moved to the visible node using this function as you scroll from section to section.
	function setObserver() {
		// Move map element to whichever container is in view
		const options = {
			threshold: [0, 1]
		};
		const obs = new IntersectionObserver((entries) => {
			if (!entries[0].target.querySelector("#map")) {
				console.log('Moving map to visible node!');
				entries[0].target.appendChild(document.querySelector("#map"));
				entries[0].target.appendChild(document.querySelector("#legend"));
				let i = element.indexOf(entries[0].target);
				if (typeof mapActions[i][+index[i]] === 'function') {
					mapActions[i][+index[i]]();
				}
			}
		}, options);
		element.forEach(el => {
			obs.observe(el);
		});

		observer = true;
	}

	// URL/ROUTING FUNCTIONS
	// These functions make sure that the URL is updated when the selected location changes
	// They also ensure that the browser's back and forward buttons work as expected

	// Update url, adding to browser history
	function updateURL() {
		let hash = location.hash;
		let newhash = `#/${selectedCode}`;
		if (hash != newhash) {
			history.pushState(undefined, undefined, newhash);
		}
	}

	// Replace url, without adding to browser history (used on initial load)
	function replaceURL() {
		let hash = `#/${selectedCode}`;
		history.replaceState(undefined, undefined, hash);
	}

	// Respond to URL change
	window.onpopstate = () => {
		let hash = location.hash == '' ? '' : location.hash.split('/');

		if (hash.length == 2 && hash[0] == '#') {
			if (selectedCode != hash[1]) {
				let found = data.lad.find(d => d.lad19cd == hash[1]);
				if (found) {
					selected = found;
					selectedCode = selected.lad19cd;
				}
			}
		}
	}

	// ON-SELECT FUNCTIONS
	// These functions are called when an area is selected via a dropdown, map or chart.
	// They only log to the console in this version. In the live version they have attached functions for analtics.

	function dropSelect() {
		let name = selected.lad19nm;
		console.log(name + ' selected via dropdown');
	}

	function mapSelect(ev) {
		if (ev.detail.code) {
			let name = data.lad.find(d => d.lad19cd == ev.detail.code).lad19nm;
			console.log(name + ' selected via map');
		}
	}

	function chartSelect(ev) {
		if (ev.detail.code) {
			let name = data.lad.find(d => d.lad19cd == ev.detail.code).lad19nm;
			console.log(name + ' selected via chart');
		}
	}

	// LOAD THE DATA & INITIALISE THE APP STATE
	getData(dataurl.lad)
	.then(laddata => {
		// Remove Isles of Scilly from dataset
		laddata = laddata.filter(d => d.lad19cd != 'E06000053');

		getData(dataurl.lsoa)
		.then(lsoadata => {
			// Load neighbourhood (LSOA) level data
			// Assign counts to local authority data 
			const deciles = {d1: 0, d2: 0, d3: 0, d4: 0, d5: 0, d6: 0, d7: 0, d8: 0, d9: 0, d10: 0};
			let indexed = {};
			lsoadata.forEach(d => {
				if (!indexed[d.lad19cd]) {
					indexed[d.lad19cd] = {deciles: {...deciles}, count: 0, min: d.income_score, max: d.income_score};
				}
				indexed[d.lad19cd].deciles['d' + d.income_decile] += 1;
				indexed[d.lad19cd].count += 1;
				if (d.income_score < indexed[d.lad19cd].min) { indexed[d.lad19cd].min = d.income_score };
				if (d.income_score > indexed[d.lad19cd].max) { indexed[d.lad19cd].max = d.income_score };

				d.color = colors[d.income_decile - 1];
			});

			laddata = laddata.map(d => {
				return {...d, ...indexed[d.lad19cd]};
			});
			laddata.forEach(d => d.range = d.max - d.min);

			const dims = ['income', 'moran', 'range'];
			dims.forEach(dim => {
				laddata.sort((a, b) => a[dim] - b[dim]);
				laddata.forEach((d, i) => d[dim + '_rank'] = i + 1);
			});

			laddata.sort((a, b) => a.lad19nm.localeCompare(b.lad19nm));

			// LOAD THE TOPOJSON
			getTopo(ladBounds.url, ladBounds.layer)
			.then(geojson => {
				geojson.features = geojson.features.filter(f => f.properties[ladBounds.code].substring(0, 1) == 'E').filter(f => f.properties[ladBounds.code] != 'E06000053'); // Filter out Wales and Isles of Scilly

				// Assign data to app state variables
				data.lad = laddata;
				data.lsoa = lsoadata;
				data.indexed = indexed;
				data.geojson = geojson;

				// Assign initial selection based on URL
				let hash = location.hash.split('/');
				let found = hash.length == 2 && hash[0] == '#' ? data.lad.find(d => d.lad19cd == hash[1]) : null;
				if (found) {
					selected = selectedPrev = found;
					selectedCode = selected.lad19cd;
				} else {
					selected = selectedPrev = data.lad[0];
					selectedCode = selected.lad19cd;
					replaceURL();
				}

				// Move map DIV to the right place, if needed
				if (index[0] >= mapActions[0].length) {
					element[1].appendChild(document.querySelector("#map"));
					element[1].appendChild(document.querySelector("#legend"));
				}

				// Run first map scroll action
				mapActions[0][0]();
			});
		})
	});

	// SHARED REACTIVE CODE

	// Update hoveredArea object to match hovered area code
	$: hoveredArea = hovered ? data.lad.find(d => d.lad19cd == hovered) : null;

	// Set intersection observer to move map once map container DOM elements are initialised
	$: !observer && element[2] && setObserver();

	// Code to run when a new area is selected
	// Syncs state variables related to selected area, fits map to selected area, and updates the URL
	$: if (selected && selectedPrev && selectedCode) {
		if (selected != selectedPrev) {
			selectedCode = selected.lad19cd;
			selectedPrev = selected;
			highlighted = [selectedCode];
			fitFeatures(selectedCode);
			updateURL();
		} else if (selectedCode != selected.lad19cd) {
			selected = selectedPrev = data.lad.find(d => d.lad19cd == selectedCode);
			highlighted = [selectedCode];
			fitFeatures(selectedCode);
			updateURL();
		}
	}

</script>

<ONSHeader filled={true} center={false} />

<main>
<Header bgimage="./img/bg-map.png" bgfixed={true} theme="dark" center={false} short={true}>
	<h1>Exploring local income deprivation</h1>
	<p class="text-big" style="margin-top: 5px">
		A detailed picture of disparities within English local authorities to a neighbourhood level
	</p>
	<p style="margin-top: 20px">
		24 May 2021
	</p>
	<p>
		<Toggle label="Animation {animation ? 'on' : 'off'}" mono={true} bind:checked={animation}/>
	</p>
	<div style="margin-top: 90px;">
		<Arrow color="white" {animation}>Scroll to begin</Arrow>
	</div>
</Header>

<Filler theme="lightblue" center={false} wide={true} short={true}>
	<p>
		<img src="./img/icon-location.svg" style="height: 80px; margin-bottom: 20px; margin-top: -20px;" alt="" aria-hidden="true"/>
	</p>
	<p class="text-big">
		Economic inequalities are not just regional, as we explored in <a href="https://www.ons.gov.uk/visualisations/dvc1370/">this release</a> on income and productivity &mdash; but can occur between neighbourhoods too.
	</p>
	<p class="text-big">
		This article looks at levels of income deprivation, which is based on the proportion of people in an area who are out of work or on low earnings.
	</p>
</Filler>

{#if selected && selectedCode && data.geojson}
<Section>
	<p>
		Select a local authority area for a personalised look at income inequality in your area:<br/>
		<!-- svelte-ignore a11y-no-onchange -->
		<select bind:value={selected} on:change={dropSelect} aria-label="select an area">
			{#each data.lad.sort((a, b) => a.lad19nm.localeCompare(b.lad19nm)) as d}
			<option value={d}>{d.lad19nm}</option>
			{/each}
		</select>
	</p>
	<h2 class="section-title" aria-live="polite" aria-atomic="true">Income deprivation in {selected.lad19nm}</h2>
	<p>
		In <Em color={hiColor}>{selected.lad19nm}</Em>, <strong>{(selected.income * 100).toFixed(1)}%</strong> of the population was income-deprived in 2019. Of the 316 local authorities in England (excluding the Isles of Scilly), {selected.lad19nm} is ranked <strong>{data.lad.length - selected.income_rank + 1}{suffixer(data.lad.length - selected.income_rank + 1)} most income-deprived</strong>.
	</p>
</Section>

<Media col="medium" height={300}>
	<!-- <h3 class="visuallyhidden">Beeswarm chart showing English local authorities by percentage of people in income deprivation, 2019</h3> -->
	<div class="chart" aria-hidden="true">
		<BeeswarmChart data={data.lad} xKey="income" bind:selected={selectedCode} bind:hovered on:select={chartSelect}/>
		<div class="label label-title" style="top: calc(100% - 47px);">
			English local authorities by percentage of people in income deprivation, 2019
		</div>
	</div>
</Media>

<Divider hr={false} />

<Scroller {threshold} bind:index={index[0]} splitscreen={true}>
	<div slot="background" aria-hidden="true">
		<figure>
			<div class="col-full height-full" bind:this={element[0]}>
				<Map style={mapstyle} bind:map={map}>
					<MapSource
						id="lsoa"
						type="vector"
						url={lsoaBldg.url}
						layer={lsoaBldg.layer}
						promoteId={lsoaBldg.code}
						maxzoom={13}>
						{#if data.lsoa}
						<MapLayer
							id="lsoa"
							source="lsoa"
							sourceLayer={lsoaBldg.layer}
							data={data.lsoa}
							geoCode={lsoaBldg.code}
							colorCode='color'
							type="fill"
							minzoom={5}
							paint={{
								'fill-color': ['case',
									['!=', ['feature-state', 'color'], null], ['feature-state', 'color'],
									'rgba(255, 255, 255, 0)'
								]
							}}
							order="aeroway-taxiway" />
							{/if}
					</MapSource>
					{#if data.geojson}
					<MapSource
						id="lad"
						type="geojson"
						data={data.geojson}
						promoteId={ladBounds.code}
						maxzoom={13}>
						<MapLayer
							id="lad"
							source="lad"
							hover={true}
							bind:hovered={hovered}
							click={true}
							ignoreClick={!explorer}
							bind:selected={selectedCode}
							on:select={mapSelect}
							type="fill"
							paint={{
								'fill-color': 'rgba(255,255,255,0)'
							}}
							order="place_other" />
						<MapLayer
							id="lad-fill"
							source="lad"
							highlight={true}
							highlighted={filled}
							highlightKey="filled"
							type="fill"
							paint={{
								'fill-color': ['case',
									['==', ['feature-state', 'filled'], true], fillColor,
									'rgba(192, 192, 192, 0)'
								]
							}}
							order="place_other" />
						<MapLayer
							id="lad-bounds"
							source="lad"
							highlight={true}
							highlighted={highlighted}
							type="line"
							paint={{
								'line-color': ['case',
									['==', ['feature-state', 'hovered'], true], 'orange',
									['==', ['feature-state', 'highlighted'], true], 'black',
									'rgba(128, 128, 128, 0.3)'
								],
								'line-width': ['case',
									['==', ['feature-state', 'hovered'], true], 3,
									['==', ['feature-state', 'highlighted'], true], 3,
									1
								]
							}}
							order="place_other" />
					</MapSource>
					{/if}
				</Map>
				<div id="legend" class="no-hover" aria-hidden="true">
					{#if legend == "skew" && highlightedTitle && highlightedDist}
					{#if hovered && highlightedData && highlightedData.map(d => d.lad19cd).includes(hovered)}
					<p class="front outline">
						<strong>{data.lad.find(d => d.lad19cd == hovered).lad19nm}</strong>
					</p>
					<div class="chart" style="height: 160px">
						<ColumnChart
							data={[
								{ label: '1', value: (data.indexed[hovered].deciles.d1 / data.indexed[hovered].count) * 100, color: colors[0] },
								{ label: '2', value: (data.indexed[hovered].deciles.d2 / data.indexed[hovered].count) * 100, color: colors[1] },
								{ label: '3', value: (data.indexed[hovered].deciles.d3 / data.indexed[hovered].count) * 100, color: colors[2] },
								{ label: '4', value: (data.indexed[hovered].deciles.d4 / data.indexed[hovered].count) * 100, color: colors[3] },
								{ label: '5', value: (data.indexed[hovered].deciles.d5 / data.indexed[hovered].count) * 100, color: colors[4] },
								{ label: '6', value: (data.indexed[hovered].deciles.d6 / data.indexed[hovered].count) * 100, color: colors[5] },
								{ label: '7', value: (data.indexed[hovered].deciles.d7 / data.indexed[hovered].count) * 100, color: colors[6] },
								{ label: '8', value: (data.indexed[hovered].deciles.d8 / data.indexed[hovered].count) * 100, color: colors[7] },
								{ label: '9', value: (data.indexed[hovered].deciles.d9 / data.indexed[hovered].count) * 100, color: colors[8] },
								{ label: '10', value: (data.indexed[hovered].deciles.d10 / data.indexed[hovered].count) * 100, color: colors[9] }
							]}
							yDomain={[0, 30]}
							{colors}
						/>
						<div class="label outline label-dark" style="left: 0; top: -4px;">Neighbourhoods by income deprivation</div>
						<div class="label" style="left: 0">&larr; More deprived</div>
						<div class="label" style="right: 0">Less deprived &rarr;</div>
					</div>
					{:else}
					<p class="front outline">
						<strong>{highlightedTitle}</strong>
					</p>
					<div class="chart" style="height: 160px">
						<ColumnChart
							data={[
								{ label: '1', value: distributions[highlightedDist].deciles[0], color: colors[0] },
								{ label: '2', value: distributions[highlightedDist].deciles[1], color: colors[1] },
								{ label: '3', value: distributions[highlightedDist].deciles[2], color: colors[2] },
								{ label: '4', value: distributions[highlightedDist].deciles[3], color: colors[3] },
								{ label: '5', value: distributions[highlightedDist].deciles[4], color: colors[4] },
								{ label: '6', value: distributions[highlightedDist].deciles[5], color: colors[5] },
								{ label: '7', value: distributions[highlightedDist].deciles[6], color: colors[6] },
								{ label: '8', value: distributions[highlightedDist].deciles[7], color: colors[7] },
								{ label: '9', value: distributions[highlightedDist].deciles[8], color: colors[8] },
								{ label: '10', value: distributions[highlightedDist].deciles[9], color: colors[9] }
							]}
							yDomain={[0, 30]}
							{colors}
						/>
						<div class="label outline label-dark" style="left: 0; top: -4px;">Neighbourhoods by income deprivation</div>
						<div class="label" style="left: 0">&larr; More deprived</div>
						<div class="label" style="right: 0">Less deprived &rarr;</div>
					</div>
					{/if}
					{:else if legend == "bars"}
					<p class="front outline">
						<strong>{selected.lad19nm}</strong>
					</p>
					<div class="chart" style="height: 160px">
						<ColumnChart
							data={[
								{ label: '1', value: (selected.deciles.d1 / selected.count) * 100, color: colors[0] },
								{ label: '2', value: (selected.deciles.d2 / selected.count) * 100, color: colors[1] },
								{ label: '3', value: (selected.deciles.d3 / selected.count) * 100, color: colors[2] },
								{ label: '4', value: (selected.deciles.d4 / selected.count) * 100, color: colors[3] },
								{ label: '5', value: (selected.deciles.d5 / selected.count) * 100, color: colors[4] },
								{ label: '6', value: (selected.deciles.d6 / selected.count) * 100, color: colors[5] },
								{ label: '7', value: (selected.deciles.d7 / selected.count) * 100, color: colors[6] },
								{ label: '8', value: (selected.deciles.d8 / selected.count) * 100, color: colors[7] },
								{ label: '9', value: (selected.deciles.d9 / selected.count) * 100, color: colors[8] },
								{ label: '10', value: (selected.deciles.d10 / selected.count) * 100, color: colors[9] }
							]}
							yDomain={[0, 30]}
							{colors}
							{quintiles}
						/>
						{#if explorer}
						<div class="label outline label-dark" style="left: 0; top: -4px;">{distributions[selected.type].name}</div>
						{:else}
						<div class="label outline label-dark" style="left: 0; top: -4px;">Neighbourhoods by income deprivation</div>
						{/if}
						<div class="label" style="left: 0">&larr; More deprived</div>
						<div class="label" style="right: 0">Less deprived &rarr;</div>
					</div>
					{:else if legend == "hibars" && highlighted[0]}
					{#each [ data.lad.find(d => d.lad19cd == highlighted[0]) ] as selected}
					<p class="front outline">
						<strong>{selected.lad19nm}</strong>
					</p>
					<div class="chart" style="height: 160px">
						<ColumnChart
							data={[
								{ label: '1', value: (selected.deciles.d1 / selected.count) * 100, color: colors[0] },
								{ label: '2', value: (selected.deciles.d2 / selected.count) * 100, color: colors[1] },
								{ label: '3', value: (selected.deciles.d3 / selected.count) * 100, color: colors[2] },
								{ label: '4', value: (selected.deciles.d4 / selected.count) * 100, color: colors[3] },
								{ label: '5', value: (selected.deciles.d5 / selected.count) * 100, color: colors[4] },
								{ label: '6', value: (selected.deciles.d6 / selected.count) * 100, color: colors[5] },
								{ label: '7', value: (selected.deciles.d7 / selected.count) * 100, color: colors[6] },
								{ label: '8', value: (selected.deciles.d8 / selected.count) * 100, color: colors[7] },
								{ label: '9', value: (selected.deciles.d9 / selected.count) * 100, color: colors[8] },
								{ label: '10', value: (selected.deciles.d10 / selected.count) * 100, color: colors[9] }
							]}
							yDomain={[0, 30]}
							{colors}
						/>
						<div class="label outline label-dark" style="left: 0; top: -4px;">Neighbourhoods by income deprivation</div>
						<div class="label" style="left: 0">&larr; More deprived</div>
						<div class="label" style="right: 0">Less deprived &rarr;</div>
					</div>
					{/each}
					{:else if legend == "area" && hoveredArea}
					<p>
						<strong>{hoveredArea.lad19nm}</strong>
						<span class="text-small">{(hoveredArea.income * 100).toFixed(1)}% income-deprived</span>
					</p>
					{/if}
					{#if explorer}
					<table class="table-inset">
						<tbody>
							<tr>
								<td>Income deprivation</td><td class="number"><strong>{(selected.income * 100).toFixed(1)}%</strong> <span class="text-muted">({317 - selected.income_rank} of 316)</span></td>
							</tr>
							<tr>
								<td colspan="2" style="padding-bottom: 6px"><RankChart count={317} rank={317 - selected.income_rank}/></td>
							</tr>
							<tr>
								<td>Internal disparity</td><td class="number"><strong>{((selected.range) * 100).toFixed(1)}pp</strong> <span class="text-muted">({317 - selected.range_rank} of 316)</span></td>
							</tr>
							<tr>
								<td colspan="2" style="padding-bottom: 6px"><RankChart count={317} rank={317 - selected.moran_rank}/></td>
							</tr>
							<tr>
								<td>Moran's I</td><td class="number"><strong>{selected.moran}</strong> <span class="text-muted">({317 - selected.moran_rank} of 316)</span></td>
							</tr>
							<tr>
								<td colspan="2"><RankChart count={317} rank={317 - selected.moran_rank}/></td>
							</tr>
						</tbody>
					</table>
					{/if}
				</div>
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section>
			<div class="col-medium">
				<p>
					Of the {selected.count} neighbourhoods in {selected.lad19nm}, {selected.deciles.d1 + selected.deciles.d2 > 0 ? selected.deciles.d1 + selected.deciles.d2 : 'none'} {selected.deciles.d1 + selected.deciles.d2 == 1 ? 'was' : 'were'} among the 20 percent <Em color={colors[1]} nowrap={false}>most income-deprived</Em> in England. This is shown in the first two bars in the chart on the top right in red.
				</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>
					Of the {selected.count} neighbourhoods in {selected.lad19nm}, {selected.deciles.d10 + selected.deciles.d9 > 0 ? selected.deciles.d10 + selected.deciles.d9 : 'none'} {selected.deciles.d10 + selected.deciles.d9 == 1 ? 'was' : 'were'} in the 20 percent <Em color={colors[8]} nowrap={false}>least income-deprived</Em> in England, seen on the last two bars of the chart in blue.
				</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>
					Overall, there are <strong>32,844 statistical neighbourhoods</strong> in England, known as lower layer super output areas (LSOAs). For each local authority there is a unique distribution of neighbourhoods across different levels of income deprivation, as seen in the chart.
				</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>
					To help identify trends across the country, we have grouped local authorities into <strong>four income deprivation profiles</strong>, according to the distribution shape they match most closely.
				</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<h3>More income-deprived</h3>
				<p>
					In a <Em color={fillColor}>more income-deprived</Em> profile, areas have more neighbourhoods towards the deprived end of the scale. Areas matching this profile are mostly urban areas, including in <strong>Greater London</strong>, around <strong>Birmingham</strong>, and in the <strong>north east</strong>.
				</p>
				<p>
					Hover over the <Em color={fillColor} nowrap={false}>highlighted areas</Em> to see their income deprivation distributions.
				</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>
					There are some more deprived areas outside of urban centres, including some coastal towns, such as <Em color={fillColor}>Great Yarmouth</Em>, <Em color={fillColor}>Hastings</Em> and <Em color={fillColor}>Blackpool</Em>.
				</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<h3>Less income-deprived</h3>
				<p>
					Contrastingly, local authorities with a <Em color={fillColor} nowrap={false}>less income-deprived</Em> profile are generally inland areas with a mix of urban and rural characteristics.
				</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>
					Many of these are areas within the south of England, including the three least deprived areas in the country &mdash; <strong>Hart</strong>, <strong>Wokingham</strong> and <strong>South Northamptonshire</strong>.
				</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>
					This profile also include areas in the <strong>Midlands</strong> and <strong>the north of the country</strong>.
				</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<h3>'n'-shaped profile</h3>
				<p>
					Looking at an <Em color={fillColor} nowrap={false}>'n'-shaped profile</Em>, where more neighbourhoods have close to average levels of income deprivation, we see mostly rural and coastal areas.
				</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>
					These include most of the <strong>south coast</strong> of England and the <strong>Norfolk coastline</strong>. A significant number of <strong>urban areas in London</strong> and rural areas close to the <strong>Welsh border</strong> also fit within this category.
				</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<h3>Flat profile</h3>
				<p>
					The remaining local authorities can be broadly categorised as having a <Em color={fillColor}>flat profile</Em>, showing a relatively even percentage of neighbourhoods across different levels of income deprivation.
				</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>
					This category includes several bigger towns and cities, including <Em color={fillColor}>Bristol</Em> and <Em color={fillColor}>Oxford</Em> in the south and <Em color={fillColor}>Worcester</Em> and <Em color={fillColor}>Northampton</Em> in the Midlands, alongside relatively rural areas around cities in the north of England.
				</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>
					This grouping also includes local authorities with a significant number of neighbourhoods with high and low levels of deprivation, but with relatively few that have a middling level of deprivation, including <Em color={fillColor}>Derby</Em> and <Em color={fillColor}>Wigan</Em>.
				</p>
			</div>
		</section>
	</div>
</Scroller>

<Divider/>

<Section>
	<h2 class="section-title">Local extremes</h2>
	<p>
		We can also examine the gap between the most and least deprived neighbourhoods in each local authority, to see which have the greatest gaps between the extremes.
	</p>
</Section>

<Media
	col="medium"
	grid="full"
	height={60}
	caption="Range and population weighted average of income deprivation levels for neighbourhoods within {selected.lad19nm}">
	<div><DotPlotChart labels={true} height={60} data={[data.lad.find(d => d.lad19cd == selected.lad19cd)].map(dot.cols)} cols={dot.labels}/></div>
</Media>

<Section>
	<p>
		In the <Em color={colors[8]}>least deprived</Em> neighbourhood in {selected.lad19nm}, <strong>{(selected.min * 100).toFixed(1)}% of people</strong> are estimated to be income-deprived. In the <Em color={colors[1]}>most deprived</Em> neighbourhood, <strong>{(selected.max * 100).toFixed(1)}% of people</strong> are estimated to be income-deprived. The gap between these two, which we will call internal disparity, is <strong>{(selected.range * 100).toFixed(1)} percentage points</strong> in {selected.lad19nm}. We also know the <Em color="darkgrey" nowrap={false}>overall income deprivation</Em> score for {selected.lad19nm} is <strong>{(selected.income * 100).toFixed(1)}%</strong>.
	</p>
	<p>
		We should note a small deprivation gap does not necessarily imply there is no deprivation, it may just mean income deprivation is evenly spread throughout the local authority, rather than concentrated in a few neighbourhoods.
	</p>
</Section>

<Divider/>

<Section>
	<h2 class="section-title">Largest and smallest income gaps</h2>
	<p>
		Ranking local authorities by deprivation gap shows that it is often local authorities with the highest income deprivation that tend to have the greatest internal disparities.
	</p>
	<p>
		Of the 20 local authorities with the largest deprivation gap between neighbourhoods, 17 are urban areas in the north or Midlands.
	</p>
</Section>

<Media
	col="medium"
	grid="full"
	height={400}
	caption="The 20 local authorities with the largest gap between their most and least income-deprived neighbourhoods.">
	<div><DotPlotChart data={data.lad.sort((a, b) => (b.range) - (a.range)).slice(0, 20).map(dot.cols).reverse()} cols={dot.labels}/></div>
</Media>

<Section>
	<p>
		These high disparity places are some of the areas that <strong>rank lowest for household income measures</strong> too. We found 14 of these 20 areas were in the bottom 20% nationally for household income in 2018 (gross disposable household income per capita or GDHI), and all of them were in the bottom 50% nationally.
	</p>
	<p>
		Following the categories we identified earlier, 15 of the 20 authorities in this gap list also best match a <strong>"more income-deprived"</strong> profile, with a high proportion of more deprived neighbourhoods.
	</p>
	<p>
		The opposite is true of the 20 local authorities with the smallest deprivation gaps. All are non-coastal, 13 are rural and best match a <strong>"less income-deprived"</strong> profile, with a high proportion of the least deprived neighbourhoods nationally.
	</p>
</Section>

<Media
	col="medium"
	grid="full"
	height={400}
	caption="The 20 local authorities with the smallest gap between their most and least income-deprived neighbourhoods.">
	<div><DotPlotChart data={data.lad.sort((a, b) => (a.range) - (b.range)).slice(0, 20).map(dot.cols).reverse()} cols={dot.labels}/></div>
</Media>

<Section>
	<p>
		Of these low disparity areas, 10 were in the top 20% of local authorities for household income (GDHI) in 2018, and 18 areas were in the top 50%.
	</p>
	<p>
		By this measure, local authorities with the smallest internal disparities tend to be rural, high income, and non-coastal; while the greatest internal disparities are often found in authorities that are urban, low income, and in the north and Midlands.
	</p>
</Section>

<Divider/>

<Section>
	<h2 class="section-title">How income deprivation is clustered</h2>
	<p>
		An alternative way of looking at inequality in an area is to measure how inter-mixed the most and least deprived neighbourhoods are.
	</p>
	<p>
		We can see the extent to which neighbourhoods of the same income level are clustered together using an index called Moran’s I.
	</p>
</Section>

<Media
	col="medium"
	grid="narrow"
	caption="Grids representing the theoretical extremes of Moran's I.<br/>From left to right: Uniform distribution (-1). Random distribution (0). Highly clustered/separated (+1).">
	<div><Chessboard dim={5} dist={0}/></div>
	<div><Chessboard dim={5} dist={2}/></div>
	<div><Chessboard dim={5} dist={1}/></div>
</Media>

<Section>
	<p>
		Moran's I is measured from -1 to +1, where +1 is highly clustered, and -1 is like a chessboard, with a completely uniform mix of high and low deprivation neighbourhoods.
	</p>
</Section>

<Divider hr={false}/>

<Scroller {threshold} bind:index={index[1]} splitscreen={true}>
	<div slot="background" aria-hidden="true">
		<figure>
			<div class="col-full height-full" bind:this={element[1]}>
				<!-- Div reserved for map and legend -->
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section>
			<div class="col-medium">
				<p><strong>Middlesbrough</strong> has a very high Moran's I, relatively close to 1. This is clearly identified by the separation of neighbourhoods in the north and south of the local authority, with high and low levels of income deprivation, respectively.</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p><strong>Kensington and Chelsea</strong> has the highest Moran's I in England. Despite having one of the highest average household incomes in England, the north of Kensington and Chelsea has some of the most income-deprived neighbourhoods. Grenfell Tower is in this more deprived area.</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>By contrast, <strong>Tamworth</strong>, near <strong>Birmingham</strong>, has a relatively low Moran's I value. High and low deprivation neighbourhoods are more mixed together.</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>Lower Moran's I is more common in rural and sparsely populated areas. <strong>East Cambridgeshire</strong> has the lowest Moran's I in England (apart from the City of London, which only has six neighbourhoods).</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>Conversely, <strong>North Somerset</strong> is a predominantly rural area but has a high Moran's I. This is primarily because of a concentrated area of high income deprivation in <strong>Weston-super-Mare</strong>, its largest urban area.</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>This shows how Moran's I is affected by local authority boundaries. For example, the southern part of <strong>Sefton</strong> has a high level of deprivation, although this area is effectively a continuation of central <strong>Liverpool</strong>.</p>
			</div>
		</section>
	</div>
</Scroller>

<Section>
	<h2 class="section-title">Income deprivation levels and Moran's I</h2>
	<p>In this section, we look at deprivation clustering &mdash; how mixed together neighbourhoods of different deprivation levels are within a local authority area &mdash; and how that relates to the overall percentage of people in that area that are income-deprived.</p>
</Section>

<Divider hr={false}/>

<Scroller {threshold} bind:index={index[3]} splitscreen={true}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full middle">
				<h3 class="visuallyhidden">Interactive scatter chart showing a positive correlation between income deprivation and Moran's I</h3>
				<div class="chart chart-full" aria-hidden="true">
					<BeeswarmChart
						data={data.lad}
						xKey={scatter.xKey}
						yKey={scatter.yKey}
						zKey={scatter.zKey}
						colors={scatter.colors}
						selected={scatter.selected}
						click={false}
						bind:hovered
						{highlighted}
						{animation}
						margins={{ top: 0, bottom: 23, left: 20, right: 80 }}/>
						<div class="label outline" style="right: 15%; bottom: 25%">More income-deprived &rarr;</div>
						{#if scatter.yKey}
						<div class="label label-y outline" style="left: calc(20px + 5%); top: 30px;">Higher Moran's I &rarr;</div>
						{/if}
						<div class="label label-title" style="top: 100%;">
							{#if !scatter.yKey}
							English local authorities by percentage of people in income deprivation, 2019
							{:else if scatter.zKey == "ruc"}
							Income deprivation and Moran's I in rural and urban local authorities, 2019
							{:else}
							Income deprivation by Moran's I, English local authorities, 2019
							{/if}
						</div>
				</div>
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section>
			<div class="col-medium">
				<p>We can take our original chart of income deprivation by local authority and then plot this against Moran's I.</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>Areas with a higher overall level of income deprivation generally <strong>tend to have a higher Moran's I</strong>, with neighbourhoods of similar deprivation clustered together.</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>However, local authorities with very similar rates of income deprivation overall may have <strong>very different levels of deprivation clustering</strong>.</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>Grouping local authorities by income deprivation level shows a <strong>wide range of Moran's I values</strong> in each income deprivation band.</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p><strong>Tameside</strong> and <strong>Sefton</strong> are both in the 20% most income-deprived local authorities, but Tameside has a low Moran's I and Sefton has the second highest Moran's I in England.</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>We see places can also have <strong>similar levels of Moran's I</strong>, despite having very <strong>different levels of income deprivation</strong>.</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>For example, <strong>Middlesbrough</strong>, <strong>Liverpool</strong>, <strong>West Lancashire</strong> and <strong>Solihull</strong> all rank in the top ten for Moran's I in England.</p>
				<p>Middlesbrough and Liverpool have <strong>high income deprivation</strong> but West Lancashire and Solihull have <strong>below average deprivation</strong>.</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<h3>Income deprivation clustering is lower in rural areas</h3>
				<p>Comparing <Em color={scatterColors.ruc[1]}>urban</Em> and <Em color={scatterColors.ruc[0]}>rural</Em> local authorities shows other trends. (Some newly-formed authorities have <Em color={scatterColors.ruc[2]} nowrap={true}>no urban-rural classification</Em>.)</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>Generally, the <strong>more deprived</strong> and <strong>more clustered</strong> local authorities are <Em color={scatterColors.ruc[1]}>urban</Em>, although there are some urban areas that have lower income deprivation and low clustering.</p>
			</div>
		</section>
		<section>
			<div class="col-medium">
				<p>Contrastingly, <Em color={scatterColors.ruc[0]}>rural areas</Em> generally have <strong>lower income deprivation</strong> and <strong>lower levels of deprivation clustering</strong>.</p>
			</div>
		</section>
	</div>
</Scroller>

<Section>
	<h2 class="section-title">Disparity and "levelling up"</h2>
	<p>Each of these measures helps build a picture of economic inequalities not just between local authorities, but also within areas at a neighbourhood level.</p>
	<p>With the current focus on "levelling up", knowledge of these local circumstances and detail is of increasing importance.</p>
	<p>Across the measures shown in this article, we see it is generally urban local authorities with a higher level of overall income deprivation that have the greatest internal disparities, both in terms of deprivation gap and income deprivation clustering. However, we also see several exceptions and that every local area has its own unique profile of income disparity.</p>
</Section>

<Divider/>

<Section>
	<h2 class="section-title">Explore the data</h2>
	<p>
		You can use the map below to explore data for every local authority.
	</p>
</Section>

<Divider hr={false}/>

<Scroller {threshold} bind:index={index[2]} splitscreen={true}>
	<div slot="background" aria-hidden="true">
		<figure>
			<div class="col-full height-full" bind:this={element[2]}>
				<!-- Div reserved for map and legend -->
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section>
			<div class="col-medium" style="pointer-events: all">
				<p>
					Select an area on the map or drop-down menu to see how it compares for income deprivation measures.
				</p>
				<!-- svelte-ignore a11y-no-onchange -->
				<select bind:value={selected} on:change={dropSelect} aria-label="select an area">
					{#each data.lad.sort((a, b) => a.lad19nm.localeCompare(b.lad19nm)) as d}
					<option value={d}>{d.lad19nm}</option>
					{/each}
				</select><br/>
				<button class="text-small" on:click={() => fitFeatures(selectedCode)}>
					<img src="./img/icon-zoom.svg" class="svg-icon" alt="" aria-hidden="true"/>Zoom in
				</button>
				<button class="text-small" on:click={() => fitBounds(mapbounds.eng)}>
					<img src="./img/icon-reset.svg" class="svg-icon" alt="" aria-hidden="true"/>Reset zoom
				</button>
				<p style="margin-top: 40px">
					<Arrow {animation}><strong>Scroll to see the data</strong></Arrow>
				</p>
			</div>
		</section>
	</div>
</Scroller>
	
<Divider/>

<Media
	col="wide"
	grid="full"
	height={20}>
	<div>
		<input placeholder="Type to filter table..." bind:value={filter}/>
	</div>
</Media>

<Media
	col="wide"
	grid="full"
	height={500}>
	<div>
		<Table
			data={data.lad.map(d => {return {'Area': d.lad19nm, 'Distribution': distributions[d.type].short, 'Urban/rural classification': d.ruc11nm, "% Income deprivation": +(d.income * 100).toFixed(1), "% Internal disparity": +(d.range * 100).toFixed(1), "Moran's I": d.moran != null ? +d.moran.toFixed(2): null} })}
			height={500}
			sort='% Income deprivation'
			asc={false}
			rank={true}
			{filter}
			filterCol="Area"
			selected={selected.lad19nm}
			selectedCol="Area"
			collapse={['Distribution', 'Urban/rural classification']}
		/>
	</div>
</Media>
{/if}

<Divider />

<Section>
	<h2 class="section-title">More information</h2>
	<p>This article is part of a two-part interactive series on economic disparities, the first part of which showed <a href="https://www.ons.gov.uk/visualisations/dvc1370/" data-gtm-type="related-release">regional level differences in household income and productivity</a> across the UK.</p>
	<p>The local level analysis in this publication was based on income deprivation as recorded in the <a href="https://www.gov.uk/government/statistics/english-indices-of-deprivation-2019" data-gtm-type="external-link" target="_blank" rel="noopener">English Indices of Multiple Deprivation, 2019</a>, and is influenced by Alasdair Rae and Elvis Nyanzu's <a href="https://alasdairrae.github.io/atlasofinequality/" data-gtm-type="external-link" target="_blank" rel="noopener">An English Atlas of Inequality</a>.</p>
	<p><a href="https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/incomeandwealth/datasets/mappingincomedeprivationatalocalauthoritylevel" data-gtm-type="related-data">Data tables</a> have been published alongside <a href="https://www.ons.gov.uk/releases/mappingincomedeprivationatalocalauthoritylevel2019" data-gtm-type="related-release">this release</a> for easier reference.</p>
</Section>

<Divider/>

<Section>
	<h2>Tell us what you think</h2>
	<p>This article uses one of a number of formats that we are developing to present data from the 2021 Census. If you have 5 minutes to spare, please take the time to <a href="https://www.surveymonkey.co.uk/r/QSKCYMV" data-gtm-type="external-link" target="_blank">fill in this survey</a> to give us your views.</p>
	<p></p>
</Section>
</main>

<ONSFooter />

<style>
	/* Styles specific to elements within the demo */
	:global(svelte-scroller-foreground) {
		pointer-events: none !important;
	}
	input {
		position: relative;
		font-size: 16px;
		z-index: 1;
	}
	select {
		position: relative;
		max-width: 325px;
		margin-top: 20px;
		margin-bottom: 0;
	}
	button {
		cursor: pointer;
		font-size: 14px;
		font-weight: bold;
		margin-top: 5px;
	}
	.svg-icon {
		width: 24px;
		height: 24px;
		margin-right: 4px;
	}
	#legend {
		position: absolute;
		z-index: 10;
		-webkit-box-sizing: border-box;
		        box-sizing: border-box;
		padding: 6px 15px 12px 15px;
		width: 320px;
		right: 0;
		top: 0;
		background-color: rgba(255, 255, 255, 0.85);
	}
	#legend p {
		margin-top: 0;
		margin-bottom: 12px;
	}
	.chart {
		position: relative;
	}
	.label {
		position: absolute;
		bottom: 0;
		font-size: 14px;
		color: #666;
	}
	.label-y {
		top: 0px;
		text-align: right;
		-webkit-writing-mode: vertical-rl;
		-ms-writing-mode: tb-rl;
		writing-mode: vertical-rl;
		-webkit-transform: rotate(-180deg);
		-ms-transform: rotate(-180deg);
		transform: rotate(-180deg);
	}
	.label-title {
		color: #333;
		font-weight: bold;
	}
	.label-dark {
		color: #333;
	}
	.outline {
		text-shadow: white 1px 1px 0px,
			white 1px -1px 0px,
			white -1px 1px 0px,
			white -1px -1px 0px,
			white 1px 0px 0px,
			white 0px -1px 0px,
			white -1px 0px 0px,
			white 0px 1px 0px;
	}
	.front {
		position: relative;
		z-index: 2;
		margin-bottom: 5px !important;
	}
	.chart-full {
		height: 500px;
		max-height: 80vh;
	}
	.table-inset {
		width: calc(100%);
		clear: both;
		border-collapse: collapse;
		border-spacing: 0;
    font-size: 14px;
		margin-top: 8px;
	}
	.table-inset td, th {
		-webkit-box-sizing: border-box;
		        box-sizing: border-box;
		padding: 0;
	}
	.table-inset .number {
		text-align: right;
	}
	.no-hover {
		pointer-events: none;
	}
</style>