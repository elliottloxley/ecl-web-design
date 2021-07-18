<template>
  <div ref="parent" class="line-path">
    <svg v-if="parentWidth > -1 && this.parentHeight > -1" class="line-svg" preserveAspectRatio="none"  :viewBox="`0 0 ${viewBoxWidth} ${viewBoxWidth}`">
      <path ref="linePath"
            :d="svgPath"
            vector-effect="non-scaling-stroke"
            :stroke="lineColour"
            :stroke-width="lineWidth + 'px'"
            :stroke-linejoin="lineJoin"
            :style="disableAnimation ? {} : {strokeDasharray: lineLength, strokeDashoffset: currentOffset,
                      transition: initialised ? `stroke-dashoffset ${animateTime}s ${showNodes ? 'linear' : transitionTimingFunction}` : ''}"></path>
    </svg>
    <svg v-if="parentWidth > -1 && this.parentHeight > -1" class="feather-node-svg" preserveAspectRatio="none" :viewBox="`0 0 ${parentWidth} ${parentHeight}`">
      <circle v-for="index in nodesToFeather"
              :key="index"
              :cx="relativePathCoords[index][0] + '%'"
              :cy="relativePathCoords[index][1] + '%'"
              :r="featherNodeRadius"
              fill="none"
              class="node-feather"
              :style="nodeFeatherStyle(index)"></circle>
    </svg>
    <div v-for="(node, index) in nodes"
         :key="index"
         class="node-container"
         :style="{left: `${node.coord[0]}%`, top: `${node.coord[1]}%`}">
      <transition appear :name="disableAnimation ? '' : 'node-grow'">
        <svg v-if="!node.disableDefault" :style="{width: nodeSize[0], height: nodeSize[1],
                 animationDelay: nodeAppearDelay}"
             :viewBox="`${(-nodeStrokeWidth/2) - 1} ${(-nodeStrokeWidth/2) - 1}
                 ${100 + (nodeStrokeWidth) + 2} ${100 + (nodeStrokeWidth) + 2}`"
             class="node-svg">
          <path
              :d="nodePath"
              :fill="nodeFillColour"
              :stroke-width="nodeStrokeWidth"
              stroke-linejoin="round"
              :stroke="nodeStrokeColour"></path>
        </svg>
      </transition>
      <slot :name="`nodeSlot${node.index}`">
      </slot>
    </div>
  </div>
</template>

<script lang="ts">

import pathingHelperFunctions, {Coordinate, CoordinatePath} from '@/mixins/pathingHelperFunctions'
import timingHelperFunctions from '@/mixins/timingHelperFunctions'
import uniqueId from '@/mixins/uniqueId'
import {debounce} from 'ts-debounce'
import {defineComponent, PropType} from 'vue'

interface NodeInfo {
  index: number,
  coord: Coordinate,
  disableDefault: boolean
}

export type FeatherOffset = {[index : string] : [number, number]}
export type NodeAdvance = {[index : number] : number}
export type NodeScale = {[index : number] : number}
export type NodeOffset = {[index : number] : Coordinate}

export default defineComponent({
  name: 'LinePath',
  mixins: [uniqueId, pathingHelperFunctions, timingHelperFunctions],
  data() {
    return {
      transitionString: '',
      viewBoxWidth: 100,
      viewBoxHeight: 100,
      featherID: 'featherNode' + this.getUniqueId(),
      nodes: [] as NodeInfo[],
      parentWidth: -1,
      parentHeight: -1,
      animateStart: false,
      initialised: false,
      resizeListener: null
    }
  },
  props: {
    pathCoords: {required: true, type: Array as PropType<CoordinatePath>}, //
    relativeCoord: {default: () => {return [0, 0]}, type: Array as unknown as PropType<Coordinate>}, //
    start: {default: true, type: Boolean as PropType<boolean>}, //
    disableAnimation: {default: false, type: Boolean as PropType<boolean>}, // disables all animation: shows nodes and full line on component load
    animateTime: {default: 1, type: Number as PropType<number>}, //
    lineWidth: {default: 10, type: Number as PropType<number>}, //
    roundedCorners: {default: false, type: Boolean as PropType<boolean>}, //
    lineColour: {default: 'white', type: String as PropType<string>},
    lineJoin: {default: 'round', type: String as PropType<string>},
    linePercent: {default: 1, type: Number as PropType<number>},
    showNodes: {default: false, type: Boolean as PropType<boolean>},
    excludedNodes: {default: () => {return []}, type: Array as PropType<number[]>}, // node indexes on path
    nodeShape: {default: () => {return [[50, 0], [100, 50], [50, 100], [0, 50]]}, type: Array as PropType<CoordinatePath>}, //
    nodeFillColour: {default: 'white', type: String as PropType<string>}, //
    nodeSize: {default: () => {return ['20px', '20px']}, type: Array as PropType<string[]>}, // array of css sizes eg. ['10px','10%']
    nodeStrokeWidth: {default: 0, type: Number as PropType<number>}, //
    nodeStrokeColour: {default: 'white', type: String as PropType<string>}, //
    animateDelay: {default: 0, type: Number as PropType<number>}, //
    nodeAppearDelay: {default: 0, type: Number as PropType<number>}, //
    nodeAdvanceAppear: {default: () => {return {}}, type: Object as PropType<NodeAdvance>}, // {'0': 0.5} {index : advance} index of node and advance in seconds
    transitionTimingFunction: {default: 'ease-in', type: String as PropType<string>}, // set to linear automatically if nodes are shown
    nodesToFeather: {default: () => {return []}, type: Array as PropType<number[]>}, // line will fade going into and out of nodes
    featherNodeRadius: {default: 3, type: Number as PropType<number>}, //
    customFeatherNodeScale: {default: () => {return {}}, type: Object as PropType<NodeScale>}, // {'0': 1.5} {index : scale}
    customFeatherNodeOffset: {default: () => {return {}}, type: Object as PropType<NodeOffset>}, // {'0': [25,50]}
    featherNodeScale: {default: 1, type: Number as PropType<number>} //
  },
  methods: {
    initialise() {
      const delay = this.disableAnimation ? 0 : this.animateDelay * 1000
      setTimeout(() => {
        this.animateStart = true
        if (this.showNodes) {
          this.initialiseNodes()
        }
      }, delay + 10)

      setTimeout(() => {this.initialised = true}, 10)
    },
    getNodeAdvance(index :number) {
      if (this.nodeAdvanceAppear[index]) {
        return this.nodeAdvanceAppear[index]
      }
      return 0
    },
    nodeShouldAppear(index :number) {
      return this.linePercent >= this.nodePercentages[index] && this.showNodes && !this.excludedNodes.includes(index)
    },
    nodeFeatherPath(index :number) {
      const halfWidth = this.featherNodeWidthHeight[0] / 2
      const halfHeight = this.featherNodeWidthHeight[1] / 2

      const x = this.relativePathCoords[index][0]
      const y = this.relativePathCoords[index][1]

      let path = `M${x - halfWidth},${y - halfHeight} M${x + halfWidth},${y - halfHeight} M${x + halfWidth},${y + halfHeight} M${x - halfWidth},${y + halfHeight} `

      // gets node direction vectors
      const beforeDirection = this.getNodeDirectionToOther(index, index - 1)
      const afterDirection = this.getNodeDirectionToOther(index, index + 1)

      if (beforeDirection.length !== 0) {
        path += `M${x},${y} l${beforeDirection[0] * halfWidth},${beforeDirection[1] * halfHeight} `
      }

      if (afterDirection.length !== 0) {
        path += `M${x},${y} l${afterDirection[0] * halfWidth},${afterDirection[1] * halfHeight} `
      }

      return path
    },
    nodeFeatherStyle(index :number) {
      let translate = ''

      if (index in this.customFeatherNodeOffset) {
        translate = `translate(${this.customFeatherNodeOffset[index][0]}%, ${this.customFeatherNodeOffset[index][1]}%)`
      }

      return {
        transform: `scale(${index in this.customFeatherNodeScale ? this.customFeatherNodeScale[index] : this.featherNodeScale}) ${translate}`,
        transition: this.disableAnimation ? '' : 'transform 0.5s'
      }
    },
    getNodeDirectionToOther(index :number, index2 :number) {
      if (this.pathCoords[index2]) {
        const direction :Coordinate = [this.pathCoords[index2][0] - this.pathCoords[index][0], this.pathCoords[index2][1] - this.pathCoords[index][1]]

        return this.getNormalisedVector(direction)
      } else {
        return []
      }
    },
    createNode(coord :Coordinate, coordIndex :number, nodeDelay :number) {
      const addNode = () => {
        if (this.nodeShouldAppear(coordIndex)) {
          this.nodes.push({index: coordIndex, coord: coord, disableDefault: false})
        } else if (`nodeSlot${coordIndex}` in this.$slots) {
          this.nodes.push({index: coordIndex, coord: coord, disableDefault: true})
        }
      }

      const emitNode = () => {
        this.$emit('reachednode', coordIndex)

        if (this.lastNodeIndex === coordIndex) {
          this.$emit('reachedlastnode')
        }
      }

      setTimeout(emitNode, nodeDelay * 1000)

      if (this.disableAnimation) {
        addNode()
      } else {
        setTimeout(addNode, (nodeDelay * 1000))
      }
    },
    initialiseNodes() {
      for(const index in this.nodeCoords) {
        const indexNum = parseInt(index)
        const delayAdvance = this.getNodeAdvance(indexNum)

        const delay = this.nodeDelays[indexNum] - delayAdvance
        this.createNode(this.nodeCoords[index].slice() as Coordinate, indexNum, delay)
      }
    },
    updateNodes() {
      this.nodes.splice(0)

      for(const index in this.nodeCoords) {
        const indexNum = parseInt(index)
        this.createNode(this.nodeCoords[index], indexNum, 0)
      }
    },
    featherNodeSvgViewbox() {
      return `0 0 ${this.parentWidth} ${this.parentHeight}`
    },
    onResize() {
      this.parentWidth = (this.$refs.parent as HTMLElement).clientWidth
      this.parentHeight = (this.$refs.parent as HTMLElement).clientHeight
    }
  },
  computed: {
    svgPath() :string {
      let path = `M${this.relativePathCoords[0][0]},${this.relativePathCoords[0][1]}`

      for(let i = 1; i < this.relativePathCoords.length; i++) {
        path += `L${this.relativePathCoords[i][0]},${this.relativePathCoords[i][1]}`
      }

      return path
    },
    nodePath() :string {
      let path = `M${this.nodeShape[0][0]},${this.nodeShape[0][1]}`

      for(let i = 1; i < this.nodeShape.length; i++) {
        path += `L${this.nodeShape[i][0]},${this.nodeShape[i][1]}`
      }

      path += 'z'

      return path
    },
    relativePathCoords() :CoordinatePath {
      const relativeCoords :CoordinatePath = []

      for(let i = 0; i < this.pathCoords.length; i++) {
        const coord :Coordinate = [this.pathCoords[i][0] + this.relativeCoord[0], this.pathCoords[i][1] + this.relativeCoord[1]]
        relativeCoords.push(coord)
      }

      return relativeCoords
    },
    timePerPathSegment() :number[] {
      return this.getTimePerPathSegmentScaled(this.absolutePathCoords, this.lineLength, this.animateTime)
    },
    nodeDelays() :number[] {
      let total = 0
      const nodeTimes = [0]

      for(let i = 0; i < this.timePerPathSegment.length; i++) {
        total += this.timePerPathSegment[i]
        nodeTimes.push(total)
      }

      return nodeTimes
    },
    absolutePathCoords() :CoordinatePath {
      const coords :CoordinatePath = []

      for(let i = 0; i < this.relativePathCoords.length; i++) {
        coords.push([(this.relativePathCoords[i][0] / 100) * this.parentWidth,
          (this.relativePathCoords[i][1] / 100) * this.parentHeight])
      }

      return coords
    },
    lineLengthBeforeScale() :number {
      const pathProperties = this.getPropertiesFromPathString(this.svgPath)
      return pathProperties.getTotalLength()
    },
    lineLength() :number {
      return this.lineLengthBeforeScale * this.scaleMultiplier
    },
    currentOffset() :number {
      return (this.animateStart ? (this.lineLength * (1 - this.linePercent)) : this.lineLength)
    },
    scaleMultiplier() :number {
      return Math.max(this.parentWidth, this.parentHeight) / this.viewBoxWidth
    },
    lastNodeIndex() :number {
      return this.pathCoords.length - 1
    },
    nodeCoords() :{[index :number] : Coordinate} {
      const coords :{[index :number] : Coordinate} = {}

      for(let i = 0; i < this.relativePathCoords.length; i++) {
        coords[i] = this.relativePathCoords[i].slice() as Coordinate
      }

      return coords
    },
    nodePercentages() :number[] {
      return this.getPercentDistanceOfEachNode(this.relativePathCoords)
    },
    featherNodeWidthHeight() :[number, number] {
      const radiusPercent = (this.featherNodeRadius / 1000)

      return [radiusPercent * this.parentHeight, radiusPercent * this.parentWidth]
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.parentWidth = (this.$refs.parent as HTMLElement).clientWidth
      this.parentHeight = (this.$refs.parent as HTMLElement).clientHeight
      if (this.start) {
        this.initialise()
      }
    })
  },
  created() {
    window.addEventListener('resize', debounce(() => {this.onResize()}, 200))
  },
  watch: {
    linePercent() {
      if (this.start) {
        this.updateNodes()
      }
    },
    showNodes() {
      if (this.start) {
        this.updateNodes()
      }
    },
    start(val) {
      if (val) {
        this.initialise()
      }
    }
  }
})
</script>

<style lang="scss" scoped>

.line-path {
  position: relative;
}

.line-svg {
  width: 100%;
  height: 100%;
}

.node-container {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transform: translate(-50%, -50%);
}

.node-svg {
  display: inline-block;
}

.node-feather {
  transform-origin: 50% 50%;
  transform-box: fill-box;
  fill: url(#featherGradient);
}

.feather-node-svg {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.node-transition-disable {
  animation: none !important;
}

.line-svg path {
  fill: none;
}

.node-grow-enter-active {
  animation: nodeAppearGrow 0.5s;
}

@keyframes nodeAppearGrow {
  0% {
    transform: rotate(-90deg) scale(0.01);
  }

  70% {
    transform: rotate(45deg) scale(1.3);
  }

  100% {
    transform: rotate(0deg) scale(1);
  }
}
</style>
