import React, { useState, useEffect } from 'react';
import './App.css';

const PRIORITY_WEIGHTS = {
  placement: 3,
  result: 2,
  event: 1,
};

function App() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topN, setTopN] = useState(5);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://20.207.122.201/evaluation-service/notifications');
      if (!response.ok) {
        throw new Error('API error: ' + response.status);
      }
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError('Could not fetch from live API. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityInbox = () => {
    // Sort all notifications by priority
    const sorted = [...notifications].sort((a, b) => {
      const weightA = PRIORITY_WEIGHTS[a.type?.toLowerCase()] || 0;
      const weightB = PRIORITY_WEIGHTS[b.type?.toLowerCase()] || 0;
      // Also can sort by timestamp if weights are equal, but we'll stick to weights first
      return weightB - weightA;
    });
    return sorted.slice(0, topN);
  };

  const priorityNotifications = getPriorityInbox();

  return (
    <div className="App">
      <header>
        <h1>Campus Priority Inbox</h1>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="controls">
        <label>
          Display Top N:
          <input 
            type="number" 
            min="1" 
            max="20" 
            value={topN} 
            onChange={(e) => setTopN(Number(e.target.value))} 
          />
        </label>
        <button onClick={fetchNotifications}>Refresh</button>
      </div>

      {loading ? (
        <div className="loading">Loading notifications...</div>
      ) : (
        <div className="notification-list">
          {priorityNotifications.length > 0 ? (
            priorityNotifications.map(notification => (
              <div className={'notification-card ' + (notification.type?.toLowerCase() || 'default')} key={notification.id}>
                <div className="badge">{notification.type?.toUpperCase()}</div>
                <h3>{notification.massage}</h3>
                <p style={{fontSize: '0.85em', color: '#888', marginTop: '10px'}}>{notification.timestamp}</p>
              </div>
            ))
          ) : (
            <div className="empty-state">No notifications!</div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
