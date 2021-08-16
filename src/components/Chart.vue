<template>
	<div class="chart"></div>
</template>

<script lang="ts">
	// import * as echarts from "echarts";
	import { _ } from '@/core/utils';
	import { EChartsType } from 'echarts';
	import { defineComponent } from 'vue';

    // Echart 单独打包
	const proxyEchart = () => import("echarts");

	export default defineComponent({
		name: "Chart",
		props: {
			option: {
				type: Object,
				default: function () {
					return {};
				}
			},
			isEmpty: {
				type: Boolean,
				default: false
			},
			theme: {
				type: String,
				default: ''
			}
		},
		data() {
			return {};
		},
		watch: {
			option: {
				deep: true,
				handler(val) {
					console.log("chart -> change")
					this.resetChart();
				}
			}
		},
		mounted() {
			proxyEchart().then(echarts => {
				this.init(echarts);
			})
		},
		methods: {
			init(echarts: any) {
				let _self = this;
				let echart = echarts.init(this.$el, this.theme) as EChartsType;
				echart.on("click", function (params: any) {
					_self.$emit("click", params);
				});
				echart.on("contextmenu", function (params: any) {
					_self.$emit("contextmenu", params);
				});
				echart.setOption(this.option, true);
				window.addEventListener("resize", this.resizeChart);
				this.resetChart = _.throttle(this.resetChart, 200);
				this.echart = echart;

                this.$emit('init');
			},
			resetChart() {
				if (this.isEmpty) return;
				if (this.echart) {
					this.echart.clear();
					this.resizeChart();
					this.echart.setOption(this.option, true);
				}
			},
			resizeChart() {
				let echart = this.echart as EChartsType;
				if (echart) {
					let rect = echart.getDom().getBoundingClientRect();
					if (rect.width <= 0 || rect.height <= 0) return;
					if (
						(rect.width !== echart.getWidth()) ||
						(rect.height !== echart.getHeight())
					) {
						echart.resize();
					}
				}
			}
		},
		beforeDestroy() {
			if (this.echart) {
				this.echart.dispose();
			}
			window.removeEventListener("resize", this.resetChart);
		}
	});
</script>

<style lang="scss" scoped>
	.chart {
		height: 100%;
		width: 100%;
	}
</style>
