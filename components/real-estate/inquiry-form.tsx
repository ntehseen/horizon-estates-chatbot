// components/real-estate/inquiry-form.tsx

'use client'

import { useState } from 'react'

export function InquiryForm({ property }: { property: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    // Simulate form submission logic, e.g., sending the data to a backend or chatbot.
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulated delay
    alert('Your inquiry has been submitted successfully!')

    // Clear form fields
    setName('')
    setEmail('')
    setPhone('')
    setMessage('')
    setSubmitted(false)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto p-6 bg-zinc-900 rounded-lg">
      <h2 className="text-2xl text-zinc-100 mb-4">Inquire About {property}</h2>

      <div className="mb-4">
        <label className="block text-zinc-400 text-sm font-bold mb-2" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 rounded-md bg-zinc-800 text-zinc-200"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-zinc-400 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded-md bg-zinc-800 text-zinc-200"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-zinc-400 text-sm font-bold mb-2" htmlFor="phone">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 rounded-md bg-zinc-800 text-zinc-200"
        />
      </div>

      <div className="mb-6">
        <label className="block text-zinc-400 text-sm font-bold mb-2" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 rounded-md bg-zinc-800 text-zinc-200 h-24"
          required
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={submitted}
          className={`px-4 py-2 rounded-md ${
            submitted ? 'bg-zinc-700' : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          {submitted ? 'Submitting...' : 'Submit Inquiry'}
        </button>
      </div>
    </form>
  )
}