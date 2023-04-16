import { getMissingDiffs } from "./lib/fileUtils"

(async() => {
   const missingDiffs = getMissingDiffs(1) 
   console.log(missingDiffs)
})()