# Exploring local income deprivation
This is a code respository for a scrollytelling article published by the Office for National Statistics. The article can be [read here](https://www.ons.gov.uk/visualisations/dvc1371/).

[![CExploring local income deprivation article](https://onsvisual.github.io/income-scrolly/img/screenshot.png)](https://www.ons.gov.uk/visualisations/dvc1371/)

The article was built using the [Svelte](https://svelte.dev/) javascript framework, [Mapbox GL JS (v1)](https://docs.mapbox.com/mapbox-gl-js/api/)* and the [Layer Cake](https://layercake.graphics/) charting library. It is based on [this scrollytelling template](https://github.com/ONSvisual/svelte-scrolly/), which is probably a better starting point for building/hacking your own scrollytelling projects. (This repository is shared "as is", without any detailed documentation.)

(*Note that Mapbox GL JS v2 is no longer open source. This repository relies on v1.13.1. [MapLibre GL](https://github.com/maplibre/maplibre-gl-js), an open source fork of Mapbox GL JS v1 with ongoing community support, is also available.)

## Running and hacking this code

:warning: **This code is published in full as a learning tool. Please remove the content and ONS branding from anything you intend to publish based on this code.**

The easiest way to make a local copy of this repository is using **degit**, which you can install it using NPM.

```bash
npm install -g degit
```

Run the following command to clone this repository (replace `your-project` with a name for your project folder).

```bash
degit ONSvisual/income-scrolly your-project
```

Next, open the folder and install the dependencies to get started.

```bash
cd your-project
npm install
```

Note that the code that you'll want to edit is mostly contained wihthin the `src` folder, as well as the static files within the `public` folder.

You can then start a local development server to see live changes as you edit the code. It will run on <http://localhost:5000/> and should update every time you save changes to a file.

```bash
npm run dev
```

Finally. When you're done creating your project, you can compile it. (You'll find the compiled code in the `public` folder). Note that this also builds a legacy version of the code that is compatible with IE 11.

```bash
npm run build
```
