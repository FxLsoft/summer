<template>
	<div class="view-board">
		Hello ViewBoard {{ vm.id }}
		<h3>{{ title }}</h3>
		<button @click="testImage()">图片测试</button>
		<Chart :option="option" />
		<div class="list" ref="list">
			<div class="right-bar">
				<div class="bar-inner"></div>
			</div>
		</div>
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
			let parentEl = this.$refs.list;
			let rect = parentEl.getBoundingClientRect();
			let parentHeight = rect.height;
			let itemHeight = 60;
			let itemNumber = 10000;
			let clientHeight = itemHeight * itemNumber;
			let bar = parentEl.querySelector('.bar-inner');
			let barHeight = Math.max(parentHeight * parentHeight / (itemHeight * itemNumber), 20);
            if (barHeight > parentHeight) {
                barHeight = parentHeight;
            }
			bar.style.height = barHeight + 'px';
			let mouseY = -1;
			let offsetY = 0;
			let divPool: HTMLElement[] = [];
			let poolSize = Math.ceil(parentHeight / itemHeight * 1.2);
			for (let i = 0; i < poolSize; i++) {
				let div = document.createElement('div');
				div.classList.add('item-pool');
                div.innerText = String(i);
                div.style.display = 'none';
				divPool.push(div);
				parentEl.appendChild(div);
			}
			function render() {
                let itemOffsetY = offsetY / ((parentHeight - barHeight) || 1) * (clientHeight - parentHeight);
				let start = Math.floor(itemOffsetY / itemHeight);
				let end = Math.floor((itemOffsetY + parentHeight) / itemHeight);
                if (end > itemNumber) {
                    end = itemNumber;
                }
                for(let i = start; i <= end; i++) {
                    let index = i - start;
                    let div = divPool[index];
                    let transformY = -itemOffsetY + i * itemHeight;
                    div.innerText = String(i);
                    div.style.transform = `translateY(${transformY}px)`;
                    div.style.display = '';
                }
                for (let i = end + 1; i < divPool.length; i++) {
                    let div = divPool[i];
                    div.style.display = 'none';
                }
                
			}
			bar.addEventListener('mousedown', (e: MouseEvent) => {
				mouseY = e.clientY;
				// console.log('mousedown', e);
			});
			document.addEventListener('mousemove', (e: MouseEvent) => {
				if (mouseY === -1) return;
				// console.log('mousemove', e);
				offsetY = (e.clientY - mouseY) + offsetY;
				if (offsetY < 0) {
					offsetY = 0;
				}
				if (offsetY > parentHeight - barHeight) {
					offsetY = parentHeight - barHeight;
				}
				mouseY = e.clientY;
				bar.style.transform = `translateY(${offsetY}px)`;
				render();
			});
			document.addEventListener('mouseup', (e: MouseEvent) => {
				console.log('mouseup', e);
				mouseY = -1;
			});
            render();
		},
		methods: {
			testImage() {
				this.vm.testImage();
			}
		}
	})

</script>

<style lang="scss">
	.view-board {
		height: 100%;
		width: 100%;
		:deep(.chart) {
			height: 300px;
			width: 500px;
		}
		h3 {
			font-weight: bold;
			color: red;
		}
        .chart {
            width: 400px;
			height: 300px;
        }
		.list {
			width: 300px;
			height: 400px;
			border: 1px solid #ccc;
			border-radius: 5px;
			margin: 10px;
			position: relative;
            overflow: hidden;
			.item-pool {
				height: 60px;
				width: 100%;
				color: blue;
                display: flex;
                align-items: center;
                justify-content: center;
                position: absolute;
                border-bottom: 1px solid #eee;
                cursor: pointer;
                &:hover {
                    background-color: #eee;
                }
			}
			.right-bar {
				position: absolute;
                z-index: 200;
				right: 0;
				width: 6px;
				height: 100%;
				border-radius: 4px;
				background: rgba(200, 200, 200, 0.1);
				box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.01);
				&:hover {
					background: rgba(150, 150, 150, 0.1);
					box-shadow: inset 0 0 1px #ccc;
				}
			}
			.bar-inner {
				background: rgba(150, 150, 150, 0.1);
				box-shadow: inset 0 0 4px #ccc;
				border-radius: 10px;
				width: 100%;
				height: 100%;
				cursor: pointer;
				&:hover {
					background: rgba(150, 150, 150, 0.5);
					box-shadow: inset 0 0 4px #aaa;
				}
			}
		}
	}
</style>