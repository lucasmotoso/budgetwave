// app.js — BudgetWave (retrowave-ready: toasts, chart empty-state, categorias em grid)

const App = (() => {
  // ---------- Utils ----------
  const $  = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => [...el.querySelectorAll(s)];

  const BRL = new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' });
  const fmtBRL = (n) => BRL.format(Number(n || 0));
// Gera cor viva a partir de string (fallback para categorias sem color)
function colorFromString(str, s = 65, l = 55) {
  str = String(str || '');
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  h = h % 360;
  // HSL -> HEX rápido
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const a = s / 100 * Math.min(l / 100, 1 - l / 100);
    const c = l / 100 - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

  // Toast helper (usa skins do main.css)
  const toast = (text, type='info') => {
    if (!window.Toastify) { console.log(`[${type}]`, text); return; }
    const cls = type === 'success' ? 'tw-success'
              : type === 'error'   ? 'tw-error'
              : type === 'warn'    ? 'tw-warn'
              : 'tw-info';
    Toastify({
      text, duration: 2800, gravity: 'top', position: 'right', close: true,
      className: cls
    }).showToast();
  };

  // "1.234,56" -> 1234.56
  const parseBR = (v) => {
    if (typeof v === 'number') return v;
    v = (v ?? '').toString().trim().replace(/\./g,'').replace(',', '.');
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const ymKey = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  const uid   = () => Math.random().toString(36).slice(2);

  // ---------- Estado ----------
  const LS_KEY = 'budgetwave_v1';

  const seedCats = [
    { id:'c1', name:'Alimentação', color:'#ef4444' },
    { id:'c2', name:'Transporte',  color:'#3b82f6' },
    { id:'c3', name:'Moradia',     color:'#10b981' },
    { id:'c4', name:'Lazer',       color:'#f59e0b' },
    { id:'c5', name:'Saúde',       color:'#22c55e' },
    { id:'c6', name:'Educação',    color:'#8b5cf6' },
    { id:'c7', name:'Mercado',     color:'#14b8a6' },
    { id:'c8', name:'Renda',       color:'#eab308' }
  ];

  const defaultState = () => ({
    theme: document.documentElement.getAttribute('data-theme') || 'light',
    salary: 0,
    categories: seedCats.slice(),
    profile: { Alimentação:18, Mercado:15, Moradia:30, Transporte:10, Saúde:8, Educação:7, Lazer:12 },
    transactions: [] // {id, date:'YYYY-MM-DD', desc, categoryId, type:'income'|'expense', amount:number}
  });

  const load = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || defaultState(); }
    catch { return defaultState(); }
  };
  const save = () => localStorage.setItem(LS_KEY, JSON.stringify(state));
  let state = load();

  const byId = (id) => state.categories.find(c => c.id === id);

  // ---------- Tema ----------
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('bw:theme', state.theme);
    applyChartTheme();
    renderKpiDonut(); // garante que o donut repinte com as cores do tema
  }
  function initTheme() {
    $('#btn-theme')?.addEventListener('click', () => {
      state.theme = (state.theme === 'light') ? 'dark' : 'light';
      save(); applyTheme();
      toast(`Tema: ${state.theme === 'dark' ? 'escuro' : 'claro'}`, 'info');
    });
    applyTheme();
  }

  // ---------- Domínio ----------
  const currentMonthTx = () => state.transactions.filter(t => (t.date || '').slice(0,7) === ymKey());
  function monthTotals(){
    const txs = currentMonthTx();
    const income  = txs.filter(t=>t.type==='income' ).reduce((s,t)=>s+t.amount,0);
    const expense = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
    return { income, expense, balance: income - expense };
  }
  function computeGoals(){
    const salary  = Number(state.salary || 0);
    const reserve = salary * 0.10;
    const pool    = Math.max(salary - reserve, 0);
    const weights = state.profile;
    const total   = Object.values(weights).reduce((a,b)=>a+b,0) || 90;
    const goals   = {};
    Object.entries(weights).forEach(([name,w]) => goals[name] = pool * (w/total));
    return { reserve, pool, goals };
  }

  // ---------- KPIs ----------
  function renderKPIs(){
    const { income, expense, balance } = monthTotals();
    const set = (id, val) => { const el = $(id); if (el) el.textContent = fmtBRL(val); };
    set('#kpi-income', income);
    set('#kpi-expense', expense);
    set('#kpi-balance', balance);
  }

  // ---------- Perfil (sliders) ----------
  function renderSliders(){
    const box = $('#sliders'); if (!box) return;
    box.innerHTML = '';
    const frag = document.createDocumentFragment();
    let sum = 0;
    for (const name of Object.keys(state.profile)){
      const val = state.profile[name] ?? 0; sum += val;
      const row = document.createElement('div');
      row.className = 'field-row';
      row.innerHTML = `
        <label class="w-2">${name}</label>
        <input type="range" min="0" max="50" step="1" value="${val}" data-name="${name}" aria-label="Percentual para ${name}">
        <span class="w-1 right" data-out="${name}">${val}%</span>
        <span class="w-2 right muted" data-out-money="${name}">—</span>
      `;
      frag.appendChild(row);
    }
    box.appendChild(frag);
    const sumEl = $('#profile-sum'); if (sumEl) sumEl.textContent = `Soma atual: ${sum}% (deve somar ~90%)`;

    // listeners
    box.querySelectorAll('input[type=range]').forEach(sl=>{
      sl.addEventListener('input', ()=>{
        const name = sl.dataset.name; const v = Number(sl.value);
        state.profile[name] = v; save();
        const out = box.querySelector(`[data-out="${name}"]`); if (out) out.textContent = `${v}%`;
        updateGoalMoneyPreview();
      });
    });

    updateGoalMoneyPreview();
  }

  // ---------- Metas / Progresso ----------
  function makeGoalBar(goal, spent, color){
    const pct = goal>0 ? Math.min(100,(spent/goal)*100) : (spent>0 ? 100 : 0);
    const overPct = goal>0 ? Math.max(0,(spent/goal)*100 - 100) : (spent>0 ? 100 : 0);

    const el = document.createElement('div');
    el.className = 'goalbar' + (overPct>0 ? ' is-over' : '');
    el.setAttribute('role','progressbar');
    el.setAttribute('aria-valuemin','0');
    el.setAttribute('aria-valuemax','100');
    el.setAttribute('aria-valuenow', String(Math.round(pct)));

    const fill = document.createElement('span');
    fill.className = 'goalbar__fill';
    fill.style.width = `${pct}%`;
    fill.style.background = color || '#16a34a';

    const over = document.createElement('span');
    over.className = 'goalbar__over';
    over.style.width = `${Math.min(100,overPct)}%`;

    const label = document.createElement('span');
    label.className = 'goalbar__label';
    if (overPct>0){
      const diff = spent - goal;
      label.textContent = `${fmtBRL(spent)} de ${fmtBRL(goal)} • excedeu ${fmtBRL(diff)} (${Math.round((spent/goal)*100)}%)`;
    } else {
      const diff = Math.max(0, goal - spent);
      label.textContent = `${fmtBRL(spent)} de ${fmtBRL(goal)} • falta ${fmtBRL(diff)} (${Math.round(pct)}%)`;
    }

    el.append(fill, over, label);
    return el;
  }

  function renderGoalsTable(){
    const tbody = $('#goals-tbody'); if (!tbody) return;
    tbody.innerHTML = '';

    const { goals } = computeGoals();
    const txs = currentMonthTx().filter(t => t.type === 'expense');
    const spent = new Map();
    for (const t of txs) spent.set(t.categoryId, (spent.get(t.categoryId)||0) + t.amount);

    const cats = state.categories
      .filter(c => c.name !== 'Renda')
      .slice()
      .sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));

    for (const c of cats){
      const g = goals[c.name] || 0;
      const s = spent.get(c.id) || 0;
      const weight = state.profile[c.name] ?? 0;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="cat"><span class="badge" style="background:${c.color}"></span>${c.name}</span></td>
        <td>${weight}%</td>
        <td>${fmtBRL(g)}</td>
        <td></td>
      `;
      tr.children[3].appendChild(makeGoalBar(g, s, c.color));
      tbody.appendChild(tr);
    }
  }

  function updateReserveAndPool(){
    const { reserve, pool } = computeGoals();
    const r = $('#reserve-amount'); if (r) r.textContent = fmtBRL(reserve);
    const p = $('#pool-amount');    if (p) p.textContent = fmtBRL(pool);
  }

  function updateGoalMoneyPreview() {
    const { goals } = computeGoals();

    // previsão em R$ ao lado de cada slider
    for (const name of Object.keys(state.profile)) {
      const span = document.querySelector(`[data-out-money="${name}"]`);
      if (span) span.textContent = fmtBRL(goals[name] ?? 0);
    }

    // atualiza seção de metas/KPIs/gráfico
    updateReserveAndPool();
    renderGoalsTable();
    renderPie();
    renderKPIs();
    renderKpiDonut(); // mantém o donut sincronizado com KPIs
  }

  // ---------- Lançamentos ----------
  function hydrateCategorySelect(){
    const sel = $('#tx-category'); if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = `<option value="" disabled selected>Selecione…</option>`;
    state.categories.forEach(c => {
      const o = document.createElement('option');
      o.value = c.id; o.textContent = c.name;
      sel.appendChild(o);
    });
    if (prev && state.categories.some(c=>c.id===prev)) sel.value = prev;
  }

  function renderTxTable(){
    const tbody = $('#tx-tbody'); if (!tbody) return;
    tbody.innerHTML = '';
    const txs = currentMonthTx().sort((a,b)=> (a.date > b.date ? 1 : -1));
    for (const t of txs){
      const dateBR = (t.date || '').split('-').reverse().join('/');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${dateBR}</td>
        <td>${t.desc}</td>
        <td>${byId(t.categoryId)?.name || '—'}</td>
        <td>${t.type==='expense' ? 'Despesa' : 'Receita'}</td>
        <td class="num">${fmtBRL(t.amount)}</td>
         <td class="right">
    <button class="btn-delete" data-del="${t.id}" title="Excluir lançamento">
      Excluir
    </button>
  </td>
      `;
      tbody.appendChild(tr);
    }
  }

  function initTxForm(){
    const form = $('#tx-form'); if (!form) return;
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const date = $('#tx-date')?.value || (new Date().toISOString().slice(0,10));
      const desc = $('#tx-desc')?.value.trim();
      const categoryId = $('#tx-category')?.value;
      const type = $('#tx-type')?.value || 'expense';
      const amount = parseBR($('#tx-amount')?.value);

      if (!desc || !categoryId || !amount) { toast('Preencha descrição, categoria e valor.', 'error'); return; }

      state.transactions.push({ id: uid(), date, desc, categoryId, type, amount });
      save(); form.reset(); hydrateCategorySelect();
      refreshAll();
      toast('Lançamento adicionado!', 'success');
    });

    $('#tx-tbody')?.addEventListener('click', (e)=>{
      const id = e.target?.closest('button[data-del]')?.dataset.del;
      if (!id) return;
      state.transactions = state.transactions.filter(t => t.id !== id);
      save(); refreshAll();
      toast('Lançamento removido.', 'warn');
    });
  }

  // ---------- Chart.js ----------
  let pie;
  let kpiDonut = null; // <— NOVO: donut Receita x Despesa

function applyChartTheme(){
  if (!window.Chart) return;

  const cs   = getComputedStyle(document.documentElement);
  const text = (cs.getPropertyValue('--text')   || '#0b1220').trim();
  const grid = (cs.getPropertyValue('--border') || 'rgba(2,6,23,.12)').trim();
  const surf = (cs.getPropertyValue('--surface')|| 'rgba(255,255,255,.95)').trim();

  // cores padrão de linhas/labels
  window.Chart.defaults.color = text;
  window.Chart.defaults.borderColor = grid;

  // legenda e tooltip com contraste certo (light e dark)
  window.Chart.defaults.plugins = window.Chart.defaults.plugins || {};
  const plug = window.Chart.defaults.plugins;

  plug.legend = plug.legend || {};
  plug.legend.labels = plug.legend.labels || {};
  plug.legend.labels.color = text;

  plug.tooltip = plug.tooltip || {};
  plug.tooltip.backgroundColor = surf;   // fundo claro no light, glass no dark
  plug.tooltip.titleColor      = text;
  plug.tooltip.bodyColor       = text;
  plug.tooltip.borderColor     = grid;
  plug.tooltip.borderWidth     = 1;
  plug.tooltip.padding         = 10;

  // atualiza gráficos já criados
  if (pie) pie.update();
  if (kpiDonut) kpiDonut.update();
}


function renderPie() {
  const ctx = $('#pie');
  if (!ctx || !window.Chart) return;

  const txs = currentMonthTx().filter(t => t.type === 'expense');
  const byCat = new Map();
  for (const t of txs) byCat.set(t.categoryId, (byCat.get(t.categoryId) || 0) + t.amount);

  const entries = [...byCat.entries()];

  // empty state no card da direita
  const wrap = document.getElementById('cat-pie-wrap');
  if (wrap) wrap.dataset.chartEmpty = (entries.length === 0) ? "true" : "false";

  if (entries.length === 0) {
    if (pie) { pie.destroy(); pie = null; }
    return;
  }

  const labels = entries.map(([id]) => byId(id)?.name || id);
  const colors = entries.map(([id], i) => {
    const c = byId(id)?.color;
    return c || colorFromString(labels[i]); // <- nunca mais cai em cinza
  });
  const data = entries.map(([,v]) => v);

  // cor da legenda no tema
  const cs = getComputedStyle(document.documentElement);
  const legendColor = (cs.getPropertyValue('--text') || '#e5e7eb').trim();

  if (pie) pie.destroy();
  pie = new window.Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: 'transparent',
        borderWidth: 0,
        hoverBorderColor: 'transparent',
        hoverBorderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // <- não “estoura” no mobile
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: legendColor, boxWidth: 14, padding: 12 }
        }
      }
    }
  });
}


  // ===== NOVO: Donut Receita x Despesa (abaixo dos KPIs) =====
// === Donut: Receita × Despesa + Saldo (com legenda) ===
function renderKpiDonut() {
  const el = $('#kpi-donut');
  if (!el || !window.Chart) return;

  const { income, expense, balance } = monthTotals();
  const absBal = Math.abs(balance);
  const total  = income + expense + absBal;

  // empty state no card do donut
  const wrap = document.getElementById('kpi-donut-wrap');
  if (wrap) wrap.dataset.chartEmpty = total === 0 ? "true" : "false";
  if (total === 0) { if (kpiDonut) { kpiDonut.destroy(); kpiDonut = null; } return; }

  // cores do tema
  const cs   = getComputedStyle(document.documentElement);
  const ok   = (cs.getPropertyValue('--ok')     || '#22c55e').trim();  // Receita
  const err  = (cs.getPropertyValue('--danger') || '#ef4444').trim();  // Despesa
  const cyan = (cs.getPropertyValue('--cyan')   || '#06b6d4').trim();  // Saldo +
  const warn = (cs.getPropertyValue('--warn')   || '#f59e0b').trim();  // Saldo -

  const saldoColor = balance < 0 ? warn : cyan;
  const legendColor = (cs.getPropertyValue('--text') || '#e5e7eb').trim();

  // fatias (Saldo entra como valor absoluto; o sinal aparece no tooltip)
  const labels = ['Receita', 'Despesa', 'Saldo'];
  const data   = [income, expense, absBal];
  const colors = [ok, err, saldoColor];

  if (kpiDonut) kpiDonut.destroy();
  kpiDonut = new Chart(el, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data, backgroundColor: colors,
        borderWidth: 0, hoverBorderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: legendColor, boxWidth: 14, padding: 12 }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              let label = ctx.label;
              let val   = ctx.parsed;
              if (ctx.dataIndex === 2) { // saldo
                label = balance < 0 ? 'Saldo (negativo)' : 'Saldo';
                // exibe sinal no valor
                val = balance < 0 ? -val : val;
              }
              const pct = total ? Math.round((Math.abs(ctx.parsed) / total) * 100) : 0;
              return `${label}: ${fmtBRL(val)} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}



  // ---------- Categorias ----------
  function renderCats() {
    const box = $('#cats-list'); 
    if (!box) return;

    box.innerHTML = '';
    state.categories.forEach(c => {
      const el = document.createElement('div'); // container em linha
      el.className = 'row';
      el.innerHTML = `
        <span class="left"><span class="badge" style="background:${c.color}"></span>${c.name}</span>
        <button class="btn btn-ghost" data-delcat="${c.id}" title="Excluir">✖</button>
      `;
      box.appendChild(el);
    });
  }

  function initCats(){
    $('#btn-add-cat')?.addEventListener('click', ()=>{
      const name = $('#new-cat-name')?.value.trim();
      const color = $('#new-cat-color')?.value || '#14b8a6';
      if (!name) { toast('Informe o nome da categoria.', 'error'); return; }
      state.categories.push({ id: uid(), name, color });
      if (state.profile[name] == null) state.profile[name] = 5;
      $('#new-cat-name').value = '';
      save(); renderCats(); hydrateCategorySelect(); renderSliders(); refreshAll();
      toast('Categoria adicionada.', 'success');
    });

    $('#cats-list')?.addEventListener('click', (e)=>{
      const id = e.target?.closest('button[data-delcat]')?.dataset.delcat;
      if (!id) return;
      const cat = byId(id);
      state.categories = state.categories.filter(c=>c.id!==id);
      if (cat) delete state.profile[cat.name];
      save(); renderCats(); hydrateCategorySelect(); renderSliders(); refreshAll();
      toast('Categoria removida.', 'warn');
    });
  }

  // ---------- Refresh ----------
  function refreshAll(){
    hydrateCategorySelect();
    renderKPIs();
    renderTxTable();
    renderPie();
    renderGoalsTable();
    updateReserveAndPool();
    renderKpiDonut(); // <— NOVO: atualiza o donut junto
  }

  // ---------- Init ----------
  function init(){
    // mês corrente (reforço; já é setado no HTML inline)
    const cm = $('#current-month');
    if (cm && window.dayjs) cm.textContent = '• ' + dayjs().format('MMMM [de] YYYY');

    if (state.salary){
      const el = $('#salary'); if (el) el.value = state.salary.toString().replace('.', ',');
    }
    initTheme();
    renderSliders();
    initSalaryAndProfile();
    initTxForm();
    initCats();
    renderCats();
    hydrateCategorySelect();
    refreshAll();
  }

  // ligações dos botões de salário/perfil
  function initSalaryAndProfile() {
    $('#btn-save-salary')?.addEventListener('click', ()=>{
      const v = parseBR($('#salary')?.value);
      state.salary = v; save();
      updateGoalMoneyPreview(); renderKPIs();
      toast('Salário salvo.', 'success');
    });

    $('#btn-save-profile')?.addEventListener('click', ()=>{
      const sliders = $$('#sliders input[type=range]');
      let sum = sliders.reduce((s,el)=>s + Number(el.value), 0);
      if (sum === 0) { toast('Ajuste os sliders.', 'error'); return; }
      const factor = 90 / sum;
      sliders.forEach(el=>{
        const v = Math.round(Number(el.value) * factor);
        el.value = v;
        state.profile[el.dataset.name] = v;
      });
      save(); renderSliders();
      toast('Perfil normalizado para 90%.', 'success');
    });

    $('#btn-apply-goals')?.addEventListener('click', ()=>{
      updateGoalMoneyPreview();
      toast('Metas aplicadas.', 'info');
    });
  }

  return { init };
})();

// Boot
window.addEventListener('DOMContentLoaded', () => App.init());

// Parallax do fundo + estado "is-scrolled" na app bar
const __bw_parallax = () => {
  const y = window.scrollY || 0;
  document.documentElement.style.setProperty('--scrollY', String(y));
  const hdr = document.querySelector('.app-header');
  if (hdr) hdr.classList.toggle('is-scrolled', y > 8);
};
window.addEventListener('scroll', __bw_parallax, { passive:true });
__bw_parallax();
// Espaço dinâmico abaixo da app-bar (mede a altura real do header)
function __bw_setAppbarSpace(){
  const hdr = document.querySelector('.app-header');
  if (!hdr) return;
  const h = Math.round(hdr.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--appbar-height', `${h}px`);
}
window.addEventListener('load', __bw_setAppbarSpace);
window.addEventListener('resize', __bw_setAppbarSpace);
// se você usa "shrink" ao rolar, atualiza junto:
window.addEventListener('scroll', () => {
  // evita rodar toda hora; só recalcula quando muda o estado
  const hdr = document.querySelector('.app-header');
  if (!hdr) return;
  const flag = hdr.classList.contains('is-scrolled');
  if (flag !== __bw_setAppbarSpace.__lastFlag){
    __bw_setAppbarSpace.__lastFlag = flag;
    __bw_setAppbarSpace();
  }
}, { passive:true });


// ===== Sobre + GitHub (versão refinada) ===============================
const GH_USER = 'lucasmotoso';
const GH_MAX  = 6;

const $$ = (s, r=document) => r.querySelector(s);

function relTime(iso){
  const d = new Date(iso), now = new Date();
  const diff = Math.max(1, Math.round((now - d) / 86400000)); // dias
  if (diff < 1) return 'hoje';
  if (diff === 1) return 'ontem';
  if (diff < 7) return `há ${diff} dias`;
  const w = Math.round(diff/7);
  if (w < 5) return `há ${w} sem.`;
  const m = Math.round(diff/30);
  return m <= 1 ? 'há 1 mês' : `há ${m} meses`;
}

async function initAbout(){
  await Promise.all([loadGithubProfile(), loadGithubRepos()]);
}

async function loadGithubProfile(){
  try{
    const res = await fetch(`https://api.github.com/users/${GH_USER}`);
    if(!res.ok) return;
    const p = await res.json();
    const img = $$('#about-photo');
    if(img && !img.src) img.src = (window.ABOUT_PHOTO_URL || p.avatar_url);
  }catch(_){}
}

async function loadGithubRepos(){
  const grid = $$('#gh-projects'); if(!grid) return;

  try{
    const res = await fetch(
      `https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated`,
      { headers: { 'Accept': 'application/vnd.github+json' } }
    );
    if(!res.ok) throw new Error('GitHub API');

    const repos = await res.json();

    // filtra e ordena por atividade mais recente
    const list = repos
      .filter(r => !r.fork && !r.archived)
      .sort((a,b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, GH_MAX);

    grid.dataset.loading = 'false';
    grid.innerHTML = list.map(repoCard).join('');
  }catch(e){
    grid.dataset.loading = 'false';
    grid.innerHTML = `
      <div class="gh-empty">
        Não foi possível carregar agora. <br>
        <a href="https://github.com/${GH_USER}?tab=repositories" target="_blank" rel="noopener">
          Ver todos no GitHub</a>
      </div>`;
  }
}

function langDot(language){
  // cores simples para as linguagens mais comuns
  const map = {
    JavaScript:'#f1d55aff', TypeScript:'#3178c6', HTML:'#e34c26', CSS:'#a15eadff',
    Python:'#3572A5', Go:'#00ADD8', Shell:'#89e051', Java:'#b07219',
  };
  return `<span class="dot" style="background:${map[language]||'var(--cyan)'}"></span>`;
}

function repoCard(r){
  // pega até 2 tópicos como "chips"
  const topics = (r.topics || []).slice(0,2)
    .map(t => `<span class="tag">#${t}</span>`).join('');

  const lang = r.language
    ? `<span class="tag">${langDot(r.language)}${r.language}</span>`
    : '';

  const stars = r.stargazers_count
    ? `<span class="tag">★ ${r.stargazers_count}</span>` : '';

  return `
  <article class="gh-card">
    <header class="gh-card__title">
      <a href="${r.html_url}" target="_blank" rel="noopener">${r.name}</a>
    </header>

    <div>
      <p class="gh-card__desc">${r.description ?? 'Sem descrição.'}</p>
      <div class="gh-card__meta">
        ${lang} ${stars} ${topics}
        <span class="muted">Atualizado ${relTime(r.pushed_at)}</span>
      </div>
    </div>

    <div class="gh-card__actions">
      <a class="btn btn-ghost" href="${r.html_url}" target="_blank" rel="noopener">Abrir no GitHub</a>
    </div>
  </article>`;
}

// garanta que seja chamado no boot
try{ initAbout(); }catch(_){}
