import { useState, useRef, useEffect } from 'react';
import './ClaimsAnalyst.css';

// ── Markdown renderer ──────────────────────────────────────────────────────
// Converts GPT/Claude markdown to React elements without a library dependency
const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  const parseInline = (str) => {
    // Bold: **text**
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, idx) => {
      if (p.startsWith('**') && p.endsWith('**')) {
        return <strong key={idx}>{p.slice(2, -2)}</strong>;
      }
      return p;
    });
  };

  while (i < lines.length) {
    const line = lines[i];

    // Empty line → spacing
    if (line.trim() === '') {
      elements.push(<div key={i} className="ca-md-gap" />);
      i++;
      continue;
    }

    // Headings — strip any number of leading # chars
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const cls = level <= 2 ? 'ca-md-h2' : 'ca-md-h3';
      elements.push(<p key={i} className={cls}>{parseInline(headingMatch[2])}</p>);
      i++; continue;
    }

    // Numbered list: "1. text"
    if (/^\d+\.\s/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(<li key={i}>{parseInline(lines[i].replace(/^\d+\.\s/, ''))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="ca-md-ol">{listItems}</ol>);
      continue;
    }

    // Bullet list: "- text" or "* text"
    if (/^[-*]\s/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        listItems.push(<li key={i}>{parseInline(lines[i].replace(/^[-*]\s/, ''))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="ca-md-ul">{listItems}</ul>);
      continue;
    }

    // Normal paragraph
    elements.push(<p key={i} className="ca-md-p">{parseInline(line)}</p>);
    i++;
  }

  return elements;
};

// ── Message bubble components ──────────────────────────────────────────────
const UserBubble = ({ text }) => (
  <div className="ca-msg ca-msg--user">
    <div className="ca-bubble ca-bubble--user">{text}</div>
  </div>
);

const AssistantBubble = ({ text, isLoading }) => (
  <div className="ca-msg ca-msg--assistant">
    <div className="ca-assistant-avatar">
      <span className="material-icons" style={{ fontSize: 14 }}>auto_awesome</span>
    </div>
    <div className="ca-bubble ca-bubble--assistant">
      {isLoading
        ? <span className="ca-typing"><span /><span /><span /></span>
        : renderMarkdown(text)
      }
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────
const ClaimsAnalyst = ({ claim, anomalyData, onDelete }) => {
  const selectedModel = 'gpt-4o';
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const textareaRef = useRef(null);
  const chatEndRef = useRef(null);

  // Extract risk flags from anomaly data
  const getRiskFlags = () => {
    if (!anomalyData?.AgenticSummary?.Analysis_Findings) return [];
    return anomalyData.AgenticSummary.Analysis_Findings
      .filter(f => f.Status === 'FAIL')
      .map(f => ({ label: f.Title, severity: f.Severity }));
  };
  const riskFlags = getRiskFlags();

  // Build claim context string for prompts
  const buildClaimContext = () => {
    const c = claim || {};
    const lines = [];
    if (c.claimNumber) lines.push(`Claim Number: ${c.claimNumber}`);
    if (c.status) lines.push(`Status: ${c.status}`);
    if (c.policy?.policyNumber) lines.push(`Policy: ${c.policy.policyNumber}`);
    if (c.policy?.policyType || c.policy?.type) lines.push(`Policy Type: ${c.policy.policyType || c.policy.type}`);
    if (c.insured?.name) lines.push(`Insured: ${c.insured.name}`);
    if (c.claimant?.name) lines.push(`Claimant: ${c.claimant.name}`);
    if (c.deathEvent?.dateOfDeath) lines.push(`Date of Death: ${c.deathEvent.dateOfDeath}`);
    if (c.deathEvent?.mannerOfDeath) lines.push(`Manner of Death: ${c.deathEvent.mannerOfDeath}`);
    if (anomalyData?.AgenticSummary) {
      const findings = anomalyData.AgenticSummary.Analysis_Findings || [];
      const failed = findings.filter(f => f.Status === 'FAIL');
      if (failed.length > 0) {
        lines.push(`\nRisk Findings (${failed.length}):`);
        failed.forEach(f => lines.push(`- [${f.Severity}] ${f.Title}: ${f.Recommendation || ''}`));
      }
    }
    return lines.join('\n');
  };

  const systemPrompt = `You are a Claims Analyst AI assistant for an insurance claims management system.
Analyze the following claim data and provide concise, actionable insights for the claims handler.
Focus on risk assessment, compliance requirements, payment verification, and next steps.
Be professional, precise, and highlight any concerns that need immediate attention.
Format your responses clearly with headers and bullet points where appropriate.

Claim Context:
${buildClaimContext()}`;

  const callOpenAI = async (messages) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured. Set VITE_OPENAI_API_KEY in .env');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-4o', messages, temperature: 0.3, max_tokens: 1000 })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `OpenAI error: ${response.status}`);
    }
    return (await response.json()).choices[0].message.content;
  };

  const callClaude = async (messages) => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('Anthropic API key not configured. Set VITE_ANTHROPIC_API_KEY in .env');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        system: systemPrompt,
        messages: messages.filter(m => m.role !== 'system'),
        max_tokens: 1000
      })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Claude error: ${response.status}`);
    }
    return (await response.json()).content[0].text;
  };

  const callModel = async (messages) => {
    if (selectedModel === 'claude') return callClaude(messages);
    return callOpenAI(messages);
  };

  // Run initial analysis
  const runAnalysis = async () => {
    setLoading(true);
    setChatHistory([]);
    try {
      const userMsg = 'Please provide a comprehensive analysis of this claim, including risk assessment, key findings, and recommended next steps.';
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMsg }
      ];
      const result = await callModel(messages);
      setChatHistory([
        { role: 'user', content: userMsg },
        { role: 'assistant', content: result }
      ]);
    } catch (err) {
      setChatHistory([{ role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle follow-up question
  const handleSendQuestion = async () => {
    if (!question.trim() || chatLoading) return;
    const userMsg = question.trim();
    setQuestion('');
    setChatLoading(true);
    const newHistory = [...chatHistory, { role: 'user', content: userMsg }];
    setChatHistory(newHistory);
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...newHistory.map(m => ({ role: m.role, content: m.content }))
      ];
      const result = await callModel(messages);
      setChatHistory([...newHistory, { role: 'assistant', content: result }]);
    } catch (err) {
      setChatHistory([...newHistory, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [question]);

  const claimLabel = claim?.claimNumber
    ? `${claim.claimNumber} · ${claim.policy?.policyType || claim.policy?.type || 'P&C'}`
    : 'Claims Analyst';

  const hasChat = chatHistory.length > 0;

  return (
    <div className="claims-analyst-card">
      {/* Header */}
      <div className="ca-header">
        <div className="ca-header-left">
          <span className="material-icons" style={{ fontSize: 18, color: '#F6921E' }}>auto_awesome</span>
          <div className="ca-title-block">
            <span className="ca-title">Claims Analyst</span>
            <span className="ca-subtitle">{claimLabel}</span>
          </div>
        </div>
        <div className="ca-header-right">
          <button
            title="Re-run analysis"
            onClick={runAnalysis}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 32, minHeight: 32, padding: '0 10px',
              border: '1px solid #C2D9EE', borderRadius: 6,
              background: '#FFFFFF', cursor: loading ? 'default' : 'pointer',
              color: '#1B75BB', opacity: loading ? 0.45 : 1,
              transition: 'all 0.15s ease', flexShrink: 0
            }}
          >
            <span className="material-icons" style={{ fontSize: 18, lineHeight: 1, display: 'block' }}>refresh</span>
          </button>
          {onDelete && (
            <button
              title="Delete"
              onClick={onDelete}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, minHeight: 32, padding: 0,
                border: '1px solid #C2D9EE', borderRadius: 6,
                background: '#FFFFFF', cursor: 'pointer',
                color: '#1B75BB', transition: 'all 0.15s ease', flexShrink: 0
              }}
            >
              <span className="material-icons" style={{ fontSize: 18, lineHeight: 1, display: 'block' }}>delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Risk Flags */}
      {riskFlags.length > 0 && (
        <div className="ca-risk-section">
          <span className="ca-risk-label">DETECTED RISK FLAGS</span>
          <div className="ca-risk-flags">
            {riskFlags.map((flag, i) => (
              <span key={i} className="ca-risk-badge">
                <span className="material-icons ca-risk-icon">warning</span>
                {flag.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="ca-chat-area">
        {loading ? (
          <div className="ca-loading">
            <span className="material-icons ca-spin">autorenew</span>
            <span>Analyzing claim...</span>
          </div>
        ) : !hasChat ? (
          <div className="ca-placeholder">
            <p>Analysis will appear here.</p>
            <button className="ca-run-btn" onClick={runAnalysis}>Run Analysis</button>
          </div>
        ) : (
          <div className="ca-messages">
            {chatHistory.map((msg, i) =>
              msg.role === 'user'
                ? <UserBubble key={i} text={msg.content} />
                : <AssistantBubble key={i} text={msg.content} />
            )}
            {chatLoading && <AssistantBubble isLoading />}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="ca-input-area">
        <div className="ca-input-wrapper">
          <textarea
            ref={textareaRef}
            className="ca-textarea"
            placeholder="Ask a follow-up question..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={chatLoading || loading}
          />
          <button
            className="ca-send-btn"
            onClick={handleSendQuestion}
            disabled={!question.trim() || chatLoading || loading}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>arrow_forward</span>
          </button>
        </div>
        <span className="ca-input-hint">Enter to send · Shift+Enter for new line</span>
      </div>
    </div>
  );
};

export default ClaimsAnalyst;
