import 'server-only'

import {
  createAI,
  getMutableAIState,
  getAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { openai } from '@ai-sdk/openai'

import { z } from 'zod'
import {
  runAsyncFnWithoutBlocking,
  sleep,
  nanoid
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { Chat, Message } from '@/lib/types'
import { auth } from '@/auth'

async function confirmInquiry(propertyId: string, userId: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  runAsyncFnWithoutBlocking(async () => {
    await sleep(1000)

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: nanoid(),
          role: 'system',
          content: `Your inquiry for property ${propertyId} has been successfully submitted. Our team will get back to you soon.`
        },
        {
          id: nanoid(),
          role: 'system',
          content: `An inquiry for property ${propertyId} has been submitted by user ${userId}.`
        }
      ]
    })
  })

  return {
    newMessage: {
      id: nanoid(),
      display: `Your inquiry for property ${propertyId} has been successfully submitted. Our team will get back to you soon.`
    }
  }
}

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  const result = await streamUI({
    model: openai('gpt-3.5-turbo'),
    initial: `Processing your request...`,
    system: `\
    You are a real estate conversation bot and you can help users buy or rent properties, step by step. You and the user can discuss property listings, adjust filters, or place inquiries.

Messages inside [] means that it is a system message or a user event. For example:

  - “[Price of Property XYZ = $500,000]” means that a property price of XYZ is communicated to the user.
  - “[User has changed the filter to 3 bedrooms]” means that the user has adjusted the filter to show properties with 3 bedrooms.

If the user requests to see property details, provide the details.
If the user wants to adjust search filters, provide the filter options.
If the user wants to view trending properties, provide a list of trending properties.
If the user wants to see recent real estate news or events, provide the relevant information.
If the user wants to inquire about a property, confirm the inquiry submission.
This is Year 2024, Month of August.
`,
    messages: [
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = `${textStream.value}`
      }

      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    },
    tools: {
      listTrendingProperties: {
        description:
          'List three popular properties that are currently trending.',
        parameters: z.object({
          properties: z.array(
            z.object({
              id: z.string().describe('The ID of the property'),
              price: z.number().describe('The price of the property'),
              description: z
                .string()
                .describe('A brief description of the property')
            })
          )
        }),
        generate: async function* ({ properties }) {
          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: properties.map(
                  prop =>
                    `Property ID: ${prop.id}, Price: $${prop.price}, Description: ${prop.description}`
                ).join('\n')
              }
            ]
          })

          return properties.map(
            prop => `Property ID: ${prop.id}, Price: $${prop.price}, Description: ${prop.description}`
          ).join('\n')
        }
      },
      showPropertyDetails: {
        description:
          'Get the details of a specific property. Use this to show the property information to the user.',
        parameters: z.object({
          id: z.string().describe('The ID of the property.'),
          price: z.number().describe('The price of the property.'),
          description: z
            .string()
            .describe('A brief description of the property.')
        }),
        generate: async function* ({ id, price, description }) {
          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: `Property ID: ${id}, Price: $${price}, Description: ${description}`
              }
            ]
          })

          return `Property ID: ${id}, Price: $${price}, Description: ${description}`
        }
      },
      showPropertyInquiryForm: {
        description:
          'Show the UI to submit an inquiry for a property. Use this if the user wants to inquire about a property.',
        parameters: z.object({
          propertyId: z
            .string()
            .describe(
              'The ID of the property the user wants to inquire about.'
            ),
          userId: z
            .string()
            .describe('The ID of the user submitting the inquiry.')
        }),
        generate: async function* ({ propertyId, userId }) {
          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: `Submitting inquiry for property ${propertyId} by user ${userId}...`
              }
            ]
          })

          return `Submitting inquiry for property ${propertyId} by user ${userId}...`
        }
      },
      getRealEstateEvents: {
        description:
          'List recent real estate news or events between user-highlighted dates.',
        parameters: z.object({
          events: z.array(
            z.object({
              date: z
                .string()
                .describe('The date of the event, in ISO-8601 format'),
              headline: z.string().describe('The headline of the event'),
              description: z.string().describe('The description of the event')
            })
          )
        }),
        generate: async function* ({ events }) {
          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: events.map(
                  event => `Event Date: ${event.date}, Headline: ${event.headline}, Description: ${event.description}`
                ).join('\n')
              }
            ]
          })

          return events.map(
            event => `Event Date: ${event.date}, Headline: ${event.headline}, Description: ${event.description}`
          ).join('\n')
        }
      }
    }
  })

  return {
    id: nanoid(),
    display: result.value
  }
}

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    confirmInquiry
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState() as Chat

      if (aiState) {
        const uiState = getUIStateFromAIState{(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`

      const firstMessageContent = messages[0].content as string
      const title = firstMessageContent.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        userId,
        createdAt,
        messages,
        path,
        title
      }

      await saveChat( {chat} )
    }
  }
})

function getUIStateFromAIState(aiState: AIState): UIState {
  return aiState.messages.map(message => ({
    id: message.id,
    display: `${message.role.toUpperCase()}: ${message.content}`
  }))
}