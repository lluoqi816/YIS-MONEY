// ====== 货币配置数据 ======
const CURRENCIES_CONFIG = {
    EUR: { flag: '🇪🇺', name: '欧元', color: '#667eea' },
    GBP: { flag: '🇬🇧', name: '英镑', color: '#f5576c' },
    JPY: { flag: '🇯🇵', name: '日元', color: '#4facfe' },
    CNY: { flag: '🇨🇳', name: '人民币', color: '#ff6b6b' },
    AUD: { flag: '🇦🇺', name: '澳元', color: '#00d2a0' },
    CAD: { flag: '🇨🇦', name: '加元', color: '#ffd93d' },
    CHF: { flag: '🇨🇭', name: '瑞士法郎', color: '#ff9a9e' },
    HKD: { flag: '🇭🇰', name: '港币', color: '#a18cd1' },
    SGD: { flag: '🇸🇬', name: '新加坡元', color: '#fbc2eb' },
    SEK: { flag: '🇸🇪', name: '瑞典克朗', color: '#84fab0' },
    KRW: { flag: '🇰🇷', name: '韩元', color: '#a6c1ee' },
    NOK: { flag: '🇳🇴', name: '挪威克朗', color: '#fccb90' },
    NZD: { flag: '🇳🇿', name: '新西兰元', color: '#e0c3fc' },
    INR: { flag: '🇮🇳', name: '印度卢比', color: '#f093fb' },
    MXN: { flag: '🇲🇽', name: '墨西哥比索', color: '#c3cfe2' },
    TWD: { flag: '🇹🇼', name: '新台币', color: '#43e97b' },
    ZAR: { flag: '🇿🇦', name: '南非兰特', color: '#fa709a' },
    BRL: { flag: '🇧🇷', name: '巴西雷亚尔', color: '#fee140' },
    DKK: { flag: '🇩🇰', name: '丹麦克朗', color: '#30cfd0' },
    PLN: { flag: '🇵🇱', name: '波兰兹罗提', color: '#a8edea' },
    THB: { flag: '🇹🇭', name: '泰铢', color: '#d299c2' },
    IDR: { flag: '🇮🇩', name: '印尼盾', color: '#89f7fe' },
    HUF: { flag: '🇭🇺', name: '匈牙利福林', color: '#cd9cf2' },
    CZK: { flag: '🇨🇿', name: '捷克克朗', color: '#fddb92' },
    ILS: { flag: '🇮🇱', name: '以色列谢克尔', color: '#96fbc4' },
    PHP: { flag: '🇵🇭', name: '菲律宾比索', color: '#f6d365' },
    AED: { flag: '🇦🇪', name: '迪拉姆', color: '#84fab0' },
    SAR: { flag: '🇸🇦', name: '沙特里亚尔', color: '#cfd9df' },
    MYR: { flag: '🇲🇾', name: '马来西亚林吉特', color: '#ffecd2' },
    RUB: { flag: '🇷🇺', name: '俄罗斯卢布', color: '#a1c4fd' },
    TRY: { flag: '🇹🇷', name: '土耳其里拉', color: '#f794a4' },
    USD: { flag: '🇺🇸', name: '美元', color: '#48c6ef' }
};

// 主图表上默认显示的货币
const MAIN_CHART_CURRENCIES = ['EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'KRW'];

// ====== 全局状态 ======
let state = {
    baseCurrency: 'USD',
    rates: {},
    previousRates: {},
    history: {},  // { currency: [{ time, rate }] }
    updateCount: 0,
    chartCurrencies: [...MAIN_CHART_CURRENCIES],
    mainChart: null,
    barChart: null,
    radarChart: null,
};

// ====== 初始化 ======
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initCharts();
    initEventListeners();
    fetchRates();

    // 每30秒刷新（免费API限制）
    setInterval(fetchRates, 30000);
});

// ====== 粒子背景 ======
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 60;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(102, 126, 234, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // 连线
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(102, 126, 234, ${0.06 * (1 - dist / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// ====== 事件监听 ======
function initEventListeners() {
    document.getElementById('baseCurrency').addEventListener('change', (e) => {
        state.baseCurrency = e.target.value;
        // 清除历史，重新开始
        state.history = {};
        state.previousRates = {};
        state.updateCount = 0;
        fetchRates();
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
        filterCurrencies(e.target.value);
    });

    document.getElementById('fromAmount').addEventListener('input', convertCurrency);
    document.getElementById('fromCurrency').addEventListener('change', convertCurrency);
    document.getElementById('toCurrency').addEventListener('change', convertCurrency);

    document.getElementById('swapBtn').addEventListener('click', () => {
        const from = document.getElementById('fromCurrency');
        const to = document.getElementById('toCurrency');
        const temp = from.value;
        from.value = to.value;
        to.value = temp;
        convertCurrency();
    });
}

// ====== 获取汇率数据 ======
async function fetchRates() {
    const statusText = document.getElementById('statusText');
    statusText.textContent = '更新中...';

    try {
        // 使用免费的 exchangerate-api 或 frankfurter API
        // 首选 frankfurter.app (无需API key, 支持CORS)
        const response = await fetch(`https://api.frankfurter.app/latest?from=${state.baseCurrency}`);

        if (!response.ok) throw new Error('API请求失败');

        const data = await response.json();

        state.previousRates = { ...state.rates };
        state.rates = data.rates;

        // 添加基准货币自身
        state.rates[state.baseCurrency] = 1;

        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });

        // 记录历史
        Object.keys(state.rates).forEach(currency => {
            if (!state.history[currency]) state.history[currency] = [];
            state.history[currency].push({
                time: timeStr,
                rate: state.rates[currency]
            });
            // 保留最近60条
            if (state.history[currency].length > 60) {
                state.history[currency].shift();
            }
        });

        state.updateCount++;

        // 更新界面
        updateUI();
        updateCharts();
        updateConverter();

        document.getElementById('lastUpdate').textContent = timeStr;
        statusText.textContent = '实时连接中';

    } catch (error) {
        console.error('获取汇率失败:', error);
        statusText.textContent = '连接失败，使用模拟数据';

        // 使用模拟数据
        generateMockData();
        updateUI();
        updateCharts();
        updateConverter();
    }
}

// ====== 模拟数据生成（API失败时使用）======
function generateMockData() {
    const mockRates = {
        USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CNY: 7.24,
        AUD: 1.53, CAD: 1.36, CHF: 0.88, HKD: 7.82, SGD: 1.34,
        SEK: 10.42, KRW: 1320, NOK: 10.55, NZD: 1.65, INR: 83.12,
        MXN: 17.15, TWD: 31.5, ZAR: 18.7, BRL: 4.97, DKK: 6.87,
        PLN: 4.02, THB: 35.3, IDR: 15650, HUF: 355, CZK: 22.8,
        ILS: 3.73, PHP: 55.8, AED: 3.67, SAR: 3.75, MYR: 4.72,
        RUB: 92.5, TRY: 28.8
    };

    // 添加微小波动
    state.previousRates = { ...state.rates };
    const rates = {};
    Object.keys(mockRates).forEach(key => {
        if (key === state.baseCurrency) {
            rates[key] = 1;
        } else {
            const baseRate = mockRates[key] / (mockRates[state.baseCurrency] || 1);
            const fluctuation = (Math.random() - 0.5) * 0.005;
            rates[key] = +(baseRate * (1 + fluctuation)).toFixed(6);
        }
    });

    state.rates = rates;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });

    Object.keys(state.rates).forEach(currency => {
        if (!state.history[currency]) state.history[currency] = [];
        state.history[currency].push({
            time: timeStr,
            rate: state.rates[currency]
        });
        if (state.history[currency].length > 60) {
            state.history[currency].shift();
        }
    });

    state.updateCount++;
    document.getElementById('lastUpdate').textContent = timeStr;
}

// ====== 更新UI ======
function updateUI() {
    const currencies = Object.keys(state.rates).filter(c => c !== state.baseCurrency);

    // 统计
    let rising = 0, falling = 0;
    currencies.forEach(c => {
        if (state.previousRates[c]) {
            if (state.rates[c] > state.previousRates[c]) rising++;
            else if (state.rates[c] < state.previousRates[c]) falling++;
        }
    });

    document.getElementById('totalCurrencies').textContent = currencies.length;
    document.getElementById('risingCount').textContent = rising;
    document.getElementById('fallingCount').textContent = falling;
    document.getElementById('updateCount').textContent = state.updateCount;

    // 生成货币卡片
    renderCurrencyCards(currencies);

    // 生成图表切换按钮
    renderToggleButtons(currencies);

    // 更新转换器下拉
    updateConverterSelects();
}

// ====== 渲染货币卡片 ======
function renderCurrencyCards(currencies) {
    const grid = document.getElementById('currenciesGrid');
    const searchValue = document.getElementById('searchInput').value.toLowerCase();

    const filtered = currencies.filter(c => {
        const config = CURRENCIES_CONFIG[c] || {};
        return c.toLowerCase().includes(searchValue) ||
               (config.name && config.name.includes(searchValue));
    });

    grid.innerHTML = filtered.map(currency => {
        const config = CURRENCIES_CONFIG[currency] || { flag: '🏳️', name: currency, color: '#667eea' };
        const rate = state.rates[currency];
        const prevRate = state.previousRates[currency];
        let changePercent = 0;
        let changeClass = 'neutral';
        let changeIcon = 'fas fa-minus';
        let flashClass = '';

        if (prevRate && prevRate !== rate) {
            changePercent = ((rate - prevRate) / prevRate * 100);
            if (changePercent > 0) {
                changeClass = 'up';
                changeIcon = 'fas fa-caret-up';
                flashClass = 'flash-up';
            } else if (changePercent < 0) {
                changeClass = 'down';
                changeIcon = 'fas fa-caret-down';
                flashClass = 'flash-down';
            }
        }

        // Mini sparkline data
        const history = state.history[currency] || [];
        const miniChartId = `mini-${currency}`;

        return `
            <div class="currency-card ${changeClass} ${flashClass}" data-currency="${currency}">
                <div class="card-top">
                    <div class="currency-info">
                        <span class="currency-flag">${config.flag}</span>
                        <div class="currency-name">
                            <span class="currency-code">${currency}</span>
                            <span class="currency-full-name">${config.name}</span>
                        </div>
                    </div>
                    <div class="currency-change ${changeClass}">
                        <i class="${changeIcon}"></i>
                        ${Math.abs(changePercent).toFixed(3)}%
                    </div>
                </div>
                <div class="card-bottom">
                    <span class="currency-rate">${formatRate(rate)}</span>
                    <canvas class="card-mini-chart" id="${miniChartId}" width="80" height="35"></canvas>
                </div>
            </div>
        `;
    }).join('');

    // 绘制迷你图
    filtered.forEach(currency => {
        drawMiniChart(currency);
    });
}

// ====== 迷你折线图 ======
function drawMiniChart(currency) {
    const canvas = document.getElementById(`mini-${currency}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const history = state.history[currency] || [];

    if (history.length < 2) return;

    const rates = history.map(h => h.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const range = max - min || 1;

    const w = canvas.width;
    const h = canvas.height;
    const padding = 2;

    ctx.clearRect(0, 0, w, h);

    const isUp = rates[rates.length - 1] >= rates[0];
    const color = isUp ? '#00d2a0' : '#ff6b6b';

    // 绘制线条
    ctx.beginPath();
    rates.forEach((rate, i) => {
        const x = padding + (i / (rates.length - 1)) * (w - padding * 2);
        const y = h - padding - ((rate - min) / range) * (h - padding * 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 填充渐变
    const lastX = padding + ((rates.length - 1) / (rates.length - 1)) * (w - padding * 2);
    ctx.lineTo(lastX, h);
    ctx.lineTo(padding, h);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, isUp ? 'rgba(0, 210, 160, 0.3)' : 'rgba(255, 107, 107, 0.3)');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fill();
}

// ====== 图表切换按钮 ======
function renderToggleButtons(currencies) {
    const container = document.getElementById('currencyToggles');
    const mainCurrencies = currencies.filter(c => CURRENCIES_CONFIG[c]);

    container.innerHTML = mainCurrencies.slice(0, 15).map(currency => {
        const config = CURRENCIES_CONFIG[currency];
        const isActive = state.chartCurrencies.includes(currency);
        return `
            <span class="currency-toggle ${isActive ? 'active' : ''}"
                  data-currency="${currency}"
                  style="${isActive ? `background: ${config.color}33; border-color: ${config.color}; color: ${config.color}` : ''}"
                  onclick="toggleChartCurrency('${currency}')">
                ${config.flag} ${currency}
            </span>
        `;
    }).join('');
}

function toggleChartCurrency(currency) {
    const idx = state.chartCurrencies.indexOf(currency);
    if (idx > -1) {
        if (state.chartCurrencies.length <= 1) return; // 至少保留一个
        state.chartCurrencies.splice(idx, 1);
    } else {
        if (state.chartCurrencies.length >= 8) {
            state.chartCurrencies.shift();
        }
        state.chartCurrencies.push(currency);
    }
    renderToggleButtons(Object.keys(state.rates).filter(c => c !== state.baseCurrency));
    updateCharts();
}

// ====== Chart.js 图表初始化 ======
function initCharts() {
    // 全局Chart.js配置
    Chart.defaults.color = '#8a8fb5';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';
    Chart.defaults.font.family = "'Inter', sans-serif";

    // 主走势图
    const mainCtx = document.getElementById('mainChart').getContext('2d');
    state.mainChart = new Chart(mainCtx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20,
                        font: { size: 11, weight: '600' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 39, 0.9)',
                    titleFont: { size: 13, weight: '700' },
                    bodyFont: { size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    displayColors: true,
                    usePointStyle: true,
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 10 }, maxRotation: 0, maxTicksLimit: 10 }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.03)' },
                    ticks: { font: { size: 10 } }
                }
            },
            elements: {
                point: { radius: 2, hoverRadius: 5 },
                line: { tension: 0.4, borderWidth: 2 }
            },
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            }
        }
    });

    // 柱状图
    const barCtx = document.getElementById('barChart').getContext('2d');
    state.barChart = new Chart(barCtx, {
        type: 'bar',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 39, 0.9)',
                    padding: 12,
                    cornerRadius: 8,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.03)' },
                    ticks: { font: { size: 10 } }
                },
                y: {
                    grid: { display: false },
                    ticks: { font: { size: 11, weight: '600' } }
                }
            },
            animation: { duration: 600, easing: 'easeOutQuart' }
        }
    });

    // 雷达图
    const radarCtx = document.getElementById('radarChart').getContext('2d');
    state.radarChart = new Chart(radarCtx, {
        type: 'radar',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 39, 0.9)',
                    padding: 12,
                    cornerRadius: 8,
                }
            },
            scales: {
                r: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    angleLines: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { display: false },
                    pointLabels: {
                        font: { size: 11, weight: '600' },
                        color: '#8a8fb5'
                    }
                }
            },
            animation: { duration: 600, easing: 'easeOutQuart' }
        }
    });
}

// ====== 更新图表 ======
function updateCharts() {
    updateMainChart();
    updateBarChart();
    updateRadarChart();
}

function updateMainChart() {
    const chart = state.mainChart;
    const activeCurrencies = state.chartCurrencies.filter(c =>
        state.history[c] && state.history[c].length > 0 && c !== state.baseCurrency
    );

    if (activeCurrencies.length === 0) return;

    // 找到公共时间轴
    const refCurrency = activeCurrencies[0];
    const labels = state.history[refCurrency].map(h => h.time);

    // 需要归一化以便不同量级的货币在同一图表上比较
    // 使用百分比变化（以第一个数据点为基准）
    const datasets = activeCurrencies.map(currency => {
        const config = CURRENCIES_CONFIG[currency] || { color: '#667eea' };
        const history = state.history[currency] || [];
        const baseValue = history[0]?.rate || 1;

        return {
            label: `${(CURRENCIES_CONFIG[currency]?.flag || '')} ${currency}`,
            data: history.map(h => ((h.rate - baseValue) / baseValue * 100).toFixed(4)),
            borderColor: config.color,
            backgroundColor: config.color + '15',
            fill: false,
            pointBackgroundColor: config.color,
        };
    });

    chart.data.labels = labels;
    chart.data.datasets = datasets;
    chart.options.scales.y.title = {
        display: true,
        text: '变化率 (%)',
        color: '#8a8fb5',
        font: { size: 11 }
    };
    chart.update('none');
}

function updateBarChart() {
    const chart = state.barChart;
    const currencies = state.chartCurrencies.filter(c => state.rates[c] && c !== state.baseCurrency);

    // 对于柱状图，显示归一化后的值（取log方便展示不同量级）
    const sortedCurrencies = currencies.sort((a, b) => state.rates[a] - state.rates[b]);

    const labels = sortedCurrencies.map(c => `${CURRENCIES_CONFIG[c]?.flag || ''} ${c}`);
    const data = sortedCurrencies.map(c => state.rates[c]);
    const colors = sortedCurrencies.map(c => CURRENCIES_CONFIG[c]?.color || '#667eea');

    const backgroundColors = colors.map(c => c + '80');
    const borderColors = colors;

    chart.data.labels = labels;
    chart.data.datasets = [{
        data: data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.7,
    }];
    chart.update('none');
}

function updateRadarChart() {
    const chart = state.radarChart;
    const currencies = state.chartCurrencies.filter(c =>
        state.history[c] && state.history[c].length >= 2 && c !== state.baseCurrency
    );

    if (currencies.length < 3) return;

    // 计算波动率（标准差/均值）
    const labels = currencies.map(c => `${CURRENCIES_CONFIG[c]?.flag || ''} ${c}`);
    const volatilities = currencies.map(c => {
        const rates = state.history[c].map(h => h.rate);
        const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
        const variance = rates.reduce((sum, r) => sum + (r - mean) ** 2, 0) / rates.length;
        const stdDev = Math.sqrt(variance);
        return +((stdDev / mean) * 10000).toFixed(2); // basis points
    });

    const maxVol = Math.max(...volatilities, 1);
    const normalizedVol = volatilities.map(v => (v / maxVol) * 100);

    chart.data.labels = labels;
    chart.data.datasets = [{
        label: '波动率 (bp)',
        data: normalizedVol,
        backgroundColor: 'rgba(102, 126, 234, 0.15)',
        borderColor: '#667eea',
        borderWidth: 2,
        pointBackgroundColor: currencies.map(c => CURRENCIES_CONFIG[c]?.color || '#667eea'),
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointRadius: 4,
    }];
    chart.update('none');
}

// ====== 汇率转换器 ======
function updateConverterSelects() {
    const allCurrencies = Object.keys(state.rates);
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');

    const currentFrom = fromSelect.value || state.baseCurrency;
    const currentTo = toSelect.value || (allCurrencies.find(c => c !== state.baseCurrency) || 'EUR');

    [fromSelect, toSelect].forEach(select => {
        select.innerHTML = allCurrencies.map(c => {
            const config = CURRENCIES_CONFIG[c] || { flag: '🏳️', name: c };
            return `<option value="${c}">${config.flag} ${c} ${config.name}</option>`;
        }).join('');
    });

    fromSelect.value = allCurrencies.includes(currentFrom) ? currentFrom : state.baseCurrency;
    toSelect.value = allCurrencies.includes(currentTo) ? currentTo : 'EUR';

    convertCurrency();
}

function convertCurrency() {
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const fromAmount = parseFloat(document.getElementById('fromAmount').value) || 0;

    const fromRate = state.rates[fromCurrency] || 1;
    const toRate = state.rates[toCurrency] || 1;

    // 转换: 先转为基准货币，再转为目标货币
    const result = (fromAmount / fromRate) * toRate;
    document.getElementById('toAmount').value = result.toFixed(4);
}

// ====== 搜索过滤 ======
function filterCurrencies(searchValue) {
    const cards = document.querySelectorAll('.currency-card');
    const value = searchValue.toLowerCase();

    cards.forEach(card => {
        const currency = card.dataset.currency;
        const config = CURRENCIES_CONFIG[currency] || { name: currency };
        const match = currency.toLowerCase().includes(value) ||
                      config.name.toLowerCase().includes(value);
        card.style.display = match ? '' : 'none';
    });
}

// ====== 工具函数 ======
function formatRate(rate) {
    if (rate === undefined || rate === null) return '--';
    if (rate >= 1000) return rate.toFixed(2);
    if (rate >= 100) return rate.toFixed(3);
    if (rate >= 1) return rate.toFixed(4);
    return rate.toFixed(6);
}
