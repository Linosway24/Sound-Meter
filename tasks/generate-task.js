#!/usr/bin/env node

/**
 * Task Generator Script
 * 
 * Generates a task planning file from a task list file and task number.
 * 
 * Usage:
 *   node generate-task.js <task-list-file> <task-number>
 * 
 * Example:
 *   node generate-task.js tasks-PRD.md 2.0
 *   node generate-task.js tasks-PRD.md 1.0
 */

const fs = require('fs');
const path = require('path');

// Get arguments
const taskListFile = process.argv[2];
const taskNumber = process.argv[3];

if (!taskListFile || !taskNumber) {
  console.error('Usage: node generate-task.js <task-list-file> <task-number>');
  console.error('Example: node generate-task.js tasks-PRD.md 2.0');
  process.exit(1);
}

// File paths
const templateFile = path.join(__dirname, 'task-template.md');
const taskListPath = path.resolve(taskListFile);

// Check files exist
if (!fs.existsSync(templateFile)) {
  console.error(`Error: Template file not found: ${templateFile}`);
  process.exit(1);
}

if (!fs.existsSync(taskListPath)) {
  console.error(`Error: Task list file not found: ${taskListPath}`);
  process.exit(1);
}

// Parse task list file
function parseTaskList(content) {
  const lines = content.split('\n');
  const tasks = {};
  let currentTask = null;
  let currentSubTasks = [];
  
  for (const line of lines) {
    // Match main task: "- [ ] 1.0 Device Structure & Visual Layout"
    const mainTaskMatch = line.match(/^- \[ \] (\d+\.\d+)\s+(.+)$/);
    if (mainTaskMatch) {
      if (currentTask) {
        tasks[currentTask.number] = {
          ...currentTask,
          subTasks: currentSubTasks
        };
      }
      currentTask = {
        number: mainTaskMatch[1],
        title: mainTaskMatch[2].trim()
      };
      currentSubTasks = [];
      continue;
    }
    
    // Match sub-task: "  - [ ] 1.1 Create HTML structure..."
    const subTaskMatch = line.match(/^\s+- \[ \] ([\d.]+)\s+(.+)$/);
    if (subTaskMatch && currentTask) {
      currentSubTasks.push({
        number: subTaskMatch[1],
        description: subTaskMatch[2].trim()
      });
    }
  }
  
  // Add last task
  if (currentTask) {
    tasks[currentTask.number] = {
      ...currentTask,
      subTasks: currentSubTasks
    };
  }
  
  return tasks;
}

// Generate task file content
function generateTaskFile(taskListFilename, taskNumber, taskData) {
  const template = fs.readFileSync(templateFile, 'utf8');
  
  // Replace [TASK-LIST-FILE] with actual filename
  let content = template.replace(/\[TASK-LIST-FILE\]/g, taskListFilename);
  
  // Replace task number
  content = content.replace(/X\.X/g, taskNumber);
  content = content.replace(/X-X/g, taskNumber.replace('.', '-'));
  
  // Replace task title in header and title section
  content = content.replace(/\[Task Title from.*?\]/g, taskData.title);
  content = content.replace(/\[Copy task title from.*?\], e\.g\., ".*?"\]/g, taskData.title);
  
  // Build success criteria from sub-tasks
  const successCriteria = taskData.subTasks.map(st => {
    return `- [ ] ${st.number}: ${st.description}`;
  }).join('\n');
  
  // Replace success criteria placeholder - find the section and replace everything after the instruction
  const successCriteriaHeader = '### Success Criteria\n[Copy all sub-tasks from';
  const successCriteriaStart = content.indexOf(successCriteriaHeader);
  if (successCriteriaStart !== -1) {
    const sectionEnd = content.indexOf('\n---', successCriteriaStart);
    const beforeSection = content.substring(0, successCriteriaStart);
    const afterSection = sectionEnd !== -1 ? content.substring(sectionEnd) : '';
    content = beforeSection + `### Success Criteria\n${successCriteria}` + afterSection;
  }
  
  // Build implementation plan from sub-tasks
  const implementationPlan = taskData.subTasks.map((st, index) => {
    return `${index + 1}. **${st.number}** ${st.description}`;
  }).join('\n');
  
  // Replace implementation plan placeholder - find the section and replace
  const implPlanHeader = '[Break down implementation into phases, using sub-tasks from';
  const implPlanStart = content.indexOf(implPlanHeader);
  if (implPlanStart !== -1) {
    const implPlanEnd = content.indexOf('[Continue for all sub-tasks...]', implPlanStart);
    if (implPlanEnd !== -1) {
      const beforeImpl = content.substring(0, implPlanStart);
      const afterImpl = content.substring(implPlanEnd + '[Continue for all sub-tasks...]'.length);
      content = beforeImpl + implementationPlan + afterImpl;
    }
  }
  
  // Replace implementation workflow sub-tasks
  const workflowSubTasks = taskData.subTasks.map(st => {
    return `   - Implement ${st.number}: ${st.description}`;
  }).join('\n');
  
  const workflowHeader = '[List all sub-tasks from';
  const workflowStart = content.indexOf(workflowHeader);
  if (workflowStart !== -1) {
    const workflowEnd = content.indexOf('[Continue for all sub-tasks...]', workflowStart);
    if (workflowEnd !== -1) {
      const beforeWorkflow = content.substring(0, workflowStart);
      const afterWorkflow = content.substring(workflowEnd + '[Continue for all sub-tasks...]'.length);
      content = beforeWorkflow + workflowSubTasks + afterWorkflow;
    }
  }
  
  return content;
}

// Main execution
try {
  const taskListContent = fs.readFileSync(taskListPath, 'utf8');
  const tasks = parseTaskList(taskListContent);
  const taskData = tasks[taskNumber];
  
  if (!taskData) {
    console.error(`Error: Task ${taskNumber} not found in ${taskListFile}`);
    console.error(`Available tasks: ${Object.keys(tasks).join(', ')}`);
    process.exit(1);
  }
  
  const taskListFilename = path.basename(taskListFile);
  const taskContent = generateTaskFile(taskListFilename, taskNumber, taskData);
  const outputFile = path.join(__dirname, `task-${taskNumber.replace('.', '-')}.md`);
  
  fs.writeFileSync(outputFile, taskContent, 'utf8');
  console.log(`✅ Generated task file: ${outputFile}`);
  console.log(`   Task: ${taskNumber} - ${taskData.title}`);
  console.log(`   Sub-tasks: ${taskData.subTasks.length}`);
  console.log(`   Task list file: ${taskListFilename}`);
  
} catch (error) {
  console.error('Error generating task file:', error.message);
  process.exit(1);
}

