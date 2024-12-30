'use server'

import path from 'path'
import { AddComponentInput, addComponentSchema, ComponentResult } from './lib/types'
import { checkComponentExists, checkConfigExists } from './lib/utils'
import { DEFAULT_COMPONENT_PATH } from './lib/constants'
import { spawnShadcnCommand, buildShadcnCommand } from './lib/shadcn'

export async function addComponent(input: AddComponentInput): Promise<ComponentResult> {
  const { name, path: targetPath, overwrite } = addComponentSchema.parse(input)
  const cwd = process.cwd()

  try {
    // Check if components.json exists
    if (!await checkConfigExists(cwd)) {
      throw new Error('Configuration is missing. Please run init to create a components.json file.')
    }

    // Check if component already exists
    const componentDir = targetPath || path.join(cwd, DEFAULT_COMPONENT_PATH)
    const exists = await checkComponentExists(name, componentDir)

    if (exists && !overwrite) {
      throw new Error(
        `Component ${name} already exists. Use the overwrite option if you want to replace it.`
      )
    }

    // Build and execute the shadcn command
    const command = buildShadcnCommand(name, overwrite, targetPath)
    const result = await spawnShadcnCommand({ command, cwd })

    if (!result.success) {
      throw new Error(result.error)
    }

    return { success: true }
  } catch (error) {
    console.error('Error adding component:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add component'
    }
  }
}
