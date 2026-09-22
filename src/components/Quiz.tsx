import { useState } from 'preact/hooks';
import { saveQuizScore } from './progress-store';

type Q = { q: string; options: string[]; answer: number; explain?: string };

const COPY = {
  en: { submit: 'Submit', score: 'Score' },
  th: { submit: 'ส่งคำตอบ', score: 'คะแนน' },
};

// The island hydrates with client:visible, so the document is available by the
// time a reader can see the button.
function copy() {
  const lang = typeof document === 'undefined' ? 'en' : document.documentElement.lang;
  return lang?.startsWith('th') ? COPY.th : COPY.en;
}

export default function Quiz({ id, questions }: { id: string; questions: Q[] }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const correct = questions.filter((q, i) => picked[i] === q.answer).length;
  const t = copy();

  function submit() {
    setSubmitted(true);
    saveQuizScore(id, correct, questions.length);
  }

  return (
    <div class="quiz">
      {questions.map((q, i) => (
        <fieldset key={i} class="quiz__q">
          <legend>{q.q}</legend>
          {q.options.map((o, j) => (
            <label class={submitted ? (j === q.answer ? 'ok' : picked[i] === j ? 'bad' : '') : ''}>
              <input type="radio" name={`q${i}`} disabled={submitted} checked={picked[i] === j}
                onChange={() => setPicked({ ...picked, [i]: j })} /> {o}
            </label>
          ))}
          {submitted && q.explain ? <p class="quiz__explain">{q.explain}</p> : null}
        </fieldset>
      ))}
      {!submitted
        ? <button class="pg__run" onClick={submit}>{t.submit}</button>
        : <p class="quiz__score">{t.score}: {correct} / {questions.length}</p>}
    </div>
  );
}
