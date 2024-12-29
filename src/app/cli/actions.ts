'use server'

import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import { z } from 'zod'

const addComponentSchema = z.object({
	name: z.string(),
	path: z.string().optional(),
	overwrite: z.boolean().default(false),
})

type AddComponentInput = z.infer<typeof addComponentSchema>

async function checkComponentExists(componentName: string, targetDir: string) {
	// Common component files that might exist
	const possibleFiles = [
		`${componentName}.tsx`,
		`${componentName}/index.tsx`,
		`${componentName}.jsx`,
		`${componentName}/index.jsx`,
	]

	for (const file of possibleFiles) {
		try {
			await fs.access(path.join(targetDir, file))
			return true
		} catch {
			// File doesn't exist, continue checking
		}
	}
	return false
}

export async function addComponent(input: AddComponentInput) {
	const { name, path: targetPath, overwrite } = addComponentSchema.parse(input)
	const cwd = process.cwd()

	try {
		// Check if components.json exists
		const configPath = path.join(cwd, 'components.json')
		try {
			await fs.access(configPath)
		} catch {
			throw new Error('Configuration is missing. Please run init to create a components.json file.')
		}

		// Check if component already exists
		const componentDir = targetPath || path.join(cwd, 'src/components/ui')
		const exists = await checkComponentExists(name, componentDir)

		if (exists && !overwrite) {
			throw new Error(
				`Component ${name} already exists. Use the overwrite option if you want to replace it.`
			)
		}

		// Use the shadcn CLI directly
		const args = [
			'add',
			name,
			'--yes', // Skip confirmation prompts
		]

		if (overwrite) {
			args.push('-o') // Using short form for overwrite flag
		}

		if (targetPath) {
			args.push('--path', targetPath)
		}

		console.log('Running command:', 'shadcn', args.join(' ')) // Debug log

		return new Promise((resolve, reject) => {
			let errorOutput = ''
			let stdoutOutput = ''

			const child = spawn(path.join(cwd, 'node_modules', '.bin', 'shadcn'), args, {
				cwd,
				stdio: 'pipe', // Capture all output
			})

			child.stdout?.on('data', (data) => {
				const output = data.toString()
				stdoutOutput += output
				console.log('stdout:', output) // Debug log
			})

			child.stderr?.on('data', (data) => {
				const output = data.toString()
				errorOutput += output
				console.log('stderr:', output) // Debug log

				// Only reject if it's a real error and not just CLI output
				if (output.toLowerCase().includes('error') && !overwrite) {
					reject(new Error(`Component ${name} already exists. Use the overwrite option to replace it.`))
				}
			})

			child.on('error', (err) => {
				console.error('Spawn error:', err) // Debug log
				reject(new Error(`Failed to start command: ${err.message}`))
			})

			child.on('close', (code) => {
				console.log('Exit code:', code) // Debug log
				if (code === 0 || (code === 1 && overwrite)) {
					resolve({ success: true })
				} else {
					// Clean up error message for better user experience
					const cleanError = errorOutput
						.replace(/error:/gi, '')
						.trim()
						.replace(/\n+/g, ' ')
					reject(new Error(cleanError || `Failed to add component ${name}`))
				}
			})
		})

	} catch (error) {
		console.error('Error adding component:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to add component'
		}
	}
}
