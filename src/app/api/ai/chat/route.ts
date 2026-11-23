import { NextResponse } from 'next/server';
import { z } from 'zod';
import { askEyeSpyAssistant } from '@/lib/services/groq-ai';

export const dynamic = 'force-dynamic';

const chatSchema = z.object({
  message: z.string().trim().min(1, 'Pertanyaan tidak boleh kosong.').max(600),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Payload tidak valid.' },
        { status: 400 }
      );
    }

    const result = await askEyeSpyAssistant(parsed.data.message, parsed.data.history);
    return NextResponse.json({
      status: 'ok',
      reply: result.reply,
      model: result.model,
    });
  } catch (error) {
    console.error('[POST /api/ai/chat]', error);
    return NextResponse.json(
      { error: 'Asisten AI sedang sibuk. Silakan coba beberapa saat lagi.' },
      { status: 500 }
    );
  }
}
