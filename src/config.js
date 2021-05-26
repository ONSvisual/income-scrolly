// CORE CONFIG
export const themes = {
  'light': {
    'text': '#222',
    'muted': '#707070',
    'pale': '#f0f0f0',
    'background': '#fff'
  },
  'dark': {
    'text': '#fff',
    'muted': '#bbb',
    'pale': '#333',
    'background': '#222'
  },
	'lightblue': {
		'text': '#206095',
    'muted': '#707070',
    'pale': '#f0f0f0',
		'background': 'rgb(188, 207, 222)'
	}
}

// CONTENT CONFIG
export const dataurl = {
	lad: './data/imd-lad19.csv',
	lsoa: './data/imd-lsoa11.csv'
};
export const lsoaBldg = {
	url: "https://cdn.ons.gov.uk/maptiles/buildings/v1/{z}/{x}/{y}.pbf",
	layer: "buildings",
	code: "lsoa11cd"
};
export const ladBounds = {
	url: "./lib/geogLA2019EW.json",
	layer: "la2019EW",
	code: "AREACD",
	name: "AREANM"
};
export const colors = ['#67001f','#b2182b','#d6604d','#f4a582','#fddbc7','#d1e5f0','#92c5de','#4393c3','#2166ac','#053061'];
export const scatterColors = {
	quintiles: ['#0571b0', '#85a0c2', '#d3d3d3', '#dc8175', '#ca0020'],
	top20: ['#0571b0', '#d3d3d3', '#d3d3d3', '#d3d3d3', '#d3d3d3'],
	bottom20: ['#d3d3d3', '#d3d3d3', '#d3d3d3', '#d3d3d3', '#ca0020'],
	ruc: ['#a8bd3a', '#206095', '#d3d3d3']
};
export const hiColor = 'rgb(32, 96, 149)';
export const fillColor = 'rgba(255, 192, 0, 0.65)';

export const distributions = {
	left: { name: 'More income deprived profile', short: 'More deprived', deciles: [ 20, 17.8, 15.6, 13.3, 11.1, 8.9, 6.7, 4.4, 2.2, 0 ] },
	right: { name: 'Less income deprived profile', short: 'Less deprived', deciles: [ 0, 2.2, 4.4, 6.7, 8.9, 11.1, 13.3, 15.6, 17.8, 20 ] },
	flat: { name: 'Flat income deprivation profile', short: 'Flat', deciles: [ 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ] },
	nshape: { name: '\'n\'-shaped income deprivation profile', short: '\'n\'-shaped', deciles: [ 5.7, 7.1, 10, 12.9, 14.3, 14.3, 12.9, 10, 7.1, 5.7 ] }
};