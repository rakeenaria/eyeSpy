import React from 'react';
import styles from './MarkdownView.module.css';

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export function MarkdownView({ content, className }: MarkdownViewProps) {
  const normalized = content.replace(/<br\s*\/?>/gi, '\n').replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');

  const blocks: React.ReactNode[] = [];
  let listType: 'ol' | 'ul' | null = null;
  let listItems: React.ReactNode[] = [];

  const flushList = (keyBase: number) => {
    if (!listType || listItems.length === 0) return;
    if (listType === 'ol') {
      blocks.push(
        <ol key={`ol-${keyBase}`} className={styles.list}>
          {listItems}
        </ol>
      );
    } else {
      blocks.push(
        <ul key={`ul-${keyBase}`} className={styles.list}>
          {listItems}
        </ul>
      );
    }
    listType = null;
    listItems = [];
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) return;

    const headingMatch = line.match(/^#{1,4}\s+(.+)$/);
    if (headingMatch) {
      flushList(idx);
      blocks.push(
        <h3 key={`h-${idx}`} className={styles.heading}>
          {renderInline(headingMatch[1].trim())}
        </h3>
      );
      return;
    }

    const orderedMatch = line.match(/^\d+[.)]\s+(.+)$/);
    if (orderedMatch) {
      if (listType === 'ul') flushList(idx);
      listType = 'ol';
      listItems.push(<li key={`li-${idx}`}>{renderInline(orderedMatch[1].trim())}</li>);
      return;
    }

    const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      if (listType === 'ol') flushList(idx);
      listType = 'ul';
      listItems.push(<li key={`li-${idx}`}>{renderInline(bulletMatch[1].trim())}</li>);
      return;
    }

    flushList(idx);
    blocks.push(
      <p key={`p-${idx}`} className={styles.paragraph}>
        {renderInline(line)}
      </p>
    );
  });

  flushList(lines.length);

  return (
    <div className={className ? `${styles.root} ${className}` : styles.root}>
      {blocks}
    </div>
  );
}
