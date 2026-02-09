'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabaseUrl = 'https://cghuhjiwbjtvgulmldgv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnaHVoaml3Ymp0dmd1bG1sZGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODUwMzEsImV4cCI6MjA4NTQ2MTAzMX0.qW8lkhppWdRf3k-1o3t4QdR7RJCMwLW7twX37RrSDQQ';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminPage() {
  const [isEnded, setIsEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState(''); // 状態表示用

  useEffect(() => {
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'event_config')
        .single();
      
      if (data) {
        setIsEnded(data.value.is_ended);
      } else {
        console.error("Fetch Error:", error);
      }
      setIsLoading(false);
    };
    fetchStatus();
  }, []);

  const toggleEventStatus = async () => {
    const newState = !isEnded;
    setStatusMsg('更新中...');
    
    // JSONの形式に合わせて update する
    const { error } = await supabase
      .from('system_settings')
      .update({ value: { is_ended: newState } }) // ここでJSONごと更新
      .eq('key', 'event_config');

    if (!error) {
      setIsEnded(newState);
      setStatusMsg(newState ? "設定完了：終了モード" : "設定完了：開催モード");
      // 3秒後にメッセージを消す
      setTimeout(() => setStatusMsg(''), 3000);
    } else {
      console.error(error);
      setStatusMsg(`エラー発生: ${error.message}`);
      alert("データベースの更新に失敗しました。RLS設定を確認してください。");
    }
  };

  if (isLoading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8 text-[#ffd700]">COSMIC ADMIN</h1>
      
      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-600 text-center w-full max-w-md">
        <p className="mb-4 text-sm text-gray-400">現在のワールドステータス</p>
        <div className={`text-4xl font-black mb-8 ${isEnded ? 'text-red-500' : 'text-green-500'}`}>
          {isEnded ? "⛔ 終了 (CLOSED)" : "✅ 開催中 (OPEN)"}
        </div>

        <button
          onClick={toggleEventStatus}
          className={`w-full py-6 rounded-xl font-bold text-xl transition-all shadow-lg transform active:scale-95 ${
            isEnded 
              ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/50' 
              : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50'
          }`}
        >
          {isEnded ? "イベントを再開する 🚀" : "イベントを終了する 🏁"}
        </button>
        
        {statusMsg && <p className="mt-4 text-sm font-bold text-yellow-400 animate-pulse">{statusMsg}</p>}

        <p className="mt-6 text-xs text-gray-500 border-t border-gray-700 pt-4">
          ※ 終了ボタンを押すと、ユーザーの画面は即座に操作不能になります。
        </p>
      </div>
    </div>
  );
}