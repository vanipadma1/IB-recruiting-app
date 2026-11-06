import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initialSeedData } from './src/data/seedData.ts';
import { AppState } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'ib_recruiting_db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load or initialize DB
function loadDb(): AppState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data) as AppState;
    }
  } catch (err) {
    console.error('Error reading DB file, reinitializing with seed data:', err);
  }
  saveDb(initialSeedData);
  return initialSeedData;
}

function saveDb(state: AppState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

let dbState: AppState = loadDb();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Endpoints
  app.get('/api/state', (req, res) => {
    res.json(dbState);
  });

  app.post('/api/state', (req, res) => {
    if (req.body && typeof req.body === 'object') {
      dbState = { ...dbState, ...req.body };
      saveDb(dbState);
      return res.json({ success: true, state: dbState });
    }
    res.status(400).json({ error: 'Invalid state payload' });
  });

  app.post('/api/reset', (req, res) => {
    dbState = JSON.parse(JSON.stringify(initialSeedData));
    saveDb(dbState);
    res.json({ success: true, message: 'Database reset to initial sample data', state: dbState });
  });

  // Contacts CRUD
  app.post('/api/contacts', (req, res) => {
    const contact = req.body;
    if (!contact.id) {
      contact.id = 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      contact.dateAdded = contact.dateAdded || new Date().toISOString().split('T')[0];
    }
    contact.fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    
    const index = dbState.contacts.findIndex((c) => c.id === contact.id);
    if (index >= 0) {
      dbState.contacts[index] = { ...dbState.contacts[index], ...contact };
    } else {
      dbState.contacts.unshift(contact);
    }
    saveDb(dbState);
    res.json(contact);
  });

  app.delete('/api/contacts/:id', (req, res) => {
    const id = req.params.id;
    dbState.contacts = dbState.contacts.filter((c) => c.id !== id);
    dbState.interactions = dbState.interactions.filter((i) => i.contactId !== id);
    // Unlink from applications
    dbState.applications.forEach((appItem) => {
      if (appItem.referralContactId === id) appItem.referralContactId = null;
      appItem.associatedContactIds = appItem.associatedContactIds.filter((cId) => cId !== id);
    });
    // Unlink from tasks
    dbState.tasks.forEach((t) => {
      if (t.contactId === id) t.contactId = null;
    });
    saveDb(dbState);
    res.json({ success: true, deletedId: id });
  });

  // Interactions CRUD
  app.post('/api/interactions', (req, res) => {
    const interaction = req.body;
    if (!interaction.id) {
      interaction.id = 'int_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      interaction.createdAt = new Date().toISOString();
    }
    const index = dbState.interactions.findIndex((i) => i.id === interaction.id);
    if (index >= 0) {
      dbState.interactions[index] = { ...dbState.interactions[index], ...interaction };
    } else {
      dbState.interactions.unshift(interaction);
    }

    // Update parent contact's lastContactedDate and nextFollowUpDate
    const contact = dbState.contacts.find((c) => c.id === interaction.contactId);
    if (contact) {
      if (!contact.lastContactedDate || interaction.date >= contact.lastContactedDate) {
        contact.lastContactedDate = interaction.date;
      }
      if (interaction.followUpDeadline) {
        contact.nextFollowUpDate = interaction.followUpDeadline;
      }
      if (contact.connectionStatus === 'Identified' || contact.connectionStatus === 'Outreach Sent') {
        contact.connectionStatus = 'Spoke';
      }
    }

    saveDb(dbState);
    res.json(interaction);
  });

  app.delete('/api/interactions/:id', (req, res) => {
    const id = req.params.id;
    dbState.interactions = dbState.interactions.filter((i) => i.id !== id);
    saveDb(dbState);
    res.json({ success: true, deletedId: id });
  });

  // Applications CRUD
  app.post('/api/applications', (req, res) => {
    const application = req.body;
    if (!application.id) {
      application.id = 'app_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    }
    const index = dbState.applications.findIndex((a) => a.id === application.id);
    if (index >= 0) {
      dbState.applications[index] = { ...dbState.applications[index], ...application };
    } else {
      dbState.applications.unshift(application);
    }
    saveDb(dbState);
    res.json(application);
  });

  app.delete('/api/applications/:id', (req, res) => {
    const id = req.params.id;
    dbState.applications = dbState.applications.filter((a) => a.id !== id);
    saveDb(dbState);
    res.json({ success: true, deletedId: id });
  });

  // Documents CRUD
  app.post('/api/documents', (req, res) => {
    const doc = req.body;
    if (!doc.id) {
      doc.id = 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      doc.dateCreated = doc.dateCreated || new Date().toISOString().split('T')[0];
    }
    doc.lastUpdated = new Date().toISOString().split('T')[0];
    const index = dbState.documents.findIndex((d) => d.id === doc.id);
    if (index >= 0) {
      dbState.documents[index] = { ...dbState.documents[index], ...doc };
    } else {
      dbState.documents.unshift(doc);
    }
    saveDb(dbState);
    res.json(doc);
  });

  app.delete('/api/documents/:id', (req, res) => {
    const id = req.params.id;
    dbState.documents = dbState.documents.filter((d) => d.id !== id);
    saveDb(dbState);
    res.json({ success: true, deletedId: id });
  });

  // Interviews CRUD
  app.post('/api/interviews', (req, res) => {
    const interview = req.body;
    if (!interview.id) {
      interview.id = 'intv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    }
    const index = dbState.interviews.findIndex((i) => i.id === interview.id);
    if (index >= 0) {
      dbState.interviews[index] = { ...dbState.interviews[index], ...interview };
    } else {
      dbState.interviews.unshift(interview);
    }
    saveDb(dbState);
    res.json(interview);
  });

  app.delete('/api/interviews/:id', (req, res) => {
    const id = req.params.id;
    dbState.interviews = dbState.interviews.filter((i) => i.id !== id);
    saveDb(dbState);
    res.json({ success: true, deletedId: id });
  });

  // Question bank update
  app.post('/api/prep-questions', (req, res) => {
    const updated = req.body;
    const index = dbState.prepQuestions.findIndex((q) => q.id === updated.id);
    if (index >= 0) {
      dbState.prepQuestions[index] = { ...dbState.prepQuestions[index], ...updated };
    } else {
      if (!updated.id) updated.id = 'q_' + Date.now();
      dbState.prepQuestions.push(updated);
    }
    saveDb(dbState);
    res.json(dbState.prepQuestions);
  });

  // Tasks CRUD
  app.post('/api/tasks', (req, res) => {
    const task = req.body;
    if (!task.id) {
      task.id = 't_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    }
    const index = dbState.tasks.findIndex((t) => t.id === task.id);
    if (index >= 0) {
      dbState.tasks[index] = { ...dbState.tasks[index], ...task };
    } else {
      dbState.tasks.unshift(task);
    }
    saveDb(dbState);
    res.json(task);
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const id = req.params.id;
    dbState.tasks = dbState.tasks.filter((t) => t.id !== id);
    saveDb(dbState);
    res.json({ success: true, deletedId: id });
  });

  // Banks profile update
  app.post('/api/banks', (req, res) => {
    const bank = req.body;
    if (!bank.id) {
      bank.id = 'b_' + Date.now();
    }
    const index = dbState.banks.findIndex((b) => b.id === bank.id);
    if (index >= 0) {
      dbState.banks[index] = { ...dbState.banks[index], ...bank };
    } else {
      dbState.banks.push(bank);
    }
    saveDb(dbState);
    res.json(bank);
  });

  // Goals update
  app.post('/api/goals', (req, res) => {
    dbState.goals = { ...dbState.goals, ...req.body };
    saveDb(dbState);
    res.json(dbState.goals);
  });

  // User Profile update
  app.post('/api/profile', (req, res) => {
    dbState.userProfile = { ...dbState.userProfile, ...req.body };
    saveDb(dbState);
    res.json(dbState.userProfile);
  });

  // CSV Export endpoint
  app.get('/api/export-csv/:type', (req, res) => {
    const type = req.params.type;
    let csv = '';

    if (type === 'contacts') {
      const headers = [
        'ID',
        'First Name',
        'Last Name',
        'Bank',
        'Firm Type',
        'Division',
        'Group',
        'Job Title',
        'Seniority',
        'School',
        'Grad Year',
        'Location',
        'Email',
        'LinkedIn',
        'How Found',
        'Referral Source',
        'Connection Status',
        'Relationship Strength (1-5)',
        'Date Added',
        'Last Contacted',
        'Next Follow Up',
        'Notes',
      ];
      const rows = dbState.contacts.map((c) =>
        [
          c.id,
          `"${(c.firstName || '').replace(/"/g, '""')}"`,
          `"${(c.lastName || '').replace(/"/g, '""')}"`,
          `"${(c.bank || '').replace(/"/g, '""')}"`,
          `"${(c.firmType || '').replace(/"/g, '""')}"`,
          `"${(c.division || '').replace(/"/g, '""')}"`,
          `"${(c.group || '').replace(/"/g, '""')}"`,
          `"${(c.jobTitle || '').replace(/"/g, '""')}"`,
          `"${(c.seniority || '').replace(/"/g, '""')}"`,
          `"${(c.school || '').replace(/"/g, '""')}"`,
          c.gradYear || '',
          `"${(c.location || '').replace(/"/g, '""')}"`,
          `"${(c.email || '').replace(/"/g, '""')}"`,
          `"${(c.linkedinUrl || '').replace(/"/g, '""')}"`,
          `"${(c.howFound || '').replace(/"/g, '""')}"`,
          `"${(c.referralSource || '').replace(/"/g, '""')}"`,
          `"${(c.connectionStatus || '').replace(/"/g, '""')}"`,
          c.relationshipStrength,
          c.dateAdded,
          c.lastContactedDate || '',
          c.nextFollowUpDate || '',
          `"${(c.notes || '').replace(/"/g, '""')}"`,
        ].join(',')
      );
      csv = [headers.join(','), ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="ib_contacts.csv"');
      return res.send(csv);
    }

    if (type === 'applications') {
      const headers = [
        'ID',
        'Bank',
        'Firm Type',
        'Position Title',
        'Division',
        'Group',
        'Program',
        'Location',
        'Recruiting Cycle',
        'Status',
        'Deadline',
        'Date Applied',
        'Resume Version',
        'Cover Letter Version',
        'Recruiter Contact',
        'Notes',
        'Next Action',
        'Next Action Deadline',
      ];
      const rows = dbState.applications.map((a) =>
        [
          a.id,
          `"${(a.bank || '').replace(/"/g, '""')}"`,
          `"${(a.firmType || '').replace(/"/g, '""')}"`,
          `"${(a.positionTitle || '').replace(/"/g, '""')}"`,
          `"${(a.division || '').replace(/"/g, '""')}"`,
          `"${(a.group || '').replace(/"/g, '""')}"`,
          `"${(a.internshipProgram || '').replace(/"/g, '""')}"`,
          `"${(a.location || '').replace(/"/g, '""')}"`,
          `"${(a.recruitingCycle || '').replace(/"/g, '""')}"`,
          `"${(a.status || '').replace(/"/g, '""')}"`,
          a.applicationDeadline,
          a.dateApplied || '',
          `"${(a.resumeVersionUsed || '').replace(/"/g, '""')}"`,
          `"${(a.coverLetterVersionUsed || '').replace(/"/g, '""')}"`,
          `"${(a.recruiterContact || '').replace(/"/g, '""')}"`,
          `"${(a.notes || '').replace(/"/g, '""')}"`,
          `"${(a.nextAction || '').replace(/"/g, '""')}"`,
          a.nextActionDeadline || '',
        ].join(',')
      );
      csv = [headers.join(','), ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="ib_applications.csv"');
      return res.send(csv);
    }

    res.status(400).send('Unsupported export type');
  });

  // Mount Vite or static dist
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IB Recruiting Hub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
