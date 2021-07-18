import {svgPathProperties} from 'svg-path-properties'
import {Properties} from 'svg-path-properties/dist/types/types'

export type Coordinate = [number, number];
export type Coordinate3D = [number, number, number]
export type CoordinatePath = Coordinate[]
export type CoordinatePath3D = Coordinate3D[]

const pathingHelperFunctions = {
  methods: {
    squaredPointDistance(coord1 :Coordinate, coord2 :Coordinate) :number {
      return Math.pow((coord1[0] - coord2[0]), 2) + Math.pow((coord1[1] - coord2[1]), 2)
    },
    pointDistance(coord1 :Coordinate, coord2 :Coordinate) :number {
      return Math.sqrt(Math.pow((coord1[0] - coord2[0]), 2) + Math.pow((coord1[1] - coord2[1]), 2))
    },
    pathDistance(path :CoordinatePath) :number { // takes array of arrays [[1,1],[1,0],[0,0]]
      let totalDistance = 0
      for(let i = 0; i < path.length - 1; i++) {
        totalDistance += this.pointDistance(path[i], path[i + 1])
      }

      return totalDistance
    },
    pathSplitDistances(path :CoordinatePath) :number[] {
      const distances = []
      for(let i = 0; i < path.length - 1; i++) {
        distances.push(this.pointDistance(path[i], path[i + 1]))
      }

      return distances
    },
    pathSplitDistancesProportions(path :CoordinatePath) :number[] {
      const total = this.pathDistance(path)

      const distances = []
      for(let i = 0; i < path.length - 1; i++) {
        distances.push(this.pointDistance(path[i], path[i + 1]) / total)
      }

      return distances
    },
    getTimePerPathSegmentScaled(absoluteCoords :CoordinatePath, lineLength :number, totalTime :number) :number[] {
      const absoluteDistances = this.pathSplitDistances(absoluteCoords)
      const proportions = absoluteDistances.map((val) => {return val / lineLength})

      return proportions.map((val) => {return val * totalTime})
    },
    getPercentDistanceOfEachNode(path :CoordinatePath) :number[] {
      const proportions = this.pathSplitDistancesProportions(path)
      const nodePercentages = [0]
      let sum = 0

      for(let i = 0; i < proportions.length; i++) {
        sum += proportions[i]

        nodePercentages.push(sum)
      }

      return nodePercentages
    },
    getNormalisedVector(vector :Coordinate) :Coordinate {
      const magnitude = Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2))
      return [vector[0] / magnitude, vector[1] / magnitude]
    },
    getPropertiesFromPathString(pathStr :string) : Properties {
      // eslint-disable-next-line new-cap
      return new svgPathProperties(pathStr)
    },
    pathConvertTo2D(path :CoordinatePath3D) :CoordinatePath {
      const newPath :CoordinatePath = []
      for(let i = 0; i < path.length; i++) {
        newPath.push([path[i][0], path[i][1]])
      }
      return newPath
    }
  }
}

export default pathingHelperFunctions
