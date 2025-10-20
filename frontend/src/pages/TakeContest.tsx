import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/store/context';
import { Contest, Question } from '@/types/domain';
import { scoreSubmission } from '@/utils/scoring';
import React from 'react';

type Answers = Record<string, string[] | boolean>;

export default function TakeContest() {
  const { id } = useParams();
  const nav = useNavigate();
  const { contests, submitAnswers } = useApp();
  const contest = contests.find(c => c.id === id);
  const [answers, setAnswers] = React.useState<Answers>({});
  if (!contest) return <div className="container"><p>Contest not found.</p></div>;

  const onSingle = (qid: string, optId: string) => setAnswers(a => ({ ...a, [qid]: [optId] }));
  const onMulti = (qid: string, optId: string) => setAnswers(a => {
    const cur = (a[qid] as string[] | undefined) ?? [];
    const set = new Set(cur);
    set.has(optId) ? set.delete(optId) : set.add(optId);
    return { ...a, [qid]: [...set] };
  });
  const onBool = (qid: string, v: boolean) => setAnswers(a => ({ ...a, [qid]: v }));

  const onSubmit = () => {
    const score = scoreSubmission(contest as Contest, answers);
    submitAnswers(contest.id, answers, score);
    nav(`/leaderboard?contest=${contest.id}`);
  };

  return (
    <div className="container">
      <div className="row" style={{justifyContent:'space-between'}}>
        <h2 style={{margin:0}}>{contest.name}</h2>
        <span className="pill">Questions: {contest.questions.length}</span>
      </div>
      <div className="spacer" />
      <div className="list">
        {contest.questions.map(q => (
          <QuestionBlock key={q.id} q={q} answers={answers} onSingle={onSingle} onMulti={onMulti} onBool={onBool} />
        ))}
      </div>
      <div className="spacer" />
      <button onClick={onSubmit}>Submit</button>
    </div>
  );
}

function QuestionBlock({ q, answers, onSingle, onMulti, onBool }: {
  q: Question;
  answers: Answers;
  onSingle: (qid: string, optId: string) => void;
  onMulti: (qid: string, optId: string) => void;
  onBool: (qid: string, v: boolean) => void;
}) {
  return (
    <div className="card">
      <strong>{q.kind.toUpperCase()}</strong>
      <div>{q.prompt}</div>
      {q.kind === 'single' && (
        <div className="list">
          {q.options.map(o => {
            const selected = Array.isArray(answers[q.id]) && (answers[q.id] as string[])[0] === o.id;
            return (
              <label key={o.id} className="row">
                <input type="radio" name={q.id} checked={!!selected} onChange={() => onSingle(q.id, o.id)} />
                {o.text}
              </label>
            );
          })}
        </div>
      )}
      {q.kind === 'multi' && (
        <div className="list">
          {q.options.map(o => {
            const selected = Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(o.id);
            return (
              <label key={o.id} className="row">
                <input type="checkbox" checked={!!selected} onChange={() => onMulti(q.id, o.id)} />
                {o.text}
              </label>
            );
          })}
        </div>
      )}
      {q.kind === 'boolean' && (
        <div className="row">
          <label className="row"><input type="radio" name={q.id} checked={answers[q.id] === true} onChange={() => onBool(q.id, true)} /> True</label>
          <label className="row"><input type="radio" name={q.id} checked={answers[q.id] === false} onChange={() => onBool(q.id, false)} /> False</label>
        </div>
      )}
    </div>
  );
}

