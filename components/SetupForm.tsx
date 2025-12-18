
import React, { useState, useEffect } from 'react';
import { SUB_TOPICS, DIFFICULTY_OPTIONS, MODE_OPTIONS, HINT_TYPE_OPTIONS, FORMAT_OPTIONS } from '../constants';
import { Difficulty, QuizConfig, TopicMode, HintType, QuizFormat } from '../types';
import { playSound } from '../utils/audio';
import { stopSpeech } from '../utils/tts';

interface SetupFormProps {
  onGenerate: (config: QuizConfig) => void;
  isLoading: boolean;
  ttsEnabled: boolean;
  forcedStep?: number;
  onStepChange?: (step: number) => void;
}

export const SetupForm: React.FC<SetupFormProps> = ({ 
  onGenerate, 
  isLoading,
  ttsEnabled,
  forcedStep,
  onStepChange
}) => {
  const [internalStep, setInternalStep] = useState(1);
  const TOTAL_STEPS = 3;
  const currentStep = forcedStep !== undefined ? forcedStep : internalStep;

  useEffect(() => {
    if (forcedStep !== undefined) {
      setInternalStep(forcedStep);
    }
  }, [forcedStep]);

  const updateStep = (newStep: number) => {
    setInternalStep(newStep);
    if (onStepChange) onStepChange(newStep);
  };

  const [mode, setMode] = useState<TopicMode>(TopicMode.ACADEMIC);
  const [subTopic, setSubTopic] = useState<string>("Geral");
  const [specificTopic, setSpecificTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [temperature, setTemperature] = useState<number>(1.0); 
  const [quizFormat, setQuizFormat] = useState<QuizFormat>(QuizFormat.MULTIPLE_CHOICE);
  const [count, setCount] = useState<number>(10);
  const [questionsPerRound, setQuestionsPerRound] = useState<number>(5);
  
  const [enableTimer, setEnableTimer] = useState<boolean>(true);
  const [enableTimerSound, setEnableTimerSound] = useState<boolean>(true);
  const [timeLimit, setTimeLimit] = useState<number>(60);
  
  const [maxHints, setMaxHints] = useState<number>(3);
  const [hintTypes, setHintTypes] = useState<HintType[]>([HintType.STANDARD]);

  const [isTeamMode, setIsTeamMode] = useState(false);
  const [teamNames, setTeamNames] = useState<string[]>(['Time A', 'Time B']);

  useEffect(() => {
    if (questionsPerRound > count) {
      setQuestionsPerRound(count);
    }
  }, [count, questionsPerRound]);

  const validateStep1 = () => {
    if (mode === TopicMode.OTHER && !specificTopic.trim()) {
      alert("Por favor, digite o assunto desejado.");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    playSound('click');
    if (currentStep < TOTAL_STEPS) {
      updateStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    playSound('click');
    if (currentStep > 1) updateStep(currentStep - 1);
  };

  const handleFinalSubmit = () => {
    stopSpeech();
    onGenerate({
      mode,
      subTopic: mode !== TopicMode.OTHER ? subTopic : undefined,
      specificTopic: mode === TopicMode.OTHER ? specificTopic : undefined,
      difficulty,
      temperature,
      quizFormat,
      count,
      enableTimer,
      enableTimerSound,
      timeLimit: enableTimer ? timeLimit : 0,
      maxHints,
      hintTypes: hintTypes.length > 0 ? hintTypes : [HintType.STANDARD],
      isTeamMode,
      teams: isTeamMode ? teamNames : [],
      questionsPerRound: isTeamMode ? questionsPerRound : count,
      tts: { enabled: false, autoRead: true, engine: 'gemini', gender: 'female', rate: 1.5, volume: 1.0 }
    });
  };

  const handleModeChange = (newMode: TopicMode) => {
    playSound('click');
    setMode(newMode);
    setSubTopic("Geral");
    setSpecificTopic('');
  };

  return (
    <div id="setup-form-container" className="w-full max-w-2xl mx-auto bg-jw-card p-4 md:p-8 rounded-xl shadow-2xl border border-gray-700/30">
      
      <div className="mb-8">
        <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 text-gray-500">
          <span className={currentStep >= 1 ? 'text-jw-blue' : ''}>1. Conteúdo</span>
          <span className={currentStep >= 2 ? 'text-jw-blue' : ''}>2. Configurações</span>
          <span className={currentStep >= 3 ? 'text-jw-blue' : ''}>3. Ajudas</span>
        </div>
        <div className="h-2 w-full bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-jw-blue transition-all duration-300 ease-out" style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }} />
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); currentStep === TOTAL_STEPS ? handleFinalSubmit() : handleNextStep(); }} className="space-y-6">
        
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div id="field-mode">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">Escolha um Tema Principal</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MODE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleModeChange(opt.value)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                      mode === opt.value 
                        ? 'bg-jw-blue text-white border-transparent shadow-lg transform scale-105' 
                        : 'bg-jw-hover text-gray-500 dark:text-gray-400 border-transparent hover:border-gray-500'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d={opt.icon} />
                    </svg>
                    <span className="text-xs font-bold text-center">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {mode !== TopicMode.OTHER && (
              <div className="animate-fade-in">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Escolha um Subtema</label>
                <div className="relative">
                  <select
                    value={subTopic}
                    onChange={(e) => setSubTopic(e.target.value)}
                    className="w-full p-3 pr-10 rounded-lg bg-jw-hover border border-gray-400 dark:border-gray-600 text-jw-text focus:ring-2 focus:ring-jw-blue outline-none appearance-none"
                  >
                    {SUB_TOPICS[mode].map((st) => (<option key={st} value={st}>{st}</option>))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            )}

            {mode === TopicMode.OTHER && (
               <div className="animate-fade-in">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Qual o tema livre?</label>
                  <input 
                    type="text"
                    value={specificTopic}
                    onChange={(e) => setSpecificTopic(e.target.value)}
                    placeholder="Ex: Mitologia Grega, História do Brasil, Receitas de Bolo..."
                    className="w-full p-3 rounded-lg bg-jw-hover border border-gray-400 dark:border-gray-600 text-jw-text focus:ring-2 focus:ring-jw-blue outline-none"
                    autoFocus
                  />
               </div>
            )}

            <div id="field-difficulty">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Dificuldade</label>
              <div className="flex gap-2">
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDifficulty(opt.value)}
                    className={`flex-1 py-2 rounded-lg text-sm border transition-all ${difficulty === opt.value ? 'bg-jw-blue text-white font-bold border-transparent shadow-md' : 'border-gray-400 dark:border-gray-600 bg-jw-hover text-gray-600 dark:text-gray-300'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div id="field-creativity">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200">Criatividade</label>
                <span className="text-sm font-bold text-jw-blue">{temperature.toFixed(1)}</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="1.5" 
                step="0.1" 
                value={temperature} 
                onChange={(e) => setTemperature(parseFloat(e.target.value))} 
                className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-jw-blue" 
              />
              <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mt-2">
                <span>Conservador</span>
                <span>Equilibrado</span>
                <span>Criativo</span>
              </div>
            </div>

            <div id="field-format">
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Formato</label>
               <div className="flex gap-2">
                 {FORMAT_OPTIONS.map((opt) => (
                   <button
                    key={opt.value}
                    type="button"
                    onClick={() => setQuizFormat(opt.value as QuizFormat)}
                    className={`flex-1 py-2 rounded-lg text-sm border transition-all ${quizFormat === opt.value ? 'bg-jw-blue text-white font-bold border-transparent shadow-md' : 'border-gray-400 dark:border-gray-600 bg-jw-hover text-gray-600 dark:text-gray-300'}`}
                  >
                    {opt.label}
                  </button>
                 ))}
               </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div id="field-team-mode" className="flex items-center justify-between p-4 bg-jw-hover/30 rounded-lg border border-gray-700/30">
              <div>
                <span className="block text-sm font-bold text-gray-700 dark:text-gray-200">Modo Competição</span>
                <span className="text-xs opacity-60">Jogar em times</span>
              </div>
              <button 
                type="button" 
                onClick={() => setIsTeamMode(!isTeamMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isTeamMode ? 'bg-jw-blue' : 'bg-gray-500'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isTeamMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {isTeamMode && (
              <div className="animate-fade-in bg-jw-hover/30 p-4 rounded-lg space-y-3">
                <label className="block text-xs font-bold text-gray-500 uppercase">Times</label>
                {teamNames.map((name, idx) => (
                  <input 
                    key={idx}
                    type="text" 
                    value={name} 
                    onChange={(e) => {
                        const newNames = [...teamNames];
                        newNames[idx] = e.target.value;
                        setTeamNames(newNames);
                    }}
                    className="w-full bg-jw-card border border-gray-400 dark:border-gray-600 rounded px-3 py-2 text-sm"
                    placeholder={`Time ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            <div id="field-count">
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200">Total de Perguntas</label>
                <span className="text-sm font-bold text-jw-blue">{count}</span>
              </div>
              <input type="range" min="1" max="50" value={count} onChange={(e) => setCount(parseInt(e.target.value))} className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-jw-blue" />
            </div>

            <div id="field-timer" className="flex items-center justify-between p-4 bg-jw-hover/30 rounded-lg border border-gray-700/30">
              <span className="block text-sm font-bold text-gray-700 dark:text-gray-200">Temporizador</span>
              <div className="flex items-center gap-4">
                 {enableTimer && (
                   <select value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} className="bg-jw-card border border-gray-500 rounded text-xs p-1">
                     <option value="30">30s</option>
                     <option value="60">60s</option>
                     <option value="120">2m</option>
                   </select>
                 )}
                 <button type="button" onClick={() => setEnableTimer(!enableTimer)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enableTimer ? 'bg-jw-blue' : 'bg-gray-500'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableTimer ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in" id="field-hints">
            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200">Limite de Dicas</label>
                <span className="text-sm font-bold text-jw-blue">{maxHints}</span>
              </div>
              <input type="range" min="0" max="10" value={maxHints} onChange={(e) => setMaxHints(parseInt(e.target.value))} className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-jw-blue" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Tipos de Ajuda</label>
              <div className="grid grid-cols-2 gap-3">
                {HINT_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                        setHintTypes(prev => prev.includes(opt.value) ? (prev.length > 1 ? prev.filter(t => t !== opt.value) : prev) : [...prev, opt.value]);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${hintTypes.includes(opt.value) ? 'bg-jw-blue text-white border-transparent shadow-md' : 'bg-jw-hover border-transparent text-gray-500'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path d={opt.icon} /></svg>
                    <span className="text-xs font-bold">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4 border-t border-gray-700/30">
          {currentStep > 1 && (
            <button type="button" onClick={handlePrevStep} className="flex-1 py-3 bg-jw-hover text-jw-text font-bold rounded-full">Voltar</button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 bg-jw-blue text-white font-bold rounded-full shadow-lg"
          >
            {isLoading ? "Gerando..." : (currentStep < TOTAL_STEPS ? "Próximo" : "Iniciar Quiz")}
          </button>
        </div>
      </form>
    </div>
  );
};
