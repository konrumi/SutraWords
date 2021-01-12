self._util = {
  processText: function (textArray) {
    let result = []
    let data = {}

    textArray.forEach(function (word) {
      if (typeof data[word] === 'number') {
        // exist word count + 1
        data[word]++
      } else {
        // new word count as 1
        data[word] = 1
      }
    })

    for (let word in data) {
      if (data.hasOwnProperty(word)) {
        result.push({
          word,
          count: data[word]
        })
      }
    }

    result.sort(function (x, y) {
      return y.count - x.count
    })

    return result
  }
}