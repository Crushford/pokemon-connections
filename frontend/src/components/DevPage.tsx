import { useEffect, useMemo, useState } from 'react'
import {
  addAnimal,
  addAnimalPuzzle,
  addCategory,
  listAnimals,
  listAnimalPuzzles,
  listCategories
} from '../lib/api'

export default function DevPage() {
  const [animals, setAnimals] = useState<
    Record<string, { wikipediaUrl: string; categories: string[] }>
  >({})
  const [categories, setCategories] = useState<
    Record<
      string,
      {
        description?: string
        members?: string[]
        redHerrings?: string[]
        difficulty?: number
      }
    >
  >({})
  const [puzzles, setPuzzles] = useState<
    { id: string; categories: string[]; createdAt: string }[]
  >([])

  const [animalName, setAnimalName] = useState('')
  const [animalUrl, setAnimalUrl] = useState('')
  const [animalCategories, setAnimalCategories] = useState<string>('')

  const [categoryName, setCategoryName] = useState('')
  const [categoryDesc, setCategoryDesc] = useState('')
  const [categoryMembers, setCategoryMembers] = useState<string>('')
  const [categoryAddSuccess, setCategoryAddSuccess] = useState('')
  const [categoryAddError, setCategoryAddError] = useState('')
  const [categoryDifficulty, setCategoryDifficulty] = useState<string>('')

  const [puzzleCats, setPuzzleCats] = useState<string>('')

  // JSON input states
  const [categoryJsonInput, setCategoryJsonInput] = useState('')
  const [animalJsonInput, setAnimalJsonInput] = useState('')
  const [puzzleJsonInput, setPuzzleJsonInput] = useState('')
  const [categoryJsonError, setCategoryJsonError] = useState('')
  const [animalJsonError, setAnimalJsonError] = useState('')
  const [puzzleJsonError, setPuzzleJsonError] = useState('')

  // Copy/paste filled JSON for missing animal info
  const [animalsPasteJson, setAnimalsPasteJson] = useState('')
  const [animalsPasteError, setAnimalsPasteError] = useState('')
  const [animalsPasteSuccess, setAnimalsPasteSuccess] = useState('')
  const [copiedMissingJson, setCopiedMissingJson] = useState(false)

  // Category assignment states
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([])
  const [categoryAssignmentSuccess, setCategoryAssignmentSuccess] = useState('')

  // Missing Category Info tooling
  const [categoriesPasteJson, setCategoriesPasteJson] = useState('')
  const [categoriesPasteError, setCategoriesPasteError] = useState('')
  const [categoriesPasteSuccess, setCategoriesPasteSuccess] = useState('')
  const [copiedMissingCategoriesJson, setCopiedMissingCategoriesJson] =
    useState(false)

  const categoryList = useMemo(
    () => Object.keys(categories).sort((a, b) => a.localeCompare(b)),
    [categories]
  )

  async function refreshAll() {
    const [a, c, p] = await Promise.all([
      listAnimals(),
      listCategories(),
      listAnimalPuzzles()
    ])
    setAnimals(a.animals)
    setCategories(c.categories)
    setPuzzles(p.puzzles)
  }

  useEffect(() => {
    refreshAll().catch(() => {})
  }, [])

  // Helpers for difficulty colors (NYT style: 1-yellow, 2-green, 3-blue, 4-purple)
  function getDifficultyColorClasses(d?: number): string {
    switch (d) {
      case 1:
        return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30'
      case 2:
        return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
      case 3:
        return 'bg-blue-500/20 text-blue-200 border-blue-500/30'
      case 4:
        return 'bg-purple-500/20 text-purple-200 border-purple-500/30'
      default:
        return 'bg-gray-500/20 text-gray-200 border-gray-500/30'
    }
  }

  async function onAddAnimal(e: React.FormEvent) {
    e.preventDefault()
    const categoriesArr = animalCategories
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    await addAnimal({
      name: animalName.trim(),
      wikipediaUrl: animalUrl.trim(),
      categories: categoriesArr
    })
    setAnimalName('')
    setAnimalUrl('')
    setAnimalCategories('')
    await refreshAll()
  }

  // Helpers for missing info JSON
  function isPlaceholderUrl(name: string, url: string | undefined): boolean {
    if (!url) return true
    const expected = `https://en.wikipedia.org/wiki/${name.replace(/\s+/g, '_')}`
    return url === expected
  }

  function hasRealInfo(animal: {
    wikipediaUrl: string
    categories: string[]
  }): boolean {
    if (!animal.wikipediaUrl) return false
    if (animal.wikipediaUrl === '') return false
    if (animal.categories.length === 0) return false
    if (animal.categories.every(cat => cat === '')) return false
    return true
  }

  function buildMissingAnimalsJson(): {
    animals: Record<string, { wikipediaUrl: string; categories: string[] }>
  } {
    const entries = Object.entries(animals).filter(
      ([name, a]) => !hasRealInfo(a)
    )
    const result: Record<
      string,
      { wikipediaUrl: string; categories: string[] }
    > = {}
    for (const [name] of entries) {
      result[name] = { wikipediaUrl: '', categories: [''] }
    }
    return { animals: result }
  }

  // Missing Category Info helpers
  function isMissingCategoryInfo(catName: string): boolean {
    const c = categories[catName]
    const descMissing = !c?.description || c.description.trim() === ''
    const diffMissing = !c?.difficulty || c.difficulty < 1 || c.difficulty > 4
    return descMissing || diffMissing
  }

  function buildMissingCategoriesJson(): {
    categories: Record<
      string,
      { description: string; difficulty: number | null }
    >
  } {
    const result: Record<
      string,
      { description: string; difficulty: number | null }
    > = {}
    for (const name of Object.keys(categories)) {
      if (isMissingCategoryInfo(name)) {
        result[name] = {
          description: categories[name]?.description ?? '',
          difficulty: categories[name]?.difficulty ?? null
        }
      }
    }
    return { categories: result }
  }

  async function onCopyMissingCategoriesJson() {
    setCopiedMissingCategoriesJson(false)
    const payload = buildMissingCategoriesJson()
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
      setCopiedMissingCategoriesJson(true)
    } catch {
      setCopiedMissingCategoriesJson(false)
    }
  }

  async function onApplyCategoriesJson(e: React.FormEvent) {
    e.preventDefault()
    setCategoriesPasteError('')
    setCategoriesPasteSuccess('')
    try {
      const parsed = JSON.parse(categoriesPasteJson) as {
        categories: Record<
          string,
          { description?: string; difficulty?: number | null }
        >
      }
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !parsed.categories ||
        typeof parsed.categories !== 'object'
      )
        throw new Error('Invalid JSON shape')

      let success = 0
      for (const [name, data] of Object.entries(parsed.categories)) {
        const description = (data.description ?? '').trim()
        const difficulty =
          data.difficulty == null ? undefined : Number(data.difficulty)
        await addCategory({
          name,
          description: description || undefined,
          difficulty
        })
        success += 1
      }
      setCategoriesPasteJson('')
      await refreshAll()
      setCategoriesPasteSuccess(`Updated ${success} categories successfully`)
    } catch {
      setCategoriesPasteError('Invalid or unsupported JSON')
    }
  }

  async function onCopyMissingAnimalsJson() {
    setCopiedMissingJson(false)
    const payload = buildMissingAnimalsJson()
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
      setCopiedMissingJson(true)
    } catch {
      setCopiedMissingJson(false)
    }
  }

  async function onApplyAnimalsJson(e: React.FormEvent) {
    e.preventDefault()
    setAnimalsPasteError('')
    setAnimalsPasteSuccess('')
    try {
      const parsed = JSON.parse(animalsPasteJson) as {
        animals: Record<
          string,
          { wikipediaUrl?: string; categories?: string[] }
        >
      }
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !parsed.animals ||
        typeof parsed.animals !== 'object'
      )
        throw new Error('Invalid JSON shape')
      const updates = Object.entries(parsed.animals)
      if (updates.length === 0) throw new Error('No animals provided')
      // Apply
      let successCount = 0
      for (const [name, data] of updates) {
        const wikipediaUrl = String(data?.wikipediaUrl ?? '').trim()
        const categories = Array.isArray(data?.categories)
          ? data!.categories!.map(c => String(c).trim()).filter(Boolean)
          : []
        await addAnimal({ name, wikipediaUrl, categories })
        successCount += 1
      }
      setAnimalsPasteJson('')
      await refreshAll()
      setAnimalsPasteSuccess(`Updated ${successCount} animals successfully`)
    } catch (err) {
      setAnimalsPasteError('Invalid or unsupported JSON')
    }
  }

  async function onAssignAnimalsToCategory() {
    if (!selectedCategory || selectedAnimals.length === 0) return

    setCategoryAssignmentSuccess('')
    try {
      for (const animalName of selectedAnimals) {
        const animal = animals[animalName]
        if (animal) {
          const updatedCategories = [...animal.categories]
          if (!updatedCategories.includes(selectedCategory)) {
            updatedCategories.push(selectedCategory)
          }
          await addAnimal({
            name: animalName,
            wikipediaUrl: animal.wikipediaUrl,
            categories: updatedCategories
          })
        }
      }
      setSelectedAnimals([])
      await refreshAll()
      setCategoryAssignmentSuccess(
        `Assigned ${selectedAnimals.length} animals to ${selectedCategory}`
      )
    } catch (err) {
      console.error('Failed to assign animals to category:', err)
    }
  }

  async function onAddCategory(e: React.FormEvent) {
    e.preventDefault()
    setCategoryAddSuccess('')
    setCategoryAddError('')
    try {
      const res = await addCategory({
        name: categoryName.trim(),
        description: categoryDesc.trim() || undefined,
        members: categoryMembers
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        difficulty:
          categoryDifficulty.trim() !== ''
            ? Number(categoryDifficulty.trim())
            : undefined
      })
      const updatedList = (res.updatedAnimals || []).join(', ')
      const createdList = (res.createdAnimals || []).join(', ')
      const alreadyList = (res.alreadyHadCategory || []).join(', ')
      const parts: string[] = []
      parts.push(`Added category "${res.name}".`)
      parts.push(`Updated ${res.membersUpdated ?? 0} animals.`)
      if (updatedList) parts.push(`Tagged: ${updatedList}.`)
      if (createdList) parts.push(`Created entries: ${createdList}.`)
      if (alreadyList) parts.push(`Already had category: ${alreadyList}.`)
      setCategoryAddSuccess(parts.join(' '))
      setCategoryName('')
      setCategoryDesc('')
      setCategoryMembers('')
      setCategoryDifficulty('')
      await refreshAll()
    } catch (err: any) {
      setCategoryAddError(
        `Failed to add category: ${err?.message ?? String(err)}`
      )
    }
  }

  async function onAddPuzzle(e: React.FormEvent) {
    e.preventDefault()
    const cats = puzzleCats
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    await addAnimalPuzzle({ categories: cats })
    setPuzzleCats('')
    await refreshAll()
  }

  // JSON examples
  const getCategoryJsonExample = () => ({
    name: 'Flying Animals',
    description: 'Animals that can fly or glide',
    members: ['Eagle', 'Bat', 'Hummingbird', 'Owl'],
    redHerrings: ['Penguin', 'Ostrich', 'Emu'],
    difficulty: 1
  })

  const getAnimalJsonExample = () => ({
    name: 'Eagle',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Eagle',
    categories: ['Flying Animals', 'Birds of Prey']
  })

  const getPuzzleJsonExample = () => ({
    categories: ['Flying Animals', 'Marine Life', 'Nocturnal', 'Herbivores']
  })

  // JSON validation functions
  const validateCategoryJson = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr)
      if (!parsed.name || typeof parsed.name !== 'string') {
        return "Category must have a 'name' field (string)"
      }
      if (parsed.description && typeof parsed.description !== 'string') {
        return 'Description must be a string'
      }
      if (parsed.members && !Array.isArray(parsed.members)) {
        return 'Members must be an array'
      }
      if (parsed.redHerrings && !Array.isArray(parsed.redHerrings)) {
        return 'Red herrings must be an array'
      }

      // Optional cross-validation if members/redHerrings provided
      const errors: string[] = []
      const categoryName = String(parsed.name)
      // Skip blocking validation for members not yet tagged; backend will backfill on submit
      if (Array.isArray(parsed.redHerrings)) {
        for (const rhName of parsed.redHerrings) {
          if (
            animals[rhName] &&
            animals[rhName].categories.includes(categoryName)
          ) {
            errors.push(
              `Red herring incorrectly in category '${categoryName}': ${rhName}`
            )
          }
        }
      }
      if (errors.length > 0) {
        return errors.join('\n')
      }
      return null
    } catch (e) {
      return 'Invalid JSON format'
    }
  }

  const validateAnimalJson = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr)
      if (!parsed.name || typeof parsed.name !== 'string') {
        return "Animal must have a 'name' field (string)"
      }
      if (!parsed.wikipediaUrl || typeof parsed.wikipediaUrl !== 'string') {
        return "Animal must have a 'wikipediaUrl' field (string)"
      }
      if (!Array.isArray(parsed.categories)) {
        return "Animal must have a 'categories' field (array)"
      }
      return null
    } catch (e) {
      return 'Invalid JSON format'
    }
  }

  const validatePuzzleJson = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr)
      if (!Array.isArray(parsed.categories)) {
        return "Puzzle must have a 'categories' field (array)"
      }
      if (parsed.categories.length !== 4) {
        return 'Puzzle must have exactly 4 categories'
      }
      return null
    } catch (e) {
      return 'Invalid JSON format'
    }
  }

  // Separate submission functions for each type
  async function onAddCategoryFromJson(e: React.FormEvent) {
    e.preventDefault()
    setCategoryJsonError('')

    const error = validateCategoryJson(categoryJsonInput)
    if (error) {
      setCategoryJsonError(error)
      return
    }

    try {
      const parsed = JSON.parse(categoryJsonInput)

      // Auto-add missing animals from members and redHerrings
      const allAnimalNames = [
        ...(parsed.members || []),
        ...(parsed.redHerrings || [])
      ]

      const missingAnimals = allAnimalNames.filter(name => !animals[name])

      // Add missing animals with placeholder data
      for (const animalName of missingAnimals) {
        await addAnimal({
          name: animalName,
          wikipediaUrl:
            'https://en.wikipedia.org/wiki/' + animalName.replace(/\s+/g, '_'), // Placeholder URL
          categories: parsed.members?.includes(animalName) ? [parsed.name] : []
        })
      }

      await addCategory(parsed)
      setCategoryJsonInput('')
      await refreshAll()
    } catch (e) {
      setCategoryJsonError('Failed to add category: ' + (e as Error).message)
    }
  }

  async function onAddAnimalFromJson(e: React.FormEvent) {
    e.preventDefault()
    setAnimalJsonError('')

    const error = validateAnimalJson(animalJsonInput)
    if (error) {
      setAnimalJsonError(error)
      return
    }

    try {
      const parsed = JSON.parse(animalJsonInput)
      await addAnimal(parsed)
      setAnimalJsonInput('')
      await refreshAll()
    } catch (e) {
      setAnimalJsonError('Failed to add animal: ' + (e as Error).message)
    }
  }

  async function onAddPuzzleFromJson(e: React.FormEvent) {
    e.preventDefault()
    setPuzzleJsonError('')

    const error = validatePuzzleJson(puzzleJsonInput)
    if (error) {
      setPuzzleJsonError(error)
      return
    }

    try {
      const parsed = JSON.parse(puzzleJsonInput)
      await addAnimalPuzzle(parsed)
      setPuzzleJsonInput('')
      await refreshAll()
    } catch (e) {
      setPuzzleJsonError('Failed to add puzzle: ' + (e as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-center mb-8">Developer Tools</h1>
      </div>

      {/* Data Viewing Section */}
      <section className="bg-gray-800 rounded-lg p-6 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-green-400">Data Overview</h2>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-200">
              {categoryList.length}
            </div>
            <div className="text-sm text-blue-300">Categories</div>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-emerald-200">
              {Object.keys(animals).length}
            </div>
            <div className="text-sm text-emerald-300">Animals</div>
          </div>
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-200">
              {puzzles.length}
            </div>
            <div className="text-sm text-purple-300">Puzzles</div>
          </div>
        </div>

        {/* Categories View */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-blue-300">
            Categories ({categoryList.length})
          </h3>
          <div className="max-h-60 overflow-y-auto bg-gray-900/50 rounded border border-gray-600">
            <div className="p-4 space-y-2">
              {categoryList.map(categoryName => {
                const category = categories[categoryName]
                const categoryAnimals = Object.values(animals).filter(animal =>
                  animal.categories.includes(categoryName)
                )
                const members = categoryAnimals
                  .map(animal =>
                    Object.keys(animals).find(name => animals[name] === animal)
                  )
                  .filter(Boolean)

                return (
                  <div
                    key={categoryName}
                    className="p-3 bg-gray-800/50 rounded border border-gray-600"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-blue-200">
                          {categoryName}
                        </div>
                        {category.description && (
                          <div className="text-sm text-gray-400 mt-1">
                            {category.description}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 ml-4">
                        {members.length} members
                      </div>
                    </div>

                    {/* Members */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-blue-300">
                        Members:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {members.length > 0 ? (
                          members.map(member => (
                            <span
                              key={member}
                              className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-500/30"
                            >
                              {member}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 italic">
                            No members
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Red Herrings (if they exist) */}
                    {category.redHerrings &&
                      category.redHerrings.length > 0 && (
                        <div className="space-y-1 mt-2">
                          <div className="text-xs font-medium text-red-300">
                            Red Herrings:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {category.redHerrings.map(redHerring => (
                              <span
                                key={redHerring}
                                className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-200 border border-red-500/30"
                              >
                                {redHerring}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Category Assignment Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-blue-300">
            Assign Animals to Categories
          </h3>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3">
            <div className="text-sm text-blue-200 mb-3">
              Select a category and animals to assign them. Categories need at
              least 4 members for puzzles.
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Category
                </label>
                <select
                  className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                >
                  <option value="">Choose a category...</option>
                  {categoryList.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Animals
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-600 rounded bg-gray-700 p-2">
                  {Object.keys(animals).map(animalName => (
                    <label
                      key={animalName}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAnimals.includes(animalName)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedAnimals([...selectedAnimals, animalName])
                          } else {
                            setSelectedAnimals(
                              selectedAnimals.filter(
                                name => name !== animalName
                              )
                            )
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-white">{animalName}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {categoryAssignmentSuccess && (
              <div className="text-emerald-300 text-sm bg-emerald-900/20 p-2 rounded">
                {categoryAssignmentSuccess}
              </div>
            )}

            <div className="flex gap-2">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm"
                onClick={onAssignAnimalsToCategory}
                disabled={!selectedCategory || selectedAnimals.length === 0}
              >
                Assign {selectedAnimals.length} animals to{' '}
                {selectedCategory || 'category'}
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white rounded px-4 py-2 text-sm"
                onClick={() => {
                  setSelectedAnimals([])
                  setSelectedCategory('')
                }}
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>

        {/* Animals View */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-emerald-300">
            Animals ({Object.keys(animals).length})
          </h3>

          {/* Copy/Paste Missing Info Tools */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-3 py-1.5 text-sm"
                onClick={onCopyMissingAnimalsJson}
                type="button"
              >
                Copy missing info JSON
              </button>
              {copiedMissingJson && (
                <span className="text-emerald-300 text-sm">Copied!</span>
              )}
              <span className="text-xs text-gray-400">
                Copies a JSON payload for animals missing real URLs or
                categories
              </span>
            </div>
            <form onSubmit={onApplyAnimalsJson} className="space-y-2">
              <label className="block text-sm font-medium">
                Paste filled JSON
              </label>
              <textarea
                className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white font-mono text-sm"
                rows={5}
                placeholder='{"animals": {"Eagle": {"wikipediaUrl": "https://...", "categories": ["Flying Animals"]}}}'
                value={animalsPasteJson}
                onChange={e => setAnimalsPasteJson(e.target.value)}
              />
              {animalsPasteSuccess && (
                <div className="text-emerald-300 text-sm bg-emerald-900/20 p-2 rounded">
                  {animalsPasteSuccess}
                </div>
              )}
              {animalsPasteError && (
                <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
                  {animalsPasteError}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1.5 text-sm"
                  type="submit"
                >
                  Apply updates
                </button>
                <button
                  className="bg-gray-600 hover:bg-gray-700 text-white rounded px-3 py-1.5 text-sm"
                  type="button"
                  onClick={() => setAnimalsPasteJson('')}
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* Missing Information Alert */}
          {Object.entries(animals).some(
            ([name, animal]) => !hasRealInfo(animal)
          ) && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="text-yellow-200 font-medium mb-2">
                ⚠️ Animals with Missing Information
              </div>
              <div className="text-sm text-yellow-300 mb-3">
                Some animals are missing Wikipedia URLs. Complete them below:
              </div>
              <div className="space-y-2">
                {Object.entries(animals)
                  .filter(([name, animal]) => !hasRealInfo(animal))
                  .map(([name, animal]) => (
                    <div
                      key={name}
                      className="flex items-center gap-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/20"
                    >
                      <div className="font-medium text-yellow-200">{name}</div>
                      <input
                        className="flex-1 border border-yellow-500/30 rounded px-2 py-1 bg-yellow-500/10 text-yellow-100 placeholder-yellow-300 text-sm"
                        placeholder="Enter Wikipedia URL..."
                        onKeyDown={async e => {
                          if (e.key === 'Enter') {
                            const url = e.currentTarget.value.trim()
                            if (url) {
                              try {
                                await addAnimal({
                                  name,
                                  wikipediaUrl: url,
                                  categories: animal.categories
                                })
                                await refreshAll()
                              } catch (err) {
                                console.error('Failed to update animal:', err)
                              }
                            }
                          }
                        }}
                      />
                      <button
                        className="bg-yellow-600 hover:bg-yellow-700 text-white rounded px-3 py-1 text-sm"
                        onClick={async () => {
                          const url = prompt(`Enter Wikipedia URL for ${name}:`)
                          if (url?.trim()) {
                            try {
                              await addAnimal({
                                name,
                                wikipediaUrl: url.trim(),
                                categories: animal.categories
                              })
                              await refreshAll()
                            } catch (err) {
                              console.error('Failed to update animal:', err)
                            }
                          }
                        }}
                      >
                        Add URL
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto bg-gray-900/50 rounded border border-gray-600">
            <div className="p-4 space-y-2">
              {Object.entries(animals).map(([name, animal]) => (
                <div
                  key={name}
                  className={`p-3 rounded border ${
                    !hasRealInfo(animal)
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-gray-800/50 border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div
                        className={`font-medium ${
                          !hasRealInfo(animal)
                            ? 'text-yellow-200'
                            : 'text-emerald-200'
                        }`}
                      >
                        {name}
                        {!hasRealInfo(animal) && (
                          <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-200 px-2 py-0.5 rounded">
                            Needs Real Info
                          </span>
                        )}
                      </div>
                      {hasRealInfo(animal) ? (
                        <a
                          className="text-blue-300 text-sm break-all hover:text-blue-200"
                          href={animal.wikipediaUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {animal.wikipediaUrl}
                        </a>
                      ) : (
                        <div className="text-yellow-300 text-sm italic">
                          {animal.wikipediaUrl
                            ? 'Placeholder URL - needs real Wikipedia link'
                            : 'Wikipedia URL needed'}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {animal.categories.map(category => (
                          <span
                            key={category}
                            className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Puzzles View */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-purple-300">
            Puzzles ({puzzles.length})
          </h3>
          <div className="max-h-60 overflow-y-auto bg-gray-900/50 rounded border border-gray-600">
            <div className="p-4 space-y-2">
              {puzzles.map(puzzle => (
                <div
                  key={puzzle.id}
                  className="p-3 bg-gray-800/50 rounded border border-gray-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-purple-200">
                        ID: {puzzle.id}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        Created: {new Date(puzzle.createdAt).toLocaleString()}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {puzzle.categories.map(category => (
                          <span
                            key={category}
                            className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category JSON Input Section */}
      <section className="bg-gray-800 rounded-lg p-6 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-blue-400">
          Add Category from JSON
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">
              Example JSON
            </label>
            <pre className="bg-gray-900 p-3 rounded text-xs text-green-400 overflow-x-auto">
              {JSON.stringify(getCategoryJsonExample(), null, 2)}
            </pre>
          </div>
          <div>
            <form onSubmit={onAddCategoryFromJson} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category JSON
                </label>
                <textarea
                  className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white font-mono text-sm"
                  rows={6}
                  placeholder="Paste your category JSON here..."
                  value={categoryJsonInput}
                  onChange={e => setCategoryJsonInput(e.target.value)}
                />
              </div>
              {categoryJsonError && (
                <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
                  {categoryJsonError}
                </div>
              )}
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-medium"
                type="submit"
              >
                Add Category from JSON
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Missing Category Info Tools */}
      <section className="bg-gray-800 rounded-lg p-6 space-y-4 border border-gray-700">
        <h3 className="text-lg font-medium text-blue-300">
          Missing Category Info
        </h3>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3">
          <div className="text-sm text-blue-200">
            Copy a JSON scaffold for categories missing description or
            difficulty, fill it, and apply.
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-3 py-1.5 text-sm"
              type="button"
              onClick={onCopyMissingCategoriesJson}
            >
              {copiedMissingCategoriesJson
                ? 'Copied!'
                : 'Copy missing category JSON'}
            </button>
          </div>
          <form onSubmit={onApplyCategoriesJson} className="space-y-2">
            <textarea
              className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white font-mono text-xs"
              rows={6}
              placeholder="Paste category JSON here..."
              value={categoriesPasteJson}
              onChange={e => setCategoriesPasteJson(e.target.value)}
            />
            {categoriesPasteError && (
              <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
                {categoriesPasteError}
              </div>
            )}
            {categoriesPasteSuccess && (
              <div className="text-emerald-400 text-sm bg-emerald-900/20 p-2 rounded">
                {categoriesPasteSuccess}
              </div>
            )}
            <div className="flex gap-2">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1.5 text-sm"
                type="submit"
              >
                Apply changes
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white rounded px-3 py-1.5 text-sm"
                type="button"
                onClick={() => setCategoriesPasteJson('')}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Animal JSON Input Section */}
      <section className="bg-gray-800 rounded-lg p-6 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-emerald-400">
          Add Animal from JSON
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">
              Example JSON
            </label>
            <pre className="bg-gray-900 p-3 rounded text-xs text-green-400 overflow-x-auto">
              {JSON.stringify(getAnimalJsonExample(), null, 2)}
            </pre>
          </div>
          <div>
            <form onSubmit={onAddAnimalFromJson} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Animal JSON
                </label>
                <textarea
                  className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white font-mono text-sm"
                  rows={6}
                  placeholder="Paste your animal JSON here..."
                  value={animalJsonInput}
                  onChange={e => setAnimalJsonInput(e.target.value)}
                />
              </div>
              {animalJsonError && (
                <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
                  {animalJsonError}
                </div>
              )}
              <button
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-4 py-2 font-medium"
                type="submit"
              >
                Add Animal from JSON
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Puzzle JSON Input Section */}
      <section className="bg-gray-800 rounded-lg p-6 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-purple-400">
          Add Puzzle from JSON
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">
              Example JSON
            </label>
            <pre className="bg-gray-900 p-3 rounded text-xs text-green-400 overflow-x-auto">
              {JSON.stringify(getPuzzleJsonExample(), null, 2)}
            </pre>
          </div>
          <div>
            <form onSubmit={onAddPuzzleFromJson} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Puzzle JSON
                </label>
                <textarea
                  className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white font-mono text-sm"
                  rows={6}
                  placeholder="Paste your puzzle JSON here..."
                  value={puzzleJsonInput}
                  onChange={e => setPuzzleJsonInput(e.target.value)}
                />
              </div>
              {puzzleJsonError && (
                <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
                  {puzzleJsonError}
                </div>
              )}
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white rounded px-4 py-2 font-medium"
                type="submit"
              >
                Add Puzzle from JSON
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-gray-800 rounded-lg p-6 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-blue-400">Add Category</h2>
        <form onSubmit={onAddCategory} className="grid gap-3 sm:grid-cols-3">
          <input
            className="border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white placeholder-gray-400"
            placeholder="Name"
            value={categoryName}
            onChange={e => setCategoryName(e.target.value)}
          />
          <input
            className="border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white placeholder-gray-400"
            placeholder="Description (optional)"
            value={categoryDesc}
            onChange={e => setCategoryDesc(e.target.value)}
          />
          <input
            className="border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white placeholder-gray-400"
            placeholder="Members (comma-separated)"
            value={categoryMembers}
            onChange={e => setCategoryMembers(e.target.value)}
          />
          <select
            className={`border rounded px-3 py-2 bg-gray-700 text-white ${getDifficultyColorClasses(Number(categoryDifficulty) as number)}`}
            value={categoryDifficulty}
            onChange={e => setCategoryDifficulty(e.target.value)}
          >
            <option value="">Difficulty (1–4, optional)</option>
            <option value="1">1 – Easiest</option>
            <option value="2">2 – Easy</option>
            <option value="3">3 – Medium</option>
            <option value="4">4 – Hardest</option>
          </select>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2 font-medium"
            type="submit"
          >
            Add Category
          </button>
        </form>
        {(categoryAddSuccess || categoryAddError) && (
          <div>
            {categoryAddSuccess && (
              <div className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded px-3 py-2 mt-2">
                {categoryAddSuccess}
              </div>
            )}
            {categoryAddError && (
              <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded px-3 py-2 mt-2">
                {categoryAddError}
              </div>
            )}
          </div>
        )}
        <div className="text-sm text-gray-300">
          {categoryList.length} categories
        </div>
        <div className="flex flex-wrap gap-2">
          {categoryList.map(c => (
            <span
              key={c}
              className={`px-3 py-1 rounded text-sm border ${getDifficultyColorClasses(categories[c]?.difficulty)}`}
            >
              {c}
              {categories[c]?.difficulty
                ? ` (D${categories[c]?.difficulty})`
                : ''}
            </span>
          ))}
        </div>
      </section>

      <section className="bg-gray-800 rounded-lg p-6 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-green-400">Add Animal</h2>
        <form onSubmit={onAddAnimal} className="grid gap-3 sm:grid-cols-4">
          <input
            className="border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white placeholder-gray-400"
            placeholder="Name"
            value={animalName}
            onChange={e => setAnimalName(e.target.value)}
          />
          <input
            className="border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white placeholder-gray-400"
            placeholder="Wikipedia URL"
            value={animalUrl}
            onChange={e => setAnimalUrl(e.target.value)}
          />
          <input
            className="border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white placeholder-gray-400"
            placeholder="Categories (comma-separated)"
            value={animalCategories}
            onChange={e => setAnimalCategories(e.target.value)}
          />
          <button
            className="bg-green-600 hover:bg-green-700 text-white rounded px-3 py-2 font-medium"
            type="submit"
          >
            Add Animal
          </button>
        </form>
        <div className="text-sm text-gray-300 mb-3">
          {Object.keys(animals).length} animals
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(animals).map(([name, a]) => (
            <div
              key={name}
              className="border border-gray-600 rounded p-4 bg-gray-700"
            >
              <div className="font-medium text-lg text-white mb-2">{name}</div>
              <a
                className="text-blue-300 text-sm break-all hover:text-blue-200 underline"
                href={a.wikipediaUrl}
                target="_blank"
                rel="noreferrer"
              >
                {a.wikipediaUrl}
              </a>
              <div className="flex flex-wrap gap-1 mt-3">
                {a.categories.map(c => (
                  <span
                    key={c}
                    className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-800 rounded-lg p-6 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-purple-400">
          Create Puzzle (4 categories)
        </h2>
        <form onSubmit={onAddPuzzle} className="grid gap-3 sm:grid-cols-2">
          <input
            className="border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white placeholder-gray-400"
            placeholder="Categories (comma-separated, 4)"
            value={puzzleCats}
            onChange={e => setPuzzleCats(e.target.value)}
          />
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white rounded px-3 py-2 font-medium"
            type="submit"
          >
            Create Puzzle
          </button>
        </form>
        <div className="text-sm text-gray-300 mb-3">
          {puzzles.length} puzzles
        </div>
        <div className="divide-y divide-gray-600 rounded border border-gray-600">
          {puzzles.map(p => (
            <div key={p.id} className="p-4 bg-gray-700">
              <div className="text-sm text-gray-400 mb-1">
                {new Date(p.createdAt).toLocaleString()}
              </div>
              <div className="font-medium text-white mb-2">{p.id}</div>
              <div className="flex flex-wrap gap-1">
                {p.categories.map(c => (
                  <span
                    key={c}
                    className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
