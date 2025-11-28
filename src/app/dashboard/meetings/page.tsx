'use client'

import { useState, useEffect } from 'react'
import { format, isToday, isTomorrow, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { FiCalendar, FiClock, FiMapPin, FiVideo, FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi'

interface Meeting {
  id: string
  title: string
  type: string
  startDateTime: string
  endDateTime: string
  location: string | null
  project: {
    id: string
    name: string
  }
  client: {
    id: string
    name: string
    email: string | null
  }
  recordings: Array<{
    id: string
    storageUrl: string
  }>
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)

  useEffect(() => {
    fetchMeetings()
  }, [currentDate, view])

  const fetchMeetings = async () => {
    try {
      setLoading(true)
      let startDate: string | null = null
      let endDate: string | null = null

      if (view === 'week') {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
        startDate = weekStart.toISOString()
        endDate = weekEnd.toISOString()
      } else if (view === 'month') {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        startDate = monthStart.toISOString()
        endDate = monthEnd.toISOString()
      }

      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/meetings?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setMeetings(data)
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'discover':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'kickoff':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'followup':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getMeetingTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM d, yyyy')
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() + 7)
    }
    setCurrentDate(newDate)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const weekDays = view === 'week' ? eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: 0 }),
    end: endOfWeek(currentDate, { weekStartsOn: 0 })
  }) : []

  const getMeetingsForDay = (date: Date) => {
    return meetings.filter(meeting => 
      isSameDay(new Date(meeting.startDateTime), date)
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Meetings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your meetings and recordings
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <FiPlus className="w-4 h-4" />
          New Meeting
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === 'list'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === 'week'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === 'month'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Month
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => view === 'week' ? navigateWeek('prev') : navigateMonth('prev')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium min-w-[200px] text-center">
            {view === 'week'
              ? `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`
              : format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => view === 'week' ? navigateWeek('next') : navigateMonth('next')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'list' ? (
        <div className="space-y-4">
          {meetings.length === 0 ? (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <FiCalendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No meetings scheduled</p>
            </div>
          ) : (
            meetings.map((meeting) => (
              <div
                key={meeting.id}
                onClick={() => setSelectedMeeting(meeting)}
                className="bg-background border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{meeting.title}</h3>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getMeetingTypeColor(meeting.type)}`}>
                        {getMeetingTypeLabel(meeting.type)}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4" />
                        <span>
                          {formatDate(meeting.startDateTime)} • {formatTime(meeting.startDateTime)} - {formatTime(meeting.endDateTime)}
                        </span>
                      </div>
                      {meeting.location && (
                        <div className="flex items-center gap-2">
                          <FiMapPin className="w-4 h-4" />
                          <span>{meeting.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">Project:</span>
                        <span>{meeting.project.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">Client:</span>
                        <span>{meeting.client.name}</span>
                      </div>
                    </div>
                  </div>
                  {meeting.recordings.length > 0 && (
                    <div className="flex items-center gap-2 text-primary">
                      <FiVideo className="w-5 h-5" />
                      <span className="text-sm font-medium">{meeting.recordings.length}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : view === 'week' ? (
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayMeetings = getMeetingsForDay(day)
            const isCurrentDay = isToday(day)
            
            return (
              <div
                key={index}
                className={`min-h-[400px] border rounded-lg p-3 ${
                  isCurrentDay ? 'bg-primary/5 border-primary' : 'bg-background border-border'
                }`}
              >
                <div className={`text-sm font-medium mb-3 ${isCurrentDay ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div>{format(day, 'EEE')}</div>
                  <div className={`text-lg mt-1 ${isCurrentDay ? 'text-primary font-bold' : ''}`}>
                    {format(day, 'd')}
                  </div>
                </div>
                <div className="space-y-2">
                  {dayMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      onClick={() => setSelectedMeeting(meeting)}
                      className={`p-2 rounded-md text-xs cursor-pointer hover:opacity-80 transition-opacity ${getMeetingTypeColor(meeting.type)}`}
                    >
                      <div className="font-medium truncate">{meeting.title}</div>
                      <div className="text-xs opacity-75">{formatTime(meeting.startDateTime)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-background border border-border rounded-lg p-6">
          <p className="text-center text-muted-foreground">Month view coming soon</p>
        </div>
      )}

      {/* Meeting Detail Modal */}
      {selectedMeeting && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMeeting(null)}
        >
          <div
            className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedMeeting.title}</h2>
                <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${getMeetingTypeColor(selectedMeeting.type)}`}>
                  {getMeetingTypeLabel(selectedMeeting.type)}
                </span>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Date & Time</h3>
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {format(new Date(selectedMeeting.startDateTime), 'EEEE, MMMM d, yyyy')} • {formatTime(selectedMeeting.startDateTime)} - {formatTime(selectedMeeting.endDateTime)}
                  </span>
                </div>
              </div>

              {selectedMeeting.location && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedMeeting.location}</span>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Project</h3>
                <span>{selectedMeeting.project.name}</span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Client</h3>
                <div>
                  <div>{selectedMeeting.client.name}</div>
                  {selectedMeeting.client.email && (
                    <div className="text-sm text-muted-foreground">{selectedMeeting.client.email}</div>
                  )}
                </div>
              </div>

              {selectedMeeting.recordings.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Recordings</h3>
                  <div className="space-y-2">
                    {selectedMeeting.recordings.map((recording) => (
                      <div
                        key={recording.id}
                        className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                      >
                        <FiVideo className="w-5 h-5 text-primary" />
                        <a
                          href={recording.storageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View Recording
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
