<template>
<div ref="particleParent" class="particle-cloud"
     :style="{filter: enableMergeFilter ? 'url(#connectElementsSmall)' : '',
     perspective: `${parentPerspective}px`,
     perspectiveOrigin: perspectiveOrigin}">
  <transition-group
    appear
    :enter-class="appearClass"
    :leave-active-class="leaveActiveClass">
    <particle v-for="particle in particleCoords"
              class="particle"
              :id="particle.id"
              :use-fixed-positioning="particleUseFixedPositioning"
              :key="particle.id"
              :width-height="[particleWidth, particleHeight]"
              :start-point3d="startPoint(particle)"
              :end-point3d="endPoint(particle)"
              :lifetime="particle.lifetime"
              :enable-drift-mode="enableParticleDriftMode"
              :transition-timing-function="transitionTimingFunction"
              :move-time="particleMoveTime"
              :hang-time="particleHangTime"
              :start-colour="particleStartColour"
              :end-colour="particleEndColour"
              :colour-time="particleColourTime"
              :drift-max-magnitude="particleDriftMaxMagnitude"
              :drift-interval="particleDriftInterval"
              :drift-timing="particleDriftTiming"
              :enter-exit-transition-timing="particleEnterExitTiming"
              :parent-dimensions="[toPixelsWidth(100), toPixelsHeight(100), toPixelsDepth(100)]">
    </particle>
  </transition-group>
</div>
</template>

<script lang="ts">
import uniqueIdMixin from '@/mixins/uniqueId'
import Particle from '@/components/All Pages/Particle.vue'
import {Coordinate3D, Coordinate} from '@/mixins/pathingHelperFunctions'
import {defineComponent, PropType} from 'vue'

export interface ParticleInfo {
  startX: number,
  startY: number,
  startZ: number,
  endX: number,
  endY: number,
  endZ: number,
  lifetime: number,
  id: number
}
export type ParticleList = ParticleInfo[]

export default defineComponent({
  name: 'ParticleCloud',
  components: {Particle},
  mixins: [
    uniqueIdMixin
  ],
  data() {
    return {
      currentStep: 0 as number,
      particleCoords: [] as ParticleList,
      intervalHandle: -1 as number,
      minAngle: ((Math.PI / 180) * this.spawnInRange[0]) as number,
      maxAngle: ((Math.PI / 180) * this.spawnInRange[1]) as number,
      parentPerspective: 0 as number
    }
  },
  props: {
    enableRandomSteps: {default: false, type: Boolean as PropType<boolean>},
    enableRandomMagnitude: {default: false, type: Boolean as PropType<boolean>},
    enableRandomDepth: {default: false, type: Boolean as PropType<boolean>},
    enableRandomSpawning: {default: false, type: Boolean as PropType<boolean>}, // overrides all spawning to spawn particles randomly in radius
    enableParticleDriftMode: {default: false, type: Boolean as PropType<boolean>}, // overrides normal movement, instead particles drift randomly
    enableFadeOut: {default: false, type: Boolean as PropType<boolean>},
    enableShrinkOut: {default: false, type: Boolean as PropType<boolean>},
    enableFadeIn: {default: false, type: Boolean as PropType<boolean>},
    enableShrinkIn: {default: false, type: Boolean as PropType<boolean>},
    maxParticles: {default: 200, type: Number as PropType<number>},
    lifetimeVariance: {default: 0, type: Number as PropType<number>}, //
    keepMaxParticlesExact: {default: false, type: Boolean as PropType<boolean>}, // overrides spawning amount rules to keep the exact number of max particles on screen at once
    spawnSpeed: {default: 1, type: Number as PropType<number>}, // spawns x per second
    perSpawn: {default: 1, type: Number as PropType<number>}, // particles to spawn per cycle
    spawnInRange: {default: () => {return [0, 360]}, type: Array as unknown as PropType<[number, number]>},
    enableSpawnInBoundingBox: {default: false, type: Boolean as PropType<boolean>}, // overrides all spawning mechanics to spawn randomly in parent boundaries
    hangTime: {default: 0, type: Number as PropType<number>}, // delay before blob moves as proportion of lifetime
    timeBetweenPerSpawns: {default: 0, type: Number as PropType<number>, validator(val :number) :boolean {return val <= 0.5}},
    particleLifeTime: {default: 0.5, type: Number as PropType<number>}, // time before particle is removed in seconds
    particleMoveTime: {default: 0.5, type: Number as PropType<number>}, // { ---<>---
    particleHangTime: {default: 0, type: Number as PropType<number>}, // {
    particleDriftMaxMagnitude: {default: 0.1, type: Number as PropType<number>}, // { all in percentage of lifetime
    particleDriftInterval: {default: 0.1, type: Number as PropType<number>}, // {
    particleDriftTiming: {default: 0.1, type: Number as PropType<number>}, // { ---<>---
    particleEnterExitTiming: {default: 0.5, type: Number as PropType<number>}, // timing of enter / exit transitions in seconds
    particleStep: {default: 0.1, type: Number as PropType<number>}, // percentage of circle
    particleWidth: {default: 10, type: Number as PropType<number>},
    particleHeight: {default: 10, type: Number as PropType<number>},
    particleUseFixedPositioning: {default: false, type: Boolean as PropType<boolean>}, //
    enableDirectionReverse: {default: false, type: Boolean as PropType<boolean>},
    endPosition: {default: () => {return [50, 50, 50]}, type: Array as unknown as PropType<[number, number, number]>}, // end position of particle in percent
    centerPosition: {default: () => {return [50, 50, 50]}, type: Array as unknown as PropType<[number, number, number]>},
    zAxisMax: {default: 100, type: Number as PropType<number>}, // z axis depth as percentage width
    zAxisMin: {default: -100, type: Number as PropType<number>}, // z axis depth as percentage width
    perspectiveOrigin: {default: 'center', type: String as PropType<string>},
    particleStartColour: {default: 'white', type: String as PropType<string>},
    particleEndColour: {default: 'white', type: String as PropType<string>},
    particleColourTime: {default: 0, type: Number as PropType<number>}, // in percent of life
    radius: {default: 45, type: Number as PropType<number>},
    enabled: {default: true, type: Boolean as PropType<boolean>},
    enableMergeFilter: {default: false, type: Boolean as PropType<boolean>}, // enables svg filter to merge close particles, does not work well on very small or very large particles: (15-40px is good range)
    variantPointDistance: {default: 0, type: Number as PropType<number>}, // adds random variance to distance between points (max == 2*PI)
    transitionTimingFunction: {default: 'ease-out', type: String as PropType<string>}
  },
  computed: {
    angleDifference() :number {
      return this.maxAngle - this.minAngle
    },
    stepSize() :number {
      return this.angleDifference * this.particleStep
    },
    appearClass() :string {
      if (this.enableFadeIn) {
        return 'appear-fade-in'
      }

      if (this.enableShrinkIn) {
        return 'appear-grow'
      }

      return ''
    },
    leaveActiveClass() :string {
      if (this.enableFadeOut) {
        return 'leave-active-fade-out'
      }

      if (this.enableShrinkOut) {
        return 'leave-active-shrink'
      }

      return ''
    }
  },
  methods: {
    endPoint(particle :ParticleInfo) :Coordinate3D {
      if (!this.enableParticleDriftMode) {
        return [this.toPixelsWidth(particle.endX), this.toPixelsHeight(particle.endY), this.toPixelsDepth(particle.endZ)]
      } else {
        return [0, 0, 0]
      }
    },
    radiusInPixels() :number {
      return (this.radius / 100) * this.toPixelsWidth(100)
    },
    startPoint(particle :ParticleInfo) :Coordinate3D {
      return [this.toPixelsWidth(particle.startX), this.toPixelsHeight(particle.startY), this.toPixelsDepth(particle.startZ)]
    },
    randomNegativePositive(val :number) :number {
      return val * (Math.floor(Math.random() * 2) === 1 ? 1 : -1)
    },
    randomBetweenValues(min :number, max :number) :number {
      return Math.random() * (max - min) + min
    },
    randomNegativePositiveRange(range :number) :number {
      return this.randomNegativePositive(Math.random() * range)
    },
    getRandomRadiusModifier(radius :number) :number {
      const num = Math.floor(Math.random() * (radius / 15)) + 1
      return this.randomNegativePositive(num)
    },
    toDegrees(radians :number) :number {
      return (180 / Math.PI) * radians
    },
    getRadialPoint(radialPosition :number, magnitude = 1) :Coordinate {
      const alteredRadius = this.radius * magnitude

      return [(alteredRadius * Math.cos(radialPosition) + this.centerPosition[0]), (alteredRadius * Math.sin(radialPosition) + this.centerPosition[1])]
    },
    startSpawning() {
      if (!this.keepMaxParticlesExact) {
        this.intervalHandle = setInterval(() => {
          this.spawnOnTimer(this.perSpawn, this.timeBetweenPerSpawns)
        }, 1000 / this.spawnSpeed)
      } else {
        this.intervalHandle = setInterval(() => {
          if (this.maxParticles > this.particleCoords.length) {
            this.spawnOnTimer(this.maxParticles - this.particleCoords.length, this.timeBetweenPerSpawns)
          }
        }, 200)
      }
    },
    containedInAngleRange(value :number) {
      return (value >= this.spawnInRange[0] && value <= this.spawnInRange[1])
    },
    stopSpawning() {
      clearInterval(this.intervalHandle)
      this.intervalHandle = -1
    },
    spawnSingle() {
      if (this.particleCoords.length < this.maxParticles) {
        const coord = this.getNextParticle()
        if (coord) {
          this.particleCoords.unshift(coord) // adds particle to front of array
        }

        setTimeout(() => {
          this.particleCoords.pop()
        }, (coord.lifetime * 1000) - (this.particleEnterExitTiming * 1000)) // deletes particle from array at end of lifetime
      }
    },
    spawn(amount = 1) {
      for(let i = 0; i < amount; i++) {
        this.spawnSingle()
      }
    },
    spawnOnTimer(amount :number, timePer :number) {
      if (this.timeBetweenPerSpawns !== 0) {
        for(let i = 0; i < amount; i++) {
          setTimeout(() => {
            this.spawnSingle()
          }, timePer * i * 1000)
        }
      } else {
        this.spawn(amount)
      }
    },
    getNextParticle() {
      const tempLifetime = this.particleLifeTime + this.randomNegativePositive(this.particleLifeTime * this.randomBetweenValues(0, this.lifetimeVariance))

      if (!this.enableSpawnInBoundingBox) {
        let coord :Coordinate
        let step = 0
        let magnitude = 1
        let depth = 0

        if (!this.enableRandomSpawning) {
          if (this.enableRandomSteps) {
            step = this.randomBetweenValues(this.minAngle, this.maxAngle)
          } else {
            step = this.currentStep
            this.currentStep += this.stepSize + this.randomNegativePositiveRange(this.variantPointDistance)

            // resets step when it goes past angle range
            if (this.currentStep > this.maxAngle) {
              this.currentStep = this.currentStep - this.maxAngle
            } else if (this.currentStep < this.minAngle) {
              this.currentStep = this.maxAngle - this.currentStep
            }
          }

          if (this.enableRandomMagnitude) {
            magnitude = Math.random()
          }

          coord = this.getRadialPoint(step, magnitude)
        } else {
          coord = this.getRandomCoord(this.radius)
        }

        if (this.enableRandomDepth || this.enableRandomSpawning) {
          depth = this.randomBetweenValues(this.zAxisMin, this.zAxisMax)
        }

        if (this.enableDirectionReverse) {
          return {
            startX: this.endPosition[0],
            startY: this.endPosition[1],
            startZ: this.endPosition[2],
            endX: coord[0],
            endY: coord[1],
            endZ: depth,
            lifetime: tempLifetime,
            id: this.getUniqueId()
          }
        } else {
          return {
            endX: this.endPosition[0],
            endY: this.endPosition[1],
            endZ: this.endPosition[2],
            startX: coord[0],
            startY: coord[1],
            startZ: depth,
            lifetime: tempLifetime,
            id: this.getUniqueId()
          }
        }
      } else {
        let depth = 0

        if (this.enableRandomDepth || this.enableRandomSpawning) {
          depth = this.randomBetweenValues(this.zAxisMin, this.zAxisMax)
        }

        return {
          endX: this.endPosition[0],
          endY: this.endPosition[1],
          endZ: this.endPosition[2],
          startX: Math.random() * 100,
          startY: Math.random() * 100,
          startZ: depth,
          lifetime: tempLifetime,
          id: this.getUniqueId()
        }
      }
    },
    getRandomCoord(radius :number) :Coordinate {
      const radiusRandom = radius * Math.sqrt(Math.random())
      const theta = this.minAngle + (Math.random() * this.angleDifference)

      return [
        this.centerPosition[0] + radiusRandom * Math.cos(theta),
        this.centerPosition[1] + radiusRandom * Math.sin(theta)
      ]
    },
    toPixelsWidth(widthPercentage :number) :number {
      return (this.$refs.particleParent as HTMLElement).clientWidth * (widthPercentage / 100)
    },
    toPixelsHeight(heightPercentage :number) :number {
      return (this.$refs.particleParent as HTMLElement).clientHeight * (heightPercentage / 100)
    },
    toPixelsDepth(depthPercentage :number) :number {
      return (this.$refs.particleParent as HTMLElement).clientWidth * (depthPercentage / 100)
    }
  },
  mounted() {
    if (this.enabled) {
      this.startSpawning()
    }
  },
  updated() {
    this.parentPerspective = this.toPixelsDepth(100)
  },
  watch: {
    enabled(enabled) {
      if (enabled) {
        this.startSpawning()
      } else {
        this.stopSpawning()
      }
    }
  }
})
</script>

<style lang="scss" scoped>

.particle-cloud {
  position: relative;
  pointer-events: none;
}

.particle {
  pointer-events: none;
}

.appear-grow {
  width: 0 !important;
  height: 0 !important;
}

.leave-active-shrink {
  width: 0 !important;
  height: 0 !important;
}

.appear-fade-in {
  opacity: 0;
}

.leave-active-fade-out {
  opacity: 0;
}

</style>
