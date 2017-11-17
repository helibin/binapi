(() => {
  $('.context.example .ui.sidebar')
  .sidebar({
    context: $('.context.example .bottom.segment')
  })
  .sidebar('attach events', '.context.example .menu .item')
;
  let index  = 'index page'
  console.log(index, ',,,')
})()
