import React, { useEffect, useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { useLeaderboardStore } from '@/store/leaderboardStore';
import { queueMove } from '@/logic/playerLogic';
import { pauseBackgroundMusic, resumeBackgroundMusic } from '@/sound/playBackgroundMusic';
import { fetchTopScores, LeaderboardRow } from '@/utils/leaderboard';
import { UI_CONFIG } from '@/utils/constants';

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

function BidonIcon() {
  return (
    <svg width="20" height="28" viewBox="0 0 20 28" style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 1px' }}>
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

function Leaderboard() {
  const [scores, setScores] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchTopScores(10)
      .then(rows => {
        setScores(rows);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="leaderboard-loading">Loading scores...</p>;
  if (error) return null;

  return (
    <div className="leaderboard">
      <h3 className="leaderboard-title">Top Soigneurs</h3>
      {scores.length === 0 ? (
        <p className="leaderboard-loading">No scores yet — be the first!</p>
      ) : (
        <ol className="leaderboard-list">
          {scores.map((row, i) => (
            <li key={i} className="leaderboard-row">
              <span className="leaderboard-name">{row.name}</span>
              <span className="leaderboard-score">{row.score}</span>
            </li>
          ))}
        </ol>
      )}
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
  const addEntry = useLeaderboardStore(state => state.addEntry);

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

  const feedBonus = feedCount * 10;
  const totalScore = score + feedBonus;

  if (status !== 'over') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim();
    const tempUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setUserName(name);
    if (totalScore > 0) {
      addEntry({
        id: tempUserId,
        name: name,
        score: totalScore,
      }).catch(error => {
        console.error('Failed to save score:', error);
      });
    }
    setShowNameForm(false);
    reset();
  };

  const handleRetry = () => {
    if (userData) {
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
                Feeds: {feedCount} x 10 = +{feedBonus}
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
            <button type="submit">Go!</button>
          </form>
          <Leaderboard />
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
                Feeds: {feedCount} x 10 = +{feedBonus}
              </p>
            )}
            <p className="result-score total-score">Total: {totalScore}</p>
          </div>
          <Leaderboard />
          <button onClick={handleRetry}>Retry</button>
        </div>
      )}
    </div>
  );
}

export function CornScore() {
  const cornCount = useGameStore(state => state.cornCount);
  const { MAX_CORN_DISPLAY, CORN_SCORE_STYLE } = UI_CONFIG;

  let items = '';
  if (cornCount <= MAX_CORN_DISPLAY) {
    items = '\u{1F9F4}'.repeat(cornCount);
  } else {
    items = '\u{1F9F4}'.repeat(MAX_CORN_DISPLAY) + ` +${cornCount - MAX_CORN_DISPLAY}`;
  }

  return (
    <div id="corn-score" style={CORN_SCORE_STYLE}>
      {items}
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
