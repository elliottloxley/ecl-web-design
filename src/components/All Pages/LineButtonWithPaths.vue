<template>
  <div ref="parent" class="line-button-with-paths">
    <line-path class="line exit-line-preview"
               v-if="shouldDisplay"
               :path-coords="exitPreviewPath"
               :relative-coord="relativeCoord"
               :line-width="1"
               :line-percent="exitLinePreviewPercent"
               :animate-time="exitPathPreviewTime"
               :transition-timing-function="'ease-out'"
               :line-colour="'rgba(255,255,255,0.3)'"
               :nodes-to-feather="previewReverse ? [exitPreviewPath.length - 1] : [0]"
               :custom-feather-node-offset="exitPreviewFeatherOffset"
               :feather-node-scale="displayExitLine ? 0.01 : 1"
               :feather-node-radius="featherStartRadius * 4">
    </line-path>
    <line-path class="line exit-line"
               v-if="displayExitLine && shouldDisplay"
               @reachedlastnode="$emit('reachedend');"
               :path-coords="exitPathComputed"
               :relative-coord="relativeCoord"
               :disable-animation="forceShowExitLine"
               :line-width="1"
               :animate-time="exitPathTime"
               :line-colour="'rgba(255,255,255,1)'"
               :show-nodes="false"
               :line-join="'round'"
               :nodes-to-feather="[0]"
               :feather-node-radius="featherStartRadius"
               :custom-feather-node-offset="exitFeatherOffset"
               :feather-node-scale="buttonExpanded || disableEntryAnimation ? featherEntryEndScale : featherStartScale"
    ></line-path>
    <line-path class="line entry-line"
               v-if="shouldDisplay"
               :start="displayEntryLine"
               @reachedlastnode="showButton"
               :path-coords="entryPath"
               :relative-coord="relativeCoord"
               :line-width="2"
               :animate-time="entryPathTime"
               :animate-delay="0.2"
               :line-colour="'rgba(255,255,255,1)'"
               :line-join="'round'"
               :show-nodes="true"
               :excluded-nodes="[0,1]"
               :node-advance-appear="{1 : 0.1}"
               :node-fill-colour="'black'"
               :node-stroke-width="13"
               :disable-animation="disableEntryAnimation"
               :nodes-to-feather="[entryPath.length - 1]"
               :feather-node-radius="featherStartRadius"
               :custom-feather-node-offset="entryFeatherOffset"
               :feather-node-scale="buttonExpanded || disableEntryAnimation ? featherEntryEndScale : featherStartScale"
               :node-size="['30px', '30px']">
      <template v-slot:[buttonNodeIndex]="">
        <line-button class="button"
                     v-if="shouldDisplay"
                     :style="buttonPositionStyle"
                     @mouseenter="exitLinePreviewPercent = forceShowExitLine ? 0 : 1;"
                     @mouseleave="exitLinePreviewPercent = 0;"
                     @click="exitLinePreviewPercent = 0; showExitConnector(); displayExitLine = true; $emit('clicked')"
                     :show-left-line="showLeft"
                     :show-right-line="showRight"
                     :show-top-line="showTop"
                     :show-bottom-line="showBottom"
                     :enable-enter-animation="!disableEntryAnimation"
                     :content="content"></line-button>
      </template>
    </line-path>
    <line-button ref="virtualButton" class="virtual-button"
                 :enable-enter-animation="false"
                 :content="content"></line-button>
  </div>
</template>

<script lang="ts">

import {defineComponent, PropType} from 'vue'
import {Coordinate, CoordinatePath} from '@/mixins/pathingHelperFunctions'
import LinePath, {FeatherOffset} from '@/components/All Pages/LinePath.vue'
import LineButton from '@/components/All Pages/LineButton.vue'
import {debounce} from 'ts-debounce'

export enum Directions {
  TOP = 'top',
  LEFT = 'left',
  BOTTOM = 'bottom',
  RIGHT = 'right'
}

export default defineComponent({
  name: 'LineButtonWithPaths',
  components: {LineButton, LinePath},
  data() {
    return {
      buttonNodeIndex: ('nodeSlot' + this.buttonIndex) as string,
      entryLineFeatherScale: 0.3 as number,
      showButtonLineConnector: false as boolean,
      exitLinePreviewPercent: 0 as number,
      displayEntryLine: false as boolean,
      displayExitLine: false as boolean,
      featherStartRadius: 18 as number,
      featherStartScale: 1 as number,
      buttonExpanded: false as boolean,
      showLeft: false as boolean,
      showRight: false as boolean,
      showTop: false as boolean,
      showBottom: false as boolean,
      mounted: false as boolean,
      parentDimensions: [] as number[]
    }
  },
  props: {
    buttonIndex: {default: 0, type: Number as PropType<number>}, //
    exitDirection: {default: Directions.RIGHT, type: String as PropType<Directions>}, //
    entryDirection: {default: Directions.LEFT, type: String as PropType<Directions>}, //
    entryPath: {required: true, type: Array as PropType<CoordinatePath>}, // array of array coords
    exitPath: {required: true, type: Array as PropType<CoordinatePath>}, // array of array coords,
    content: {default: 'Default', type: String as PropType<string>}, //
    previewReverse: {default: true, type: Boolean as PropType<boolean>},
    exitPathPreviewTime: {default: 0.5, type: Number as PropType<number>},
    exitPathTime: {default: 0.5, type: Number as PropType<number>},
    entryPathTime: {default: 0.5, type: Number as PropType<number>},
    relativeCoord: {default: () => {return [0, 0]}, type: Array as unknown as PropType<Coordinate>}, // added to path coords before any calculations
    anchorEntryToEdge: {default: true, type: Boolean as PropType<boolean>}, // the line ends at the button edge instead of middle
    forceShowExitLine: {default: false, type: Boolean as PropType<boolean>}, //
    disableEntryAnimation: {default: false, type: Boolean as PropType<boolean>} //
  },
  methods: {
    showButton() {
      setTimeout(() => {
        this.buttonExpanded = true
      }, 400)
    },
    showEntryConnector() :void {
      switch (this.entryDirection) {
      case Directions.LEFT:
        this.showLeft = true
        break
      case Directions.RIGHT:
        this.showRight = true
        break
      case Directions.BOTTOM:
        this.showBottom = true
        break
      case Directions.TOP:
        this.showTop = true
        break
      }
    },
    showExitConnector() :void {
      switch (this.exitDirection) {
      case Directions.LEFT:
        this.showLeft = true
        break
      case Directions.RIGHT:
        this.showRight = true
        break
      case Directions.BOTTOM:
        this.showBottom = true
        break
      case Directions.TOP:
        this.showTop = true
        break
      }
    },
    buttonPercentWidth() :number {
      return (this.$refs.virtualButton as HTMLElement).clientWidth / this.parentDimensions[0]
    },
    buttonPercentHeight() :number {
      return (this.$refs.virtualButton as HTMLElement).clientHeight / this.parentDimensions[1]
    },
    getFeatherScale(direction :Directions, multiplier :number) :number {
      if (direction === Directions.LEFT || direction === Directions.RIGHT) {
        return this.featherStartScale * multiplier
      } else {
        return this.featherStartScale * (multiplier / 2)
      }
    },
    getShiftedPath(path :CoordinatePath, x :number, y :number) :CoordinatePath {
      const shiftedPath = [] as CoordinatePath

      for(let i = 0; i < path.length; i++) {
        shiftedPath.push([path[i][0] + x, path[i][1] + y])
      }

      return shiftedPath
    },
    onResize() :void {
      this.parentDimensions = [(this.$refs.parent as HTMLElement).clientWidth, (this.$refs.parent as HTMLElement).clientHeight]
    }
  },
  computed: {
    exitPathComputed() :CoordinatePath {
      if (this.mounted) {
        if (this.anchorEntryToEdge) {
          switch (this.entryDirection) {
          case Directions.LEFT: {
            return this.getShiftedPath(this.exitPath, (this.buttonPercentWidth() * 100), 0)
          }
          case Directions.RIGHT: {
            return this.getShiftedPath(this.exitPath, -(this.buttonPercentWidth() * 100), 0)
          }
          case Directions.TOP: {
            return this.getShiftedPath(this.exitPath, 0, (this.buttonPercentHeight() * 100))
          }
          case Directions.BOTTOM: {
            return this.getShiftedPath(this.exitPath, 0, -(this.buttonPercentHeight() * 100))
          }
          }
        }
      }

      return this.exitPath
    },
    entryFeatherOffset() :FeatherOffset {
      if (this.anchorEntryToEdge) {
        const magnitude = 10
        switch (this.entryDirection) {
        case Directions.LEFT: {
          return {[this.entryPath.length - 1]: [magnitude, 0]}
        }
        case Directions.RIGHT: {
          return {[this.entryPath.length - 1]: [-magnitude, 0]}
        }
        case Directions.TOP: {
          return {[this.entryPath.length - 1]: [0, magnitude]}
        }
        case Directions.BOTTOM: {
          return {[this.entryPath.length - 1]: [0, -magnitude]}
        }
        }
      }

      return {[this.entryPath.length - 1]: [0, 0]}
    },
    exitFeatherOffset() :FeatherOffset {
      return {0: [-this.entryFeatherOffset[this.entryPath.length - 1][0], 0]}
    },
    exitPreviewFeatherOffset() :FeatherOffset {
      return {[this.exitPathComputed.length - 1]: [-this.entryFeatherOffset[this.entryPath.length - 1][0], 0]}
    },
    exitPreviewPath() :CoordinatePath {
      if (this.previewReverse) {
        return this.exitPathComputed.slice().reverse()
      }

      return this.exitPathComputed.slice()
    },
    buttonPositionStyle() :Partial<CSSStyleDeclaration> {
      if (this.anchorEntryToEdge) {
        switch (this.entryDirection) {
        case Directions.LEFT: {
          return {transform: 'translateX(50%)'}
        }
        case Directions.RIGHT: {
          return {transform: 'translateX(-50%)'}
        }
        case Directions.TOP: {
          return {transform: 'translateY(50%)'}
        }
        case Directions.BOTTOM: {
          return {transform: 'translateY(-50%)'}
        }
        }
      }

      return ''
    },
    featherEntryEndScale() :number {
      if (this.mounted) {
        return this.getFeatherScale(this.entryDirection, 2)
      }

      return 1
    },
    featherExitEndScale() :number {
      if (this.mounted) {
        return this.getFeatherScale(this.exitDirection, 3)
      }

      return 1
    },
    shouldDisplay() :boolean {
      return this.parentDimensions.length > 0
    }
  },
  created() {
    window.addEventListener('resize', debounce(() => {this.onResize()}, 200))
  },
  mounted() {
    this.$nextTick(() => {
      this.parentDimensions = [(this.$refs.parent as HTMLElement).clientWidth, (this.$refs.parent as HTMLElement).clientHeight]
      this.showEntryConnector()
      this.displayEntryLine = true
      this.mounted = true
    })
  },
  beforeMount() {
    if (this.forceShowExitLine) {
      this.showExitConnector()
    }
  }
})
</script>

<style lang="scss" scoped>

.button, .virtual-button {
  color: white;
  font-size: 1.4rem;
  width: min-content;
  pointer-events: all;
}

.virtual-button {
  position: absolute;
  left: -1000px;
  top: -1000px;
  visibility: hidden;
}

.line-button-with-paths {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.line {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

</style>
