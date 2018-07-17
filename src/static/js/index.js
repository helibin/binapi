/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 19:02:55
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-17 19:06:37
 */
(() => {
  document.getElementById('clock').innerText = new Date().toLocaleString();
  setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleString();
  }, 1000);
})();
