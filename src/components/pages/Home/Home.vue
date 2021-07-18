<template>
  <div class="home">
    <div id="section1" class="section">
      <div ref="lineBackground" class="line-background">
        <line-path class="home-line home-main-line"
                   @reachednode="hitNode"
                   :path-coords="[[0,20],[30,20],[30,28],[30,38],[30,50],[50,50],[50,60],[50,70],[50,80],[50,100]]"
                   :line-width="3"
                   :animate-time="2"
                   :animate-delay="0.8"
                   :line-colour="'rgba(255,255,255,1)'"
                   :line-join="'round'"
                   :show-nodes="true"
                   :excluded-nodes="[0,2,3,9]"
                   :node-fill-colour="'black'"
                   :node-stroke-width="10"
                   :feather-node-radius="30"
                   :feather-node-scale="1"
                   :nodes-to-feather="[1,2,3,4,5,6,7,8]"
                   :custom-feather-node-scale="{2: 0.5, 3:0.5}"
                   :node-size="['25px', '25px']">
          <template v-slot:[nodeSlot1]="">
            <text-with-connector
                :connector-fill="'black'"
                :connector-stroke="'rgba(255,255,255,0.8)'"
                :connector-gap="50"
                class="tagline">
              <template #content>
                <span>Professional Web Services</span>
              </template>
            </text-with-connector>
          </template>
          <template v-slot:[nodeSlot2]="">
            <text-with-connector
                :connector-fill="'black'"
                :entry-direction="'left'"
                :connector-stroke="'rgba(255,255,255,0.8)'"
                :connector-gap="50"
                class="tagline">
              <template #content>
                <span>Experienced Design</span>
              </template>
            </text-with-connector>
          </template>
        </line-path>
        <line-button-with-paths
            v-if="contentDisplay[6]"
            @clicked="navClicked('work')"
            :relative-coord="[50,60]"
            :entry-path="[[0,0], [5,0]]"
            :exit-path="[[5,0], [20,0], [20,-15], [50,-15]]"
            :button-index="1"
            :anchor-entry-to-edge="true"
            :content="'Previous Work'"
            :entry-direction="'left'"
            :exit-direction="'right'">
        </line-button-with-paths>
        <line-button-with-paths
            v-if="contentDisplay[7]"
            @clicked="navClicked('contact')"
            :relative-coord="[50,70]"
            :entry-path="[[0,0], [-5,0]]"
            :exit-path="[[-5,0], [-25,0], [-25,15], [-50,15]]"
            :button-index="1"
            :exit-path-preview-time="0.8"
            :exit-path-time="0.8"
            :anchor-entry-to-edge="true"
            :content="'Contact'"
            :entry-direction="'right'"
            :exit-direction="'left'">
        </line-button-with-paths>
        <line-button-with-paths
            v-if="contentDisplay[8]"
            :relative-coord="[50,80]"
            :entry-path="[[0,0], [5,0]]"
            :exit-path="[[5,0], [25,0], [25,8], [50,8]]"
            :button-index="1"
            :anchor-entry-to-edge="true"
            :content="'Pricing and Rates'"
            :entry-direction="'left'"
            :exit-direction="'right'">
        </line-button-with-paths>
      </div>
      <div class="content-foreground">
        <div class="name-container">
          <svg viewBox="0 0 100 20">
            <text class="title-first" x="0" y="7" fill="white" font-size="8">ECL</text>
            <text class="title-first" x="0" y="18.7" fill="white" font-size="8">WEB</text>
            <rect data-v-8a9df0b8 x="18" y="9" width="65.5" height="2" fill="black"></rect>
            <text class="title-second" x="20" y="15.9" fill="white" font-size="17">DESIGN</text>
            <path d="M21,1 h-3 v18 h3 M80.5,1 h3 v18 h-3" stroke-linecap="square" stroke="white" stroke-width="0.7"></path>
            <!--test lines -->
            <path v-if="false" d="M12,10 v-3 6 M0,10 h100" stroke="red" stroke-width="0.5"></path>
          </svg>
        </div>
      </div>
    </div>
    <div class="section" id="section2">
      <div class="line-background">
        <line-path :path-coords="[[50,0],[50,100]]"
                   :line-width="3"
                   id="section2Line"
                   class="home-line"></line-path>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import LinePath from '@/components/All Pages/LinePath.vue'
import LineButtonWithPaths from '@/components/All Pages/LineButtonWithPaths.vue'
import TextWithConnector from '@/components/All Pages/TextWithConnector.vue'
import {defineComponent, PropType} from 'vue'

export default defineComponent({
  name: 'Home',
  components: {
    TextWithConnector,
    LineButtonWithPaths,
    LinePath
  },
  data() {
    return {
      particles: {},
      lineParentDimensions: [],
      displayLine: false,
      mousePosition: [],
      contentDisplay: {6: false, 7: false, 8: false},
      nodeSlot1: 'nodeSlot2',
      nodeSlot2: 'nodeSlot3'
    }
  },
  computed: {
  },
  methods: {
    deleteParticle(id) {
      this.$delete(this.particles, id)
    },
    hitNode(index) {
      if (index in this.contentDisplay) {
        this.contentDisplay[index] = true
      }
    },
    navClicked(path) {
      setTimeout(() => {this.$router.push(path)}, 200)
    }
    /*    mouseMove(event) {
      //this.mousePosition = [event.clientX, event.clientY];

      let width = this.$refs.lineBackground.clientWidth;
      let height = this.$refs.lineBackground.clientHeight;

      let xPercent = (event.clientX / width) - 0.5;
      let yPercent = (event.clientY / height) - 0.5;

      this.cloudPerspective = `${50 + (xPercent * 5)}% ${50 + (yPercent * 5)}%`
    } */
  },
  mounted() {
    this.$nextTick(() => {
      this.$set(this.particles, 1, 0)
      this.displayLine = true
    })
  }
})
</script>

<style lang="scss" scoped>

@import "src/themes/sassAnimations.scss";

.section {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.line-background {
  position: absolute;
  width: 100%;
  height: 100%;
}

.content-foreground {
  width: 100%;
  height: 100%;
  color: white;
}

.name-container {
  position: absolute;
  top: 20.3%;
  left: 2%;
  width: 25%;
  font-family: "IBM Plex Mono";
  transform: translateY(-50%);
}

.tagline {
  font-size: 26px;
  font-weight: 300;
}

.tagline span {
  white-space: nowrap;
  color: white;
}

.title-first {
  font-weight: 400;
}

.title-second {
  font-weight: 200;
}

.home-line {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>
