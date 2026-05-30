import fs from 'fs';
import path from 'path';
import { Vendor, AnalysisJob, Signal, IntelligenceReport, ScheduledTask } from './types.js';

const DB_FILE = path.join(process.cwd(), 'database.json');

interface Schema {
  vendors: Vendor[];
  jobs: AnalysisJob[];
  signals: Signal[];
  reports: IntelligenceReport[];
  schedules?: ScheduledTask[];
}

const defaultSchema: Schema = {
  vendors: [],
  jobs: [],
  signals: [],
  reports: [],
  schedules: []
};

// Ensure database file exists
function readDb(): Schema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultSchema, null, 2), 'utf-8');
      return defaultSchema;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const db = JSON.parse(content) as Schema;
    if (!db.schedules) {
      db.schedules = [];
    }
    return db;
  } catch (error) {
    console.error('Error reading database file, returning default schema:', error);
    return defaultSchema;
  }
}

function writeDb(data: Schema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
}

export const dbStore = {
  init(): void {
    readDb();
  },

  // VENDORS
  getVendors(): Vendor[] {
    return readDb().vendors;
  },

  getVendor(id: string): Vendor | undefined {
    return readDb().vendors.find(v => v.id === id);
  },

  findVendorByName(name: string): Vendor | undefined {
    const clean = name.toLowerCase().trim();
    return readDb().vendors.find(
      v => v.name.toLowerCase() === clean || v.canonical_name.toLowerCase() === clean
    );
  },

  createVendor(name: string, canonicalName: string, industry?: string): Vendor {
    const db = readDb();
    
    // Check if vendor already exists
    const existing = db.vendors.find(
      v => v.canonical_name.toLowerCase() === canonicalName.toLowerCase()
    );
    if (existing) {
      existing.last_analyzed = new Date().toISOString();
      if (industry && !existing.industry) {
        existing.industry = industry;
      }
      writeDb(db);
      return existing;
    }

    const newVendor: Vendor = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      canonical_name: canonicalName,
      industry,
      created_at: new Date().toISOString(),
      last_analyzed: new Date().toISOString()
    };

    db.vendors.push(newVendor);
    writeDb(db);
    return newVendor;
  },

  // JOBS
  getJobs(): AnalysisJob[] {
    return readDb().jobs;
  },

  getJob(id: string): AnalysisJob | undefined {
    return readDb().jobs.find(j => j.id === id);
  },

  createJob(vendorId: string): AnalysisJob {
    const db = readDb();
    const newJob: AnalysisJob = {
      id: Math.random().toString(36).substring(2, 15),
      vendor_id: vendorId,
      status: 'pending',
      started_at: new Date().toISOString()
    };
    db.jobs.push(newJob);
    writeDb(db);
    return newJob;
  },

  updateJobStatus(id: string, status: AnalysisJob['status'], errorMessage?: string): void {
    const db = readDb();
    const job = db.jobs.find(j => j.id === id);
    if (job) {
      job.status = status;
      if (status === 'complete' || status === 'error') {
        job.completed_at = new Date().toISOString();
      }
      if (errorMessage) {
        job.error_message = errorMessage;
      }
      writeDb(db);
    }
  },

  // SIGNALS
  getSignalsByJob(jobId: string): Signal[] {
    return readDb().signals.filter(s => s.job_id === jobId);
  },

  createSignal(signalData: Omit<Signal, 'id'>): Signal {
    const db = readDb();
    const newSignal: Signal = {
      id: Math.random().toString(36).substring(2, 11),
      ...signalData
    };
    db.signals.push(newSignal);
    writeDb(db);
    return newSignal;
  },

  // REPORTS
  getReportByJob(jobId: string): IntelligenceReport | undefined {
    return readDb().reports.find(r => r.job_id === jobId);
  },

  createReport(reportData: Omit<IntelligenceReport, 'id'>): IntelligenceReport {
    const db = readDb();
    const newReport: IntelligenceReport = {
      id: Math.random().toString(36).substring(2, 11),
      ...reportData
    };
    db.reports.push(newReport);
    writeDb(db);
    return newReport;
  },

  // SCHEDULES
  getSchedules(): ScheduledTask[] {
    return readDb().schedules || [];
  },

  getSchedule(id: string): ScheduledTask | undefined {
    return this.getSchedules().find(s => s.id === id);
  },

  createSchedule(scheduleData: Omit<ScheduledTask, 'id' | 'created_at'>): ScheduledTask {
    const db = readDb();
    if (!db.schedules) db.schedules = [];
    
    const newSchedule: ScheduledTask = {
      id: Math.random().toString(36).substring(2, 11),
      created_at: new Date().toISOString(),
      ...scheduleData
    };
    
    db.schedules.push(newSchedule);
    writeDb(db);
    return newSchedule;
  },

  updateSchedule(id: string, updates: Partial<ScheduledTask>): ScheduledTask | undefined {
    const db = readDb();
    if (!db.schedules) db.schedules = [];
    
    const index = db.schedules.findIndex(s => s.id === id);
    if (index !== -1) {
      db.schedules[index] = {
        ...db.schedules[index],
        ...updates
      } as ScheduledTask;
      writeDb(db);
      return db.schedules[index];
    }
    return undefined;
  },

  deleteSchedule(id: string): boolean {
    const db = readDb();
    if (!db.schedules) return false;
    
    const initialLength = db.schedules.length;
    db.schedules = db.schedules.filter(s => s.id !== id);
    
    if (db.schedules.length !== initialLength) {
      writeDb(db);
      return true;
    }
    return false;
  }
};
