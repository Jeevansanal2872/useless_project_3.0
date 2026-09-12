import React, { useState, useEffect } from 'react';
import { useSessionStore } from '../../store/sessionStore';
import { useGameStore } from '../../store/gameStore';
import { fetchBugTask, validateBugTask, type FullBugTask } from '../../api/endpoints/bugTasks';
import Editor from '@monaco-editor/react';

export const BugFixModal: React.FC = () => {
  const status = useSessionStore((state) => state.status);
  const setStatus = useSessionStore((state) => state.setStatus);
  const currentLevel = useSessionStore((state) => state.currentLevel) || 'easy';

  const [task, setTask] = useState<FullBugTask | null>(null);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'BUG_FIXING') {
      loadTask();
    }
  }, [status, currentLevel]);

  const loadTask = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const difficulty = (currentLevel === 'hard' ? 'hard' : currentLevel === 'medium' ? 'medium' : 'easy');
      const t = await fetchBugTask(difficulty);
      setTask(t);
      setCode(t.code);
    } catch (e) {
      setErrorMsg('Failed to load Python bug task.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!task) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const result = await validateBugTask(task.snippetId, code);
      if (result.correct) {
        setSuccessMsg('BUG FIXED! Fire extinguished & system restored!');
        // Extinguish fire on success
        const { extinguishFire } = await import('../../game-engine/fireSystem');
        extinguishFire();
        useGameStore.getState().addScore(500);

        setTimeout(() => {
          setStatus('PLAYING');
        }, 1200);
      } else {
        setErrorMsg(result.error || 'Test cases failed. Double check your Python logic!');
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Error executing Python code.');
    } finally {
      setLoading(false);
    }
  };

  if (status !== 'BUG_FIXING') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border-2 border-red-500 rounded-xl shadow-2xl w-full max-w-3xl h-[650px] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-zinc-900 p-4 border-b border-red-500/50 flex justify-between items-center select-none">
          <div className="flex items-center gap-3">
            <span className="animate-pulse w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <h2 className="text-xl font-bold text-red-400 uppercase tracking-widest">
              SYSTEM OVERRIDE: {task?.title || 'DEBUG PYTHON CODE'}
            </h2>
          </div>
          <button
            onClick={() => setStatus('PLAYING')}
            className="text-xs text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded border border-zinc-700"
          >
            Cancel / Resume
          </button>
        </div>

        {/* Task description & Hint */}
        <div className="p-4 flex-1 flex flex-col gap-3 overflow-hidden">
          <div className="bg-zinc-950 p-4 rounded-lg border border-red-900/40 text-zinc-200 font-mono text-sm shadow-inner flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-semibold text-red-400 uppercase tracking-wider">
              <span>Target Function: <code className="text-yellow-400 font-bold">{task?.functionName || 'python_fn'}</code></span>
              <span className="bg-red-900/60 px-2 py-0.5 rounded text-red-200">{currentLevel.toUpperCase()} LEVEL</span>
            </div>
            <p className="text-zinc-300">{task?.description || 'Loading task instructions...'}</p>
            {task?.hint && (
              <p className="text-xs text-yellow-300/80 italic bg-yellow-950/30 p-2 rounded border border-yellow-800/30">
                💡 <strong>Hint:</strong> {task.hint}
              </p>
            )}
          </div>

          {/* Code Editor */}
          <div className="flex-1 rounded-lg overflow-hidden border border-zinc-700 shadow-xl">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: 4,
                insertSpaces: true,
              }}
            />
          </div>
        </div>

        {/* Footer controls & status feedback */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-between items-center gap-4">
          <div className="flex-1 font-mono text-sm">
            {successMsg && (
              <div className="text-emerald-400 font-bold animate-bounce flex items-center gap-2">
                <span>✅</span> {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="text-red-400 font-semibold flex items-center gap-2 bg-red-950/50 px-3 py-1.5 rounded border border-red-800/50">
                <span>⚠️</span> {errorMsg}
              </div>
            )}
          </div>
          <button 
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold uppercase tracking-widest rounded-lg transition-all transform active:scale-95 shadow-lg shadow-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={loading || !task}
          >
            {loading ? 'Evaluating Python...' : 'Run & Execute Fix'}
          </button>
        </div>

      </div>
    </div>
  );
};
