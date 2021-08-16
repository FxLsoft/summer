<template>
	<div ref="item" class="vue-grid-item">
		<slot></slot>
	</div>
</template>

<script lang="ts">
	import { defineComponent } from 'vue';

	export default defineComponent({
		name: 'GridItem',
		props: {
			isDraggable: {
				type: Boolean,
				required: false,
				default: null
			},
			isResizable: {
				type: Boolean,
				required: false,
				default: null
			},
			static: {
				type: Boolean,
				required: false,
				default: false
			},
			minH: {
				type: Number,
				required: false,
				default: 1
			},
			minW: {
				type: Number,
				required: false,
				default: 1
			},
			maxH: {
				type: Number,
				required: false,
				default: Infinity
			},
			maxW: {
				type: Number,
				required: false,
				default: Infinity
			},
			x: {
				type: Number,
				required: true
			},
			y: {
				type: Number,
				required: true
			},
			w: {
				type: Number,
				required: true
			},
			h: {
				type: Number,
				required: true
			},
			i: {
				required: true
			},
			dragIgnoreFrom: {
				type: String,
				required: false,
				default: 'a, button'
			},
			dragAllowFrom: {
				type: String,
				required: false,
				default: null
			},
			resizeIgnoreFrom: {
				type: String,
				required: false,
				default: 'a, button'
			},
			preserveAspectRatio: {
				type: Boolean,
				required: false,
				default: false,
			}
		},
		setup(props) {


			return {}
		}
	})
</script>

<style scoped>
</style>