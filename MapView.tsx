'use client';
import { useRef, useEffect, useCallback } from 'react';
import Supercluster from 'supercluster';
import { useCompanies } from '../../hooks/useCompanies';
import { useStore } from '../../store/useStore';
import type { Company } from '../../types';

const TYPE_COLORS: Record<string, string> = {
  B2B: '#00d4ff',
  B2C: '#f59e0b',
  HYBRID: '#10b981',
};

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const clusterRef = useRef<Supercluster | null>(null);
  const LRef = useRef<any>(null);
  const popupRef = useRef<any>(null);
  const hideTimer = useRef<any>(null);

  const { companies, isLoading } = useCompanies();
  const mapView = useStore((s) => s.mapView);
  const setSelectedCompany = useStore((s) => s.setSelectedCompany);
  const setConnectModalOpen = useStore((s) => s.setConnectModalOpen);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    import('leaflet').then((L) => {
      LRef.current = L.default ?? L;
      const Lx = LRef.current;
      delete (Lx.Icon.Default.prototype as any)._getIconUrl;
      const map = Lx.map(mapContainer.current!, { center: [20, 20], zoom: 2, minZoom: 1, maxZoom: 16 });
      Lx.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CartoDB', subdomains: 'abcd', maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
      map.on('movestart', () => cancelHide());
      map.on('moveend', () => renderMarkers());
      map.on('zoomend', () => renderMarkers());
    });
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  const cancelHide = useCallback(() => {
    clearTimeout(hideTimer.current);
  }, []);

  const scheduleHide = useCallback((delay = 350) => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
    }, delay);
  }, []);

  const buildCluster = useCallback((cos: Company[]) => {
    const sc = new Supercluster({ radius: 60, maxZoom: 14 });
    sc.load(cos.map((c) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] },
      properties: { company: c },
    })));
    clusterRef.current = sc;
  }, []);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  const showPopup = useCallback((company: Company, lat: number, lng: number) => {
    const map = mapRef.current;
    const Lx = LRef.current;
    if (!map || !Lx) return;
    cancelHide();
    if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }

    const color = TYPE_COLORS[company.businessType] ?? '#00d4ff';
    const age = new Date().getFullYear() - company.foundedYear;
    const growth = company.growthRate != null ? `${company.growthRate > 0 ? '+' : ''}${company.growthRate}%` : '—';
    const growthColor = (company.growthRate ?? 0) >= 0 ? '#10b981' : '#ef4444';
    const cid = company.id;

    const isYC = company.tags?.some((t: any) => t.tag === 'YC' || t.tag === 'Y Combinator');
    const isSV = company.tags?.some((t: any) => t.tag === 'Silicon Valley');

    const updates = company.updates?.slice(0, 2).map((u: any) => `
      <div style="display:flex;gap:8px;padding:5px 0;border-bottom:1px solid #1e2d3d">
        <span style="width:5px;height:5px;border-radius:50%;background:#10b981;flex-shrink:0;margin-top:5px"></span>
        <div>
          <div style="font-size:10px;color:#e2e8f0;line-height:1.5">${u.title}</div>
          <div style="font-size:8px;color:#64748b;margin-top:1px;letter-spacing:1px">${(u.category||'').toUpperCase()}</div>
        </div>
      </div>`).join('') ?? '';

    const tags = company.tags?.slice(0, 5).map((t: any) => {
      const isSpecial = t.tag === 'YC' || t.tag === 'Y Combinator';
      const isSVTag = t.tag === 'Silicon Valley';
      const bg = isSpecial ? 'background:#f59e0b22;border:1px solid #f59e0b88;color:#f59e0b' 
                : isSVTag  ? 'background:#7c3aed22;border:1px solid #7c3aed88;color:#a78bfa'
                : 'background:#1a2235;border:1px solid #1e2d3d;color:#94a3b8';
      return `<span style="padding:2px 7px;border-radius:3px;font-size:8px;margin:2px 2px 0 0;display:inline-block;font-family:monospace;${bg}">${isSpecial ? '🅨 ' : ''}${t.tag}</span>`;
    }).join('') ?? '';

    const content = `
      <div id="nxcard-${cid}" style="background:#0a1120;border:1.5px solid #2d4a6a;border-radius:12px;overflow:hidden;width:290px;font-family:'Space Mono',monospace;box-shadow:0 12px 48px rgba(0,0,0,0.95);cursor:default;position:relative">
        
        ${isYC ? `<div style="background:linear-gradient(90deg,#f59e0b,#ea580c);padding:5px 14px;font-size:8px;font-weight:700;letter-spacing:2px;color:#000;display:flex;align-items:center;gap:5px">🅨 Y COMBINATOR BACKED COMPANY</div>` : ''}
        ${isSV && !isYC ? `<div style="background:linear-gradient(90deg,#7c3aed,#4f46e5);padding:4px 14px;font-size:8px;font-weight:700;letter-spacing:2px;color:#fff">⬡ SILICON VALLEY</div>` : ''}

        <div style="padding:14px 16px 11px;background:#0f1a2e;border-bottom:1px solid #1e2d3d">
          <div style="display:flex;align-items:flex-start;gap:10px">
            <div style="width:40px;height:40px;border-radius:9px;background:${color}22;border:1.5px solid ${color}55;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px;font-weight:700;color:${color}">${company.name.slice(0,2).toUpperCase()}</div>
            <div style="flex:1;min-width:0">
              <div id="nxname-${cid}" style="font-size:14px;font-weight:700;color:#f1f5f9;cursor:pointer;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-decoration:underline;text-decoration-color:${color}66;text-underline-offset:3px">${company.name}</div>
              <div style="font-size:9px;color:${color};letter-spacing:1px;margin-bottom:1px">${company.industry}</div>
              <div style="font-size:9px;color:#64748b">${company.city}, ${company.country}</div>
            </div>
            <span style="padding:3px 8px;border:1px solid ${color};color:${color};background:${color}18;border-radius:4px;font-size:8px;letter-spacing:1px;flex-shrink:0;font-weight:700">${company.businessType}</span>
          </div>
          ${tags ? `<div style="margin-top:9px;display:flex;flex-wrap:wrap">${tags}</div>` : ''}
        </div>

        <div style="padding:12px 16px 14px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">
            <div style="background:#0f1a2e;border:1px solid #1e2d3d;border-radius:6px;padding:9px">
              <div style="font-size:14px;font-weight:700;color:#f59e0b;line-height:1">${age}<span style="font-size:9px;margin-left:2px">yrs</span></div>
              <div style="font-size:8px;color:#64748b;margin-top:3px">Est. ${company.foundedYear}</div>
            </div>
            <div style="background:#0f1a2e;border:1px solid #1e2d3d;border-radius:6px;padding:9px">
              <div style="font-size:14px;font-weight:700;color:#00d4ff;line-height:1">${company.employeeCount != null ? (company.employeeCount >= 1000 ? (company.employeeCount/1000).toFixed(1)+'k' : company.employeeCount) : '—'}</div>
              <div style="font-size:8px;color:#64748b;margin-top:3px">Employees</div>
            </div>
            <div style="background:#0f1a2e;border:1px solid #1e2d3d;border-radius:6px;padding:9px">
              <div style="font-size:14px;font-weight:700;color:#10b981;line-height:1">${company.valuationLabel ?? '—'}</div>
              <div style="font-size:8px;color:#64748b;margin-top:3px">Valuation</div>
            </div>
            <div style="background:#0f1a2e;border:1px solid #1e2d3d;border-radius:6px;padding:9px">
              <div style="font-size:14px;font-weight:700;color:${growthColor};line-height:1">${growth}</div>
              <div style="font-size:8px;color:#64748b;margin-top:3px">YoY Growth</div>
            </div>
          </div>

          ${updates ? `<div style="margin-bottom:12px"><div style="font-size:8px;color:#00d4ff;letter-spacing:2px;margin-bottom:6px;font-weight:700">RECENT ACTIVITY</div>${updates}</div>` : ''}

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <button id="nxdetails-${cid}" style="padding:10px 8px;background:rgba(0,212,255,0.1);border:1.5px solid rgba(0,212,255,0.35);border-radius:6px;font-size:9px;color:#00d4ff;letter-spacing:1px;text-align:center;cursor:pointer;font-weight:700;font-family:'Space Mono',monospace;transition:all .15s">
              VIEW FULL DETAILS
            </button>
            <button id="nxconnect-${cid}" style="padding:10px 8px;background:linear-gradient(135deg,#7c3aed,#4f46e5);border:none;border-radius:6px;font-size:9px;color:#fff;letter-spacing:1px;text-align:center;cursor:pointer;font-weight:700;font-family:'Space Mono',monospace;transition:all .15s;box-shadow:0 2px 12px rgba(124,58,237,0.4)">
              CONNECT →
            </button>
          </div>
        </div>
      </div>`;

    const popup = Lx.popup({
      closeButton: false,
      className: 'nexus-popup',
      offset: [0, -10],
      autoPan: true,
      maxWidth: 310,
    }).setLatLng([lat, lng]).setContent(content).addTo(map);

    popupRef.current = popup;

    setTimeout(() => {
      const card = document.getElementById(`nxcard-${cid}`);
      if (card) {
        card.addEventListener('mouseenter', () => cancelHide());
        card.addEventListener('mouseleave', () => scheduleHide(300));
      }
      document.getElementById(`nxname-${cid}`)?.addEventListener('click', (e) => {
        e.stopPropagation(); setSelectedCompany(company);
        if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
      });
      document.getElementById(`nxdetails-${cid}`)?.addEventListener('click', (e) => {
        e.stopPropagation(); setSelectedCompany(company);
        if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
      });
      document.getElementById(`nxconnect-${cid}`)?.addEventListener('click', (e) => {
        e.stopPropagation(); setSelectedCompany(company); setConnectModalOpen(true);
        if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
      });
    }, 60);
  }, [setSelectedCompany, setConnectModalOpen, cancelHide, scheduleHide]);

  const renderMarkers = useCallback(() => {
    const map = mapRef.current;
    const Lx = LRef.current;
    if (!map || !clusterRef.current || !Lx) return;
    clearMarkers();

    const bounds = map.getBounds();
    const zoom = Math.floor(map.getZoom());
    const bbox: [number, number, number, number] = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];

    clusterRef.current.getClusters(bbox, zoom).forEach((point: any) => {
      const [lng, lat] = point.geometry.coordinates;
      const props = point.properties;
      let marker: any;

      if (props.cluster) {
        const count = props.point_count as number;
        const size = count < 10 ? 36 : count < 50 ? 44 : count < 200 ? 52 : 64;
        const icon = Lx.divIcon({
          html: `<div style="width:${size}px;height:${size}px;background:rgba(0,212,255,0.12);border:1.5px solid rgba(0,212,255,0.7);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#00d4ff;font-family:monospace;font-size:11px;font-weight:700;box-shadow:0 0 14px rgba(0,212,255,0.3);cursor:pointer">${count > 999 ? Math.round(count/1000)+'k' : count}</div>`,
          className: '', iconSize: [size, size], iconAnchor: [size/2, size/2],
        });
        marker = Lx.marker([lat, lng], { icon }).addTo(map);
        marker.on('click', () => {
          const z = clusterRef.current!.getClusterExpansionZoom(props.cluster_id);
          map.setView([lat, lng], Math.min(z + 1, 16));
        });
      } else {
        const company: Company = props.company;
        const color = TYPE_COLORS[company.businessType] ?? '#00d4ff';
        const isYC = company.tags?.some((t: any) => t.tag === 'YC' || t.tag === 'Y Combinator');
        const isLarge = (company.valuationLabel ?? '').includes('B');
        const size = isLarge ? 18 : 12;
        const total = size * 2 + 8;

        // YC companies get a special orange ring
        const outerStroke = isYC ? '#f59e0b' : color;
        const outerOpacity = isYC ? '0.9' : '0.4';

        const icon = Lx.divIcon({
          html: `
            <div style="position:relative;width:${total+12}px;height:${total+12}px;cursor:pointer" title="${company.name}">
              <svg width="${total+12}" height="${total+12}" viewBox="0 0 ${total+12} ${total+12}" style="position:absolute;top:0;left:0;overflow:visible">
                <circle cx="${(total+12)/2}" cy="${(total+12)/2}" r="${size+7}" fill="${outerStroke}10" stroke="${outerStroke}" stroke-width="0.8" opacity="${outerOpacity}"/>
                <circle cx="${(total+12)/2}" cy="${(total+12)/2}" r="${size+2}" fill="${color}22" stroke="${color}" stroke-width="1.2"/>
                <circle cx="${(total+12)/2}" cy="${(total+12)/2}" r="4" fill="${isYC ? '#f59e0b' : color}"/>
                ${isYC ? `<text x="${(total+12)/2}" y="${(total+12)/2+3}" text-anchor="middle" font-size="5" font-weight="700" fill="#000" font-family="monospace">YC</text>` : ''}
              </svg>
            </div>`,
          className: '',
          iconSize: [total+12, total+12],
          iconAnchor: [(total+12)/2, (total+12)/2],
        });
        marker = Lx.marker([lat, lng], { icon }).addTo(map);

        marker.on('mouseover', () => { cancelHide(); showPopup(company, lat, lng); });
        marker.on('mouseout', () => scheduleHide(400));
        marker.on('click', () => { setSelectedCompany(company); if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; } });
      }
      markersRef.current.push(marker);
    });
  }, [clearMarkers, setSelectedCompany, showPopup, cancelHide, scheduleHide]);

  useEffect(() => {
    if (companies.length === 0) return;
    buildCluster(companies);
    setTimeout(() => renderMarkers(), 200);
  }, [companies, buildCluster, renderMarkers]);

  useEffect(() => { renderMarkers(); }, [mapView, renderMarkers]);

  return (
    <div className="relative w-full h-full">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <style>{`
        .nexus-popup .leaflet-popup-content-wrapper{background:transparent!important;border:none!important;box-shadow:none!important;padding:0!important}
        .nexus-popup .leaflet-popup-content{margin:0!important}
        .nexus-popup .leaflet-popup-tip-container{display:none!important}
        .nexus-popup{z-index:9999!important}
      `}</style>
      <div ref={mapContainer} className="w-full h-full" style={{ background: '#070b14' }} />
      {isLoading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 glass-panel border border-border rounded px-4 py-2 font-mono text-xs text-neon-blue animate-pulse z-10">
          ◈ SCANNING NETWORK...
        </div>
      )}
      <div className="absolute bottom-4 left-4 glass-panel border border-border rounded p-2.5 z-[1000]">
        <p className="font-mono text-xs text-muted mb-2 tracking-widest">TYPE</p>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="font-mono text-xs text-slate-400">{type}</span>
          </div>
        ))}
        <div className="border-t border-border mt-2 pt-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
          <span className="font-mono text-xs text-neon-amber">YC Backed</span>
        </div>
      </div>
    </div>
  );
}
