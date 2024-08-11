// components/real-estate/properties-skeleton.tsx

export const PropertiesSkeleton = () => {
  return (
    <div className="mb-4 flex flex-col gap-2 overflow-y-scroll pb-4 text-sm sm:flex-row">
      <div className="flex h-[120px] w-full cursor-pointer flex-row gap-2 rounded-lg bg-zinc-800 p-4 text-left hover:bg-zinc-800 sm:w-[300px]"></div>
      <div className="flex h-[120px] w-full cursor-pointer flex-row gap-2 rounded-lg bg-zinc-800 p-4 text-left hover:bg-zinc-800 sm:w-[300px]"></div>
      <div className="flex h-[120px] w-full cursor-pointer flex-row gap-2 rounded-lg bg-zinc-800 p-4 text-left hover:bg-zinc-800 sm:w-[300px]"></div>
    </div>
  )
}