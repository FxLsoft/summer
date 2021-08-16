<template>
	<div class="view-board">
		Hello ViewBoard {{ vm.id }}
		<h3>{{ title }}</h3>
		<button @click="testImage()">图片测试</button>
		<Chart :option="option" />
	</div>
</template>

<script lang="ts">
	import { ViewBoard } from './ViewBoard';
	import { defineComponent } from 'vue';
	import Chart from '@/components/Chart.vue';

	export default defineComponent({
		name: 'ViewBoard',
		components: {
			Chart
		},
		props: {
			vm: {
				type: ViewBoard
			},
		},
		setup(props) {
			let viewBoard = props.vm;
			// viewBoard.testImage();
		},
		data() {
			return {
				title: 'View',
				option: {
					tooltip: {
						show: true,
						axisPointer: {
							type: "line"
						},
						trigger: "axis"
					},
					grid: {
						top: "2%",
						left: "2%",
						bottom: "2%",
						right: "2%",
						containLabel: true
					},
					xAxis: {
						type: 'category',
						data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
					},
					yAxis: {
						type: 'value'
					},
					series: [{
						data: [120, 200, 150, 80, 70, 110, 130],
						type: 'bar',
						showBackground: true,
						backgroundStyle: {
							color: 'rgba(180, 180, 180, 0.2)'
						}
					}]
				}
			}
		},
		mounted() {

		},
		methods: {
			testImage() {
				this.vm.testImage();
			}
		}
	})

</script>

<style lang="scss" scoped>
	.view-board {
		height: 100%;
		width: 100%;
        :deep(.chart) {
            height: 300px;
            width: 500px;
        }
	}
	h3 {
		font-weight: bold;
		color: red;
	}
</style>