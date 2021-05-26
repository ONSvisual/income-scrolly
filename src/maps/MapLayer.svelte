<script>
	import { getContext } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	
	export let id;
	export let source;
	export let sourceLayer = null;
	export let type;
	export let filter = null;
	export let layout = {};
	export let paint = {};
	export let data = null;
	export let geoCode = null;
	export let colorCode = null;
	export let click = false;
	export let ignoreClick = false;
	export let clickCenter = false;
	export let selected = null;
	export let hover = false;
	export let hovered = null;
	export let highlight = false;
	export let highlightKey = 'highlighted';
	export let highlighted = [];
	export let order = null;
	export let maxzoom = null;
	export let minzoom = null;
	
	const { getMap } = getContext('map');
	const map = getMap();
	
	let selectedPrev = null;
	let hoveredPrev = null;
	let highlightedPrev = [];
	let selectedGeo = null;
	
	if (map.getLayer(id)) {
    map.removeLayer(id);
	}
	
	let options = {
		'id': id,
		'type': type,
		'source': source,
		'paint': paint,
		'layout': layout
	};

	if (filter) {
		options['filter'] = filter;
	}
	
	if (sourceLayer) {
		options['source-layer'] = sourceLayer;
	}
	if (maxzoom) {
		options['maxzoom'] = maxzoom;
	}
	if (minzoom) {
		options['minzoom'] = minzoom;
	}
	
	map.addLayer(options, order);

	function updateData() {
		console.log('updating colours...');

		data.forEach(d => {
			map.setFeatureState({
				source: source,
				sourceLayer: sourceLayer,
				id: d[geoCode]
			}, {
				color: d[colorCode]
			});
		});
	}

	$: colorCode && updateData();

	$: if (highlight && highlighted != highlightedPrev) {
		if (highlightedPrev[0]) {
			highlightedPrev.forEach(code => {
				let state = {};
				state[highlightKey] = false;
				map.setFeatureState(
					{ source: source, sourceLayer: sourceLayer, id: code },
					state
				);
			});
		}
		highlightedPrev = highlighted;
		if (highlighted[0]) {
			highlighted.forEach(code => {
				let state = {};
				state[highlightKey] = true;
				map.setFeatureState(
					{ source: source, sourceLayer: sourceLayer, id: code },
					state
				);
			});
		}
	}
	
	if (click) {
		map.on('click', id, (e) => {
      if (e.features.length > 0 && !ignoreClick) {
				selected = e.features[0].id;

				dispatch('select', {
					code: selected
				});
				
				if (selectedPrev) {
					map.setFeatureState(
            { source: source, sourceLayer: sourceLayer, id: selectedPrev },
            { selected: false }
          );
				}
				
				map.setFeatureState(
          { source: source, sourceLayer: sourceLayer, id: selected },
          { selected: true }
				);

				if (clickCenter) {
					let center = centroid(e.features[0].toJSON().geometry);
					map.flyTo({
						center: center.geometry.coordinates
					});
				}
				
				selectedPrev = selected;
			}
    });
	}
	
	$: if (click && selected != selectedPrev) {
		if (selectedPrev) {
			map.setFeatureState(
				{ source: source, sourceLayer: sourceLayer, id: selectedPrev },
				{ selected: false }
			);
		}
		if (selected) {
			map.setFeatureState(
				{ source: source, sourceLayer: sourceLayer, id: selected },
				{ selected: true }
			);
		}
		selectedPrev = selected;
	}
	
	if (hover) {
		map.on('mousemove', id, (e) => {
      if (e.features.length > 0) {
        if (hovered) {
          map.setFeatureState(
            { source: source, sourceLayer: sourceLayer, id: hovered },
            { hovered: false }
          );
        }
				hovered = hoveredPrev = e.features[0].id;
				
        map.setFeatureState(
          { source: source, sourceLayer: sourceLayer, id: hovered },
          { hovered: true }
        );

        // Change the cursor style as a UI indicator.
				map.getCanvas().style.cursor = 'pointer';
      }
		});
		
		map.on('mouseleave', id, (e) => {
			if (hovered) {
        map.setFeatureState(
          { source: source, sourceLayer: sourceLayer, id: hovered },
          { hovered: false }
				);
      }
			hovered = hoveredPrev = null;
    });
	}
	
	$: if (hover && hovered != hoveredPrev) {
		if (hoveredPrev) {
			map.setFeatureState(
				{ source: source, sourceLayer: sourceLayer, id: hoveredPrev },
        { hovered: false }
			);
		}
		if (hovered) {
			map.setFeatureState(
				{ source: source, sourceLayer: sourceLayer, id: hovered },
        { hovered: true }
			);
		}
		hoveredPrev = hovered;
	}
	
</script>