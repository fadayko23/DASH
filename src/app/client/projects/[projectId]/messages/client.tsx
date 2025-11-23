'use client'

import { useState, useEffect, useRef } from 'react'
import { FaPaperPlane, FaMicrophone } from 'react-icons/fa'
import { ProjectMessage } from '@prisma/client'

export default function ChatClient({ projectId, initialMessages, senderType }: { projectId: string, initialMessages: ProjectMessage[], senderType: 'client' | 'studio' }) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!newMessage.trim()) return

      setIsSending(true)
      try {
          const res = await fetch(`/api/projects/${projectId}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: newMessage, senderType })
          })
          const msg = await res.json()
          setMessages([...messages, msg])
          setNewMessage('')
      } catch (e) {
          console.error(e)
      } finally {
          setIsSending(false)
      }
  }

  return (
    <>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderType === senderType ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${msg.senderType === senderType ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                        <p className="whitespace-pre-wrap">{msg.body}</p>
                        <span className={`text-xs mt-1 block opacity-70 ${msg.senderType === senderType ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            ))}
            <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t bg-gray-50">
            <form onSubmit={handleSend} className="flex gap-2">
                <button type="button" className="p-2 text-gray-500 hover:text-blue-600" title="Voice Note (Coming Soon)">
                    <FaMicrophone />
                </button>
                <input 
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                    type="submit" 
                    disabled={isSending || !newMessage.trim()}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
                >
                    <FaPaperPlane />
                </button>
            </form>
        </div>
    </>
  )
}
