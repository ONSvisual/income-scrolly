import { feature } from 'topojson-client';
import { csvParse, autoType } from 'd3-dsv';

export function setColors(themes, theme) {
  for (let color in themes[theme]) {
    document.documentElement.style.setProperty('--' + color, themes[theme][color]);
  }
}

export async function getData(url) {
  let response = await fetch(url);
  let string = await response.text();
	let data = await csvParse(string, autoType);
  return data;
}

export async function getTopo(url, layer) {
  let response = await fetch(url);
  let topojson = await response.json();
	let geojson = await feature(topojson, layer);
  return geojson;
}

export function suffixer(integer) {
  let units = integer % 10;
  return units == 1 ? 'st' : units == 2 ? 'nd' : units == 3 ? 'rd' : 'th';
}