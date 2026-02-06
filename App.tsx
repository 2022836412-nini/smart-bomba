
import React, { useState, useEffect, useRef } from 'react';
import { GeminiAgent } from './services/geminiService';
import { EsriResponse, Message } from './types';
import DataPreview from './components/DataPreview';
import AnalysisCharts from './components/AnalysisCharts';
import { parseCsvToEsri } from './utils/csvParser';

const DEFAULT_CSV = `NEGERI,NEGERI_SEMP,KOD NEGERI,JUMLAH PANGGILAN,PANGGILAN KEBAKARAN,PANGGILAN PENYELAMATAN,PANGGILAN TUGAS- TUGAS KHAS,KM,KC,KS,PERATUS SELAMAT_KEBAKARAN,PM,PC,PS,TAKSIRAN KERUGIAN (RM),TAKSIRAN DISELAMATKAN (RM),PANGGILAN PALSU,TAHUN,Jumlah Panggilan
WP PUTRAJAYA,W.P PUTRAJAYA,16,574,83,491,0,0,2,13,86.66666667,4,10,256,"822,650.00","10,786,150.00",0,2024,574
JOHOR,JOHOR,01,13717,4507,8900,295,12,61,112,60.54054054,206,863,946,"187,930,009.36","773,451,457.19",15,2024,13717
MELAKA,MELAKA,04,5081,1850,3097,130,5,25,49,62.02531646,64,335,432,"25,714,271.82","331,517,375.99",4,2024,5081
N. SEMBILAN,NEGERI SEMBILAN,05,6131,1729,4252,123,5,25,98,76.5625,84,339,651,"59,258,972.99","866,521,663.89",27,2024,6131
SELANGOR,SELANGOR,10,24109,6680,17393,28,17,62,132,62.55924171,247,667,1423,"383,072,114.31","1,091,801,266.76",8,2024,24109
WP K. LUMPUR,W.P KUALA LUMPUR,14,4685,1556,3092,18,5,37,130,75.58139535,118,285,1165,"78,829,859.80","274,773,325.00",19,2024,4685
PERAK,PERAK,08,11236,4025,7182,17,15,37,126,70.78651685,194,1128,760,"112,905,777.84","275,219,462.84",12,2024,11236
PULAU PINANG,PULAU PINANG,07,7132,2250,3936,917,4,32,61,62.88659794,105,232,844,"46,144,488.82","225,385,103.62",29,2024,7132
KEDAH,KEDAH,02,9028,3735,5076,196,2,27,65,69.14893617,120,753,498,"129,476,028.80","434,985,270.20",21,2024,9028
PERLIS,PERLIS,09,1051,773,273,4,0,8,2,20,10,26,31,"4,158,910.00","13,210,840.00",1,2024,1051
KELANTAN,KELANTAN,03,6100,3111,2756,209,2,25,87,76.31578947,99,296,1144,"32,682,470.50","175,146,468.10",24,2024,6100
TERENGGANU,TERENGGANU,11,5165,2559,2407,189,0,9,94,91.26213592,79,289,479,"22,786,880.14","380,342,542.60",10,2024,5165
PAHANG,PAHANG,06,5188,2106,2937,141,10,38,159,76.8115942,156,505,491,"141,209,818.43","567,709,505.94",4,2024,5188
SARAWAK,SARAWAK,13,9293,2176,7066,48,11,51,395,86.43326039,160,652,442,"199,921,195.81","926,026,163.79",3,2024,9293
WP LABUAN,W.P LABUAN,15,903,360,526,17,1,4,54,91.52542373,2,9,57,"2,955,352.70","14,060,891.00",0,2024,903
SABAH,SABAH,12,9088,3649,5167,253,22,40,169,73.16017316,147,587,662,"131,429,524.21","313,024,408.58",19,2024,9088`;

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [data, setData] = useState<EsriResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const agentRef = useRef<GeminiAgent | null>(null);

  useEffect(() => {
    try {
      agentRef.current = new GeminiAgent();
      const parsedData = parseCsvToEsri(DEFAULT_CSV);
      setData(parsedData);
      setMessages([{
        role: 'model',
        text: `Hi, saya ejen Smart Bomba. Saya mampu menganalisis panggilan keselamatan yang diterima oleh pihak JBPM. Tanyalah saya!`,
        timestamp: new Date()
      }]);
    } catch (e) {
      setError("Ralat sistem: Gagal memulakan ejen AI.");
    }
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchData = async () => {
    if (!url) return;
    setIsLoading(true);
    setError(null);
    try {
      let queryUrl = url;
      if (!url.includes('query')) {
        queryUrl = url.endsWith('/') ? `${url}query` : `${url}/query`;
      }
      const params = new URLSearchParams({ where: '1=1', outFields: '*', f: 'json', resultRecordCount: '200' });
      const fullUrl = `${queryUrl}?${params.toString()}`;
      const response = await fetch(fullUrl);
      const json = await response.json();
      if (json.error) throw new Error(json.error.message);
      setData(json);
      setMessages(prev => [...prev, {
        role: 'model',
        text: `Data dari perkhidmatan ESRI telah berjaya dimuatkan ke sistem Smart Bomba. Saya sedia membantu anda melakukan analisis.`,
        timestamp: new Date()
      }]);
    } catch (err: any) {
      setError(`Gagal memuatkan data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const promptText = customText || input;
    if (!promptText.trim() || !agentRef.current || !data) return;

    const userMsg: Message = { role: 'user', text: promptText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await agentRef.current.analyzeData(data.features, promptText, history);
      setMessages(prev => [...prev, {
        role: 'model',
        text: response || "Maaf, saya tidak dapat memproses data tersebut.",
        timestamp: new Date()
      }]);
    } catch (err: any) {
      setError("Ralat pemprosesan: Gagal mendapatkan maklum balas dari AI.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* Sidebar - Orange Gradient Sidebar */}
      <div className="w-80 sidebar-gradient text-white flex flex-col hidden lg:flex shadow-2xl z-50">
        <div className="p-8 border-b border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Smart Bomba</h1>
              <p className="text-orange-100 text-[10px] uppercase tracking-widest font-bold">AI Analytics Unit</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8 flex-1 overflow-y-auto">
          <div>
            <label className="block text-[10px] font-bold text-orange-50 uppercase tracking-wider mb-3 opacity-80">Sambungan Data ESRI</label>
            <div className="space-y-3">
              <input 
                type="text"
                placeholder="Masukkan URL Service"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-white/50 focus:border-white outline-none transition-all text-white placeholder-orange-200/50"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button 
                onClick={fetchData}
                disabled={isLoading || !url}
                className="w-full bg-white text-orange-600 hover:bg-orange-50 disabled:bg-orange-300 disabled:text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg"
              >
                {isLoading ? "Memuatkan..." : "Sambung Data"}
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/20">
            <label className="block text-[10px] font-bold text-orange-50 uppercase tracking-wider mb-4 opacity-80">Analisis Pantas</label>
            <div className="space-y-2">
              {[
                { label: "Jumlah Panggilan 2024", query: "Berapakah jumlah keseluruhan panggilan untuk tahun 2024?" },
                { label: "Banding Selangor & Johor", query: "Bandingkan statistik panggilan antara Selangor dan Johor bagi tahun 2023." },
                { label: "Insight Kerugian", query: "Tunjukkan trend kerugian dari tahun 2022 hingga 2024." }
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSendMessage(undefined, item.query)}
                  className="w-full text-left text-xs p-3.5 rounded-lg border border-white/10 bg-white/10 hover:bg-white/20 transition-all text-white font-medium"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="m-6 p-4 bg-red-900/40 border border-red-400/30 rounded-lg text-red-50 text-xs leading-relaxed">
            <span className="font-bold">RALAT:</span> {error}
          </div>
        )}

        <div className="p-6 text-[10px] text-orange-100 border-t border-white/10 font-bold uppercase tracking-widest text-center opacity-70">
          Powered by Smart Intelligence
        </div>
      </div>

      {/* Main Analysis Hub */}
      <div className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-slate-200 flex items-center px-8 bg-white shadow-sm sticky top-0 z-40">
          <div className="flex-1 flex items-center gap-4">
             <div className="lg:hidden w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
             </div>
             <h2 className="text-sm font-bold text-slate-700 uppercase tracking-tight">Pusat Analisis Strategik Smart Bomba</h2>
             <div className="h-4 w-[1px] bg-slate-200"></div>
             <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
               <span className="text-[10px] font-bold text-slate-500 uppercase">Sistem Aktif</span>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 chat-container space-y-8 max-w-5xl mx-auto w-full pb-36">
          <div className="space-y-8">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center shadow-md ${
                    msg.role === 'user' ? 'bg-slate-200' : 'bg-orange-600'
                  }`}>
                    {msg.role === 'user' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM5.884 6.68a1 1 0 10-1.404-1.427l-.707.696a1 1 0 101.404 1.427l.707-.696zM14.823 5.253a1 1 0 00-1.415 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM9 11a3 3 0 106 0 3 3 0 00-6 0z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v2a1 1 0 102 0V5z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className={`p-5 rounded-2xl shadow-sm text-sm leading-relaxed border ${
                    msg.role === 'user' 
                      ? 'bg-orange-600 text-white border-orange-500 rounded-tr-none shadow-orange-200 shadow-md' 
                      : 'bg-white text-slate-700 border-slate-200 rounded-tl-none'
                  }`}>
                    <div className="chat-content whitespace-pre-wrap">{msg.text}</div>
                    <div className={`mt-3 text-[10px] font-bold uppercase opacity-40 ${msg.role === 'user' ? 'text-white' : 'text-slate-400'}`}>
                      Masa: {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                </div>
                <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Smart Bomba sedang menganalisis...
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </main>

        {/* Fixed Input Form */}
        <div className="p-8 bg-white/80 backdrop-blur-md border-t border-slate-200 fixed bottom-0 left-0 lg:left-80 right-0 z-50">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-4">
            <input 
              type="text"
              placeholder="Tanya sesuatu kepada Smart Bomba..."
              disabled={isLoading}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-6 py-4 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium shadow-inner"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white rounded-xl px-8 py-4 transition-all font-bold text-sm uppercase tracking-widest shadow-lg shadow-orange-900/10 active:scale-[0.97]"
            >
              Hantar
            </button>
          </form>
          <div className="max-w-4xl mx-auto mt-3 flex justify-between px-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Terminal Analisis: Bersedia</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date().toLocaleDateString('ms-MY')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
