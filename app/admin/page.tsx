'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// ==========================================
// 👇 あなたのSupabase情報
// ==========================================
const supabaseUrl = 'https://cghuhjiwbjtvgulmldgv.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnaHVoaml3Ymp0dmd1bG1sZGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODUwMzEsImV4cCI6MjA4NTQ2MTAzMX0.qW8lkhppWdRf3k-1o3t4QdR7RJCMwLW7twX37RrSDQQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// 🔑 管理人パスワード（これを入力しないと操作できません）
const ADMIN_PASSWORD = 'nova2026';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // ログイン処理
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuth(true);
      fetchData();
    } else {
      alert('パスワードが違います');
    }
  };

  // データ取得
  const fetchData = async () => {
    setLoading(true);
    // ログ取得（最新50件）
    const { data: logData } = await supabase
      .from('chocolates')
      .select(
        `
        created_at,
        sender:sender_id(display_name),
        receiver:receiver_id(display_name)
      `
      )
      .order('created_at', { ascending: false })
      .limit(50);

    if (logData) setLogs(logData);

    // 全件数
    const { count } = await supabase
      .from('chocolates')
      .select('*', { count: 'exact', head: true });
    setTotalCount(count || 0);

    setLoading(false);
  };

  // 🧨 全データ削除（リセット）
  const resetAllData = async () => {
    if (
      !confirm(
        '【危険】本当に全てのチョコ履歴を削除しますか？\nこの操作は取り消せません。'
      )
    )
      return;
    if (
      !confirm('本当に、本当にいいですね？\n劇の開始前にのみ実行してください。')
    )
      return;

    setLoading(true);
    // 全行削除（WHERE条件なしで全削除できない場合があるため、created_atが存在するものを削除）
    const { error } = await supabase.from('chocolates').delete().neq('id', 0); // 全て対象

    if (error) {
      alert('削除に失敗しました: ' + error.message);
    } else {
      alert('💥 全てのデータをリセットしました。');
      fetchData();
    }
    setLoading(false);
  };

  // 特定のログを1つ削除
  const deleteLog = async (id: number) => {
    if (!confirm('この履歴を取り消しますか？')) return;
    // 注: 本来はidが必要ですが、簡易版のためcreated_atなどで特定が必要かもしれません。
    // ここでは「全削除」機能をメインとします。
  };

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString('ja-JP');
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#1a0f0d] flex flex-col items-center justify-center p-4">
        <div className="bg-[#2b120a] p-8 rounded-xl border border-[#5d4037] text-center max-w-sm w-full">
          <h1 className="text-[#be123c] font-bold text-xl mb-4 tracking-widest">
            ADMIN GATE
          </h1>
          <input
            type="password"
            placeholder="PASSWORD"
            className="w-full p-3 bg-[#0a0403] border border-[#3e2723] text-[#eaddcf] rounded mb-4 focus:outline-none focus:border-[#be123c]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-[#be123c] text-white py-3 rounded font-bold hover:bg-[#9f1239] transition-all"
          >
            ENTER
          </button>
          <Link
            href="/"
            className="block mt-6 text-[#8d6e63] text-xs underline"
          >
            戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0505] text-[#eaddcf] p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-[#3e2723] pb-4">
          <h1 className="text-2xl font-bold text-[#be123c] tracking-widest">
            ADMIN DASHBOARD
          </h1>
          <Link
            href="/"
            className="bg-[#3e2723] px-4 py-2 rounded text-xs hover:bg-[#4e342e]"
          >
            サイトに戻る
          </Link>
        </div>

        {/* ステータスエリア */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1a0805] p-6 rounded-xl border border-[#3e2723]">
            <h2 className="text-[#8d6e63] text-xs uppercase tracking-widest mb-2">
              Total Gifts
            </h2>
            <p className="text-5xl font-bold text-[#ffecb3]">{totalCount}</p>
          </div>

          <div className="bg-[#2b120a] p-6 rounded-xl border border-[#be123c]/50 flex flex-col justify-center items-center text-center">
            <h2 className="text-[#be123c] font-bold mb-2">⚠ EMERGENCY RESET</h2>
            <p className="text-[10px] text-[#8d6e63] mb-4">
              テストデータを全て消去し、カウンターを0に戻します
            </p>
            <button
              onClick={resetAllData}
              disabled={loading}
              className="bg-red-900 hover:bg-red-800 text-white px-6 py-3 rounded-lg font-bold text-sm tracking-widest border border-red-700 shadow-[0_0_15px_rgba(255,0,0,0.2)] transition-all"
            >
              {loading ? 'PROCESSING...' : '🔥 DELETE ALL DATA'}
            </button>
          </div>
        </div>

        {/* ログエリア */}
        <div className="bg-[#1a0805] rounded-xl border border-[#3e2723] overflow-hidden">
          <div className="p-4 bg-[#2b120a] border-b border-[#3e2723] flex justify-between items-center">
            <h2 className="font-bold text-[#d7ccc8]">
              RECENT LOGS (Latest 50)
            </h2>
            <button
              onClick={fetchData}
              className="text-xs text-[#8d6e63] hover:text-[#d7ccc8]"
            >
              ↻ Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#0a0403] text-[#8d6e63] text-xs uppercase">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">From</th>
                  <th className="p-3">To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3e2723]/30">
                {logs.map((log, i) => (
                  <tr
                    key={i}
                    className="hover:bg-[#2b120a]/50 transition-colors"
                  >
                    <td className="p-3 text-[#8d6e63] font-mono text-xs whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="p-3 text-[#eaddcf]">
                      {log.sender?.display_name || 'Unknown'}
                    </td>
                    <td className="p-3 text-[#ffecb3] font-bold">
                      ➜ {log.receiver?.display_name || 'Unknown'}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-[#5d4037]">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
