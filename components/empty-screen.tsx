import { UseChatHelpers } from 'ai/react'
import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8 text-white">
        {/* Placeholder for Horizon Estates Logo */}
        <div className="flex justify-center mb-4">
          <img
            src= "hl.png"
            alt="Horizon Estates Logo"
            className="h-20 w-auto"
          />
        </div>
        <h1 className="text-lg font-semibold">Welcome to Horizon Estates!</h1>
        <p className="leading-normal text-muted-foreground">
          Horizon Estates is your gateway to discovering premium real estate opportunities. Whether you are buying, selling, or just exploring, our AI-powered chatbot is here to assist you every step of the way.
        </p>
        <p className="leading-normal text-muted-foreground">
          This platform combines the latest in AI technology with a seamless user experience, ensuring you have all the information you need at your fingertips. Powered by cutting-edge tools and real-time data, we make finding your dream property easier than ever.
        </p>
        <p className="leading-normal text-muted-foreground">
          Ready to explore? Start by asking about trending properties, recent real estate events, or even specific property details. Our chatbot is equipped to guide you through the process.
        </p>
      </div>
    </div>
  )
}