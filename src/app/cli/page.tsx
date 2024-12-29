'use client'

import { useState } from 'react'
import { addComponent } from './actions'

const COMPONENTS = [
  { name: 'accordion', label: 'Accordion' },
  { name: 'button', label: 'Button' },
  { name: 'card', label: 'Card' },
  { name: 'dialog', label: 'Dialog' },
] as const

export default function CLIPage() {
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [installing, setInstalling] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<string>('accordion')

  const handleAddComponent = async () => {
    try {
      setInstalling(true)
      setStatus(`Installing ${selectedComponent}...`)
      setError('')

      const result = await addComponent({
        name: selectedComponent,
        path: 'src/components/ui',
        overwrite: false,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      setStatus(`${selectedComponent} installed successfully!`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add component')
    } finally {
      setInstalling(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ShadCN Component Installer</h1>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <label className="block font-medium">Select Component</label>
          <div className="grid grid-cols-2 gap-2">
            {COMPONENTS.map((component) => (
              <button
                key={component.name}
                onClick={() => setSelectedComponent(component.name)}
                className={`p-4 border rounded-lg text-left hover:border-blue-500 transition-colors ${
                  selectedComponent === component.name 
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                {component.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAddComponent}
          disabled={installing}
          className={`w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {installing ? `Installing ${selectedComponent}...` : `Add ${selectedComponent}`}
        </button>

        {status && (
          <div className="p-4 bg-green-100 text-green-700 rounded">
            {status}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
