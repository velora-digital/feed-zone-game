import React, { useEffect, useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { queueMove } from '@/logic/playerLogic';
import { pauseBackgroundMusic, resumeBackgroundMusic } from '@/sound/playBackgroundMusic';
import { UI_CONFIG } from '@/utils/constants';

const FEED_BONUS_MULTIPLIER = 10;

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
  return <div id="score">{score}</div>;
}

function BidonIcon({ size = 20 }: { size?: number }) {
  const height = size * 1.4;
  return (
    <svg width={size} height={height} viewBox="0 0 20 28" style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 1px' }}>
      {/* Cap / nozzle */}
      <rect x="7" y="0" width="6" height="5" rx="1" fill="#eeeeee" />
      {/* Bottle body */}
      <rect x="4" y="5" width="12" height="20" rx="3" fill="#29b6f6" />
      {/* Label band */}
      <rect x="4" y="14" width="12" height="4" fill="#0288d1" />
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
      if (e.key === 'Enter') {
        // TODO: Replace with useGameStore.getState().startGame() once available
        useGameStore.getState().reset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  if (status !== 'idle') return null;

  const handleStart = () => {
    // TODO: Replace with useGameStore.getState().startGame() once available
    useGameStore.getState().reset();
  };

  return (
    <div id="result-container">
      <div id="result" style={{
        background: 'linear-gradient(180deg, #1a237e 0%, #0d1b4a 100%)',
        border: '3px solid #c6a84b',
        textAlign: 'center',
        padding: '2em 1.5em',
      }}>
        <h1 style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '2em',
          color: '#c6a84b',
          marginBottom: '0.5em',
          textShadow: '2px 2px 0 #000',
        }}>
          FEED ZONE
        </h1>
        <p style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '0.7em',
          color: '#ffffff',
          marginBottom: '1.5em',
          lineHeight: 1.6,
        }}>
          Be the soigneur. Feed the peloton.
        </p>
        <p style={{
          fontSize: '0.55em',
          color: '#aab4d6',
          marginBottom: '2em',
          lineHeight: 1.8,
          fontFamily: "'Press Start 2P', monospace",
        }}>
          Arrow keys or swipe to move.<br />
          Collect musettes. Feed hungry cyclists.
        </p>
        <button
          onClick={handleStart}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '1em',
            padding: '0.8em 1.5em',
            background: '#c6a84b',
            color: '#0d1b4a',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.05em',
          }}
        >
          PRESS ENTER TO START
        </button>
      </div>
    </div>
  );
}

export function Result() {
  const status = useGameStore(state => state.status);
  const score = useGameStore(state => state.score);
  const feedCount = useGameStore(state => state.feedCount);
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

  const feedBonus = feedCount * FEED_BONUS_MULTIPLIER;
  const totalScore = score + feedBonus;

  if (status !== 'over') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim();
    setUserName(name);
    setShowNameForm(false);
    // TODO: Replace with useGameStore.getState().startGame() once available
    reset();
  };

  const handleRetry = () => {
    if (userData) {
      // TODO: Replace with useGameStore.getState().startGame() once available
      reset();
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
            <p className="result-score">Distance: {score}m</p>
            {feedCount > 0 && (
              <p className="result-score" style={{ color: '#00e676' }}>
                Feeds: {feedCount} x {FEED_BONUS_MULTIPLIER} = +{feedBonus}
              </p>
            )}
            <p className="result-score total-score">Total: {totalScore}</p>
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
            <p className="result-score">Distance: {score}m</p>
            {feedCount > 0 && (
              <p className="result-score" style={{ color: '#00e676' }}>
                Feeds: {feedCount} x {FEED_BONUS_MULTIPLIER} = +{feedBonus}
              </p>
            )}
            <p className="result-score total-score">Total: {totalScore}</p>
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
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
