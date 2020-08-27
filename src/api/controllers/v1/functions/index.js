const fs = require('fs')

function readJsonFile(filePath) {
  if(fs.existsSync(filePath)) {
    let bufferData = fs.readFileSync(filePath)
    let stData = bufferData.toString()
    let data = JSON.parse(stData)
    return data
  }
  else {
    return { error: true, message: "Cannot find file" }
  }
}

module.exports = {
  readJsonFile
}
