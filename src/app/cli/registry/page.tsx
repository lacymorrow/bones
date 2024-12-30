'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { fetchRegistry, fetchComponentDetails, isRegistryError } from '../lib/registry-service'
import { RegistryIndex, ComponentDetails, RegistryComponent } from '../lib/registry-types'

export default function RegistryPage() {
  const [registry, setRegistry] = useState<RegistryIndex | null>(null)
  const [selectedComponent, setSelectedComponent] = useState<RegistryComponent | null>(null)
  const [componentDetails, setComponentDetails] = useState<ComponentDetails | null>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    async function loadRegistry() {
      const data = await fetchRegistry()
      
      if (isRegistryError(data)) {
        setError(data.message)
        setLoading(false)
        return
      }

      console.log('Full registry data:', JSON.stringify(data, null, 2))
      setRegistry(data)
      setLoading(false)
    }

    loadRegistry()
  }, [])

  async function handleComponentClick(component: RegistryComponent) {
    console.log('Clicked component:', JSON.stringify(component, null, 2))
    setSelectedComponent(component)
    setLoadingDetails(true)
    setComponentDetails(null)

    const details = await fetchComponentDetails(component.path)
    
    if (isRegistryError(details)) {
      setError(details.message)
      setLoadingDetails(false)
      return
    }

    setComponentDetails(details)
    setLoadingDetails(false)
  }

  const renderComponentList = () => {
    if (!registry) return null

    return (
      <ScrollArea className="h-[600px] rounded-md border">
        <div className="p-4">
          {registry.registry.map((group) => {
            console.log('Processing group:', group.type, 'Components:', JSON.stringify(group.components, null, 2))
            return (
              <div key={group.type} className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-semibold capitalize">
                    {group.type.replace('registry:', '')}
                  </h2>
                  <Badge variant="secondary">
                    {registry.stats.componentsByType[group.type] || 0}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {group.components.map((component) => {
                    console.log('Rendering component:', component.name, 'with path:', component.path)
                    return (
                      <button
                        key={component.name}
                        onClick={() => handleComponentClick(component)}
                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-accent ${
                          selectedComponent?.name === component.name 
                            ? 'bg-accent' 
                            : ''
                        }`}
                      >
                        {component.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    )
  }

  const renderComponentDetails = () => {
    if (loadingDetails) {
      return <ComponentDetailsSkeleton />
    }

    if (!componentDetails) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          Select a component to view its details
        </div>
      )
    }

    return (
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{componentDetails.name}</h2>
          <Badge>{componentDetails.type}</Badge>
        </div>

        <div>
          <h3 className="font-medium mb-2">Dependencies</h3>
          <div className="flex flex-wrap gap-1">
            {componentDetails.dependencies?.length ? (
              componentDetails.dependencies.map((dep) => (
                <Badge key={dep} variant="secondary">
                  {dep}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">No dependencies</span>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Files</h3>
          <div className="flex flex-wrap gap-1">
            {componentDetails.files?.length ? (
              componentDetails.files.map((file) => (
                <Badge key={file.path} variant="outline">
                  {file.path}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">No files</span>
            )}
          </div>
        </div>

        <div className="pt-4">
          <Button 
            className="w-full"
            onClick={() => {
              // TODO: Implement install action
              console.log('Install:', componentDetails.name)
            }}
          >
            Install Component
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Component Registry</h1>
            {registry && (
              <p className="text-muted-foreground">
                {registry.stats.totalComponents} components available
              </p>
            )}
          </div>
          {renderComponentList()}
        </div>
        <div className="col-span-3">
          <div className="rounded-lg border min-h-[600px]">
            {renderComponentDetails()}
          </div>
        </div>
      </div>
    </div>
  )
}

function ComponentDetailsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div>
        <Skeleton className="h-5 w-32 mb-2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <div>
        <Skeleton className="h-5 w-32 mb-2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
      <Skeleton className="h-10 w-full mt-4" />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="p-8">
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-6">
            {[1, 2, 3].map((group) => (
              <div key={group}>
                <Skeleton className="h-6 w-32 mb-2" />
                <div className="space-y-2">
                  {[1, 2, 3].map((item) => (
                    <Skeleton key={item} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-3">
          <div className="rounded-lg border min-h-[600px]">
            <ComponentDetailsSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
