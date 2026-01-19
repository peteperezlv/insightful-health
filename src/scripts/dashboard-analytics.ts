/**
 * Dashboard Analytics Client Script
 * Uses tree-shakeable Chart.js imports with lazy loading
 */

let currentPeriod = 30;
let Chart: any = null;
let chartInstances: any[] = [];

// Lazy load only the Chart.js components we need
async function loadChartComponents() {
  if (Chart) return Chart;

  const {
    Chart: ChartClass,
    LineController,
    DoughnutController,
    LineElement,
    PointElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Filler,
    Tooltip,
  } = await import('chart.js');

  // Register only the components we need
  ChartClass.register(
    LineController,
    DoughnutController,
    LineElement,
    PointElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Filler,
    Tooltip
  );

  Chart = ChartClass;
  return ChartClass;
}

async function loadAnalytics() {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const summaryEl = document.getElementById('summary');
  const chartContainerEl = document.getElementById('chart-container');
  const deviceContainerEl = document.getElementById('device-container');
  const postsContainerEl = document.getElementById('posts-container');
  const referrersContainerEl = document.getElementById('referrers-container');

  try {
    loadingEl?.classList.remove('hidden');
    errorEl?.classList.add('hidden');
    summaryEl?.classList.add('hidden');
    chartContainerEl?.classList.add('hidden');
    deviceContainerEl?.classList.add('hidden');
    postsContainerEl?.classList.add('hidden');
    referrersContainerEl?.classList.add('hidden');

    // Destroy existing chart instances
    chartInstances.forEach((chart) => chart.destroy());
    chartInstances = [];

    const response = await fetch(`/api/analytics/posts?days=${currentPeriod}`, {
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error('Failed to load analytics');
    }

    const data = await response.json();
    loadingEl?.classList.add('hidden');

    if (!data.stats || data.stats.length === 0) {
      errorEl?.classList.remove('hidden');
      errorEl!.innerHTML =
        '<p class="text-gray-600">No analytics data available yet. Start creating posts!</p>';
      return;
    }

    // Calculate totals
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    const allViewsByDay: Record<string, number> = {};
    let mobileViews = 0;
    let desktopViews = 0;
    const allReferrers: Record<string, number> = {};

    data.stats.forEach((stat: any) => {
      totalViews += stat.views || 0;
      totalLikes += stat.likes || 0;
      totalComments += stat.comments || 0;

      if (stat.viewsByDay) {
        Object.entries(stat.viewsByDay).forEach(([day, count]) => {
          allViewsByDay[day] = (allViewsByDay[day] || 0) + (count as number);
        });
      }

      if (stat.devices) {
        mobileViews += stat.devices.mobile || 0;
        desktopViews += stat.devices.desktop || 0;
      }

      if (stat.referrers) {
        Object.entries(stat.referrers).forEach(([domain, count]) => {
          allReferrers[domain] = (allReferrers[domain] || 0) + (count as number);
        });
      }
    });

    // Update summary cards
    document.getElementById('total-views')!.textContent = totalViews.toLocaleString();
    document.getElementById('total-likes')!.textContent = totalLikes.toLocaleString();
    document.getElementById('total-comments')!.textContent = totalComments.toLocaleString();
    document.getElementById('total-posts')!.textContent = data.total.toString();
    summaryEl?.classList.remove('hidden');

    // Load Chart.js only when we need to create charts
    const ChartJS = await loadChartComponents();

    // Create views chart
    const sortedDays = Object.entries(allViewsByDay).sort(([a], [b]) => a.localeCompare(b));
    const chartCanvas = document.getElementById('views-chart') as HTMLCanvasElement;

    if (chartCanvas && sortedDays.length > 0) {
      const viewsChart = new ChartJS(chartCanvas, {
        type: 'line',
        data: {
          labels: sortedDays.map(([day]) => {
            const date = new Date(day);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }),
          datasets: [
            {
              label: 'Views',
              data: sortedDays.map(([, count]) => count),
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
            tooltip: {},
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 },
            },
          },
        },
      });
      chartInstances.push(viewsChart);
      chartContainerEl?.classList.remove('hidden');
    }

    // Create device chart
    const deviceCanvas = document.getElementById('device-chart') as HTMLCanvasElement;
    if (deviceCanvas && (mobileViews > 0 || desktopViews > 0)) {
      const deviceChart = new ChartJS(deviceCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Mobile', 'Desktop'],
          datasets: [
            {
              data: [mobileViews, desktopViews],
              backgroundColor: ['rgb(59, 130, 246)', 'rgb(99, 102, 241)'],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            tooltip: {},
          },
        },
      });
      chartInstances.push(deviceChart);
      deviceContainerEl?.classList.remove('hidden');
    }

    // Populate posts table
    const tableBody = document.getElementById('posts-table-body');
    if (tableBody) {
      tableBody.innerHTML = data.stats
        .map(
          (stat: any) => `
        <tr>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">
              <a href="/post/${stat.postSlug}" class="hover:text-emerald-600">${stat.postTitle || 'Untitled'}</a>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${stat.views.toLocaleString()}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${stat.likes.toLocaleString()}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${stat.comments.toLocaleString()}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${stat.publishedAt ? new Date(stat.publishedAt).toLocaleDateString() : 'N/A'}
          </td>
        </tr>
      `
        )
        .join('');
      postsContainerEl?.classList.remove('hidden');
    }

    // Display top referrers
    const referrersList = document.getElementById('referrers-list');
    if (referrersList && Object.keys(allReferrers).length > 0) {
      const sortedReferrers = Object.entries(allReferrers)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      referrersList.innerHTML = sortedReferrers
        .map(
          ([domain, count]) => `
        <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span class="text-sm font-medium text-gray-900">${domain}</span>
          <span class="text-sm text-gray-600">${count} views</span>
        </div>
      `
        )
        .join('');
      referrersContainerEl?.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error loading analytics:', error);
    loadingEl?.classList.add('hidden');
    errorEl?.classList.remove('hidden');
  }
}

// Load on page load
loadAnalytics();

// Period selector
const periodSelect = document.getElementById('period') as HTMLSelectElement;
periodSelect?.addEventListener('change', (e) => {
  currentPeriod = parseInt((e.target as HTMLSelectElement).value);
  loadAnalytics();
});
