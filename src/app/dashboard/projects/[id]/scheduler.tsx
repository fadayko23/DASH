'use client'

import { useState } from 'react'
import { FaCalendarAlt, FaMicrophone, FaRobot, FaTasks } from 'react-icons/fa'
import { useQuery } from '@tanstack/react-query'

export default function ScheduleMeeting({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [slots, setSlots] = useState<{ start: string, end: string }[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecordingOpen, setIsRecordingOpen] = useState(false)

  // Existing scheduling logic...
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
                  attendees: []
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
    <div className="space-y-6">
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

        <div className="p-6 border rounded-lg bg-card">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                    <FaMicrophone className="text-primary" /> Meeting Recordings & AI
                </h3>
                <button onClick={() => setIsRecordingOpen(!isRecordingOpen)} className="text-sm text-primary hover:underline">
                    {isRecordingOpen ? 'Close' : 'Manage Recordings'}
                </button>
            </div>
            {isRecordingOpen && <MeetingRecordingsManager projectId={projectId} />}
        </div>
    </div>
  )
}

function MeetingRecordingsManager({ projectId }: { projectId: string }) {
    // In a real app, we would list meetings first, then recordings for selected meeting
    // For MVP, we'll just fetch recordings for the *first* meeting or a mock meeting ID logic
    // Actually, we need meetingId to upload. 
    // Let's fetch meetings for this project first.
    
    const { data: meetings } = useQuery({
        queryKey: ['meetings', projectId],
        queryFn: () => fetch(`/api/projects/${projectId}/meetings`).then(res => res.json())
    })

    return (
        <div className="space-y-4">
            {meetings?.length === 0 && <p className="text-sm text-muted-foreground">No meetings scheduled yet.</p>}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {meetings?.map((meeting: any) => (
                <MeetingRow key={meeting.id} meeting={meeting} />
            ))}
        </div>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MeetingRow({ meeting }: { meeting: any }) {
    const [uploading, setUploading] = useState(false)
    const { data: recordings, refetch } = useQuery({
        queryKey: ['recordings', meeting.id],
        queryFn: () => fetch(`/api/meetings/${meeting.id}/recordings`).then(res => res.json())
    })

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return
        setUploading(true)
        const formData = new FormData()
        formData.append('file', e.target.files[0])
        
        await fetch(`/api/meetings/${meeting.id}/recordings`, {
            method: 'POST',
            body: formData
        })
        setUploading(false)
        refetch()
    }

    return (
        <div className="border rounded p-4 space-y-3">
            <div className="flex justify-between">
                <span className="font-medium text-sm">{meeting.title} ({new Date(meeting.startDateTime).toLocaleDateString()})</span>
                <label className="cursor-pointer bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs hover:opacity-80">
                    {uploading ? 'Uploading...' : 'Upload Recording'}
                    <input type="file" className="hidden" accept="audio/*,video/*" onChange={handleUpload} />
                </label>
            </div>
            
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {recordings?.map((rec: any) => (
                <RecordingItem key={rec.id} recording={rec} meetingId={meeting.id} onUpdate={refetch} />
            ))}
        </div>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RecordingItem({ recording, meetingId, onUpdate }: { recording: any, meetingId: string, onUpdate: () => void }) {
    const [processing, setProcessing] = useState(false)
    const [creatingTasks, setCreatingTasks] = useState(false)

    const handleProcess = async () => {
        setProcessing(true)
        await fetch(`/api/meetings/${meetingId}/recordings/${recording.id}/process`, { method: 'POST' })
        setProcessing(false)
        onUpdate()
    }

    const handleCreateTasks = async () => {
        setCreatingTasks(true)
        const res = await fetch(`/api/meetings/${meetingId}/recordings/${recording.id}/create-tasks`, { method: 'POST' })
        const data = await res.json()
        alert(`Created ${data.createdCount} tasks!`)
        setCreatingTasks(false)
    }

    return (
        <div className="bg-muted/30 p-3 rounded text-sm space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">ID: {recording.id.slice(-6)}</span>
                <div className="flex gap-2">
                    <button 
                        onClick={handleProcess}
                        disabled={processing}
                        className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
                    >
                        <FaRobot /> {processing ? 'Processing...' : 'AI Summary'}
                    </button>
                    {recording.actionItemsJson && (
                        <button 
                            onClick={handleCreateTasks}
                            disabled={creatingTasks}
                            className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 disabled:opacity-50"
                        >
                            <FaTasks /> Create Tasks
                        </button>
                    )}
                </div>
            </div>
            
            {recording.transcript && (
                <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Show Transcript</summary>
                    <div className="mt-1 p-2 bg-background border rounded max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {recording.transcript}
                    </div>
                </details>
            )}

            {recording.summary && (
                <div className="bg-blue-50 p-2 rounded border border-blue-100">
                    <p className="font-semibold text-xs text-blue-800 mb-1">AI Summary:</p>
                    <p className="text-xs text-blue-900">{recording.summary}</p>
                </div>
            )}

            {recording.actionItemsJson && (
                <div className="bg-green-50 p-2 rounded border border-green-100">
                    <p className="font-semibold text-xs text-green-800 mb-1">Action Items:</p>
                    <ul className="list-disc list-inside text-xs text-green-900">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(recording.actionItemsJson as any[]).map((item, i) => (
                            <li key={i}>
                                <strong>{item.title}</strong> ({item.assignee || 'Unassigned'}) - Due: {item.dueDate || 'N/A'}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
