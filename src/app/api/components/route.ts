import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { files } = await request.json();
    
    for (const file of files) {
      const filePath = path.join(process.cwd(), file.path);
      const dir = path.dirname(filePath);
      
      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true });
      
      // Write file
      await fs.writeFile(filePath, file.content, 'utf-8');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error installing component:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to install component' },
      { status: 500 }
    );
  }
}
