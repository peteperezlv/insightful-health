/**
 * Admin Analytics Client Script
 * Uses tree-shakeable Chart.js imports with lazy loading
 */

// Make this file a proper ES module to avoid global scope conflicts
export {};

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
  const totalsEl = document.getElementById('totals');
  const activityEl = document.getElementById('activity');
  const chartContainerEl = document.getElementById('chart-container');
  const eventsContainerEl = document.getElementById('events-container');
  const topPostsContainerEl = document.getElementById('top-posts-container');
  const authorsContainerEl = document.getElementById('authors-container');
  const searchesContainerEl = document.getElementById('searches-container');

  try {
    loadingEl?.classList.remove('hidden');
    errorEl?.classList.add('hidden');
    totalsEl?.classList.add('hidden');
    activityEl?.classList.add('hidden');
    chartContainerEl?.classList.add('hidden');
    eventsContainerEl?.classList.add('hidden');
    topPostsContainerEl?.classList.add('hidden');
    authorsContainerEl?.classList.add('hidden');
    searchesContainerEl?.classList.add('hidden');

    // Destroy existing chart instances
    chartInstances.forEach((chart) => chart.destroy());
    chartInstances = [];

    const response = await fetch(`/api/analytics/platform?days=${currentPeriod}`, {
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error('Failed to load analytics');
    }

    const data = await response.json();
    loadingEl?.classList.add('hidden');

    // Update total counts
    document.getElementById('total-users')!.textContent = data.totals.users.toLocaleString();
    document.getElementById('total-posts')!.textContent = data.totals.posts.toLocaleString();
    document.getElementById('total-comments')!.textContent = data.totals.comments.toLocaleString();
    document.getElementById('total-likes')!.textContent = data.totals.likes.toLocaleString();
    document.getElementById('new-users')!.textContent = `+${data.period.newUsers} this period`;
    document.getElementById('new-posts')!.textContent = `+${data.period.newPosts} this period`;
    totalsEl?.classList.remove('hidden');

    // Update activity stats
    document.getElementById('active-users')!.textContent = data.period.activeUsers.toLocaleString();
    document.getElementById('active-sessions')!.textContent = data.period.activeSessions.toLocaleString();
    document.getElementById('total-events')!.textContent = data.events.total.toLocaleString();
    activityEl?.classList.remove('hidden');

    // Load Chart.js only when we need to create charts
    const ChartJS = await loadChartComponents();

    // Create activity chart
    const sortedDays = Object.entries(data.events.byDay || {}).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    const activityCanvas = document.getElementById('activity-chart') as HTMLCanvasElement;
    if (activityCanvas && sortedDays.length > 0) {
      const activityChart = new ChartJS(activityCanvas, {
        type: 'line',
        data: {
          labels: sortedDays.map(([day]) => {
            const date = new Date(day);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }),
          datasets: [
            {
              label: 'Events',
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
      chartInstances.push(activityChart);
      chartContainerEl?.classList.remove('hidden');
    }

    // Create events chart
    const eventsCanvas = document.getElementById('events-chart') as HTMLCanvasElement;
    if (eventsCanvas && data.events.byType) {
      const eventTypes = Object.entries(data.events.byType);
      const eventsChart = new ChartJS(eventsCanvas, {
        type: 'doughnut',
        data: {
          labels: eventTypes.map(([type]) => type.charAt(0).toUpperCase() + type.slice(1)),
          datasets: [
            {
              data: eventTypes.map(([, count]) => count),
              backgroundColor: [
                'rgb(59, 130, 246)',
                'rgb(239, 68, 68)',
                'rgb(34, 197, 94)',
                'rgb(168, 85, 247)',
                'rgb(251, 146, 60)',
                'rgb(236, 72, 153)',
              ],
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
      chartInstances.push(eventsChart);
      eventsContainerEl?.classList.remove('hidden');
    }

    // Populate top posts table
    const topPostsBody = document.getElementById('top-posts-body');
    if (topPostsBody && data.topPosts && data.topPosts.length > 0) {
      topPostsBody.innerHTML = data.topPosts
        .map(
          (post: any) => `
        <tr>
          <td class="px-6 py-4">
            <div class="text-sm font-medium text-gray-900">
              <a href="/post/${post.slug}" class="hover:text-emerald-600">${post.title || 'Untitled'}</a>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${post.author}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${post.views.toLocaleString()}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${post.likes.toLocaleString()}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${post.comments.toLocaleString()}</td>
        </tr>
      `
        )
        .join('');
      topPostsContainerEl?.classList.remove('hidden');
    }

    // Populate trending authors table
    const authorsBody = document.getElementById('authors-body');
    if (authorsBody && data.trendingAuthors && data.trendingAuthors.length > 0) {
      authorsBody.innerHTML = data.trendingAuthors
        .map(
          (author: any) => `
        <tr>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${author.name}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${author.posts}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${author.views.toLocaleString()}</td>
        </tr>
      `
        )
        .join('');
      authorsContainerEl?.classList.remove('hidden');
    }

    // Display popular searches
    const searchesList = document.getElementById('searches-list');
    if (searchesList && data.popularSearches && data.popularSearches.length > 0) {
      searchesList.innerHTML = data.popularSearches
        .map(
          (search: any) => `
        <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span class="text-sm font-medium text-gray-900">"${search.query}"</span>
          <span class="text-sm text-gray-600">${search.count} searches</span>
        </div>
      `
        )
        .join('');
      searchesContainerEl?.classList.remove('hidden');
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
