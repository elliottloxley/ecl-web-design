let uniqueID = 0
const uniqueIdMixin = {
  methods: {
    getUniqueId() {
      const tempId = uniqueID
      uniqueID++
      return tempId
    }
  }
}
export default uniqueIdMixin
// # sourceMappingURL=uniqueId.js.map
