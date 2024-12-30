export interface RegistryComponent {
  name: string
  path: string
}

export interface RegistryGroup {
  type: string
  components: RegistryComponent[]
}

export interface RegistryStats {
  totalComponents: number
  componentsByType: Record<string, number>
  dependencies: {
    total: number
    unique: number
  }
  registryDependencies: {
    total: number
    unique: number
  }
  styles: {
    componentsWithTailwind: number
    componentsWithCssVars: number
  }
  performance: {
    totalFileSize: string
    processingTime: string
    averageTimePerComponent: string
  }
  docs: {
    totalMapped: number
    withPreviews: number
    categories: string[]
  }
}

export interface RegistryIndex {
  registry: RegistryGroup[]
  stats: RegistryStats
}

export interface ComponentDetails {
  name: string
  type: string
  dependencies?: string[]
  files?: string[]
  registryDependencies?: string[]
  styles?: string[]
}

export interface RegistryError {
  message: string
  statusCode?: number
}
