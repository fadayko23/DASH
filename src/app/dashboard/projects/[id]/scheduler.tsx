'use client'

import { useState } from 'react'
import { FaCalendarAlt } from 'react-icons/fa'

export default function ScheduleMeeting({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [slots, setSlots] = useState<{ start: string, end: string }[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckAvailability = async () => {
      if (!selectedDate) return
      setIsLoading(true)
      
      const start = new Date(selectedDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(selectedDate)
      end.setHours(23, 59, 59, 999)

      try {
          const res = await fetch(`/api/scheduling/availability?start=${start.toISOString()}&end=${end.toISOString()}`)
          const data = await res.json()
          
          if (data.error) {
              alert(data.error)
              return
          }

          // Simple logic: Assume 9-5 workday, 1h slots, filter out busy
          // Ideally, this logic lives on server or more robust client utility
          // For MVP: Mock generating slots and filtering busy
          const generatedSlots = []
          for (let h = 9; h < 17; h++) {
              const s = new Date(start)
              s.setHours(h, 0, 0, 0)
              const e = new Date(s)
              e.setHours(h + 1, 0, 0, 0)
              
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const isBusy = data.busy.some((b: any) => {
                  const bStart = new Date(b.start)
                  const bEnd = new Date(b.end)
                  return (s >= bStart && s < bEnd) || (e > bStart && e <= bEnd)
              })

              if (!isBusy) {
                  generatedSlots.push({ start: s.toISOString(), end: e.toISOString() })
              }
          }
          setSlots(generatedSlots)

      } catch (e) {
          console.error(e)
      } finally {
          setIsLoading(false)
      }
  }

  const handleBook = async (slot: { start: string, end: string }) => {
      if (!confirm('Book this slot?')) return
      setIsLoading(true)
      try {
          const res = await fetch('/api/scheduling/book', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  projectId,
                  start: slot.start,
                  end: slot.end,
                  title: 'Design Meeting',
                  attendees: [] // Project client is auto-added by server
              })
          })
          const data = await res.json()
          if (data.error) alert(data.error)
          else {
              alert('Meeting booked!')
              setIsOpen(false)
          }
      } catch (e) {
          console.error(e)
      } finally {
          setIsLoading(false)
      }
  }

  return (
    <div className="p-6 border rounded-lg bg-card">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold flex items-center gap-2">
                <FaCalendarAlt className="text-primary" /> Schedule Meeting
            </h3>
            <button onClick={() => setIsOpen(!isOpen)} className="text-sm text-primary hover:underline">
                {isOpen ? 'Close' : 'Open Scheduler'}
            </button>
        </div>

        {isOpen && (
            <div className="space-y-4">
                <div className="flex gap-2">
                    <input 
                        type="date" 
                        className="border rounded px-2 py-1 text-sm" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <button 
                        onClick={handleCheckAvailability}
                        disabled={isLoading || !selectedDate}
                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded text-sm"
                    >
                        Check Availability
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot, idx) => (
                        <button 
                            key={idx}
                            onClick={() => handleBook(slot)}
                            className="p-2 border rounded hover:bg-primary hover:text-primary-foreground text-xs text-center transition-colors"
                        >
                            {new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </button>
                    ))}
                    {slots.length === 0 && !isLoading && selectedDate && <p className="text-xs text-muted-foreground col-span-3">No slots available or check not run.</p>}
                </div>
            </div>
        )}
    </div>
  )
}
