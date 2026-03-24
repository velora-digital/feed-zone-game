import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { queueMove } from '@/logic/playerLogic';
import { pauseBackgroundMusic, resumeBackgroundMusic } from '@/sound/playBackgroundMusic';
import { initSwipeDetector } from '@/logic/swipeDetector';
import { UI_CONFIG, TOTAL_SECTIONS } from '@/utils/constants';
import { useMapStore } from '@/store/mapStore';
import { playerState } from '@/logic/playerLogic';
import { getActiveSectionId, isSectionCompleteState } from '@/logic/feedWindowTracker';


const UCI_NOTICES = [
  'UCI introduces emergency wheel-depth cap after roadside collision',
  'Safety panel opens inquiry into musette aerodynamics',
  "Following today's incident, commissaires will now monitor bidon handovers more closely",
  'Race convoy unchanged; helmet visor guidance expected next month',
  'In response to safety concerns, riders may now wear slightly thicker gloves',
  'Team cars remain essential, says governing body after soigneur flattened',
  'Feed zone review launched; sock-height crackdown unaffected',
  'Stakeholders agree road safety is complex, wheel rules simpler',
  'New policy limits deep-section rims during active car impacts',
  'Governing body vows action on bottle littering after convoy incident',
];

function useRandomNotice() {
  return useMemo(
    () => UCI_NOTICES[Math.floor(Math.random() * UCI_NOTICES.length)],
    []
  );
}

export function Score() {
  const score = useGameStore(state => state.score);
  const feedPoints = useGameStore(state => state.feedPoints);
  const nearMissPoints = useGameStore(state => state.nearMissPoints);
  return <div id="score">{feedPoints + score + nearMissPoints}</div>;
}

export function ClusterFeedCounter() {
  const rows = useMapStore(state => state.rows);
  const score = useGameStore(state => state.score);
  const status = useGameStore(state => state.status);
  const [showClear, setShowClear] = useState(false);
  const [sectionsCompleted, setSectionsCompleted] = useState(0);
  const prevSectionRef = useRef<number | null>(null);
  const completedSectionsRef = useRef(new Set<number>());

  // Find active section from the tracker
  const activeSectionId = getActiveSectionId();

  // Count feeds in the active section
  let totalFeeds = 0;
  let fedCount = 0;
  let expiredCount = 0;

  if (activeSectionId !== null) {
    for (const row of rows) {
      if (row && row.type === 'road' && row.sectionId === activeSectionId) {
        for (const entity of row.entities) {
          if (entity.potentialFeed || entity.needsFeed || entity.fed || entity.feedExpired) {
            totalFeeds++;
            if (entity.fed) fedCount++;
            if (entity.feedExpired) expiredCount++;
          }
        }
      }
    }
  }

  const allDone = totalFeeds > 0 && (fedCount + expiredCount) === totalFeeds;
  const sectionsToGo = TOTAL_SECTIONS - sectionsCompleted;

  // Detect section completion
  useEffect(() => {
    if (activeSectionId !== null && activeSectionId !== prevSectionRef.current) {
      prevSectionRef.current = activeSectionId;
    }
    if (allDone && activeSectionId !== null && !completedSectionsRef.current.has(activeSectionId)) {
      completedSectionsRef.current.add(activeSectionId);
      setSectionsCompleted(completedSectionsRef.current.size);
      setShowClear(true);
      setTimeout(() => setShowClear(false), 1500);
    }
  }, [fedCount, expiredCount, totalFeeds, activeSectionId, allDone]);

  // Reset on new game
  useEffect(() => {
    if (status === 'idle' || status === 'running') {
      if (sectionsCompleted > 0 && activeSectionId === null) {
        completedSectionsRef.current.clear();
        setSectionsCompleted(0);
        prevSectionRef.current = null;
      }
    }
  }, [status]);

  // Check for win
  const isWin = sectionsCompleted >= TOTAL_SECTIONS;
  useEffect(() => {
    if (isWin && status === 'running') {
      // Trigger win via endGame
      setTimeout(() => {
        useGameStore.getState().endGame();
      }, 2000);
    }
  }, [isWin, status]);

  return (
    <>
      {/* Sections to go — prominent top-right */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '1em',
        color: '#ffd700',
        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
        zIndex: 10,
        textAlign: 'right',
      }}>
        <div>{sectionsToGo} to go</div>
      </div>

      {/* Feed counter — very big and center */}
      {activeSectionId !== null && totalFeeds > 0 && !allDone && (
        <div style={{
          position: 'absolute',
          top: 15,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '2em',
          color: '#ffffff',
          textShadow: '3px 3px 8px rgba(0,0,0,0.8)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontSize: '1.2em' }}>🚴</span>
          <span>{fedCount}</span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span>
          <span>{totalFeeds}</span>
        </div>
      )}

      {/* NO BOTTLES flash */}
      {showNoBottle && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '1.2em',
          color: '#ff4444',
          textShadow: '3px 3px 8px rgba(0,0,0,0.8)',
          zIndex: 20,
          pointerEvents: 'none',
          textAlign: 'center',
          lineHeight: 1.8,
        }}>
          <div>NO BOTTLES!</div>
          <div style={{ fontSize: '0.6em', color: '#ffaa00' }}>Pick up bottles first</div>
        </div>
      )}

      {/* MISSED flash */}
      {showMissed && (
        <div style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '1.5em',
          color: '#ff4444',
          textShadow: '3px 3px 8px rgba(0,0,0,0.8)',
          zIndex: 20,
          pointerEvents: 'none',
        }}>
          MISSED!
        </div>
      )}

      {/* SECTION COMPLETE with star rating */}
      {showClear && (
        <div style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '1.2em',
          color: clearMessage.includes('PERFECT') ? '#ffd700' : '#ffffff',
          textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
          zIndex: 20,
          pointerEvents: 'none',
          textAlign: 'center',
          lineHeight: 1.8,
        }}>
          <div style={{ fontSize: '1.5em' }}>{clearMessage.split(' ')[0]}</div>
          <div>{clearMessage.split(' ').slice(1).join(' ')}</div>
        </div>
      )}

      {/* WIN screen */}
      {isWin && status === 'over' && (
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '1.5em',
          color: '#ffd700',
          textShadow: '3px 3px 8px rgba(0,0,0,0.8)',
          zIndex: 25,
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          🏆 RACE COMPLETE! 🏆
        </div>
      )}
    </>
  );
}

export function StreakDisplay() {
  const feedStreak = useGameStore((s) => s.feedStreak);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (feedStreak > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [feedStreak]);

  if (feedStreak < 2) return null;

  const multiplier = feedStreak >= 2 ? (1.0 + (feedStreak - 1) * 0.1).toFixed(1) : '1.0';

  return (
    <div style={{
      position: 'absolute',
      top: 60,
      left: 20,
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '0.6em',
      color: '#ffffff',
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
      zIndex: 10,
      transform: `scale(${animate ? 1.15 : 1})`,
      transition: 'transform 0.3s ease-out',
    }}>
      <div style={{ color: feedStreak >= 5 ? '#ff4444' : feedStreak >= 3 ? '#ffaa00' : '#00e676' }}>
        STREAK {feedStreak}
      </div>
      <div style={{ color: '#ffd700', marginTop: 4 }}>
        ×{multiplier}
      </div>
    </div>
  );
}

function BidonIcon({ size = 20 }: { size?: number }) {
  const height = size * 1.4;
  return (
    <svg width={size} height={height} viewBox="0 0 20 28" style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 1px' }}>
      {/* Cap / nozzle */}
      <rect x="7" y="0" width="6" height="5" rx="1" fill="#ffffff" />
      {/* Bottle body — white to match in-game */}
      <rect x="4" y="5" width="12" height="20" rx="3" fill="#f0f0f0" />
      {/* Blue label band */}
      <rect x="4" y="14" width="12" height="4" fill="#29b6f6" />
    </svg>
  );
}

export function FeedScore() {
  const feedCount = useGameStore(state => state.feedCount);
  if (feedCount === 0) return null;

  const MAX_BIDON_DISPLAY = 10;
  const shown = Math.min(feedCount, MAX_BIDON_DISPLAY);

  return (
    <div id="feed-score" style={{
      position: 'absolute',
      top: 60,
      left: 20,
      fontSize: '1.5em',
      color: '#00e676',
      zIndex: 10,
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
    }}>
      {Array.from({ length: shown }, (_, i) => <BidonIcon key={i} />)}
      {feedCount > MAX_BIDON_DISPLAY && (
        <span style={{ fontSize: '0.6em', marginLeft: 4 }}>+{feedCount - MAX_BIDON_DISPLAY}</span>
      )}
    </div>
  );
}

/**
 * Unified game HUD — bottles, feed counter, streak, sections to go
 */
export function GameHUD() {
  const rows = useMapStore(state => state.rows);
  const score = useGameStore(state => state.score);
  const status = useGameStore(state => state.status);
  const musetteCount = useGameStore(state => state.musetteCount);
  const feedStreak = useGameStore(state => state.feedStreak);
  const noBottleAttempt = useGameStore(state => state.noBottleAttempt);
  const [showNoBottle, setShowNoBottle] = useState(false);
  const [showMoveOn, setShowMoveOn] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [clearMessage, setClearMessage] = useState('');
  const [showMissed, setShowMissed] = useState(false);
  const [sectionsCompleted, setSectionsCompleted] = useState(0);
  const [streakAnimate, setStreakAnimate] = useState(false);
  const prevSectionRef = useRef<number | null>(null);
  const prevExpiredRef = useRef(0);
  const completedSectionsRef = useRef(new Set<number>());

  const activeSectionId = getActiveSectionId();

  // Count feeds in active section
  let totalFeeds = 0;
  let fedCount = 0;
  let expiredCount = 0;
  if (activeSectionId !== null) {
    for (const row of rows) {
      if (row && row.type === 'road' && row.sectionId === activeSectionId) {
        for (const entity of row.entities) {
          if (entity.potentialFeed || entity.needsFeed || entity.fed || entity.feedExpired) {
            totalFeeds++;
            if (entity.fed) fedCount++;
            if (entity.feedExpired) expiredCount++;
          }
        }
      }
    }
  }

  const allDone = totalFeeds > 0 && (fedCount + expiredCount) === totalFeeds;
  const sectionsToGo = TOTAL_SECTIONS - sectionsCompleted;
  const multiplier = feedStreak >= 2 ? (1.0 + (feedStreak - 1) * 0.1).toFixed(1) : '1.0';

  // No bottle attempt flash
  useEffect(() => {
    if (noBottleAttempt > 0) {
      setShowNoBottle(true);
      const timer = setTimeout(() => setShowNoBottle(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [noBottleAttempt]);

  // Detect missed feed
  useEffect(() => {
    if (expiredCount > prevExpiredRef.current && expiredCount > 0) {
      setShowMissed(true);
      setTimeout(() => setShowMissed(false), 1200);
    }
    prevExpiredRef.current = expiredCount;
  }, [expiredCount]);

  // Section completion detection with star rating
  useEffect(() => {
    if (activeSectionId !== null && activeSectionId !== prevSectionRef.current) {
      prevSectionRef.current = activeSectionId;
      prevExpiredRef.current = 0;
      setShowMoveOn(false);
    }
    if (allDone && activeSectionId !== null && !completedSectionsRef.current.has(activeSectionId)) {
      completedSectionsRef.current.add(activeSectionId);
      setSectionsCompleted(completedSectionsRef.current.size);
      const stars = fedCount === 3 ? '★★★' : fedCount === 2 ? '★★☆' : fedCount === 1 ? '★☆☆' : '☆☆☆';
      const label = fedCount === 3 ? 'PERFECT!' : `${fedCount}/3 FED`;
      setClearMessage(`${stars} ${label}`);
      setShowClear(true);
      setShowMoveOn(true);
      setTimeout(() => setShowClear(false), 3000);
    }
  }, [fedCount, expiredCount, totalFeeds, activeSectionId, allDone]);

  // Reset on new game
  useEffect(() => {
    if (status === 'idle' || status === 'running') {
      if (sectionsCompleted > 0 && activeSectionId === null) {
        completedSectionsRef.current.clear();
        setSectionsCompleted(0);
        prevSectionRef.current = null;
      }
    }
  }, [status]);

  // Streak animation
  useEffect(() => {
    if (feedStreak > 0) {
      setStreakAnimate(true);
      const timer = setTimeout(() => setStreakAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [feedStreak]);

  // Win detection
  const isWin = sectionsCompleted >= TOTAL_SECTIONS;
  useEffect(() => {
    if (isWin && status === 'running') {
      setTimeout(() => useGameStore.getState().endGame(), 2000);
    }
  }, [isWin, status]);

  return (
    <>
      {/* === TOP CENTER: Bottles | Feed counter | Streak === */}
      <div className="game-hud" style={{
        position: 'absolute',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: '"Press Start 2P", monospace',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 40,
      }}>
        {/* Bottles inventory */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: musetteCount === 0 ? '#ff4444' : '#29b6f6',
          fontSize: '1.8em',
          textShadow: '2px 2px 6px rgba(0,0,0,0.7)',
        }}>
          <BidonIcon size={28} />
          <span>{musetteCount}</span>
        </div>

        {/* Feed dots — ● = fed, ✗ = missed, ○ = pending */}
        {activeSectionId !== null && totalFeeds > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: '2em',
              textShadow: '3px 3px 8px rgba(0,0,0,0.8)',
            }}>
              <span style={{ fontSize: '0.8em', marginRight: 4 }}>🚴</span>
              {Array.from({ length: totalFeeds }, (_, i) => {
                if (i < fedCount) {
                  return <span key={i} style={{ color: '#00e676' }}>●</span>;
                } else if (i < fedCount + expiredCount) {
                  return <span key={i} style={{ color: '#ff4444' }}>✗</span>;
                } else {
                  return <span key={i} style={{ color: 'rgba(255,255,255,0.3)' }}>○</span>;
                }
              })}
            </div>
            {allDone && null}
          </div>
        )}

        {/* Streak + multiplier — same row, only shows at 2+ */}
        {feedStreak >= 2 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '1.2em',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            transform: `scale(${streakAnimate ? 1.15 : 1})`,
            transition: 'transform 0.3s ease-out',
          }}>
            <span style={{ color: feedStreak >= 5 ? '#ff4444' : feedStreak >= 3 ? '#ffaa00' : '#00e676' }}>
              STREAK {feedStreak}
            </span>
            <span style={{ color: '#ffd700' }}>×{multiplier}</span>
          </div>
        )}
      </div>

      {/* === TOP RIGHT: Sections to go === */}
      <div className="sections-to-go" style={{
        position: 'absolute',
        top: 15,
        right: 20,
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '1.5em',
        color: '#ffd700',
        textShadow: '2px 2px 6px rgba(0,0,0,0.7)',
        zIndex: 10,
      }}>
        {sectionsToGo} to go
      </div>

      {/* First section hints */}
      {sectionsCompleted === 0 && activeSectionId === 1 && (
        <div style={{
          position: 'absolute',
          top: '80%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '1em',
          color: '#ffaa00',
          textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
          zIndex: 15,
          textAlign: 'center',
          lineHeight: 2,
          pointerEvents: 'none',
        }}>
          {musetteCount === 0 && fedCount === 0 && !allDone && '⬆ Pick up the white bottles! ⬆'}
          {musetteCount > 0 && fedCount === 0 && !allDone && '⬆ Walk into the ◆ cyclist to feed them!'}
          {fedCount > 0 && !allDone && `Nice! ${3 - fedCount} more to go!`}
        </div>
      )}

      {/* NO BOTTLES warning */}
      {musetteCount === 0 && activeSectionId !== null && !allDone && sectionsCompleted > 0 && (
        <div style={{
          position: 'absolute',
          top: 55,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '0.8em',
          color: '#ff4444',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          zIndex: 15,
          animation: 'fadeInOut 2s ease-in-out infinite',
        }}>
          GRAB BOTTLES!
        </div>
      )}

      {/* Persistent MOVE ON when section done */}
      {showMoveOn && (
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '1.3em',
          color: '#ffd700',
          textShadow: '3px 3px 8px rgba(0,0,0,0.8)',
          zIndex: 15,
          pointerEvents: 'none',
          textAlign: 'center',
        }}>
          ⬆ MOVE ON ⬆
        </div>
      )}

      {/* NO BOTTLES flash */}
      {showNoBottle && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '1.2em',
          color: '#ff4444',
          textShadow: '3px 3px 8px rgba(0,0,0,0.8)',
          zIndex: 20,
          pointerEvents: 'none',
          textAlign: 'center',
          lineHeight: 1.8,
        }}>
          <div>NO BOTTLES!</div>
          <div style={{ fontSize: '0.6em', color: '#ffaa00' }}>Pick up bottles first</div>
        </div>
      )}

      {/* MISSED flash */}
      {showMissed && (
        <div style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '1.5em',
          color: '#ff4444',
          textShadow: '3px 3px 8px rgba(0,0,0,0.8)',
          zIndex: 20,
          pointerEvents: 'none',
        }}>
          MISSED!
        </div>
      )}

      {/* SECTION COMPLETE with star rating */}
      {showClear && (
        <div style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '1.2em',
          color: clearMessage.includes('PERFECT') ? '#ffd700' : '#ffffff',
          textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
          zIndex: 20,
          pointerEvents: 'none',
          textAlign: 'center',
          lineHeight: 1.8,
        }}>
          <div style={{ fontSize: '1.5em' }}>{clearMessage.split(' ')[0]}</div>
          <div>{clearMessage.split(' ').slice(1).join(' ')}</div>
        </div>
      )}

      {/* WIN screen */}
      {isWin && status === 'over' && (
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '1.5em',
          color: '#ffd700',
          textShadow: '3px 3px 8px rgba(0,0,0,0.8)',
          zIndex: 25,
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          🏆 RACE COMPLETE! 🏆
        </div>
      )}
    </>
  );
}

export function Controls() {
  useEventListeners();
  return (
    <div id="controls">
      <div>
        <button onClick={() => queueMove('forward')}>&#9650;</button>
        <button onClick={() => queueMove('left')}>&#9664;</button>
        <button onClick={() => queueMove('backward')}>&#9660;</button>
        <button onClick={() => queueMove('right')}>&#9654;</button>
      </div>
    </div>
  );
}

export function MusicToggle() {
  const [muted, setMuted] = useState(false);

  const toggle = () => {
    if (muted) {
      resumeBackgroundMusic();
    } else {
      pauseBackgroundMusic();
    }
    setMuted(!muted);
  };

  return (
    <button
      onClick={toggle}
      id="music-toggle"
      aria-label={muted ? 'Unmute music' : 'Mute music'}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M3 9v6h4l5 5V4L7 9H3z" />
        {muted ? (
          <path d="M16.5 12l4.5-4.5-1.4-1.4L15 10.6l-4.5-4.5-1.4 1.4L13.6 12l-4.5 4.5 1.4 1.4L15 13.4l4.5 4.5 1.4-1.4L16.5 12z" />
        ) : (
          <>
            <path d="M14 3.2v2.1c2.9.9 5 3.5 5 6.7s-2.1 5.8-5 6.7v2.1c4-.9 7-4.5 7-8.8s-3-7.9-7-8.8z" />
            <path d="M14 7.9v8.2c1.5-.7 2.5-2.2 2.5-4.1s-1-3.4-2.5-4.1z" />
          </>
        )}
      </svg>
    </button>
  );
}

export function StartScreen() {
  const status = useGameStore(state => state.status);

  useEffect(() => {
    if (status !== 'idle') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') useGameStore.getState().startGame();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  if (status !== 'idle') return null;

  const labelStyle = { fontFamily: "'Press Start 2P', monospace" };
  const pb = useGameStore.getState().personalBest;

  return (
    <div id="result-container">
      <div id="result" style={{
        background: 'linear-gradient(180deg, #1a237e 0%, #0d1b4a 100%)',
        border: '3px solid #c6a84b',
        textAlign: 'center',
        padding: '1.5em 2em',
        maxWidth: 680,
        width: '90vw',
      }}>
        <h1 style={{ ...labelStyle, fontSize: '2em', color: '#c6a84b', marginBottom: '0.5em', textShadow: '2px 2px 0 #000' }}>
          FEED ZONE
        </h1>

        {/* How to play — visual steps */}
        <div style={{ margin: '1em 0', textAlign: 'left', padding: '0 0.5em' }}>
          <div style={{ ...labelStyle, fontSize: '0.7em', color: '#ffffff', marginBottom: '1.2em', display: 'flex', alignItems: 'center', gap: 12 }}>
            <BidonIcon size={28} />
            <span>Pick up <span style={{ color: '#29b6f6' }}>bottles</span> from the roadside</span>
          </div>
          <div style={{ ...labelStyle, fontSize: '0.7em', color: '#ffffff', marginBottom: '1.2em', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#ffaa00', fontSize: '1.6em' }}>◆</span>
            <span>Feed <span style={{ color: '#ffaa00' }}>hungry cyclists</span> (look for the ◆ marker)</span>
          </div>
          <div style={{ ...labelStyle, fontSize: '0.7em', color: '#ffffff', marginBottom: '1.2em', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.6em' }}>⚠️</span>
            <span>You need a bottle to feed — <span style={{ color: '#ff4444' }}>no bottle = can't feed!</span></span>
          </div>
          <div style={{ ...labelStyle, fontSize: '0.7em', color: '#ffffff', marginBottom: '1.2em', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.6em' }}>🚗</span>
            <span>Don't get hit by traffic — <span style={{ color: '#ff4444' }}>one hit = game over!</span></span>
          </div>
          <div style={{ ...labelStyle, fontSize: '0.7em', color: '#ffffff', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.6em' }}>🏁</span>
            <span><span style={{ color: '#ffd700' }}>3 riders per road</span> · 20 roads to complete</span>
          </div>
        </div>

        <p style={{ ...labelStyle, fontSize: '0.45em', color: '#aab4d6', margin: '1em 0', lineHeight: 1.6 }}>
          Arrow keys or swipe to move
        </p>

        {pb > 0 && (
          <p style={{ ...labelStyle, fontSize: '0.6em', color: '#c6a84b', marginBottom: '0.5em' }}>
            Personal Best: {pb}
          </p>
        )}

        <button
          onClick={() => useGameStore.getState().startGame()}
          style={{ ...labelStyle, fontSize: '1em', padding: '0.8em 1.5em', background: '#c6a84b', color: '#0d1b4a', border: 'none', cursor: 'pointer' }}
        >
          START
        </button>
      </div>
    </div>
  );
}

export function Result() {
  const status = useGameStore(state => state.status);
  const score = useGameStore(state => state.score);
  const feedPoints = useGameStore(state => state.feedPoints);
  const bestStreak = useGameStore(state => state.bestStreak);
  const nearMissCount = useGameStore(state => state.nearMissCount);
  const nearMissPoints = useGameStore(state => state.nearMissPoints);
  const personalBest = useGameStore(state => state.personalBest);
  const isNewRecord = useGameStore(state => state.isNewRecord);
  const reset = useGameStore(state => state.reset);
  const userData = useUserStore(state => state.userData);
  const setUserName = useUserStore(state => state.setUserName);

  const [nameInput, setNameInput] = useState('');
  const [showNameForm, setShowNameForm] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (status === 'running') {
      setShowNameForm(false);
      setNameInput('');
    }
    if (status === 'over') {
      setNotice(UCI_NOTICES[Math.floor(Math.random() * UCI_NOTICES.length)]);
    }
  }, [status]);

  const totalScore = feedPoints + score + nearMissPoints;

  if (status !== 'over') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim();
    setUserName(name);
    setShowNameForm(false);
    reset();
    useGameStore.getState().startGame();
  };

  const handleRetry = () => {
    if (userData) {
      reset();
      useGameStore.getState().startGame();
    } else {
      setShowNameForm(true);
    }
  };

  return (
    <div id="result-container">
      {showNameForm ? (
        <div id="result">
          <div className="uci-header">UCI COMMUNIQUE</div>
          <p className="uci-notice">{notice}</p>
          <div className="score-breakdown">
            <p className="result-score">Distance: {score}</p>
            {feedPoints > 0 && (
              <p className="result-score" style={{ color: '#00e676' }}>
                Feed Points: {feedPoints}
              </p>
            )}
            {bestStreak > 0 && (
              <p className="result-score" style={{ color: '#ffaa00' }}>
                Best Streak: ×{bestStreak}
              </p>
            )}
            {nearMissCount > 0 && (
              <p className="result-score" style={{ color: '#00e676' }}>
                Near Misses: {nearMissCount} (+{nearMissPoints})
              </p>
            )}
            <p className="result-score total-score">Total: {totalScore}</p>
            {isNewRecord && (
              <p style={{ color: '#ffd700', fontSize: '0.7em', marginTop: 8, animation: 'fadeInOut 2.5s ease-in-out infinite' }}>
                NEW RECORD!
              </p>
            )}
            {!isNewRecord && personalBest > 0 && (
              <p style={{ color: '#888', fontSize: '0.5em', marginTop: 4 }}>
                Personal Best: {personalBest}
              </p>
            )}
          </div>
          <form onSubmit={handleSubmit} id="name-form">
            <label htmlFor="player-name">Soigneur name:</label>
            <input
              id="player-name"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your name"
              autoFocus
              maxLength={20}
            />
            <button type="submit">Roll Out!</button>
          </form>
        </div>
      ) : (
        <div id="result">
          <div className="uci-header">UCI COMMUNIQUE</div>
          <p className="uci-notice">{notice}</p>
          {userData && <p className="player-name">Soigneur: {userData.name}</p>}
          <div className="score-breakdown">
            <p className="result-score">Distance: {score}</p>
            {feedPoints > 0 && (
              <p className="result-score" style={{ color: '#00e676' }}>
                Feed Points: {feedPoints}
              </p>
            )}
            {bestStreak > 0 && (
              <p className="result-score" style={{ color: '#ffaa00' }}>
                Best Streak: ×{bestStreak}
              </p>
            )}
            {nearMissCount > 0 && (
              <p className="result-score" style={{ color: '#00e676' }}>
                Near Misses: {nearMissCount} (+{nearMissPoints})
              </p>
            )}
            <p className="result-score total-score">Total: {totalScore}</p>
            {isNewRecord && (
              <p style={{ color: '#ffd700', fontSize: '0.7em', marginTop: 8, animation: 'fadeInOut 2.5s ease-in-out infinite' }}>
                NEW RECORD!
              </p>
            )}
            {!isNewRecord && personalBest > 0 && (
              <p style={{ color: '#888', fontSize: '0.5em', marginTop: 4 }}>
                Personal Best: {personalBest}
              </p>
            )}
          </div>
          <button onClick={handleRetry}>Go Again</button>
        </div>
      )}
    </div>
  );
}

export function MusetteScore() {
  const musetteCount = useGameStore(state => state.musetteCount);
  const { MAX_MUSETTE_DISPLAY, MUSETTE_SCORE_STYLE } = UI_CONFIG;

  const maxDisplay = MAX_MUSETTE_DISPLAY;
  const shown = Math.min(musetteCount, maxDisplay);

  return (
    <div id="musette-score" style={MUSETTE_SCORE_STYLE}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px' }}>
        {Array.from({ length: shown }, (_, i) => (
          <BidonIcon key={i} size={16} />
        ))}
        {musetteCount > maxDisplay && (
          <span style={{ fontSize: '0.7em', marginLeft: 4 }}>+{musetteCount - maxDisplay}</span>
        )}
      </span>
    </div>
  );
}

export function NearMissFlash() {
  const nearMissCount = useGameStore((s) => s.nearMissCount);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (nearMissCount > 0) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 800);
      return () => clearTimeout(timer);
    }
  }, [nearMissCount]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '55%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '0.8em',
      color: '#00e676',
      textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
      zIndex: 15,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s ease-out',
      pointerEvents: 'none',
    }}>
      NEAR MISS! +25
    </div>
  );
}

const STAGE_LABELS: Record<string, string> = {
  parcours: 'THE PARCOURS',
  feedzone: 'THE FEED ZONE',
  flammeRouge: 'LA FLAMME ROUGE',
  sprint: 'THE SPRINT',
};

const STAGE_KM: Record<string, string> = {
  parcours: '180km',
  feedzone: '120km',
  flammeRouge: '1km',
  sprint: 'SPRINT',
};

function getStage(score: number): string {
  if (score < 10) return 'parcours';
  if (score < 40) return 'feedzone';
  if (score < 70) return 'flammeRouge';
  return 'sprint';
}

export function StageIndicator() {
  const score = useGameStore((s) => s.score);
  const feedPoints = useGameStore((s) => s.feedPoints);
  const [banner, setBanner] = useState<string | null>(null);
  const prevStageRef = useRef<string>('parcours');

  const currentStage = getStage(score);

  useEffect(() => {
    if (currentStage !== prevStageRef.current) {
      prevStageRef.current = currentStage;
      setBanner(STAGE_LABELS[currentStage]);

      // Award stage bonus
      const bonuses: Record<string, number> = { feedzone: 500, flammeRouge: 1000, sprint: 2000 };
      const bonus = bonuses[currentStage];
      if (bonus) {
        useGameStore.setState(state => ({ feedPoints: state.feedPoints + bonus }));
      }

      setTimeout(() => setBanner(null), 2500);
    }
  }, [currentStage]);

  return (
    <>
      {/* Persistent stage indicator */}
      <div style={{
        position: 'absolute',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '0.45em',
        color: 'rgba(255, 215, 0, 0.7)',
        zIndex: 5,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}>
        {STAGE_LABELS[currentStage]} | {STAGE_KM[currentStage]}
      </div>

      {/* Flash banner on stage transition */}
      {banner && (
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '1.2em',
          color: '#ffd700',
          backgroundColor: 'rgba(26, 35, 126, 0.9)',
          padding: '12px 24px',
          border: '2px solid #ffd700',
          zIndex: 20,
          textAlign: 'center' as const,
          animation: 'fadeInOut 2.5s ease-in-out',
        }}>
          {banner}
          {currentStage !== 'parcours' && (
            <div style={{ fontSize: '0.5em', marginTop: 8, color: '#00e676' }}>
              +{currentStage === 'feedzone' ? 500 : currentStage === 'flammeRouge' ? 1000 : 2000} STAGE BONUS
            </div>
          )}
        </div>
      )}
    </>
  );
}

export function useEventListeners() {
  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        queueMove('forward');
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        queueMove('backward');
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        queueMove('left');
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        queueMove('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const cleanupSwipe = initSwipeDetector(document.body, queueMove);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cleanupSwipe();
    };
  }, []);
}
