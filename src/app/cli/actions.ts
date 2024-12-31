'use server'

import { exec } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import { ReadableStream } from 'stream/web'
import { DEFAULT_COMPONENT_PATH } from './lib/constants'
import { buildShadcnCommand, spawnShadcnCommand } from './lib/shadcn'
import { AddComponentInput, ComponentResult, addComponentSchema } from './lib/types'
import { checkComponentExists, checkConfigExists } from './lib/utils'

interface WriteFileInput {
  path: string
  content: string
}

interface WriteFileResult {
  success: boolean
  error?: string
}

export async function writeFile(input: WriteFileInput): Promise<WriteFileResult> {
  try {
    console.log('Writing file:', input.path)
    console.log('Content length:', input.content.length)

    const cwd = process.cwd()
    const fullPath = path.join(cwd, input.path)
    console.log('Full path:', fullPath)

    // Ensure the directory exists
    const dir = path.dirname(fullPath)
    console.log('Creating directory:', dir)
    await fs.mkdir(dir, { recursive: true })

    // Write the file
    console.log('Writing content to file...')
    await fs.writeFile(fullPath, input.content, 'utf-8')
    console.log('File written successfully')

    return { success: true }
  } catch (error) {
    console.error('Error writing file:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to write file'
    }
  }
}

export async function getProjectRoot(): Promise<string> {
  const root = process.cwd()

  try {
    await fs.access(path.join(root, 'package.json'))
    await fs.access(path.join(root, 'components.json'))
    return root
  } catch {
    throw new Error('Could not find project root. Make sure you are in a Next.js project with components.json')
  }
}

export async function runCliCommand(command: string, args: string[], cwd: string) {
  console.log('Running command:', command, args, cwd)
  return new Promise<ReadableStream>((resolve, reject) => {
    const child = exec(`${command} ${args.join(' ')}`, { cwd })
    
    const stream = new ReadableStream({
      start(controller) {
        child.stdout?.on('data', (data) => {
          controller.enqueue(new TextEncoder().encode(data.toString()))
        })
        
        child.stderr?.on('data', (data) => {
          controller.enqueue(new TextEncoder().encode(data.toString()))
        })
        
        child.on('close', (code) => {
          if (code === 0) {
            controller.close()
          } else {
            controller.error(new Error(`Process exited with code ${code}`))
          }
        })
        
        child.on('error', (err) => {
          controller.error(err)
        })
      }
    })
    
    resolve(stream)
  })
}

export async function addComponent(input: AddComponentInput): Promise<ComponentResult> {
  try {
    const { valid, error } = addComponentSchema.safeParse(input)
    if (!valid) {
      throw new Error('Invalid input')
    }

    const configExists = await checkConfigExists()
    if (!configExists) {
      throw new Error('components.json not found')
    }

    const componentPath = input.path ?? DEFAULT_COMPONENT_PATH
    const exists = await checkComponentExists(componentPath)
    if (exists) {
      throw new Error('Component already exists')
    }

    const command = buildShadcnCommand(input)
    console.log('Running command:', command)

    const result = await spawnShadcnCommand(command)
    console.log('Command result:', result)

    return {
      success: true,
      message: `Successfully added ${input.component}`
    }
  } catch (error) {
    console.error('Error adding component:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add component'
    }
  }
}
