(() => {
  console.log('index.page', ',,,')

  function onLoad() {
    var now = new Date().getTime();
    var page_load_time = now - performance.timing.navigationStart;
  }
  axios.post('/api/v1/auth/do/sign-in', {
    identifier: '15179316184',
    password: 'dsafdsfdskl'
  }).then(function (res) {
    console.log(res, ',,,')
  }).then(function (err) {
    console.log(err, ',,,')
  })
})()
