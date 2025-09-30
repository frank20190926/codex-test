// 滑轨结构监测系统主要JavaScript文件

// 全局变量
let deviceData = [];
let charts = {};
let updateInterval;

// 模拟设备数据
const mockDeviceData = [
    {
        id: 'device-001',
        name: '位移传感器-01',
        type: 'displacement',
        status: 'online',
        value: 2.3,
        unit: 'mm',
        lastUpdate: new Date(),
        location: '滑轨段A'
    },
    {
        id: 'device-002',
        name: '激光变形仪-01',
        type: 'laser',
        status: 'online',
        value: 1.8,
        unit: 'mm',
        lastUpdate: new Date(),
        location: '滑轨段B'
    },
    {
        id: 'device-003',
        name: '波浪高度计-01',
        type: 'wave',
        status: 'online',
        value: 0.8,
        unit: 'm',
        lastUpdate: new Date(),
        location: '海面监测点'
    },
    {
        id: 'device-004',
        name: '风速仪-01',
        type: 'wind',
        status: 'online',
        value: 12.5,
        unit: 'm/s',
        lastUpdate: new Date(),
        location: '风速监测点'
    },
    {
        id: 'device-005',
        name: '应变传感器-01',
        type: 'strain',
        status: 'warning',
        value: 85.2,
        unit: 'με',
        lastUpdate: new Date(),
        location: '滑轨段C'
    },
    {
        id: 'device-006',
        name: '加速度计-01',
        type: 'acceleration',
        status: 'online',
        value: 0.15,
        unit: 'g',
        lastUpdate: new Date(),
        location: '滑轨段D'
    }
];

// 模拟告警数据
const mockAlerts = [
    {
        id: 'alert-001',
        type: 'warning',
        message: '位移传感器-01数值异常',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        device: 'device-001',
        level: 'medium'
    },
    {
        id: 'alert-002',
        type: 'error',
        message: '应变传感器-01超出阈值',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        device: 'device-005',
        level: 'high'
    },
    {
        id: 'alert-003',
        type: 'info',
        message: '系统自检完成',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        device: 'system',
        level: 'low'
    }
];

// 初始化函数
function initializeSystem() {
    deviceData = [...mockDeviceData];
    
    // 初始化设备列表
    renderDeviceList();
    
    // 初始化关键指标
    updateKeyMetrics();
    
    // 初始化图表
    initializeCharts();
    
    // 初始化告警面板
    updateAlertPanel();
    
    // 启动数据更新定时器
    startDataUpdate();
    
    console.log('滑轨结构监测系统初始化完成');
}

// 渲染设备列表
function renderDeviceList() {
    const deviceListContainer = document.getElementById('deviceList');
    if (!deviceListContainer) return;
    
    deviceListContainer.innerHTML = '';
    
    deviceData.forEach(device => {
        const deviceCard = createDeviceCard(device);
        deviceListContainer.appendChild(deviceCard);
    });
}

// 创建设备卡片
function createDeviceCard(device) {
    const card = document.createElement('div');
    card.className = 'device-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer';
    card.dataset.deviceId = device.id;
    
    const statusColor = getStatusColor(device.status);
    const statusText = getStatusText(device.status);
    
    card.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <h3 class="font-medium text-gray-900 dark:text-white text-sm">${device.name}</h3>
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}">
                ${statusText}
            </span>
        </div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            ${device.value} <span class="text-sm font-normal text-gray-500">${device.unit}</span>
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">
            ${device.location}
        </div>
        <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">
            更新时间: ${formatTime(device.lastUpdate)}
        </div>
    `;
    
    // 添加点击事件
    card.addEventListener('click', () => {
        showDeviceDetails(device);
    });
    
    return card;
}

// 获取状态颜色
function getStatusColor(status) {
    switch (status) {
        case 'online':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'warning':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'error':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case 'offline':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
}

// 获取状态文本
function getStatusText(status) {
    switch (status) {
        case 'online':
            return '在线';
        case 'warning':
            return '警告';
        case 'error':
            return '错误';
        case 'offline':
            return '离线';
        default:
            return '未知';
    }
}

// 更新关键指标
function updateKeyMetrics() {
    const metrics = {
        displacement: deviceData.find(d => d.type === 'displacement'),
        laser: deviceData.find(d => d.type === 'laser'),
        wave: deviceData.find(d => d.type === 'wave'),
        wind: deviceData.find(d => d.type === 'wind')
    };
    
    Object.keys(metrics).forEach(key => {
        const metric = metrics[key];
        if (metric) {
            updateMetricCard(key, metric.value, metric.unit);
        }
    });
}

// 更新指标卡片
function updateMetricCard(type, value, unit) {
    const valueElement = document.querySelector(`[data-metric="${type}"] .metric-value`);
    const unitElement = document.querySelector(`[data-metric="${type}"] .metric-unit`);
    const progressElement = document.querySelector(`[data-metric="${type}"] .radial-progress`);
    
    if (valueElement) valueElement.textContent = value;
    if (unitElement) unitElement.textContent = unit;
    
    // 更新径向进度条
    if (progressElement) {
        let percentage = 0;
        switch (type) {
            case 'displacement':
                percentage = Math.min((value / 5) * 100, 100); // 假设最大值为5mm
                break;
            case 'laser':
                percentage = Math.min((value / 3) * 100, 100); // 假设最大值为3mm
                break;
            case 'wave':
                percentage = Math.min((value / 2) * 100, 100); // 假设最大值为2m
                break;
            case 'wind':
                percentage = Math.min((value / 25) * 100, 100); // 假设最大值为25m/s
                break;
        }
        progressElement.style.setProperty('--value', Math.round(percentage));
    }
}

// 初始化图表
function initializeCharts() {
    initDisplacementChart();
    initStrainChart();
    initAccelerationChart();
    initEnvironmentChart();
}

// 初始化位移趋势图
function initDisplacementChart() {
    const ctx = document.getElementById('displacementChart');
    if (!ctx) return;
    
    const data = generateTimeSeriesData(24, 0.5, 3.0);
    
    charts.displacement = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: '位移 (mm)',
                data: data.values,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(156, 163, 175, 0.2)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(156, 163, 175, 0.2)'
                    }
                }
            }
        }
    });
}

// 初始化应变分布图
function initStrainChart() {
    const ctx = document.getElementById('strainChart');
    if (!ctx) return;
    
    const data = generateDistributionData(10);
    
    charts.strain = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: '应变 (με)',
                data: data.values,
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(156, 163, 175, 0.2)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(156, 163, 175, 0.2)'
                    }
                }
            }
        }
    });
}

// 初始化加速度监测图
function initAccelerationChart() {
    const ctx = document.getElementById('accelerationChart');
    if (!ctx) return;
    
    const data = generateTimeSeriesData(24, 0.05, 0.25);
    
    charts.acceleration = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: '加速度 (g)',
                data: data.values,
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(156, 163, 175, 0.2)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(156, 163, 175, 0.2)'
                    }
                }
            }
        }
    });
}

// 初始化环境参数图
function initEnvironmentChart() {
    const ctx = document.getElementById('environmentChart');
    if (!ctx) return;
    
    const tempData = generateTimeSeriesData(24, 18, 28);
    const humidityData = generateTimeSeriesData(24, 60, 85);
    
    charts.environment = new Chart(ctx, {
        type: 'line',
        data: {
            labels: tempData.labels,
            datasets: [{
                label: '温度 (°C)',
                data: tempData.values,
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: '湿度 (%)',
                data: humidityData.values,
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        color: 'rgba(156, 163, 175, 0.2)'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: {
                        color: 'rgba(156, 163, 175, 0.2)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

// 生成时间序列数据
function generateTimeSeriesData(hours, min, max) {
    const labels = [];
    const values = [];
    const now = new Date();
    
    for (let i = hours - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        labels.push(time.getHours().toString().padStart(2, '0') + ':00');
        values.push((Math.random() * (max - min) + min).toFixed(2));
    }
    
    return { labels, values };
}

// 生成分布数据
function generateDistributionData(count) {
    const labels = [];
    const values = [];
    
    for (let i = 1; i <= count; i++) {
        labels.push(`点${i}`);
        values.push((Math.random() * 100 + 20).toFixed(1));
    }
    
    return { labels, values };
}

// 更新告警面板
function updateAlertPanel() {
    updateAlertCounts();
    renderAlertList();
}

// 更新告警计数
function updateAlertCounts() {
    const activeAlerts = mockAlerts.filter(alert => alert.type !== 'info');
    const todayAlerts = mockAlerts.filter(alert => {
        const today = new Date();
        const alertDate = new Date(alert.timestamp);
        return alertDate.toDateString() === today.toDateString();
    });
    
    const activeCountElement = document.querySelector('.alert-count');
    const todayCountElement = document.querySelector('.today-count');
    
    if (activeCountElement) activeCountElement.textContent = activeAlerts.length;
    if (todayCountElement) todayCountElement.textContent = todayAlerts.length;
}

// 渲染告警列表
function renderAlertList() {
    const alertListContainer = document.getElementById('alertList');
    if (!alertListContainer) return;
    
    alertListContainer.innerHTML = '';
    
    mockAlerts.forEach(alert => {
        const alertItem = createAlertItem(alert);
        alertListContainer.appendChild(alertItem);
    });
}

// 创建告警项
function createAlertItem(alert) {
    const item = document.createElement('div');
    item.className = 'alert-item p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer';
    
    const typeColor = getAlertTypeColor(alert.type);
    const levelText = getAlertLevelText(alert.level);
    
    item.innerHTML = `
        <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full ${typeColor}">
                    ${getAlertIcon(alert.type)}
                </span>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                    ${alert.message}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                    ${levelText} • ${formatTime(alert.timestamp)}
                </p>
            </div>
        </div>
    `;
    
    return item;
}

// 获取告警类型颜色
function getAlertTypeColor(type) {
    switch (type) {
        case 'error':
            return 'bg-red-100 text-red-600';
        case 'warning':
            return 'bg-yellow-100 text-yellow-600';
        case 'info':
            return 'bg-blue-100 text-blue-600';
        default:
            return 'bg-gray-100 text-gray-600';
    }
}

// 获取告警图标
function getAlertIcon(type) {
    switch (type) {
        case 'error':
            return '!';
        case 'warning':
            return '⚠';
        case 'info':
            return 'i';
        default:
            return '?';
    }
}

// 获取告警级别文本
function getAlertLevelText(level) {
    switch (level) {
        case 'high':
            return '高级';
        case 'medium':
            return '中级';
        case 'low':
            return '低级';
        default:
            return '未知';
    }
}

// 格式化时间
function formatTime(date) {
    return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 显示设备详情
function showDeviceDetails(device) {
    // 这里可以实现设备详情弹窗
    console.log('显示设备详情:', device);
}

// 启动数据更新
function startDataUpdate() {
    updateInterval = setInterval(() => {
        // 模拟数据更新
        deviceData.forEach(device => {
            // 随机更新数值
            const variation = (Math.random() - 0.5) * 0.2;
            device.value = Math.max(0, device.value + variation);
            device.lastUpdate = new Date();
        });
        
        // 更新显示
        renderDeviceList();
        updateKeyMetrics();
        
        // 更新图表数据
        updateChartData();
        
    }, 5000); // 每5秒更新一次
}

// 更新图表数据
function updateChartData() {
    Object.keys(charts).forEach(chartKey => {
        const chart = charts[chartKey];
        if (chart && chart.data && chart.data.datasets) {
            chart.data.datasets.forEach(dataset => {
                // 移除第一个数据点，添加新的数据点
                dataset.data.shift();
                const newValue = (Math.random() * 100).toFixed(2);
                dataset.data.push(newValue);
            });
            
            // 更新标签
            if (chart.data.labels) {
                chart.data.labels.shift();
                const now = new Date();
                chart.data.labels.push(now.getHours().toString().padStart(2, '0') + ':' + 
                                     now.getMinutes().toString().padStart(2, '0'));
            }
            
            chart.update('none');
        }
    });
}

// 停止数据更新
function stopDataUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeSystem();
});

// 页面卸载时清理
window.addEventListener('beforeunload', function() {
    stopDataUpdate();
});

// ==================== 数据深度处理与分析模块 ====================

// 数据深度处理与分析相关变量
let analysisCharts = {};
let currentAnalysisData = [];
let analysisResults = {};
let isAnalysisRunning = false; // 添加防护标志

// FFT算法实现
class FFT {
    static fft(signal) {
        const N = signal.length;
        if (N <= 1) return signal;
        
        // 限制FFT输入大小以防止堆栈溢出
        const maxFFTSize = 65536; // 2^16
        if (N > maxFFTSize) {
            console.warn(`FFT输入过大(${N})，将截取前${maxFFTSize}个样本点`);
            return FFT.fftIterative(signal.slice(0, maxFFTSize).map(x => ({ real: x, imag: 0 })));
        }
        
        // 确保长度为2的幂
        const nextPow2 = Math.pow(2, Math.ceil(Math.log2(N)));
        if (N !== nextPow2) {
            // 零填充到下一个2的幂
            const padded = new Array(nextPow2).fill(0);
            for (let i = 0; i < N; i++) {
                padded[i] = signal[i];
            }
            return FFT.fftIterative(padded.map(x => ({ real: x, imag: 0 })));
        }
        
        return FFT.fftIterative(signal.map(x => ({ real: x, imag: 0 })));
    }
    
    // 非递归FFT实现，避免堆栈溢出
    static fftIterative(x) {
        const N = x.length;
        if (N <= 1) return x;
        
        // 位反转排序
        const result = [...x];
        for (let i = 1, j = 0; i < N; i++) {
            let bit = N >> 1;
            for (; j & bit; bit >>= 1) {
                j ^= bit;
            }
            j ^= bit;
            if (i < j) {
                [result[i], result[j]] = [result[j], result[i]];
            }
        }
        
        // 迭代FFT
        for (let len = 2; len <= N; len <<= 1) {
            const wlen = { real: Math.cos(-2 * Math.PI / len), imag: Math.sin(-2 * Math.PI / len) };
            for (let i = 0; i < N; i += len) {
                let w = { real: 1, imag: 0 };
                for (let j = 0; j < len / 2; j++) {
                    const u = result[i + j];
                    const v = FFT.complexMultiply(result[i + j + len / 2], w);
                    result[i + j] = FFT.complexAdd(u, v);
                    result[i + j + len / 2] = FFT.complexSubtract(u, v);
                    w = FFT.complexMultiply(w, wlen);
                }
            }
        }
        
        return result;
    }
    
    static complexAdd(a, b) {
        return { real: a.real + b.real, imag: a.imag + b.imag };
    }
    
    static complexSubtract(a, b) {
        return { real: a.real - b.real, imag: a.imag - b.imag };
    }
    
    static complexMultiply(a, b) {
        return {
            real: a.real * b.real - a.imag * b.imag,
            imag: a.real * b.imag + a.imag * b.real
        };
    }
    
    static magnitude(complex) {
        return Math.sqrt(complex.real * complex.real + complex.imag * complex.imag);
    }
}

// 信号处理工具类
class SignalProcessor {
    // 生成模拟信号数据
    static generateSignal(type, duration, samplingRate) {
        const samples = duration * samplingRate;
        const signal = [];
        const timeStep = 1 / samplingRate;
        
        for (let i = 0; i < samples; i++) {
            const t = i * timeStep;
            let value = 0;
            
            switch (type) {
                case 'displacement':
                    // 位移信号：主频2Hz + 噪声
                    value = 2 * Math.sin(2 * Math.PI * 2 * t) + 
                           0.5 * Math.sin(2 * Math.PI * 5 * t) + 
                           0.2 * (Math.random() - 0.5);
                    break;
                case 'acceleration':
                    // 加速度信号：主频1.5Hz + 高频成分
                    value = 1.5 * Math.sin(2 * Math.PI * 1.5 * t) + 
                           0.8 * Math.sin(2 * Math.PI * 8 * t) + 
                           0.3 * (Math.random() - 0.5);
                    break;
                case 'strain':
                    // 应变信号：主频3Hz + 低频漂移
                    value = 3 * Math.sin(2 * Math.PI * 3 * t) + 
                           0.1 * t + 
                           0.4 * (Math.random() - 0.5);
                    break;
                case 'vibration':
                    // 振动信号：多频率成分
                    value = 2 * Math.sin(2 * Math.PI * 2.5 * t) + 
                           1 * Math.sin(2 * Math.PI * 7 * t) + 
                           0.5 * Math.sin(2 * Math.PI * 15 * t) + 
                           0.3 * (Math.random() - 0.5);
                    break;
                default:
                    value = Math.sin(2 * Math.PI * 1 * t) + 0.1 * (Math.random() - 0.5);
            }
            
            signal.push(value);
        }
        
        return signal;
    }
    
    // 应用滤波器
    static applyFilter(signal, filterType, cutoffFreq, samplingRate) {
        // 简化的滤波器实现
        const filtered = [...signal];
        const alpha = cutoffFreq / (samplingRate / 2);
        
        switch (filterType) {
            case 'lowpass':
                for (let i = 1; i < filtered.length; i++) {
                    filtered[i] = alpha * signal[i] + (1 - alpha) * filtered[i - 1];
                }
                break;
            case 'highpass':
                for (let i = 1; i < filtered.length; i++) {
                    filtered[i] = alpha * (filtered[i - 1] + signal[i] - signal[i - 1]);
                }
                break;
            case 'bandpass':
                // 简化的带通滤波器
                const lowpass = SignalProcessor.applyFilter(signal, 'lowpass', cutoffFreq * 2, samplingRate);
                const highpass = SignalProcessor.applyFilter(lowpass, 'highpass', cutoffFreq * 0.5, samplingRate);
                return highpass;
        }
        
        return filtered;
    }
    
    // 计算基频
    static findFundamentalFrequency(fftResult, samplingRate) {
        const magnitudes = fftResult.map(complex => FFT.magnitude(complex));
        const freqStep = samplingRate / fftResult.length;
        
        let maxMagnitude = 0;
        let fundamentalFreq = 0;
        
        // 忽略直流分量，从1Hz开始查找
        const startIndex = Math.max(1, Math.floor(1 / freqStep));
        const endIndex = Math.floor(fftResult.length / 2); // 奈奎斯特频率
        
        for (let i = startIndex; i < endIndex; i++) {
            if (magnitudes[i] > maxMagnitude) {
                maxMagnitude = magnitudes[i];
                fundamentalFreq = i * freqStep;
            }
        }
        
        return fundamentalFreq;
    }
    
    // 计算统计信息
    static calculateStatistics(signal) {
        const n = signal.length;
        const mean = signal.reduce((sum, val) => sum + val, 0) / n;
        const variance = signal.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);
        
        const sorted = [...signal].sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[n - 1];
        const median = n % 2 === 0 ? 
            (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : 
            sorted[Math.floor(n / 2)];
        
        return { mean, stdDev, variance, min, max, median };
    }
}

// 趋势分析类
class TrendAnalyzer {
    // 线性回归
    static linearRegression(x, y) {
        const n = x.length;
        const sumX = x.reduce((sum, val) => sum + val, 0);
        const sumY = y.reduce((sum, val) => sum + val, 0);
        const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
        const sumXX = x.reduce((sum, val) => sum + val * val, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        return { slope, intercept };
    }
    
    // 多项式回归（二次）
    static polynomialRegression(x, y, degree = 2) {
        // 简化的二次多项式回归
        const n = x.length;
        const matrix = [];
        const vector = [];
        
        // 构建正规方程矩阵
        for (let i = 0; i <= degree; i++) {
            matrix[i] = [];
            for (let j = 0; j <= degree; j++) {
                matrix[i][j] = x.reduce((sum, val) => sum + Math.pow(val, i + j), 0);
            }
            vector[i] = x.reduce((sum, val, idx) => sum + Math.pow(val, i) * y[idx], 0);
        }
        
        // 简化求解（仅适用于二次）
        if (degree === 2) {
            const det = matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
                       matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
                       matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
            
            if (Math.abs(det) < 1e-10) {
                return TrendAnalyzer.linearRegression(x, y);
            }
            
            const a = (vector[0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
                      vector[1] * (matrix[0][1] * matrix[2][2] - matrix[0][2] * matrix[2][1]) +
                      vector[2] * (matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1])) / det;
            
            const b = (matrix[0][0] * (vector[1] * matrix[2][2] - vector[2] * matrix[1][2]) -
                      matrix[0][1] * (vector[0] * matrix[2][2] - vector[2] * matrix[2][0]) +
                      matrix[0][2] * (vector[0] * matrix[1][2] - vector[1] * matrix[2][0])) / det;
            
            const c = (matrix[0][0] * (matrix[1][1] * vector[2] - matrix[1][2] * vector[1]) -
                      matrix[0][1] * (matrix[1][0] * vector[2] - matrix[1][2] * vector[0]) +
                      matrix[0][2] * (matrix[1][0] * vector[1] - matrix[1][1] * vector[0])) / det;
            
            return { a, b, c };
        }
        
        return TrendAnalyzer.linearRegression(x, y);
    }
    
    // 预测未来值
    static predict(model, futureX) {
        if (model.slope !== undefined) {
            // 线性模型
            return futureX.map(x => model.slope * x + model.intercept);
        } else if (model.a !== undefined) {
            // 二次多项式模型
            return futureX.map(x => model.a + model.b * x + model.c * x * x);
        }
        return [];
    }
    
    // 建立基线模型
    static buildBaseline(historicalData, windowDays = 30) {
        const now = Date.now();
        const windowMs = windowDays * 24 * 60 * 60 * 1000;
        const baselineData = historicalData.filter(point => 
            now - point.timestamp.getTime() <= windowMs
        );
        
        if (baselineData.length === 0) return null;
        
        const values = baselineData.map(point => point.value);
        const stats = SignalProcessor.calculateStatistics(values);
        
        return {
            mean: stats.mean,
            stdDev: stats.stdDev,
            upperBound: stats.mean + 3 * stats.stdDev,
            lowerBound: stats.mean - 3 * stats.stdDev,
            sampleCount: values.length
        };
    }
}

// 数据分析主函数
function startAnalysis() {
    // 防护机制：避免重复调用
    if (isAnalysisRunning) {
        console.log('分析正在进行中，请等待...');
        return;
    }
    
    const dataSource = document.getElementById('analysisDataSource').value;
    const analysisType = document.getElementById('analysisType').value;
    const timeWindow = document.getElementById('timeWindow').value;
    const samplingRate = parseInt(document.getElementById('samplingRate').value) || 100;
    
    if (!dataSource || !analysisType) {
        alert('请选择数据源和分析类型');
        return;
    }
    
    // 设置运行标志
    isAnalysisRunning = true;
    
    // 显示加载状态
    showAnalysisLoading(true);
    
    // 模拟异步处理
    setTimeout(() => {
        try {
            performAnalysis(dataSource, analysisType, timeWindow, samplingRate);
            showAnalysisLoading(false);
        } catch (error) {
            console.error('分析过程出错:', error);
            alert('分析过程出错，请检查参数设置');
            showAnalysisLoading(false);
        } finally {
            // 重置运行标志
            isAnalysisRunning = false;
        }
    }, 1000);
}

function performAnalysis(dataSource, analysisType, timeWindow, samplingRate) {
    const startTime = performance.now();
    
    // 计算数据量并添加限制
    const duration = getTimeWindowDuration(timeWindow);
    const totalSamples = duration * samplingRate;
    
    // 限制最大样本数量以防止内存溢出（最大100万个样本点）
    const maxSamples = 1000000;
    if (totalSamples > maxSamples) {
        alert(`数据量过大！当前配置将生成${totalSamples.toLocaleString()}个样本点，超过限制${maxSamples.toLocaleString()}个。请减少时间窗口或降低采样率。`);
        showAnalysisLoading(false);
        return;
    }
    
    console.log(`数据量检查通过: ${totalSamples.toLocaleString()}个样本点`);
    
    // 生成或获取分析数据
    currentAnalysisData = SignalProcessor.generateSignal(dataSource, duration, samplingRate);
    
    // 更新window对象中的引用
    window.currentAnalysisData = currentAnalysisData;
    
    // 执行不同类型的分析
    switch (analysisType) {
        case 'fft':
            performFFTAnalysis(currentAnalysisData, samplingRate);
            break;
        case 'trend':
            performTrendAnalysis(currentAnalysisData, samplingRate);
            break;
        case 'baseline':
            performBaselineAnalysis(currentAnalysisData);
            break;
        case 'prediction':
            performPredictionAnalysis(currentAnalysisData, samplingRate);
            break;
    }
    
    // 更新window对象中的引用
    window.analysisResults = analysisResults;
    
    const endTime = performance.now();
    const analysisTime = Math.round(endTime - startTime);
    
    // 更新统计信息
    updateAnalysisStatistics(currentAnalysisData.length, analysisTime);
    
    // 渲染分析结果
    renderAnalysisResults();
}

function performFFTAnalysis(signal, samplingRate) {
    // 应用窗函数（汉宁窗）
    const windowedSignal = signal.map((val, i) => 
        val * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (signal.length - 1)))
    );
    
    // 执行FFT
    const complexSignal = windowedSignal.map(val => ({ real: val, imag: 0 }));
    const fftResult = FFT.fft(complexSignal);
    
    // 计算幅度谱
    const magnitudes = fftResult.slice(0, fftResult.length / 2).map(complex => FFT.magnitude(complex));
    const frequencies = magnitudes.map((_, i) => i * samplingRate / fftResult.length);
    
    // 找到基频和峰值频率
    let fundamentalFreq = SignalProcessor.findFundamentalFrequency(fftResult, samplingRate);
    const peakIndex = magnitudes.indexOf(Math.max(...magnitudes.slice(1))); // 忽略直流分量
    let peakFreq = frequencies[peakIndex];
    
    // 添加空值检查和默认值
    if (typeof fundamentalFreq !== 'number' || isNaN(fundamentalFreq)) {
        fundamentalFreq = 0;
    }
    if (typeof peakFreq !== 'number' || isNaN(peakFreq)) {
        peakFreq = 0;
    }
    
    analysisResults.fft = {
        frequencies,
        magnitudes,
        fundamentalFreq,
        peakFreq,
        signal: windowedSignal
    };
    
    // 更新显示 - 添加安全检查
    const fundamentalFreqElement = document.getElementById('fundamentalFreq');
    const peakFreqElement = document.getElementById('peakFreq');
    
    if (fundamentalFreqElement) {
        fundamentalFreqElement.textContent = fundamentalFreq.toFixed(2);
    }
    if (peakFreqElement) {
        peakFreqElement.textContent = peakFreq.toFixed(2);
    }
}

function performTrendAnalysis(signal, samplingRate) {
    const timePoints = signal.map((_, i) => i / samplingRate);
    
    // 线性趋势分析
    const linearModel = TrendAnalyzer.linearRegression(timePoints, signal);
    
    // 多项式趋势分析
    const polyModel = TrendAnalyzer.polynomialRegression(timePoints, signal, 2);
    
    // 计算R²
    const linearPredictions = TrendAnalyzer.predict(linearModel, timePoints);
    const meanY = signal.reduce((sum, val) => sum + val, 0) / signal.length;
    const ssRes = signal.reduce((sum, val, i) => sum + Math.pow(val - linearPredictions[i], 2), 0);
    const ssTot = signal.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0);
    let rSquared = 1 - (ssRes / ssTot);
    
    // 添加R²值的安全检查
    if (typeof rSquared !== 'number' || isNaN(rSquared) || !isFinite(rSquared)) {
        rSquared = 0;
    }
    // 确保R²在合理范围内
    rSquared = Math.max(0, Math.min(1, rSquared));
    
    analysisResults.trend = {
        linearModel,
        polyModel,
        rSquared,
        timePoints,
        signal,
        predictions: linearPredictions
    };
    
    // 更新显示 - 添加安全检查
    const accuracyElement = document.getElementById('accuracy');
    if (accuracyElement) {
        accuracyElement.textContent = (rSquared * 100).toFixed(1);
    }
}

function performBaselineAnalysis(signal) {
    // 模拟历史数据
    const historicalData = signal.map((value, i) => ({
        value,
        timestamp: new Date(Date.now() - (signal.length - i) * 1000)
    }));
    
    const baseline = TrendAnalyzer.buildBaseline(historicalData, 30);
    
    // 检测异常点
    const anomalies = signal.filter(val => 
        val > baseline.upperBound || val < baseline.lowerBound
    );
    
    analysisResults.baseline = {
        baseline,
        anomalies,
        signal
    };
    
    // 更新显示
    document.getElementById('anomalyCount').textContent = anomalies.length;
}

function performPredictionAnalysis(signal, samplingRate) {
    const timePoints = signal.map((_, i) => i / samplingRate);
    const model = TrendAnalyzer.linearRegression(timePoints, signal);
    
    // 预测未来24小时
    const predictionSteps = parseInt(document.getElementById('predictionSteps').value) || 24;
    const futureTimePoints = [];
    const lastTime = timePoints[timePoints.length - 1];
    
    for (let i = 1; i <= predictionSteps; i++) {
        futureTimePoints.push(lastTime + i / samplingRate);
    }
    
    const predictions = TrendAnalyzer.predict(model, futureTimePoints);
    
    analysisResults.prediction = {
        model,
        timePoints,
        signal,
        futureTimePoints,
        predictions
    };
}

// 辅助函数
function getTimeWindowDuration(timeWindow) {
    switch (timeWindow) {
        case '1h': return 3600;
        case '6h': return 6 * 3600;
        case '24h': return 24 * 3600;
        case '7d': return 7 * 24 * 3600;
        case '30d': return 30 * 24 * 3600;
        default: return 3600;
    }
}

function showAnalysisLoading(show) {
    const buttons = document.querySelectorAll('#analysisDataSource, #analysisType, button[onclick="startAnalysis()"]');
    buttons.forEach(btn => btn.disabled = show);
    
    if (show) {
        document.getElementById('processedDataCount').textContent = '处理中...';
        document.getElementById('analysisTime').textContent = '计算中...';
    }
}

function updateAnalysisStatistics(dataCount, analysisTime) {
    // 添加数值安全检查
    const safeDataCount = typeof dataCount === 'number' && !isNaN(dataCount) ? dataCount : 0;
    const safeAnalysisTime = typeof analysisTime === 'string' || typeof analysisTime === 'number' ? analysisTime : '0ms';
    
    // 安全更新显示元素
    const processedDataCountElement = document.getElementById('processedDataCount');
    const analysisTimeElement = document.getElementById('analysisTime');
    const sampleCountElement = document.getElementById('sampleCount');
    const timeSpanElement = document.getElementById('timeSpan');
    
    if (processedDataCountElement) {
        processedDataCountElement.textContent = safeDataCount.toLocaleString();
    }
    if (analysisTimeElement) {
        analysisTimeElement.textContent = safeAnalysisTime;
    }
    if (sampleCountElement) {
        sampleCountElement.textContent = safeDataCount.toLocaleString();
    }
    if (timeSpanElement) {
        const timeSpan = safeDataCount / 100; // 假设100Hz采样
        timeSpanElement.textContent = (typeof timeSpan === 'number' && !isNaN(timeSpan) ? timeSpan : 0).toFixed(1);
    }
}

function renderAnalysisResults() {
    // 渲染时程曲线
    renderTimeSeriesChart();
    
    // 渲染频谱图
    if (analysisResults.fft) {
        renderFrequencyChart();
    }
    
    // 渲染散点图
    renderScatterChart();
    
    // 渲染趋势图
    if (analysisResults.trend || analysisResults.prediction) {
        renderTrendChart();
    }
}

function renderTimeSeriesChart() {
    const canvas = document.getElementById('timeSeriesChart');
    const ctx = canvas.getContext('2d');
    
    if (analysisCharts.timeSeries) {
        analysisCharts.timeSeries.destroy();
    }
    
    const timePoints = currentAnalysisData.map((_, i) => i / 100); // 假设100Hz
    
    analysisCharts.timeSeries = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timePoints.map(t => t.toFixed(2)),
            datasets: [{
                label: '时程数据',
                data: currentAnalysisData,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 1,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: '时间 (s)' }
                },
                y: {
                    title: { display: true, text: '幅值' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function renderFrequencyChart() {
    const canvas = document.getElementById('frequencyChart');
    const ctx = canvas.getContext('2d');
    
    if (analysisCharts.frequency) {
        analysisCharts.frequency.destroy();
    }
    
    const { frequencies, magnitudes } = analysisResults.fft;
    
    analysisCharts.frequency = new Chart(ctx, {
        type: 'line',
        data: {
            labels: frequencies.slice(0, frequencies.length / 4).map(f => f.toFixed(1)), // 显示前1/4频率
            datasets: [{
                label: '幅度谱',
                data: magnitudes.slice(0, magnitudes.length / 4),
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: '频率 (Hz)' }
                },
                y: {
                    title: { display: true, text: '幅度' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function renderScatterChart() {
    const canvas = document.getElementById('scatterChart');
    const ctx = canvas.getContext('2d');
    
    if (analysisCharts.scatter) {
        analysisCharts.scatter.destroy();
    }
    
    // 创建散点数据（当前值 vs 前一个值）
    const scatterData = [];
    for (let i = 1; i < currentAnalysisData.length; i++) {
        scatterData.push({
            x: currentAnalysisData[i - 1],
            y: currentAnalysisData[i]
        });
    }
    
    // 计算相关系数
    const x = scatterData.map(point => point.x);
    const y = scatterData.map(point => point.y);
    let correlation = calculateCorrelation(x, y);
    let stdDev = SignalProcessor.calculateStatistics(currentAnalysisData).stdDev;
    
    // 添加安全检查
    if (typeof correlation !== 'number' || isNaN(correlation) || !isFinite(correlation)) {
        correlation = 0;
    }
    if (typeof stdDev !== 'number' || isNaN(stdDev) || !isFinite(stdDev)) {
        stdDev = 0;
    }
    
    // 更新显示 - 添加元素存在检查
    const correlationElement = document.getElementById('correlation');
    const stdDevElement = document.getElementById('stdDev');
    
    if (correlationElement) {
        correlationElement.textContent = correlation.toFixed(3);
    }
    if (stdDevElement) {
        stdDevElement.textContent = stdDev.toFixed(3);
    }
    
    analysisCharts.scatter = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: '数据分布',
                data: scatterData.slice(0, 1000), // 限制显示点数
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderColor: '#10B981',
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: '当前值' }
                },
                y: {
                    title: { display: true, text: '下一个值' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function renderTrendChart() {
    const canvas = document.getElementById('trendChart');
    const ctx = canvas.getContext('2d');
    
    if (analysisCharts.trend) {
        analysisCharts.trend.destroy();
    }
    
    const datasets = [];
    
    // 原始数据
    if (analysisResults.trend) {
        const { timePoints, signal, predictions } = analysisResults.trend;
        
        datasets.push({
            label: '原始数据',
            data: timePoints.map((t, i) => ({ x: t, y: signal[i] })),
            borderColor: '#6B7280',
            backgroundColor: 'rgba(107, 114, 128, 0.1)',
            borderWidth: 1,
            pointRadius: 0
        });
        
        datasets.push({
            label: '趋势线',
            data: timePoints.map((t, i) => ({ x: t, y: predictions[i] })),
            borderColor: '#F59E0B',
            borderWidth: 2,
            pointRadius: 0
        });
    }
    
    // 预测数据
    if (analysisResults.prediction) {
        const { timePoints, signal, futureTimePoints, predictions } = analysisResults.prediction;
        
        if (!datasets.length) {
            datasets.push({
                label: '历史数据',
                data: timePoints.map((t, i) => ({ x: t, y: signal[i] })),
                borderColor: '#6B7280',
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                borderWidth: 1,
                pointRadius: 0
            });
        }
        
        datasets.push({
            label: '预测数据',
            data: futureTimePoints.map((t, i) => ({ x: t, y: predictions[i] })),
            borderColor: '#8B5CF6',
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 0
        });
    }
    
    analysisCharts.trend = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: '时间 (s)' }
                },
                y: {
                    title: { display: true, text: '幅值' }
                }
            },
            plugins: {
                legend: { display: true, position: 'top' }
            }
        }
    });
}

function calculateCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
}

function clearAnalysis() {
    // 清空所有图表
    Object.values(analysisCharts).forEach(chart => {
        if (chart) chart.destroy();
    });
    analysisCharts = {};
    
    // 重置统计信息
    document.getElementById('processedDataCount').textContent = '0';
    document.getElementById('analysisTime').textContent = '0';
    document.getElementById('anomalyCount').textContent = '0';
    document.getElementById('predictionAccuracy').textContent = '0';
    document.getElementById('sampleCount').textContent = '0';
    document.getElementById('timeSpan').textContent = '0';
    document.getElementById('fundamentalFreq').textContent = '0';
    document.getElementById('peakFreq').textContent = '0';
    document.getElementById('correlation').textContent = '0';
    document.getElementById('stdDev').textContent = '0';
    document.getElementById('accuracy').textContent = '0';
    
    // 清空数据
    currentAnalysisData = [];
    analysisResults = {};
}

// 导出分析结果
function exportAnalysisResults(format) {
    if (currentAnalysisData.length === 0) {
        alert('没有可导出的分析结果');
        return;
    }
    
    switch (format) {
        case 'pdf':
            alert('PDF导出功能开发中...');
            break;
        case 'excel':
            exportAnalysisToExcel();
            break;
    }
}

function exportAnalysisToExcel() {
    // 简化的Excel导出
    const data = currentAnalysisData.map((value, index) => ({
        '序号': index + 1,
        '时间(s)': (index / 100).toFixed(3),
        '数值': value.toFixed(6)
    }));
    
    const csvContent = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `分析结果_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// 保存和加载分析配置
function saveAnalysisConfig() {
    const config = {
        dataSource: document.getElementById('analysisDataSource').value,
        analysisType: document.getElementById('analysisType').value,
        timeWindow: document.getElementById('timeWindow').value,
        samplingRate: document.getElementById('samplingRate').value,
        fftWindow: document.getElementById('fftWindow').value,
        filterType: document.getElementById('filterType').value,
        predictionModel: document.getElementById('predictionModel').value,
        baselineWindow: document.getElementById('baselineWindow').value,
        anomalyThreshold: document.getElementById('anomalyThreshold').value,
        predictionSteps: document.getElementById('predictionSteps').value
    };
    
    localStorage.setItem('analysisConfig', JSON.stringify(config));
    alert('配置已保存');
}

function loadAnalysisConfig() {
    const config = localStorage.getItem('analysisConfig');
    if (!config) {
        alert('没有找到保存的配置');
        return;
    }
    
    try {
        const parsedConfig = JSON.parse(config);
        
        Object.keys(parsedConfig).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = parsedConfig[key];
            }
        });
        
        alert('配置已加载');
    } catch (error) {
        alert('配置文件格式错误');
    }
}

// 导出全局函数供HTML调用
window.deviceData = deviceData;
window.initializeSystem = initializeSystem;
window.renderDeviceList = renderDeviceList;
window.updateKeyMetrics = updateKeyMetrics;
window.startAnalysis = startAnalysis;
window.clearAnalysis = clearAnalysis;
window.exportAnalysisResults = exportAnalysisResults;
window.saveAnalysisConfig = saveAnalysisConfig;
window.loadAnalysisConfig = loadAnalysisConfig;
window.renderAnalysisResults = renderAnalysisResults;
// 暴露分析相关的全局变量
window.isAnalysisRunning = isAnalysisRunning;
window.currentAnalysisData = currentAnalysisData;
window.analysisResults = analysisResults;
window.analysisCharts = analysisCharts;