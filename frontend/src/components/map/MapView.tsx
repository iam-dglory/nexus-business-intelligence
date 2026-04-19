// nexus/frontend/src/components/map/MapView.tsx
'use client';
import { useRef, useEffect, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Supercluster from 'supercluster';
import { useCompanies } from '../../hooks/useCompanies';
import { useStore } from '../../store/useStore';
import type { Company } from '../../types';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const TYPE_COLORS: Record<string, string> = {
  B2B: '#00d4ff',
  B2C: '#f59e0b',
  HYBRID: '#10b981',
};

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const clusterRef = useRef<Supercluster | null>(null);

  const { companies, isLoading } = useCompanies();
  const mapView = useStore((s) => s.mapView);
  const setSelectedCompany = useStore((s) => s.setSelectedCompany);

  // Init map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [20, 20],
      zoom: 2,
      minZoom: 1,
      maxZoom: 16,
      projection: { name: 'mercator' },
    });

    map.current.on('load', () => {
      // Custom dark style overrides
      map.current?.setPaintProperty('background', 'background-color', '#070b14');
      map.current?.setPaintProperty('water', 'fill-color', '#0d1422');
      map.current?.setPaintProperty('land', 'background-color', '#0d1829');
    });

    map.current.on('moveend', () => renderMarkers());
    map.current.on('zoomend', () => renderMarkers());

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const buildCluster = useCallback((cos: Company[]) => {
    const sc = new Supercluster({ radius: 60, maxZoom: 14 });
    sc.load(
      cos.map((c) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] },
        properties: { company: c },
      }))
    );
    clusterRef.current = sc;
  }, []);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  const renderMarkers = useCallback(() => {
    if (!map.current || !clusterRef.current) return;

    clearMarkers();

    const bounds = map.current.getBounds();
    const zoom = Math.floor(map.current.getZoom());

    const bbox: [number, number, number, number] = [
      bounds.getWest(), bounds.getSouth(),
      bounds.getEast(), bounds.getNorth(),
    ];

    const points = clusterRef.current.getClusters(bbox, zoom);

    points.forEach((point) => {
      const [lng, lat] = point.geometry.coordinates;
      const props = point.properties;

      let el: HTMLDivElement;

      if (props.cluster) {
        // Cluster marker
        const count = props.point_count as number;
        const size = count < 10 ? 36 : count < 50 ? 44 : count < 200 ? 52 : 64;

        el = document.createElement('div');
        el.className = 'nexus-cluster';
        el.style.cssText = `
          width: ${size}px; height: ${size}px;
          background: rgba(0, 212, 255, 0.12);
          border: 1.5px solid rgba(0, 212, 255, 0.6);
          color: #00d4ff;
          box-shadow: 0 0 12px rgba(0, 212, 255, 0.25);
        `;
        el.textContent = count > 999 ? `${Math.round(count / 1000)}k` : String(count);

        el.addEventListener('click', () => {
          const expansionZoom = clusterRef.current!.getClusterExpansionZoom(props.cluster_id as number);
          map.current!.easeTo({ center: [lng, lat], zoom: expansionZoom + 1 });
        });
      } else {
        // Individual company marker
        const company: Company = props.company;
        const color = TYPE_COLORS[company.businessType] ?? '#00d4ff';
        const isUnicorn = (company.valuationLabel ?? '').includes('B');

        el = document.createElement('div');
        el.className = 'nexus-marker';

        const size = isUnicorn ? 18 : 12;

        el.innerHTML = `
          <svg width="${size * 2 + 8}" height="${size * 2 + 8}" viewBox="0 0 ${size * 2 + 8} ${size * 2 + 8}">
            <circle cx="${size + 4}" cy="${size + 4}" r="${size + 2}"
              fill="${color}18" stroke="${color}" stroke-width="0.8" opacity="0.4"/>
            <circle cx="${size + 4}" cy="${size + 4}" r="${size}"
              fill="${color}22" stroke="${color}" stroke-width="1"/>
            <circle cx="${size + 4}" cy="${size + 4}" r="3.5" fill="${color}"/>
          </svg>
        `;

        el.addEventListener('click', () => {
          setSelectedCompany(company);
        });

        // Tooltip on hover
        el.title = company.name;
      }

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [clearMarkers, setSelectedCompany]);

  // Rebuild cluster when companies change
  useEffect(() => {
    if (companies.length === 0) return;
    buildCluster(companies);
    renderMarkers();
  }, [companies, buildCluster, renderMarkers]);

  // Re-render on view change
  useEffect(() => {
    renderMarkers();
  }, [mapView, renderMarkers]);

  // Heatmap source
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const sourceId = 'nexus-heat';

    if (map.current.getSource(sourceId)) {
      (map.current.getSource(sourceId) as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: companies.map((c) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
          properties: { weight: (c.growthRate ?? 0) / 100 },
        })),
      });
    } else if (companies.length > 0) {
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: companies.map((c) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
            properties: { weight: (c.growthRate ?? 0) / 100 },
          })),
        },
      });

      map.current.addLayer({
        id: 'nexus-heatmap',
        type: 'heatmap',
        source: sourceId,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 1, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'rgba(0,212,255,0.2)',
            0.5, 'rgba(124,58,237,0.5)',
            0.8, 'rgba(236,72,153,0.7)',
            1, 'rgba(255,255,255,0.9)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 20, 9, 40],
          'heatmap-opacity': mapView === 'heatmap' ? 0.8 : 0,
        },
      });
    }

    // Toggle heatmap visibility
    if (map.current.getLayer('nexus-heatmap')) {
      map.current.setPaintProperty(
        'nexus-heatmap', 'heatmap-opacity',
        mapView === 'heatmap' ? 0.8 : 0
      );
    }
  }, [companies, mapView]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {isLoading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 glass-panel border border-border rounded px-4 py-2 font-mono text-xs text-neon-blue animate-pulse z-10">
          ◈ SCANNING NETWORK...
        </div>
      )}

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 glass-panel border border-border rounded p-2.5 z-10">
        <p className="font-mono text-xs text-muted mb-1.5 tracking-widest">TYPE</p>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="font-mono text-xs text-slate-400">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
