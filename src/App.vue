<template>
  <div v-if="displayPage" id="app" :class="page" :style="{backgroundColor: $root.currentTheme.background.base}">
    <SvgFilters></SvgFilters>
    <particle-cloud v-if="true" ref="particleBG" style="position: fixed; width:100vw; height:100vh;"
                    class="particle-cloud"
                    :enable-random-spawning="true"
                    :enable-random-depth="true"
                    :enable-particle-drift-mode="true"
                    :keep-max-particles-exact="true"
                    :time-between-per-spawns="0.1"
                    :max-particles="30"
                    :particle-drift-max-magnitude="50"
                    :particle-drift-interval="1"
                    :particle-drift-timing="1"
                    :particle-height="10"
                    :particle-width="10"
                    :particle-use-fixed-positioning="true"
                    :z-axis-max="10"
                    :z-axis-min="-50"
                    :perspective-origin="cloudPerspective"
                    :particle-enter-exit-timing="5"
                    :enable-spawn-in-bounding-box="true"
                    :particle-start-colour="'rgba(255,255,255,0.3)'"
                    :particle-end-colour="'rgba(255,255,255,0.3)'"
                    :enable-fade-out="true"
                    :enable-fade-in="true"
                    :spawn-speed="3"
                    :particle-life-time="10"
                    :lifetime-variance="0.1"></particle-cloud>
    <transition :name="currentTransition" appear>
      <keep-alive>
        <router-view :key="$route.fullPath" class="page-view"></router-view>
      </keep-alive>
    </transition>
  </div>
</template>
<script lang="ts">
import SvgFilters from '@/components/All Pages/SvgFilters.vue'
import 'vue-md-icons/src/icons/settings'
import {RouteRecordName} from 'vue-router'
import ParticleCloud from '@/components/All Pages/ParticleCloud.vue'
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'App',
  components: {
    ParticleCloud,
    SvgFilters
  },
  data() {
    return {
      page: 'home' as string,
      settingsOpen: false as boolean,
      basePerspective: [50, 50] as number[],
      currentPerspective: [50, 50] as number[],
      currentTransition: '' as string,
      perspectiveShiftX: 40 as number,
      perspectiveShiftY: 40 as number,
      displayPage: true as boolean
    }
  },
  watch: {
    $route(to, from) {
      const differenceX = from.meta.pagePosition[0] - to.meta.pagePosition[0]
      const differenceY = from.meta.pagePosition[1] - to.meta.pagePosition[1]
      const shiftX = differenceX * this.perspectiveShiftX
      const shiftY = differenceY * this.perspectiveShiftY
      if (differenceX < 0) {
        this.currentTransition = 'slide-left'
      } else if (differenceX > 0) {
        this.currentTransition = 'slide-right'
      }
      this.page = to.name
      this.currentPerspective = [this.currentPerspective[0] + shiftX, this.currentPerspective[1] + shiftY]
    }
  },
  methods: {
  },
  computed: {
    cloudPerspective() :string {
      return `${this.currentPerspective[0]}% ${this.currentPerspective[1]}%`
    }
  },
  mounted() {
    this.page = this.$route.name as string
  }
})
</script>

<style lang="scss">
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: "Open Sans", "sans-serif";
  font-weight: 300;
  overflow-x: hidden;
}
#app {
  height: 100%;
  transition: background-color 0.8s;
  position: relative;
  z-index: 0;
  display: flex;
}
.particle-cloud {
  transition: perspective-origin 0.8s;
}
.page-view {
}
.nav-open {
  transform: translateX(0);
}
.slide-left-enter-active {
  animation: slide-in-left 1s;
}
.slide-left-leave-active {
  animation: slide-out-left 1s;
}
@keyframes slide-in-left {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
@keyframes slide-out-left {
  from {
  }
  to {
    transform: translateX(-100%);
  }
}
.slide-right-enter-active {
  animation: slide-in-right 1s;
}
.slide-right-leave-active {
  animation: slide-out-right 1s;
}
@keyframes slide-in-right {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
@keyframes slide-out-right {
  from {
  }
  to {
    transform: translateX(100%);
  }
}
</style>
