'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type HlsType from 'hls.js';
import { RefreshCw, VideoOff } from 'lucide-react';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import styles from './CctvPlayer.module.css';

interface CctvPlayerProps {
  cameraName: string;
  sourceLabel?: string;
  liveUrl: string | null;
  connected: boolean;
  compact?: boolean;
}

type PlayerState = 'loading' | 'live' | 'offline';

export function CctvPlayer({
  cameraName,
  sourceLabel = 'Portal CCTV Resmi DIY',
  liveUrl,
  connected,
  compact = false,
}: CctvPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<HlsType | null>(null);
  const [state, setState] = useState<PlayerState>(connected && liveUrl ? 'loading' : 'offline');
  const [statusMessage, setStatusMessage] = useState(
    connected && liveUrl
      ? 'Menghubungkan ke siaran langsung HLS...'
      : 'Portal sumber kamera ini sedang dalam pemeliharaan.'
  );

  const dispose = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.removeAttribute('src');
      v.load();
    }
  }, []);

  const loadStream = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;

    dispose();

    if (!connected || !liveUrl) {
      setState('offline');
      setStatusMessage('Siaran sementara offline atau portal sumber dalam pemeliharaan.');
      return;
    }

    setState('loading');
    setStatusMessage('Menghubungkan ke stream langsung HLS...');

    // Dynamic import keeps hls.js (~180KB) completely out of initial route transition bundle!
    const { default: Hls } = await import('hls.js');
    if (!videoRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 16,
        manifestLoadingTimeOut: 10000,
      });
      hlsRef.current = hls;

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(liveUrl);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setState('live');
        setStatusMessage('Siaran langsung terhubung.');
        v.play().catch(() => {
          setStatusMessage('Stream siap. Tekan tombol putar pada pemutar video.');
        });
      });

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          hls.destroy();
          hlsRef.current = null;
          setState('offline');
          setStatusMessage('Stream langsung tidak merespons dari server kamera.');
        }
      });

      hls.attachMedia(v);
      return;
    }

    if (v.canPlayType('application/vnd.apple.mpegurl')) {
      v.src = liveUrl;
      v.load();
      v.play()
        .then(() => {
          setState('live');
          setStatusMessage('Siaran langsung terhubung.');
        })
        .catch(() => {
          setState('live');
          setStatusMessage('Stream siap. Tekan tombol putar untuk memulai.');
        });
      return;
    }

    setState('offline');
    setStatusMessage('Browser belum mendukung pemutaran HLS.');
  }, [connected, liveUrl, dispose]);

  useEffect(() => {
    void loadStream();
    return dispose;
  }, [loadStream, dispose]);

  const badgeTone: BadgeTone =
    state === 'live' ? 'success' : state === 'offline' ? 'danger' : 'neutral';
  const badgeLabel =
    state === 'live' ? 'Live Aktif' : state === 'offline' ? 'Tidak Tersedia' : 'Memuat';

  const videoBlock = (
    <>
      <div className={styles.videoBox}>
        <video
          ref={videoRef}
          className={styles.video}
          controls={state !== 'offline'}
          muted
          playsInline
          autoPlay
          preload="metadata"
        />
        {state === 'offline' ? (
          <div className={styles.offlineOverlay}>
            <VideoOff size={26} strokeWidth={1.6} />
            <p className={styles.offlineTitle}>Siaran Langsung Sedang Tidak Tersedia</p>
            <p className={styles.offlineDesc}>{statusMessage}</p>
            <Button type="button" variant="secondary" size="sm" onClick={() => void loadStream()}>
              <RefreshCw size={13} />
              <span>Coba hubungkan ulang</span>
            </Button>
          </div>
        ) : null}
      </div>

      <div className={styles.controlsBar}>
        <span className={styles.statusText} role="status" aria-live="polite">
          {statusMessage}
        </span>
        <Button type="button" variant="secondary" size="sm" onClick={() => void loadStream()}>
          <RefreshCw size={13} />
          <span>Muat ulang</span>
        </Button>
      </div>
    </>
  );

  if (compact) {
    return videoBlock;
  }

  return (
    <Card>
      <CardHeader
        title={`Pemutar Siaran — ${cameraName}`}
        description={`Sumber: ${sourceLabel}`}
        action={
          <Badge tone={badgeTone} withDot>
            {badgeLabel}
          </Badge>
        }
      />
      <CardBody>
        {videoBlock}
        <p className={styles.attribution}>
          Streaming HLS langsung dari jaringan kamera publik Pemkot Yogyakarta (
          <a href="https://cctv.jogjakota.go.id/" target="_blank" rel="noopener noreferrer">
            cctv.jogjakota.go.id
          </a>
          ) dan Portal CCTV Jogja Istimewa (
          <a href="https://cctv.jogjaprov.go.id/" target="_blank" rel="noopener noreferrer">
            cctv.jogjaprov.go.id
          </a>
          ).
        </p>
      </CardBody>
    </Card>
  );
}
