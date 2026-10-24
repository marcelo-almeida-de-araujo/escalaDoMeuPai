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

// Função para criar o calendário
function createCalendar(targetYear = 2026) {
    const calendarContainer = document.getElementById('calendar');
    calendarContainer.innerHTML = '';

    // Padrão da escala: 4 manhãs, 2 noites, 4 folgas
    const scalePattern = ['morning', 'morning', 'morning', 'morning', 'night', 'night', 'off', 'off', 'off', 'off'];

    // Âncora conhecida: 26/05/2025 == 'morning' (índice 0)
    const originStart = new Date(2025, 0, 1); // 01/01/2025
    const referenceDate = new Date(2025, 4, 26); // 26/05/2025
    const msPerDay = 1000 * 60 * 60 * 24;

    const daysFromStartToRef = Math.floor((referenceDate - originStart) / msPerDay);
    const scaleIndexAtStart2025 = (scalePattern.length - (daysFromStartToRef % scalePattern.length)) % scalePattern.length;

    const daysFromStart2025ToTargetJan1 = Math.floor((new Date(targetYear, 0, 1) - originStart) / msPerDay);
    let scaleIndex = (scaleIndexAtStart2025 + daysFromStart2025ToTargetJan1) % scalePattern.length;

    // Obter feriados para o ano alvo
    const holidays = buildHolidaysForYear(targetYear);

    // Criar calendário para cada mês do targetYear
    for (let month = 0; month < 12; month++) {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'month';

        const monthTitle = document.createElement('div');
        monthTitle.className = 'month-title';
        monthTitle.textContent = months[month];
        monthDiv.appendChild(monthTitle);

        const daysHeader = document.createElement('div');
        daysHeader.className = 'days-header';
        weekdays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.textContent = day;
            daysHeader.appendChild(dayHeader);
        });
        monthDiv.appendChild(daysHeader);

        const daysGrid = document.createElement('div');
        daysGrid.className = 'days-grid';

        const firstDay = new Date(targetYear, month, 1).getDay();
        const daysInMonth = new Date(targetYear, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty-day';
            daysGrid.appendChild(emptyDay);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${targetYear}`;
            const isHoliday = holidays.includes(dateStr);

            const dayDiv = document.createElement('div');
            dayDiv.className = `day ${scalePattern[scaleIndex]} ${isHoliday ? 'holiday' : ''}`;
            dayDiv.textContent = day;

            if (isHoliday) {
                dayDiv.title = getHolidayName(dateStr);
            }

            daysGrid.appendChild(dayDiv);

            scaleIndex = (scaleIndex + 1) % scalePattern.length;
        }

        monthDiv.appendChild(daysGrid);
        calendarContainer.appendChild(monthDiv);
    }
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

    for (let y = startYear; y <= endYear; y++) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        select.appendChild(opt);
    }

    // Valor padrão 2026 se disponível, senão primeiro do range
    const defaultYear = select.querySelector('option[value="2026"]') ? 2026 : startYear;
    select.value = defaultYear;
    displayYear.textContent = defaultYear;
    document.title = `Escala Segurança Metrô SP - ${defaultYear}`;

    // Gerar calendário inicial
    createCalendar(defaultYear);

    // Ao mudar o ano, regenerar calendário e atualizar título
    select.addEventListener('change', function() {
        const y = parseInt(this.value, 10);
        displayYear.textContent = y;
        document.title = `Escala Segurança Metrô SP - ${y}`;
        createCalendar(y);
    });
};