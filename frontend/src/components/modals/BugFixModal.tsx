import React, { useState, useEffect } from 'react';
import { useSessionStore } from '../../store/sessionStore';
import { useGameStore } from '../../store/gameStore';
import { fetchBugTask, validateBugTask } from '../../api/endpoints/bugTasks';
import type { BugTask } from '../../api/types';
import Editor from '@monaco-editor/react';

export const BugFixModal: React.FC = () => {
  const status = useSessionStore((state) => state.status);
  const setStatus = useSessionStore((state) => state.setStatus);

  const [task, setTask] = useState<BugTask | null>(null);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'BUG_FIXING') {
      loadTask();
    }
  }, [status]);

  const loadTask = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Hardcoded difficulty for now
      const t = await fetchBugTask('easy');
      setTask(t);
      setCode(t.code);
    } catch (e) {
      setErrorMsg('Failed to load task.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!task) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await validateBugTask(task.snippetId, code);
      if (result.correct) {
        // Success: Fire extinguished, Bug removed, Player returns to game, score ++
        import('../../game-engine/fireSystem').then(({ extinguishFire }) => {
          extinguishFire();
        });
        useGameStore.getState().addScore(500);
        setStatus('PLAYING'); // Return to game
      } else {
        setErrorMsg(result.error || 'Fix failed. Try again.');
      }
    } catch (e) {
      setErrorMsg('Error verifying code.');
    } finally {
      setLoading(false);
    }
  };

  if (status !== 'BUG_FIXING') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border-2 border-red-500 rounded-lg shadow-2xl w-[800px] h-[600px] flex flex-col overflow-hidden">
        
        <div className="bg-red-900/50 p-4 border-b border-red-500 flex justify-between items-center">
          <h2 className="text-xl font-bold text-red-400 uppercase tracking-widest">System Override Required</h2>
          <div className="text-sm text-red-300">Time remaining: --:--</div>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-4">
          
          <div className="bg-zinc-800 p-4 rounded text-zinc-300 font-mono text-sm shadow-inner">
            <h3 className="text-white mb-2 font-bold uppercase tracking-wider">Mission Directive:</h3>
            <p>{task?.description || 'Loading...'}</p>
          </div>

          <div className="flex-1 rounded overflow-hidden border border-zinc-700">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on'
              }}
            />
          </div>

        </div>

        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center">
          <div className="text-red-500 font-mono text-sm h-6">
            {errorMsg}
          </div>
          <button 
            className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest rounded transition-colors disabled:opacity-50"
            onClick={handleSubmit}
            disabled={loading || !task}
          >
            {loading ? 'Compiling...' : 'Execute Fix'}
          </button>
        </div>

      </div>
    </div>
  );
};
