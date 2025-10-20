import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/store/context';
import React from 'react';
import { get, post } from '@/utils/api';

type ApiQuestion = { id: string; prompt: string; type: 'single'|'multi'|'boolean'; options: { id: string; label: string }[] };
type Answers = Record<string, string[]>;

export default function TakeContest() {
  const { id } = useParams();
  const nav = useNavigate();
  const { contests, submitAnswers, currentUser } = useApp();
  const contest = contests.find(c => c.id === id);
  const [answers, setAnswers] = React.useState<Answers>({});
  const [questions, setQuestions] = React.useState<ApiQuestion[]>([]);
  if (!contest) return <div className="container"><p>Contest not found.</p></div>;

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!id || !currentUser) return;
        // If already submitted, prevent participation
        try {
          const mine = await get<{ joined: any[]; submissions: any[] }>(`/participation/mine`);
          const exists = (mine.submissions || []).some((s: any) => s.contestId === id);
          if (exists) { alert('You already submitted this contest.'); nav(`/contests/${id}`); return; }
        } catch {}
        const data = await get<ApiQuestion[]>(`/questions/${id}`);
        if (!cancelled) setQuestions(data);
      } catch {
        if (!cancelled) setQuestions([]);
      }
    })();
    return () => { cancelled = true; };
  }, [id, currentUser?.id]);

  const onSingle = (qid: string, optId: string) => setAnswers(a => ({ ...a, [qid]: [optId] }));
  const onMulti = (qid: string, optId: string) => setAnswers(a => {
    const cur = (a[qid] as string[] | undefined) ?? [];
    const set = new Set(cur);
    set.has(optId) ? set.delete(optId) : set.add(optId);
    return { ...a, [qid]: [...set] };
  });
  const onBool = (qid: string, optId: string) => setAnswers(a => ({ ...a, [qid]: [optId] }));

  const onSubmit = () => {
    (async () => {
      try {
        const payload: Record<string, string[] | string> = {};
        for (const q of Object.keys(answers)) {
          const sel = answers[q];
          payload[q] = sel.length === 1 ? sel[0] : sel;
        }
        const res = await post<{ score: number }>(`/participation`, { contestId: contest.id, answers: payload });
        const score = res.score ?? 0;
        // Store locally for history/leaderboard
        submitAnswers(contest.id, answers as unknown as any, score);
        nav(`/leaderboard?contest=${contest.id}`);
      } catch (e: any) {
        alert(e?.message || 'Failed to submit');
      }
    })();
  };

  return (
    <div className="container">
      <div className="row" style={{justifyContent:'space-between'}}>
        <h2 style={{margin:0}}>{contest.name}</h2>
        <span className="pill">Questions: {questions.length}</span>
      </div>
      <div className="spacer" />
      <div className="list">
        {questions.map(q => (
          <QuestionBlock key={q.id} q={q} answers={answers} onSingle={onSingle} onMulti={onMulti} onBool={onBool} />
        ))}
      </div>
      <div className="spacer" />
      <button onClick={onSubmit}>Submit</button>
    </div>
  );
}

function QuestionBlock({ q, answers, onSingle, onMulti, onBool }: {
  q: ApiQuestion;
  answers: Answers;
  onSingle: (qid: string, optId: string) => void;
  onMulti: (qid: string, optId: string) => void;
  onBool: (qid: string, optId: string) => void;
}) {
  return (
    <div className="card">
      <strong>{q.type.toUpperCase()}</strong>
      <div>{q.prompt}</div>
      {q.type === 'single' && (
        <div className="list">
          {q.options.map(o => {
            const selected = Array.isArray(answers[q.id]) && (answers[q.id] as string[])[0] === o.id;
            return (
              <label key={o.id} className="row">
                <input type="radio" name={q.id} checked={!!selected} onChange={() => onSingle(q.id, o.id)} />
                {o.label}
              </label>
            );
          })}
        </div>
      )}
      {q.type === 'multi' && (
        <div className="list">
          {q.options.map(o => {
            const selected = Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(o.id);
            return (
              <label key={o.id} className="row">
                <input type="checkbox" checked={!!selected} onChange={() => onMulti(q.id, o.id)} />
                {o.label}
              </label>
            );
          })}
        </div>
      )}
      {q.type === 'boolean' && (
        <div className="row">
          {q.options.map(o => {
            const selected = Array.isArray(answers[q.id]) && (answers[q.id] as string[])[0] === o.id;
            return (
              <label key={o.id} className="row">
                <input type="radio" name={q.id} checked={!!selected} onChange={() => onBool(q.id, o.id)} /> {o.label}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
