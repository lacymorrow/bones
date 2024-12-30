import { RegistryIndex, RegistryError, ComponentDetails } from './registry-types'

const BASE_URL = 'http://localhost:3000/ui/download'

export async function fetchRegistry(): Promise<RegistryIndex | RegistryError> {
  try {
    const response = await fetch(`${BASE_URL}/index.json`)
    if (!response.ok) {
      return {
        message: `Failed to fetch registry: ${response.statusText}`,
        statusCode: response.status
      }
    }
    return await response.json()
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'Failed to fetch registry'
    }
  }
}

export async function fetchComponentDetails(path: string): Promise<ComponentDetails | RegistryError> {
  try {
    // Convert relative path to absolute URL
    const url = new URL(path, BASE_URL).toString()
    const response = await fetch(url)
    
    if (!response.ok) {
      return {
        message: `Failed to fetch component details: ${response.statusText}`,
        statusCode: response.status
      }
    }
    
    const data = await response.json()
    return normalizeComponentDetails(data)
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'Failed to fetch component details'
    }
  }
}

function normalizeComponentDetails(data: any): ComponentDetails {
  return {
    name: data.name || '',
    type: data.type || 'Other',
    dependencies: Array.isArray(data.dependencies) 
      ? data.dependencies 
      : data.dependencies 
        ? Object.keys(data.dependencies)
        : [],
    files: Array.isArray(data.files)
      ? data.files
      : data.files
        ? Object.keys(data.files)
        : [],
    registryDependencies: Array.isArray(data.registryDependencies)
      ? data.registryDependencies
      : [],
    styles: Array.isArray(data.styles)
      ? data.styles
      : []
  }
}

export function isRegistryError(data: any): data is RegistryError {
  return 'message' in data
}
