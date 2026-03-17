import React, { useEffect, useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { useLeaderboardStore } from '@/store/leaderboardStore';
import { queueMove } from '@/logic/playerLogic';
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

export function FeedScore() {
  const feedCount = useGameStore(state => state.feedCount);
  if (feedCount === 0) return null;

  const MAX_BIDON_DISPLAY = 10;
  let items = '';
  if (feedCount <= MAX_BIDON_DISPLAY) {
    items = '\u{1F37C}'.repeat(feedCount); // baby bottle as bidon
  } else {
    items = '\u{1F37C}'.repeat(MAX_BIDON_DISPLAY) + ` +${feedCount - MAX_BIDON_DISPLAY}`;
  }

  return (
    <div id="feed-score" style={{
      position: 'absolute',
      top: 60,
      left: 20,
      fontSize: '1.5em',
      color: '#00e676',
      zIndex: 10,
      whiteSpace: 'nowrap',
    }}>
      {items}
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

  if (status !== 'over') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim();
    const tempUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setUserName(name);
    if (score > 0) {
      addEntry({
        id: tempUserId,
        name: name,
        score: score,
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
          <p className="result-score">Distance: {score}m</p>
          {feedCount > 0 && <p className="result-score" style={{ color: '#00e676' }}>Cyclists fed: {feedCount}</p>}
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
        </div>
      ) : (
        <div id="result">
          <div className="uci-header">UCI COMMUNIQUE</div>
          <p className="uci-notice">{notice}</p>
          {userData && <p className="player-name">Soigneur: {userData.name}</p>}
          <p className="result-score">Distance: {score}m</p>
          {feedCount > 0 && <p className="result-score" style={{ color: '#00e676' }}>Cyclists fed: {feedCount}</p>}
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
