// Função utilitária para formatar datas como dd/mm/yyyy
function formatDate(d) {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

// Calcula a data da Páscoa (domingo) para um ano (algoritmo de Meeus)
function easterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=Mar,4=Apr
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

// Retorna uma lista de feriados (strings dd/mm/yyyy) para um ano específico
function buildHolidaysForYear(year) {
    const holidays = [];

    // Datas fixas
    holidays.push(`01/01/${year}`); // Ano Novo
    holidays.push(`21/04/${year}`); // Tiradentes
    holidays.push(`01/05/${year}`); // Dia do Trabalho
    holidays.push(`09/07/${year}`); // Revolução Constitucionalista (SP)
    holidays.push(`07/09/${year}`); // Independência do Brasil
    holidays.push(`12/10/${year}`); // Nossa Senhora Aparecida
    holidays.push(`02/11/${year}`); // Finados
    holidays.push(`15/11/${year}`); // Proclamação da República
    holidays.push(`20/11/${year}`); // Consciência Negra (SP)
    holidays.push(`25/12/${year}`); // Natal

    // Feriados móveis: Páscoa, Sexta-feira Santa, Carnaval (terça-feira), Corpus Christi
    const easter = easterSunday(year);

    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2);

    const carnival = new Date(easter);
    carnival.setDate(easter.getDate() - 47); // Terça-feira de Carnaval (47 dias antes)

    const corpusChristi = new Date(easter);
    corpusChristi.setDate(easter.getDate() + 60);

    holidays.push(formatDate(carnival));
    holidays.push(formatDate(goodFriday));
    holidays.push(formatDate(corpusChristi));

    return holidays;
}

// Função para obter o nome do feriado
function getHolidayName(dateStr) {
    const [, , yearStr] = dateStr.split('/');
    const year = parseInt(yearStr, 10);

    const fixedMap = {
        [`01/01/${year}`]: 'Ano Novo',
        [`21/04/${year}`]: 'Tiradentes',
        [`01/05/${year}`]: 'Dia do Trabalho',
        [`09/07/${year}`]: 'Revolução Constitucionalista',
        [`07/09/${year}`]: 'Independência do Brasil',
        [`12/10/${year}`]: 'Nossa Senhora Aparecida',
        [`02/11/${year}`]: 'Finados',
        [`15/11/${year}`]: 'Proclamação da República',
        [`20/11/${year}`]: 'Consciência Negra',
        [`25/12/${year}`]: 'Natal'
    };

    if (fixedMap[dateStr]) return fixedMap[dateStr];

    // Verificar feriados móveis
    const easter = easterSunday(year);
    const gf = new Date(easter); gf.setDate(easter.getDate() - 2);
    const carnival = new Date(easter); carnival.setDate(easter.getDate() - 47);
    const corpus = new Date(easter); corpus.setDate(easter.getDate() + 60);

    if (formatDate(gf) === dateStr) return 'Sexta-feira Santa';
    if (formatDate(carnival) === dateStr) return 'Carnaval';
    if (formatDate(corpus) === dateStr) return 'Corpus Christi';

    return 'Feriado';
}

// Mapeamento de meses
const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Dias da semana
const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const weekdaysFull = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

// Rótulo, ícones e classe CSS (styles.css) por tipo de turno
const shiftStyles = {
    morning: { label: 'Manhã', plural: 'manhãs', icon: '☀️', bi: 'bi-sun-fill', cls: 'shift-morning' },
    night:   { label: 'Noite', plural: 'noites', icon: '🌙', bi: 'bi-moon-stars-fill', cls: 'shift-night' },
    off:     { label: 'Folga', plural: 'folgas', icon: '🌿', bi: 'bi-tree-fill', cls: 'shift-off' }
};

// Padrão da escala: 4 manhãs, 2 noites, 4 folgas
const scalePattern = ['morning', 'morning', 'morning', 'morning', 'night', 'night', 'off', 'off', 'off', 'off'];
const msPerDay = 1000 * 60 * 60 * 24;

// Posição de uma data no ciclo de 10 dias (âncora: 26/05/2025 == 1ª manhã)
function getCycleIndex(date) {
    const reference = Date.UTC(2025, 4, 26);
    const target = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const diff = Math.round((target - reference) / msPerDay);
    const len = scalePattern.length;
    return ((diff % len) + len) % len;
}

// Retorna o turno de uma data qualquer
function getShift(date) {
    return scalePattern[getCycleIndex(date)];
}

// Ex.: "2º dia de 4 manhãs"
function getCycleText(date) {
    const index = getCycleIndex(date);
    const shift = scalePattern[index];
    const first = scalePattern.indexOf(shift);
    const total = scalePattern.filter(s => s === shift).length;
    return `${index - first + 1}º dia de ${total} ${shiftStyles[shift].plural}`;
}

// Converte "dd/mm/yyyy" em Date
function parseDateStr(dateStr) {
    const [d, m, y] = dateStr.split('/').map(Number);
    return new Date(y, m - 1, d);
}

// Função para criar o calendário
function createCalendar(targetYear = 2026) {
    const calendarContainer = document.getElementById('calendar');
    calendarContainer.innerHTML = '';

    const holidays = buildHolidaysForYear(targetYear);
    const today = new Date();
    const counts = { morning: 0, night: 0, off: 0, holidayWork: 0 };

    for (let month = 0; month < 12; month++) {
        const isCurrentMonth = today.getFullYear() === targetYear && today.getMonth() === month;

        // Coluna do grid do Bootstrap + cartão do mês
        const col = document.createElement('div');
        col.className = 'col';
        if (isCurrentMonth) col.id = 'currentMonth';

        const monthDiv = document.createElement('article');
        monthDiv.className = 'card month-card h-100 border-0 shadow-sm p-3' + (isCurrentMonth ? ' current' : '');
        col.appendChild(monthDiv);

        const monthTitle = document.createElement('h2');
        monthTitle.className = 'h6 fw-bold mb-3 d-flex align-items-center justify-content-between';
        monthTitle.innerHTML = `<span>${months[month]}</span>` +
            (isCurrentMonth ? '<span class="badge rounded-pill text-bg-primary">Mês atual</span>' : '');
        monthDiv.appendChild(monthTitle);

        const daysHeader = document.createElement('div');
        daysHeader.className = 'week-header';
        daysHeader.setAttribute('aria-hidden', 'true');
        weekdays.forEach((day, i) => {
            const dayHeader = document.createElement('div');
            if (i === 0 || i === 6) dayHeader.className = 'weekend';
            dayHeader.textContent = day;
            daysHeader.appendChild(dayHeader);
        });
        monthDiv.appendChild(daysHeader);

        const daysGrid = document.createElement('div');
        daysGrid.className = 'days-grid';

        const firstDay = new Date(targetYear, month, 1).getDay();
        const daysInMonth = new Date(targetYear, month + 1, 0).getDate();
        const monthHolidays = [];

        for (let i = 0; i < firstDay; i++) {
            daysGrid.appendChild(document.createElement('div'));
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(targetYear, month, day);
            const dateStr = formatDate(date);
            const isHoliday = holidays.includes(dateStr);
            const shift = getShift(date);
            const style = shiftStyles[shift];
            const isToday = isCurrentMonth && today.getDate() === day;

            counts[shift]++;
            if (isHoliday && shift !== 'off') counts.holidayWork++;

            // Cada dia é um botão: funciona com toque, clique e teclado
            const dayBtn = document.createElement('button');
            dayBtn.type = 'button';
            dayBtn.className = `day ${style.cls}` + (isToday ? ' today' : '');
            dayBtn.dataset.date = dateStr;
            dayBtn.textContent = day;

            let label = `${day} de ${months[month]}, ${style.label}`;
            if (isHoliday) {
                const name = getHolidayName(dateStr);
                label += `, feriado: ${name}`;
                monthHolidays.push({ day, dateStr, name, style });

                const badge = document.createElement('span');
                badge.className = 'holiday-badge';
                badge.setAttribute('aria-hidden', 'true');
                badge.textContent = 'F';
                dayBtn.appendChild(badge);
            }
            if (isToday) {
                label += ', hoje';
                dayBtn.setAttribute('aria-current', 'date');
            }
            dayBtn.title = label;
            dayBtn.setAttribute('aria-label', label);

            daysGrid.appendChild(dayBtn);
        }

        monthDiv.appendChild(daysGrid);

        // Feriados do mês listados por escrito (não depende de passar o mouse)
        if (monthHolidays.length) {
            const list = document.createElement('ul');
            list.className = 'holiday-list';
            monthHolidays.forEach(h => {
                const li = document.createElement('li');
                li.innerHTML =
                    `<button type="button" data-date="${h.dateStr}">` +
                    `<span class="holiday-day">${h.day}</span>` +
                    `<span class="holiday-name">${h.name}</span>` +
                    `<span class="holiday-shift ${h.style.cls}">${h.style.label}</span>` +
                    `</button>`;
                list.appendChild(li);
            });
            monthDiv.appendChild(list);
        }

        calendarContainer.appendChild(col);
    }

    document.getElementById('countMorning').textContent = counts.morning;
    document.getElementById('countNight').textContent = counts.night;
    document.getElementById('countOff').textContent = counts.off;
    document.getElementById('countHolidayWork').textContent = counts.holidayWork;
}

// Abre a janela com os detalhes de um dia
function showDayDetails(dateStr) {
    const date = parseDateStr(dateStr);
    const shift = getShift(date);
    const style = shiftStyles[shift];
    const isHoliday = buildHolidaysForYear(date.getFullYear()).includes(dateStr);

    document.getElementById('dayModalWeekday').textContent =
        weekdaysFull[date.getDay()] + (formatDate(new Date()) === dateStr ? ' · Hoje' : '');
    document.getElementById('dayModalTitle').textContent =
        `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;

    const shiftBox = document.getElementById('dayModalShift');
    shiftBox.className = `day-detail-shift ${style.cls}`;
    shiftBox.innerHTML = `<i class="bi ${style.bi}"></i><div>${style.label}<small>${getCycleText(date)}</small></div>`;

    const holidayBox = document.getElementById('dayModalHoliday');
    if (isHoliday) {
        holidayBox.innerHTML = `<i class="bi bi-flag-fill"></i><div><strong>Feriado:</strong> ${getHolidayName(dateStr)}</div>`;
        holidayBox.classList.remove('d-none');
    } else {
        holidayBox.classList.add('d-none');
    }

    // Os 7 dias seguintes
    const next = document.getElementById('dayModalNext');
    next.innerHTML = '';
    for (let i = 1; i <= 7; i++) {
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() + i);
        const s = shiftStyles[getShift(d)];
        const ds = formatDate(d);
        const hol = buildHolidaysForYear(d.getFullYear()).includes(ds);
        const cell = document.createElement('div');
        cell.className = `next-day ${s.cls}`;
        cell.title = `${ds} · ${s.label}` + (hol ? ` · ${getHolidayName(ds)}` : '');
        cell.innerHTML = `<span>${weekdays[d.getDay()]}</span><strong>${d.getDate()}</strong><i class="bi ${s.bi}"></i>` +
            (hol ? '<span class="holiday-badge" aria-hidden="true">F</span>' : '');
        next.appendChild(cell);
    }

    bootstrap.Modal.getOrCreateInstance(document.getElementById('dayModal')).show();
}

// Atualiza o cartão "Hoje"
function updateTodayCard() {
    const today = new Date();
    const style = shiftStyles[getShift(today)];
    const dateStr = formatDate(today);
    const isHoliday = buildHolidaysForYear(today.getFullYear()).includes(dateStr);

    const icon = document.getElementById('todayIcon');
    icon.textContent = style.icon;
    icon.className = `stat-icon ${style.cls}`;
    document.getElementById('todayLabel').textContent = style.label;
    document.getElementById('todayDate').textContent =
        `${dateStr} · ${getCycleText(today)}` + (isHoliday ? ` · ${getHolidayName(dateStr)}` : '');
}

// ---------- Tema claro / escuro ----------
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

function readThemePref() {
    try {
        const v = localStorage.getItem('theme');
        if (v === 'light' || v === 'dark') return v;
    } catch (e) { /* armazenamento indisponível */ }
    return 'auto';
}

function applyTheme(pref) {
    const dark = pref === 'dark' || (pref === 'auto' && darkQuery.matches);
    document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme-pref', pref);

    const sw = document.querySelector('.theme-switch');
    sw.dataset.active = pref;
    sw.querySelectorAll('button').forEach(b => {
        const on = b.dataset.themeValue === pref;
        b.setAttribute('aria-checked', on);
        b.tabIndex = on ? 0 : -1;
    });
}

function setupThemeSwitch() {
    const sw = document.querySelector('.theme-switch');
    const buttons = [...sw.querySelectorAll('button')];

    function choose(pref, focus) {
        try { localStorage.setItem('theme', pref); } catch (e) { /* ignora */ }
        applyTheme(pref);
        if (focus) sw.querySelector(`[data-theme-value="${pref}"]`).focus();
    }

    buttons.forEach(b => b.addEventListener('click', () => choose(b.dataset.themeValue)));

    // Setas do teclado alternam entre as opções (padrão de radiogroup)
    sw.addEventListener('keydown', e => {
        const i = buttons.findIndex(b => b.getAttribute('aria-checked') === 'true');
        let n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % buttons.length;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + buttons.length) % buttons.length;
        if (n !== null) {
            e.preventDefault();
            choose(buttons[n].dataset.themeValue, true);
        }
    });

    // No modo "Auto", acompanha a troca de tema do sistema
    darkQuery.addEventListener('change', () => {
        if (readThemePref() === 'auto') applyTheme('auto');
    });

    applyTheme(readThemePref());
}

// Popula o seletor de ano e cria o calendário quando a página carregar
window.onload = function() {
    const startYear = 2024;
    const endYear = 2030;
    const select = document.getElementById('yearSelect');
    const displayYear = document.getElementById('displayYear');
    const prevBtn = document.getElementById('prevYear');
    const nextBtn = document.getElementById('nextYear');
    const todayBtn = document.getElementById('todayBtn');

    setupThemeSwitch();

    for (let y = startYear; y <= endYear; y++) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        select.appendChild(opt);
    }

    function setYear(y) {
        select.value = y;
        displayYear.textContent = y;
        document.title = `Escala Segurança Metrô SP - ${y}`;
        prevBtn.disabled = y <= startYear;
        nextBtn.disabled = y >= endYear;
        createCalendar(y);
    }

    // Ano atual se estiver no intervalo, senão 2026
    const currentYear = new Date().getFullYear();
    const defaultYear = currentYear >= startYear && currentYear <= endYear ? currentYear : 2026;

    updateTodayCard();
    setYear(defaultYear);

    select.addEventListener('change', () => setYear(parseInt(select.value, 10)));
    prevBtn.addEventListener('click', () => setYear(parseInt(select.value, 10) - 1));
    nextBtn.addEventListener('click', () => setYear(parseInt(select.value, 10) + 1));
    todayBtn.addEventListener('click', () => {
        const y = new Date().getFullYear();
        if (y >= startYear && y <= endYear && parseInt(select.value, 10) !== y) setYear(y);
        const el = document.getElementById('currentMonth');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Clique/toque em um dia ou em um feriado da lista abre os detalhes
    document.getElementById('calendar').addEventListener('click', e => {
        const target = e.target.closest('[data-date]');
        if (target) showDayDetails(target.dataset.date);
    });
    document.getElementById('todayCard').addEventListener('click', () => showDayDetails(formatDate(new Date())));
};
