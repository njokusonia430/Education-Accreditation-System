import { describe, it, expect, beforeEach } from 'vitest';

// Mock contract state
let courses = new Map<number, any>();
let completions = new Map<string, boolean>();
let nextCourseId = 0;

// Mock contract functions
const createCourse = (institution: string, name: string, criteria: string) => {
  const courseId = nextCourseId++;
  courses.set(courseId, { institution, name, criteria });
  return { type: 'ok', value: courseId };
};

const completeCourse = (institution: string, courseId: number, student: string) => {
  const course = courses.get(courseId);
  if (!course) return { type: 'err', value: 102 }; // ERR_INVALID_COURSE
  if (course.institution !== institution) return { type: 'err', value: 100 }; // ERR_UNAUTHORIZED
  const completionKey = `${courseId}-${student}`;
  if (completions.has(completionKey)) return { type: 'err', value: 101 }; // ERR_ALREADY_COMPLETED
  completions.set(completionKey, true);
  return { type: 'ok', value: true };
};

const getCourse = (courseId: number) => {
  const course = courses.get(courseId);
  return course ? { type: 'ok', value: course } : { type: 'err', value: 102 }; // ERR_INVALID_COURSE
};

const isCourseCompleted = (courseId: number, student: string) => {
  const completionKey = `${courseId}-${student}`;
  return { type: 'ok', value: completions.has(completionKey) };
};

describe('Course Completion Contract', () => {
  beforeEach(() => {
    courses.clear();
    completions.clear();
    nextCourseId = 0;
  });
  
  it('should create courses successfully', () => {
    const result = createCourse('institution1', 'Introduction to Blockchain', 'Complete all modules and pass final exam');
    expect(result.type).toBe('ok');
    expect(result.value).toBe(0);
    
    const courseDetails = getCourse(0);
    expect(courseDetails.type).toBe('ok');
    expect(courseDetails.value).toEqual({
      institution: 'institution1',
      name: 'Introduction to Blockchain',
      criteria: 'Complete all modules and pass final exam'
    });
  });
  
  it('should allow students to complete courses', () => {
    createCourse('institution1', 'Data Structures', 'Complete all assignments and final project');
    const result = completeCourse('institution1', 0, 'student1');
    expect(result.type).toBe('ok');
    expect(result.value).toBe(true);
    
    const completionStatus = isCourseCompleted(0, 'student1');
    expect(completionStatus.type).toBe('ok');
    expect(completionStatus.value).toBe(true);
  });
  
  it('should only allow the course institution to mark a course as completed', () => {
    createCourse('institution1', 'Machine Learning', 'Complete all modules and capstone project');
    const result = completeCourse('institution2', 0, 'student1');
    expect(result.type).toBe('err');
    expect(result.value).toBe(100); // ERR_UNAUTHORIZED
    
    const completionStatus = isCourseCompleted(0, 'student1');
    expect(completionStatus.type).toBe('ok');
    expect(completionStatus.value).toBe(false);
  });
  
  it('should not allow a course to be completed twice by the same student', () => {
    createCourse('institution1', 'Artificial Intelligence', 'Complete all modules and final project');
    const firstCompletion = completeCourse('institution1', 0, 'student1');
    expect(firstCompletion.type).toBe('ok');
    
    const secondCompletion = completeCourse('institution1', 0, 'student1');
    expect(secondCompletion.type).toBe('err');
    expect(secondCompletion.value).toBe(101); // ERR_ALREADY_COMPLETED
  });
  
  it('should fail when trying to complete a non-existent course', () => {
    const result = completeCourse('institution1', 999, 'student1');
    expect(result.type).toBe('err');
    expect(result.value).toBe(102); // ERR_INVALID_COURSE
  });
  
  it('should assign course IDs sequentially', () => {
    const course1 = createCourse('institution1', 'Course 1', 'Criteria 1');
    const course2 = createCourse('institution1', 'Course 2', 'Criteria 2');
    const course3 = createCourse('institution1', 'Course 3', 'Criteria 3');
    
    expect(course1.type).toBe('ok');
    expect(course1.value).toBe(0);
    expect(course2.type).toBe('ok');
    expect(course2.value).toBe(1);
    expect(course3.type).toBe('ok');
    expect(course3.value).toBe(2);
  });
});

