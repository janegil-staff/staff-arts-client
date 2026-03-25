import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io('https://staff-arts-api.onrender.com', {
      transports: ['websocket'],
      autoConnect: false,
    })
  }
  if (!socket.connected) {
    const token = localStorage.getItem('token')
    if (token) {
      socket.auth = { token }
      socket.connect()
    }
  }
  return socket
}

export function reconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
  return getSocket()
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
