'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// 設定（メインページと同じもの）
const supabaseUrl = 'https://cghuhjiwbjtvgulmldgv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnaHVoaml3Ymp0dmd1bG1sZGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODUwMzEsImV4cCI6MjA4NTQ2MTAzMX0.qW8lkhppWdRf3k-1o3t4QdR7RJCMwLW7twX37RrSDQQ';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminPage() {
  const [isEnded, setIsEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 現在の状態を取得
  useEffect(() => {
    const fetchStatus = async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'event_config')
        .single();
      
      if (data) {
        setIsEnded(data.value.is_ended);
      }
      setIsLoading(false);
    };
    fetchStatus();
  }, []);

  // 状態を切り替える
  const toggleEventStatus = async () => {
    const newState = !isEnded;
    const { error } = await supabase
      .from('system_settings')
      .update({ value: { is_ended: newState } })
      .eq('key', 'event_config');

    if (!error) {
      setIsEnded(newState);
      alert(newState ? "イベントを終了しました！\nメイン画面は操作不能になります。" : "イベントを再開しました！");
    } else {
      alert("エラーが発生しました");
    }
  };

  if (isLoading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8 text-[#ffd700]">COSMIC ADMIN</h1>
      
      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-600 text-center">
        <p className="mb-4 text-sm text-gray-400">現在のステータス</p>
        <div className={`text-4xl font-black mb-8 ${isEnded ? 'text-red-500' : 'text-green-500'}`}>
          {isEnded ? "⛔ 終了 (CLOSED)" : "✅ 開催中 (OPEN)"}
        </div>

        <button
          onClick={toggleEventStatus}
          className={`px-8 py-4 rounded-xl font-bold text-xl transition-all shadow-lg ${
            isEnded 
              ? 'bg-green-600 hover:bg-green-500 text-white' 
              : 'bg-red-600 hover:bg-red-500 text-white'
          }`}
        >
          {isEnded ? "イベントを再開する 🚀" : "イベントを終了する 🏁"}
        </button>
        
        <p className="mt-4 text-xs text-gray-500">
          ※ 終了すると全ユーザーの画面がグレーアウトし操作できなくなります。
        </p>
      </div>
    </div>
  );
}