import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileAudio, 
  FileVideo, 
  Pause,
  Play,
  CheckCircle2, 
  Download, 
  Settings2, 
  Clock, 
  Globe, 
  Zap,
  ChevronRight,
  X,
  Loader2,
  Check,
  Plus,
  Minus,
  MessageSquare,
  ShieldCheck,
  Users,
  CreditCard,
  ChevronDown,
  Mail,
  Building2,
  User,
  Sun,
  Moon,
  LogOut,
  FileText,
  Menu,
  Inbox,
  Trash2,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import { Document, Packer, Paragraph, TextRun } from 'docx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'tr', name: 'Turkish' },
  { code: 'hi', name: 'Hindi' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'id', name: 'Indonesian' },
  { code: 'el', name: 'Greek' },
  { code: 'he', name: 'Hebrew' },
];

const EXPORT_FORMATS = [
  { id: 'txt', name: 'Plain Text', ext: '.txt' },
  { id: 'srt', name: 'SubRip', ext: '.srt' },
  { id: 'vtt', name: 'WebVTT', ext: '.vtt' },
  { id: 'scc_df', name: 'Scenarist 29.97 DF', ext: '.scc' },
  { id: 'scc_ndf', name: 'Scenarist 29.97 NDF', ext: '.scc' },
  { id: 'stl', name: 'Spruce Subtitle File', ext: '.stl' },
  { id: 'ass', name: 'Advanced Sub Station Alpha', ext: '.ass' },
  { id: 'ttml', name: 'TimedText 1.0', ext: '.ttml' },
  { id: 'qt_txt', name: 'Quick Time Text', ext: '.qt.txt' },
  { id: 'dfxp', name: 'Netflix Timed Text', ext: '.dfxp' },
  { id: 'smi', name: 'SAMI', ext: '.smi' },
  { id: 'csv', name: 'CSV', ext: '.csv' },
  { id: 'sub_micro', name: 'MicroDVD', ext: '.sub' },
  { id: 'sub_viewer', name: 'SubViewer 2.0', ext: '.sub' },
  { id: 'sbv', name: 'YouTube', ext: '.sbv' },
  { id: 'lrc', name: 'LyRiCs', ext: '.lrc' },
  { id: 'docx', name: 'Word Document', ext: '.docx' },
  { id: 'pdf', name: 'PDF', ext: '.pdf' },
  { id: 'xlsx', name: 'Excel Spreadsheet', ext: '.xlsx' },
];

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = ({ 
  serverStatus, 
  onScrollTo, 
  theme, 
  onToggleTheme, 
  user, 
  onLogin, 
  onLogout,
  onShowAdminLeads
}: { 
  serverStatus: string, 
  onScrollTo: (id: string) => void,
  theme: 'light' | 'dark',
  onToggleTheme: () => void,
  user: any,
  onLogin: () => void,
  onLogout: () => void,
  onShowAdminLeads?: () => void
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleScroll = (id: string) => {
    onScrollTo(id);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-8 py-4 md:py-6">
      {/* Feathered Background Blur */}
      <div className="absolute inset-0 -z-10 bg-bg-dark/40 backdrop-blur-xl [mask-image:linear-gradient(to_bottom,black_0%,black_60%,transparent_100%)]" />
      
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
          <svg 
            viewBox="0 0 2048 1614" 
            className="w-full h-full text-text-main" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path transform="translate(1165,398)" d="m0 0h24l21 1 25 4 29 6 18 5 30 11 30 14 18 10 19 12 11 8 21 16 10 9 10 8 17 16 15 16 11 14 8 10 10 15 7 10 12 21 13 26 7 16 8 22 8 28 6 29 4 30 1 11v36l-4 37-6 30-9 31-10 28-9 20-13 24-14 22-8 11-16 21-10 11-9 11-17 17-8 7-7 7-11 9-9 9-8 7-10 9-8 7-13 12-7 7-8 7-15 13-4 4h-2v2l-8 7-17 16-4 2v2l-8 7-13 12-8 7-14 13-11 9-9 9-8 7-9 9-8 7-3 1v2l-11 9-7 7-8 7-8 8-8 7-15 13-14 13-8 7-13 11-9 9-8 7-10 9-8 7-15 14-12 11-8 7-11 10-8 7-8 8-8 7-14 12-13 12-14 11-18 14-24 16-26 15-32 16-28 12-19 7-24 8-18 5-30 7-33 6-36 4-18 1h-49l-38-3-42-6-39-8-33-9-30-10-36-15-23-11-19-10-20-11-20-13-27-18-17-13-13-11-9-7-14-13-11-9-11-11-7-8-9-9-14-16 1-4 5-6 8-7 21-21 7-8 11-10 7-8 25-25 8-7 15-15 12-13 7-6 5 5 13 18 14 18 10 11 8 10 20 20 11 9 10 9 18 13 21 13 18 10 21 10 25 10 18 6 29 7 20 4 23 3 23 1h39l26-2 30-5 26-6 25-8 16-6 20-9 16-8 18-10 30-20 10-9 11-9 11-10 8-7 12-11 10-8 12-11 11-9 13-12 8-7 10-9 8-7 3-3h2v-2l11-9 12-11 11-9 16-15 11-9 10-10 8-7 14-12 17-16 12-11 14-12 13-12 9-9 8-7 11-9 7-7 8-7 15-15 8-7 11-9 15-14 10-9 11-9 10-10 8-7 9-9 8-7 14-12 11-11 11-9 11-10 8-7 12-13 13-17 8-13 12-25 9-27 4-23 2-22v-15l-3-26-6-25-8-22-10-20-12-19-13-17-29-29-20-15-15-9-23-12-25-9-23-5-25-3h-19l-29 3-20 5-21 8-16 8-11 6-12 8-18 14-14 12-11 11-8 7-14 12-12 11-11 9-11 10-8 7-15 13-10 9-13 12-11 9-24 22-11 9-12 11-10 9-10 8-15 14-13 11-20 18-11 10-10 8-26 24-11 9-10 8-15 11-14 9-16 8-19 7-21 4h-15l-17-3-17-6-12-7-11-9-7-8-7-11-4-10-2-10v-9l4-16 9-17 15-16 11-10 14-11 11-10 8-7 15-13 9-9 11-9 11-10 8-7 14-13 11-9 14-13 8-7 11-9 15-14 10-9 11-9 17-16 8-7 14-12 10-9 11-9 12-11 15-13 10-9 8-7 30-26 13-12 11-9 13-12 11-9 15-12 18-13 25-15 19-10 26-12 19-7 23-7 37-8 21-3z" fill="currentColor"/>
            <path transform="translate(1020,30)" d="m0 0h43l44 5 23 4 25 6 30 10 28 12 16 8 22 13 17 12 18 14 12 11 28 28 22 28 12 18 14 24 13 27 12 36 7 25 4 22 4 32v32l-7-3-11-8-14-8-19-10-23-10-21-8-28-7-23-4-14-2-8-16-9-17-11-17-12-17-15-16-15-15-11-9-13-10-20-12-20-9-26-8-14-3-21-2h-25l-18 1-24 5-24 8-16 8-18 10-16 11-13 10-14 12-9 8-11 9-15 14-14 11-15 14-10 8-10 9-14 11-15 14-10 9-17 14-10 10-14 11-17 16-28 24-15 14-11 9-7 7-8 7-14 12-10 9-11 10-10 8-10 9-11 9-10 9-8 7-15 13-8 7-20 18-11 9-16 15-11 9-13 12-14 12-11 9-33 33-9 12-16 24-12 23-6 15-7 24-4 21-1 14v25l2 17 4 22 11 33 12 25 10 16 9 12 11 13 22 22 20 15 20 12 21 11 21 8 22 7 15 4 26 4 17 2h9l31-3 25-5 26-8 21-9 25-13 15-10 22-18 10-9 8-7 11-10 8-7 10-9 11-10 11-9 11-10 8-7 12-10h2v-2l8-7 13-12 11-9 12-11 8-7 11-9 12-11 8-7 14-12 13-12 15-13 10-9 8-7 13-12 11-9 11-10 8-7 15-13 10-9 14-10 15-10 15-7 17-5h22l14 3 12 5 9 6 7 6 9 11 8 14 4 13 1 5v24l-4 15-8 15-12 16-6 7-5 5-13 12-15 14-11 9-13 13-8 7-10 9-11 9-7 7-8 7-9 8-11 9-11 11-11 9-15 14-10 9-12 11-11 9-17 16-8 7h-2v2l-11 9-10 10-8 7-11 10-11 9-10 10-8 7-15 13-8 7-15 14-10 8-13 11-19 14-16 10-9 6-23 12-24 11-20 8-21 7-29 8-32 5-25 3-17 1h-22l-32-2-46-7-25-6-25-8-26-10-19-8-22-12-15-8-19-12-11-8-19-14-9-8-11-9-5-4v-2l-4-2-8-8-5-6-14-14-11-14-8-10-13-18-10-17-12-22-11-25-10-28-7-24-6-28-3-20-2-34 1-39 2-23 4-23 6-26 9-29 11-26 8-16 11-20 12-18 12-15 7-8 29-31 8-7 15-14 17-16 14-12 3-1 1-3 8-7 12-12 10-8 15-14 10-9 14-12 15-14 11-9 11-10 8-7 13-12 11-9 17-16 7-7 8-7 12-11 8-7 15-14 10-9 9-7 8-8 8-7 14-13 11-9 8-8 8-7 10-9 11-9 7-7 8-7 10-9 13-11 7-7 8-7 14-12 15-14 10-9 11-9 17-16 12-10 13-10 18-13 19-12 24-13 23-10 26-10 23-7 29-7 19-4z" fill="currentColor"/>
            <path transform="translate(1971,216)" d="m0 0h31l12 3 13 5 2 3-6 12-11 28-13 32-12 31-18 46-12 30-13 33-18 46-10 26-6 16-13 34-12 31-13 33-11 28-8 20-6 11-3 3h-8l-5-4-9-19-15-33-13-28-22-48-7-12v-2h-3l-2 4-16 16-8 7-7 7-8 7-15 14-8 7-16 16-8 7-16 16-11 9-9 9-8 7-4 3-3-1-5-11-12-31-6-14-12-22-13-25-12-20-15-23-6-10-1-7 15-13 12-11 11-9 12-11 8-7 30-27 16-13-2-5-11-12-8-7-40-40-8-7-32-32-4-7 1-8 4-7 8-4 81-14 177-30 137-23z" fill="currentColor"/>
            <path transform="translate(97,827)" d="m0 0h2l1 27 5 37 6 28 8 29 7 21 13 30 11 23 11 20 13 20 9 14 14 18 9 10 9 11 11 12 16 17 16 15 10 8 2 1-2 5-35 35-7 8-8 7-12 12-7 8-33 33-6 7-8 7-9 9-7 8-10 11-10 8-4-2-9-7-8-11-10-14-14-22-14-26-8-16-11-28-8-26-6-26-5-27-4-34v-48l6-48 3-16 7-27 10-30 11-24 12-23 12-19 10-13 9-10z" fill="currentColor"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-lg md:text-xl font-black tracking-tight uppercase leading-none text-text-main">SRTConvert</span>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              serverStatus === 'online' ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : 
              serverStatus === 'checking' ? "bg-amber-500 animate-pulse" : "bg-red-500"
            )} />
            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.15em] font-bold text-brand-secondary/80">
              {serverStatus === 'online' ? 'Engine Online' : serverStatus === 'checking' ? 'Connecting...' : 'Engine Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-secondary">
        <button onClick={() => onScrollTo('pricing')} className="hover:text-text-main transition-colors">Pricing</button>
        <button onClick={() => onScrollTo('why-choose')} className="hover:text-text-main transition-colors">Features</button>
        <button onClick={() => onScrollTo('contact')} className="hover:text-text-main transition-colors">Contact</button>
        
        <div className="flex items-center gap-4 pl-4 border-l border-black/10 dark:border-white/10">
          {onShowAdminLeads && (
            <button 
              onClick={onShowAdminLeads}
              className="px-3 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/10 hover:bg-brand-accent/20 transition-all text-text-main hover:text-brand-accent flex items-center gap-1.5 shadow-sm active:scale-95"
              title="View Contact Submissions (Leads List)"
            >
              <Inbox className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-bold leading-none">Leads Central</span>
            </button>
          )}

          <button 
            onClick={onToggleTheme}
            className="p-2 rounded-full glass hover:bg-black/5 dark:hover:bg-white/10 transition-all text-brand-secondary hover:text-text-main"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
              <div className="flex flex-col items-end mr-1">
                <span className="text-[11px] font-bold text-text-main leading-none">{user.name}</span>
              </div>
              <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full border border-white/10" />
              <button 
                onClick={onLogout}
                className="p-1.5 rounded-full hover:bg-red-500/10 text-brand-secondary hover:text-red-400 transition-all active:scale-90"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="px-6 py-2.5 rounded-full glass border border-black/10 dark:border-white/10 hover:border-brand-accent/40 hover:bg-brand-accent/5 transition-all text-text-main font-bold shadow-sm hover:shadow-lg hover:shadow-brand-accent/20 hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="flex md:hidden items-center gap-3">
        <button 
          onClick={onToggleTheme}
          className="p-2 rounded-full glass text-brand-secondary"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-full glass text-text-main"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 md:hidden bg-bg-dark/95 backdrop-blur-2xl pt-24 px-6"
          >
            <div className="flex flex-col gap-6 text-xl font-bold text-text-main">
              <button onClick={() => handleScroll('pricing')} className="text-left py-2 border-b border-white/5">Pricing</button>
              <button onClick={() => handleScroll('why-choose')} className="text-left py-2 border-b border-white/5">Features</button>
              <button onClick={() => handleScroll('contact')} className="text-left py-2 border-b border-white/5">Contact</button>
              {onShowAdminLeads && (
                <button 
                  onClick={() => { onShowAdminLeads(); setIsMenuOpen(false); }}
                  className="text-left py-2 border-b border-brand-accent/30 text-brand-accent flex items-center gap-2"
                >
                  <Inbox className="w-5 h-5" />
                  Leads Central
                </button>
              )}
              
              <div className="mt-4">
                {user ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 p-4 rounded-2xl glass">
                      <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full border border-white/10" />
                      <div className="flex flex-col">
                        <span className="text-lg font-bold">{user.name}</span>
                        <span className="text-sm text-brand-secondary">{user.email}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => { onLogout(); setIsMenuOpen(false); }}
                      className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 font-bold border border-red-500/20"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { onLogin(); setIsMenuOpen(false); }}
                    className="w-full py-4 rounded-2xl bg-brand-accent text-white font-bold shadow-lg shadow-brand-accent/20"
                  >
                    Sign In with Google
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const PricingCard = ({ 
  plan, 
  price, 
  description, 
  features, 
  buttonText, 
  onClick,
  popular = false,
  renderButton,
  isCurrent = false,
}: { 
  plan: string, 
  price: string, 
  description: string, 
  features: { text: string, included: boolean }[], 
  buttonText: string,
  onClick?: () => void,
  popular?: boolean,
  renderButton?: () => React.ReactNode,
  isCurrent?: boolean,
}) => (
  <div className={cn(
    "relative p-6 md:p-8 rounded-[24px] md:rounded-[32px] flex flex-col gap-6 md:gap-8 transition-all duration-500",
    popular 
      ? "bg-brand-accent/5 border-2 border-brand-accent shadow-[0_0_40px_rgba(59,130,246,0.1)] md:scale-105 z-10" 
      : "glass border-brand-secondary/20 hover:border-brand-secondary/40",
    isCurrent && "ring-2 ring-emerald-500/50 bg-emerald-500/5"
  )}>
    {popular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-accent text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full whitespace-nowrap">
        Most Popular
      </div>
    )}
    {isCurrent && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
        <Check className="w-3 h-3" /> Current Plan
      </div>
    )}
    <div>
      <h3 className="text-xl font-bold mb-2">{plan}</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl md:text-4xl font-bold">{price}</span>
        {price !== 'Custom' && <span className="text-brand-secondary text-sm">/month</span>}
      </div>
      <p className="text-sm text-brand-secondary leading-relaxed md:h-12">
        {description}
      </p>
    </div>
    
    <div className="space-y-3 md:space-y-4 flex-grow">
      {features.map((feature, i) => (
        <div key={i} className="flex items-center gap-3">
          {feature.included ? (
            <div className="w-5 h-5 rounded-full bg-brand-accent/20 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-brand-accent" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-brand-secondary/10 flex items-center justify-center shrink-0">
              <X className="w-3 h-3 text-brand-secondary/80 dark:text-brand-secondary/50" />
            </div>
          )}
          <span className={cn("text-xs md:text-sm", feature.included ? "text-text-main" : "text-brand-secondary/80 dark:text-brand-secondary/50")}>
            {feature.text}
          </span>
        </div>
      ))}
    </div>

    {renderButton ? renderButton() : (
      <button 
        onClick={onClick}
        className={cn(
          "w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all active:scale-[0.98]",
        popular 
          ? "bg-brand-accent text-white hover:bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
          : "glass hover:bg-brand-secondary/10 text-text-main"
      )}>
        {buttonText}
      </button>
    )}
  </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 md:py-6 flex items-center justify-between text-left group"
      >
        <span className="text-base md:text-lg font-medium group-hover:text-brand-accent transition-colors text-text-main">{question}</span>
        <ChevronDown className={cn("w-4 h-4 md:w-5 md:h-5 text-brand-secondary transition-transform shrink-0", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-4 md:pb-6 text-sm md:text-base text-brand-secondary leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LegalModal = ({ title, content, onClose }: { title: string, content: string, onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    onClick={onClose}
  >
    <motion.div 
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      className="bg-bg-dark border border-white/10 rounded-[32px] w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
      onClick={e => e.stopPropagation()}
    >
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-main">{title}</h2>
        <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-8 overflow-y-auto text-brand-secondary leading-relaxed space-y-4">
        {content.split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

// Custom Audio Player Component
const AudioPlayer = ({ src, label }: { src: string, label: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const requestRef = useRef<number>(null);

  const updateProgress = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      requestRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updateProgress);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, updateProgress]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.error("Playback error", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: isPlaying ? [4, 12, 4] : 4 }}
                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                className="w-1 bg-brand-accent rounded-full"
              />
            ))}
          </div>
          <p className="text-[9px] font-black text-brand-secondary uppercase tracking-[0.25em]">{label}</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-brand-secondary/60">
          <span className="text-text-main font-bold">{formatTime(currentTime)}</span>
          <span className="opacity-20">/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        <button 
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-text-main text-bg-dark flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20 group shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        <div className="flex-grow space-y-3">
          <div 
            className="h-1.5 bg-white/5 rounded-full overflow-hidden cursor-pointer group/bar relative"
            onClick={handleProgressClick}
          >
            <div className="absolute inset-0 flex px-1 opacity-10 pointer-events-none">
              {Array.from({ length: 120 }).map((_, i) => (
                <div key={i} className="flex-1 border-r border-white/20" />
              ))}
            </div>
            <motion.div 
              className="absolute inset-y-0 left-0 bg-brand-accent z-10"
              initial={false}
              animate={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              transition={{ type: "tween", ease: "linear", duration: 0.1 }}
            />
            <div className="absolute inset-0 z-20 hover:bg-white/5 transition-colors" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-black text-brand-secondary/40 uppercase tracking-[0.2em] leading-none">Neural Buffer: Syncing</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                    className="w-1 h-1 bg-brand-accent rounded-full"
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
               <div className={cn("w-1.5 h-1.5 rounded-full transition-colors", isPlaying ? "bg-brand-accent shadow-[0_0_8px_#3b82f6]" : "bg-white/10")} />
               <span className="text-[8px] font-bold text-brand-secondary/50 uppercase tracking-widest">{isPlaying ? 'Active Stream' : 'Standby'}</span>
            </div>
          </div>
        </div>
      </div>

      <audio 
        ref={audioRef}
        src={src}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
};

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [status, setStatus] = useState<'idle' | 'selected' | 'uploading' | 'processing' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [legalModal, setLegalModal] = useState<{ title: string, content: string } | null>(null);
  
  // Settings state
  const [language, setLanguage] = useState('en');
  const [exportFormat, setExportFormat] = useState('txt');
  const [threshold, setThreshold] = useState(0.2);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [dbStatus, setDbStatus] = useState<{ status: string, tablesMissing: string[] }>({ status: 'checking', tablesMissing: [] });
  const [cookieError, setCookieError] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<{ plan_id: string, status: string } | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [transcriptionData, setTranscriptionData] = useState<{ segments: any[], text: string } | null>(null);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Admin Leads View State
  const [showAdminLeads, setShowAdminLeads] = useState(false);
  const [adminLeads, setAdminLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [syncingLeads, setSyncingLeads] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const formatSRTTime = (seconds: number) => {
    const date = new Date(0);
    date.setSeconds(seconds);
    const ms = Math.floor((seconds % 1) * 1000);
    const timeString = date.toISOString().substr(11, 8);
    return `${timeString},${ms.toString().padStart(3, "0")}`;
  };

  const formatVTTTime = (seconds: number) => {
    const date = new Date(0);
    date.setSeconds(seconds);
    const ms = Math.floor((seconds % 1) * 1000);
    const timeString = date.toISOString().substr(11, 8);
    return `${timeString}.${ms.toString().padStart(3, "0")}`;
  };

  const formatOutput = (formatId: string): string | Blob | Promise<Blob> => {
    if (!transcriptionData) return '';
    const { segments, text } = transcriptionData;

    switch (formatId) {
      case 'txt':
        return text;
      
      case 'srt': {
        let content = '';
        segments.forEach((s, i) => {
          content += `${i + 1}\n${formatSRTTime(s.start)} --> ${formatSRTTime(s.end)}\n${s.text.trim()}\n\n`;
        });
        return content;
      }

      case 'vtt': {
        let content = 'WEBVTT\n\n';
        segments.forEach((s, i) => {
          content += `${i + 1}\n${formatVTTTime(s.start)} --> ${formatVTTTime(s.end)}\n${s.text.trim()}\n\n`;
        });
        return content;
      }

      case 'csv': {
        let content = 'Index,Start,End,Text\n';
        segments.forEach((s, i) => {
          content += `${i + 1},${s.start},${s.end},"${s.text.trim().replace(/"/g, '""')}"\n`;
        });
        return content;
      }

      case 'sbv': {
        let content = '';
        segments.forEach((s) => {
          content += `${formatVTTTime(s.start)},${formatVTTTime(s.end)}\n${s.text.trim()}\n\n`;
        });
        return content;
      }

      case 'lrc': {
        let content = '';
        segments.forEach((s) => {
          const mins = Math.floor(s.start / 60).toString().padStart(2, '0');
          const secs = (s.start % 60).toFixed(2).padStart(5, '0');
          content += `[${mins}:${secs}]${s.text.trim()}\n`;
        });
        return content;
      }

      case 'docx': {
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Transcription Export", bold: true, size: 32 })],
              }),
              ...segments.map(s => new Paragraph({
                children: [
                  new TextRun({ text: `[${formatSRTTime(s.start)} - ${formatSRTTime(s.end)}] `, color: "666666" }),
                  new TextRun(s.text.trim()),
                ],
                spacing: { after: 200 }
              }))
            ],
          }],
        });
        return Packer.toBlob(doc);
      }

      case 'pdf': {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("Transcription Export", 14, 22);
        autoTable(doc, {
          startY: 30,
          head: [['Start', 'End', 'Text']],
          body: segments.map(s => [formatSRTTime(s.start), formatSRTTime(s.end), s.text.trim()]),
        });
        return doc.output('blob');
      }

      case 'xlsx': {
        const ws = XLSX.utils.json_to_sheet(segments.map(s => ({
          Start: formatSRTTime(s.start),
          End: formatSRTTime(s.end),
          Text: s.text.trim()
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transcription");
        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      }

      case 'scc_df':
      case 'scc_ndf': {
        let content = "Scenarist_SCC V1.0\n\n";
        segments.forEach(s => {
          content += `${formatSRTTime(s.start).replace(',', ':')} ${s.text.trim()}\n`;
        });
        return content;
      }
      
      case 'stl': {
        let content = "$FontName = Arial\n$FontSize = 10\n\n";
        segments.forEach(s => {
          content += `${formatVTTTime(s.start)} , ${formatVTTTime(s.end)} , ${s.text.trim()}\n`;
        });
        return content;
      }

      case 'ttml':
      case 'dfxp': {
        let content = `<?xml version="1.0" encoding="UTF-8"?>
<tt xml:lang="${language}" xmlns="http://www.w3.org/ns/ttml">
  <body>
    <div>
`;
        segments.forEach(s => {
          content += `      <p begin="${s.start.toFixed(3)}s" end="${s.end.toFixed(3)}s">${s.text.trim()}</p>\n`;
        });
        content += `    </div>
  </body>
</tt>`;
        return content;
      }

      case 'ass': {
        let content = `[Script Info]
Title: Transcription
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
        segments.forEach(s => {
          const start = formatVTTTime(s.start).substring(0, 10);
          const end = formatVTTTime(s.end).substring(0, 10);
          content += `Dialogue: 0,${start},${end},Default,,0,0,0,,${s.text.trim()}\n`;
        });
        return content;
      }

      case 'smi': {
        let content = `<SAMI>\n<HEAD>\n<STYLE TYPE="text/css">\n<!--\nP { font-family: Arial; font-weight: normal; color: white; background-color: black; text-align: center; }\n.ENCC { Name: English; lang: en-US; SAMIType: CC; }\n-->\n</STYLE>\n</HEAD>\n<BODY>\n`;
        segments.forEach(s => {
          content += `<SYNC Start=${Math.floor(s.start * 1000)}><P Class=ENCC>${s.text.trim()}\n`;
          content += `<SYNC Start=${Math.floor(s.end * 1000)}><P Class=ENCC>&nbsp;\n`;
        });
        content += `</BODY>\n</SAMI>`;
        return content;
      }

      case 'sub_micro': {
        // MicroDVD uses frame numbers, we'll approximate with 23.976 fps
        let content = '';
        segments.forEach(s => {
          const start = Math.floor(s.start * 23.976);
          const end = Math.floor(s.end * 23.976);
          content += `{${start}}{${end}}${s.text.trim().replace(/\n/g, '|')}\n`;
        });
        return content;
      }

      case 'sub_viewer': {
        let content = `[INFORMATION]\n[TITLE]Transcription\n[AUTHOR]SRTConvert\n[SOURCE]SRTConvert\n[PRG]\n[FILEPATH]\n[DELAY]0\n[CD TRACK]0\n[COMMENT]\n[END INFORMATION]\n[SUBTITLE]\n[COLF]&HFFFFFF,[STYLE]bf,[SIZE]18,[FONT]Arial\n`;
        segments.forEach(s => {
          content += `${formatVTTTime(s.start)},${formatVTTTime(s.end)}\n${s.text.trim()}\n\n`;
        });
        return content;
      }

      case 'qt_txt': {
        let content = `{QTtext} {font:Arial} {size:12} {textColor: 65535, 65535, 65535} {backColor: 0, 0, 0} {justify:center} {timeScale:100}\n`;
        segments.forEach(s => {
          content += `[${formatVTTTime(s.start)}]\n${s.text.trim()}\n[${formatVTTTime(s.end)}]\n`;
        });
        return content;
      }

      default:
        return text;
    }
  };

  const sqlScript = `-- Create Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY, -- Google sub ID
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES profiles(id) NOT NULL,
  status TEXT NOT NULL, -- 'active', 'canceled'
  plan_id TEXT NOT NULL, -- 'free', 'pro'
  paypal_subscription_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Contact Submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Backend uses service_role, but these allow users to see their own data)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid()::text = user_id);`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("SQL copied to clipboard!");
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return; // Silent fail for auth check
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        const text = await res.text();
        if (text.includes("Cookie check") || text.includes("Authenticate in new window")) {
          setCookieError(true);
          return;
        }
      }
      const data = await res.json();
      setUser(data.user);
      if (data.user) {
        fetchSubscription();
      }
    } catch (e) {
      // Silent fail for background auth check
    }
  };

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription');
      if (!res.ok) return;
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setSubscription(data.subscription);
      }
    } catch (e) {
      // Silent fail for background subscription check
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/auth/google/url');
      const { url } = await res.json();
      
      const authWindow = window.open(url, 'google_auth', 'width=600,height=700');
      if (!authWindow) {
        alert("Please allow popups to sign in with Google.");
      }
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim()) {
      setContactError("Full name and work email are required.");
      return;
    }

    setContactSubmitting(true);
    setContactError(null);
    setContactSuccess(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          company: contactCompany,
          message: contactMessage,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactCompany('');
      setContactMessage('');
    } catch (err: any) {
      console.error("Submission failed", err);
      setContactError(err.message || "Failed to send message. Please try again.");
    } finally {
      setContactSubmitting(false);
    }
  };

  const fetchAdminLeads = async () => {
    setLoadingLeads(true);
    setLeadsError(null);
    try {
      const response = await fetch('/api/admin/contacts');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load submissions.");
      }
      setAdminLeads(data.submissions || []);
    } catch (err: any) {
      console.error("Error fetching leads", err);
      setLeadsError(err.message || "Could not retrieve leads.");
    } finally {
      setLoadingLeads(false);
    }
  };

  const handleDeleteLead = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete lead.");
      }
      // Refresh list
      setAdminLeads(prev => prev.filter(lead => lead.id !== id));
    } catch (err: any) {
      console.error("Failed to delete lead", err);
    }
  };

  const handleSyncLeadsToSupabase = async () => {
    setSyncingLeads(true);
    setSyncSuccess(null);
    setSyncError(null);
    try {
      const response = await fetch('/api/admin/contacts/sync', {
        method: 'POST'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to sync leads to search.");
      }
      setSyncSuccess(data.message || "All records copied to your new Supabase instance successfully!");
      fetchAdminLeads();
    } catch (err: any) {
      console.error("Migration error:", err);
      setSyncError(err.message || "Unexpected error during database sync.");
    } finally {
      setSyncingLeads(false);
    }
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) return;
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchUser();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  React.useEffect(() => {
    fetchUser();
    fetch('/api/health')
      .then(async res => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          const text = await res.text();
          if (text.includes("Cookie check") || text.includes("Authenticate in new window")) {
            setCookieError(true);
            throw new Error("Cookie check detected");
          }
        }
        return res.json();
      })
      .then(data => {
        if (data.status === 'ok') {
          setDbStatus(data.database || { status: 'unknown', tablesMissing: [] });
          if (!data.groqConfigured) {
            console.warn("Groq API Key is not configured on the server.");
            setServerStatus('offline');
          } else {
            setServerStatus('online');
          }
        } else {
          setServerStatus('offline');
        }
      })
      .catch((err) => {
        if (err.message !== "Cookie check detected") {
          setServerStatus('offline');
        }
      });
  }, []);

  const [isTooLarge, setIsTooLarge] = useState(false);

  // Dynamically re-evaluate isTooLarge whenever file or subscription details change.
  // This ensures that upgrading to Pro instantly unlocks any already selected >25MB file.
  useEffect(() => {
    if (file) {
      const isPro = subscription?.plan_id === 'pro' && subscription?.status === 'active';
      const MAX_SIZE = isPro ? 100 * 1024 * 1024 : 25 * 1024 * 1024;
      setIsTooLarge(file.size > MAX_SIZE);
    } else {
      setIsTooLarge(false);
    }
  }, [file, subscription]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("Files dropped:", acceptedFiles);
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      const isPro = subscription?.plan_id === 'pro' && subscription?.status === 'active';
      const MAX_SIZE = isPro ? 100 * 1024 * 1024 : 25 * 1024 * 1024;
      
      setIsTooLarge(selectedFile.size > MAX_SIZE);
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setVideoError(false);
      setStatus('selected');
    }
  }, [subscription]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.flac', '.ogg', '.opus', '.mpga'],
      'video/*': ['.mp4', '.mpeg', '.webm']
    },
    multiple: false
  } as any);

  const [srtContent, setSrtContent] = useState<string | null>(null);

  const startConversion = async () => {
    console.log("Starting conversion for file:", file?.name);
    if (!file) return;
    if (serverStatus !== 'online') {
      alert("The transcription engine is currently offline. Please wait a moment or check your connection.");
      return;
    }
    
    setStatus('uploading');
    setProgress(5);
    setSrtContent(null);

    // Continuous progress logic to keep user engaged
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 30) return prev + 2; // Fast initial jump
        if (prev < 85) return prev + 1; // Steady progress
        if (prev < 99) return prev + 0.5; // Slow down near the end
        return prev;
      });
    }, 1000);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);
      formData.append('threshold', threshold.toString());

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Ensure cookies are sent
      });

      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        clearInterval(progressInterval);
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Transcription failed');
        } else {
          const text = await response.text();
          console.error("Server returned non-JSON error response:", text);
          if (text.includes("Cookie check") || text.includes("Authenticate in new window")) {
            setCookieError(true);
            throw new Error("Action required: Your browser is blocking a security cookie.");
          }
          throw new Error(`Server Error (${response.status}): The server returned an HTML page instead of a JSON response.`);
        }
      }

      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Server returned non-JSON success response:", text);
        if (text.includes("Cookie check") || text.includes("Authenticate in new window")) {
          setCookieError(true);
          throw new Error("Action required: Your browser is blocking a security cookie.");
        }
        throw new Error("Invalid server response: Expected JSON but received " + (contentType || "unknown content type"));
      }

      const data = await response.json();
      
      clearInterval(progressInterval);
      setSrtContent(data.srt);
      setTranscriptionData({ segments: data.segments, text: data.text });
      setProgress(100);
      setStatus('completed');
    } catch (error: any) {
      clearInterval(progressInterval);
      console.error('Conversion error:', error);
      if (!cookieError) {
        alert(`Error: ${error.message}`);
      }
      setStatus('selected');
      setProgress(0);
    }
  };

  const downloadOutput = async () => {
    if (!transcriptionData) return;
    const format = EXPORT_FORMATS.find(f => f.id === exportFormat) || EXPORT_FORMATS[0];
    const content = await formatOutput(exportFormat);
    
    let blob: Blob;
    if (content instanceof Blob) {
      blob = content;
    } else {
      blob = new Blob([content as string], { type: 'text/plain' });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.split('.')[0] || 'subtitles'}${format.ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPreviewContent = () => {
    if (!transcriptionData) return '';
    const output = formatOutput(exportFormat);
    if (output instanceof Blob || output instanceof Promise) return '[Binary Content - Download to view]';
    return output;
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setVideoError(false);
    setSrtContent(null);
    setStatus('idle');
    setProgress(0);
    setIsTooLarge(false);
  };

  return (
    <PayPalScriptProvider options={{ 
      clientId: "AbGWxqETVsHJTa4NI2mm4Zb12XvXv1qtn6Lx6ojLTntbzG4KznD_PGxNkGH88P9VbJZ5GvhafFzWuD9K",
      vault: true,
      intent: "subscription"
    }}>
      <div className="min-h-screen selection:bg-brand-accent/30 bg-bg-dark text-text-main">
      <Navbar 
        serverStatus={serverStatus} 
        onScrollTo={scrollToSection}
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onShowAdminLeads={user && user.email === "divyanshvgs0@gmail.com" ? () => {
          setShowAdminLeads(true);
          fetchAdminLeads();
        } : undefined}
      />

      {dbStatus.status === 'tables_missing' && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-4xl px-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-3xl bg-amber-500 border border-amber-600 shadow-[0_0_50px_rgba(245,158,11,0.3)] flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-wider">Database Setup Required</p>
                <p className="text-xs opacity-90 font-medium">The tables <span className="font-mono font-bold">{dbStatus.tablesMissing.join(', ')}</span> are missing in Supabase.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowSqlModal(true)}
                className="px-6 py-3 rounded-2xl bg-white text-amber-600 text-xs font-black uppercase tracking-widest hover:bg-white/90 transition-all shadow-lg active:scale-95"
              >
                Get SQL Script
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="p-3 rounded-2xl bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-lg active:scale-95"
                title="Refresh Status"
              >
                <Clock className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {dbStatus.status === 'connection_failed' && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-4xl px-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-3xl bg-red-500 border border-red-600 shadow-[0_0_50px_rgba(239,68,68,0.3)] flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <X className="w-7 h-7" />
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-wider">Supabase Connection Failed</p>
                <p className="text-xs opacity-90 font-medium">Your SUPABASE_URL seems to be invalid or unreachable. Please update it in Settings.</p>
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="p-3 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg active:scale-95 shrink-0"
              title="Retry Connection"
            >
              <Clock className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showSqlModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setShowSqlModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-bg-dark border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20">
                    <ShieldCheck className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text-main leading-tight">Supabase Setup</h2>
                    <p className="text-sm text-brand-secondary">Run this script in your Supabase SQL Editor</p>
                  </div>
                </div>
                <button onClick={() => setShowSqlModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto flex-grow">
                <div className="relative group">
                  <pre className="p-6 rounded-2xl bg-black/40 border border-white/5 text-xs font-mono text-brand-secondary overflow-x-auto leading-relaxed">
                    {sqlScript}
                  </pre>
                  <button 
                    onClick={() => copyToClipboard(sqlScript)}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-brand-secondary hover:text-text-main transition-all opacity-0 group-hover:opacity-100"
                    title="Copy to Clipboard"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-8 space-y-4">
                  <h4 className="text-sm font-bold text-text-main">Instructions:</h4>
                  <ol className="text-sm text-brand-secondary space-y-2 list-decimal pl-4">
                    <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline">Supabase Dashboard</a>.</li>
                    <li>Select your project and click on <b>SQL Editor</b> in the left sidebar.</li>
                    <li>Click <b>New Query</b> and paste the script above.</li>
                    <li>Click <b>Run</b>.</li>
                    <li>Refresh this page to clear the warning.</li>
                  </ol>
                </div>
              </div>
              <div className="p-8 border-t border-white/5 bg-white/[0.02]">
                <button 
                  onClick={() => copyToClipboard(sqlScript)}
                  className="w-full py-4 rounded-2xl bg-brand-accent text-white font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" /> Copy SQL Script
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showAdminLeads && user && user.email === "divyanshvgs0@gmail.com" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setShowAdminLeads(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-bg-dark border border-white/10 rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-accent/20">
                    <Inbox className="w-6 h-6 text-brand-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-text-main leading-tight">Leads Central</h2>
                    <p className="text-xs md:text-sm text-brand-secondary">Contact us form submissions & organizational requests</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={fetchAdminLeads}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-text-main transition-all border border-white/5 hover:border-white/10"
                  >
                    Refresh
                  </button>
                  <button 
                    onClick={() => setShowAdminLeads(false)} 
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Sync and Search Bar */}
              <div className="p-4 md:px-8 md:py-4 border-b border-white/5 bg-white/[0.005] flex flex-col sm:flex-row items-center gap-4">
                <input 
                  type="text" 
                  placeholder="Search leads by name, email, company, or message..."
                  value={leadSearchQuery}
                  onChange={e => setLeadSearchQuery(e.target.value)}
                  className="flex-grow bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-accent text-sm text-text-main w-full"
                />
                
                <button 
                  onClick={handleSyncLeadsToSupabase}
                  disabled={syncingLeads}
                  className="px-4 py-2.5 rounded-xl bg-brand-accent shadow-[0_0_20px_rgba(59,130,246,0.3)] text-white hover:bg-blue-600 disabled:opacity-50 text-xs font-bold font-sans transition-all flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto hover:scale-[1.02] active:scale-95"
                  title="Move all local leads to current Supabase database"
                >
                  {syncingLeads ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Moving Data...
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5" />
                      Move Data to Supabase
                    </>
                  )}
                </button>
              </div>

              {/* Migration / Sync Feedback */}
              {(syncSuccess || syncError) && (
                <div className="mx-4 md:mx-8 mt-4">
                  {syncSuccess && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold mb-0.5">Sync Completed Successfully</p>
                        <p className="opacity-90">{syncSuccess}</p>
                      </div>
                    </div>
                  )}
                  {syncError && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex flex-col gap-2">
                      <div className="flex items-start gap-2.5">
                        <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold mb-0.5 animate-pulse">Sync Failed</p>
                          <p className="opacity-90">{syncError}</p>
                        </div>
                      </div>
                      {syncError.includes("Missing Table") && (
                        <div className="mt-2 text-left p-3.5 bg-black/40 rounded-xl border border-white/5 space-y-2">
                          <p className="font-semibold text-brand-secondary text-[11px] uppercase tracking-wider">Execute this structure in Supabase SQL Editor:</p>
                          <pre className="text-[10px] font-mono whitespace-pre-wrap select-all cursor-pointer p-2.5 bg-black rounded-lg text-zinc-300">
{`CREATE TABLE IF NOT EXISTS contact_submissions (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;`}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="p-6 md:p-8 overflow-y-auto flex-grow space-y-4">
                {loadingLeads ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
                    <p className="text-sm text-brand-secondary font-mono text-center">Retrieving secure submissions database...</p>
                  </div>
                ) : leadsError ? (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {leadsError}
                  </div>
                ) : (() => {
                  const filteredLeads = adminLeads.filter(lead => {
                    const term = leadSearchQuery.toLowerCase();
                    return (
                      lead.name?.toLowerCase().includes(term) ||
                      lead.email?.toLowerCase().includes(term) ||
                      lead.company?.toLowerCase().includes(term) ||
                      lead.message?.toLowerCase().includes(term)
                    );
                  });

                  if (filteredLeads.length === 0) {
                    return (
                      <div className="text-center py-16 space-y-4">
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-brand-secondary">
                          <Inbox className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-text-main font-bold">No Leads Found</p>
                          <p className="text-xs text-brand-secondary">
                            {leadSearchQuery ? "No matches found for your search query." : "Submissions will appear here once users submit form requests."}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {filteredLeads.map((lead: any) => (
                        <div 
                          key={lead.id} 
                          className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row justify-between gap-4 text-left"
                        >
                          <div className="space-y-3 flex-grow">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                              <span className="font-bold text-text-main text-base">{lead.name}</span>
                              {lead.company && (
                                <span className="px-2.5 py-0.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-bold">
                                  {lead.company}
                                </span>
                              )}
                              <span className="text-xs text-brand-secondary font-mono">
                                {new Date(lead.created_at).toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="text-sm">
                              <span className="text-brand-secondary font-medium mr-1.5 font-mono">Email:</span>
                              <a href={`mailto:${lead.email}`} className="text-brand-accent hover:underline font-mono">
                                {lead.email}
                              </a>
                            </div>

                            {lead.message && (
                              <div className="p-3.5 rounded-xl bg-black/35 border border-white/5 text-sm text-text-main/90 leading-relaxed whitespace-pre-wrap">
                                {lead.message}
                              </div>
                            )}
                          </div>

                          <div className="flex md:flex-col justify-end items-end shrink-0">
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="p-2.5 rounded-xl hover:bg-red-500/10 text-brand-secondary hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all active:scale-90"
                              title="Delete Submission Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
              <div className="p-6 md:p-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-xs text-brand-secondary font-mono">
                <span>Total records loaded: {adminLeads.length}</span>
                <span>Security Sandbox Active</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {cookieError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full p-8 rounded-3xl bg-brand-card border border-white/10 shadow-2xl text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4 tracking-tight">Cookie Check Required</h2>
            <p className="text-brand-secondary mb-8 leading-relaxed">
              Your browser is blocking a required security cookie. This is common on Safari or if third-party cookies are disabled. 
              Please refresh the page or click below to authenticate.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 rounded-xl bg-brand-accent text-white font-bold hover:opacity-90 transition-all"
              >
                Refresh Page
              </button>
              <button 
                onClick={() => window.open(window.location.href, '_blank')}
                className="w-full py-4 rounded-xl bg-white/5 text-brand-primary font-bold hover:bg-white/10 transition-all"
              >
                Open in New Tab
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {legalModal && (
          <LegalModal 
            title={legalModal.title} 
            content={legalModal.content} 
            onClose={() => setLegalModal(null)} 
          />
        )}
      </AnimatePresence>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full glass text-[10px] uppercase tracking-[0.2em] font-bold text-brand-accent mb-6">
              AI-Powered Transcription
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight mb-6 md:mb-8 text-text-main leading-[1.1] md:leading-[1.05]">
              Convert Speech to <br className="hidden sm:block" /> Subtitles in <span className="text-brand-accent">Seconds</span>
            </h1>
            <p className="text-base md:text-xl text-brand-secondary max-w-2xl mx-auto font-light leading-relaxed px-4">
              Transform your media into perfectly timed SRT files. 
              Studio-grade accuracy for creators who demand the best.
            </p>
          </motion.div>
        </section>

        {/* Upload & Preview Section */}
        <section className="max-w-4xl mx-auto mb-20 md:mb-32">
          <AnimatePresence mode="wait">
            {status === 'idle' ? (
              <div 
                {...getRootProps()} 
                className="relative group cursor-pointer"
              >
                <input {...getInputProps()} />
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "rounded-[24px] md:rounded-[32px] border-2 border-dashed transition-all duration-500 p-8 md:p-16 text-center",
                    isDragActive 
                      ? "border-brand-accent bg-brand-accent/5" 
                      : "border-brand-secondary/20 hover:border-brand-secondary/40 bg-brand-secondary/[0.02]"
                  )}
                >
                  <div className="flex flex-col items-center gap-4 md:gap-6">
                    <div className="relative">
                      <div className="w-16 h-16 md:w-24 md:h-24 rounded-full glass flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Upload className="w-6 h-6 md:w-10 md:h-10 text-brand-secondary group-hover:text-text-main transition-colors" />
                      </div>
                      {isDragActive && (
                        <motion.div 
                          layoutId="glow"
                          className="absolute inset-0 rounded-full bg-brand-accent/20 blur-xl animate-pulse" 
                        />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl md:text-3xl font-semibold mb-2 md:mb-3 text-text-main">Drop your file here</h2>
                      <p className="text-brand-secondary font-light text-sm md:text-lg">
                        MP4, MP3, MOV, or WAV. Up to {subscription?.plan_id === 'pro' && subscription?.status === 'active' ? '100MB (Pro Limit)' : '25MB (Free Limit)'}.
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-[10px] md:text-xs font-medium text-brand-secondary/80 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Clock className="w-3 h-3 md:w-4 md:h-4" /> Fast</span>
                      <span className="hidden md:block w-1 h-1 rounded-full bg-white/20" />
                      <span className="flex items-center gap-2"><Globe className="w-3 h-3 md:w-4 md:h-4" /> 90+ Languages</span>
                      <span className="hidden md:block w-1 h-1 rounded-full bg-white/20" />
                      <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" /> 99% Accuracy</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-[24px] md:rounded-[32px] glass p-1 relative overflow-hidden"
              >
                <div className="p-6 md:p-10">
                  <div className="flex items-start justify-between mb-6 md:mb-10">
                    <div className="flex items-center gap-3 md:gap-5">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                        {file?.type.includes('video') ? (
                          <FileVideo className="w-6 h-6 md:w-8 md:h-8 text-brand-accent" />
                        ) : (
                          <FileAudio className="w-6 h-6 md:w-8 md:h-8 text-brand-accent" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg md:text-2xl font-semibold truncate max-w-[180px] sm:max-w-md md:max-w-xl text-text-main">
                          {file?.name}
                        </h3>
                        <p className="text-sm text-brand-secondary">
                          {(file?.size || 0) / 1024 / 1024 > 1 
                            ? `${((file?.size || 0) / 1024 / 1024).toFixed(1)} MB`
                            : `${((file?.size || 0) / 1024).toFixed(1)} KB`}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={reset}
                      className="p-2 md:p-3 rounded-full hover:bg-white/5 text-brand-secondary hover:text-text-main transition-all shrink-0"
                    >
                      <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  </div>

                  {/* Media Preview Area */}
                  {status === 'selected' && previewUrl && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-8 rounded-3xl overflow-hidden glass border-white/10 relative group/preview"
                      style={{ backgroundColor: 'var(--preview-bg)' }}
                    >
                      {/* Technical Grid Overlay */}
                      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                      </div>
                      {file?.type.includes('video') && !file?.name.toLowerCase().endsWith('.mpeg') && !file?.name.toLowerCase().endsWith('.mpg') ? (
                        <div className="relative w-full aspect-video flex items-center justify-center">
                          {videoError && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10 bg-bg-dark/80 backdrop-blur-xl">
                              <div className="w-20 h-20 rounded-full bg-brand-accent/10 flex items-center justify-center">
                                <FileVideo className="w-8 h-8 text-brand-accent" />
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-bold text-text-main">Video Preview Unavailable</p>
                                <p className="text-[10px] text-brand-secondary uppercase tracking-[0.2em] mt-1">Codec not supported by browser</p>
                              </div>
                            </div>
                          )}
                          <video 
                            src={previewUrl} 
                            controls 
                            onError={() => setVideoError(true)}
                            onLoadedData={() => setVideoError(false)}
                            className={cn(
                              "w-full h-full object-contain transition-all duration-700",
                              videoError ? "opacity-0" : "opacity-100"
                            )}
                          />
                        </div>
                      ) : (
                        <div className="p-10 md:p-14 relative">
                          <div className="absolute inset-0 pointer-events-none opacity-20">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 blur-[100px] rounded-full" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 blur-[80px] rounded-full" />
                          </div>
                          <AudioPlayer src={previewUrl || ''} label={file?.type.includes('video') ? "Audio Track Detected" : "Source Audio Preview"} />
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Settings Panel */}
                  {status === 'selected' && (
                    <div className="space-y-8">
                      {/* File Info & Dynamic Limit Advisory Messages */}
                      {file && (
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/15 backdrop-blur-md flex flex-col gap-3">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                            <div className="flex items-center gap-1.5 text-brand-secondary">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                              Selected File Size:
                              <span className="font-bold text-text-main">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                            </div>
                            <span className="text-white/10 hidden sm:inline">|</span>
                            <div className="flex items-center gap-1 text-brand-secondary">
                              Plan Limit:
                              <span className="font-bold text-brand-accent">
                                {subscription?.plan_id === 'pro' && subscription?.status === 'active' ? '100 MB (Pro)' : '25 MB (Free)'}
                              </span>
                            </div>
                          </div>

                          {isTooLarge ? (
                            <div className="text-xs text-red-400 bg-red-500/10 p-3.5 rounded-xl border border-red-500/20 flex flex-col gap-1 mt-1 font-light leading-relaxed">
                              <div className="flex items-center gap-2 font-bold text-red-300">
                                <span>⚠️ File Limit Exceeded</span>
                              </div>
                              <span>
                                {subscription?.plan_id === 'pro' && subscription?.status === 'active'
                                  ? `Your file is ${(file.size / (1024 * 1024)).toFixed(1)} MB, which is over the Pro limit of 100 MB. Please try uploading a compressed version or a shorter file.`
                                  : `This file is ${(file.size / (1024 * 1024)).toFixed(1)} MB, exceeding the 25 MB limit for Free users. Please upgrade to a Pro plan to transcribe files up to 100 MB instantly!`}
                              </span>
                            </div>
                          ) : file.size > 25 * 1024 * 1024 ? (
                            <div className="text-xs text-brand-accent bg-brand-accent/10 p-3.5 rounded-xl border border-brand-accent/20 flex flex-col gap-1 mt-1 font-light leading-relaxed">
                              <div className="flex items-center gap-2 font-bold text-brand-accent">
                                <span>⚡ Advanced Multi-Modal Engine Activated</span>
                              </div>
                              <span>As a Pro user, your file is being transcribed using our premium AI cluster. Because this is a larger file, <b>please note that transcription will take slightly longer to compile.</b> Please keep the tab open.</span>
                            </div>
                          ) : (
                            <div className="text-xs text-brand-secondary bg-white/[0.01] p-3.5 rounded-xl border border-white/5 flex flex-col gap-1 mt-1 font-light leading-relaxed">
                              <div className="flex items-center gap-2 font-semibold text-text-main">
                                <span>ℹ️ Performance Advisory</span>
                              </div>
                              <span>This file is completely within your plan's standard Whisper limits. If it is high-duration, <b>it might take a little longer to completely translate and format.</b> Thank you for your patience!</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                          onClick={startConversion}
                          disabled={isTooLarge}
                          className={cn(
                            "flex-grow h-16 rounded-[20px] bg-brand-accent text-white font-black uppercase tracking-[0.1em] hover:bg-blue-600 shadow-[0_10px_30px_rgba(59,130,246,0.2)] transition-all flex items-center justify-center gap-3 relative overflow-hidden group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-accent disabled:active:scale-100",
                            isTooLarge && "grayscale"
                          )}
                        >
                          <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                          <span>Start Transcription</span>
                        </button>
                        
                        <button 
                          onClick={() => setShowSettings(!showSettings)}
                          className="h-16 px-6 rounded-[20px] glass border-white/10 hover:border-brand-accent/40 transition-all text-text-main group active:scale-95"
                          title="Advanced Settings"
                        >
                          <Settings2 className={cn("w-5 h-5 group-hover:rotate-90 transition-transform duration-500", showSettings && "text-brand-accent rotate-90")} />
                        </button>
                      </div>

                      <AnimatePresence>
                        {showSettings && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pt-6 border-t border-white/5 overflow-hidden"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-4">
                              <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary flex items-center gap-2 mb-2">
                                  <div className="p-1 rounded-sm bg-brand-accent/10">
                                    <Globe className="w-3 h-3 text-brand-accent" />
                                  </div>
                                  Linguistic Model
                                </label>
                                <div className="space-y-1">
                                  <div className="relative group">
                                    <select 
                                      value={language}
                                      onChange={(e) => setLanguage(e.target.value)}
                                      className="w-full h-11 pl-4 pr-10 rounded-lg bg-white/[0.02] border border-white/10 hover:border-brand-accent/40 transition-all text-text-main text-xs font-bold appearance-none focus:ring-0 outline-none cursor-pointer"
                                    >
                                      {SUPPORTED_LANGUAGES.map(lang => (
                                        <option key={lang.code} value={lang.code} className="bg-bg-dark">{lang.name}</option>
                                      ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none text-brand-secondary group-hover:text-brand-accent transition-colors">
                                      <Plus className="w-2.5 h-2.5 mb-[-2px]" />
                                      <Minus className="w-2.5 h-2.5 mt-[-2px]" />
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between px-1 pt-1 opacity-40">
                                    <span className="text-[8px] font-bold uppercase tracking-widest">Neural weights: Optimized</span>
                                    <span className="text-[8px] font-mono">v3.0-large</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary flex items-center gap-2 mb-2">
                                  <div className="p-1 rounded-sm bg-brand-accent/10">
                                    <Download className="w-3 h-3 text-brand-accent" />
                                  </div>
                                  Export Schema
                                </label>
                                <div className="space-y-1">
                                  <div className="relative group">
                                    <select 
                                      value={exportFormat}
                                      onChange={(e) => setExportFormat(e.target.value)}
                                      className="w-full h-11 pl-4 pr-10 rounded-lg bg-white/[0.02] border border-white/10 hover:border-brand-accent/40 transition-all text-text-main text-xs font-bold appearance-none focus:ring-0 outline-none cursor-pointer"
                                    >
                                      {EXPORT_FORMATS.map(f => (
                                        <option key={f.id} value={f.id} className="bg-bg-dark">{f.name} ({f.ext})</option>
                                      ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none text-brand-secondary group-hover:text-brand-accent transition-colors">
                                      <Plus className="w-2.5 h-2.5 mb-[-2px]" />
                                      <Minus className="w-2.5 h-2.5 mt-[-2px]" />
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between px-1 pt-1 opacity-40">
                                    <span className="text-[8px] font-bold uppercase tracking-widest">Format conversion: Lossless</span>
                                    <span className="text-[8px] font-mono">UTF-8</span>
                                  </div>
                                </div>
                              </div>

                              <div className="md:col-span-2 space-y-6 pt-4">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-secondary">Neural Confidence Threshold</label>
                                    <p className="text-[9px] text-brand-secondary/40 uppercase font-bold tracking-widest">Adjust AI sensitivity for quiet segments</p>
                                  </div>
                                  <span className="text-xs font-black text-brand-accent bg-brand-accent/5 px-3 py-1 rounded-lg border border-brand-accent/20">{(threshold * 100).toFixed(0)}%</span>
                                </div>
                                <div className="relative h-6 flex items-center">
                                  <div className="absolute inset-0 flex items-center px-1">
                                    <div className="w-full h-[2px] bg-white/5 rounded-full" />
                                  </div>
                                  <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.05" 
                                    value={threshold}
                                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                    className="w-full h-6 appearance-none bg-transparent cursor-pointer relative z-10 accent-brand-accent"
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Progress & Actions */}
                  <div className="space-y-10">
                    {(status === 'uploading' || status === 'processing' || status === 'completed') && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-xs text-brand-secondary uppercase tracking-widest">
                            {status === 'completed' ? 'Processing Complete' : progress < 30 ? 'Phase 1: Uploading' : 'Phase 2: AI Processing'}
                          </span>
                          <span className="text-brand-accent">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-3 md:h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-brand-accent to-blue-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <div className="flex justify-between items-center px-1">
                           <span className="text-[10px] text-brand-secondary/60 uppercase font-bold tracking-wider">
                            {progress < 30 ? 'Uploading content...' : progress < 85 ? 'Generating timestamps...' : progress < 100 ? 'Finalizing formats...' : 'Ready to download'}
                           </span>
                           {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </div>
                      </div>
                    )}

                    {status === 'completed' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                      >
                        {/* Audio Player in Completed State */}
                        <AudioPlayer src={previewUrl || ''} label="Listen to Source" />

                        <div className="relative group">
                          <div className="absolute top-4 right-4 z-10 flex gap-2">
                              <div className="px-3 py-1.5 rounded-lg glass border-white/10 text-[10px] font-black uppercase tracking-widest text-brand-accent">
                                {EXPORT_FORMATS.find(f => f.id === exportFormat)?.name}
                              </div>
                          </div>
                          <textarea 
                            value={getPreviewContent() as string}
                            readOnly
                            className="w-full h-64 md:h-96 p-8 md:p-12 rounded-[24px] md:rounded-[32px] glass border-white/10 text-brand-secondary font-mono text-xs md:text-sm leading-relaxed focus:ring-0 focus:outline-none resize-none custom-scrollbar"
                          />
                          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/5 to-transparent pointer-events-none rounded-b-[32px] opacity-20" />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                          <button 
                            onClick={downloadOutput}
                            className="flex-grow h-16 rounded-[20px] bg-brand-accent text-white font-black uppercase tracking-[0.11em] hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-brand-accent/20"
                          >
                            <Download className="w-5 h-5" /> Download {EXPORT_FORMATS.find(f => f.id === exportFormat)?.name}
                          </button>
                          <button 
                            onClick={reset}
                            className="h-16 px-10 rounded-[20px] glass border-white/10 text-brand-secondary hover:text-text-main font-bold uppercase tracking-widest text-xs active:scale-95"
                          >
                            New File
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-brand-accent/10 blur-[120px] rounded-full pointer-events-none" />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Step Process Section */}
        <section className="mb-24 md:mb-40">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-text-main">Simple 3-Step Process</h2>
            <div className="w-16 md:w-20 h-1 bg-brand-accent mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-brand-secondary/5 -translate-y-1/2 hidden md:block" />
            {[
              { step: '1', title: 'Upload Media', desc: 'Upload your video or audio files directly to our secure platform.', icon: Upload },
              { step: '2', title: 'AI Processing', desc: 'Our neural engine transcribes your media with 99% accuracy in real-time.', icon: Zap },
              { step: '3', title: 'Download SRT', desc: 'Review your generated subtitles and download them in ready-to-use SRT format.', icon: Download },
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center gap-4 md:gap-6">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl glass flex items-center justify-center shadow-xl">
                  <item.icon className="w-7 h-7 md:w-8 md:h-8 text-brand-accent" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-text-main">{item.step}. {item.title}</h3>
                  <p className="text-brand-secondary text-sm leading-relaxed max-w-[250px]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Section */}
        <section id="why-choose" className="mb-24 md:mb-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="space-y-8 md:space-y-12">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-text-main">Why Choose SRTConvert?</h2>
                <p className="text-brand-secondary text-base md:text-lg leading-relaxed">
                  Built for professionals who need fast, reliable, and secure transcriptions for their video content.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {[
                  { title: 'High Accuracy', desc: 'Advanced AI engine minimizes the need for manual corrections.', icon: CheckCircle2 },
                  { title: 'Privacy First', desc: 'Bank-grade encryption. Your data never leaves our secure pipeline.', icon: ShieldCheck },
                  { title: '90+ Languages', desc: 'Support for global languages, dialects, and automatic translation.', icon: Globe },
                  { title: 'Ultra Fast', desc: 'Get a 1-hour video transcribed in less than 2 minutes.', icon: Zap },
                ].map((item, i) => (
                  <div key={i} className="p-5 md:p-6 rounded-2xl glass border border-white/5 hover:border-white/10 transition-colors">
                    <item.icon className="w-5 h-5 md:w-6 md:h-6 text-brand-accent mb-3 md:mb-4" />
                    <h4 className="font-bold mb-1 md:mb-2 text-text-main text-sm md:text-base">{item.title}</h4>
                    <p className="text-[11px] md:text-xs text-brand-secondary leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative group hidden sm:block">
              <div className="rounded-[32px] md:rounded-[40px] overflow-hidden glass p-2">
                <img 
                  src="https://picsum.photos/seed/studio/800/1000" 
                  alt="Studio Setup" 
                  className="w-full aspect-[4/5] object-cover rounded-[24px] md:rounded-[32px] opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 right-6 md:right-8 p-6 md:p-8 glass rounded-2xl md:rounded-3xl backdrop-blur-xl border-brand-secondary/10">
                <p className="text-text-main text-sm md:text-base font-medium italic mb-4">"This tool saved me 5 hours of manual work every week."</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-accent/20" />
                  <div>
                    <p className="text-xs md:text-sm font-bold">Alex Rivers</p>
                    <p className="text-[9px] md:text-[10px] text-brand-secondary uppercase tracking-widest">Content Creator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="mb-24 md:mb-40 scroll-mt-24 md:scroll-mt-32">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-text-main">Simple, Transparent Pricing</h2>
            <p className="text-brand-secondary text-base md:text-lg px-4">Choose the plan that fits your workflow. Scale up as your content grows.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
            <PricingCard 
              plan="Free"
              price="$0"
              description="Perfect for individuals starting out. Upgrade to Pro for more conversions and longer files."
              buttonText={subscription?.plan_id === 'free' ? "Current Plan" : "Get Started"}
              isCurrent={subscription?.plan_id === 'free'}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              features={[
                { text: '15 conversions per month', included: true },
                { text: '25MB max file size', included: true },
                { text: 'Max 1 minute per file', included: true },
                { text: '50+ languages supported', included: true },
                { text: 'Priority AI processing', included: false },
              ]}
            />
            <PricingCard 
              plan="Pro"
              price="$7.99"
              popular
              isCurrent={subscription?.plan_id === 'pro' && subscription?.status === 'active'}
              description="For power users and creators who need fast turnaround."
              buttonText="Start Pro Trial"
              renderButton={() => {
                if (subscription?.plan_id === 'pro' && subscription?.status === 'active') {
                  return (
                    <div className="w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-bold bg-emerald-500/20 text-emerald-500 text-center border border-emerald-500/30 text-sm md:text-base">
                      Active Subscription
                    </div>
                  );
                }
                return (
                  <div className="w-full">
                    <PayPalButtons 
                      style={{ shape: 'pill', color: 'black', layout: 'horizontal', label: 'subscribe' }}
                      createSubscription={(data, actions) => {
                        return actions.subscription.create({
                          plan_id: 'P-6NA42756GN5325432NGSWW5A'
                        });
                      }}
                      onApprove={async (data, actions) => {
                        try {
                          const res = await fetch('/api/subscription/update', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              plan_id: 'pro',
                              paypal_subscription_id: data.subscriptionID,
                              status: 'active'
                            })
                          });
                          if (res.ok) {
                            const result = await res.json();
                            setSubscription(result.subscription);
                            alert(`Welcome to Pro! Your account has been upgraded.`);
                          }
                        } catch (e) {
                          console.error("Failed to update subscription", e);
                          alert("Payment successful, but we had trouble updating your account. Please contact support.");
                        }
                      }}
                    />
                  </div>
                );
              }}
              features={[
                { text: 'Unlimited conversions', included: true },
                { text: '100MB max file size', included: true },
                { text: 'Priority AI processing', included: true },
                { text: 'Custom SRT styling', included: true },
                { text: 'Email support', included: true },
              ]}
            />
            <PricingCard 
              plan="Enterprise"
              price="Custom"
              description="Scaleable solutions for teams and large-scale media companies."
              buttonText="Contact Sales"
              onClick={() => scrollToSection('contact')}
              features={[
                { text: 'Everything in Pro', included: true },
                { text: 'API access & Webhooks', included: true },
                { text: 'Dedicated account manager', included: true },
                { text: 'SSO & Team management', included: true },
                { text: 'Custom SLA', included: true },
              ]}
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-24 md:mb-40 max-w-3xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-text-main">Frequently Asked Questions</h2>
            <p className="text-brand-secondary text-sm md:text-base px-4">Got questions? We've got answers. If you can't find what you're looking for, feel free to contact our support team.</p>
          </div>
          <div className="glass rounded-[24px] md:rounded-[32px] p-6 md:p-12">
            <FAQItem 
              question="What file formats are supported?"
              answer="We support all major video and audio formats including MP4, MOV, AVI, MP3, WAV, and AAC. Our engine is optimized to handle files up to 100MB across all plans."
            />
            <FAQItem 
              question="How long does a conversion take?"
              answer="Our AI-powered engine is ultra-fast. Typically, a 1-hour video can be transcribed and converted into subtitles in less than 2 minutes."
            />
            <FAQItem 
              question="Is my data secure?"
              answer="Security is our top priority. All files are encrypted during transit and at rest. Your media and transcripts are automatically deleted from our servers immediately after processing."
            />
            <FAQItem 
              question="Can I edit the subtitles?"
              answer="Yes! Once the AI completes the transcription, Pro users can use our custom SRT styling and built-in editor tools to make manual adjustments or change the visual look of the subtitles."
            />
            <FAQItem 
              question="How many languages are supported?"
              answer="We currently support transcription and translation for over 90+ languages, including English, Spanish, French, German, Chinese, and many more, including regional dialects."
            />
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="mb-24 md:mb-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 md:mb-8 text-text-main">Contact our Sales Team</h2>
              <p className="text-brand-secondary text-base md:text-lg mb-8 md:mb-12 leading-relaxed">
                Looking for a custom solution for your organization? Our enterprise team is here to help you scale your subtitle workflow with dedicated support and custom features.
              </p>
              <div className="space-y-4 md:space-y-6">
                {[
                  { title: 'Dedicated security & compliance review', icon: ShieldCheck },
                  { title: 'Custom onboarding for your entire team', icon: Users },
                  { title: 'Flexible invoicing and volume discounts', icon: CreditCard },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-brand-accent/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 md:w-5 md:h-5 text-brand-accent" />
                    </div>
                    <span className="font-medium text-text-main text-sm md:text-base">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-[32px] md:rounded-[40px] p-8 md:p-12">
              {contactSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 space-y-6"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]" id="contact-success-icon-container">
                    <Check className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-bold text-text-main">Message Received!</h3>
                    <p className="text-sm text-brand-secondary max-w-sm mx-auto">
                      Thank you for contacting us. We've compiled your details and requirements. Our sales team will follow up directly at your work email.
                    </p>
                  </div>
                  <button 
                    id="btn-send-another-msg"
                    onClick={() => setContactSuccess(false)}
                    className="px-6 py-2.5 bg-black/10 dark:bg-white/5 hover:bg-black/25 dark:hover:bg-white/10 text-xs font-bold text-text-main rounded-xl border border-black/15 dark:border-white/10 transition-all"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form className="space-y-4 md:space-y-6" onSubmit={handleContactSubmit} id="contact-sales-form">
                  {contactError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl font-medium" id="contact-error-banner">
                      {contactError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-secondary">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary" />
                        <input 
                          id="contact-name"
                          type="text" 
                          placeholder="John Doe" 
                          required
                          value={contactName}
                          onChange={e => setContactName(e.target.value)}
                          className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 md:py-4 focus:outline-none focus:border-brand-accent transition-colors text-text-main text-sm" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-secondary">Work Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary" />
                        <input 
                          id="contact-email"
                          type="email" 
                          placeholder="john@company.com" 
                          required
                          value={contactEmail}
                          onChange={e => setContactEmail(e.target.value)}
                          className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 md:py-4 focus:outline-none focus:border-brand-accent transition-colors text-text-main text-sm" 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-secondary">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary" />
                      <input 
                        id="contact-company"
                        type="text" 
                        placeholder="Acme Corp" 
                        value={contactCompany}
                        onChange={e => setContactCompany(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 md:py-4 focus:outline-none focus:border-brand-accent transition-colors text-text-main text-sm" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-secondary">Message / Requirements</label>
                    <textarea 
                      id="contact-message"
                      rows={4} 
                      placeholder="Tell us about your volume needs..." 
                      value={contactMessage}
                      onChange={e => setContactMessage(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 md:py-4 focus:outline-none focus:border-brand-accent transition-colors resize-none text-text-main text-sm" 
                    />
                  </div>
                  <button 
                    id="contact-submit-btn"
                    disabled={contactSubmitting}
                    className="w-full py-4 md:py-5 bg-brand-accent text-white font-bold rounded-xl md:rounded-2xl hover:bg-blue-600 border border-brand-accent transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] text-sm md:text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {contactSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 md:py-20 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-16 mb-12 md:mb-20">
            <div className="space-y-4 md:space-y-6 md:w-1/3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                  <svg 
                    viewBox="0 0 2048 1614" 
                    className="w-full h-full text-brand-accent" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path transform="translate(1165,398)" d="m0 0h24l21 1 25 4 29 6 18 5 30 11 30 14 18 10 19 12 11 8 21 16 10 9 10 8 17 16 15 16 11 14 8 10 10 15 7 10 12 21 13 26 7 16 8 22 8 28 6 29 4 30 1 11v36l-4 37-6 30-9 31-10 28-9 20-13 24-14 22-8 11-16 21-10 11-9 11-17 17-8 7-7 7-11 9-9 9-8 7-10 9-8 7-13 12-7 7-8 7-15 13-4 4h-2v2l-8 7-17 16-4 2v2l-8 7-13 12-8 7-14 13-11 9-9 9-8 7-9 9-8 7-3 1v2l-11 9-7 7-8 7-8 8-8 7-15 13-14 13-8 7-13 11-9 9-8 7-10 9-8 7-15 14-12 11-8 7-11 10-8 7-8 8-8 7-14 12-13 12-14 11-18 14-24 16-26 15-32 16-28 12-19 7-24 8-18 5-30 7-33 6-36 4-18 1h-49l-38-3-42-6-39-8-33-9-30-10-36-15-23-11-19-10-20-11-20-13-27-18-17-13-13-11-9-7-14-13-11-9-11-11-7-8-9-9-14-16 1-4 5-6 8-7 21-21 7-8 11-10 7-8 25-25 8-7 15-15 12-13 7-6 5 5 13 18 14 18 10 11 8 10 20 20 11 9 10 9 18 13 21 13 18 10 21 10 25 10 18 6 29 7 20 4 23 3 23 1h39l26-2 30-5 26-6 25-8 16-6 20-9 16-8 18-10 30-20 10-9 11-9 11-10 8-7 12-11 10-8 12-11 11-9 13-12 8-7 10-9 8-7 3-3h2v-2l11-9 12-11 11-9 16-15 11-9 10-10 8-7 14-12 17-16 12-11 14-12 13-12 9-9 8-7 11-9 7-7 8-7 15-15 8-7 11-9 15-14 10-9 11-9 10-10 8-7 9-9 8-7 14-12 11-11 11-9 11-10 8-7 12-13 13-17 8-13 12-25 9-27 4-23 2-22v-15l-3-26-6-25-8-22-10-20-12-19-13-17-29-29-20-15-15-9-23-12-25-9-23-5-25-3h-19l-29 3-20 5-21 8-16 8-11 6-12 8-18 14-14 12-11 11-8 7-14 12-12 11-11 9-11 10-8 7-15 13-10 9-13 12-11 9-24 22-11 9-12 11-10 9-10 8-15 14-13 11-20 18-11 10-10 8-26 24-11 9-10 8-15 11-14 9-16 8-19 7-21 4h-15l-17-3-17-6-12-7-11-9-7-8-7-11-4-10-2-10v-9l4-16 9-17 15-16 11-10 14-11 11-10 8-7 15-13 9-9 11-9 11-10 8-7 14-13 11-9 14-13 8-7 11-9 15-14 10-9 11-9 17-16 8-7 14-12 10-9 11-9 12-11 15-13 10-9 8-7 30-26 13-12 11-9 13-12 11-9 15-12 18-13 25-15 19-10 26-12 19-7 23-7 37-8 21-3z" fill="currentColor"/>
                    <path transform="translate(1020,30)" d="m0 0h43l44 5 23 4 25 6 30 10 28 12 16 8 22 13 17 12 18 14 12 11 28 28 22 28 12 18 14 24 13 27 12 36 7 25 4 22 4 32v32l-7-3-11-8-14-8-19-10-23-10-21-8-28-7-23-4-14-2-8-16-9-17-11-17-12-17-15-16-15-15-11-9-13-10-20-12-20-9-26-8-14-3-21-2h-25l-18 1-24 5-24 8-16 8-18 10-16 11-13 10-14 12-9 8-11 9-15 14-14 11-15 14-10 8-10 9-14 11-15 14-10 9-17 14-10 10-14 11-17 16-28 24-15 14-11 9-7 7-8 7-14 12-10 9-11 10-10 8-10 9-11 9-10 9-8 7-15 13-8 7-20 18-11 9-16 15-11 9-13 12-14 12-11 9-33 33-9 12-16 24-12 23-6 15-7 24-4 21-1 14v25l2 17 4 22 11 33 12 25 10 16 9 12 11 13 22 22 20 15 20 12 21 11 21 8 22 7 15 4 26 4 17 2h9l31-3 25-5 26-8 21-9 25-13 15-10 22-18 10-9 8-7 11-10 8-7 10-9 11-10 11-9 11-10 8-7 12-10h2v-2l8-7 13-12 11-9 12-11 8-7 11-9 12-11 8-7 14-12 13-12 15-13 10-9 8-7 13-12 11-9 11-10 8-7 15-13 10-9 14-10 15-10 15-7 17-5h22l14 3 12 5 9 6 7 6 9 11 8 14 4 13 1 5v24l-4 15-8 15-12 16-6 7-5 5-13 12-15 14-11 9-13 13-8 7-10 9-11 9-7 7-8 7-9 8-11 9-11 11-11 9-15 14-10 9-12 11-11 9-17 16-8 7h-2v2l-11 9-10 10-8 7-11 10-11 9-10 10-8 7-15 13-8 7-15 14-10 8-13 11-19 14-16 10-9 6-23 12-24 11-20 8-21 7-29 8-32 5-25 3-17 1h-22l-32-2-46-7-25-6-25-8-26-10-19-8-22-12-15-8-19-12-11-8-19-14-9-8-11-9-5-4v-2l-4-2-8-8-5-6-14-14-11-14-8-10-13-18-10-17-12-22-11-25-10-28-7-24-6-28-3-20-2-34 1-39 2-23 4-23 6-26 9-29 11-26 8-16 11-20 12-18 12-15 7-8 29-31 8-7 15-14 17-16 14-12 3-1 1-3 8-7 12-12 10-8 15-14 10-9 14-12 15-14 11-9 11-10 8-7 13-12 11-9 17-16 7-7 8-7 12-11 8-7 15-14 10-9 9-7 8-8 8-7 14-13 11-9 8-8 8-7 10-9 11-9 7-7 8-7 10-9 13-11 7-7 8-7 14-12 15-14 10-9 11-9 17-16 12-10 13-10 18-13 19-12 24-13 23-10 26-10 23-7 29-7 19-4z" fill="currentColor"/>
                    <path transform="translate(1971,216)" d="m0 0h31l12 3 13 5 2 3-6 12-11 28-13 32-12 31-18 46-12 30-13 33-18 46-10 26-6 16-13 34-12 31-13 33-11 28-8 20-6 11-3 3h-8l-5-4-9-19-15-33-13-28-22-48-7-12v-2h-3l-2 4-16 16-8 7-7 7-8 7-15 14-8 7-16 16-8 7-16 16-11 9-9 9-8 7-4 3-3-1-5-11-12-31-6-14-12-22-13-25-12-20-15-23-6-10-1-7 15-13 12-11 11-9 12-11 8-7 30-27 16-13-2-5-11-12-8-7-40-40-8-7-32-32-4-7 1-8 4-7 8-4 81-14 177-30 137-23z" fill="currentColor"/>
                    <path transform="translate(97,827)" d="m0 0h2l1 27 5 37 6 28 8 29 7 21 13 30 11 23 11 20 13 20 9 14 14 18 9 10 9 11 11 12 16 17 16 15 10 8 2 1-2 5-35 35-7 8-8 7-12 12-7 8-33 33-6 7-8 7-9 9-7 8-10 11-10 8-4-2-9-7-8-11-10-14-14-22-14-26-8-16-11-28-8-26-6-26-5-27-4-34v-48l6-48 3-16 7-27 10-30 11-24 12-23 12-19 10-13 9-10z" fill="currentColor"/>
                  </svg>
                </div>
                <span className="text-xl md:text-2xl font-bold tracking-tighter uppercase text-text-main">SRTConvert</span>
              </div>
              <p className="text-brand-secondary text-xs md:text-sm leading-relaxed">
                The world's most advanced AI subtitle generator. Cinematic accuracy for creators who demand excellence.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 flex-grow w-full md:w-auto">
              <div className="space-y-4 md:space-y-6">
                <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-text-main">Product</h4>
                <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-brand-secondary">
                  <li><button onClick={() => scrollToSection('pricing')} className="hover:text-text-main transition-colors">Pricing</button></li>
                  <li><button onClick={() => scrollToSection('why-choose')} className="hover:text-text-main transition-colors">Features</button></li>
                  <li><button onClick={() => scrollToSection('contact')} className="hover:text-text-main transition-colors">Enterprise</button></li>
                </ul>
              </div>
              <div className="space-y-4 md:space-y-6">
                <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-text-main">Company</h4>
                <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-brand-secondary">
                  <li><button onClick={() => setLegalModal({ title: 'About SRTConvert', content: `About SRTConvert\n\nSRTConvert is the world's most advanced AI subtitle generator, built for creators who demand cinematic accuracy and professional speed.\n\nOur Mission\nWe believe that language should never be a barrier to great content. Our mission is to provide creators with the tools they need to make their videos accessible to a global audience with just a few clicks.\n\nOur Technology\nPowered by state-of-the-art neural networks and optimized for the fastest possible turnaround, SRTConvert analyzes audio waveforms with incredible precision to generate perfectly timed, highly accurate subtitles in over 90 languages.\n\nFounded in 2024, we are a small team of engineers and designers passionate about the intersection of AI and creative workflows.` })} className="hover:text-text-main transition-colors">About</button></li>
                  <li><button onClick={() => scrollToSection('contact')} className="hover:text-text-main transition-colors">Contact</button></li>
                </ul>
              </div>
              <div className="space-y-4 md:space-y-6">
                <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-text-main">Legal</h4>
                <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-brand-secondary">
                  <li><button onClick={() => setLegalModal({ title: 'Privacy Policy', content: `Privacy Policy\n\nLast updated: March 2026\n\nAt SRTConvert, we take your privacy seriously. This policy explains how we handle your data.\n\n1. Data Collection: We only collect the media files you upload for the purpose of transcription. We do not store these files longer than necessary to complete the conversion.\n\n2. Data Security: All uploads are encrypted using bank-grade AES-256 encryption. Our servers are located in secure facilities with restricted access.\n\n3. Third-Party Services: We use Groq AI for transcription services. Your data is processed securely and is not used to train their models.\n\n4. Your Rights: You have the right to request the deletion of any data we may have stored. Since we delete files immediately after processing, this usually means no data exists.` })} className="hover:text-text-main transition-colors">Privacy</button></li>
                  <li><button onClick={() => setLegalModal({ title: 'Terms of Service', content: `Terms of Service\n\nLast updated: March 2026\n\nBy using SRTConvert, you agree to the following terms:\n\n1. Usage: You are responsible for the content you upload. You must have the rights to transcribe the media you provide.\n\n2. Limitations: The Free plan is limited to 15 conversions per month. Abuse of the system may lead to account suspension.\n\n3. Accuracy: While our AI is highly accurate, we do not guarantee 100% perfection. Users should review their generated subtitles.\n\n4. Liability: SRTConvert is not liable for any damages arising from the use of our generated subtitles.` })} className="hover:text-text-main transition-colors">Terms</button></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] md:text-xs text-brand-secondary/40 font-medium text-center md:text-left">
              &copy; 2026 SRTConvert AI. All rights reserved.
            </p>
            <div className="flex gap-6">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                <Globe className="w-4 h-4 text-brand-secondary" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                <Mail className="w-4 h-4 text-brand-secondary" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </PayPalScriptProvider>
  );
}
