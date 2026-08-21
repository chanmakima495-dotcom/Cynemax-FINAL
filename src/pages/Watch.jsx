import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { fetchStream, fetchDetail, fetchCaptions } from '../api/detail';
import {
  ArrowLeft, Volume2, VolumeX, Maximize, Minimize,
  Play, Pause, RotateCcw, AlertTriangle, ChevronDown,
  SkipForward, SkipBack, Settings, Subtitles, Languages
} from 'lucide-react';

function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function Watch() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const detailPath = searchParams.get('detail_path') || '';
  const season     = parseInt(searchParams.get('season') || '1');
  const ep         = parseInt(searchParams.get('ep')     || '1');

  const videoRef  = useRef(null);
  const hlsRef    = useRef(null);
  const wrapRef   = useRef(null);
  const ctTimer   = useRef(null);

  const [streamInfo,     setStreamInfo]     = useState(null);
  const [detail,         setDetail]         = useState(null);
  const [captions,       setCaptions]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [playing,        setPlaying]        = useState(false);
  const [muted,          setMuted]          = useState(false);
  const [volume,         setVolume]         = useState(1);
  const [progress,       setProgress]       = useState(0);
  const [currentTime,    setCurrentTime]    = useState(0);
  const [duration,       setDuration]       = useState(0);
  const [showCtrls,      setShowCtrls]      = useState(true);
  const [fullscreen,     setFullscreen]     = useState(false);
  const [buffering,      setBuffering]      = useState(false);
  const [qualities,      setQualities]      = useState([]);
  const [selQuality,     setSelQuality]     = useState(-1);
  const [showSettings,   setShowSettings]   = useState(false);
  const [showSubs,       setShowSubs]       = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(season);

  // Dubbed audio selection
  const [dubs,           setDubs]           = useState([]);
  const [selectedDub,    setSelectedDub]    = useState(null);
  const [showDubPicker,  setShowDubPicker]  = useState(false);

  // Active subject/path — changes when dub switches
  const [activeSubjectId, setActiveSubjectId] = useState(subjectId);
  const [activeDetailPath, setActiveDetailPath] = useState(detailPath);

  /* ── Load stream ── */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStreamInfo(null);
    setPlaying(false);
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    try {
      const [stream, det, caps] = await Promise.all([
        fetchStream(activeSubjectId, activeDetailPath, season, ep),
        fetchDetail(activeDetailPath).catch(() => null),
        fetchCaptions(activeSubjectId, activeDetailPath, season, ep),
      ]);

      setDetail(det);
      setCaptions(Array.isArray(caps) ? caps : []);
      setStreamInfo(stream);

      // Extract dubs from detail
      const detailDubs = det?.subject?.trailer?.dubs || [];
      if (detailDubs.length > 0 && dubs.length === 0) {
        setDubs(detailDubs);
        // Auto-select current dub
        const current = detailDubs.find(d =>
          d.subjectId === activeSubjectId || d.detailPath === activeDetailPath
        ) || detailDubs[0];
        setSelectedDub(current);
      }
    } catch (e) {
      setError(e.message || 'Stream unavailable.');
    } finally {
      setLoading(false);
    }
  }, [activeSubjectId, activeDetailPath, season, ep]);

  useEffect(() => { load(); }, [load]);

  /* ── Switch dubbed version ── */
  function switchDub(dub) {
    setSelectedDub(dub);
    setShowDubPicker(false);
    setActiveSubjectId(dub.subjectId);
    setActiveDetailPath(dub.detailPath || activeDetailPath);
  }

  /* ── Attach video ── */
  useEffect(() => {
    if (!streamInfo?.url || !videoRef.current) return;
    const video = videoRef.current;
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    // Embed type — show iframe instead
    if (streamInfo.type === 'embed') return;

    const isHls = streamInfo.url.includes('.m3u8') || streamInfo.type === 'hls';
    const direct = () => { video.src = streamInfo.url; video.load(); video.play().catch(() => {}); };

    if (isHls && !video.canPlayType('application/vnd.apple.mpegurl')) {
      import('hls.js').then(({ default: Hls }) => {
        if (!Hls.isSupported()) { direct(); return; }
        const hls = new Hls({ enableWorker: true, maxBufferLength: 30 });
        hls.loadSource(streamInfo.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, (_, d) => {
          const lvls = d.levels.map((l, i) => ({
            index: i,
            label: l.height ? `${l.height}p` : `Level ${i + 1}`
          }));
          setQualities([{ index: -1, label: 'Auto' }, ...lvls]);
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, d) => {
          if (d.fatal) setError('HLS error — ' + (d.details || 'unknown'));
        });
        hlsRef.current = hls;
      });
    } else {
      direct();
    }

    return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; } };
  }, [streamInfo]);

  useEffect(() => { if (hlsRef.current) hlsRef.current.currentLevel = selQuality; }, [selQuality]);

  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  function showCtrlsTemp() {
    setShowCtrls(true);
    clearTimeout(ctTimer.current);
    ctTimer.current = setTimeout(() => setShowCtrls(false), 3500);
  }

  function togglePlay() {
    const v = videoRef.current; if (!v) return;
    v.paused ? v.play() : v.pause();
  }

  function toggleMute() {
    const v = videoRef.current; if (!v) return;
    v.muted = !v.muted; setMuted(v.muted);
  }

  function setVol(val) {
    const v = videoRef.current; if (!v) return;
    v.volume = val; v.muted = val === 0;
    setVolume(val); setMuted(val === 0);
  }

  function toggleFS() {
    const el = wrapRef.current; if (!el) return;
    document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen();
  }

  function seek(e) {
    const v = videoRef.current; if (!v?.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - r.left) / r.width) * v.duration;
  }

  function skip(s) {
    const v = videoRef.current; if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + s));
  }

  function goEp(e, s = selectedSeason) {
    navigate(`/watch/${activeSubjectId}?detail_path=${encodeURIComponent(activeDetailPath)}&season=${s}&ep=${e}`);
  }

  const seasons = detail?.resource?.seasons || [];
  const curSeas = seasons.find(s => s.se === selectedSeason);
  const epCount = curSeas?.maxEp || 0;
  const title   = detail?.subject?.title || 'Now Playing';
  const hasPrev = ep > 1;
  const hasNext = ep < epCount;

  // Current dub label
  const dubLabel = selectedDub?.lanName || 'Audio';

  return (
    <div className="min-h-screen bg-black flex flex-col" style={{ paddingTop: 64 }}>

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-dark-900 border-b border-dark-700 shrink-0">
        <button onClick={() => navigate(-1)} className="text-gray-300 hover:text-white shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-sm truncate flex-1 min-w-0">
          <span className="font-semibold text-white">{title}</span>
          {seasons.length > 0 && <span className="text-gray-500 ml-2">· S{season} E{ep}</span>}
        </div>

        {/* Dub switcher pill */}
        {dubs.length > 1 && (
          <div className="relative shrink-0">
            <button
              onClick={() => setShowDubPicker(p => !p)}
              className="flex items-center gap-1.5 bg-dark-700 hover:bg-dark-600 border border-dark-500 text-gray-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Languages className="w-3.5 h-3.5" />
              {dubLabel}
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            {showDubPicker && (
              <div className="absolute right-0 top-full mt-1 bg-dark-800 border border-dark-600 rounded-xl overflow-hidden z-30 min-w-[130px] shadow-xl">
                {dubs.map(dub => (
                  <button
                    key={dub.subjectId}
                    onClick={() => switchDub(dub)}
                    className={`w-full text-left px-3 py-2.5 text-xs font-medium transition-colors ${
                      selectedDub?.subjectId === dub.subjectId
                        ? 'bg-brand-500 text-white'
                        : 'text-gray-300 hover:bg-dark-600 hover:text-white'
                    }`}
                  >
                    {dub.lanName}
                    {dub.original && <span className="ml-1 text-gray-500">(Original)</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {hasPrev && (
          <button onClick={() => goEp(ep - 1)} className="text-gray-400 hover:text-white text-xs flex items-center gap-1 shrink-0">
            <SkipBack className="w-4 h-4" /> Prev
          </button>
        )}
        {hasNext && (
          <button onClick={() => goEp(ep + 1)} className="text-brand-400 hover:text-brand-300 text-xs flex items-center gap-1 shrink-0">
            Next <SkipForward className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Player */}
      <div
        ref={wrapRef}
        className="relative w-full bg-black select-none"
        style={{ aspectRatio: '16/9', maxHeight: 'calc(100vh - 140px)' }}
        onMouseMove={showCtrlsTemp}
        onTouchStart={showCtrlsTemp}
        onClick={(e) => {
          if (e.target === wrapRef.current || e.target === videoRef.current) togglePlay();
          setShowDubPicker(false);
          setShowSettings(false);
        }}
      >
        {/* Embed iframe fallback */}
        {streamInfo?.type === 'embed' ? (
          <iframe
            src={streamInfo.url}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen"
          />
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full"
            playsInline
            crossOrigin="anonymous"
            onPlay={()        => setPlaying(true)}
            onPause={()       => setPlaying(false)}
            onWaiting={()     => setBuffering(true)}
            onPlaying={()     => setBuffering(false)}
            onCanPlay={()     => setBuffering(false)}
            onTimeUpdate={(e) => {
              const v = e.target;
              setCurrentTime(v.currentTime);
              setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
            }}
            onLoadedMetadata={(e) => setDuration(e.target.duration)}
            onError={() => setError('Video failed to load. Stream may have expired.')}
          >
            {captions.map((cap, i) => (
              <track
                key={i}
                kind="subtitles"
                src={cap.url}
                srcLang={cap.language || cap.lang || 'en'}
                label={cap.label || cap.language || `Sub ${i + 1}`}
                default={i === 0}
              />
            ))}
          </video>
        )}

        {/* Buffering */}
        {buffering && !loading && streamInfo?.type !== 'embed' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full border-4 border-dark-600 border-t-brand-500 animate-spin" />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full border-4 border-dark-600 border-t-brand-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Loading stream…</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/95 px-6">
            <div className="text-center max-w-xs">
              <AlertTriangle className="w-12 h-12 text-brand-500 mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">Stream Unavailable</h3>
              <p className="text-gray-400 text-sm mb-2 leading-relaxed">{error}</p>
              <p className="text-gray-600 text-xs mb-6">
                Try switching to a different audio/dub version above.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={(e) => { e.stopPropagation(); load(); }}
                  className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Retry
                </button>
                {dubs.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDubPicker(true); }}
                    className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 border border-dark-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Languages className="w-4 h-4" /> Switch Audio
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                  className="text-gray-400 hover:text-white px-4 py-2.5 text-sm transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls overlay — hidden for embed */}
        {!loading && !error && streamInfo?.type !== 'embed' && (
          <div className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${showCtrls || !playing ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-gradient-to-t from-black/90 via-black/20 to-transparent px-4 pb-4 pt-16">

              {/* Seekbar */}
              <div className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group" onClick={seek}>
                <div className="h-full bg-brand-500 rounded-full relative" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Buttons row */}
              <div className="flex items-center gap-3">
                <button onClick={() => skip(-10)} className="text-white/80 hover:text-white" aria-label="-10s">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.5 3a9 9 0 1 0 6.363 2.637L17.5 7H22V2.5l-2.226 2.226A10.95 10.95 0 0 0 12.5 2C6.701 2 2 6.701 2 12.5S6.701 23 12.5 23 23 18.299 23 12.5h-2c0 4.687-3.813 8.5-8.5 8.5S3 17.187 3 12.5 6.813 4 11.5 4c2.353 0 4.468.953 6.01 2.49z"/>
                    <text x="12" y="15" textAnchor="middle" fontSize="5.5" fill="currentColor" fontWeight="bold">10</text>
                  </svg>
                </button>

                <button onClick={togglePlay} className="text-white hover:text-brand-400" aria-label="Play/Pause">
                  {playing ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white" />}
                </button>

                <button onClick={() => skip(10)} className="text-white/80 hover:text-white" aria-label="+10s">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.5 3a9 9 0 1 1-6.363 2.637L6.5 7H2V2.5l2.226 2.226A10.95 10.95 0 0 1 11.5 2C17.299 2 22 6.701 22 12.5S17.299 23 11.5 23 1 18.299 1 12.5h2c0 4.687 3.813 8.5 8.5 8.5S20 17.187 20 12.5 16.187 4 11.5 4z"/>
                    <text x="12" y="15" textAnchor="middle" fontSize="5.5" fill="currentColor" fontWeight="bold">10</text>
                  </svg>
                </button>

                <div className="flex items-center gap-1.5 group/vol">
                  <button onClick={toggleMute} className="text-white hover:text-brand-400">
                    {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range" min="0" max="1" step="0.05"
                    value={muted ? 0 : volume}
                    onChange={(e) => setVol(parseFloat(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    className="w-0 group-hover/vol:w-16 transition-all duration-200 accent-brand-500 cursor-pointer h-1"
                  />
                </div>

                <span className="text-xs text-gray-300 font-mono flex-1 select-none">
                  {fmt(currentTime)} / {fmt(duration)}
                </span>

                {captions.length > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowSubs(p => !p); }}
                    className={`transition-colors ${showSubs ? 'text-brand-400' : 'text-white/70 hover:text-white'}`}
                    aria-label="Subtitles"
                  >
                    <Subtitles className="w-5 h-5" />
                  </button>
                )}

                {qualities.length > 1 && (
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setShowSettings(p => !p)} className="text-white/70 hover:text-white">
                      <Settings className="w-4 h-4" />
                    </button>
                    {showSettings && (
                      <div className="absolute bottom-full right-0 mb-2 glass rounded-xl overflow-hidden min-w-[90px] z-10">
                        {qualities.map(q => (
                          <button
                            key={q.index}
                            onClick={() => { setSelQuality(q.index); setShowSettings(false); }}
                            className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                              selQuality === q.index ? 'bg-brand-500 text-white' : 'text-gray-300 hover:bg-dark-600 hover:text-white'
                            }`}
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button onClick={(e) => { e.stopPropagation(); toggleFS(); }} className="text-white hover:text-brand-400">
                  {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Episode grid */}
      {seasons.length > 0 && (
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">Episodes</h2>
            {seasons.length > 1 && (
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(e) => {
                    const s = Number(e.target.value);
                    setSelectedSeason(s);
                    goEp(1, s);
                  }}
                  className="appearance-none bg-dark-700 border border-dark-600 text-white text-sm rounded-xl px-4 py-2 pr-8 outline-none focus:border-brand-500 cursor-pointer"
                >
                  {seasons.map(s => <option key={s.se} value={s.se}>Season {s.se}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-12 gap-2">
            {Array.from({ length: epCount }).map((_, i) => {
              const e = i + 1;
              const active = e === ep && selectedSeason === season;
              return (
                <button
                  key={e}
                  onClick={() => goEp(e)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                    active
                      ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/25'
                      : 'bg-dark-800 border-dark-600 text-gray-400 hover:bg-dark-600 hover:text-white'
                  }`}
                >
                  {e}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
