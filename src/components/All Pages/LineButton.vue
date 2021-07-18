<template>
<div :class="{'disable-animation' : !enableEnterAnimation}" ref="parent" class="line-button">
  <div v-if="showLeftLine" :class="{'disable-animation' : !enableEnterAnimation}" class="line-connector left-middle"></div>
  <div v-if="showRightLine" :class="{'disable-animation' : !enableEnterAnimation}" class="line-connector right-middle"></div>
  <div v-if="showBottomLine" :class="{'disable-animation' : !enableEnterAnimation}" class="line-connector bottom-middle"></div>
  <div v-if="showTopLine" :class="{'disable-animation' : !enableEnterAnimation}" class="line-connector top-middle"></div>

  <div :class="{'disable-animation' : !enableEnterAnimation}" class="button-inner">
    <svg :class="cornerClasses" class="corner corner-1" viewBox="0 0 100 100"></svg>
    <svg :class="cornerClasses" class="corner corner-2" viewBox="0 0 100 100">
    </svg>
    <svg :class="cornerClasses" class="corner corner-3" viewBox="0 0 100 100">
    </svg>
    <svg :class="cornerClasses" class="corner corner-4" viewBox="0 0 100 100">
    </svg>
    <transition appear :name="enableEnterAnimation ? 'button' : ''">
      <div :class="{'disable-animation' : !enableEnterAnimation}" class="button-content">{{content}}</div>
    </transition>
  </div>
</div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'LineButton',
  props: {
    content: {default: 'default', type: String},
    enableEnterAnimation: {default: true, type: Boolean},
    showLeftLine: {default: false, type: Boolean}, //
    showRightLine: {default: false, type: Boolean}, //
    showBottomLine: {default: false, type: Boolean}, //
    showTopLine: {default: false, type: Boolean} //
  },
  data() {
    return {
      cornerAnimationEnded: false,
      isMounted: false
    }
  },
  methods: {
  },
  computed: {
    cornerClasses() :Partial<ClassDecorator> {
      return {
        'corner-finished': this.cornerAnimationEnded,
        'disable-animation': !this.enableEnterAnimation && !this.cornerAnimationEnded,
        'corner-move': this.isMounted
      }
    }
  },
  mounted() {
    setTimeout(() => {this.cornerAnimationEnded = true}, 910)
    setTimeout(() => {this.isMounted = true}, 50)
  }
})
</script>

<style lang="scss" scoped>

//first
$lineAppearDelay: 0s;
$lineAppearTime: 0.3s;
//first
$buttonSpinDelay: 0s;
$buttonSpinTime: 0.3s;

//second
$cornerGrowDelay: 0.4s;
$cornerGrowTime: 0.5s;
//second
$textGrowDelay: 0.4s;
$textGrowTime: 0.5s;

//third
$textAppearDelay: 0.8s;
$textAppearTime: 0.5s;

$cornerWidth: 2px;

.line-button {
  position: relative;
}

.button-inner {
  position: relative;
  cursor: pointer;
  min-height: 30px;
  animation: buttonInnerSpin $buttonSpinTime $buttonSpinDelay;
  box-sizing: border-box;
  background-color: rgba(0,0,0,0.7);
}

.button-inner:hover .corner-1 {
  transform: translate(10%, 10%) !important;
}

.button-inner:hover .corner-2 {
  transform: translate(-10%, 10%) !important;
}

.button-inner:hover .corner-3 {
  transform: translate(-10%, -10%) !important;
}

.button-inner:hover .corner-4 {
  transform: translate(10%, -10%) !important;
}

.button-enter {
  font-size: 0;
  color: transparent !important;
}

.disable-animation {
  animation: none !important;
  transition: none !important;
}

.button-inner:hover .border-svg path {
  stroke: rgba(255,255,255,1);
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 15px;
  color: inherit;
  transition: font-size $textGrowTime $textGrowDelay, color $textAppearTime $textAppearDelay;
  white-space: nowrap;
}

.border-svg {
  position: absolute;
  height: 50%;
  min-height: 15px;
  pointer-events: none;
  transition: transform 0.4s;
}

.border-svg path {
  stroke-width: 4;
  stroke: white;
  fill: none;
  vector-effect: non-scaling-stroke;
  transition: stroke 0.5s;
}

.corner {
  position: absolute;
  height: 25%;
  pointer-events: none;
  border-radius: 2px;
  transition: transform $cornerGrowTime $cornerGrowDelay;
}

$translateMagnitude: 76%;

.corner-1 {
  top: 0;
  left: 0;
  border-left: solid white $cornerWidth;
  border-top: solid white $cornerWidth;
  transform: translate($translateMagnitude, $translateMagnitude);
}

.corner-2 {
  top: 0;
  right: 0;
  border-right: solid white $cornerWidth;
  border-top: solid white $cornerWidth;
  transform: translate(-$translateMagnitude, $translateMagnitude);
}

.corner-3 {
  bottom: 0;
  right: 0;
  border-right: solid white $cornerWidth;
  border-bottom: solid white $cornerWidth;
  transform: translate(-$translateMagnitude, -$translateMagnitude);
}

.corner-4 {
  bottom: 0;
  left: 0;
  border-left: solid white $cornerWidth;
  border-bottom: solid white $cornerWidth;
  transform: translate($translateMagnitude, -$translateMagnitude);
}

.corner-move {
  transform: translate(0,0);
}

.corner-finished {
  transition: transform 0.4s;
}

$lineConnectorSize: 15px;
$lineConnectorThickness: 2px;

.left-middle {
  position: absolute;
  top: 50%;
  height: $lineConnectorSize;
  width: 30px;
  pointer-events: none;
  border-left: solid white $lineConnectorThickness;
  background-color: black;
  transform: translate(-10px,-50%);
  animation: lineAppearLeft $lineAppearTime $lineAppearDelay forwards;
}

@keyframes lineAppearLeft {
  from {
    transform-origin: 50% 0;
    transform: scaleY(0) translate(-10px,-50%);
  }
  to {
    transform-origin: 50% 0;
    transform: scaleY(1) translate(-10px,-50%);
  }
}

.right-middle {
  position: absolute;
  top: 50%;
  right: 0;
  height: $lineConnectorSize;
  width: 30px;
  pointer-events: none;
  border-right: solid white $lineConnectorThickness;
  background-color: black;
  transform: translate(10px,-50%);
  animation: lineAppearRight $lineAppearTime $lineAppearDelay forwards;
}

@keyframes lineAppearRight {
  from {
    transform-origin: 50% 0;
    transform: scaleY(0) translate(10px,-50%);
  }
  to {
    transform-origin: 50% 0;
    transform: scaleY(1) translate(10px,-50%);
  }
}

.top-middle {
  position: absolute;
  top: 0;
  left: 50%;
  height: 30px;
  width: $lineConnectorSize;
  pointer-events: none;
  border-top: solid white $lineConnectorThickness;
  background-color: black;
  transform: translate(-50%, -10px);
  animation: lineAppearTop $lineAppearTime $lineAppearDelay forwards;
}

@keyframes lineAppearTop {
  from {
    transform-origin: 0 50%;
    transform: scaleX(0) translate(-50%, -10px);
  }
  to {
    transform-origin: 0 50%;
    transform: scaleX(1) translate(-50%, -10px);
  }
}

.bottom-middle {
  position: absolute;
  bottom: 0;
  left: 50%;
  height: 30px;
  width: $lineConnectorSize;
  pointer-events: none;
  border-bottom: solid white $lineConnectorThickness;
  background-color: black;
  transform: translate(-50%, 10px);
  animation: lineAppearBottom $lineAppearTime $lineAppearDelay forwards;
}

@keyframes lineAppearBottom {
  from {
    transform-origin: 0 50%;
    transform: scaleX(0) translate(-50%, 10px);
  }
  to {
    transform-origin: 0 50%;
    transform: scaleX(1) translate(-50%, 10px);
  }
}

@keyframes buttonInnerSpin {
  from {
    transform: scale(0.1) rotate(-180deg);
  }
  to {
    transform: scale(1) rotate(0deg);
  }
}

</style>
