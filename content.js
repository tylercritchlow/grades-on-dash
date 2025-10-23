let gradesWidget = null;

function createGradesWidget(courses) {
  if (gradesWidget) {
    gradesWidget.remove();
  }

  gradesWidget = document.createElement('div');
  gradesWidget.id = 'grades-table';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'grades-header';
  header.textContent = 'Grades';
  
  // Create grades list
  const gradesList = document.createElement('div');
  gradesList.className = 'grades-list';
  
  for (const course of courses) {
    const gradeItem = document.createElement('div');
    gradeItem.className = 'grade-item';
    
    const courseName = document.createElement('span');
    courseName.className = 'course-name';
    courseName.textContent = course.name;
    
    const gradePercent = document.createElement('span');
    gradePercent.className = 'grade-percent';
    gradePercent.textContent = course.percentage + '%';
    
    gradeItem.appendChild(courseName);
    gradeItem.appendChild(gradePercent);
    gradesList.appendChild(gradeItem);
  }
  
  gradesWidget.appendChild(header);
  gradesWidget.appendChild(gradesList);

  const mainContent = document.querySelector('#content') || document.querySelector('main') || document.body;
  mainContent.insertBefore(gradesWidget, mainContent.firstChild);
}

async function loadGrades() {
  
  try {
    const result = await browser.storage.local.get(['canvasToken', 'canvasUrl']);
    
    if (!result.canvasToken || !result.canvasUrl) {
      createGradesWidget([{
        name: 'Please configure extension',
        score: 0,
        possible: 100,
        percentage: '0'
      }]);
      return;
    }

    const response = await browser.runtime.sendMessage({
      action: "fetchGrades",
      token: result.canvasToken,
      canvasUrl: result.canvasUrl
    });

    if (response.success) {
      createGradesWidget(response.data);
    } else {
      createGradesWidget([{
        name: 'Error: ' + response.error,
        score: 0,
        possible: 100,
        percentage: '0'
      }]);
    }
  } catch (error) {
    createGradesWidget([{
      name: 'Error: ' + error.message,
      score: 0,
      possible: 100,
      percentage: '0'
    }]);
  }
}

function isDashboardPage() {
  return window.location.pathname === '/' || 
         window.location.pathname.includes('/dashboard') ||
         document.querySelector('.ic-DashboardCard');
}

if (isDashboardPage()) {
  loadGrades();
}

// Also load when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (isDashboardPage()) loadGrades();
  });
} else {
  if (isDashboardPage()) loadGrades();
}
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (isDashboardPage()) {
      loadGrades();
    }
  }
}).observe(document, { subtree: true, childList: true });