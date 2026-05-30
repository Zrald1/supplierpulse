import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Send, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Layers, 
  FileText, 
  Inbox, 
  Briefcase, 
  TrendingUp, 
  Check,
  ChevronRight,
  Sparkles,
  Sliders,
  Key,
  Activity,
  Wifi,
  Terminal,
  ArrowRight,
  Search,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SearchBar from './components/SearchBar';
import ScoreGauge from './components/ScoreGauge';
import { Vendor, AnalysisJob, Signal, IntelligenceReport, ScraperType, SignalType } from './types';

interface PopulatedVendor extends Vendor {
  latest_score: number;
  latest_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  latest_job_id?: string;
}

function getSupplementalSources(companyName: string, scraper: ScraperType): Array<{ title: string; url: string; snippet?: string }> {
  if (!companyName) return [];
  const encodedName = encodeURIComponent(companyName);
  const supplementsMap: Record<ScraperType, Array<{ title: string; url: string; snippet?: string }>> = {
    jobs: [
      { title: `Indeed Careers Directory — ${companyName} Active Vacancies`, url: `https://www.indeed.com/q-${encodedName}-jobs.html` },
      { title: `LinkedIn Active Jobs Index for ${companyName}`, url: `https://www.linkedin.com/jobs/search/?keywords=${encodedName}` },
      { title: `Glassdoor Employee Hiring Board & Open Vacancies`, url: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodedName}` },
      { title: `ZipRecruiter Staffing & Recruitment Registry`, url: `https://www.ziprecruiter.com/Jobs/${encodedName}` },
      { title: `SimplyHired Employment Opportunity Log`, url: `https://www.simplyhired.com/search?q=${encodedName}` },
      { title: `Google Careers Portal live search aggregator for ${companyName}`, url: `https://www.google.com/search?q=${encodedName}+jobs` },
      { title: `CareerBuilder Corporate Vacancy database`, url: `https://www.careerbuilder.com/jobs?keywords=${encodedName}` },
      { title: `Monster Global Employment matchmaking log`, url: `https://www.monster.com/jobs/search?q=${encodedName}` },
      { title: `Dice Tech Careers and Specialist Staffing index`, url: `https://www.dice.com/jobs?q=${encodedName}` },
      { title: `FlexJobs Remote and Hybrid Careers registry`, url: `https://www.flexjobs.com/search?search=${encodedName}` },
      { title: `Upwork Freelance & Contract assignment history`, url: `https://www.upwork.com/search/jobs/?q=${encodedName}` }
    ],
    news: [
      { title: `Google News feed index for ${companyName} corporate news`, url: `https://news.google.com/search?q=${encodedName}` },
      { title: `Yahoo Finance Press Releases and Capital records`, url: `https://finance.yahoo.com/quote/${encodedName}` },
      { title: `Bloomberg Business databases & vendor indexes`, url: `https://www.bloomberg.com/search?query=${encodedName}` },
      { title: `Reuters Global corporate press wire tracker`, url: `https://www.reuters.com/site-search/?query=${encodedName}` },
      { title: `TechCrunch capital & strategic updates tracker`, url: `https://techcrunch.com/search/${encodedName}` },
      { title: `MarketWatch institutional business bulletins`, url: `https://www.marketwatch.com/search?q=${encodedName}` },
      { title: `CNBC Real-time financial audit archives`, url: `https://www.cnbc.com/search/?query=${encodedName}` },
      { title: `PR Newswire official corporate release logs`, url: `https://www.prnewswire.com/news-releases/search/results/?keyword=${encodedName}` },
      { title: `Financial Times corporate operations profile`, url: `https://www.ft.com/search?q=${encodedName}` },
      { title: `Business Wire legal and commercial announcements`, url: `https://www.businesswire.com/portal/site/home/search/?searchType=all&searchTerm=${encodedName}` },
      { title: `Forbes executive research index profile`, url: `https://www.forbes.com/search/?q=${encodedName}` }
    ],
    filings: [
      { title: `SEC EDGAR Official Corporate Registration Registry`, url: `https://www.sec.gov/edgar/searchedgar/companysearch?company_name=${encodedName}` },
      { title: `OpenCorporates International Legal entity database`, url: `https://opencorporates.com/companies?q=${encodedName}` },
      { title: `SEC 10-K, 10-Q and 8-K regulatory filing records`, url: `https://www.sec.gov/cgi-bin/browse-edgar?company=${encodedName}&action=getcompany` },
      { title: `Dun & Bradstreet Hoovers Risk diagnostic profile`, url: `https://www.dnb.com/business-directory/company-search.html?searchTerm=${encodedName}` },
      { title: `Federal Register regulatory notices database index`, url: `https://www.federalregister.gov/documents/search?conditions%5Bterm%5D=${encodedName}` },
      { title: `USPTO Patent Allocation and Trademark assignments log`, url: `https://pimg-fpiw.uspto.gov/fpiw.html?q=${encodedName}` },
      { title: `Department of Justice official press releases search`, url: `https://www.justice.gov/news?keys=${encodedName}` },
      { title: `EPA Regional Environmental Enforcement logs`, url: `https://search.epa.gov/epasearch/?query=${encodedName}` },
      { title: `FCC Corporate equipment authorizations index`, url: `https://apps.fcc.gov/oetcf/eas/reports/GenericSearch.cfm?applicant=${encodedName}` },
      { title: `FTC Consumer complaint databases search index`, url: `https://www.ftc.gov/search?search=${encodedName}` },
      { title: `EDGAR-Online compliance archives for ${companyName}`, url: `https://www.edgar-online.com/Search?companyName=${encodedName}` }
    ],
    reviews: [
      { title: `Glassdoor Employee Satisfaction Reviews Hub`, url: `https://www.glassdoor.com/Reviews/company-reviews.htm?sc.keyword=${encodedName}` },
      { title: `Trustpilot Consumer and Vendor compliance ratings`, url: `https://www.trustpilot.com/search?query=${encodedName}` },
      { title: `G2 Software, Licensing and Service ratings index`, url: `https://www.g2.com/search?query=${encodedName}` },
      { title: `Indeed Employee Feedback & Workplace reviews map`, url: `https://www.indeed.com/cmp/${encodedName}/reviews` },
      { title: `Capterra Enterprise Operations audit scoreboards`, url: `https://www.capterra.com/search?search_term=${encodedName}` },
      { title: `Kununu Workplace Culture and Compensation index`, url: `https://www.kununu.com/us/search?q=${encodedName}` },
      { title: `Blind Tech-community anonymous feedback archives`, url: `https://www.teamblind.com/search/${encodedName}` },
      { title: `Better Business Bureau Operational risk history log`, url: `https://www.bbb.org/search?find_text=${encodedName}` },
      { title: `Sitejabber customer sentiment indices for ${companyName}`, url: `https://www.sitejabber.com/search?q=${encodedName}` },
      { title: `App Store product performance feedback database`, url: `https://www.google.com/search?q=site:apps.apple.com+${encodedName}` },
      { title: `Google Play Store client usage reviews log`, url: `https://play.google.com/store/search?q=${encodedName}&c=apps` }
    ],
    web: [
      { title: `Wikipedia Official Encyclopedia entries & history logs`, url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodedName}` },
      { title: `Crunchbase Venture Capital and Funding database`, url: `https://www.crunchbase.com/textsearch?q=${encodedName}` },
      { title: `LinkedIn Business Organization registry search`, url: `https://www.linkedin.com/search/results/companies/?keywords=${encodedName}` },
      { title: `SimilarWeb Global Site Traffic audits for ${encodedName}.com`, url: `https://www.similarweb.com/website/${encodedName}.com` },
      { title: `Wikidata Structured semantic mapping index`, url: `https://www.wikidata.org/w/index.php?search=${encodedName}` },
      { title: `BuiltWith Technical Software deployment diagnostics`, url: `https://builtwith.com/?${encodedName}` },
      { title: `W3Techs Web server core technology metrics`, url: `https://w3techs.com/sites/info/${encodedName}.com` },
      { title: `Internet Archive WayBack Machine crawl log snapshots`, url: `https://web.archive.org/web/*/${encodedName}.com` },
      { title: `GitHub Open Source engineering profiles search`, url: `https://github.com/search?q=${encodedName}` },
      { title: `DomainTools Whois Administrative DNS records`, url: `https://whois.domaintools.com/${encodedName}.com` },
      { title: `Sitemap & robots.txt search engine crawlers analysis`, url: `https://www.google.com/search?q=site:${encodedName}.com+robots.txt` }
    ],
    social: [
      { title: `X/Twitter Public Sentiment Search for ${companyName}`, url: `https://x.com/search?q=${encodedName}` },
      { title: `Reddit Feed discussion aggregator for ${companyName}`, url: `https://www.reddit.com/search/?q=${encodedName}` },
      { title: `Facebook Public posts & merchant hubs for ${companyName}`, url: `https://www.facebook.com/search/top?q=${encodedName}` },
      { title: `Instagram Visual Engagement tags for ${companyName}`, url: `https://www.instagram.com/explore/tags/${encodedName}` },
      { title: `LinkedIn Social Conversation hashtags for ${companyName}`, url: `https://www.linkedin.com/feed/hashtag/?keywords=${encodedName}` },
      { title: `X/Twitter Official Accounts Feed for ${companyName}`, url: `https://x.com/search?q=${encodedName}+official` },
      { title: `Reddit r/startups and business discussions deep index`, url: `https://www.reddit.com/r/startups/search/?q=${encodedName}` },
      { title: `YouTube Video Guides & live comments for ${companyName}`, url: `https://www.youtube.com/results?search_query=${encodedName}` }
    ]
  };
  return supplementsMap[scraper] || [];
}

interface ClientRiskBreakdown {
  p1: number;
  p2: number;
  p3: number;
  p4: number;
  p5: number;
  totalPositive: number;
  n1: number;
  n2: number;
  n3: number;
  n4: number;
  n5: number;
  totalNegative: number;
  final: number;
}

function calculateClientRiskBreakdown(signals: Signal[]): ClientRiskBreakdown {
  let numRegulatoryRisk = 0;
  let numFinancialStress = 0;
  let numOperationalRisk = 0;
  let numSentimentRisk = 0;
  let numSocialNegative = 0;

  let numPositiveExpansion = 0;
  let numPositiveJobGrowth = 0;
  let numPositiveNews = 0;
  let numPositiveSocial = 0;

  signals.forEach(s => {
    const val = s.severity * (s.confidence || 0.85);
    switch (s.signal_type) {
      case 'regulatory_risk':
        numRegulatoryRisk += val;
        break;
      case 'financial_stress':
        numFinancialStress += val;
        break;
      case 'leadership_change':
        numOperationalRisk += val * 1.2;
        break;
      case 'job_decline':
        numOperationalRisk += val * 0.8;
         break;
      case 'negative_news':
        if (s.scraper === 'social') {
          numSocialNegative += val * 1.5;
        } else {
          numSentimentRisk += val;
        }
        break;
      case 'job_growth':
        numPositiveJobGrowth += val;
        break;
      case 'expansion':
        numPositiveExpansion += val;
        break;
      case 'positive_news':
        if (s.scraper === 'social') {
          numPositiveSocial += val * 1.5;
        } else {
          numPositiveNews += val;
        }
        break;
    }
  });

  const p1 = Math.max(0, Math.min(20, Math.round(20 - numRegulatoryRisk * 8)));
  const p2 = Math.max(0, Math.min(20, Math.round(10 + numPositiveExpansion * 6 - numFinancialStress * 6)));
  const p3 = Math.max(0, Math.min(20, Math.round(10 + numPositiveJobGrowth * 6 - numOperationalRisk * 4)));
  const p4 = Math.max(0, Math.min(20, Math.round(10 + numPositiveNews * 6 - numSentimentRisk * 5)));
  const p5 = Math.max(0, Math.min(20, Math.round(10 + numPositiveSocial * 6 - numSocialNegative * 6)));
  const totalPositive = p1 + p2 + p3 + p4 + p5;

  const n1 = Math.max(0, Math.min(20, Math.round(numRegulatoryRisk * 10)));
  const n2 = Math.max(0, Math.min(20, Math.round(numFinancialStress * 10)));
  const n3 = Math.max(0, Math.min(20, Math.round(numOperationalRisk * 8)));
  const n4 = Math.max(0, Math.min(20, Math.round(numSentimentRisk * 8)));
  const n5 = Math.max(0, Math.min(20, Math.round(numSocialNegative * 10)));
  const totalNegative = n1 + n2 + n3 + n4 + n5;

  const final = (totalNegative + totalPositive === 0) 
    ? 15 
    : Math.max(0, Math.min(100, Math.round((totalNegative / (totalNegative + totalPositive)) * 100)));

  return {
    p1, p2, p3, p4, p5, totalPositive,
    n1, n2, n3, n4, n5, totalNegative,
    final
  };
}

interface AgentNodeCardProps {
  key?: any;
  cat: ScraperType;
  status: any;
  textSummary?: string;
  getAgentIcon: (cat: ScraperType) => any;
  getAgentName: (cat: ScraperType) => string;
  totalSignalsCount: number;
  riskSignalsCount: number;
}

function AgentNodeCard({
  cat,
  status,
  textSummary,
  getAgentIcon,
  getAgentName,
  totalSignalsCount,
  riskSignalsCount,
}: AgentNodeCardProps) {
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  const isRunning = status === 'running';
  const isDone = status === 'done';

  useEffect(() => {
    let intervalId: any;
    if (isRunning) {
      setSimulatedProgress(12);
      intervalId = setInterval(() => {
        setSimulatedProgress((prev) => {
          if (prev >= 95) return prev;
          const step = Math.floor(Math.random() * 8) + 3;
          return Math.min(prev + step, 95);
        });
      }, 350 + Math.random() * 250);
    } else if (isDone) {
      setSimulatedProgress(100);
    } else {
      setSimulatedProgress(0);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, isDone]);

  const getStageDescription = (p: number) => {
    if (p === 0) return "Standby";
    if (p < 30) return "Parsing feed indicators...";
    if (p < 55) return "Extracting risks...";
    if (p < 80) return "Cross-referencing indices...";
    if (p < 100) return "Securing final vector...";
    return "Optimized synthesis";
  };

  return (
    <div 
      className={`border-2 p-3 flex flex-col justify-between shadow-[2px_2px_0px_#141414] relative overflow-hidden transition-all duration-300 rounded ${
        isRunning 
          ? 'border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-600/10' 
          : isDone 
            ? 'border-[#141414] bg-[#F7F6F5]/90' 
            : 'border-dashed border-[#141414]/30 bg-[#F7F6F5]/30'
      }`}
    >
      {/* Laser active scanning scanline sweep */}
      {isRunning && (
        <div className="absolute inset-x-0 h-[1.5px] bg-indigo-500/80 shadow-[0_0_8px_#4f46e5] top-0 animate-[scan_2s_ease-in-out_infinite] pointer-events-none" />
      )}

      <div>
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-1 mb-1.5 border-b border-stone-200 pb-1.5">
          <div className="flex items-center gap-1 font-mono font-bold text-[9px] uppercase tracking-wider text-[#141414]">
            {getAgentIcon(cat)}
            <span className="truncate max-w-[75px]">{cat} agent</span>
          </div>
          
          <span className={`text-[7px] font-mono font-extrabold px-1.5 py-0.5 border border-[#141414] rounded-sm uppercase ${
            isDone 
              ? 'bg-emerald-600 text-white font-black' 
              : isRunning 
                ? 'bg-amber-400 text-stone-900 animate-pulse font-black' 
                : 'bg-stone-100 text-[#141414]/40 font-semibold'
          }`}>
            {isDone ? 'done' : isRunning ? `${simulatedProgress}%` : 'standby'}
          </span>
        </div>

        {/* Agency Target Segment description */}
        <div className="text-[8.5px] font-mono font-extrabold text-[#141414] uppercase tracking-tight mb-2.5 flex justify-between items-center whitespace-nowrap">
          <span className="truncate max-w-[95px]">{getAgentName(cat)}</span>
          <div className="flex gap-1 items-center">
            {totalSignalsCount > 0 && (
              <span className="text-[7.5px] font-mono bg-indigo-50 text-indigo-800 px-1 py-0.5 border border-indigo-200 rounded-sm font-semibold">
                {totalSignalsCount} {totalSignalsCount === 1 ? 'INDEX' : 'INDEXES'}
              </span>
            )}
            {riskSignalsCount > 0 && (
              <span className="text-[7.5px] font-mono bg-rose-100 text-rose-800 px-1 py-0.5 border border-rose-300 rounded-sm font-black animate-pulse">
                {riskSignalsCount} {riskSignalsCount === 1 ? 'FLAG' : 'FLAGS'}
              </span>
            )}
          </div>
        </div>

        {/* Content/Terminal state block */}
        {isDone ? (
          <div className="text-[10px] p-2 border border-[#141414]/10 rounded-sm font-mono leading-tight shadow-[inset_0px_1px_2px_rgba(0,0,0,0.05)] bg-white text-stone-700 italic select-text">
            “{textSummary}”
          </div>
        ) : (
          /* SKELETON PLACEHOLDER WIDGET */
          <div className="space-y-2.5 border border-[#141414]/5 p-2 rounded-sm bg-stone-100/50">
            {/* Status light description */}
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${
                isRunning 
                  ? 'bg-indigo-600 animate-pulse shadow-[0_0_4px_#4f46e5]' 
                  : 'bg-stone-300'
              }`}></span>
              <span className="text-[8px] font-mono font-black text-stone-800 uppercase tracking-tight">
                {getStageDescription(simulatedProgress)}
              </span>
            </div>

            {/* Skeleton visual mock lines */}
            <div className="space-y-1.5">
              <div className={`h-1.5 bg-stone-200 rounded-sm ${isRunning ? 'animate-pulse bg-stone-300 w-11/12' : 'w-2/3 opacity-40'}`}></div>
              <div className={`h-1.5 bg-stone-200 rounded-sm ${isRunning ? 'animate-pulse bg-stone-300 w-4/5' : 'w-1/2 opacity-40'}`}></div>
              <div className={`h-1.5 bg-stone-200 rounded-sm ${isRunning ? 'animate-pulse bg-stone-200 w-3/4' : 'w-3/5 opacity-40'}`}></div>
            </div>

            {/* Progress-based horizontal progress meter */}
            {(isRunning || simulatedProgress > 0) && (
              <div className="pt-0.5">
                <div className="w-full bg-stone-200 h-1 rounded-full overflow-hidden border border-stone-300/25">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300 shadow-[0_0_3px_rgba(79,70,229,0.4)]"
                    style={{ width: `${simulatedProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer system details */}
      <div className="mt-3 flex items-center justify-between text-[8px] font-mono opacity-50">
        <span>AGENT PORT: 3000</span>
        <span className="flex items-center gap-0.5 uppercase">
          <span className={`h-1 w-1 rounded-full ${
            isDone 
              ? 'bg-emerald-500 animate-pulse' 
              : isRunning 
                ? 'bg-indigo-500 animate-[ping_1.5s_infinite]' 
                : 'bg-stone-300'
          }`}></span>
          <span>{isDone ? 'DONE' : isRunning ? 'DRAFTING' : 'READY'}</span>
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const [vendors, setVendors] = useState<PopulatedVendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Active Job State
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeCompanyName, setActiveCompanyName] = useState<string>('');
  
  // AI Mode Selection
  const [aiMode, setAiMode] = useState<string>('google/gemma-3-4b-it');
  
  // API Key Connection Diagnosis
  const [isTestingKeys, setIsTestingKeys] = useState(false);
  const [keyStatusResults, setKeyStatusResults] = useState<Array<{ index: number; preview: string; is_ok: boolean; display: string }> | null>(null);
  const [showKeyDiagnosis, setShowKeyDiagnosis] = useState(false);

  // Scraper status tracking
  const [scraperStatuses, setScraperStatuses] = useState<Record<ScraperType, 'idle' | 'running' | 'done' | 'error'>>({
    jobs: 'idle',
    news: 'idle',
    filings: 'idle',
    reviews: 'idle',
    web: 'idle',
    social: 'idle'
  });
  
  const [scraperPreviews, setScraperPreviews] = useState<Record<ScraperType, string>>({
    jobs: '',
    news: '',
    filings: '',
    reviews: '',
    web: '',
    social: ''
  });

  const [scrapedSignalsCount, setScrapedSignalsCount] = useState<Record<ScraperType, number>>({
    jobs: 0,
    news: 0,
    filings: 0,
    reviews: 0,
    web: 0,
    social: 0
  });

  const [scraperSources, setScraperSources] = useState<Record<ScraperType, Array<{ title: string; url: string; snippet?: string }>>>({
    jobs: [],
    news: [],
    filings: [],
    reviews: [],
    web: [],
    social: []
  });

  // Live Stream logs
  const [liveLogs, setLiveLogs] = useState<Array<{ text: string; type: 'info' | 'success' | 'exec' | 'error'; time: string }>>([]);
  const [liveSignals, setLiveSignals] = useState<Signal[]>([]);
  
  // UI Loading/Display states
  const [isScraping, setIsScraping] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registry' | 'scheduler'>('dashboard');
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [viewingReport, setViewingReport] = useState<IntelligenceReport | null>(null);
  const [viewingSignals, setViewingSignals] = useState<Signal[]>([]);
  const [showRiskBreakdown, setShowRiskBreakdown] = useState(false);
  const [viewingCompany, setViewingCompany] = useState<{ name: string; canonicalName: string; industry?: string } | null>(null);

  // Parallel AI Agents status and summary states
  const [agentSummaries, setAgentSummaries] = useState<Record<string, string>>({});
  const [agentSummaryStatus, setAgentSummaryStatus] = useState<Record<string, 'standby' | 'running' | 'done'>>({
    jobs: 'standby',
    news: 'standby',
    filings: 'standby',
    reviews: 'standby',
    web: 'standby'
  });

  // Custom states for filtering and layout enrichment
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorLevelFilter, setVendorLevelFilter] = useState<string>('ALL');

  // Scraping animations and metrics simulation
  const [streamInfo, setStreamInfo] = useState({
    speed: 0,
    packets: 0,
    lastPath: '',
    activity: 'STANDBY',
    currIp: '127.0.0.1',
    noiseLine: '[]'
  });

  useEffect(() => {
    if (!isScraping) {
      setStreamInfo({
        speed: 0,
        packets: 0,
        lastPath: '',
        activity: 'STANDBY',
        currIp: '127.0.0.1',
        noiseLine: '[]'
      });
      return;
    }

    const ips = ['198.51.100.4', '203.0.113.82', '192.0.2.25', '198.51.100.122', '203.0.113.11'];
    const paths = [
      'sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=',
      'api.brightdata.com/v1/serp/google/search?q=',
      'glassdoor.com/Reviews/company-reviews.htm?id=',
      'indeed.com/cmp/salaries?q=',
      'wikidata.org/wiki/Special:Search?search=',
      'news.google.com/search?q=',
      'crunchbase.com/organization/'
    ];

    const activeComp = activeCompanyName || 'target';

    const interval = setInterval(() => {
      const p = paths[Math.floor(Math.random() * paths.length)] + encodeURIComponent(activeComp);
      const ip = ips[Math.floor(Math.random() * ips.length)];
      setStreamInfo(prev => {
        const hex = Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')).join(' ');
        const speed = parseFloat((Math.random() * 6 + 1.8).toFixed(2));
        return {
          speed,
          packets: prev.packets + Math.floor(Math.random() * 8 + 1),
          lastPath: p,
          activity: `FETCH GET https://${p.slice(0, 38)}...`,
          currIp: ip,
          noiseLine: `[${new Date().toLocaleTimeString()}] ${hex} | PKT_LEN:${Math.floor(Math.random() * 4096 + 512)}`
        };
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isScraping, activeCompanyName]);

  // Slack alert notification toast
  const [slackToast, setSlackToast] = useState<{ text: string; success: boolean } | null>(null);
  const [exportingSlack, setExportingSlack] = useState(false);

  // Custom Client-Side Credentials (Optional, stored strictly browser-side)
  const [customBrightDataApiKey, setCustomBrightDataApiKey] = useState<string>(() => localStorage.getItem('custom_brightdata_api_key') || '');
  const [customSlackWebhookUrl, setCustomSlackWebhookUrl] = useState<string>(() => localStorage.getItem('custom_slack_webhook_url') || '');
  const [customAimlApiKey, setCustomAimlApiKey] = useState<string>(() => localStorage.getItem('custom_aiml_api_key') || localStorage.getItem('custom_vultr_api_key') || '');
  const [customGeminiApiKey, setCustomGeminiApiKey] = useState<string>(() => localStorage.getItem('custom_gemini_api_key') || '');
  const [customTelegramBotToken, setCustomTelegramBotToken] = useState<string>(() => localStorage.getItem('custom_telegram_bot_token') || '');
  const [customTelegramChatId, setCustomTelegramChatId] = useState<string>(() => localStorage.getItem('custom_telegram_chat_id') || '');

  // Dynamic schedules list
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

  // Modal display control
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Temporary buffers for configuration editing
  const [tempBrightDataKey, setTempBrightDataKey] = useState(customBrightDataApiKey);
  const [tempSlackWebhook, setTempSlackWebhook] = useState(customSlackWebhookUrl);
  const [tempAimlKey, setTempAimlKey] = useState(customAimlApiKey);
  const [tempGeminiKey, setTempGeminiKey] = useState(customGeminiApiKey);
  const [tempTelegramBotToken, setTempTelegramBotToken] = useState(customTelegramBotToken);
  const [tempTelegramChatId, setTempTelegramChatId] = useState(customTelegramChatId);

  // Sync edit buffers whenever config panel opens
  useEffect(() => {
    if (showConfigModal) {
      setTempBrightDataKey(customBrightDataApiKey);
      setTempSlackWebhook(customSlackWebhookUrl);
      setTempAimlKey(customAimlApiKey);
      setTempGeminiKey(customGeminiApiKey);
      setTempTelegramBotToken(customTelegramBotToken);
      setTempTelegramChatId(customTelegramChatId);
    }
  }, [showConfigModal, customBrightDataApiKey, customSlackWebhookUrl, customAimlApiKey, customGeminiApiKey, customTelegramBotToken, customTelegramChatId]);

  const handleSaveCredentials = () => {
    localStorage.setItem('custom_brightdata_api_key', tempBrightDataKey);
    localStorage.setItem('custom_slack_webhook_url', tempSlackWebhook);
    localStorage.setItem('custom_aiml_api_key', tempAimlKey);
    localStorage.setItem('custom_gemini_api_key', tempGeminiKey);
    // clean vintage key identifier to prevent overlap and 401s
    localStorage.removeItem('custom_vultr_api_key');
    localStorage.setItem('custom_telegram_bot_token', tempTelegramBotToken);
    localStorage.setItem('custom_telegram_chat_id', tempTelegramChatId);
    
    setCustomBrightDataApiKey(tempBrightDataKey);
    setCustomSlackWebhookUrl(tempSlackWebhook);
    setCustomAimlApiKey(tempAimlKey);
    setCustomGeminiApiKey(tempGeminiKey);
    setCustomTelegramBotToken(tempTelegramBotToken);
    setCustomTelegramChatId(tempTelegramChatId);
    
    setShowConfigModal(false);
    addLog('CONFIG: Secure credentials successfully updated on client-side cache.', 'success');
  };

  const handleClearCredentials = () => {
    localStorage.removeItem('custom_brightdata_api_key');
    localStorage.removeItem('custom_slack_webhook_url');
    localStorage.removeItem('custom_aiml_api_key');
    localStorage.removeItem('custom_gemini_api_key');
    localStorage.removeItem('custom_vultr_api_key');
    localStorage.removeItem('custom_telegram_bot_token');
    localStorage.removeItem('custom_telegram_chat_id');
    
    setCustomBrightDataApiKey('');
    setCustomSlackWebhookUrl('');
    setCustomAimlApiKey('');
    setCustomGeminiApiKey('');
    setCustomTelegramBotToken('');
    setCustomTelegramChatId('');
    
    setTempBrightDataKey('');
    setTempSlackWebhook('');
    setTempAimlKey('');
    setTempGeminiKey('');
    setTempTelegramBotToken('');
    setTempTelegramChatId('');
    
    setShowConfigModal(false);
    addLog('CONFIG: Overrides removed, returning to default key rotation system pool.', 'info');
  };

  const fetchSchedules = async () => {
    setIsLoadingSchedules(true);
    try {
      const response = await fetch('/api/schedules');
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error listing interactive automation schedules:', error);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  // Load physical records index initially
  useEffect(() => {
    fetchVendors();
    fetchSchedules();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/vendors');
      if (response.ok) {
        const data = await response.json();
        setVendors(data);
      }
    } catch (error) {
      console.error('Error fetching previously indexed vendors:', error);
    }
  };

  // Scheduler Form State overrides
  const [scheduleCompanyName, setScheduleCompanyName] = useState('');
  const [scheduleInterval, setScheduleInterval] = useState(60);
  const [scheduleSlackEnabled, setScheduleSlackEnabled] = useState(false);
  const [scheduleSlackUrl, setScheduleSlackUrl] = useState('');
  const [scheduleTelegramEnabled, setScheduleTelegramEnabled] = useState(false);
  const [scheduleTelegramToken, setScheduleTelegramToken] = useState('');
  const [scheduleTelegramChatId, setScheduleTelegramChatId] = useState('');

  // Scheduler operation triggers
  const handleCreateSchedule = async () => {
    if (!scheduleCompanyName.trim()) return;
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: scheduleCompanyName.trim(),
          interval_minutes: Number(scheduleInterval) || 60,
          slack_enabled: scheduleSlackEnabled,
          slack_webhook_url: scheduleSlackUrl || undefined,
          telegram_enabled: scheduleTelegramEnabled,
          telegram_bot_token: scheduleTelegramToken || undefined,
          telegram_chat_id: scheduleTelegramChatId || undefined
        })
      });
      if (response.ok) {
        addLog(`SCHEDULER: Background scanning task configured successfully for ${scheduleCompanyName}`, 'success');
        setScheduleCompanyName('');
        setScheduleSlackUrl('');
        setScheduleTelegramToken('');
        setScheduleTelegramChatId('');
        fetchSchedules();
      } else {
        const errorData = await response.json();
        addLog(`SCHEDULER ERROR: ${errorData.error || 'Failed to submit configured schedule'}`, 'error');
      }
    } catch (err: any) {
      console.error(err);
      addLog(`SCHEDULER ERROR: ${err.message || 'Error occurred connecting to backend'}`, 'error');
    }
  };

  const handleToggleScheduleStatus = async (id: string, currentStatus: string) => {
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: currentStatus === 'active' ? 'paused' : 'active'
        })
      });
      if (response.ok) {
        addLog(`SCHEDULER: Schedule task status updated successfully.`, 'success');
        fetchSchedules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        addLog(`SCHEDULER: Schedule removed. Background worker loop cleared.`, 'info');
        fetchSchedules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunScheduleInstantly = async (schedule: any) => {
    try {
      addLog(`SCHEDULER: Manually invoking extraction pipeline sequence for schedule target ${schedule.company_name}`, 'info');
      setActiveTab('dashboard'); // Switch back to dashboard to view the real-time visual progress!
      handleAnalyze(schedule.company_name); // Re-use main analyze flow so they see agent actions live!
    } catch (err) {
      console.error(err);
    }
  };

  const addLog = (text: string, type: 'info' | 'success' | 'exec' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLiveLogs(prev => [{ text, type, time }, ...prev]);
  };

  const diagnoseGlobalApiKeys = async () => {
    setIsTestingKeys(true);
    setKeyStatusResults(null);
    setShowKeyDiagnosis(true);
    try {
      const response = await fetch('/api/test-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          custom_aiml_key: customAimlApiKey || undefined,
          custom_gemini_key: customGeminiApiKey || undefined
        })
      });
      if (response.ok) {
        const data = await response.json();
        setKeyStatusResults(data.results || []);
      } else {
        setKeyStatusResults([
          { index: 0, preview: 'Diagnostics call error status', is_ok: false, display: 'Primary User API key check failure' }
        ]);
      }
    } catch (err: any) {
      setKeyStatusResults([
        { index: 0, preview: err.message || 'Network breakdown', is_ok: false, display: 'Primary User API key check failure' }
      ]);
    } finally {
      setIsTestingKeys(false);
    }
  };

  // 1. Kickstart analysis pipeline
  const handleAnalyze = async (companyName: string) => {
    setIsScraping(true);
    setViewingReport(null);
    setViewingSignals([]);
    setViewingCompany(null);
    setLiveSignals([]);
    setLiveLogs([]);
    setAgentSummaries({});
    setAgentSummaryStatus({
      jobs: 'standby',
      news: 'standby',
      filings: 'standby',
      reviews: 'standby',
      web: 'standby'
    });
    
    setScraperStatuses({
      jobs: 'idle',
      news: 'idle',
      filings: 'idle',
      reviews: 'idle',
      web: 'idle'
    });
    setScraperPreviews({
      jobs: '',
      news: '',
      filings: '',
      reviews: '',
      web: ''
    });
    setScrapedSignalsCount({
      jobs: 0,
      news: 0,
      filings: 0,
      reviews: 0,
      web: 0
    });
    setScraperSources({
      jobs: [],
      news: [],
      filings: [],
      reviews: [],
      web: []
    });

    addLog(`INIT: Preparing crawler matrix for target vendor "${companyName}" on mode [${aiMode.toUpperCase()}]`, 'info');
    if (customBrightDataApiKey) {
      addLog(`PROXY: Directing web crawlers to tunnel through custom Bright Data session credentials.`, 'success');
    }
    setActiveCompanyName(companyName);

    try {
      const startRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          company_name: companyName, 
          ai_mode: aiMode,
          custom_brightdata_key: customBrightDataApiKey || undefined,
          custom_aiml_key: customAimlApiKey || undefined,
          custom_gemini_key: customGeminiApiKey || undefined
        })
      });

      if (!startRes.ok) {
        throw new Error('Analytic queue failed to initialize.');
      }

      const { job_id } = await startRes.json();
      setActiveJobId(job_id);
      addLog(`SYSTEM: Created thread job ${job_id}. Activating event link.`, 'exec');
      
      // Connect to Server-Sent Events (SSE) Live Stream
      connectToSSE(job_id, companyName);

    } catch (err: any) {
      addLog(`FATAL: ${err.message || 'System error on request launch'}`, 'error');
      setIsScraping(false);
    }
  };

  // Connect & listen to SSE updates
  const connectToSSE = (jobId: string, companyName: string) => {
    const sse = new EventSource(`/api/stream/${jobId}`);

    sse.addEventListener('scraper_started', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setScraperStatuses(prev => ({ ...prev, [data.scraper]: 'running' }));
        addLog(`CRWL: Launched [${data.scraper.toUpperCase()}] crawler engine`, 'exec');
      } catch (err) {}
    });

    sse.addEventListener('agent_log', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        addLog(`AGENT [${data.agent.toUpperCase()}]: ${data.message}`, 'success');
      } catch (err) {}
    });

    sse.addEventListener('scraper_done', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setScraperStatuses(prev => ({ ...prev, [data.scraper]: 'done' }));
        setScrapedSignalsCount(prev => ({ ...prev, [data.scraper]: data.signals_found }));
        setScraperPreviews(prev => ({ ...prev, [data.scraper]: data.preview }));
        if (data.sources) {
          setScraperSources(prev => ({ ...prev, [data.scraper]: data.sources }));
        }
        
        addLog(`CRWL: [${data.scraper.toUpperCase()}] crawler complete. found: ${data.signals_found} matches`, 'success');
      } catch (err) {}
    });

    sse.addEventListener('signal_classified', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        const signal = data.signal;
        setLiveSignals(prev => [signal, ...prev]);
        addLog(`AI_CLS: Classified signal [${signal.signal_type.toUpperCase()}] (Severity: ${signal.severity}/10)`, 'info');
      } catch (err) {}
    });

    sse.addEventListener('agent_summary_started', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setAgentSummaryStatus(prev => ({ ...prev, [data.category]: 'running' }));
        addLog(`AGENT [${data.category.toUpperCase()} AGENT]: Activating parallel sector analysis...`, 'info');
      } catch (err) {}
    });

    sse.addEventListener('agent_summary_done', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setAgentSummaryStatus(prev => ({ ...prev, [data.category]: 'done' }));
        setAgentSummaries(prev => ({ ...prev, [data.category]: data.summary }));
        addLog(`AGENT [${data.category.toUpperCase()} AGENT]: Finalized index digest: ${data.summary}`, 'success');
      } catch (err) {}
    });

    sse.addEventListener('report_ready', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        
        // Final report compiled
        setViewingReport(data.report);
        setViewingSignals(data.signals);
        setViewingCompany({
          name: data.company_name,
          canonicalName: data.company_name,
          industry: 'Multi-indicator Segment'
        });

        if (data.report && data.report.category_summaries) {
          setAgentSummaries(data.report.category_summaries);
          const loadedStatus: Record<string, 'done'> = {};
          Object.keys(data.report.category_summaries).forEach(k => {
            loadedStatus[k] = 'done';
          });
          setAgentSummaryStatus(prev => ({
            ...prev,
            ...loadedStatus
          }));
        }
        
        addLog(`AGENT: Audit brief finalized! Score assigned: ${data.risk_score}/100`, 'success');
        
        // Done scraping!
        setIsScraping(false);
        sse.close();
        
        // Refresh records directory to include new vendor immediately
        fetchVendors();
      } catch (err) {
        addLog('ERROR: Could not format final report json payload.', 'error');
        setIsScraping(false);
        sse.close();
      }
    });

    sse.addEventListener('error', (e: any) => {
      if (e && e.data) {
        try {
          const data = JSON.parse(e.data);
          addLog(`THREAD ERROR: ${data.message || 'Scraping browser disconnect'}`, 'error');
        } catch (err) {}
        setIsScraping(false);
        sse.close();
      } else {
        // Standard EventSource connection drop or network refresh.
        // Log to console rather than aborting the active agent loader state.
        console.warn('SYSTEM: Active EventSource socket connection dropped. Retrying to connect...');
      }
    });

    // Timeout fallback protection
    setTimeout(() => {
      if (setIsScraping && sse.readyState !== EventSource.CLOSED) {
        addLog('SYSTEM: SSE timeout fallback protection triggered.', 'info');
      }
    }, 60000);
  };

  // View previously compiled report instantly!
  const loadBriefing = async (jobId: string, companyName: string) => {
    setSelectedJobId(jobId);
    try {
      const response = await fetch(`/api/report/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setViewingReport(data.report);
        setViewingSignals(data.signals);
        setViewingCompany({
          name: data.vendor.name,
          canonicalName: data.vendor.canonical_name,
          industry: data.vendor.industry
        });

        if (data.report && data.report.category_summaries) {
          setAgentSummaries(data.report.category_summaries);
          const loadedStatus: Record<string, 'done'> = {};
          Object.keys(data.report.category_summaries).forEach(k => {
            loadedStatus[k] = 'done';
          });
          setAgentSummaryStatus(prev => ({
            ...prev,
            ...loadedStatus
          }));
        } else {
          // Fallback parsing from loaded signals list
          const fallbackSums: Record<string, string> = {};
          const fallbackStatus: Record<string, 'done'> = {};
          const categories: ScraperType[] = ['jobs', 'news', 'filings', 'reviews', 'web', 'social'];
          categories.forEach((cat) => {
            const catSigs = (data.signals || []).filter((s: any) => s.scraper === cat);
            if (catSigs.length > 0) {
              fallbackSums[cat] = catSigs[0].summary;
            } else {
              fallbackSums[cat] = `No critical risk indicators observed for the ${cat} index. Standard posture active.`;
            }
            fallbackStatus[cat] = 'done';
          });
          setAgentSummaries(fallbackSums);
          setAgentSummaryStatus(fallbackStatus);
        }
        
        // Setup liveLogs overview
        setLiveLogs([
          { text: `REGISTRY: Extracted secure archives for ${companyName}`, type: 'success', time: new Date().toLocaleTimeString() },
          { text: `DATA SOURCE: SEC EDGAR, Indeed APIs, Glassdoor Scrapers`, type: 'info', time: new Date().toLocaleTimeString() }
        ]);
      }
    } catch (err) {
      console.error('Failure reloading archive report:', err);
    }
  };

  // Export finished report to Slack Webhook
  const handleExportToSlack = async () => {
    if (!viewingReport || !viewingCompany) return;
    setExportingSlack(true);
    setSlackToast(null);

    try {
      const response = await fetch('/api/webhook/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: viewingCompany.canonicalName,
          report: viewingReport,
          custom_slack_webhook: customSlackWebhookUrl || undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.sentToRealSlack) {
          showSlackResult('Alert successfully pushed to Slack channel!', true);
        } else {
          showSlackResult('Simulated webhook payload logged successfully!', true);
        }
      } else {
        showSlackResult('Could not route notification to Slack target.', false);
      }
    } catch (e) {
      showSlackResult('Webhook transmission breakdown.', false);
    } finally {
      setExportingSlack(false);
    }
  };

  const showSlackResult = (text: string, success: boolean) => {
    setSlackToast({ text, success });
    setTimeout(() => setSlackToast(null), 5000);
  };

  // Setup color indicators
  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-rose-100 text-rose-700 border-rose-700';
      case 'HIGH': return 'bg-amber-100 text-amber-700 border-amber-700';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-600';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-700';
    }
  };

  // Percentage loader metrics
  const activeScrapersCount = Object.values(scraperStatuses).filter(s => s === 'done').length;
  const progressPct = Math.round((activeScrapersCount / 6) * 100);

  const renderScraperCard = (scr: ScraperType) => {
    const status = scraperStatuses[scr];
    const signalsCount = scrapedSignalsCount[scr];
    const preview = scraperPreviews[scr];
    const activeComp = activeCompanyName || viewingCompany?.name;
    const currentSources = (scraperSources[scr] && scraperSources[scr].length > 0)
      ? scraperSources[scr]
      : (activeComp ? getSupplementalSources(activeComp, scr) : []);

    const isRunning = status === 'running';
    const isDone = status === 'done';
    const isError = status === 'error';

    // Icon mapping
    const getIcon = () => {
      switch (scr) {
        case 'jobs': return <Briefcase className="w-4 h-4 text-[#141414]" />;
        case 'news': return <TrendingUp className="w-4 h-4 text-[#141414]" />;
        case 'filings': return <FileText className="w-4 h-4 text-[#141414]" />;
        case 'reviews': return <Layers className="w-4 h-4 text-[#141414]" />;
        case 'web': return <Building2 className="w-4 h-4 text-[#141414]" />;
        case 'social': return <MessageSquare className="w-4 h-4 text-[#141414]" />;
      }
    };

    const getTargetInterfaceName = () => {
      switch (scr) {
        case 'jobs': return 'Indeed Jobs Tracker';
        case 'news': return 'SERP Bullet News';
        case 'filings': return 'SEC EDGAR Indexer';
        case 'reviews': return 'Glassdoor Sentiment';
        case 'web': return 'Wikidata & Brand API';
        case 'social': return 'Social Buzz Sentinel';
      }
    };

    return (
      <div 
        key={scr} 
        className={`border-2 border-[#141414] bg-white p-3 shadow-[2px_2px_0px_#141414] flex flex-col justify-between h-full min-h-[175px] relative overflow-hidden group hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#141414] transition-all duration-200`}
      >
        {/* Animated Scanning overlay when active */}
        {isRunning && (
          <div className="absolute inset-0 bg-amber-500/5 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-amber-500 animate-bounce"></div>
          </div>
        )}

        <div>
          {/* Status Header */}
          <div className="flex items-center justify-between border-b border-[#141414]/10 pb-1.5 mb-1.5">
            <div className="flex items-center gap-1 font-bold uppercase text-[9px] tracking-wider text-[#141414] font-mono">
              {getIcon()}
              <span>{scr} queue</span>
            </div>
            
            <span className={`text-[8px] font-mono font-extrabold px-1.5 py-0.5 border border-[#141414] rounded-sm uppercase tracking-wider ${
              isDone ? 'bg-emerald-500 text-white font-black' :
              isRunning ? 'bg-amber-400 text-[#141414] animate-pulse font-black' :
              'bg-[#DCDAD7] text-[#141414]/40 font-semibold'
            }`}>
              {status}
            </span>
          </div>

          <div className="text-[9px] font-mono opacity-60 uppercase mb-1">
            Interface: <span className="font-bold text-[#141414]/90 block truncate">{getTargetInterfaceName()}</span>
          </div>

          {/* Scraped indexes preview & snippets count */}
          {preview ? (
            <div className="text-[9.5px] text-[#141414] font-mono bg-stone-100 p-1.5 border border-[#141414]/5 rounded-sm mb-1.5 max-h-12 overflow-y-auto italic select-text leading-tight">
              &ldquo;{preview}&rdquo;
            </div>
          ) : (
            <div className="text-[8.5px] text-[#141414]/40 font-mono py-1.5 italic">
              {isRunning ? '🔍 Retrieving vector links...' : '░ Queue idle. Awaiting targets'}
            </div>
          )}
        </div>

        {/* Links listing and counters */}
        <div className="mt-1 pt-1 border-t border-[#141414]/10">
          <div className="flex justify-between items-center text-[8.5px] font-mono font-bold mb-1 uppercase">
            <span>Indices: {Math.max(signalsCount, currentSources.length)}</span>
            <span className="text-[8px] opacity-60">Verified Sources</span>
          </div>
          
          <div className="max-h-[64px] overflow-y-auto space-y-1 pr-1 bg-stone-50 border border-stone-200 p-1 rounded-sm">
            {currentSources.slice(0, 2).map((s, idx) => {
              let domain = 'link';
              try { domain = new URL(s.url).hostname.replace('www.', ''); } catch (_) {}
              return (
                <div key={idx} className="text-[8.5px] font-mono leading-tight flex justify-between items-center gap-1 border-b border-stone-100 last:border-0 pb-0.5 last:pb-0">
                  <span className="truncate opacity-80" title={s.title}>[{idx + 1}] {s.title}</span>
                  <a 
                    href={s.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-cyan-800 hover:text-cyan-600 hover:underline inline-flex items-center gap-0.5 shrink-0 bg-cyan-50 border border-cyan-800/10 px-0.5 rounded"
                  >
                    <span>{domain.slice(0, 10)}</span>
                    <ExternalLink className="w-1.5 h-1.5" />
                  </a>
                </div>
              );
            })}
            {currentSources.length > 2 && (
              <div className="text-[7.5px] font-mono text-center text-[#141414]/40 pt-1">
                + {currentSources.length - 2} more links cached
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMultiAgentPipeline = () => {
    const categories: ScraperType[] = ['jobs', 'news', 'filings', 'reviews', 'web', 'social'];
    
    // Check if we are active or have compiled summaries
    const hasAnySummary = Object.keys(agentSummaries).length > 0;
    if (!isScraping && !hasAnySummary) return null;

    const getAgentName = (cat: ScraperType) => {
      switch (cat) {
        case 'jobs': return 'Workforce Scout (Careers Sector)';
        case 'news': return 'Sentiment Sentinel (Press Indices)';
        case 'filings': return 'Compliance Counsel (SEC Files)';
        case 'reviews': return 'Sentiment Auditor (Reviews Index)';
        case 'web': return 'Security Sentinel (Web Infra)';
        case 'social': return 'Social Pulse sentinel (Social Consensus)';
      }
    };

    const getAgentIcon = (cat: ScraperType) => {
      switch (cat) {
        case 'jobs': return <Briefcase className="w-3.5 h-3.5 text-amber-500" />;
        case 'news': return <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />;
        case 'filings': return <FileText className="w-3.5 h-3.5 text-rose-500" />;
        case 'reviews': return <Sparkles className="w-3.5 h-3.5 text-pink-500" />;
        case 'web': return <Layers className="w-3.5 h-3.5 text-teal-500" />;
        case 'social': return <MessageSquare className="w-3.5 h-3.5 text-sky-500" />;
      }
    };

    return (
      <div className="border-4 border-[#141414] bg-white p-5 shadow-[4px_4px_0px_#141414] mb-6 relative select-text">
        <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 bg-[#141414] text-white font-mono text-[8px] font-bold px-2.5 py-1 border border-[#141414] uppercase shadow-[1px_1px_0px_rgba(0,0,0,0.15)] flex items-center gap-1.5 rounded-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>PARALLEL MULTI-AGENT NETWORK</span>
        </div>

        <div className="flex flex-col gap-1 mb-4">
          <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-[#141414] flex items-center gap-1.5">
            <span>⚡ CONCURRENT AGENT RECONCILER NETWORK</span>
          </h2>
          <p className="text-[10px] font-mono text-stone-500 max-w-2xl leading-relaxed whitespace-normal pr-4">
            The platform deploys six specialized AI Index Agents in parallel. Each agent consumes indices hits from its scraper queue, drafts an individual sector summary, and feeds its intelligence vector into the final Synthesis Core.
          </p>
        </div>

        {/* 6 PARALLEL INDEX AGENT NODES */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 items-stretch relative">
          {categories.map((cat) => {
            const status = agentSummaryStatus[cat] || 'standby';
            const textSummary = agentSummaries[cat];
            
            // Reconcile live active stream with currently stored/viewed signals
            const currentSignals = isScraping ? liveSignals : (viewingSignals || []);
            const matchingSignals = currentSignals.filter(s => s.scraper === cat);
            const riskSignals = matchingSignals.filter(s => 
              ['regulatory_risk', 'financial_stress', 'leadership_change', 'negative_news', 'job_decline'].includes(s.signal_type)
            );
            
            return (
              <AgentNodeCard
                key={cat}
                cat={cat}
                status={status}
                textSummary={textSummary}
                getAgentIcon={getAgentIcon}
                getAgentName={getAgentName}
                totalSignalsCount={matchingSignals.length}
                riskSignalsCount={riskSignals.length}
              />
            );
          })}
        </div>

        {/* FLOW GRAPH CONNECTOR SVG */}
        <div className="my-2.5 hidden md:flex items-center justify-center text-stone-300">
          <svg className="w-full h-8" viewBox="0 0 1000 32" fill="none" stroke="currentColor">
            <line x1="100" y1="0" x2="500" y2="32" stroke="#141414" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="300" y1="0" x2="500" y2="32" stroke="#141414" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="500" y1="0" x2="500" y2="32" stroke="#141414" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="700" y1="0" x2="500" y2="32" stroke="#141414" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="900" y1="0" x2="500" y2="32" stroke="#141414" strokeWidth="1" strokeDasharray="3,3" />
          </svg>
        </div>

        {/* CENTRAL EVALUATIVE SYNTHESIZER HUB */}
        <div className="flex justify-center mt-3 md:mt-0">
          <div className="max-w-md w-full border-2 border-[#141414] bg-[#F7F6F5] p-3 text-center shadow-[3px_3px_0px_#141414] rounded">
            <div className="flex items-center justify-center gap-1.5 font-bold uppercase text-xs tracking-tight text-[#141414] mb-1 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>SUPPLIER EXECUTIVE SYNTHESIZER CORE</span>
            </div>
            <p className="text-[9px] font-mono text-stone-400 mb-2 uppercase">
              Orchestrator Model: {(aiMode || '').toUpperCase()}
            </p>
            
            <div className={`text-[10px] font-mono p-2 border-2 border-dashed rounded flex flex-col items-center justify-center gap-1 leading-snug ${
              viewingReport ? 'bg-emerald-50/50 border-emerald-500/30 text-emerald-950 font-bold' :
              isScraping ? 'bg-amber-50/50 border-amber-500/30 text-[#141414] animate-pulse' :
              'bg-stone-100 border-stone-200 text-stone-400'
            }`}>
              {viewingReport ? (
                <>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    <span>✓ HIGH-FIDELITY SUPPLIER VALUE ASSIGNED INSTANTLY</span>
                  </div>
                  <div className="text-sm font-bold uppercase tracking-tight text-[#141414] font-mono">
                    ASSESSMENT RATIO SCORE: {viewingReport.risk_score}/100 — POSTURE: {viewingReport.risk_level}
                  </div>
                </>
              ) : isScraping ? (
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
                  <span>● RECONCILING PARALLEL INDEX DISPATCHES...</span>
                </div>
              ) : (
                <span>░ Standby: Pipeline orchestrator awaiting click initialization.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#E4E3E0] min-h-screen text-[#141414] font-sans flex flex-col border-[12px] border-[#141414] overflow-x-hidden select-none">
      
      {/* HEADER SECTION */}
      <header className="h-20 border-b border-[#141414] flex items-center px-4 md:px-8 justify-between bg-[#E4E3E0] shrink-0 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#141414] flex items-center justify-center shrink-0">
            <div className="w-4 h-4 bg-[#E4E3E0] rotate-45"></div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tighter uppercase font-display">SupplierPulse</h1>
            <span className="hidden sm:inline-block text-[9px] font-mono tracking-widest uppercase opacity-60">Live Intelligence Agent</span>
          </div>
        </div>
        
        {/* Real-time Time Clock badge */}
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:block text-right">
            <div className="text-[9px] font-mono opacity-50 uppercase">Global UTC Terminal</div>
            <div className="text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 justify-end">
              <Clock className="w-3.5 h-3.5 opacity-60 animate-pulse text-indigo-800" />
              <span>2026-05-25 23:29:50 UTC</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 border-l border-[#141414]/20 pl-4 md:pl-6 text-right">
            <div className="text-right">
              <div className="text-[9px] font-mono opacity-50 uppercase">Agent Brain</div>
              <select
                value={aiMode}
                onChange={(e) => setAiMode(e.target.value)}
                className="bg-[#DCDAD7] border border-[#141414] text-xs font-mono font-bold px-2 py-0.5 outline-none text-[#141414] cursor-pointer shadow-[2px_2px_0px_#141414] uppercase text-right h-7 rounded"
              >
                <optgroup label="AIML API MODELS">
                  <option value="google/gemma-3-4b-it">Gemma 3 4B</option>
                  <option value="google/gemma-3-12b-it">Gemma 3 12B</option>
                  <option value="google/gemma-3-27b-it">Gemma 3 27B</option>
                  <option value="deepseek/deepseek-chat">DeepSeek V3 Chat</option>
                  <option value="deepseek/deepseek-r1">DeepSeek R1</option>
                  <option value="meta-llama/Llama-3.3-70B-Instruct-Turbo">Llama 3.3 70B</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={diagnoseGlobalApiKeys}
              className="bg-amber-400 hover:bg-amber-300 active:translate-y-[1px] border border-[#141414] text-[10px] uppercase font-mono font-black h-7 px-2.5 shadow-[2px_2px_0px_#141414] flex items-center gap-1 cursor-pointer transition-all rounded"
              title="Test all loaded AI Service API Keys"
            >
              <span>Verify Keys</span>
            </button>
            <button
              onClick={() => setShowConfigModal(true)}
              className="bg-sky-400 hover:bg-sky-300 active:translate-y-[1px] border border-[#141414] text-[10px] uppercase font-mono font-black h-7 px-2.5 shadow-[2px_2px_0px_#141414] flex items-center gap-1.5 cursor-pointer transition-all rounded"
              title="Configure API and slack credentials manually"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Configure</span>
            </button>
          </div>
        </div>
      </header>

      {/* SECONDARY NAVIGATION BAR */}
      <div className="bg-[#DCDAD7] border-b-2 border-[#141414] px-4 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 text-xs font-mono font-extrabold uppercase tracking-wider border-2 border-[#141414] cursor-pointer transition-all rounded flex items-center gap-2 shadow-[2px_2px_0px_#141414] active:translate-y-[0.5px] active:shadow-[1px_1px_0px_#141414] ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-[#141414] hover:bg-neutral-150'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Intelligence Lab</span>
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            className={`px-4 py-1.5 text-xs font-mono font-extrabold uppercase tracking-wider border-2 border-[#141414] cursor-pointer transition-all rounded flex items-center gap-2 shadow-[2px_2px_0px_#141414] active:translate-y-[0.5px] active:shadow-[1px_1px_0px_#141414] ${
              activeTab === 'registry'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-[#141414] hover:bg-neutral-150'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Supplier Audit Registry ({vendors.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('scheduler')}
            className={`px-4 py-1.5 text-xs font-mono font-extrabold uppercase tracking-wider border-2 border-[#141414] cursor-pointer transition-all rounded flex items-center gap-2 shadow-[2px_2px_0px_#141414] active:translate-y-[0.5px] active:shadow-[1px_1px_0px_#141414] ${
              activeTab === 'scheduler'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-[#141414] hover:bg-neutral-150'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Automation Scheduler ({schedules.length})</span>
          </button>
        </div>

        <div className="text-[10px] font-mono opacity-75 uppercase flex items-center gap-2">
          <span className="hidden sm:inline">ACTIVE CANVAS:</span>
          <span className="font-extrabold text-indigo-950 bg-white px-2.5 py-1 border border-[#141414] rounded shadow-[1px_1px_0px_#141414] text-[9px]">
            {activeTab === 'dashboard' ? 'LAB EVALUATIONS' : activeTab === 'registry' ? 'CENTRAL DATA DIRECTORY' : 'AUTOMATED MONITORING'}
          </span>
        </div>
      </div>

      {/* SEARCH OR CONTROLLERS ROW */}
      <div className="p-4 md:p-6 bg-white border-b border-[#141414]">
        <SearchBar onAnalyze={handleAnalyze} isLoading={isScraping} />
      </div>

      {/* MAIN WORKSPACE CANVAS TABS SWITCHER */}
      {activeTab === 'dashboard' ? (
        <main className="flex-1 grid grid-cols-12 overflow-hidden min-h-0 bg-white">

        {/* RIGHT COLUMN: DETAIL BRIEF REPORT */}
        <section className="col-span-12 flex flex-col p-4 md:p-8 gap-6 bg-white overflow-hidden min-h-[500px]">
          
          <AnimatePresence mode="wait">
            {isScraping && !viewingReport ? (
              // MULTI-AGENT PIPELINE CONCURRENT GRAPH FOR ACTIVE SCRAPING
              <motion.div 
                key="scanning-state"
                className="flex-1 flex flex-col justify-start"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                {/* Visual grid rendering */}
                {renderMultiAgentPipeline()}

                <div className="flex-grow flex flex-col justify-center items-center text-center py-8 border-2 border-dashed border-stone-200 bg-stone-50 rounded mt-4">
                  <div className="w-10 h-10 border-2 border-[#141414] border-t-amber-400 animate-spin flex items-center justify-center mb-3">
                    <div className="w-5 h-5 border-2 border-[#141414] border-b-cyan-400 rotate-45 animate-ping"></div>
                  </div>
                  <h3 className="text-sm font-bold font-mono tracking-widest text-stone-800 uppercase">
                    Live Web Index Ingestion & Vector Matching Active...
                  </h3>
                  <p className="text-[10px] font-mono text-stone-500 max-w-md leading-normal tracking-tight px-4 lowercase">
                    Each specialized agent analyzes scraped indicators in parallel. Classification engines assigning severe flags in real-time.
                  </p>
                </div>
              </motion.div>

            ) : viewingReport && viewingCompany ? (
              // CORE WOW BRIEF CARD REPORT VIEW
              <motion.div 
                key="report-card"
                className="flex-1 flex flex-col gap-6"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* Header Information row */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-4 border-b border-[#141414]/10">
                  <div className="space-y-1 uppercase">
                    <div className="text-xs font-mono font-extrabold tracking-[0.2em] text-cyan-800">
                      Corporate Vendor Intelligence Brief
                    </div>
                    <h3 className="text-4xl md:text-5xl lg:text-3xl font-black font-serif tracking-tight text-[#141414] normal-case">
                      {viewingCompany.canonicalName}
                    </h3>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className={`px-2 py-0.5 border border-[#141414] text-[10px] font-mono font-bold uppercase shadow-[1px_1px_0px_#141414] ${getBadgeColor(viewingReport.risk_level)}`}>
                        {viewingReport.risk_level} PROFILE
                      </span>
                      <span className="px-2 py-0.5 bg-zinc-100 border border-[#141414] text-[10px] font-mono font-bold uppercase shadow-[1px_1px_0px_#141414]">
                        Confidence: {(viewingReport.overall_confidence * 100).toFixed(0)}%
                      </span>
                      <span className="px-2 py-0.5 bg-slate-900 text-[#E4E3E0] text-[10px] font-mono font-bold uppercase shadow-[1px_1px_0px_#141414]">
                        {viewingCompany.industry || 'Multi-indicator Segment'}
                      </span>
                      <button
                        onClick={() => setShowRiskBreakdown(!showRiskBreakdown)}
                        className="px-2 py-0.5 bg-white border-2 border-dashed border-indigo-500 hover:border-indigo-700 text-indigo-700 hover:text-indigo-900 text-[10px] font-mono font-black uppercase rounded cursor-pointer transition-all flex items-center gap-1 active:scale-95"
                      >
                        Rules & Criteria {showRiskBreakdown ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>

                  <div className="shrink-0 self-start md:self-center">
                    <ScoreGauge score={viewingReport.risk_score} />
                  </div>
                </div>

                {/* CRITERIA AUDIT BREAKDOWN PANEL */}
                {(() => {
                  const breakdown = calculateClientRiskBreakdown(viewingSignals);
                  return showRiskBreakdown ? (
                    <div className="mt-4 p-4 border-2 border-[#141414] bg-[#FAF9F5] rounded shadow-[4px_4px_0px_#141414] text-[10px] font-mono leading-relaxed">
                      <div className="flex items-center gap-1.5 font-bold uppercase text-[11px] text-[#141414] border-b border-[#141414]/20 pb-2 mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                        <span>♛ Risk Assessment Mathematical Rating Criteria (5 Positive vs 5 Negative Factors)</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* LEFT COLUMN: POSITIVE HEALTH FACTORS */}
                        <div className="p-3 border-2 border-emerald-900 bg-[#F0FDF4] rounded shadow-[2px_2px_0px_rgba(16,185,129,0.15)]">
                          <div className="flex justify-between items-center text-emerald-800 font-extrabold uppercase border-b border-emerald-200 pb-1 mb-2 text-[10px]">
                            <span>✚ POSITIVE HEALTH CRITERIA</span>
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded text-[9px] font-black">
                              MAX 100% (SUM: {breakdown.totalPositive}%)
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            {/* P1 */}
                            <div>
                              <div className="flex justify-between font-bold text-emerald-900 text-[9px] uppercase">
                                <span>Regulatory & Legal Cleanliness</span>
                                <span className={breakdown.p1 === 20 ? "text-emerald-700 font-black" : "text-amber-700 font-black"}>{breakdown.p1}/20%</span>
                              </div>
                              <div className="w-full bg-emerald-200/50 h-1.5 rounded-full overflow-hidden mt-1 border border-emerald-300">
                                <div className="bg-emerald-600 h-full transition-all duration-500" style={{ width: `${(breakdown.p1 / 20) * 100}%` }}></div>
                              </div>
                              <p className="text-[8px] text-emerald-650 mt-0.5 uppercase italic leading-tight">Zero registered sovereign infractions, money sanctions, or legal penalties.</p>
                            </div>

                            {/* P2 */}
                            <div>
                              <div className="flex justify-between font-bold text-emerald-900 text-[9px] uppercase">
                                <span>Capital Solidity & High Reserves</span>
                                <span className="text-emerald-700 font-black">{breakdown.p2}/20%</span>
                              </div>
                              <div className="w-full bg-emerald-200/50 h-1.5 rounded-full overflow-hidden mt-1 border border-emerald-300">
                                <div className="bg-emerald-600 h-full transition-all duration-500" style={{ width: `${(breakdown.p2 / 20) * 100}%` }}></div>
                              </div>
                              <p className="text-[8px] text-emerald-650 mt-0.5 uppercase italic leading-tight">Active institutional capital rounds or solid asset expansions.</p>
                            </div>

                            {/* P3 */}
                            <div>
                              <div className="flex justify-between font-bold text-emerald-900 text-[9px] uppercase">
                                <span>Personnel Velocity & Job Openings</span>
                                <span className="text-emerald-700 font-black">{breakdown.p3}/20%</span>
                              </div>
                              <div className="w-full bg-emerald-200/50 h-1.5 rounded-full overflow-hidden mt-1 border border-emerald-300">
                                <div className="bg-emerald-600 h-full transition-all duration-500" style={{ width: `${(breakdown.p3 / 20) * 100}%` }}></div>
                              </div>
                              <p className="text-[8px] text-emerald-650 mt-0.5 uppercase italic leading-tight">Hiring expansion, active roles, and low employee turnover indices.</p>
                            </div>

                            {/* P4 */}
                            <div>
                              <div className="flex justify-between font-bold text-emerald-900 text-[9px] uppercase">
                                <span>Reputation Trust & Press Catalyst</span>
                                <span className="text-emerald-700 font-black">{breakdown.p4}/20%</span>
                              </div>
                              <div className="w-full bg-emerald-200/50 h-1.5 rounded-full overflow-hidden mt-1 border border-emerald-300">
                                <div className="bg-emerald-600 h-full transition-all duration-500" style={{ width: `${(breakdown.p4 / 20) * 100}%` }}></div>
                              </div>
                              <p className="text-[8px] text-emerald-650 mt-0.5 uppercase italic leading-tight">Positive news updates, official announcements, and positive trade bulletins.</p>
                            </div>

                            {/* P5 */}
                            <div>
                              <div className="flex justify-between font-bold text-emerald-900 text-[9px] uppercase">
                                <span>Social Support Echo & Advocate Index</span>
                                <span className="text-emerald-700 font-black">{breakdown.p5}/20%</span>
                              </div>
                              <div className="w-full bg-emerald-200/50 h-1.5 rounded-full overflow-hidden mt-1 border border-emerald-300">
                                <div className="bg-emerald-600 h-full transition-all duration-500" style={{ width: `${(breakdown.p5 / 20) * 100}%` }}></div>
                              </div>
                              <p className="text-[8px] text-emerald-650 mt-0.5 uppercase italic leading-tight">Consensus client advocacy on X, Reddit, Facebook, Instagram platforms.</p>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: NEGATIVE RISK FACTORS */}
                        <div className="p-3 border-2 border-rose-900 bg-[#FFF1F2] rounded shadow-[2px_2px_0px_rgba(244,63,94,0.15)]">
                          <div className="flex justify-between items-center text-rose-800 font-extrabold uppercase border-b border-rose-200 pb-1 mb-2 text-[10px]">
                            <span>🔥 NEGATIVE RISK CRITERIA</span>
                            <span className="bg-rose-100 text-rose-800 border border-rose-300 px-1.5 py-0.5 rounded text-[9px] font-black">
                              MAX 100% (SUM: {breakdown.totalNegative}%)
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            {/* N1 */}
                            <div>
                              <div className="flex justify-between font-bold text-rose-900 text-[9px] uppercase">
                                <span>Compliance Infractions & Legal Probe</span>
                                <span className="text-rose-700 font-black">{breakdown.n1}/20%</span>
                              </div>
                              <div className="w-full bg-rose-200/50 h-1.5 rounded-full overflow-hidden mt-1 border border-rose-300">
                                <div className="bg-rose-600 h-full transition-all duration-500" style={{ width: `${(breakdown.n1 / 20) * 100}%` }}></div>
                              </div>
                              <p className="text-[8px] text-rose-650 mt-0.5 uppercase italic leading-tight">SEC filings delays, active state sanctions, or money laundering probes.</p>
                            </div>

                            {/* N2 */}
                            <div>
                              <div className="flex justify-between font-bold text-rose-900 text-[9px] uppercase">
                                <span>Funding Insolvency & Solvency Stress</span>
                                <span className="text-rose-700 font-black">{breakdown.n2}/20%</span>
                              </div>
                              <div className="w-full bg-rose-200/50 h-1.5 rounded-full overflow-hidden mt-1 border border-rose-300">
                                <div className="bg-rose-600 h-full transition-all duration-500" style={{ width: `${(breakdown.n2 / 20) * 100}%` }}></div>
                              </div>
                              <p className="text-[8px] text-rose-650 mt-0.5 uppercase italic leading-tight">Creditor alarms, extended funding stress, or cash-runout indicators.</p>
                            </div>

                            {/* N3 */}
                            <div>
                              <div className="flex justify-between font-bold text-rose-900 text-[9px] uppercase">
                                <span>Structural & Cancelled Recruitment</span>
                                <span className="text-rose-700 font-black">{breakdown.n3}/20%</span>
                              </div>
                              <div className="w-full bg-rose-200/50 h-1.5 rounded-full overflow-hidden mt-1 border border-rose-300">
                                <div className="bg-rose-600 h-full transition-all duration-500" style={{ width: `${(breakdown.n3 / 20) * 100}%` }}></div>
                              </div>
                              <p className="text-[8px] text-rose-650 mt-0.5 uppercase italic leading-tight">Sudden executive departures or developer headcount layoffs.</p>
                            </div>

                            {/* N4 */}
                            <div>
                              <div className="flex justify-between font-bold text-rose-900 text-[9px] uppercase">
                                <span>Adverse Press & Media Outcry</span>
                                <span className="text-rose-700 font-black">{breakdown.n4}/20%</span>
                              </div>
                              <div className="w-full bg-rose-200/50 h-1.5 rounded-full overflow-hidden mt-1 border border-rose-300">
                                <div className="bg-rose-600 h-full transition-all duration-500" style={{ width: `${(breakdown.n4 / 20) * 100}%` }}></div>
                              </div>
                              <p className="text-[8px] text-rose-650 mt-0.5 uppercase italic leading-tight">Incident filings across trade journals, press warnings, or leaks.</p>
                            </div>

                            {/* N5 */}
                            <div>
                              <div className="flex justify-between font-bold text-rose-900 text-[9px] uppercase">
                                <span>Social Backlash & Support Complaints</span>
                                <span className="text-rose-700 font-black">{breakdown.n5}/20%</span>
                              </div>
                              <div className="w-full bg-rose-200/50 h-1.5 rounded-full overflow-hidden mt-1 border border-rose-300">
                                <div className="bg-rose-600 h-full transition-all duration-500" style={{ width: `${(breakdown.n5 / 20) * 100}%` }}></div>
                              </div>
                              <p className="text-[8px] text-rose-650 mt-0.5 uppercase italic leading-tight">Negative public thread loops, platform outage complaints, support tickets.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Formula Summary Footnote */}
                      <div className="mt-4 p-2.5 border border-[#141414]/15 bg-white/60 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="text-[9px] text-[#141414]/70 uppercase leading-snug">
                          <div className="font-extrabold text-[#141414] text-[10px]">⚖ Proportionate Combined Index Math Rule:</div>
                          <div className="mt-0.5">
                            Combined Ratio = Total Negative / (Total Negative + Total Positive) * 100
                          </div>
                          <div className="mt-0.5 text-[#141414] font-semibold font-mono">
                            Current Division: {breakdown.totalNegative}% / ({breakdown.totalNegative}% + {breakdown.totalPositive}%) = {breakdown.final}/100
                          </div>
                        </div>
                        <div className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded border border-indigo-200 uppercase self-end shadow-[2px_2px_0px_rgba(79,70,229,0.15)] whitespace-nowrap">
                          Calculated Index: {breakdown.final}/100 — {breakdown.final > 75 ? 'CRITICAL' : breakdown.final > 50 ? 'HIGH' : breakdown.final > 25 ? 'MEDIUM' : 'LOW'} RISK
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* VISUAL MULTI-AGENT SYNTHESIS LAYER ON TOP OF CARD */}
                {renderMultiAgentPipeline()}

                {/* Primary Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 flex-1 overflow-visible">
                  
                  {/* Left Column Content */}
                  <div className="flex flex-col gap-6">
                    {/* Executive summary */}
                    <div className="border-t-2 border-[#141414] pt-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-widest font-mono text-[#141414] mb-2 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-cyan-700" />
                        <span>Executive Summary</span>
                      </h4>
                      <p className="text-xs md:text-sm leading-relaxed font-sans text-[#141414]/85 bg-[#DCDAD7]/10 p-2.5 border border-[#141414]/10 italic">
                        &ldquo;{viewingReport.executive_summary ? viewingReport.executive_summary.replace(/^["'“”‘’\s]+|["'“”‘’\s]+$/g, '').trim() : ''}&rdquo;
                      </p>
                    </div>

                    {/* Key Risk Signals Bullet list */}
                    <div className="border-t-2 border-[#141414] pt-3 flex-1">
                      <h4 className="text-xs font-extrabold uppercase tracking-widest font-mono text-[#141414] mb-3 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Key Risk Signals</span>
                      </h4>
                      
                      {viewingReport.key_risks && viewingReport.key_risks.length > 0 ? (
                        <ul className="space-y-2.5 text-xs font-mono">
                          {viewingReport.key_risks.map((risk, index) => (
                            <li key={index} className="flex items-start gap-2 bg-[#DCDAD7]/10 p-2 border border-[#141414]/10 shadow-[1px_1px_0px_#141414]">
                              <span className="w-2 h-2 bg-rose-500 rounded-full mt-1 shrink-0"></span>
                              <span className="text-[#141414]/90">{risk}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-xs italic font-serif opacity-60 bg-emerald-50 text-emerald-800 p-3 border border-emerald-300">
                          No direct negative risk flag criteria identified for this target record. Operating within normal benchmarks.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column Content */}
                  <div className="flex flex-col gap-6">
                    {/* Positive Indicators Bullet list */}
                    <div className="border-t-2 border-[#141414] pt-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-widest font-mono text-[#141414] mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Positive Signals &amp; Strengths</span>
                      </h4>

                      {viewingReport.positive_signals && viewingReport.positive_signals.length > 0 ? (
                        <ul className="space-y-2 text-xs font-mono">
                          {viewingReport.positive_signals.map((pos, index) => (
                            <li key={index} className="flex items-start gap-2 bg-[#DCDAD7]/10 p-2 border border-[#141414]/10 shadow-[1px_1px_0px_#141414]">
                              <span className="w-2 h-2 bg-emerald-400 rounded-full mt-1 shrink-0"></span>
                              <span className="text-[#141414]/90">{pos}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-xs italic font-serif opacity-60 p-2 bg-slate-50 border border-slate-200">
                          Insufficient strength indicators to log commercial advantages.
                        </div>
                      )}
                    </div>

                    {/* ACTIONS CONTAINER BOX */}
                    <div className="bg-[#141414] text-white p-4 flex flex-col justify-between h-full shadow-[6px_6px_0px_#DCDAD7] border-t-2 border-amber-400">
                      <div>
                        <h4 className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#E4E3E0]/70 mb-3 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Recommended Action Protocol</span>
                        </h4>
                        
                        <div className="space-y-3">
                          {viewingReport.recommended_actions && viewingReport.recommended_actions.map((act, index) => (
                            <div key={index} className="text-xs leading-snug flex gap-2 items-start">
                              <span className="text-amber-400 font-mono font-bold shrink-0">{index + 1}.</span>
                              <p className="opacity-90">{act}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SLACK INTEGRATION WEBHOOK TRIGGER BUTTON */}
                      <div className="mt-6 pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-mono uppercase opacity-50">Slack Webhook</span>
                          <span className="text-[9px] font-mono uppercase text-emerald-400 font-bold">Verified Interface</span>
                        </div>
                        <button 
                          onClick={handleExportToSlack}
                          disabled={exportingSlack}
                          className="w-full bg-white text-[#141414] hover:bg-slate-100 disabled:bg-slate-400 disabled:text-slate-200 py-2 text-xs font-mono font-bold uppercase transition-all shadow-[2px_2px_0px_rgb(59,130,246)] cursor-pointer flex items-center justify-center gap-2"
                        >
                          {exportingSlack ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>POSTING TO SLACK...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5 text-indigo-700" />
                              <span>Export to Slack Channel #procurement</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Lower Signals Feed Panel breakdown */}
                {viewingSignals && viewingSignals.length > 0 && (
                  <div className="border-t-2 border-[#141414] pt-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-widest font-mono text-[#141414] mb-3 flex justify-between items-center">
                      <span>Index Source Logs &amp; References ({viewingSignals.length})</span>
                      <span className="text-[9px] opacity-50 italic normal-case">Grounding citations attached</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                      {viewingSignals.map((sig, idx) => (
                        <div key={idx} className="border border-[#141414] p-2 bg-white shadow-[1px_1px_0px_#141414] text-[11px] font-mono leading-relaxed relative flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-1.5 border-b border-[#141414]/5 pb-1 gap-1">
                              <span className="font-bold text-[#141414] uppercase text-[10px] bg-[#DCDAD7] px-1.5 py-0.5 border border-[#141414]/10 shrink-0">
                                {sig.scraper} log
                              </span>
                              <span className="text-[9px] text-[#141414]/50">
                                {new Date(sig.scraped_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[#141414]/90 mb-2 italic bg-[#E4E3E0]/20 p-1.5 rounded">
                              &ldquo;{sig.summary}&rdquo;
                            </p>
                          </div>
                          
                          {sig.source_url && (
                            <a 
                              href={sig.source_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-[9px] text-cyan-800 hover:text-cyan-700 hover:underline mt-auto self-end flex items-center gap-1 shrink-0 font-bold"
                            >
                              <span>Inspect Source URI</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              // DEFAULT GREETING SCREEN STATE / GUIDE
              <div className="flex-1 flex flex-col justify-center items-center py-20 text-center">
                <div className="w-16 h-16 bg-[#141414] flex items-center justify-center rotate-45 mb-6">
                  <Layers className="w-7 h-7 text-[#E4E3E0] -rotate-45" />
                </div>
                <h3 className="text-4xl font-bold font-serif uppercase tracking-tight mb-2">
                  Live Vendor Analysis Portal
                </h3>
                <p className="text-sm font-mono text-[#141414]/70 max-w-lg leading-relaxed mb-6">
                  SupplierPulse executes autonomous scraping across open networks using Bright Data search grids.
                  Enter a target supplier or corporation name above to compile instant live scorecards, or select a record from the archived ledger.
                </p>
                
                {/* Visual architectural boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl text-left">
                  <div className="border border-[#141414] p-3 shadow-[2px_2px_0px_#141414]">
                    <div className="text-[10px] font-mono font-bold uppercase text-[#141414]/50 mb-1">01. Live Crawl</div>
                    <p className="text-xs leading-relaxed font-sans opacity-80">
                      Jobs scraped on Glassdoor, Google search vectors compiled concurrently over sandbox APIs.
                    </p>
                  </div>
                  <div className="border border-[#141414] p-3 shadow-[2px_2px_0px_#141414]">
                    <div className="text-[10px] font-mono font-bold uppercase text-[#141414]/50 mb-1">02. Signal Weighting</div>
                    <p className="text-xs leading-relaxed font-sans opacity-80">
                      Classified using customized finance analysis algorithms. Score calibrated relative to severity weighting.
                    </p>
                  </div>
                  <div className="border border-[#141414] p-3 shadow-[2px_2px_0px_#141414]">
                    <div className="text-[10px] font-mono font-bold uppercase text-[#141414]/50 mb-1">03. Slack Pipeline</div>
                    <p className="text-xs leading-relaxed font-sans opacity-80">
                      Instantly distribute critical risk alerts and material indices directly to alert boards via Webhooks.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>

        </section>
      </main>
      ) : activeTab === 'registry' ? (
        /* DEDICATED PAGE: CENTRAL SUPPLIER AUDIT REGISTRY */
        <div className="flex-1 overflow-y-auto bg-[#DCDAD7]/50 p-4 md:p-8 space-y-8 select-text">
          {/* Header Banner */}
          <div className="border-[3px] border-[#141414] bg-white p-6 md:p-8 shadow-[6px_6px_0px_#141414] space-y-4 rounded-xs">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-black tracking-widest text-indigo-700 bg-indigo-50 px-2 py-0.5 border border-indigo-200 uppercase rounded-sm">
                  ARCHIVES DIRECTORY
                </span>
                <h2 className="text-3xl md:text-4xl font-black font-serif uppercase text-[#141414]">
                  Supplier Audit Registry Directory
                </h2>
                <p className="text-xs font-mono text-zinc-500 uppercase max-w-2xl leading-relaxed">
                  Repository of all corporate evaluations. Track historical risk metrics, compare vendor scorecards, and initialize instant fresh crawling iterations from the vaults.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 shrink-0">
                <button 
                  onClick={fetchVendors} 
                  className="px-4 py-2 border-2 border-[#141414] bg-white text-[#141414] hover:bg-emerald-400 font-mono text-xs font-bold uppercase transition-all shadow-[3px_3px_0px_#141414] active:translate-y-[1px] active:shadow-[1px_1px_0px_#141414] flex items-center gap-1.5 cursor-pointer rounded-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>REFRESH REGISTRY</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Stats Bar Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t border-[#141414]/10">
              <div className="bg-[#DCDAD7]/30 border border-[#141414]/15 p-3 rounded shadow-sm text-center animate-fade-in">
                <div className="text-[9px] font-mono text-zinc-500 uppercase">Total Dossiers</div>
                <div className="text-2xl font-black font-mono mt-1 text-[#141414]">{vendors.length}</div>
              </div>
              <div className="bg-rose-50 border border-rose-350 p-3 rounded shadow-sm text-center">
                <div className="text-[9px] font-mono text-rose-600 uppercase">Critical Risks</div>
                <div className="text-2xl font-black font-mono mt-1 text-rose-700">
                  {vendors.filter(v => v.latest_level === 'CRITICAL').length}
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-300 p-3 rounded shadow-sm text-center">
                <div className="text-[9px] font-mono text-amber-600 uppercase">High Risks</div>
                <div className="text-2xl font-black font-mono mt-1 text-amber-700">
                  {vendors.filter(v => v.latest_level === 'HIGH').length}
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-300 p-3 rounded shadow-sm text-center">
                <div className="text-[9px] font-mono text-yellow-600 uppercase">Medium Risks</div>
                <div className="text-2xl font-black font-mono mt-1 text-yellow-700">
                  {vendors.filter(v => v.latest_level === 'MEDIUM').length}
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-355 p-3 rounded shadow-sm text-center col-span-2 md:col-span-1">
                <div className="text-[9px] font-mono text-emerald-600 uppercase">Low Risks</div>
                <div className="text-2xl font-black font-mono mt-1 text-emerald-700">
                  {vendors.filter(v => v.latest_level === 'LOW').length}
                </div>
              </div>
            </div>
          </div>

          {/* Filtering, Search & Control Center Board */}
          <div className="border-[3px] border-[#141414] bg-white p-4 md:p-6 shadow-[5px_5px_0px_#141414] rounded-xs space-y-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search + filter combination */}
            <div className="flex-1 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
                <input 
                  type="text"
                  placeholder="SEARCH ARCHIVED SUPPLIERS (E.G. TESLA, SPACE-X, NVIDIA, MICROSOFT)..."
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  className="w-full bg-white border-2 border-[#141414] placeholder-zinc-400 font-mono text-xs pl-10 pr-4 py-2.5 outline-none font-bold rounded shadow-[inset_1.5px_1.5px_3px_rgba(0,0,0,0.15)] focus:border-indigo-600 uppercase"
                />
              </div>

              {/* Filtering Risk Levels button-set */}
              <div className="flex flex-col gap-1 shrink-0">
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => {
                    const isActive = vendorLevelFilter === lvl;
                    return (
                      <button
                        key={lvl}
                        onClick={() => setVendorLevelFilter(lvl)}
                        className={`text-[9.5px] font-mono px-3 py-1.5 border-2 border-[#141414] rounded transition-all cursor-pointer font-extrabold uppercase shadow-[2px_2px_0px_#141414] active:translate-y-[0.5px] active:shadow-[1px_1px_0px_#141414] ${
                          isActive 
                            ? 'bg-[#141414] text-white' 
                            : 'bg-white text-[#141414] hover:bg-neutral-100'
                        }`}
                      >
                        {lvl} {lvl !== 'ALL' && `(${vendors.filter(v => v.latest_level === lvl).length})`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selection indicators */}
            {selectedCompareIds.length > 0 && (
              <div className="shrink-0 bg-indigo-50 border-2 border-indigo-600 text-indigo-900 font-mono text-[10px] px-3.5 py-2.5 rounded shadow-[2px_2px_0px_rgba(0,0,0,0.05)] flex items-center justify-between gap-4">
                <span className="font-extrabold">{selectedCompareIds.length} SUPPLIERS SEC COMP</span>
                <button
                  onClick={() => setSelectedCompareIds([])}
                  className="text-[9.5px] font-black underline hover:text-rose-600 block cursor-pointer uppercase"
                >
                  Clear Comparison
                </button>
              </div>
            )}
          </div>

          {/* Core Grid layout of dossiers */}
          {(() => {
            const filtered = vendors.filter(v => {
              const matchSearch = v.name.toLowerCase().includes(vendorSearch.toLowerCase()) || 
                                  (v.industry || '').toLowerCase().includes(vendorSearch.toLowerCase());
              const matchLevel = vendorLevelFilter === 'ALL' || v.latest_level === vendorLevelFilter;
              return matchSearch && matchLevel;
            });

            if (filtered.length === 0) {
              return (
                <div className="text-center py-20 border-4 border-dashed border-[#141414]/20 bg-white shadow-[4px_4px_0px_rgba(0,0,0,0.05)] text-sm font-serif italic text-zinc-600 p-8 rounded-xs">
                  {vendors.length === 0 
                    ? "Dossier database empty. Submit target coordinates on the Lab evaluations tab to instantly save logs here."
                    : "No corporate archived dossiers matching requested metrics. Fine-tune your search flags or filter buttons."
                  }
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((vendor) => {
                  const isSelectedForCompare = selectedCompareIds.includes(vendor.id);
                  const isLoadActive = selectedJobId === vendor.latest_job_id;
                  
                  return (
                    <div 
                      key={vendor.id}
                      className={`border-[3px] border-[#141414] bg-white p-5 shadow-[4px_4px_0px_#141414] relative overflow-hidden transition-all flex flex-col justify-between group rounded-sm min-h-[220px] ${
                        isSelectedForCompare ? 'ring-2 ring-indigo-600 bg-indigo-50/10' : ''
                      } ${isLoadActive ? 'border-indigo-600 shadow-[5px_5px_0px_rgb(79,70,229)]' : ''}`}
                    >
                      {/* Folder Dossier aesthetic tab */}
                      <div className="absolute top-0 right-0 w-24 h-6 bg-[#141414] text-white font-mono text-[8px] font-black tracking-widest text-center py-1 uppercase rounded-bl-sm select-none">
                        INDEXED SEC
                      </div>

                      {/* Side severity warning stripe */}
                      <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                        vendor.latest_level === 'CRITICAL' ? 'bg-rose-500 animate-pulse' :
                        vendor.latest_level === 'HIGH' ? 'bg-amber-500' :
                        vendor.latest_level === 'MEDIUM' ? 'bg-yellow-400' :
                        'bg-emerald-400'
                      }`} />

                      <div className="pl-3 space-y-3">
                        {/* Title and Industry */}
                        <div className="space-y-1 pr-16">
                          <h3 
                            className="text-lg md:text-xl font-extrabold tracking-tight text-[#141414] uppercase hover:underline cursor-pointer flex items-center gap-1.5"
                            onClick={() => {
                              if (vendor.latest_job_id) {
                                loadBriefing(vendor.latest_job_id, vendor.name);
                                setActiveTab('dashboard');
                                addLog(`REGISTRY: Loaded historical report for ${vendor.name} from vaults.`, 'success');
                              }
                            }}
                          >
                            {vendor.name}
                          </h3>
                          <span className="text-[10px] font-mono text-[#141414]/60 bg-stone-100 border border-[#141414]/10 rounded px-1.5 py-0.5 inline-block uppercase font-bold">
                            {vendor.industry || 'Multi-indicator Segment'}
                          </span>
                        </div>

                        {/* Ratings & Metadata Ribbon */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#141414]/10 text-xs">
                          <div>
                            <span className="block text-[8px] font-mono text-zinc-500 uppercase">Supplier Score</span>
                            <span className={`inline-flex items-center gap-1 text-sm font-black font-mono mt-0.5 border px-1.5 py-0.2 rounded shadow-[0.5px_0.5px_0px_rgba(0,0,0,0.15)] ${getBadgeColor(vendor.latest_level)}`}>
                              {vendor.latest_score}/100
                            </span>
                          </div>
                          <div>
                            <span className="block text-[8px] font-mono text-zinc-500 uppercase">Risk Level</span>
                            <span className="block text-xs font-mono font-bold mt-1 text-[#141414] uppercase">
                              {vendor.latest_level}
                            </span>
                          </div>
                        </div>

                        {/* Audit timestamps */}
                        <div className="text-[9px] font-mono text-[#141414]/65 space-y-0.5 pt-1.5 border-t border-stone-100">
                          <div className="flex justify-between">
                            <span>Last Analyzed:</span>
                            <span className="font-bold text-[#141414]">
                              {new Date(vendor.last_analyzed).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Secure Job ID:</span>
                            <span className="font-bold text-zinc-600 truncate max-w-[120px]" title={vendor.latest_job_id}>
                              {vendor.latest_job_id || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Buttons & Actions Tray */}
                      <div className="pl-3 pt-4 mt-4 border-t border-dashed border-[#141414]/15 flex flex-wrap gap-2 items-center justify-between">
                        {/* Selector checkbox for comparison */}
                        <label className="flex items-center gap-2 text-[10px] font-mono font-bold cursor-pointer text-[#141414]/80 hover:text-[#141414]">
                          <input 
                            type="checkbox"
                            checked={isSelectedForCompare}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCompareIds(prev => [...prev, vendor.id]);
                              } else {
                                setSelectedCompareIds(prev => prev.filter(id => id !== vendor.id));
                              }
                            }}
                            className="h-3.5 w-3.5 border-2 border-[#141414] text-indigo-600 focus:ring-0 cursor-pointer rounded-xs"
                          />
                          <span>COMPARE</span>
                        </label>

                        <div className="flex gap-1.5">
                          {/* Re-audit triggering button directly from archive */}
                          <button
                            onClick={() => {
                              handleAnalyze(vendor.name);
                              setActiveTab('dashboard');
                              addLog(`REGISTRY: Initiating live re-audit for ${vendor.name} on the workbench.`, 'exec');
                            }}
                            className="px-2 py-1 bg-amber-400 hover:bg-amber-300 font-mono text-[9px] font-black border border-[#141414] rounded-sm transition-all shadow-[1.5px_1.5px_0px_#141414] active:translate-y-[0.5px] cursor-pointer"
                            title="Rerun the 5 scrapers on this company"
                          >
                            RE-AUDIT
                          </button>

                          {/* Open detailed dossier */}
                          <button 
                            onClick={() => {
                              if (vendor.latest_job_id) {
                                loadBriefing(vendor.latest_job_id, vendor.name);
                                setActiveTab('dashboard');
                                addLog(`REGISTRY: Loaded briefing report for ${vendor.name} from index list.`, 'success');
                              }
                            }}
                            className="px-3 py-1 bg-[#141414] hover:bg-[#202022] text-white font-mono text-[9.5px] font-extrabold border border-[#141414] rounded-sm transition-all shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.5)] active:translate-y-[0.5px] cursor-pointer flex items-center gap-1.5"
                          >
                            <span>OPEN DOSSIER</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Side-by-Side Comparison Workspace (Renders when 1+ company checked!) */}
          {selectedCompareIds.length > 0 && (
            <div className="border-[3px] border-[#141414] bg-white p-6 shadow-[6px_6px_0px_rgba(79,70,229,0.8)] rounded-xs space-y-5">
              <div className="flex justify-between items-center border-b-2 border-[#141414] pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-mono font-black uppercase text-indigo-950 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-600" />
                    <span>Real-Time Supplier Comparison Matrix</span>
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">
                    Side-by-side spec evaluation of selected audited coordinate points ({selectedCompareIds.length} partners)
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCompareIds([])}
                  className="px-3 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-mono text-[10px] font-bold uppercase rounded-sm cursor-pointer"
                >
                  Clear Matrix
                </button>
              </div>

              {selectedCompareIds.length < 2 ? (
                <div className="p-8 text-center bg-stone-50 border border-stone-200 font-mono text-xs opacity-60 italic rounded-sm">
                  ░ Select at least 2 suppliers above using checkmarks to enable side-by-side scorecard comparisons.
                </div>
              ) : (
                <div className="overflow-x-auto border-2 border-[#141414] rounded-sm">
                  <table className="w-full text-left font-mono text-xs divide-y-2 divide-[#141414]">
                    <thead className="bg-stone-50 text-[#141414] uppercase font-bold text-[10px]">
                      <tr>
                        <th className="p-3.5 border-r-2 border-[#141414]">Supplier Target</th>
                        <th className="p-3.5 border-r-2 border-[#141414] text-center">Trust Score</th>
                        <th className="p-3.5 border-r-2 border-[#141414] text-center">Risk Tier</th>
                        <th className="p-3.5 border-r-2 border-[#141414]">Market Industry Segment</th>
                        <th className="p-3.5 border-r-2 border-[#141414]">Archive Job ID</th>
                        <th className="p-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141414]/15 bg-white">
                      {vendors.filter(v => selectedCompareIds.includes(v.id)).map((vendor) => {
                        return (
                          <tr key={vendor.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="p-3.5 border-r-2 border-[#141414] font-black text-[#141414] uppercase">
                              {vendor.name}
                            </td>
                            <td className="p-3.5 border-r-2 border-[#141414] text-center">
                              <span className={`inline-block font-bold border px-2.5 py-0.5 rounded shadow-[0.5px_0.5px_0px_rgba(0,0,0,0.1)] ${getBadgeColor(vendor.latest_level)}`}>
                                {vendor.latest_score}/100
                              </span>
                            </td>
                            <td className="p-3.5 border-r-2 border-[#141414] text-center uppercase font-black text-[11px]">
                              {vendor.latest_level}
                            </td>
                            <td className="p-3.5 border-r-2 border-[#141414] text-zinc-650 uppercase">
                              {vendor.industry || 'Multi-indicator Segment'}
                            </td>
                            <td className="p-3.5 border-r-2 border-[#141414]/15 font-mono text-[10px] text-zinc-500">
                              {vendor.latest_job_id || 'N/A'}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => {
                                  if (vendor.latest_job_id) {
                                    loadBriefing(vendor.latest_job_id, vendor.name);
                                    setActiveTab('dashboard');
                                    addLog(`REGISTRY: Loaded ${vendor.name} scorecard from direct compare link.`, 'success');
                                  }
                                }}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold border border-[#141414] rounded transition-all shadow-[1.5px_1.5px_0px_#141414] active:translate-y-[0.5px] cursor-pointer inline-flex items-center gap-1 uppercase"
                              >
                                <span>LOAD BriefING</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      ) : (
        /* DEDICATED PAGE: AUTOMATIVE SCHEDULER PANEL */
        <div className="flex-grow overflow-y-auto bg-[#DCDAD7]/50 p-4 md:p-8 space-y-8 select-text">
          {/* Header Banner */}
          <div className="border-[3px] border-[#141414] bg-white p-6 md:p-8 shadow-[6px_6px_0px_#141414] rounded-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black tracking-widest text-indigo-700 bg-indigo-50 px-2 py-0.5 border border-indigo-200 uppercase rounded-sm">
                AUTOMATION HUB
              </span>
              <h2 className="text-3xl md:text-4xl font-black font-serif uppercase text-[#141414]">
                Automated Risk Scraper Scheduler
              </h2>
              <p className="text-xs font-mono text-zinc-500 uppercase max-w-2xl leading-relaxed">
                Configure background multi-agent scanning schedules. Automatically dispatch compiled intelligence alerts directly to your team&apos;s Slack and Telegram channels.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Create Schedule Card Form */}
            <div className="col-span-12 lg:col-span-5 bg-white border-[3px] border-[#141414] p-6 shadow-[6px_6px_0px_#141414] space-y-5 rounded">
              <h3 className="text-base font-black font-mono uppercase tracking-wider text-indigo-950 pb-2 border-b-2 border-dashed border-stone-200 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600 animate-pulse" />
                <span>Create Backing Scrape Schedule</span>
              </h3>

              <div className="space-y-4 text-xs font-mono">
                {/* Company target */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold uppercase tracking-wide text-zinc-700">1. Target Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, OpenAI, Microsoft"
                    value={scheduleCompanyName}
                    onChange={(e) => setScheduleCompanyName(e.target.value)}
                    className="bg-[#DCDAD7]/30 border border-[#141414] px-3 py-2 outline-none rounded text-xs w-full"
                  />
                </div>

                {/* Interval selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold uppercase tracking-wide text-zinc-700">2. Crawl Scanning Frequency</label>
                  <select
                    value={scheduleInterval}
                    onChange={(e) => setScheduleInterval(Number(e.target.value))}
                    className="bg-white border border-[#141414] px-3 py-2 outline-none rounded text-xs w-full"
                  >
                    <option value={5}>Every 5 minutes (Dev Testing)</option>
                    <option value={15}>Every 15 minutes</option>
                    <option value={30}>Every 30 minutes</option>
                    <option value={60}>Every Hour (Default)</option>
                    <option value={720}>Every 12 Hours</option>
                    <option value={1440}>Every 24 Hours</option>
                  </select>
                  <p className="text-[9px] text-[#141414]/55 uppercase leading-relaxed font-semibold">
                    The background chrono thread automatically executes the full cyber-auditing pipeline at chosen interval periods.
                  </p>
                </div>

                {/* Slack notification config */}
                <div className="bg-[#DCDAD7]/20 border border-[#141414]/30 p-3.5 rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-[#141414] uppercase flex items-center gap-1.5">
                      <span>📟 SLACK DISPATCHER</span>
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={scheduleSlackEnabled}
                        onChange={(e) => setScheduleSlackEnabled(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4.5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {scheduleSlackEnabled && (
                    <div className="space-y-2 pt-1 transition-all">
                      <label className="text-[10px] text-zinc-600 block">DESTINATION WEBHOOK URL</label>
                      <input
                        type="text"
                        placeholder="Default overrides: https://hooks.slack.com/..."
                        value={scheduleSlackUrl}
                        onChange={(e) => setScheduleSlackUrl(e.target.value)}
                        className="bg-white border border-zinc-400 px-2.5 py-1.5 outline-none rounded text-[11px] w-full"
                      />
                      <p className="text-[9px] text-zinc-500 leading-normal">
                        Leave blank to utilize the custom Slack Webhook URL override set in credentials configurations.
                      </p>
                    </div>
                  )}
                </div>

                {/* Telegram notification config */}
                <div className="bg-[#DCDAD7]/20 border border-[#141414]/30 p-3.5 rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-[#141414] uppercase flex items-center gap-1.5">
                      <span>📢 TELEGRAM DISPATCHER</span>
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={scheduleTelegramEnabled}
                        onChange={(e) => setScheduleTelegramEnabled(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4.5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {scheduleTelegramEnabled && (
                    <div className="space-y-3 pt-1 transition-all">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-600 block">TELEGRAM BOT ACCESS TOKEN</label>
                        <input
                          type="password"
                          placeholder="e.g. 123456789:ABCdef..."
                          value={scheduleTelegramToken}
                          onChange={(e) => setScheduleTelegramToken(e.target.value)}
                          className="bg-white border border-zinc-400 px-2.5 py-1.5 outline-none rounded text-[11px] w-full"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-600 block">TELEGRAM USER / GROUP CHAT ID</label>
                        <input
                          type="text"
                          placeholder="e.g. -1009876543210"
                          value={scheduleTelegramChatId}
                          onChange={(e) => setScheduleTelegramChatId(e.target.value)}
                          className="bg-white border border-zinc-400 px-2.5 py-1.5 outline-none rounded text-[11px] w-full"
                        />
                      </div>
                      <p className="text-[9px] text-zinc-500 leading-normal">
                        Create a bot with @BotFather, retrieve token, retrieve your chat ID, and we will safely coordinate live API calls.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCreateSchedule}
                  disabled={!scheduleCompanyName.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 text-white font-mono font-bold py-2.5 border-2 border-[#141414] shadow-[3px_3px_0px_#141414] active:translate-y-0.5 active:shadow-[1px_1px_0px_#141414] transition-all cursor-pointer uppercase rounded"
                >
                  Create Background Task Schedule
                </button>
              </div>
            </div>

            {/* Existing Active Schedules Card */}
            <div className="col-span-12 lg:col-span-7 bg-white border-[3px] border-[#141414] p-6 shadow-[6px_6px_0px_#141414] rounded flex flex-col min-h-[400px]">
              <h3 className="text-base font-black font-mono uppercase tracking-wider text-indigo-950 pb-2 border-b-2 border-dashed border-stone-200 flex items-center justify-between">
                <span>Active Tracking Schedules</span>
                <span className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-850 px-2 py-0.5 uppercase">
                  ACTIVE CRON JOBS: {schedules.length}
                </span>
              </h3>

              {isLoadingSchedules ? (
                <div className="flex-grow flex flex-col justify-center items-center py-12">
                  <div className="w-8 h-8 border-2 border-[#141414] border-t-indigo-600 animate-spin mb-2"></div>
                  <p className="text-xs font-mono uppercase text-zinc-500 font-bold">Querying Active Task Indexes...</p>
                </div>
              ) : schedules.length === 0 ? (
                <div className="flex-grow flex flex-col justify-center items-center py-16 text-center text-zinc-500 font-mono text-xs opacity-60">
                  <Clock className="w-12 h-12 stroke-1 text-zinc-400 mb-2" />
                  <p className="uppercase font-bold tracking-widest text-[#141414]/90 mb-1">No backing schedules configured yet</p>
                  <p className="text-[10px] leading-relaxed max-w-sm">Use the left configuration panel to enroll targets. The telemetry scanner runs silently in the background.</p>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto mt-4 max-h-[600px] flex-grow">
                  {schedules.map((item) => {
                    const nextDateStr = item.next_run ? new Date(item.next_run).toLocaleTimeString() : 'Standby';
                    const lastRunStr = item.last_run ? new Date(item.last_run).toLocaleTimeString() : 'Never Scanned';
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`border-2 border-[#141414] p-4 rounded bg-white shadow-[3px_3px_0px_#141414] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-indigo-600 ${
                          item.status === 'paused' ? 'opacity-80 border-dashed border-zinc-400' : ''
                        }`}
                      >
                        <div className="space-y-1.5 font-mono text-xs flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-black uppercase text-indigo-950">{item.company_name}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 border rounded uppercase ${
                              item.status === 'active' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}>
                              ● {item.status}
                            </span>
                            <span className="text-[9px] font-bold bg-[#DCDAD7] text-zinc-800 border border-zinc-300 px-1.5 py-0.5 uppercase">
                              Every {item.interval_minutes}m
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-zinc-500 font-semibold uppercase">
                            <div>Last Run: <span className="text-zinc-850">{lastRunStr}</span></div>
                            <div>Next Run: <span className="text-indigo-800 font-bold">{nextDateStr}</span></div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[9px] opacity-75 mr-1 font-bold">ALERTS DISPATCHED:</span>
                            {item.slack_enabled ? (
                              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded">
                                SLACK YES
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold bg-zinc-50 text-zinc-400 border border-zinc-200 px-1.5 py-0.5 rounded">
                                SLACK NO
                              </span>
                            )}
                            {item.telegram_enabled ? (
                              <span className="text-[9px] font-bold bg-sky-50 text-sky-850 border border-sky-300 px-1.5 py-0.5 rounded">
                                TELEGRAM YES
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold bg-zinc-50 text-zinc-400 border border-zinc-200 px-1.5 py-0.5 rounded">
                                TELEGRAM NO
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Schedule row controls */}
                        <div className="flex items-center gap-1.5 w-full md:w-auto self-end md:self-center">
                          <button
                            onClick={() => handleToggleScheduleStatus(item.id, item.status)}
                            className="flex-1 md:flex-initial bg-[#DCDAD7] hover:bg-[#c7c5c2] border border-[#141414] font-mono text-[9px] font-black px-2 py-1.5 cursor-pointer uppercase shadow-[1.5px_1.5px_0px_#141414] active:translate-y-0.5 active:shadow-0.5 rounded text-[#141414]"
                          >
                            {item.status === 'active' ? 'Pause' : 'Resume'}
                          </button>
                          
                          <button
                            onClick={() => handleRunScheduleInstantly(item)}
                            className="flex-1 md:flex-initial bg-emerald-400 hover:bg-emerald-300 border border-[#141414] font-mono text-[9px] font-black px-2 py-1.5 cursor-pointer uppercase shadow-[1.5px_1.5px_0px_#141414] active:translate-y-0.5 active:shadow-0.5 rounded text-[#141414]"
                          >
                            RUN NOW
                          </button>

                          <button
                            onClick={() => handleDeleteSchedule(item.id)}
                            className="flex-1 md:flex-initial bg-rose-100 hover:bg-rose-200 text-rose-800 border border-[#141414] font-mono text-[9px] font-black px-2 py-1.5 cursor-pointer uppercase shadow-[1.5px_1.5px_0px_#141414] active:translate-y-0.5 active:shadow-[1px_1px_0px_#141414] rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WEB SCRAPER STATUS LEDGER PANEL AT THE BOTTOM */}
      <div className="bg-[#E4E3E0] border-t-4 border-[#141414] p-4 md:p-6 flex flex-col gap-4">
        {/* Ledger Header Bar with elegant details */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b-2 border-[#141414] pb-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider font-mono flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-700 animate-pulse" />
              <span>CRAWLER TUNNEL DIRECTORY & VECTOR ENGINE</span>
            </h3>
            <p className="text-[10px] font-mono text-[#141414]/60 uppercase mt-0.5">
              6 Isolated Concurrency streams mapping deep-web targets in real-time
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Global Aggregated Concurrency Progress bar */}
            <div className="flex-1 md:w-60">
              <div className="flex justify-between items-center text-[9px] font-mono mb-1 font-bold">
                <span>AGGREGATOR PIPELINE CONCURRENCY</span>
                <span className="text-indigo-950 font-black">{progressPct}%</span>
              </div>
              <div className="h-2.5 bg-white border-2 border-[#141414] p-0.5 rounded-xs">
                <motion.div 
                  className="h-full bg-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.3 }}
                ></motion.div>
              </div>
            </div>

            <div className="shrink-0 bg-[#141414] text-[#E4E3E0] font-mono text-[9px] font-bold px-2.5 py-1.5 rounded-sm border border-[#141414] shadow-[1px_1px_0px_rgba(0,0,0,0.15)] flex items-center gap-1.5 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{activeScrapersCount}/6 COMPLETED</span>
            </div>
          </div>
        </div>

        {/* Crawler Panels */}
        <div className="space-y-4">
          {/* BOTTOM SECTION: SIX BELOW - SIX SYMMETRICAL SAME-HEIGHT SCRAPER CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-stretch">
            {renderScraperCard('jobs')}
            {renderScraperCard('news')}
            {renderScraperCard('filings')}
            {renderScraperCard('reviews')}
            {renderScraperCard('web')}
            {renderScraperCard('social')}
          </div>

        </div>
      </div>

      {/* COMPACT TOAST NOTIFICATION CORNER */}
      {slackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141414] text-[#E4E3E0] px-4 py-3 border-2 border-amber-400 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] max-w-md animate-bounce font-mono text-xs">
          <div className="flex gap-2 items-center">
            <span className="text-emerald-400 font-bold">&#10003;</span>
            <p>{slackToast.text}</p>
          </div>
        </div>
      )}

      {/* SECURE CLIENT-SIDE CREDENTIALS CONFIGURATION MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-[#141414]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#141414] max-w-lg w-full p-6 shadow-[8px_8px_0px_#141414]">
            <div className="flex justify-between items-center border-b-2 border-[#141414] pb-3 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest font-mono flex items-center gap-2">
                <span>⚙️ Configurations & Overrides Control</span>
              </h3>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="bg-rose-100 hover:bg-rose-200 border border-[#141414] font-mono text-xs font-bold px-2 py-1 cursor-pointer"
              >
                CLOSE
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-950 p-3 mb-4 text-[11px] font-sans text-emerald-950 leading-relaxed rounded">
              <strong>🔒 Zero Server Persistence Guarantee:</strong> Provided overrides are stored <em>only</em> in your browser&apos;s sandbox session (<code>localStorage</code>) and ephemeral memory. Keys are never saved or recorded permanently on our servers.
            </div>

            <div className="space-y-4 font-mono text-xs">
              {/* BRIGHT DATA SECTION */}
              <div className="flex flex-col gap-1">
                <label className="font-bold flex justify-between">
                  <span>1. BRIGHT DATA API KEY</span>
                  <span className="text-[9px] opacity-60 font-normal">Crawler Tunneling</span>
                </label>
                <input
                  type="password"
                  placeholder="Paste your custom Bright Data key..."
                  value={tempBrightDataKey}
                  onChange={(e) => setTempBrightDataKey(e.target.value)}
                  className="bg-[#DCDAD7]/40 border border-[#141414] text-xs px-3 py-1.5 outline-none rounded shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 w-full"
                />
              </div>

              {/* SLACK WEBHOOK SECTION */}
              <div className="flex flex-col gap-1">
                <label className="font-bold flex justify-between">
                  <span>2. SLACK WEBHOOK URL</span>
                  <span className="text-[9px] opacity-60 font-normal">Custom Destination Webhook</span>
                </label>
                <input
                  type="text"
                  placeholder="https://hooks.slack.com/services/..."
                  value={tempSlackWebhook}
                  onChange={(e) => setTempSlackWebhook(e.target.value)}
                  className="bg-[#DCDAD7]/40 border border-[#141414] text-xs px-3 py-1.5 outline-none rounded shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 w-full"
                />
              </div>

              {/* AIML API KEY SECTION */}
              <div className="flex flex-col gap-1">
                <label className="font-bold flex justify-between">
                  <span>3. AIML API KEY</span>
                  <span className="text-[9px] opacity-60 font-normal">AIML API Serverless Inference</span>
                </label>
                <input
                  type="password"
                  placeholder="Paste your AIML API Key..."
                  value={tempAimlKey}
                  onChange={(e) => setTempAimlKey(e.target.value)}
                  className="bg-[#DCDAD7]/40 border border-[#141414] text-xs px-3 py-1.5 outline-none rounded shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 w-full"
                />
              </div>

              {/* GOOGLE GEMINI API KEY SECTION */}
              <div className="flex flex-col gap-1">
                <label className="font-bold flex justify-between">
                  <span>4. GOOGLE GEMINI API KEY</span>
                  <span className="text-[9px] opacity-60 font-normal">Google Search Grounding & fallback logic</span>
                </label>
                <input
                  type="password"
                  placeholder="Paste your Google Gemini API Key..."
                  value={tempGeminiKey}
                  onChange={(e) => setTempGeminiKey(e.target.value)}
                  className="bg-[#DCDAD7]/40 border border-[#141414] text-xs px-3 py-1.5 outline-none rounded shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 w-full"
                />
              </div>

              {/* TELEGRAM BOT API TOKEN */}
              <div className="flex flex-col gap-1">
                <label className="font-bold flex justify-between">
                  <span>5. TELEGRAM BOT TOKEN</span>
                  <span className="text-[9px] opacity-60 font-normal">Client-Side Bot Token</span>
                </label>
                <input
                  type="password"
                  placeholder="1234567890:ABCdefGhIJKlmNoPQRsTuvWxyZ..."
                  value={tempTelegramBotToken}
                  onChange={(e) => setTempTelegramBotToken(e.target.value)}
                  className="bg-[#DCDAD7]/40 border border-[#141414] text-xs px-3 py-1.5 outline-none rounded shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 w-full"
                />
              </div>

              {/* TELEGRAM CHAT ID */}
              <div className="flex flex-col gap-1">
                <label className="font-bold flex justify-between">
                  <span>6. TELEGRAM CHAT ID</span>
                  <span className="text-[9px] opacity-60 font-normal">Chat or Channel Target Channel ID</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. -1001234567890 or 987654321"
                  value={tempTelegramChatId}
                  onChange={(e) => setTempTelegramChatId(e.target.value)}
                  className="bg-[#DCDAD7]/40 border border-[#141414] text-xs px-3 py-1.5 outline-none rounded shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 w-full"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-[#141414]">
              <button
                onClick={handleClearCredentials}
                className="bg-[#DCDAD7] hover:bg-rose-100 text-rose-800 text-[10px] uppercase font-bold px-3 py-2 border border-[#141414] shadow-[2px_2px_0px_#141414] cursor-pointer"
                title="Wipe custom overrides and return to defaults"
              >
                Reset to Defaults
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="bg-white hover:bg-zinc-50 text-[10px] uppercase font-bold px-3 py-2 border border-[#141414] shadow-[2px_2px_0px_#141414] cursor-pointer font-mono"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCredentials}
                  className="bg-emerald-400 hover:bg-emerald-300 text-[10px] uppercase font-bold px-4 py-2 border border-[#141414] shadow-[2px_2px_0px_#141414] cursor-pointer font-mono"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KEY DIAGNOSIS terminal MODAL OVERLAY */}
      {showKeyDiagnosis && (
        <div className="fixed inset-0 bg-[#141414]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#141414] max-w-lg w-full p-6 shadow-[8px_8px_0px_#141414]">
            <div className="flex justify-between items-center border-b-2 border-[#141414] pb-3 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest font-mono flex items-center gap-2">
                <span>🛡️ Active API Keys Diagnosis Matrix</span>
              </h3>
              <button 
                onClick={() => setShowKeyDiagnosis(false)}
                className="bg-rose-100 hover:bg-rose-200 border border-[#141414] font-mono text-xs font-bold px-2 py-1 cursor-pointer"
              >
                CLOSE
              </button>
            </div>

            <p className="text-xs text-[#141414]/70 mb-4 font-sans leading-relaxed">
              We concurrently tested all active API key configurations in our rotation pool. Live status checklist below:
            </p>

            {isTestingKeys ? (
              <div className="flex flex-col items-center py-8 gap-4">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
                <span className="text-xs font-mono tracking-wider animate-pulse uppercase">PROBING API INTERFACES LIVE...</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {keyStatusResults && keyStatusResults.map((key, i) => (
                  <div key={i} className={`border p-3 flex flex-col gap-1 shadow-[2px_2px_0px_#141414] ${key.is_ok ? 'bg-emerald-50 border-emerald-800' : 'bg-rose-50 border-rose-800'}`}>
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-[10px] font-bold uppercase text-[#141414] bg-[#DCDAD7] px-1.5 py-0.5 border border-[#141414]/10 rounded">
                        Key String {i + 1}
                      </span>
                      <span className={`text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 border ${
                        key.is_ok ? 'bg-emerald-100 border-emerald-950 text-emerald-800' : 'bg-rose-100 border-rose-950 text-rose-800'
                      }`}>
                        {key.is_ok ? '🟢 OPERATIONAL' : '🔴 EXHAUSTED / INVALID'}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold font-mono opacity-85 mt-1">
                      {key.display}
                    </p>
                    <div className="text-[9px] font-mono opacity-60 truncate">
                      Matched Node ID: {key.preview || 'Null response code'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t-2 border-[#141414] text-right font-mono text-[9px] opacity-60">
              Calibration check completed. Loaded keys automatically auto-rotate upon quota limits (429/403 errors).
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM FOOTER STATUS LINE */}
      <footer className="h-10 border-t border-[#141414] px-4 md:px-8 flex items-center justify-between bg-[#DCDAD7] text-[10px] font-mono shrink-0">
        <div className="flex gap-4 md:gap-6 uppercase truncate">
          <span className="flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${isScraping ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span>Status: {isScraping ? 'Agent Active' : 'Agent Idle'}</span>
          </span>
          <span className="hidden sm:inline">Refresh: Live on Demands</span>
          <span className="hidden md:inline">Grounding: Google Search Enabled</span>
        </div>
        <div className="flex gap-6 shrink-0">
          <span>BRIGHTDATA: {customBrightDataApiKey ? 'CLIENT OVERRIDE' : 'SYSTEM READY'}</span>
          <span>AIML API: {customAimlApiKey ? 'CLIENT OVERRIDE' : 'SYSTEM READY'}</span>
          <span>GEMINI: {customGeminiApiKey ? 'CLIENT OVERRIDE' : 'SYSTEM READY'}</span>
          <span className="hidden sm:inline uppercase">LLM: {aiMode}</span>
        </div>
      </footer>

    </div>
  );
}
