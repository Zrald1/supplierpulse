import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { dbStore } from './src/dbStore.js';
import { runAgentPipeline, jobEmitter, testAllKeys } from './src/agentOrchestrator.js';

// Load environmental parameters
dotenv.config();

// Ensure the db starts initialized
dbStore.init();

const app = express();
const PORT = 3000;

app.use(express.json());

// API ENDPOINTS GO FIRST

// 1. Health Probe
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1b. Test API Keys Connectivity
app.all('/api/test-keys', async (req, res) => {
  try {
    const custom_aiml_key = req.body?.custom_aiml_key || req.query?.custom_aiml_key || req.body?.custom_vultr_key || req.query?.custom_vultr_key;
    const results = await testAllKeys(custom_aiml_key as string);
    res.json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Key diagnosis trial failed' });
  }
});

// 2. Fetch Previously Scraped Vendors
app.get('/api/vendors', (req, res) => {
  try {
    const vendors = dbStore.getVendors();
    const reports = dbStore.getJobs().filter(j => j.status === 'complete');
    
    // Enrich vendors with latest scores and reports
    const populated = vendors.map(v => {
      const vendorJobs = dbStore.getJobs().filter(j => j.vendor_id === v.id);
      const latestJob = vendorJobs.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0];
      let score = null;
      let level = null;
      let reportId = null;

      if (latestJob) {
        const report = dbStore.getReportByJob(latestJob.id);
        if (report) {
          score = report.risk_score;
          level = report.risk_level;
          reportId = latestJob.id;
        }
      }

      return {
        ...v,
        latest_score: score ?? 45, // default baseline
        latest_level: level ?? 'LOW',
        latest_job_id: reportId
      };
    });

    res.json(populated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list vendors' });
  }
});

// 3. Trigger Active Vendor Analysis
app.post('/api/analyze', async (req, res) => {
  try {
    const { company_name, ai_mode, custom_brightdata_key, custom_aiml_key, custom_vultr_key } = req.body;
    if (!company_name || typeof company_name !== 'string' || !company_name.trim()) {
      return res.status(400).json({ error: 'Vendor parameter "company_name" is required' });
    }

    const cleanInput = company_name.trim();

    // Check if we need to link to existing or create a placeholder vendor initially
    let vendor = dbStore.findVendorByName(cleanInput);
    if (!vendor) {
      vendor = dbStore.createVendor(cleanInput, cleanInput, 'Commercial Operations');
    }

    // Launch background job
    const job = dbStore.createJob(vendor.id);
    
    // We execute runAgentPipeline asynchronously in the background. It will update the DB and emit search events.
    const active_aiml_key = custom_aiml_key || custom_vultr_key;
    runAgentPipeline(job.id, cleanInput, ai_mode, custom_brightdata_key, active_aiml_key).catch(err => {
      console.error(`Pipeline failure for job ${job.id}:`, err);
    });

    res.json({ job_id: job.id });
  } catch (error: any) {
    console.error('Error starting analysis job:', error);
    res.status(500).json({ error: error.message || 'Failed to initialize vendor scan' });
  }
});

// 4. Retrieve Detailed Intelligence Brief
app.get('/api/report/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;
    const job = dbStore.getJob(jobId);
    if (!job) {
      return res.status(404).json({ error: `Job with ID "${jobId}" was not found.` });
    }

    const report = dbStore.getReportByJob(jobId);
    if (!report) {
      return res.status(404).json({ error: `Intelligence report for Job ${jobId} is not compiled yet.` });
    }

    const signals = dbStore.getSignalsByJob(jobId);
    const vendor = dbStore.getVendor(job.vendor_id);

    res.json({
      job,
      vendor,
      report,
      signals
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load briefing card' });
  }
});

// 5. Server-Sent Events (SSE) Live Feed Router
app.get('/api/stream/:jobId', (req, res) => {
  const { jobId } = req.params;

  // Set SSE content headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // bypass nginx proxy buffering
  });

  // Keep-alive heartbeat interval to prevent gateway timeouts
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  // Define event listener callback
  const onJobUpdate = ({ event, data }: { event: string; data: any }) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    
    // If report is finished or crashes, we close connection cleanly
    if (event === 'report_ready' || event === 'error') {
      cleanup();
    }
  };

  // Add listener
  jobEmitter.on(`update:${jobId}`, onJobUpdate);

  // Cleanup handler
  const cleanup = () => {
    clearInterval(heartbeat);
    jobEmitter.removeListener(`update:${jobId}`, onJobUpdate);
    try {
      res.end();
    } catch (e) {}
  };

  req.on('close', cleanup);
  req.on('finish', cleanup);
});

// 6. Push report to external webhook target
app.post('/api/webhook/slack', async (req, res) => {
  try {
    const { report, company_name, custom_slack_webhook } = req.body;
    if (!report || !company_name) {
      return res.status(400).json({ error: 'Invalid payload elements: report and company_name required' });
    }

    const webhookUrl = custom_slack_webhook || process.env.SLACK_WEBHOOK_URL;
    let sentToRealSlack = false;

    const slackPayload = {
      text: `🚨 *SupplierPulse Risk Intelligence Brief: ${company_name}*`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*SupplierPulse Agent Incident Brief: ${company_name}*\n*Assessed Risk Index:* \`${report.risk_score}/100\` (${report.risk_level})`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Executive Posture Review:*\n${report.executive_summary}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Alert Level Signals:* \n${(report.key_risks || []).map((r: string) => `• ${r}`).join('\n')}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Recommended Action Plan:* \n${(report.recommended_actions || []).map((a: string) => `• ${a}`).join('\n')}`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `_Telemetry generated by SupplierPulse Live Web Intelligence Scraper Agent_`
            }
          ]
        }
      ]
    };

    if (webhookUrl && webhookUrl.startsWith('http')) {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload)
      });
      if (response.ok) {
        sentToRealSlack = true;
      }
    }

    res.json({
      success: true,
      sentToRealSlack,
      previewPayload: slackPayload
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Slack forwarder failure' });
  }
});


// Helper to send alert payloads to Slack webhooks
async function sendSlackAlert(companyName: string, report: any, webhookUrl: string): Promise<boolean> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) return false;

  const slackPayload = {
    text: `🚨 *SupplierPulse Risk Intelligence Brief: ${companyName}*`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*SupplierPulse Agent Incident Brief: ${companyName}*\n*Assessed Risk Index:* \`${report.risk_score}/100\` (${report.risk_level})`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Executive Posture Review:*\n${report.executive_summary}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Alert Level Signals:* \n${(report.key_risks || []).map((r: string) => `• ${r}`).join('\n')}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Recommended Action Plan:* \n${(report.recommended_actions || []).map((a: string) => `• ${a}`).join('\n')}`
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `_Telemetry generated by SupplierPulse Live Web Intelligence Scraper Agent_`
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload)
    });
    return response.ok;
  } catch (error) {
    console.error('Slack scheduled notification fetch failed:', error);
    return false;
  }
}

// Escapes special elements for secure Telegram HTML parsing
function escapeHTML(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Formats and sends intelligence brief to Telegram chats
async function sendTelegramAlert(companyName: string, report: any, botToken: string, chatId: string): Promise<boolean> {
  if (!botToken || !chatId) return false;

  const text = `🚨 <b>SupplierPulse Risk Intelligence Brief: ${escapeHTML(companyName)}</b>\n\n` +
    `<b>Assessed Risk Index:</b> <code>${report.risk_score}/100</code> (${report.risk_level})\n\n` +
    `<b>Executive Posture Review:</b>\n${escapeHTML(report.executive_summary)}\n\n` +
    `<b>Alert Level Signals:</b>\n${(report.key_risks || []).map((r: string) => `• ${escapeHTML(r)}`).join('\n')}\n\n` +
    `<b>Recommended Action Plan:</b>\n${(report.recommended_actions || []).map((a: string) => `• ${escapeHTML(a)}`).join('\n')}\n\n` +
    `<i>Telemetry generated by SupplierPulse Live Web Scraper Agent</i>`;

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
    return response.ok;
  } catch (error) {
    console.error('Telegram notification API call failed:', error);
    return false;
  }
}

// 7. Get All Schedules
app.get('/api/schedules', (req, res) => {
  try {
    const schedules = dbStore.getSchedules();
    res.json(schedules);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch active schedules list' });
  }
});

// 8. Create a New Schedule
app.post('/api/schedules', (req, res) => {
  try {
    const { 
      company_name, 
      interval_minutes, 
      slack_enabled, 
      slack_webhook_url, 
      telegram_enabled, 
      telegram_bot_token, 
      telegram_chat_id 
    } = req.body;

    if (!company_name || !company_name.trim()) {
      return res.status(400).json({ error: 'Vendor corporate target parameters are required.' });
    }

    const minutes = Number(interval_minutes) || 60;
    const now = new Date();
    const next_run = new Date(now.getTime() + minutes * 60 * 1000).toISOString();

    const schedule = dbStore.createSchedule({
      company_name: company_name.trim(),
      interval_minutes: minutes,
      slack_enabled: !!slack_enabled,
      slack_webhook_url: slack_webhook_url || '',
      telegram_enabled: !!telegram_enabled,
      telegram_bot_token: telegram_bot_token || '',
      telegram_chat_id: telegram_chat_id || '',
      next_run,
      status: 'active'
    });

    res.json(schedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to write schedule configuration' });
  }
});

// 9. Update an Existing Schedule
app.patch('/api/schedules/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Recalculate next run duration if interval changed
    if (updates.interval_minutes) {
      const existing = dbStore.getSchedule(id);
      if (existing) {
        const minutes = Number(updates.interval_minutes);
        const lastRunTime = existing.last_run ? new Date(existing.last_run) : new Date();
        updates.next_run = new Date(lastRunTime.getTime() + minutes * 60 * 1000).toISOString();
      }
    }

    const updated = dbStore.updateSchedule(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Scheduled task was not found.' });
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Schedule configuration updates failed' });
  }
});

// 10. Delete a Schedule
app.delete('/api/schedules/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = dbStore.deleteSchedule(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Scheduled task was not found.' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to clean task from disk' });
  }
});

// 11. Custom Telegram Webhook manual sandbox trigger
app.post('/api/webhook/telegram', async (req, res) => {
  try {
    const { report, company_name, custom_telegram_bot_token, custom_telegram_chat_id } = req.body;
    if (!report || !company_name) {
      return res.status(400).json({ error: 'Invalid payload properties. Raw report and company title required.' });
    }

    const botToken = custom_telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = custom_telegram_chat_id || process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(400).json({ error: 'Valid Bot Authorization Token and Chat Channel ID are required' });
    }

    const sent = await sendTelegramAlert(company_name, report, botToken, chatId);
    res.json({
      success: sent,
      message: sent ? 'Telegram notice dispatched' : 'Telegram api delivery call failed'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Telegram custom integration test failed' });
  }
});


// Helper to configure dynamic listeners to auto-send on pipeline success
function setupScheduleListener(jobId: string, schedule: any) {
  const onJobComplete = async ({ event, data }: { event: string; data: any }) => {
    if (event === 'report_ready') {
      const { report, company_name } = data;
      console.log(`[Scheduled Monitor] Job ${jobId} finished for ${company_name}. Sending notifications...`);

      // 1. Send via Slack Webhook
      if (schedule.slack_enabled) {
        const webhookUrl = schedule.slack_webhook_url || process.env.SLACK_WEBHOOK_URL;
        if (webhookUrl) {
          const ok = await sendSlackAlert(company_name, report, webhookUrl);
          console.log(`[Scheduled Monitor] Slack alert dispatched: ${ok}`);
        }
      }

      // 2. Send via Telegram Channels
      if (schedule.telegram_enabled) {
        const botToken = schedule.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN;
        const chatId = schedule.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;
        if (botToken && chatId) {
          const ok = await sendTelegramAlert(company_name, report, botToken, chatId);
          console.log(`[Scheduled Monitor] Telegram alert dispatched: ${ok}`);
        }
      }

      jobEmitter.removeListener(`update:${jobId}`, onJobComplete);
    } else if (event === 'error') {
      console.warn(`[Scheduled Monitor] Job ${jobId} errored out in parallel thread.`);
      jobEmitter.removeListener(`update:${jobId}`, onJobComplete);
    }
  };

  jobEmitter.on(`update:${jobId}`, onJobComplete);

  // Fallback cleanup timer (30 minutes) to release event listener resource leaks
  setTimeout(() => {
    jobEmitter.removeListener(`update:${jobId}`, onJobComplete);
  }, 30 * 60 * 1000);
}

// Background Chronology Thread: Polls schedules every 30 seconds
setInterval(async () => {
  try {
    const schedules = dbStore.getSchedules();
    const now = new Date();

    for (const schedule of schedules) {
      if (schedule.status !== 'active') continue;

      const runDate = new Date(schedule.next_run);
      if (now >= runDate) {
        console.log(`[Scheduled Thread] Executing backup pipeline scans for ${schedule.company_name}`);

        // Set next run window
        const nextTime = new Date(now.getTime() + schedule.interval_minutes * 60 * 1000).toISOString();
        dbStore.updateSchedule(schedule.id, {
          last_run: now.toISOString(),
          next_run: nextTime
        });

        // Initialize background scan jobs
        let vendor = dbStore.findVendorByName(schedule.company_name);
        if (!vendor) {
          vendor = dbStore.createVendor(schedule.company_name, schedule.company_name, 'Commercial Sectors');
        }

        const job = dbStore.createJob(vendor.id);

        // Bind active trigger notifications 
        setupScheduleListener(job.id, schedule);

        // Run multi-agent extraction
        runAgentPipeline(job.id, schedule.company_name).catch((err) => {
          console.error(`[Scheduled Thread] Pipeline crash: ${err?.message || String(err)}`);
        });
      }
    }
  } catch (err) {
    console.error('[Scheduled Thread] Chrono checker crashed:', err);
  }
}, 30000);


// FRONTEND ASSET OR VITE MIDDLEWARE SETUP

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SupplierPulse web application live on http://0.0.0.0:${PORT}`);
  });
}

startServer();
