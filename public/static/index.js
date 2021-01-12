(function () {
  // Global datas
  let file = null
  let text = ''

  // Document elements
  const eleFileInput = document.getElementById('fileInput')
  const eleDividerSelect = document.getElementById('dividerSelect')
  const eleSubmitButton = document.getElementById('submitButton')
  const eleDownloadButton = document.getElementById('downloadButton')
  const eleResultTable = document.getElementById('resultTable')
  const eleResultContainer = eleResultTable.getElementsByTagName('tbody')[0]
  const eleFox = document.getElementById('fox')
  const eleFoxImgs = eleFox.getElementsByTagName('img')

  // File reader
  eleFileInput.addEventListener('change', function (event) {
    setFox(1)
    file = event.target.files[0]

    // Check Files
    if (!file) {
      alert('文件不符合规范，请上传单个文本文件。')
      file = null
      text = ''
      eleResultContainer.innerHTML = ''
      eleDownloadButton.disabled = true
      eleDownloadButton.onclick = null
      setFox(0)
      return
    }

    // Check FileReader
    if (!FileReader) {
      alert('当前环境不支持读取文件，请使用 Chrome 7+ / Edge 12+ / Firefox 4+ 等浏览器。')
      file = null
      text = ''
      eleResultContainer.innerHTML = ''
      eleDownloadButton.disabled = true
      eleDownloadButton.onclick = null
      setFox(0)
      return
    }

    // Read file
    let reader = new FileReader()

    reader.onload = function (e) {
      text = e.target.result
      console.log('获得文件')
      console.log(file, text.length)
    }

    reader.readAsText(file)
  }, false)

  // Submit process
  eleSubmitButton.addEventListener('click', function () {
    setFox(2)
    eleResultContainer.innerHTML = ''
    eleDownloadButton.disabled = true
    eleDownloadButton.onclick = null

    // Check text
    if (text.length === 0) {
      alert('解析文本为空。')
      setFox(0)
      return
    }

    let divider = eleDividerSelect.value
    let textArray = text.split(divider)

    console.log('开始处理')
    console.log('总词数：' + textArray.length)

    setWorkers({
      textArray
    })
  }, false)

  // Set web workers
  function setWorkers (data) {
    if (
      (window.Worker)
      && (navigator.hardwareConcurrency && navigator.hardwareConcurrency > 0)
    ) {
      // use worker thread
      const worker = new Worker('./static/worker.js')

      worker.onmessage = function (e) {
        generateResult(e.data)
      }

      worker.postMessage({
        textArray: data.textArray
      })
    } else {
      // use main thread
      generateResult(window._util.processText(data.textArray))
    }
  }

  // Generate result
  function generateResult (result) {
    let resultHTML = ''
    let resultDownloadData = '\ufeff'

    resultDownloadData += `#,词语,数量\r\n`
    result.forEach(function (currentData, index) {
      resultHTML += `<tr><td class="table-value">${index + 1}</td><td class="table-key">${currentData.word}</td><td class="table-value">${currentData.count}</td></tr>`
      resultDownloadData += `${index + 1},${currentData.word},${currentData.count}\r\n`
    })

    eleResultContainer.innerHTML = resultHTML

    eleDownloadButton.disabled = false
    eleDownloadButton.onclick = function () {
      saveCsv(resultDownloadData)
    }

    setFox(3)
  }

  // Save files
  function saveCsv (data) {
    let a = document.createElement('a')
    let blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
    let url = window.URL.createObjectURL(blob)
    document.body.appendChild(a)
    a.style.display  = 'none'
    a.href = url
    a.download = 'count_data.csv'
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  // Set fox status
  function setFox (status) {
    let activeFox = eleFoxImgs[status]
    Array.prototype.forEach.call(eleFoxImgs, function (ele) {
      ele.style.display = 'none'
    })

    if (activeFox) {
      activeFox.style.display = 'block'
    }
  }
  setFox(0)

})()
