// quiz.js — 预测题组件:先预测 → 揭示 → 记录(localStorage)
// item: { code?, q, kind: 'choice' | 'text', options?: [{t, correct}], why }
export const Quiz = (function () {
  'use strict';

  const key = (chapterId) => 'to-full-stack-quiz-' + chapterId;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function mount(container, chapterId, items) {
    container.innerHTML = '';
    items.forEach((item, qi) => {
      const card = document.createElement('div');
      card.className = 'quiz-card';
      const head = document.createElement('div');
      head.className = 'quiz-head';
      head.innerHTML = `<span class="quiz-no">Q${qi + 1}</span><span class="quiz-q">${item.q}</span>`;
      card.appendChild(head);
      if (item.code) {
        const pre = document.createElement('pre');
        pre.className = 'quiz-code';
        pre.textContent = item.code;
        card.appendChild(pre);
      }
      const area = document.createElement('div');
      area.className = 'quiz-area';
      card.appendChild(area);

      function answerUI() {
        area.innerHTML = '';
        if (item.kind === 'choice') {
          item.options.forEach((opt) => {
            const b = document.createElement('button');
            b.className = 'quiz-opt';
            b.textContent = opt.t;
            b.onclick = () => judge(opt.correct, opt.t);
            area.appendChild(b);
          });
        } else {
          const ta = document.createElement('textarea');
          ta.placeholder = '先写下你的预测/解释(写完再揭示)';
          const b = document.createElement('button');
          b.textContent = '揭示参考答案';
          b.className = 'primary';
          b.onclick = () => judge(null, ta.value.trim() || '(未写)');
          area.appendChild(ta);
          area.appendChild(b);
        }
      }

      function judge(correct, given) {
        const isReveal = correct === null;
        const right = correct === true;
        area.innerHTML = `
          <div class="quiz-verdict ${isReveal ? '' : right ? 'good' : 'bad'}">
            ${isReveal ? '答案揭晓' : right ? '✓ 预测正确' : '✗ 与实际不符'}　<i>${escapeHtml(given)}</i>
          </div>
          <div class="quiz-why">${item.why}</div>
          <button class="quiz-retry">↺ 再试一次</button>`;
        area.querySelector('.quiz-retry').onclick = answerUI;
        card.classList.remove('right', 'wrong');
        card.classList.add(isReveal ? 'revealed' : right ? 'right' : 'wrong');
        const done = JSON.parse(localStorage.getItem(key(chapterId)) || '{}');
        done[qi] = { answered: true, pass: right };
        localStorage.setItem(key(chapterId), JSON.stringify(done));
        summary();
      }

      answerUI();
      container.appendChild(card);
    });

    const summaryEl = document.createElement('div');
    summaryEl.className = 'quiz-summary';
    container.appendChild(summaryEl);
    function summary() {
      const right = container.querySelectorAll('.quiz-card.right').length;
      summaryEl.textContent =
        `本轮:${items.length} 题中一次预测正确 ${right} 题` +
        (right === items.length ? ' 🎉' : '(错题用"再试一次",并让 AI 出同款变体——② 号卡)');
    }
    summary();
  }

  return { mount };
})();
