export interface Vendor {
  id: string;
  name: string;
  canonical_name: string;
  industry?: string;
  created_at: string;
  last_analyzed: string;
}

export type JobStatus = 'pending' | 'running' | 'complete' | 'error';

export interface AnalysisJob {
  id: string;
  vendor_id: string;
  status: JobStatus;
  started_at: string;
  completed_at?: string;
  error_message?: string;
}

export type ScraperType = 'jobs' | 'news' | 'filings' | 'reviews' | 'web' | 'social';

export type SignalType = 
  | 'job_growth'
  | 'job_decline'
  | 'negative_news'
  | 'positive_news'
  | 'regulatory_risk'
  | 'leadership_change'
  | 'financial_stress'
  | 'expansion'
  | 'neutral';

export interface Signal {
  id: string;
  job_id: string;
  scraper: ScraperType;
  signal_type: SignalType;
  severity: number; // 1-10
  confidence: number; // 0.0-1.0
  raw_text: string;
  summary: string;
  source_url?: string;
  scraped_at: string;
}

export interface IntelligenceReport {
  id: string;
  job_id: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  executive_summary: string;
  key_risks: string[];
  positive_signals: string[];
  recommended_actions: string[];
  overall_confidence: number;
  generated_at: string;
  category_summaries?: {
    jobs?: string;
    news?: string;
    filings?: string;
    reviews?: string;
    web?: string;
  };
}

// SSE Event Stream types
export interface ScraperStartedEvent {
  event: 'scraper_started';
  data: {
    scraper: ScraperType;
    timestamp: string;
  };
}

export interface ScraperDoneEvent {
  event: 'scraper_done';
  data: {
    scraper: ScraperType;
    signals_found: number;
    preview: string;
    sources?: Array<{ title: string; url: string; snippet?: string }>;
    timestamp: string;
  };
}

export interface SignalClassifiedEvent {
  event: 'signal_classified';
  data: {
    signal: Signal;
    timestamp: string;
  };
}

export interface ReportReadyEvent {
  event: 'report_ready';
  data: {
    company_name: string;
    risk_score: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    signals: Signal[];
    report: IntelligenceReport;
  };
}

export interface JobErrorEvent {
  event: 'error';
  data: {
    message: string;
    timestamp: string;
  };
}

export interface AgentLogEvent {
  event: 'agent_log';
  data: {
    agent: string;
    message: string;
  };
}

export interface AgentSummaryStartedEvent {
  event: 'agent_summary_started';
  data: {
    category: ScraperType;
    timestamp: string;
  };
}

export interface AgentSummaryDoneEvent {
  event: 'agent_summary_done';
  data: {
    category: ScraperType;
    summary: string;
    timestamp: string;
  };
}

export type SSEEvent = 
  | ScraperStartedEvent 
  | ScraperDoneEvent 
  | SignalClassifiedEvent 
  | ReportReadyEvent 
  | JobErrorEvent
  | AgentLogEvent
  | AgentSummaryStartedEvent
  | AgentSummaryDoneEvent;

export interface ScheduledTask {
  id: string;
  company_name: string;
  interval_minutes: number; // e.g., 5, 15, 60, 1440
  slack_enabled: boolean;
  slack_webhook_url?: string;
  telegram_enabled: boolean;
  telegram_bot_token?: string;
  telegram_chat_id?: string;
  last_run?: string;
  next_run: string;
  created_at: string;
  status: 'active' | 'paused';
}
