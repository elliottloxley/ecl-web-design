let uniqueID = 0

const uniqueIdMixin = {
  methods: {
    getUniqueId() :number {
      const tempId = uniqueID
      uniqueID++
      return tempId
    }
  }
}

export default uniqueIdMixin
