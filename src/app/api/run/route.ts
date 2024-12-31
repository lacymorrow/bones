import { spawn } from 'child_process'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
	const encoder = new TextEncoder()
	const { command, args, cwd } = await req.json()

	console.log('Executing command:')
	console.log('- Command:', command)
	console.log('- Args:', JSON.stringify(args))
	console.log('- CWD:', cwd)
	console.log('Full command:', `${command} ${args.join(' ')}`)

	const stream = new TransformStream()
	const writer = stream.writable.getWriter()

	const child = spawn(command, args, {
		cwd,
		stdio: 'pipe',
		shell: true
	})

	child.stdout.on('data', async (data) => {
		const chunk = data.toString()
		console.info(chunk)
		await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'output', content: chunk })}\n\n`))
	})

	child.stderr.on('data', async (data) => {
		const chunk = data.toString()
		console.warn(chunk)
		await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'error', content: chunk })}\n\n`))
	})

	child.on('close', async (code) => {
		console.log('Command exited with code:', code)
		await writer.write(
			encoder.encode(`data: ${JSON.stringify({ type: 'exit', code })}\n\n`)
		)
		await writer.close()
	})

	return new Response(stream.readable, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
		},
	})
}
