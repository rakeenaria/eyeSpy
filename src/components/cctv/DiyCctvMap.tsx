'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { CctvCamera } from '@/types/eyespy';
import styles from './DiyCctvMap.module.css';

interface DiyCctvMapProps {
  cameras: CctvCamera[];
  selectedSlug: string | null;
  onSelect: (camera: CctvCamera) => void;
}

type BasemapMode = 'street' | 'satellite';

const DIY_PRESETS: { label: string; center: [number, number]; zoom: number }[] = [
  { label: 'Seluruh DIY', center: [-7.825, 110.39], zoom: 10 },
  { label: 'Kota Jogja (Live)', center: [-7.7956, 110.3695], zoom: 13 },
  { label: 'Sleman', center: [-7.716, 110.355], zoom: 12 },
  { label: 'Bantul', center: [-7.888, 110.329], zoom: 12 },
  { label: 'Kulon Progo', center: [-7.826, 110.165], zoom: 12 },
  { label: 'Gunung Kidul', center: [-7.967, 110.602], zoom: 11 },
];

const BASEMAPS: Record<BasemapMode, { url: string; attribution: string }> = {
  street: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri — OpenStreetMap &amp; GIS Community',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri — World Imagery',
  },
};

export function DiyCctvMap({ cameras, selectedSlug, onSelect }: DiyCctvMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const canvasRendererRef = useRef<L.Canvas | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const [basemap, setBasemap] = useState<BasemapMode>('street');

  // Initialize Leaflet map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const renderer = L.canvas({ padding: 0.5 });
    canvasRendererRef.current = renderer;

    const map = L.map(containerRef.current, {
      center: [-7.7956, 110.3695],
      zoom: 13,
      minZoom: 9,
      maxZoom: 18,
      preferCanvas: true,
      maxBounds: [
        [-8.35, 109.85],
        [-7.35, 111.05],
      ],
      maxBoundsViscosity: 0.7,
    });

    const initialLayer = L.tileLayer(BASEMAPS.street.url, {
      attribution: BASEMAPS.street.attribution,
      maxZoom: 18,
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    tileLayerRef.current = initialLayer;
    layerGroupRef.current = group;

    // Ensure proper tile sizing after layout settles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 120);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      layerGroupRef.current = null;
      canvasRendererRef.current = null;
    };
  }, []);

  // Swap basemap cleanly when user toggles Street / Satellite
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const cfg = BASEMAPS[basemap];
    tileLayerRef.current = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: 18,
    }).addTo(map);
    tileLayerRef.current.bringToBack();
  }, [basemap]);

  // Re-render markers whenever filtered cameras or selection changes
  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    const renderer = canvasRendererRef.current;
    if (!map || !group || !renderer) return;

    group.clearLayers();

    const sorted = [...cameras].sort((a, b) => {
      const aScore = a.slug === selectedSlug ? 2 : a.connected ? 1 : 0;
      const bScore = b.slug === selectedSlug ? 2 : b.connected ? 1 : 0;
      return aScore - bScore;
    });

    for (const cam of sorted) {
      if (cam.latitude === null || cam.longitude === null) continue;
      if (
        cam.latitude < -8.35 ||
        cam.latitude > -7.35 ||
        cam.longitude < 109.85 ||
        cam.longitude > 111.05
      ) {
        continue;
      }

      const isSelected = cam.slug === selectedSlug;
      const isOnline = cam.connected;

      const marker = L.circleMarker([cam.latitude, cam.longitude], {
        renderer,
        radius: isSelected ? 8.5 : isOnline ? 6 : 4.2,
        fillColor: isSelected ? '#2563EB' : isOnline ? '#15803D' : '#64748B',
        color: '#FFFFFF',
        weight: isSelected ? 2.5 : 1.5,
        opacity: 1,
        fillOpacity: isSelected ? 1 : isOnline ? 0.94 : 0.72,
      });

      marker.bindTooltip(
        `<div style="font-size:12px;line-height:1.35"><strong>${cam.displayName.replace(/</g, '&lt;')}</strong><br/><span style="color:${isOnline ? '#15803D' : '#64748B'}">${isOnline ? 'Live Aktif' : 'Pemeliharaan'}</span> &bull; ${cam.groupName.replace(/</g, '&lt;')}</div>`,
        { direction: 'top', offset: [0, -6] }
      );

      marker.on('click', () => {
        onSelectRef.current(cam);
      });

      marker.addTo(group);
    }
  }, [cameras, selectedSlug]);

  // Fly smoothly to selected camera
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedSlug) return;
    const target = cameras.find((c) => c.slug === selectedSlug);
    if (target && target.latitude !== null && target.longitude !== null) {
      const nextZoom = Math.max(map.getZoom(), 14);
      map.flyTo([target.latitude, target.longitude], nextZoom, { duration: 0.45 });
    }
  }, [selectedSlug, cameras]);

  function focusRegion(center: [number, number], zoom: number) {
    mapRef.current?.flyTo(center, zoom, { duration: 0.5 });
  }

  return (
    <div>
      <div className={styles.quickBar}>
        <div className={styles.regionBtns}>
          {DIY_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className={styles.regionBtn}
              onClick={() => focusRegion(p.center, p.zoom)}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            className={styles.regionBtn}
            onClick={() => setBasemap((b) => (b === 'street' ? 'satellite' : 'street'))}
            style={{ fontWeight: 600, color: 'var(--accent)', borderColor: 'var(--accent-border)' }}
          >
            {basemap === 'street' ? 'Mode Satelit' : 'Mode Peta Jalan'}
          </button>
        </div>

        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.dotLive} />
            Live Aktif
          </span>
          <span className={styles.legendItem}>
            <span className={styles.dotSelected} />
            Dipilih
          </span>
          <span className={styles.legendItem}>
            <span className={styles.dotMaint} />
            Pemeliharaan
          </span>
        </div>
      </div>

      <div className={styles.mapWrapper}>
        <div ref={containerRef} className={styles.mapCanvas} />
      </div>
    </div>
  );
}
