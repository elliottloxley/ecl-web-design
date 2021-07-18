const timingHelperFunctions = {
  methods: {
    getEaseInTiming(elapsed :number, start :number, end :number, total :number) :number {
      return end * (elapsed /= total) * elapsed + start
    }
  }
}

export default timingHelperFunctions
