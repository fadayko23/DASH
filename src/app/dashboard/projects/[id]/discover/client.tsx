'use client'

import { useState } from 'react'
import { saveResponse } from "../actions"
import { QuestionTemplate, QuestionResponse } from '@prisma/client'

export default function QuestionListClient({ projectId, questions, initialResponses, spaceId }: { projectId: string, questions: QuestionTemplate[], initialResponses: QuestionResponse[], spaceId?: string }) {
  const [responses, setResponses] = useState<Record<string, string>>(
      initialResponses.reduce((acc, r) => ({ ...acc, [r.questionTemplateId]: r.answerText || '' }), {})
  )
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({})

  const handleBlur = async (questionId: string, value: string) => {
      if (responses[questionId] === value && initialResponses.find(r => r.questionTemplateId === questionId)?.answerText === value) return // No change

      setIsSaving(prev => ({ ...prev, [questionId]: true }))
      try {
          await saveResponse(projectId, questionId, value, spaceId)
      } catch (e) {
          console.error(e)
      } finally {
          setIsSaving(prev => ({ ...prev, [questionId]: false }))
      }
  }

  return (
    <div className="space-y-6 max-w-2xl">
        {questions.map((q) => (
            <div key={q.id} className="space-y-2">
                <label className="block font-medium text-foreground">
                    {q.prompt}
                </label>
                {q.helperText && <p className="text-sm text-muted-foreground">{q.helperText}</p>}
                <textarea 
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[100px]"
                    value={responses[q.id] || ''}
                    onChange={(e) => setResponses(prev => ({ ...prev, [q.id]: e.target.value }))}
                    onBlur={(e) => handleBlur(q.id, e.target.value)}
                    placeholder="Type your answer..."
                />
                {isSaving[q.id] && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
            </div>
        ))}
        {questions.length === 0 && <p className="text-muted-foreground italic">No questions configured for this phase.</p>}
    </div>
  )
}
