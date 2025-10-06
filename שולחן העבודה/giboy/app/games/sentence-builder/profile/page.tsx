'use client';
import { useState, useEffect, ChangeEvent } from 'react';

const DIFFICULTIES = [
  { key: 'easy', label: 'קל' },
  { key: 'medium', label: 'בינוני' },
  { key: 'hard', label: 'קשה' },
];

const LEVEL_ICONS = {
  easy: '🌱',
  medium: '🌿',
  hard: '🌳',
};

function getStats() {
  let totalScore = 0, totalGames = 0, totalTime = 0, correctGames = 0;
  if (typeof window !== 'undefined') {
    DIFFICULTIES.forEach(d => {
      const lb = JSON.parse(localStorage.getItem(`sb-leaderboard-${d.key}`) || '[]');
      lb.forEach((entry: any) => {
        totalScore += entry.score;
        totalTime += entry.time;
        totalGames++;
        if (entry.score > 0) correctGames++;
      });
    });
  }
  return {
    avgScore: totalGames ? (totalScore / totalGames).toFixed(1) : 0,
    avgTime: totalGames ? (totalTime / totalGames).toFixed(1) : 0,
    successRate: totalGames ? ((correctGames / totalGames) * 100).toFixed(0) : 0,
    totalGames
  };
}

function getDailyStats() {
  let stats: Record<string, {games: number, score: number, time: number, success: number}> = {};
  if (typeof window !== 'undefined') {
    DIFFICULTIES.forEach(d => {
      const lb = JSON.parse(localStorage.getItem(`sb-leaderboard-${d.key}`) || '[]');
      lb.forEach((entry: any) => {
        if (!stats[entry.date]) stats[entry.date] = {games: 0, score: 0, time: 0, success: 0};
        stats[entry.date].games++;
        stats[entry.date].score += entry.score;
        stats[entry.date].time += entry.time;
        if (entry.score > 0) stats[entry.date].success++;
      });
    });
  }
  return stats;
}

function getStrengthsWeaknesses() {
  let sw: Record<string, {games: number, avgScore: number}> = {};
  if (typeof window !== 'undefined') {
    DIFFICULTIES.forEach(d => {
      const lb = JSON.parse(localStorage.getItem(`sb-leaderboard-${d.key}`) || '[]');
      if (lb.length === 0) return;
      const total = lb.reduce((acc: number, e: any) => acc + e.score, 0);
      sw[d.label] = {games: lb.length, avgScore: Math.round(total / lb.length)};
    });
  }
  return sw;
}

function getWeeklyStats() {
  let stats: Record<string, {games: number, score: number, time: number, success: number}> = {};
  if (typeof window !== 'undefined') {
    DIFFICULTIES.forEach(d => {
      const lb = JSON.parse(localStorage.getItem(`sb-leaderboard-${d.key}`) || '[]');
      lb.forEach((entry: any) => {
        const [y, m, d_] = entry.date.split('-');
        const date = new Date(Number(y), Number(m)-1, Number(d_));
        const week = `${date.getFullYear()}-W${Math.ceil((date.getDate() + 6 - date.getDay()) / 7)}`;
        if (!stats[week]) stats[week] = {games: 0, score: 0, time: 0, success: 0};
        stats[week].games++;
        stats[week].score += entry.score;
        stats[week].time += entry.time;
        if (entry.score > 0) stats[week].success++;
      });
    });
  }
  return stats;
}

function getMonthlyStats() {
  let stats: Record<string, {games: number, score: number, time: number, success: number}> = {};
  if (typeof window !== 'undefined') {
    DIFFICULTIES.forEach(d => {
      const lb = JSON.parse(localStorage.getItem(`sb-leaderboard-${d.key}`) || '[]');
      lb.forEach((entry: any) => {
        const [y, m] = entry.date.split('-');
        const month = `${y}-${m}`;
        if (!stats[month]) stats[month] = {games: 0, score: 0, time: 0, success: 0};
        stats[month].games++;
        stats[month].score += entry.score;
        stats[month].time += entry.time;
        if (entry.score > 0) stats[month].success++;
      });
    });
  }
  return stats;
}

// דמו: סוגי משפטים (בפועל תוכל להרחיב)
const SENTENCE_TYPES = [
  { key: 'statement', label: 'משפט רגיל' },
  { key: 'question', label: 'שאלה' },
  { key: 'negation', label: 'שלילה' },
  { key: 'verb', label: 'פועל' },
  { key: 'noun', label: 'שם עצם' },
];

function getMistakeStats() {
  // דמו: מחזיר מספר טעויות לכל סוג (בפועל תוכל להוסיף שדה type לכל שאלה)
  // כאן נשתמש בנתונים אקראיים לדוגמה
  return {
    statement: 2,
    question: 1,
    negation: 3,
    verb: 4,
    noun: 1,
  };
}

function BarChart({ data }: { data: {date: string, score: number}[] }) {
  const max = Math.max(...data.map(d => d.score), 1);
  return (
    <svg viewBox={`0 0 ${data.length * 40} 120`} width={data.length * 40} height={120} className="mx-auto">
      {data.map((d, i) => (
        <g key={d.date}>
          <rect x={i*40+8} y={120 - (d.score/max)*100 - 20} width={24} height={(d.score/max)*100} rx={6}
            fill="#2563eb" className="transition-all duration-500" />
          <text x={i*40+20} y={120-8} textAnchor="middle" fontSize="12" fill="#333">{d.date.slice(0,5)}</text>
          <text x={i*40+20} y={120 - (d.score/max)*100 - 28} textAnchor="middle" fontSize="12" fill="#2563eb" fontWeight="bold">{d.score}</text>
        </g>
      ))}
    </svg>
  );
}

function PieChart({ data }: { data: Record<string, number> }) {
  // דמו: גרף עוגה SVG פשוט
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  const colors = ['#2563eb', '#f59e42', '#e11d48', '#10b981', '#fbbf24'];
  return (
    <svg width={120} height={120} viewBox="0 0 120 120">
      {Object.entries(data).map(([k, v], i) => {
        const start = acc / total * 2 * Math.PI;
        acc += v;
        const end = acc / total * 2 * Math.PI;
        const x1 = 60 + 50 * Math.sin(start);
        const y1 = 60 - 50 * Math.cos(start);
        const x2 = 60 + 50 * Math.sin(end);
        const y2 = 60 - 50 * Math.cos(end);
        const large = end - start > Math.PI ? 1 : 0;
        return (
          <path key={k} d={`M60,60 L${x1},${y1} A50,50 0 ${large} 1 ${x2},${y2} Z`} fill={colors[i % colors.length]} />
        );
      })}
    </svg>
  );
}

function getAchievements(stats: any, dailyStats: any, sw: any) {
  const achievements = [];
  if (stats.totalGames >= 10) achievements.push({icon:'🏅', label:'שיחקת 10 משחקים!'});
  if (Number(stats.successRate) === 100 && stats.totalGames > 0) achievements.push({icon:'🌟', label:'100% הצלחה!'});
  if (Object.values(dailyStats).some((d:any)=>d.score>=500)) achievements.push({icon:'🔥', label:'שיא יומי: 500+ נק׳'});
  if (Object.values(sw).some((d:any)=>d.avgScore>120)) achievements.push({icon:'🚀', label:'שיפור מרשים ברמה גבוהה!'});
  return achievements;
}

function getDuelStats(name: string) {
  if (!name) return { games: 0, wins: 0, totalScore: 0 };
  if (typeof window !== 'undefined') {
    try {
      return JSON.parse(localStorage.getItem('duel-stats-' + name) || '{"games":0,"wins":0,"totalScore":0}');
    } catch {
      return { games: 0, wins: 0, totalScore: 0 };
    }
  }
  return { games: 0, wins: 0, totalScore: 0 };
}

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [img, setImg] = useState('');
  const [stats, setStats] = useState(getStats());
  const [dailyStats, setDailyStats] = useState(getDailyStats());
  const [sw, setSW] = useState(getStrengthsWeaknesses());
  const [view, setView] = useState<'daily'|'weekly'|'monthly'>('daily');
  const [weeklyStats, setWeeklyStats] = useState(getWeeklyStats());
  const [monthlyStats, setMonthlyStats] = useState(getMonthlyStats());
  const [mistakeStats, setMistakeStats] = useState(getMistakeStats());
  const [duelStats, setDuelStats] = useState(getDuelStats(name));
  const [level, setLevel] = useState<'easy'|'medium'|'hard'>('easy');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setName(localStorage.getItem('sb-playerName') || '');
      setImg(localStorage.getItem('sb-playerImg') || '');
      setStats(getStats());
      setDailyStats(getDailyStats());
      setSW(getStrengthsWeaknesses());
      setWeeklyStats(getWeeklyStats());
      setMonthlyStats(getMonthlyStats());
      setMistakeStats(getMistakeStats());
      setDuelStats(getDuelStats(name));
      // דוגמה: קביעת רמה לפי ממוצע ניקוד
      const avg = Number(getStats().avgScore);
      if (avg >= 120) setLevel('hard');
      else if (avg >= 80) setLevel('medium');
      else setLevel('easy');
    }
  }, []);

  const handleImg = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result as string);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sb-playerImg', reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const achievements = getAchievements(stats, dailyStats, sw);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-400 via-green-200 to-blue-700 flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full mx-auto bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 text-center mb-6 drop-shadow-lg">הפרופיל שלי</h1>
        <div className="flex items-center gap-3 mb-4">
          {img && <img src={img} alt="avatar" className="w-12 h-12 rounded-full border-2 border-blue-400" />}
          <span className="text-2xl font-bold text-blue-700">{name}</span>
          <span className="text-3xl" title={DIFFICULTIES.find(d=>d.key===level)?.label}>{LEVEL_ICONS[level]}</span>
          <span className="text-lg font-bold text-gray-600">({DIFFICULTIES.find(d=>d.key===level)?.label})</span>
          <label className="ml-2 cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded font-bold text-sm shadow">
            העלה תמונה
            <input type="file" accept="image/*" onChange={handleImg} className="hidden" />
          </label>
        </div>
        <div className="w-full mb-6">
          <div className="text-lg font-bold text-gray-700 mb-2">הסטטיסטיקות שלך:</div>
          <div className="flex flex-col gap-2 items-center">
            <span>משחקים ששיחקת: <b>{stats.totalGames}</b></span>
            <span>ניקוד ממוצע: <b>{stats.avgScore}</b></span>
            <span>אחוזי הצלחה: <b>{stats.successRate}%</b></span>
            <span>זמן ממוצע: <b>{stats.avgTime} שנ׳</b></span>
          </div>
        </div>
        {/* סטטיסטיקות יומיות/שבועיות/חודשיות */}
        <div className="w-full mb-6">
          <div className="flex gap-2 mb-2">
            <button onClick={()=>setView('daily')} className={`px-3 py-1 rounded font-bold ${view==='daily'?'bg-blue-600 text-white':'bg-blue-100 text-blue-700'}`}>יומי</button>
            <button onClick={()=>setView('weekly')} className={`px-3 py-1 rounded font-bold ${view==='weekly'?'bg-blue-600 text-white':'bg-blue-100 text-blue-700'}`}>שבועי</button>
            <button onClick={()=>setView('monthly')} className={`px-3 py-1 rounded font-bold ${view==='monthly'?'bg-blue-600 text-white':'bg-blue-100 text-blue-700'}`}>חודשי</button>
          </div>
          <div className="overflow-x-auto">
            {view==='daily' && (
              <>
                <table className="w-full text-center border-separate border-spacing-y-1 mb-4">
                  <thead>
                    <tr className="bg-blue-100">
                      <th>תאריך</th>
                      <th>משחקים</th>
                      <th>ניקוד</th>
                      <th>הצלחה</th>
                      <th>זמן (ש׳)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(dailyStats).length === 0 && (
                      <tr><td colSpan={5} className="text-gray-400 py-2">אין נתונים</td></tr>
                    )}
                    {Object.entries(dailyStats).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,7).map(([date, d]) => (
                      <tr key={date} className="bg-blue-50">
                        <td>{date}</td>
                        <td>{d.games}</td>
                        <td>{d.score}</td>
                        <td>{d.success}</td>
                        <td>{d.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {Object.keys(dailyStats).length > 0 && (
                  <BarChart data={Object.entries(dailyStats).sort((a,b)=>a[0].localeCompare(b[0])).slice(-7).map(([date, d]) => ({date, score: d.score}))} />
                )}
              </>
            )}
            {view==='weekly' && (
              <>
                <table className="w-full text-center border-separate border-spacing-y-1 mb-4">
                  <thead>
                    <tr className="bg-blue-100">
                      <th>שבוע</th>
                      <th>משחקים</th>
                      <th>ניקוד</th>
                      <th>הצלחה</th>
                      <th>זמן (ש׳)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(weeklyStats).length === 0 && (
                      <tr><td colSpan={5} className="text-gray-400 py-2">אין נתונים</td></tr>
                    )}
                    {Object.entries(weeklyStats).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,7).map(([week, d]) => (
                      <tr key={week} className="bg-blue-50">
                        <td>{week}</td>
                        <td>{d.games}</td>
                        <td>{d.score}</td>
                        <td>{d.success}</td>
                        <td>{d.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {Object.keys(weeklyStats).length > 0 && (
                  <BarChart data={Object.entries(weeklyStats).sort((a,b)=>a[0].localeCompare(b[0])).slice(-7).map(([week, d]) => ({date: week, score: d.score}))} />
                )}
              </>
            )}
            {view==='monthly' && (
              <>
                <table className="w-full text-center border-separate border-spacing-y-1 mb-4">
                  <thead>
                    <tr className="bg-blue-100">
                      <th>חודש</th>
                      <th>משחקים</th>
                      <th>ניקוד</th>
                      <th>הצלחה</th>
                      <th>זמן (ש׳)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(monthlyStats).length === 0 && (
                      <tr><td colSpan={5} className="text-gray-400 py-2">אין נתונים</td></tr>
                    )}
                    {Object.entries(monthlyStats).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,7).map(([month, d]) => (
                      <tr key={month} className="bg-blue-50">
                        <td>{month}</td>
                        <td>{d.games}</td>
                        <td>{d.score}</td>
                        <td>{d.success}</td>
                        <td>{d.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {Object.keys(monthlyStats).length > 0 && (
                  <BarChart data={Object.entries(monthlyStats).sort((a,b)=>a[0].localeCompare(b[0])).slice(-7).map(([month, d]) => ({date: month, score: d.score}))} />
                )}
              </>
            )}
          </div>
        </div>
        {/* דוח טעויות לפי סוגי משפטים */}
        <div className="w-full mb-6">
          <div className="text-lg font-bold text-gray-700 mb-2">דוח טעויות לפי סוגי משפטים:</div>
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <PieChart data={mistakeStats} />
            <ul className="flex flex-col gap-1">
              {SENTENCE_TYPES.map(t => (
                <li key={t.key} className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{background: ['#2563eb','#f59e42','#e11d48','#10b981','#fbbf24'][SENTENCE_TYPES.findIndex(x=>x.key===t.key)%5]}}></span>
                  <span>{t.label}: <b>{(mistakeStats as any)[t.key] || 0}</b></span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* חוזקות וחולשות */}
        <div className="w-full mb-6">
          <div className="text-lg font-bold text-gray-700 mb-2">חוזקות וחולשות לפי רמה:</div>
          <div className="flex flex-wrap gap-4 justify-center">
            {Object.entries(sw).map(([level, d]) => (
              <div key={level} className={`rounded-xl px-4 py-2 font-bold shadow text-lg ${d.avgScore > 120 ? 'bg-green-200 text-green-900' : d.avgScore > 80 ? 'bg-yellow-100 text-yellow-900' : 'bg-red-100 text-red-900'}`}>
                {level}: {d.avgScore} נק׳ בממוצע ({d.games} משחקים)
              </div>
            ))}
            {Object.keys(sw).length === 0 && <span className="text-gray-400">אין מספיק נתונים</span>}
          </div>
        </div>
        {/* הישגים/תגים */}
        <div className="w-full mb-6">
          <div className="text-lg font-bold text-gray-700 mb-2">הישגים:</div>
          <div className="flex flex-wrap gap-4 items-center justify-center">
            {achievements.length === 0 && <span className="text-gray-400">עוד לא הושגו תגיות</span>}
            {achievements.map((a, i) => (
              <div key={i} className="flex items-center gap-2 bg-gradient-to-r from-blue-200 to-green-200 px-4 py-2 rounded-xl shadow font-bold text-lg">
                <span className="text-2xl">{a.icon}</span> {a.label}
              </div>
            ))}
          </div>
        </div>
        <div className="w-full mb-6">
          <div className="text-lg font-bold text-purple-700 mb-2 flex items-center gap-2"><span className="text-2xl">⚔️</span> סטטיסטיקות קרב זוגי</div>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl p-6 shadow-xl w-full max-w-xs flex flex-col items-center border-2 border-purple-400">
              <div className="font-bold text-xl text-purple-800 mb-2">{name || 'שחקן'}</div>
              <div className="text-md text-gray-700">משחקים: <b>{duelStats.games}</b></div>
              <div className="text-md text-green-700">ניצחונות: <b>{duelStats.wins}</b></div>
              <div className="text-md text-yellow-700">ממוצע ניקוד: <b>{duelStats.games ? Math.round(duelStats.totalScore/duelStats.games) : 0}</b></div>
              <div className="text-md text-pink-700">אחוזי הצלחה: <b>{duelStats.games ? Math.round(100*duelStats.wins/duelStats.games) : 0}%</b></div>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <a href="/games/sentence-builder" className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-2 rounded-full text-lg font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200">חזרה למשחק</a>
          <a href="/games/sentence-builder/leaderboard" className="bg-gradient-to-r from-blue-400 to-green-500 text-white px-6 py-2 rounded-full text-lg font-bold shadow-lg hover:from-green-500 hover:to-blue-400 transition-all duration-200">לוח מובילים</a>
        </div>
      </div>
    </main>
  );
} 