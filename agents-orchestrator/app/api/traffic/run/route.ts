import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function POST(req: NextRequest) {
    const encoder = new TextEncoder();

    try {
        const { scriptContent } = await req.json();

        if (!scriptContent) {
            return new Response('Missing script content', { status: 400 });
        }

        const stream = new ReadableStream({
            async start(controller) {
                // Create temp file
                const tmpDir = os.tmpdir();
                const filePath = path.join(tmpDir, `traffic-gen-${Date.now()}.py`);

                try {
                    await fs.writeFile(filePath, scriptContent);

                    // Use stdbuf to disable buffering if available, otherwise just python3 -u
                    const pythonProcess = spawn('python3', ['-u', filePath]);

                    pythonProcess.stdout.on('data', (data) => {
                        controller.enqueue(encoder.encode(data.toString()));
                    });

                    pythonProcess.stderr.on('data', (data) => {
                        controller.enqueue(encoder.encode(`[STDERR] ${data.toString()}`));
                    });

                    pythonProcess.on('close', (code) => {
                        controller.enqueue(encoder.encode(`\n[PROCESS] Exited with code ${code}`));
                        controller.close();
                        // Cleanup
                        fs.unlink(filePath).catch(console.error);
                    });

                    pythonProcess.on('error', (err) => {
                        controller.enqueue(encoder.encode(`\n[ERROR] Failed to start process: ${err.message}`));
                        controller.close();
                        fs.unlink(filePath).catch(console.error);
                    });

                    // Handle client disconnect
                    req.signal.addEventListener('abort', () => {
                        pythonProcess.kill();
                        fs.unlink(filePath).catch(console.error);
                    });

                } catch (error) {
                    controller.enqueue(encoder.encode(`Error: ${error}`));
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        return new Response(`Error processing request: ${error}`, { status: 500 });
    }
}
