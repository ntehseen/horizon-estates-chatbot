// components/real-estate/properties.tsx

'use client'

import { useActions, useUIState } from 'ai/rsc'

import type { AI } from '@/lib/chat/actions'

interface Property {
  name: string
  price: number
  location: string
  change: number // Could represent price change, popularity, etc.
}

export function Properties({ props: properties }: { props: Property[] }) {
  const [, setMessages] = useUIState<typeof AI>()
  const { submitUserMessage } = useActions()

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 overflow-y-scroll pb-4 text-sm sm:flex-row">
        {properties.map(property => (
          <button
            key={property.name}
            className="flex cursor-pointer flex-row gap-2 rounded-lg bg-zinc-800 p-4 text-left hover:bg-zinc-700 sm:w-[300px]"
            onClick={async () => {
              const response = await submitUserMessage(`View ${property.name}`)
              setMessages(currentMessages => [...currentMessages, response])
            }}
          >
            <div
              className={`text-xl ${
                property.change > 0 ? 'text-green-600' : 'text-red-600'
              } flex w-11 flex-row justify-center rounded-md bg-white/10 p-2`}
            >
              {property.change > 0 ? '↑' : '↓'}
            </div>
            <div className="flex flex-col">
              <div className="bold uppercase text-zinc-300">{property.name}</div>
              <div className="text-base text-zinc-500">
                ${property.price.toLocaleString()}
              </div>
              <div className="text-xs text-zinc-400">{property.location}</div>
            </div>
            <div className="ml-auto flex flex-col">
              <div
                className={`${
                  property.change > 0 ? 'text-green-600' : 'text-red-600'
                } bold text-right uppercase`}
              >
                {` ${((property.change / property.price) * 100).toFixed(1)}%`}
              </div>
              <div
                className={`${
                  property.change > 0 ? 'text-green-700' : 'text-red-700'
                } text-right text-base`}
              >
                {property.change.toLocaleString()}
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="p-4 text-center text-sm text-zinc-500">
        Note: Data and latency are simulated for illustrative purposes and
        should not be considered as financial advice.
      </div>
    </div>
  )
}