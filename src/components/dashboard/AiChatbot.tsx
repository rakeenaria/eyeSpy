'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Send, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { MarkdownView } from '@/components/ui/MarkdownView';
import type { ChatMessage } from '@/types/eyespy';
import styles from './AiChatbot.module.css';

const QUICK_PROMPTS = [
  'Bandingkan angka kriminalitas 2024 vs 2025',
  'Titik lokasi paling rawan di DIY?',
  'Kapan jam paling rawan kejahatan jalanan?',
  'Kasus menonjol tahun 2026 di Sleman dan Bantul',
];

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    'Tanyakan statistik resmi Polda DIY (2024–2025), insiden riil terdokumentasi 2026 YTD, sebaran antar-kabupaten, atau rekomendasi rute aman di Yogyakarta.',
};

export function AiChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeModel, setActiveModel] = useState('Groq AI');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const history = messages.filter((m) => m !== INITIAL_MESSAGE).slice(-6);
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal memproses pertanyaan.');
      }
      if (json.model) {
        setActiveModel(json.model === 'database-live-query' ? 'Live Query' : 'Groq AI');
      }
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: json.reply || 'Tidak ada jawaban.' },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err instanceof Error
              ? err.message
              : 'Layanan asisten AI sedang tidak dapat dihubungi.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={styles.panel}>
      <CardHeader
        title="Asisten Analitik AI"
        description="Terkoneksi langsung ke basis data MySQL DIY 2024–2026."
        action={<Badge tone="accent">{activeModel}</Badge>}
      />
      <CardBody padding="flush">
        <div className={styles.chatContainer}>
          <div className={styles.messages} ref={scrollRef} role="log" aria-live="polite">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`${styles.msgRow} ${
                  msg.role === 'user' ? styles.userRow : styles.botRow
                }`}
              >
                <div
                  className={`${styles.bubble} ${
                    msg.role === 'user' ? styles.userBubble : styles.botBubble
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <MarkdownView content={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>

                {idx === 0 && messages.length === 1 ? (
                  <div className={styles.prompts}>
                    {QUICK_PROMPTS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        className={styles.promptBtn}
                        onClick={() => sendMessage(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {loading ? (
              <div className={styles.statusText}>
                <Loader2 size={14} className="spin" />
                <span>Menganalisis data basis data DIY...</span>
              </div>
            ) : null}
          </div>

          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              type="text"
              className={styles.input}
              placeholder="Tulis pertanyaan data kejahatan DIY..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={400}
              disabled={loading}
              aria-label="Pertanyaan asisten AI"
            />
            {messages.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setMessages([INITIAL_MESSAGE])}
                title="Bersihkan percakapan"
                aria-label="Bersihkan percakapan"
              >
                <Trash2 size={15} />
              </Button>
            ) : null}
            <Button type="submit" variant="primary" disabled={loading || !input.trim()}>
              <Send size={14} />
              <span>Kirim</span>
            </Button>
          </form>
        </div>
      </CardBody>
    </Card>
  );
}
