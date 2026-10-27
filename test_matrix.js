// Прогон всех сценариев финалов на реальной логике из фильм.html
const fs = require('fs');
const html = fs.readFileSync('фильм.html', 'utf8');

const mFin = html.match(/var FINALS = (\[[\s\S]*?\]);\s*\n\s*function chooseFinal/);
if (!mFin) { console.log('FINALS не найдены'); process.exit(1); }
const FINALS = eval(mFin[1]);
const mChoose = html.match(/function chooseFinal\(t, yes, pk\) \{([\s\S]*?)\n  \}/);
const chooseFinal = new Function('FINALS', 'return function (t, yes, pk) {' + mChoose[1] + '}')(FINALS);

const counts = {};
const anomalies = [];
const examples = {};
for (let o = 0; o <= 4; o++)
  for (let m = 0; m <= 6; m++)
    for (let r = 0; r <= 4; r++)
      for (let pk = 0; pk <= 6; pk++) {
        const yes = o + m + r;
        const t = { other: o, mine: m, reel: r };
        const f = chooseFinal(t, yes, pk);
        counts[f.id] = (counts[f.id] || 0) + 1;
        const key = f.id;
        if (!examples[key]) examples[key] = { o, m, r, pk, yes };
        const mx = Math.max(o, m, r);
        const sorted = [o, m, r].sort(function (a, b) { return b - a; });
        const strict = mx > sorted[1]; // строго больше второго места
        // проверка: тип строго доминирует и ≥ половины «было», pk<5 → финал должен быть про этот тип
        if (yes >= 4 && pk < 5 && strict && mx >= Math.ceil(yes / 2)) {
          const dom = o === mx ? 'other' : (m === mx ? 'mine' : 'reel');
          if (f.id !== ({ other: 'F6', mine: 'F7', reel: 'F5' })[dom])
            anomalies.push('тип ' + dom + ' ' + o + '/' + m + '/' + r + ' pk=' + pk + ' → ' + f.id);
        }
        // кейс Виктора со скрина: 2/4/4 (ничья своих/чужих)
        if (o === 2 && m === 4 && r === 4 && (pk === 2 || pk === 4))
          console.log('  кейс 2/4/4 pk=' + pk + ' → ' + f.id + ' «' + (typeof f.title === 'string' ? f.title : f.title.m) + '»');
      }

console.log('комбинаций:', (5 * 7 * 5 * 7));
console.log('распределение финалов:', JSON.stringify(counts));
console.log('достижимы все 10:', Object.keys(counts).length === 10 ? 'ДА' : 'НЕТ — ' + Object.keys(counts).sort().join(','));
console.log('\nпримеры первого срабатывания:');
for (const k of ['F1','F2','F3','F4','F5','F6','F7','F8','F9','F10']) {
  const e = examples[k];
  console.log(' ', k, e ? ('other ' + e.o + ' / mine ' + e.m + ' / reel ' + e.r + ' · взято ' + e.pk + ' · было ' + e.yes) : 'НЕДОСТИЖИМ');
}
console.log('\nаномалий (тип-доминанта получил чужой финал):', anomalies.length);
anomalies.slice(0, 12).forEach(a => console.log('  ', a));
