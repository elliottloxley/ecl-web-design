<template>
<div :class="{[alignmentClass] : true}" class="text-with-connector">
  <div class="connector-path-container"
       ref="parent"
       :style="gapObject">
    <line-path class="connector"
               @reachedlastnode="displaySlot = true"
               :parent-dimensions="parentDimensions"
               :show-nodes="true"
               :line-colour="connectorStroke"
               :excluded-nodes="[0]"
               :node-size="nodeSize"
               :node-fill-colour="connectorStroke"
               :animate-time="lineAppearTime"
               :animate-delay="lineAppearDelay"
               :transition-timing-function="'ease-in'"
               :line-width="1.5"
               :path-coords="connectorPath">
    </line-path>
  </div>
  <transition appear name="connector-node">
    <svg class="connector-node" viewBox="0 0 100 100" >
      <circle r="45" cx="50" cy="50" :stroke="connectorStroke" :stroke-width="connectorStrokeWidth" :fill="connectorFill"></circle>
    </svg>
  </transition>
  <div class="spacer"></div>
  <transition appear :name="textEnterClass">
    <div v-if="displaySlot" class="connector-text">
      <slot name="content">
        default
      </slot>
    </div>
  </transition>
  <div class="spacer-sm"></div>
  <transition appear name="after-node">
    <svg v-if="displaySlot" class="after-node" viewBox="-1 -1 102 102" :style="{width: nodeSize[0], height: nodeSize[1]}">
      <path d="M50,0L100,50L50,100L0,50z" :fill="connectorStroke" stroke-linejoin="round"></path>
    </svg>
  </transition>
</div>
</template>

<script lang="ts">
import LinePath from '@/components/All Pages/LinePath.vue'
import {Directions} from '@/components/All Pages/LineButtonWithPaths.vue'
import {defineComponent, PropType} from 'vue'
import {Coordinate} from '@/mixins/pathingHelperFunctions'

export default defineComponent({
  name: 'TextWithConnector',
  components: {LinePath},
  data() {
    return {
      parentDimensions: [] as number[],
      nodeSlotNode: 'nodeSlot0',
      nodeSlotText: 'nodeSlot1',
      displaySlot: false,
      nodeSize: ['8px', '8px'] as string[]
    }
  },
  props: {
    entryDirection: {default: Directions.LEFT, type: String as PropType<Directions>}, //
    connectorGap: {default: 20, type: Number as PropType<number>}, // gap between connector and text in percent
    enableEnterAnimation: {default: true, type: Boolean as PropType<boolean>}, //
    contentDistance: {default: 15, type: Number as PropType<number>}, //
    connectorFill: {default: 'white', type: String as PropType<string>}, //
    connectorStroke: {default: 'white', type: String as PropType<string>}, //
    connectorStrokeWidth: {default: 10, type: Number as PropType<number>}, //
    lineAppearTime: {default: 0.5, type: Number as PropType<number>}, //
    lineAppearDelay: {default: 0.1, type: Number as PropType<number>} //
  },
  computed: {
    connectorPath() :Coordinate[] {
      switch (this.entryDirection) {
      case Directions.LEFT:
        return [[0, 50], [100, 50]]
      case Directions.RIGHT:
        return [[100, 50], [0, 50]]
      case Directions.TOP:
        return [[50, 0], [50, 100]]
      case Directions.BOTTOM:
        return [[50, 100], [50, 0]]
      }

      return []
    },
    gapObject() :{[key :string] :string} {
      const key :string = this.entryDirection === Directions.LEFT || this.entryDirection === Directions.RIGHT ? 'width' : 'height'
      return {[key]: `${this.connectorGap}px`}
    },
    alignmentClass() :string {
      return 'from-' + this.entryDirection
    },
    textEnterClass() :string {
      return `connector-${this.entryDirection}-text`
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.parentDimensions = [(this.$refs.parent as HTMLElement).offsetWidth, (this.$refs.parent as HTMLElement).offsetHeight]
    })
  }
})
</script>

<style lang="scss" scoped>

.text-with-connector {
  display: flex;
}

.from-left {
  align-items: center;
  flex-direction: row;
  transform: translateX(50%);
}

.from-right {
  align-items: center;
  flex-direction: row-reverse;
  transform: translateX(-50%);
}

.from-top {
  justify-content: center;
  flex-direction: column;
  transform: translateY(50%);
}

.from-bottom {
  justify-content: center;
  flex-direction: column-reverse;
  transform: translateY(-50%);
}

.from-left .connector-node {
  top: 50%;
  left: 0;
  transform: translate(-50%, -50%) scale(1);
}

.from-right .connector-node {
  top: 50%;
  right: 0;
  transform: translate(50%, -50%) scale(1);
}

.from-top .connector-node {
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
}

.from-bottom .connector-node {
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 50%) scale(1);
}

.spacer {
  width: 17px;
  height: 10px;
}

.spacer-sm {
  width: 13px;
  height: 8px;
}

.connector-text {
  opacity: 1;
  text-align: center;
  background-color: rgba(0,0,0,0.7);
  transition: transform 1s 0.1s, opacity 0.8s 0.1s;
}

.connector-path-container {
  min-height: 3px;
  min-width: 3px;
}

.connector-node {
  position: absolute;
  width: 12px;
  height: 12px;
  transition: transform 0.5s;
}

.connector {
  display: flex;
  width: 100%;
  height: 100%;
}

.after-node {
  transition: transform 0.5s 0.8s;
}

.after-node-enter {
  transform: rotate(-180deg) scale(0.1);
}

.connector-node-enter {
  transform: translate(-50%,-50%) scale(0.1) !important;
}

$translateMagnitude: 5%;

.connector-left-text-enter {
  opacity: 0;
  transform: translateX(-$translateMagnitude);
}

.connector-top-text-enter {
  opacity: 0;
  transform: translateY(-$translateMagnitude);
}

.connector-right-text-enter {
  opacity: 0;
  transform: translateX($translateMagnitude);
}

.connector-bottom-text-enter {
  opacity: 0;
  transform: translateY($translateMagnitude);
}

</style>
