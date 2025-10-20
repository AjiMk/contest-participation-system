import React from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '@/utils/api';
import { useApp } from '@/store/context';

type QType = 'single' | 'multi' | 'boolean';
type Option = { id: string; label: string; is_correct: boolean };
type DraftQuestion = { id: string; prompt: string; type: QType; options: Option[] };

function uid(prefix = 'id') { return `${prefix}_${Math.random().toString(36).slice(2,8)}`; }

function toLocalInput(dt: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = dt.getFullYear();
  const mm = pad(dt.getMonth() + 1);
  const dd = pad(dt.getDate());
  const hh = pad(dt.getHours());
  const mi = pad(dt.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function AdminCreateContest() {
  const nav = useNavigate();
  const { currentUser, refreshContests } = useApp();
  const now = new Date();
  const in1h = new Date(now.getTime() + 60*60*1000);
  const in2h = new Date(in1h.getTime() + 60*60*1000);

  const [name, setName] = React.useState('New Contest');
  const [description, setDescription] = React.useState('Describe the contest...');
  const [access, setAccess] = React.useState<'normal'|'vip'>('normal');
  const [start, setStart] = React.useState(toLocalInput(in1h));
  const [end, setEnd] = React.useState(toLocalInput(in2h));
  const [prizeTitle, setPrizeTitle] = React.useState('Grand Prize');
  const [prizeDetails, setPrizeDetails] = React.useState('Description of the prize');
  const [questions, setQuestions] = React.useState<DraftQuestion[]>([
    { id: uid('q'), prompt: 'Sample question?', type: 'single', options: [
      { id: uid('o'), label: 'Option A', is_correct: true },
      { id: uid('o'), label: 'Option B', is_correct: false },
    ]},
  ]);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const addQuestion = () => setQuestions(qs => ([...qs, {
    id: uid('q'),
    prompt: '',
    type: 'single',
    options: [ { id: uid('o'), label: 'Option 1', is_correct: true }, { id: uid('o'), label: 'Option 2', is_correct: false } ],
  }]));

  const removeQuestion = (id: string) => setQuestions(qs => qs.filter(q => q.id !== id));
  const updateQuestion = (id: string, patch: Partial<DraftQuestion>) => setQuestions(qs => qs.map(q => q.id === id ? { ...q, ...patch } : q));
  const addOption = (qid: string) => setQuestions(qs => qs.map(q => q.id === qid ? { ...q, options: [...q.options, { id: uid('o'), label: `Option ${q.options.length+1}`, is_correct: false }] } : q));
  const removeOption = (qid: string, oid: string) => setQuestions(qs => qs.map(q => q.id === qid ? { ...q, options: q.options.filter(o => o.id !== oid) } : q));
  const updateOption = (qid: string, oid: string, patch: Partial<Option>) => setQuestions(qs => qs.map(q => q.id === qid ? { ...q, options: q.options.map(o => o.id === oid ? { ...o, ...patch } : o) } : q));

  const setSingleCorrect = (qid: string, oid: string) => setQuestions(qs => qs.map(q => q.id === qid ? { ...q, options: q.options.map(o => ({ ...o, is_correct: o.id === oid })) } : q));

  const onTypeChange = (qid: string, t: QType) => setQuestions(qs => qs.map(q => {
    if (q.id !== qid) return q;
    if (t === 'boolean') {
      return { ...q, type: t, options: [ { id: uid('o'), label: 'True', is_correct: true }, { id: uid('o'), label: 'False', is_correct: false } ] };
    }
    // ensure at least 2 options for single/multi
    const base = q.options.length >= 2 ? q.options : [ { id: uid('o'), label: 'Option 1', is_correct: true }, { id: uid('o'), label: 'Option 2', is_correct: false } ];
    return { ...q, type: t, options: base };
  }));

  const validate = (): string | null => {
    if (!name.trim()) return 'Name is required';
    if (!start || !end) return 'Start and End time are required';
    const startDt = new Date(start);
    const endDt = new Date(end);
    if (endDt <= startDt) return 'End time must be after start time';
    if (!questions.length) return 'Add at least one question';
    for (const q of questions) {
      if (!q.prompt.trim()) return 'Each question must have a prompt';
      if (q.type === 'boolean') {
        if (q.options.length !== 2) return 'Boolean questions must have exactly two options';
        const correct = q.options.filter(o => o.is_correct).length;
        if (correct !== 1) return 'Boolean questions must have exactly one correct option';
      } else {
        if (q.options.length < 2) return 'Single/Multi questions must have at least two options';
        const hasCorrect = q.options.some(o => o.is_correct);
        if (!hasCorrect) return 'Each question must have at least one correct option';
      }
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    try {
      const created = await post<any>('/contests', {
        name: name.trim(),
        description: description.trim(),
        access_level: access,
        starts_at: new Date(start).toISOString(),
        ends_at: new Date(end).toISOString(),
        prize_title: prizeTitle.trim(),
        prize_details: prizeDetails.trim(),
        created_by: currentUser?.id,
      });
      const contestId = created.id || created?.data?.id || created?.contest?.id;
      if (!contestId) throw new Error('Contest id missing in response');
      const payload = questions.map(q => ({
        prompt: q.prompt.trim(),
        type: q.type,
        options: q.options.map(o => ({ label: o.label.trim(), is_correct: !!o.is_correct })),
      }));
      await post<any>(`/questions/${contestId}`, payload);
      await refreshContests();
      alert('Contest created');
      nav('/admin');
    } catch (e: any) {
      setError(e?.message || 'Failed to create contest');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <h2>Create Contest</h2>
      <form className="list" onSubmit={onSubmit}>
        <h3>Details</h3>
        <label>Name</label>
        <input className="panel" value={name} onChange={e => setName(e.target.value)} required />
        <label>Description</label>
        <textarea className="panel" value={description} onChange={e => setDescription(e.target.value)} />
        <div className="row">
          <label>Access</label>
          <select className="panel" value={access} onChange={e => setAccess(e.target.value as any)}>
            <option value="normal">Normal</option>
            <option value="vip">VIP</option>
          </select>
          <label style={{marginLeft:'.5rem'}}>Start</label>
          <input type="datetime-local" className="panel" value={start} onChange={e => setStart(e.target.value)} />
          <label style={{marginLeft:'.5rem'}}>End</label>
          <input type="datetime-local" className="panel" value={end} onChange={e => setEnd(e.target.value)} />
        </div>
        <label>Prize Title</label>
        <input className="panel" value={prizeTitle} onChange={e => setPrizeTitle(e.target.value)} />
        <label>Prize Details</label>
        <textarea className="panel" value={prizeDetails} onChange={e => setPrizeDetails(e.target.value)} />

        <div className="spacer" />
        <h3>Questions</h3>
        <div className="list">
          {questions.map((q, idx) => (
            <div key={q.id} className="card">
              <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
                <strong>Q{idx+1}</strong>
                <button type="button" onClick={() => removeQuestion(q.id)}>Remove</button>
              </div>
              <label>Prompt</label>
              <input className="panel" value={q.prompt} onChange={e => updateQuestion(q.id, { prompt: e.target.value })} />
              <div className="row" style={{alignItems:'center'}}>
                <label>Type</label>
                <select className="panel" value={q.type} onChange={e => onTypeChange(q.id, e.target.value as QType)}>
                  <option value="single">Single-select</option>
                  <option value="multi">Multi-select</option>
                  <option value="boolean">True/False</option>
                </select>
              </div>
              {q.type !== 'boolean' && (
                <div className="list">
                  {q.options.map(o => (
                    <div className="row" key={o.id}>
                      <input className="panel" style={{flex:1}} value={o.label} onChange={e => updateOption(q.id, o.id, { label: e.target.value })} />
                      {q.type === 'single' ? (
                        <label className="row" style={{marginLeft:'.5rem'}}>
                          <input type="radio" name={`correct-${q.id}`} checked={o.is_correct} onChange={() => setSingleCorrect(q.id, o.id)} /> Correct
                        </label>
                      ) : (
                        <label className="row" style={{marginLeft:'.5rem'}}>
                          <input type="checkbox" checked={o.is_correct} onChange={e => updateOption(q.id, o.id, { is_correct: e.target.checked })} /> Correct
                        </label>
                      )}
                      <button type="button" onClick={() => removeOption(q.id, o.id)} style={{marginLeft:'.5rem'}}>Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addOption(q.id)}>Add Option</button>
                </div>
              )}
              {q.type === 'boolean' && (
                <div className="list">
                  {q.options.map(o => (
                    <label className="row" key={o.id}>
                      <input type="radio" name={`bool-${q.id}`} checked={o.is_correct} onChange={() => setSingleCorrect(q.id, o.id)} /> {o.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addQuestion}>Add Question</button>

        {error && <span className="danger" style={{marginTop:'.5rem'}}>{error}</span>}
        <div className="spacer" />
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Contest'}</button>
      </form>
    </div>
  );
}

