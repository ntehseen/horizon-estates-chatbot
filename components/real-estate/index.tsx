// // components/real-estate/index.tsx

// 'use client'

// import dynamic from 'next/dynamic'
// import {  PropertySkeleton  } from './property-skeleton'
// import {PropertiesSkeleton } from './properties-skeleton'
// import { EventsSkeleton } from './events-skeleton'
// // import { PurchaseSkeleton } from './stock-purchase-skeleton' // Adjusted for real estate

// export { spinner } from './spinner'
// export { BotCard, BotMessage, SystemMessage } from './message'

// const Property = dynamic(() => import('./property').then(mod => mod.Property), {
//   ssr: false,
//   loading: () => <PropertySkeleton /> // Updated to match real estate
// })

// const Inquiry = dynamic(
//   () => import('./property-inquiry').then(mod => mod.Inquiry), // Adjusted for real estate
//   {
//     ssr: false,
//     loading: () => (
//       <div className="h-[375px] rounded-xl border bg-zinc-950 p-4 text-green-400 sm:h-[314px]" />
//     )
//   }
// )

// const Properties = dynamic(() => import('./properties').then(mod => mod.Properties), {
//   ssr: false,
//   loading: () => <PropertiesSkeleton /> // Updated to match real estate
// })

// const Events = dynamic(() => import('./events').then(mod => mod.Events), {
//   ssr: false,
//   loading: () => <EventsSkeleton />
// })

// export { Property, Inquiry, Properties, Events }