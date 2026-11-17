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

// Mapeamento de meses
const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Dias da semana
const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Estilos (Tailwind) por tipo de turno
const shiftStyles = {
    morning: { label: 'Manhã', icon: '☀️', base: 'bg-orange-100 text-orange-900 ring-1 ring-inset ring-orange-200', hover: 'hover:bg-orange-200' },
    night:   { label: 'Noite', icon: '🌙', base: 'bg-sky-100 text-sky-900 ring-1 ring-inset ring-sky-200', hover: 'hover:bg-sky-200' },
    off:     { label: 'Folga', icon: '🌿', base: 'bg-emerald-100 text-emerald-900 ring-1 ring-inset ring-emerald-200', hover: 'hover:bg-emerald-200' }
};

// Padrão da escala: 4 manhãs, 2 noites, 4 folgas
const scalePattern = ['morning', 'morning', 'morning', 'morning', 'night', 'night', 'off', 'off', 'off', 'off'];
const msPerDay = 1000 * 60 * 60 * 24;

// Retorna o turno de uma data qualquer (âncora: 26/05/2025 == 1ª manhã)
function getShift(date) {
    const reference = Date.UTC(2025, 4, 26);
    const target = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const diff = Math.round((target - reference) / msPerDay);
    const len = scalePattern.length;
    return scalePattern[((diff % len) + len) % len];
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

        const monthDiv = document.createElement('article');
        monthDiv.className = 'rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md ' +
            (isCurrentMonth ? 'ring-2 ring-metro-500' : 'ring-1 ring-slate-200');
        if (isCurrentMonth) monthDiv.id = 'currentMonth';

        const monthTitle = document.createElement('h2');
        monthTitle.className = 'mb-3 flex items-center justify-between text-base font-bold text-slate-900';
        monthTitle.innerHTML = `<span>${months[month]}</span>` +
            (isCurrentMonth ? '<span class="rounded-full bg-metro-50 px-2 py-0.5 text-[11px] font-semibold text-metro-600">Mês atual</span>' : '');
        monthDiv.appendChild(monthTitle);

        const daysHeader = document.createElement('div');
        daysHeader.className = 'mb-1 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wide';
        weekdays.forEach((day, i) => {
            const dayHeader = document.createElement('div');
            dayHeader.className = (i === 0 || i === 6) ? 'text-rose-400' : 'text-slate-400';
            dayHeader.textContent = day;
            daysHeader.appendChild(dayHeader);
        });
        monthDiv.appendChild(daysHeader);

        const daysGrid = document.createElement('div');
        daysGrid.className = 'grid grid-cols-7 gap-1';

        const firstDay = new Date(targetYear, month, 1).getDay();
        const daysInMonth = new Date(targetYear, month + 1, 0).getDate();

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

            const dayDiv = document.createElement('div');
            dayDiv.className = `relative flex aspect-square cursor-default items-center justify-center rounded-lg text-sm font-medium tabular-nums transition ${style.base} ${style.hover}` +
                (isToday ? ' z-10 scale-110 font-extrabold shadow-md outline-2 outline-offset-1 outline-metro-500' : '');
            dayDiv.textContent = day;

            let title = `${dateStr} · ${style.label}`;
            if (isHoliday) {
                title += ` · ${getHolidayName(dateStr)}`;
                const badge = document.createElement('span');
                badge.className = 'absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow ring-2 ring-white';
                badge.textContent = 'F';
                dayDiv.appendChild(badge);
            }
            if (isToday) title += ' · Hoje';
            dayDiv.title = title;

            daysGrid.appendChild(dayDiv);
        }

        monthDiv.appendChild(daysGrid);
        calendarContainer.appendChild(monthDiv);
    }

    document.getElementById('countMorning').textContent = counts.morning;
    document.getElementById('countNight').textContent = counts.night;
    document.getElementById('countOff').textContent = counts.off;
    document.getElementById('countHolidayWork').textContent = counts.holidayWork;
}

// Atualiza o cartão "Hoje"
function updateTodayCard() {
    const today = new Date();
    const style = shiftStyles[getShift(today)];
    const dateStr = formatDate(today);
    const isHoliday = buildHolidaysForYear(today.getFullYear()).includes(dateStr);

    const icon = document.getElementById('todayIcon');
    icon.textContent = style.icon;
    icon.className = `grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl ${style.base}`;
    document.getElementById('todayLabel').textContent = style.label;
    document.getElementById('todayDate').textContent = dateStr + (isHoliday ? ` · ${getHolidayName(dateStr)}` : '');
}

// Função para obter o nome do feriado
function getHolidayName(dateStr) {
    const [day, month, yearStr] = dateStr.split('/');
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

// Popula o seletor de ano e cria o calendário quando a página carregar
window.onload = function() {
    const startYear = 2024;
    const endYear = 2030;
    const select = document.getElementById('yearSelect');
    const displayYear = document.getElementById('displayYear');
    const prevBtn = document.getElementById('prevYear');
    const nextBtn = document.getElementById('nextYear');
    const todayBtn = document.getElementById('todayBtn');

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
};
