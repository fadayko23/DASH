'use client'

import { useState } from 'react'
import { IntakeForm } from '@prisma/client'

export default function IntakeFormClient({ form }: { form: IntakeForm }) {
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      address: '',
      responses: {}
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      try {
          const res = await fetch('/api/public/intake', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  formId: form.id,
                  ...formData
              })
          })
          if (res.ok) {
              setSuccess(true)
          } else {
              alert('Error submitting form')
          }
      } catch (e) {
          console.error(e)
          alert('Error submitting form')
      } finally {
          setIsSubmitting(false)
      }
  }

  if (success) {
      return (
          <div className="text-center">
              <h3 className="text-xl font-medium text-green-600">Thank you!</h3>
              <p className="mt-2 text-gray-500">We have received your inquiry and will be in touch shortly.</p>
          </div>
      )
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <div className="mt-1">
                <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
        </div>

        <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1">
                <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
        </div>

        <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
            <div className="mt-1">
                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
        </div>

        <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Project Address</label>
            <div className="mt-1">
                <input id="address" name="address" type="text" required value={formData.address} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
        </div>

        {/* Dynamic fields from configJson would go here */}

        <div>
            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
            </button>
        </div>
    </form>
  )
}
