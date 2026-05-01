'use client';
import { useState, useRef, useEffect } from 'react';
import './components/styles.css';

const STARTERS = [
  'Where should I start first?',
  "What's the biggest gap in my coverage right now?",
  'Explain the perceptual mapping feature',
  'Walk me through the scoring rounds',
];

export default function Home() {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState(false);
  const [msg, setMsg] = useState('');
  const [hist, setHist] = useState([]);
  const [wait, setWait] = useState(false);
  const [html, setHtml] = useState('');
  const bottom = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch('/report.html').then(r => r.text()).then(setHtml).catch(() => setHtml(''));
  }, []);

  async function verify() {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (data.ok) {
      setUnlocked(true);
    } else {
      setError(data.error || 'Invalid code');
      setCode('');
    }
    setLoading(false);
  }

  function startChat() {
    setChat(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function send() {
    if (!msg.trim() || wait) return;
    const u = msg.trim();
    setMsg('');
    setHist(h => [...h, { role: 'user', parts: [{ text: u }] }]);
    setWait(true);
    await new Promise(r => setTimeout(r, 50));
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: u, history: [] }),
      });
      const data = await res.json();
      setHist(h => [...h, { role: 'model', parts: [{ text: data.reply || 'I\'m unable to respond right now.' }] }]);
    } catch {
      setHist(h => [...h, { role: 'model', parts: [{ text: 'Connection error. Please try again.' }] }]);
    }
    setWait(false);
  }

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [hist]);

  if (!unlocked) {
    return (
      <div className="gate-wrap">
        <div className="gate-card">
          <div className="gate-logo">📊</div>
          <h1>Market Intelligence Platform</h1>
          <p className="gate-sub">Strategic Intelligence Workspace</p>
          <input
            className="gate-input"
            type="text"
            placeholder="Enter access code"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && verify()}
          />
          {error && <p className="gate-err">{error}</p>}
          <button className="gate-btn" onClick={verify} disabled={loading}>
            {loading ? 'Verifying…' : 'Unlock Report'}
          </button>
        </div>
      </div>
    );
  }

  if (html) {
    const body = html.replace(/^<div id="app" class="visible">/, '').replace(/<\/div>\s*<\/div>\s*<script>[\s\S]*$/, '');
    return (
      <div className="wrapper">
        <div className="iframe-wrap">
          <div dangerouslySetInnerHTML={{ __html: body }} />
        </div>
        <div className={`fab ${chat ? 'hide' : ''}`} onClick={startChat}>💬</div>
        {chat && (
          <div className="panel">
            <div className="panel-head">
              <span>AI Advisor</span>
              <button onClick={() => setChat(false)}>✕</button>
            </div>
            <div className="panel-body">
              <div className="starter-label">Try asking about:</div>
              {STARTERS.map(s => (
                <button key={s} className="starter-btn" onClick={() => { setMsg(s); send(); }}>{s}</button>
              ))}
              {hist.map((m, i) => (
                <div key={i} className={`msg ${m.role === 'user' ? 'user' : 'ai'}`}>
                  <strong>{m.role === 'user' ? 'You' : 'AI'}:</strong> {m.parts[0].text}
                </div>
              ))}
              {wait && <div className="msg ai"><strong>AI:</strong>Thinking…</div>}
              <div ref={bottom} />
            </div>
            <div className="panel-foot">
              <input ref={inputRef} value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask about the report…" />
              <button onClick={send} disabled={wait}>Send</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="gate-wrap">
      <div className="gate-card">
        <p>Loading report…</p>
      </div>
    </div>
  );
}
