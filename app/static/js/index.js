(() => {
  console.log('index.page', ',,,')
  function onLoad() {
    var now = new Date().getTime();
    var page_load_time = now - performance.timing.navigationStart;
  }
  onLoad()
})()
