"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, MapPin, Navigation, Clock, 
  Wind, Shield, Share2, ArrowLeft, 
  Download, Loader2, Info, Map as MapIcon,
  Wifi, WifiOff, Layers, Globe
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

export default function GoogleEarthTrackingPage() {
    const { id } = useParams();
    const router = useRouter();
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [mapError, setMapError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [viewMode, setViewMode] = useState<'roadmap' | 'hybrid'>('hybrid');
    const [eta, setEta] = useState<string>("Calculando...");
    const [distance, setDistance] = useState<string>("--- km");
    const [progress, setProgress] = useState(0);
    const [busPos, setBusPos] = useState({ lat: -25.9692, lng: 32.5732 });
    const destination = { lat: -19.8317, lng: 34.8367 };

    // Elite components imports
    const EliteLoader = () => (
        <div className="fixed inset-0 z-[5000] bg-[#0B0B0F] flex flex-col items-center justify-center space-y-8">
            <div className="relative">
                <div className="w-24 h-24 border-[3px] border-sky-500/10 border-t-sky-500 rounded-full animate-[spin_1.5s_linear_infinite]" />
                <div className="absolute inset-0 w-24 h-24 border-[3px] border-white/5 rounded-full" />
            </div>
            <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Sincronizando Satélites</span>
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic text-white/20">MOZBUS LIVE TRACKING</h2>
            </div>
        </div>
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (loading) {
                setMapError(true);
                setLoading(false);
            }
        }, 8000);

        setOptions({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
            version: "weekly"
        });

        let movementInterval: NodeJS.Timeout;

        const initMap = async () => {
            try {
                const { Map } = await importLibrary('maps') as google.maps.MapsLibrary;
                const { DirectionsService, DirectionsRenderer } = await importLibrary('routes') as google.maps.RoutesLibrary;
                const { Marker } = await importLibrary('marker') as google.maps.MarkerLibrary;

                if (mapRef.current) {
                    const googleMap = new Map(mapRef.current, {
                        center: busPos,
                        zoom: 6,
                        mapTypeId: 'hybrid',
                        disableDefaultUI: true,
                    });

                    setMap(googleMap);
                    setLoading(false);
                    clearTimeout(timeout);

                    const directionsService = new DirectionsService();
                    const directionsRenderer = new DirectionsRenderer({
                        map: googleMap,
                        suppressMarkers: false,
                        polylineOptions: {
                            strokeColor: "#0EA5E9",
                            strokeWeight: 6,
                            strokeOpacity: 0.9,
                            zIndex: 100
                        }
                    });

                    const request: google.maps.DirectionsRequest = {
                        origin: new google.maps.LatLng(busPos.lat, busPos.lng),
                        destination: new google.maps.LatLng(destination.lat, destination.lng),
                        travelMode: google.maps.TravelMode.DRIVING,
                    };

                    directionsService.route(request, (result, status) => {
                        if (status === 'OK' && result) {
                            directionsRenderer.setDirections(result);
                            const route = result.routes[0].legs[0];
                            if (route) {
                                setEta(route.duration?.text.replace('mins', 'min') || "---");
                                setDistance(route.distance?.text || "--- km");
                                setProgress(15);
                            }
                        } else {
                            console.error("Detalhe do Erro Google:", status);
                            setEta(`Status: ${status}`);
                        }
                    });

                    const marker = new Marker({
                        position: busPos,
                        map: googleMap,
                        icon: {
                            url: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
                            scaledSize: new google.maps.Size(40, 40)
                        }
                    });

                    let currentPos = { ...busPos };
                    movementInterval = setInterval(() => {
                        currentPos.lat += 0.0001;
                        currentPos.lng += 0.0001;
                        marker.setPosition(currentPos);
                    }, 3000);
                }
            } catch (error) {
                console.error("Erro Google Maps:", error);
                setMapError(true);
                setLoading(false);
                clearTimeout(timeout);
            }
        };

        initMap();

        const handleStatus = () => setIsOffline(!navigator.onLine);
        window.addEventListener('online', handleStatus);
        window.addEventListener('offline', handleStatus);
        
        return () => {
            if (movementInterval) clearInterval(movementInterval);
            window.removeEventListener('online', handleStatus);
            window.removeEventListener('offline', handleStatus);
            clearTimeout(timeout);
        };
    }, []);

    const toggleViewMode = () => {
        if (!map) return;
        const newMode = viewMode === 'roadmap' ? 'hybrid' : 'roadmap';
        map.setMapTypeId(newMode);
        setViewMode(newMode);
    };

    if (loading) return <EliteLoader />;

    return (
        <div className="relative h-screen w-screen bg-black overflow-hidden text-white notranslate" translate="no">
            {mapError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0B0F] p-8 text-center space-y-8">
                    <div className="bg-rose-500/10 p-10 rounded-[3rem] border border-rose-500/20">
                        <MapIcon size={64} className="text-rose-500 opacity-50" />
                    </div>
                    <div className="space-y-4 max-w-md">
                        <h2 className="text-4xl font-black uppercase tracking-tighter italic">ERRO DE CONEXÃO.</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 leading-relaxed">
                            Não foi possível estabelecer ligação com os satélites de posicionamento global. Verifique a sua ligação ou tente novamente.
                        </p>
                    </div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-12 py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-500 transition-all"
                    >
                        Tentar Reconectar
                    </button>
                </div>
            ) : (
                <div ref={mapRef} className="absolute inset-0 z-0" />
            )}

            {/* Header */}
            <div className="absolute top-0 inset-x-0 z-[1000] p-6 pointer-events-none">
                <div className="max-w-7xl mx-auto flex justify-between items-start">
                    <motion.button 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.back()}
                        className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl hover:bg-sky-500/20 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </motion.button>

                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-[32px] flex items-center gap-6 shadow-2xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-sky-500 rounded-full animate-ping" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Google Earth Live</span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-center gap-2">
                            {isOffline ? <WifiOff size={14} className="text-rose-500" /> : <Wifi size={14} className="text-emerald-500" />}
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Real-time</span>
                        </div>
                    </motion.div>

                    <div className="flex flex-col gap-3 pointer-events-auto">
                        <button 
                            onClick={toggleViewMode}
                            className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl hover:bg-sky-500/20 transition-all flex items-center gap-3 active:scale-95"
                        >
                            {viewMode === 'hybrid' ? <MapIcon size={20} /> : <Globe size={20} />}
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {viewMode === 'hybrid' ? 'Ver Mapa' : 'Ver Satélite'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Painel Inferior */}
            <div className="absolute bottom-0 inset-x-0 z-[1000] p-4 md:p-8">
                <div className="max-w-5xl mx-auto space-y-4">
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-2xl">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Percurso</div>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                            />
                        </div>
                        <div className="text-[10px] font-black text-sky-400">{progress}%</div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[40px] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-8 text-black"
                    >
                        <div className="flex items-center gap-6">
                            <div className="bg-sky-500 p-4 rounded-3xl text-white">
                                <Bus size={32} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none text-black">NAGI <span className="text-sky-500">BUS</span></h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1 text-black">NAG-102-MZ • SCANIA IRIZAR</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-12">
                            <div className="text-center">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1">Chegada prevista</p>
                                <div className="flex items-end gap-1">
                                    <span className="text-4xl font-black tracking-tighter text-sky-500 leading-none">{eta.split(' ')[0]}</span>
                                    <span className="text-[10px] font-black uppercase mb-1">{eta.split(' ')[1] || 'min'}</span>
                                </div>
                            </div>
                            <div className="h-10 w-px bg-black/5" />
                            <div className="text-center">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1 text-black">Distância Total</p>
                                <p className="text-2xl font-black tracking-tighter text-black">
                                    {distance}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="bg-zinc-100 p-5 rounded-2xl hover:bg-zinc-200 transition-all">
                                <Share2 size={20} />
                            </button>
                            <button className="bg-black text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-sky-500 transition-all shadow-xl active:scale-95">
                                <Navigation size={16} /> Abrir no Google Maps
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
