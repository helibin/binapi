/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 19:02:55
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-01 18:29:43
 */
(() => {
  if (Cookies.get('_token'))  {
    $('#toSignIn').addClass('d-none');
    $('#toSignOut').removeClass('d-none');
  } else {
    $('#toSignOut').addClass('d-none');
    $('#toSignIn').removeClass('d-none');
  }
  document.getElementById('clock').innerText = new Date().toLocaleString();
  setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleString();
  }, 1000);
})();

$('#signIn').on('click', () => {
  axios({
    method: 'post',
    url   : '/auth/user/do/sign-in',
    data  : {
      identifier: $('#identifier').val(),
      password  : md5($('#password').val()),
    },
  }).then(({data}) => {
    if(!data.code) {
      Cookies.set('_token', data.data.x_auth_token)
      location.reload(true);
    }
  }).catch(({ response }) => {
    $('#errMsg').html(response.data.msg || '网络异常').removeClass('d-none');
  });
});

$('#toSignOut').on('click', () => {
  axios({
    method: 'get',
    url   : '/auth/user/do/sign-out',
    header: { 'x-auth-token': Cookies.get('_token') },
  }).then(() => {
    location.reload(true);
  }).catch(({ response }) => {
    $('#errMsg').html(response.data.msg || '网络异常').removeClass('d-none');
  }).finally (() => {
    Cookies.remove('_token')
  });
});
