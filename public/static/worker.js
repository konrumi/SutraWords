importScripts('./util.js')

onmessage = function (msg) {
  const textArray = msg.data.textArray
  const result = self._util.processText(textArray)

  postMessage(result)
  close()
}