/*
 * @Author: helibin@139.com
 * @Date: 2018-08-01 22:56:54
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-01 23:01:29
 */
export default io => async (socket) => {
  console.log('a user connected', socket.id);

  // 连接成功，开始监听
  socket.on('message', (event) => {
    console.log('Received message from client!', event);
  });

  socket.on('chat', (data) => {
    console.log(data);
    io.emit('chat', data);
  });

  // 连接失败
  socket.on('disconnect', () => {
    console.log('Server has disconnected');
  });
};
