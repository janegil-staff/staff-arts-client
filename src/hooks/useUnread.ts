import { useEffect, useState } from 'react'
import api from '../services/api'
import { getSocket } from '../services/socket'

let globalUnread = 0
const listeners: ((n: number) => void)[] = []

export function notifyUnreadChange(n: number) {
  globalUnread = Math.max(0, n)
  listeners.forEach(l => l(globalUnread))
}

export function decrementUnread(by = 1) {
  notifyUnreadChange(globalUnread - by)
}

export function useUnreadTotal() {
  const [unread, setUnread] = useState(globalUnread)

  useEffect(() => {
    listeners.push(setUnread)

    const token = localStorage.getItem('token')
    if (!token) {
      return () => {
        const i = listeners.indexOf(setUnread)
        if (i > -1) listeners.splice(i, 1)
      }
    }

    // Fetch initial count
    api.get('/conversations/unread')
      .then(r => {
        const data = r.data.data || {}
        const total = Object.values(data).reduce((sum: number, v: any) => sum + Number(v), 0)
        notifyUnreadChange(total)
      })
      .catch(() => {})

    // Connect socket and listen
    const socket = getSocket()

    const onNewMessage = (msg: any) => {
      const storedId = localStorage.getItem('myUserId') || ''
      const senderId = typeof msg.sender === 'object'
        ? (msg.sender?._id || msg.sender?.id || '')
        : (msg.sender || '')
      if (senderId !== storedId) {
        notifyUnreadChange(globalUnread + 1)
      }
    }

    const onConnect = () => {
      // Join user room when connected
      const userId = localStorage.getItem('myUserId')
      if (userId) socket.emit('join_user_room', userId)
    }

    socket.on('connect', onConnect)
    socket.on('new_message', onNewMessage)

    // If already connected, join user room immediately
    if (socket.connected) onConnect()

    // Poll every 30s as fallback
    const interval = setInterval(() => {
      api.get('/conversations/unread')
        .then(r => {
          const data = r.data.data || {}
          const total = Object.values(data).reduce((sum: number, v: any) => sum + Number(v), 0)
          notifyUnreadChange(total)
        })
        .catch(() => {})
    }, 30000)

    return () => {
      const i = listeners.indexOf(setUnread)
      if (i > -1) listeners.splice(i, 1)
      socket.off('connect', onConnect)
      socket.off('new_message', onNewMessage)
      clearInterval(interval)
    }
  }, [])

  return unread
}
