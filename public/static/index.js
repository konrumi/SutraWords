(function () {
  // Global datas
  let file = null
  let text = ''

  // Document elements
  const eleFileInput = document.getElementById('fileInput')
  const eleDividerSelect = document.getElementById('dividerSelect')
  const eleSubmitButton = document.getElementById('submitButton')
  const eleResultTable = document.getElementById('resultTable')
  const eleResultContainer = eleResultTable.getElementsByTagName('tbody')[0]


  // File reader
  eleFileInput.addEventListener('change', function (event) {
    file = event.target.files[0]

    // Check Files
    if (!file) {
      alert('请上传单个文本文件。')
      return
    }

    // Check Filereader
    if (!FileReader) {
      alert('环境不支持读取文件，请使用 Chrome 7+ / Edge 12+ / Firefox 4+ 等浏览器。')
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
    let divider = eleDividerSelect.value
    let textArray = text.split(divider)

    console.log('开始处理')
    console.log('总词数：' + textArray.length)

    setWorkers({
      textArray
    })
  }, false)

  // Set web workers
  function setWorkers(data) {
    if (
      (window.Worker)
      && (navigator.hardwareConcurrency && navigator.hardwareConcurrency > 0)
    ) {
      // use worker thread
      const worker = new Worker("./static/worker.js")

      worker.onmessage = function (e) {
        renderResult(e.data)
      }

      worker.postMessage({
        textArray: data.textArray
      });
    } else {
      // use main thread
      renderResult(window._util.processText(data.textArray))
    }
  }

  // Render result
  function renderResult(result) {
    let resultHTML = ''
    let resultDownloadData = '\ufeff'

    resultDownloadData += `词语,数量\r\n`
    result.forEach(function (currentData) {
      resultHTML += `<tr><td>${currentData.word}</td><td>${currentData.count}</td></tr>`
      resultDownloadData += `${currentData.word},${currentData.count}\r\n`
    })

    eleResultContainer.innerHTML = resultHTML
    saveCsv(resultDownloadData)
  }

  function saveCsv(data) {
    let a = document.createElement('a');
    let blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
    let url = window.URL.createObjectURL(blob)
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = 'my_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

})()
