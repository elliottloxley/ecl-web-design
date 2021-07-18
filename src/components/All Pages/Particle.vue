<template>
<div v-show="show" class="particle"
     :class="{'particle-fixed' : useFixedPositioning, 'end-colour' : colourChange}"
     :style="particleStyle">
</div>
</template>

<script lang="ts">
import pathingHelperFunctions, {
  Coordinate3D,
  CoordinatePath,
  Coordinate,
  CoordinatePath3D
} from '@/mixins/pathingHelperFunctions'
import {defineComponent, PropType} from 'vue'

export default defineComponent({
  name: 'Particle',
  mixins: [pathingHelperFunctions],
  data() {
    return {
      currentPosition: !this.enablePathMode ? this.startPoint3d : [(this.pathCoords[0][0] / 100) * this.parentDimensions[0],
        (this.pathCoords[0][1] / 100) * this.parentDimensions[1],
        (this.pathCoords[0][2] / 100) * this.parentDimensions[2]],
      driftIntervalHandle: -1,
      opacityTime: 0,
      currentPathMoveTime: 0,
      disableTransition: false,
      pathFirstMove: true,
      show: true,
      colourChange: false,
      enablePathMode: false, // experimental
      pathCoords: [[0, 0, 0]] as CoordinatePath3D
    }
  },
  props: {
    startPoint3d: {required: true, type: Array as unknown as PropType<Coordinate3D>, validator(value :Coordinate3D) {return value.length === 3}}, // 3d coordinate
    endPoint3d: {default: () => {return [50, 50, 0]}, type: Array as unknown as PropType<Coordinate3D>, validator(value :Coordinate3D) {return value.length === 3}},
    parentDimensions: {required: true, type: Array as unknown as PropType<Coordinate3D>, validator(value :Coordinate3D) {return value.length === 3}},
    id: {required: true, type: Number as PropType<number>}, //
    lifetime: {required: true, type: Number as PropType<number>}, // in seconds, -1 for infinite
    hangTime: {default: 0, type: Number as PropType<number>}, // in percent of life
    moveTime: {default: 0.5, type: Number as PropType<number>}, // in percent of life
    widthHeight: {default: () => {return [10, 10]}, type: Array as unknown as PropType<Coordinate>}, // in pixels
    startColour: {default: 'white', type: String as PropType<string>},
    endColour: {default: '', type: String as PropType<string>},
    colourTime: {default: 0, type: Number as PropType<number>}, // in percent of life
    endPointAttractMagnitude: {default: 1, type: Number as PropType<number>},
    enableDriftMode: {default: false, type: Boolean as PropType<boolean>},
    driftMaxMagnitude: {default: 0.1, type: Number as PropType<number>},
    driftInterval: {default: 0.1, type: Number as PropType<number>},
    driftTiming: {default: 0.1, type: Number as PropType<number>},
    pathTimings: {default: () => {return [0.1]}, type: Array as PropType<number[]>}, //
    nodeDelays: {default: () => {return [0]}, type: Array as PropType<number[]>}, //
    pathUseSeconds: {default: false, type: Boolean as PropType<boolean>}, // whether path timings should use seconds rather than proportions of lifetime
    pathBackToStart: {default: false, type: Boolean as PropType<boolean>}, // whether the particle paths backwards to start position at end of path
    enablePathConsistentSpeed: {default: false, type: Boolean as PropType<boolean>}, // ignores path timings, instead ensures a consistent speed along the whole path
    consistentSpeedPathTime: {default: 0, type: Number as PropType<number>}, // used with enablePathConsistentSpeed, time for the particle to complete one path cycle
    consistentSpeedNodeDelay: {default: 0, type: Number as PropType<number>}, // used with enablePathConsistentSpeed, delay before traveling between each node
    transitionTimingFunction: {default: 'ease-out', type: String as PropType<string>},
    enterExitTransitionTiming: {default: 0.5, type: Number as PropType<number>},
    useFixedPositioning: {default: false, type: Boolean as PropType<boolean>} //
  },
  computed: {
    cssVars() :{[key :string] : string} {
      return {
        '--start-colour': this.startColour,
        '--end-colour': this.endColour,
        '--move-time': `${this.enablePathMode ? this.currentPathMoveTime : this.moveTimeSeconds}s`,
        '--hang-time': `${this.enablePathMode ? 0 : this.hangTimeSeconds}s`,
        '--timing-function': this.transitionTimingFunction,
        '--background-color-time': `${this.colourTimeSeconds}s`,
        '--transition-time': `${this.enterExitTransitionTiming}s`,
        '--width': this.widthHeight[0] + 'px',
        '--height': this.widthHeight[1] + 'px'
      }
    },
    particleStyle() :Partial<CSSStyleDeclaration> {
      return {
        ...this.cssVars,
        transform: `translate3d(${this.currentPosition[0] - (this.widthHeight[0] / 2)}px,
        ${this.currentPosition[1] - (this.widthHeight[1] / 2)}px, ${this.currentPosition[2]}px)`
      }
    },
    hangTimeSeconds() :number {
      return this.lifetime * this.hangTime
    },
    moveTimeSeconds() :number {
      if (!this.enableDriftMode) {
        return this.lifetime * this.moveTime
      } else {
        return this.lifetime * this.driftInterval
      }
    },
    colourTimeSeconds() :number {
      return this.lifetime * this.colourTime
    },
    driftTimingSeconds() :number {
      return this.lifetime * this.driftTiming
    },
    distanceToEndPoint() :Coordinate3D {
      return [this.endPoint3d[0] - this.startPoint3d[0], this.endPoint3d[1] - this.startPoint3d[1], this.endPoint3d[2] - this.startPoint3d[2]]
    },
    pathConsistentTimeFullDuration() :number {
      return this.consistentSpeedPathTime + (this.consistentSpeedNodeDelay * this.pathCoords.length)
    },
    pathLength() :number {
      return this.pathDistance(this.pathConvertTo2D(this.pathCoords)) * this.scaleMultiplier
    },
    scaleMultiplier() :number {
      return Math.max(this.parentDimensions[0], this.parentDimensions[1]) / 100
    },
    pathTimingsConsistent() :number[] {
      return this.getTimePerPathSegmentScaled(this.pathConvertTo2D(this.absolutePathCoords), this.pathLength, this.consistentSpeedPathTime)
    },
    pathStartCoord() :Coordinate3D {
      const coord = this.pathCoords[0].slice(0) as Coordinate3D
      coord[0] = (coord[0] / 100) * this.parentDimensions[0]
      coord[1] = (coord[1] / 100) * this.parentDimensions[1]
      coord[2] = (coord[2] / 100) * this.parentDimensions[2]
      return coord
    },
    absolutePathCoords() :CoordinatePath3D {
      const coords :Coordinate3D[] = []

      for(let i = 0; i < this.pathCoords.length; i++) {
        coords.push([(this.pathCoords[i][0] / 100) * this.parentDimensions[0],
          (this.pathCoords[i][1] / 100) * this.parentDimensions[1],
          (this.pathCoords[i][2] / 100) * this.parentDimensions[2]])
      }

      return coords
    }
  },
  methods: {
    randomNegativePositive(val :number) :number {
      return val * (Math.floor(Math.random() * 2) === 1 ? 1 : -1)
    },
    randomBetweenValues(min :number, max :number) :number {
      return Math.random() * (max - min) + min
    },
    randomNegativePositiveRange(range :number) :number {
      return this.randomNegativePositive(Math.random() * range)
    },
    driftMove() {
      this.currentPosition.splice(0, 1, this.currentPosition[0] + (this.randomNegativePositiveRange(this.driftMaxMagnitude)))
      this.currentPosition.splice(1, 1, this.currentPosition[1] + (this.randomNegativePositiveRange(this.driftMaxMagnitude)))
      this.currentPosition.splice(2, 1, this.currentPosition[2] + (this.randomNegativePositiveRange(this.driftMaxMagnitude)))
    },
    getCoordTiming(index :number, reverse = false) :number {
      const timings = this.enablePathConsistentSpeed ? this.pathTimingsConsistent : this.pathTimings
      const newIndex = index + (reverse ? 0 : -1)

      return timings[newIndex]
    },
    pathMove(pathIndex :number, reverse = false) {
      setTimeout(() => {
        this.currentPathMoveTime = this.getCoordTiming(pathIndex, reverse)

        this.currentPosition.splice(0, 1, this.parentDimensions[0] * (this.pathCoords[pathIndex][0] / 100))
        this.currentPosition.splice(1, 1, this.parentDimensions[1] * (this.pathCoords[pathIndex][1] / 100))
        this.currentPosition.splice(2, 1, this.parentDimensions[2] * (this.pathCoords[pathIndex][2] / 100))

        setTimeout(() => {
          if (pathIndex < this.pathCoords.length - 1 && !reverse) {
            this.pathMove(pathIndex + 1)
          } else if (this.pathBackToStart && pathIndex > 0) {
            this.pathMove(pathIndex - 1, true)
          } else {
            this.show = false
          }
        }, (this.getCoordTiming(pathIndex, reverse)) * (this.pathUseSeconds ? 1 : this.consistentSpeedPathTime ? 1 : this.lifetime) * 1000)
      }, this.nodeDelays[pathIndex] ? (this.pathUseSeconds ? 1 : this.lifetime) * 1000 : 0)
    },
    resetToPathStart() {
      this.currentPathMoveTime = 0

      this.currentPosition.splice(0, 1, this.pathStartCoord[0])
      this.currentPosition.splice(1, 1, this.pathStartCoord[1])
      this.currentPosition.splice(2, 1, this.pathStartCoord[2])
    }
  },
  mounted() {
    setTimeout(() => {
      if (this.enableDriftMode) {
        this.driftMove()
        this.driftIntervalHandle = setInterval(this.driftMove, this.driftInterval * this.lifetime * 1000)
      } else if (this.enablePathMode) {
        this.resetToPathStart()
        setTimeout(() => {this.pathMove(1)}, this.hangTime * 1000)
      } else {
        this.currentPosition.splice(0, 1, this.currentPosition[0] + (this.distanceToEndPoint[0] * this.endPointAttractMagnitude))
        this.currentPosition.splice(1, 1, this.currentPosition[1] + (this.distanceToEndPoint[1] * this.endPointAttractMagnitude))
        this.currentPosition.splice(2, 1, this.currentPosition[2] + (this.distanceToEndPoint[2] * this.endPointAttractMagnitude))
      }

      if (this.endColour !== '') {
        this.colourChange = true
      }
    }, 10)

    if (this.lifetime >= 0) {
      setTimeout(() => {
        this.$emit('lifeend', this.id)
      }, this.lifetime * 1000)
    }
  },
  beforeUnmount() {
    if (this.driftIntervalHandle) {
      clearInterval(this.driftIntervalHandle)
    }
  }
})
</script>

<style lang="scss" scoped>

.particle {
  position: absolute;
  pointer-events: none;
  border-radius: 1000px;
  width: var(--width);
  height: var(--height);
  background-color: var(--start-colour);
  transition: transform var(--move-time) var(--hang-time) var(--timing-function),
    background-color var(--background-color-time), width var(--transition-time),
    height var(--transition-time),
    opacity var(--transition-time);
}

.particle-fixed {
  position: fixed;
}

.end-colour {
  background-color: var(--end-colour);
}

</style>
