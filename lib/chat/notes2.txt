import 'server-only'

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { openai } from '@ai-sdk/openai'

import {
  spinner,
  BotCard,
  BotMessage,
  SystemMessage,
  Property
} from '@/components/stocks'

import { InquiryForm } from '@/components/stocks/inquiry-form'

import { z } from 'zod'
import { EventsSkeleton } from '@/components/stocks/events-skeleton'
import { Events } from '@/components/stocks/events'
import { PropertiesSkeleton } from '@/components/stocks/stocks-skeleton'
import { Properties } from '@/components/stocks/stock'
import { PropertySkeleton } from '@/components/stocks/stock-skeleton'
import {
  formatNumber,
  runAsyncFnWithoutBlocking,
  sleep,
  nanoid
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Chat, Message } from '@/lib/types'
import { auth } from '@/auth'

async function confirmInquiry(propertyId: string, userId: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  const inquiring = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p className="mb-2">Submitting inquiry for property {propertyId}...</p>
    </div>
  )

  const systemMessage = createStreamableUI(null)

  runAsyncFnWithoutBlocking(async () => {
    await sleep(1000)

    inquiring.update(
      <div className="inline-flex items-start gap-1 md:items-center">
        {spinner}
        <p className="mb-2">
          Submitting inquiry for property {propertyId}... working on it...
        </p>
      </div>
    )

    await sleep(1000)

    inquiring.done(
      <div>
        <p className="mb-2">
          Your inquiry for property {propertyId} has been successfully
          submitted. Our team will get back to you soon.
        </p>
      </div>
    )

    systemMessage.done(
      <SystemMessage>
        An inquiry for property {propertyId} has been submitted by user {userId}
        .
      </SystemMessage>
    )

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: nanoid(),
          role: 'system',
          content: `[User has submitted an inquiry for property ${propertyId}]`
        }
      ]
    })
  })

  return {
    inquiryUI: inquiring.value,
    newMessage: {
      id: nanoid(),
      display: systemMessage.value
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
    initial: <SpinnerMessage />,
    system: `\
    You are a real estate conversation bot and you can help users buy or rent properties, step by step. You and the user can discuss property listings, adjust filters, or place inquiries, in the UI.

Messages inside [] means that it’s a UI element or a user event. For example:

  - “[Price of Property XYZ = $500,000]” means that an interface of the property price of XYZ is shown to the user.
  - “[User has changed the filter to 3 bedrooms]” means that the user has adjusted the filter to show properties with 3 bedrooms.

If the user requests to see property details, call show_property_details to display the property information.
If the user wants to adjust search filters, call show_search_filters to show the filter options.
If the user wants to view trending properties, call list_trending_properties.
If the user wants to see recent real estate news or events, call get_real_estate_events.
If the user wants to inquire about a property, call show_property_inquiry_form.
If you want to show general information or answer questions, you can chat with users and provide calculations if needed.
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
        textNode = <BotMessage content={textStream.value} />
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
          yield (
            <BotCard>
              <PropertiesSkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'listTrendingProperties',
                    toolCallId,
                    args: { properties }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'listTrendingProperties',
                    toolCallId,
                    result: properties
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <Properties props={properties} />
            </BotCard>
          )
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
          yield (
            <BotCard>
              <PropertySkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'showPropertyDetails',
                    toolCallId,
                    args: { id, price, description }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'showPropertyDetails',
                    toolCallId,
                    result: { id, price, description }
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <Property props={{ id, price, description }} />
            </BotCard>
          )
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
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'showPropertyInquiryForm',
                    toolCallId,
                    args: { propertyId, userId }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'showPropertyInquiryForm',
                    toolCallId,
                    result: {
                      propertyId,
                      userId
                    }
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <InquiryForm
                props={{
                  propertyId,
                  userId,
                  status: 'requires_action'
                }}
              />
            </BotCard>
          )
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
          yield (
            <BotCard>
              <EventsSkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'getRealEstateEvents',
                    toolCallId,
                    args: { events }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'getRealEstateEvents',
                    toolCallId,
                    result: events
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <Events props={events} />
            </BotCard>
          )
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
        const uiState = getUIStateFromAIState(aiState)
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
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'tool' ? (
          message.content.map(tool => {
            return tool.toolName === 'listTrendingProperties' ? (
              <BotCard>
                {/* TODO: Infer types based on the tool result*/}

                <Properties props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'showPropertyDetails' ? (
              <BotCard>
                <Property props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'showPropertyInquiryForm' ? (
              <BotCard>
                <InquiryForm props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'getRealEstateEvents' ? (
              <BotCard>
                <Events props={tool.result} />
              </BotCard>
            ) : null
          })
        ) : message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage content={message.content} />
        ) : null
    }))
}

// Changes made:

// 1. **Renamed components and actions** to better fit a real estate context (e.g., `Property`, `InquiryForm`, `listTrendingProperties`).
// 2. **Updated function names and descriptions** to reflect real estate activities instead of stock market actions (e.g., `confirmInquiry`).
// 3. **Updated system and tool descriptions** to match real estate operations.
