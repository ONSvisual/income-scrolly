<script>
  export let color = "black";
  export let animation = true;

  const colors = ["black", "white"];

  color = colors.includes(color) ? color : "black";
</script>

<img src="./img/scroll-down-{color}.svg" class="arrow" class:bounce={animation} alt="" aria-hidden="true"/><slot></slot>

<style>
	.arrow {
		width: 48px;
		height: 48px;
		margin-right: 10px;
	}
	.bounce {
		-webkit-animation-duration: 2s;
		        animation-duration: 2s;
		-webkit-animation-iteration-count: infinite;
		        animation-iteration-count: infinite;
		-webkit-animation-name: bounce;
		        animation-name: bounce;
		-webkit-animation-timing-function: ease;
		        animation-timing-function: ease;
	}
	@-webkit-keyframes bounce {
		0%   { -webkit-transform: translateY(10px); transform: translateY(10px); }
		30%  { -webkit-transform: translateY(-10px); transform: translateY(-10px); }
		50%  { -webkit-transform: translateY(10px); transform: translateY(10px); }
		100% { -webkit-transform: translateY(10px); transform: translateY(10px); }
	}
	@keyframes bounce {
		0%   { -webkit-transform: translateY(10px); transform: translateY(10px); }
		30%  { -webkit-transform: translateY(-10px); transform: translateY(-10px); }
		50%  { -webkit-transform: translateY(10px); transform: translateY(10px); }
		100% { -webkit-transform: translateY(10px); transform: translateY(10px); }
	}
</style>