const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Fix 1: Add jobs and costEvents to Project model
const projectModelStart = schema.indexOf('model Project {');
const projectModelEnd = schema.indexOf('\n\n', projectModelStart);
const projectModel = schema.substring(projectModelStart, projectModelEnd);

// Find the chatMessages line and add after it
const chatMessagesLine = '  chatMessages       ChatMessage[]';
if (projectModel.includes(chatMessagesLine)) {
  const fixedProjectModel = projectModel.replace(
    chatMessagesLine,
    `${chatMessagesLine}\n  jobs               Job[]\n  costEvents         CostEvent[]`
  );
  schema = schema.replace(projectModel, fixedProjectModel);
  console.log('✓ Added jobs and costEvents to Project model');
}

// Fix 2: Add costEvents to Conversation model
const conversationModelStart = schema.indexOf('model Conversation {');
const conversationModelEnd = schema.indexOf('\n\n', conversationModelStart);
const conversationModel = schema.substring(conversationModelStart, conversationModelEnd);

const jobsLine = '  jobs        Job[]';
if (conversationModel.includes(jobsLine)) {
  const fixedConversationModel = conversationModel.replace(
    jobsLine,
    `${jobsLine}\n  costEvents  CostEvent[]`
  );
  schema = schema.replace(conversationModel, fixedConversationModel);
  console.log('✓ Added costEvents to Conversation model');
}

// Fix 3: Add costEvents to Job model
const jobModelStart = schema.indexOf('model Job {');
const jobModelEnd = schema.indexOf('\n\n', jobModelStart);
const jobModel = schema.substring(jobModelStart, jobModelEnd);

// Find the end of relations section in Job model
const jobRelationsEnd = jobModel.indexOf('\n\n  @@index');
if (jobRelationsEnd > 0) {
  const jobModelBeforeIndex = jobModel.substring(0, jobRelationsEnd);
  const jobModelAfterIndex = jobModel.substring(jobRelationsEnd);
  
  const fixedJobModel = jobModelBeforeIndex + '\n  costEvents  CostEvent[]' + jobModelAfterIndex;
  schema = schema.replace(jobModel, fixedJobModel);
  console.log('✓ Added costEvents to Job model');
}

// Write the fixed schema
fs.writeFileSync(schemaPath, schema);
console.log('✓ Schema fixed successfully!');