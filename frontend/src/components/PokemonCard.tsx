import { useState, useEffect, useRef } from 'react'
import type { PokemonLite } from '../types'

function TypeBadge({ t }: { t: string }) {
  return (
    <span className="px-1.5 py-0.5 text-xs rounded border border-zinc-300 uppercase tracking-wide">
      {t}
    </span>
  )
}

export default function PokemonCard({
  mon,
  selected,
  onSelect
}: {
  mon: PokemonLite
  selected: boolean
  onSelect: () => void
}) {
  const [showStats, setShowStats] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Keyboard handlers
  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.target !== cardRef.current) return

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSelect()
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        setShowStats(prev => !prev)
      }
    }

    const card = cardRef.current
    if (card) {
      card.addEventListener('keydown', handleKeyDown)
      return () => card.removeEventListener('keydown', handleKeyDown)
    }
  }, [onSelect])

  function onCardClick(e: React.MouseEvent) {
    // Don't select if clicking on details controls
    const target = e.target as HTMLElement
    if (target.closest('[data-role="details-toggle"]')) return
    onSelect()
  }

  function toggleStats() {
    setShowStats(prev => !prev)
  }

  return (
    <div
      ref={cardRef}
      role="group"
      aria-roledescription="Pokémon card"
      tabIndex={0}
      className={[
        'relative w-full h-full overflow-hidden',
        'border border-zinc-300 bg-zinc-50',
        selected ? 'ring-2 ring-indigo-500 border-indigo-500' : '',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500'
      ].join(' ')}
      onClick={onCardClick}
    >
      {/* Corner chevron - always visible */}
      <button
        type="button"
        data-role="details-toggle"
        aria-label={showStats ? `Hide details` : `Show details for ${mon.name}`}
        title={showStats ? 'Hide stats' : 'Show stats'}
        onClick={toggleStats}
        className={[
          'absolute top-2 right-2 z-20',
          'h-7 w-7 rounded border border-zinc-300 bg-white',
          'flex items-center justify-center text-zinc-700 text-sm',
          'hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500',
          'sm:h-7 sm:w-7' // Ensure 40px hitbox on mobile
        ].join(' ')}
      >
        {showStats ? '◂' : '▸'}
      </button>

      {/* Front layer (image + name) */}
      <div
        className={[
          'absolute inset-0 p-3',
          'flex flex-col justify-between items-center',
          'transition-opacity duration-200 ease-in-out',
          showStats ? 'opacity-0 pointer-events-none' : 'opacity-100'
        ].join(' ')}
      >
        <div className="flex-1 flex items-center justify-center pt-8">
          {mon.spriteUrl ? (
            <img
              src={mon.spriteUrl}
              alt={mon.name}
              className="h-16 w-16 object-contain sm:h-20 sm:w-20"
            />
          ) : (
            <div className="h-16 w-16 bg-zinc-200 rounded sm:h-20 sm:w-20" />
          )}
        </div>

        <div className="text-center">
          <div className="text-base font-semibold capitalize">{mon.name}</div>
        </div>

        {/* Details button */}
        <div className="w-full mt-2">
          <button
            type="button"
            data-role="details-toggle"
            onClick={toggleStats}
            className="w-full text-xs py-1.5 rounded border border-zinc-300 bg-white hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label={
              showStats ? `Hide details` : `Show details for ${mon.name}`
            }
          >
            {showStats ? 'Back' : 'Details'}
          </button>
        </div>
      </div>

      {/* Stats layer */}
      <div
        className={[
          'absolute inset-0 p-3',
          'transition-opacity duration-200 ease-in-out',
          showStats
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        ].join(' ')}
      >
        {/* Header strip */}
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 mb-2">
          {mon.spriteUrl ? (
            <img src={mon.spriteUrl} alt="" className="h-6 w-6 sm:h-8 sm:w-8" />
          ) : (
            <div className="h-6 w-6 bg-zinc-200 rounded sm:h-8 sm:w-8" />
          )}
          <div className="font-semibold capitalize text-sm truncate flex-1">
            {mon.name}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {mon.types.slice(0, 2).map(t => (
              <TypeBadge key={t} t={t} />
            ))}
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Left: Stats */}
          <div className="space-y-1">
            <Stat label="HP" v={mon.baseStats.hp} />
            <Stat label="ATK" v={mon.baseStats.attack} />
            <Stat label="DEF" v={mon.baseStats.defense} />
            <Stat label="SpA" v={mon.baseStats.spAttack} />
            <Stat label="SpD" v={mon.baseStats.spDefense} />
            <Stat label="SPD" v={mon.baseStats.speed} />
          </div>

          {/* Right: Meta */}
          <div className="space-y-1">
            <Meta label="Height" value={`${mon.height}m`} />
            <Meta label="Weight" value={`${mon.weight}kg`} />
            {/* Show type badges if space allows */}
            <div className="pt-1">
              <div className="text-[10px] uppercase text-zinc-500 mb-1">
                Types
              </div>
              <div className="flex flex-wrap gap-1">
                {mon.types.map(t => (
                  <TypeBadge key={t} t={t} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screen reader announcements */}
      <div aria-live="polite" className="sr-only">
        {showStats
          ? `Details shown for ${mon.name}`
          : `Details hidden for ${mon.name}`}
      </div>
    </div>
  )
}

function Stat({ label, v }: { label: string; v: number }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-0.5">
      <span className="text-[10px] uppercase text-zinc-500 truncate">
        {label}
      </span>
      <span className="font-medium tabular-nums ml-1">{v}</span>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-0.5">
      <span className="text-[10px] uppercase text-zinc-500 truncate">
        {label}
      </span>
      <span className="font-medium ml-1">{value}</span>
    </div>
  )
}
