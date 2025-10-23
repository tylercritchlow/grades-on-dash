browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchGrades") {
    fetchGrades(request.token, request.canvasUrl)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function fetchGrades(token, canvasUrl) {
  try {
    const response = await fetch(
      `${canvasUrl}/api/v1/courses?include[]=total_scores`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const courses = await response.json();
    
    const gradedCourses = courses
      .filter(course => {
        return course.enrollments && 
               course.enrollments.length > 0 && 
               course.enrollments[0].computed_current_score !== null;
      })
      .map(course => {
        const enrollment = course.enrollments[0];
        const score = enrollment.computed_current_score;
        const letterGrade = enrollment.computed_current_letter_grade || '';
        
        return {
          id: course.id,
          name: course.name || course.course_code || 'Unknown Course',
          score: score,
          possible: 100,
          percentage: score ? score.toFixed(1) : '0',
          letterGrade: letterGrade
        };
      });

    return gradedCourses;
  } catch (error) {
    console.error('Error fetching grades:', error);
    throw error;
  }
}