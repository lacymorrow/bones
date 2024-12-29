'use client'

import { useState, useEffect } from 'react'
import { addComponent } from './actions'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const COMPONENTS = [
  { name: 'accordion', label: 'Accordion', description: 'A vertically stacked set of interactive headings.' },
  { name: 'button', label: 'Button', description: 'Trigger an action or event, such as submitting a form.' },
  { name: 'card', label: 'Card', description: 'Container for content like text, images, and actions.' },
  { name: 'dialog', label: 'Dialog', description: 'Overlay modal that interrupts the user with content.' },
] as const

const INSTALL_STEPS = [
  'Preparing installation...',
  'Checking dependencies...',
  'Downloading component...',
  'Installing component...',
  'Updating styles...',
  'Finalizing installation...',
]

export default function CLIPage() {
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [installing, setInstalling] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<string>('accordion')
  const [overwrite, setOverwrite] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (installing) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 2
        })
        
        setCurrentStep((prev) => {
          const stepProgress = progress / (100 / INSTALL_STEPS.length)
          return Math.min(Math.floor(stepProgress), INSTALL_STEPS.length - 1)
        })
      }, 50)

      return () => clearInterval(interval)
    } else {
      setProgress(0)
      setCurrentStep(0)
    }
  }, [installing, progress])

  const handleAddComponent = async () => {
    try {
      setInstalling(true)
      setStatus(`Installing ${selectedComponent}...`)
      setError('')
      setProgress(0)

      const result = await addComponent({
        name: selectedComponent,
        path: 'src/components/ui',
        overwrite,
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

  const selectedComponentData = COMPONENTS.find(c => c.name === selectedComponent)

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="mx-auto max-w-2xl bg-white rounded-xl shadow-sm border p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Component Installer</h1>
            <p className="text-muted-foreground mt-2">
              Install shadcn/ui components directly into your project.
            </p>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Select Component
            </label>
            <div className="grid grid-cols-2 gap-3">
              {COMPONENTS.map((component) => (
                <button
                  key={component.name}
                  onClick={() => setSelectedComponent(component.name)}
                  className={cn(
                    'relative flex flex-col items-start p-4 border rounded-lg text-left transition-all',
                    'hover:border-blue-500/50 hover:bg-blue-50/50',
                    selectedComponent === component.name 
                      ? 'border-blue-500 bg-blue-50/80 shadow-sm'
                      : 'border-gray-200'
                  )}
                  disabled={installing}
                >
                  <div className="font-medium">{component.label}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {component.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-gray-50/50 p-3 rounded-lg">
            <Switch
              id="overwrite"
              checked={overwrite}
              onCheckedChange={setOverwrite}
              disabled={installing}
            />
            <Label htmlFor="overwrite" className="text-sm font-medium">
              Overwrite if component exists
            </Label>
          </div>

          {installing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{INSTALL_STEPS[currentStep]}</span>
                <span className="text-muted-foreground font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <button
            onClick={handleAddComponent}
            disabled={installing}
            className={cn(
              'w-full py-2 px-4 rounded-lg font-medium transition-colors relative',
              'bg-blue-500 text-white hover:bg-blue-600',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {installing ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Installing...
              </span>
            ) : (
              `Add ${selectedComponentData?.label || selectedComponent}`
            )}
          </button>

          {status && !error && (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm">
              {status}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
