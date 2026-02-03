'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState, useRef, useCallback } from 'react';

// ==========================================
// ⚙️ 設定
// ==========================================
const supabaseUrl = 'https://cghuhjiwbjtvgulmldgv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnaHVoaml3Ymp0dmd1bG1sZGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODUwMzEsImV4cCI6MjA4NTQ2MTAzMX0.qW8lkhppWdRf3k-1o3t4QdR7RJCMwLW7twX37RrSDQQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// 📝 型定義
// ==========================================
type Profile = {
  id: string;
  display_name: string;
  last_received_at?: string;
  received_count: number;
};

// ==========================================
// 🧱 メインコンポーネント（認証管理・親）
// ==========================================
export default function CosmicChocolatApp() {
  const [session, setSession] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    // 1. URLにアクセストークンがあるかチェック（リダイレクト直後の判定）
    const isRedirecting = window.location.hash.includes('access_token');
    if (isRedirecting) {
      setIsAuthChecking(true); // リダイレクト中なら強制的にロード画面維持
    }

    // 2. 認証状態の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAuthChecking(false); // 判定完了
    });

    return () => subscription.unsubscribe();
  }, []);

  // 認証チェック中は「起動画面」を表示して、下のコンポーネントをマウントさせない（これが重要！）
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#1a0f0d] flex items-center justify-center text-[#eaddcf]">
        <div className="text-center animate-pulse">
          <h1 className="text-2xl font-bold tracking-[0.2em] mb-4">COSMIC CHOCOLAT</h1>
          <p className="text-xs text-[#8d6e63]">VERIFYING COMMANDER...</p>
        </div>
      </div>
    );
  }

  // チェック完了後、コンテンツを表示
  return <GameContent session={session} />;
}

// ==========================================
// 🎮 ゲーム本体コンポーネント（子）
// ==========================================
function GameContent({ session }: { session: any }) {
  const user = session?.user ?? null;
  const [rankingList, setRankingList] = useState<Profile[]>([]);
  const [totalChocolates, setTotalChocolates] = useState<number>(0);
  
  // ユーザー専用データ
  const [myProfileName, setMyProfileName] = useState('');
  const [memberList, setMemberList] = useState<Profile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');
  
  const [isActionLoading, setIsActionLoading] = useState(false);
  const isMounted = useRef(true);

  // ----------------------------------------
  // 🔄 データ取得 (シンプル化)
  // ----------------------------------------
  const fetchRanking = useCallback(async () => {
    // 合計数
    const { count } = await supabase.from('chocolates').select('*', { count: 'exact', head: true });
    if (isMounted.current) setTotalChocolates(count || 0);

    // ランキング（ビューから取得するだけなので爆速）
    const { data } = await supabase.from('galaxy_ranking').select('*');
    if (isMounted.current && data) setRankingList(data);
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!user) return;

    // 1. 自分の名前確保
    let name = user.user_metadata.full_name || '劇団員';
    const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle();
    
    if (profile) {
      name = profile.display_name;
    } else {
      await supabase.from('profiles').insert({ id: user.id, display_name: name });
    }
    if (isMounted.current) setMyProfileName(name);

    // 2. メンバーリスト構築（自分以外）
    const { data: profiles } = await supabase.from('profiles').select('*').neq('id', user.id);
    const { data: myHistory } = await supabase.from('chocolates').select('receiver_id, created_at').eq('sender_id', user.id);
    
    // ランキング情報を再利用してコスト削減
    const { data: ranks } = await supabase.from('galaxy_ranking').select('*');
    const countMap: Record<string, number> = {};
    ranks?.forEach((r: any) => countMap[r.id] = r.received_count);

    const historyMap = new Map();
    myHistory?.forEach((h: any) => {
      // 最新の履歴を保存
      if (!historyMap.has(h.receiver_id) || new Date(historyMap.get(h.receiver_id)) < new Date(h.created_at)) {
        historyMap.set(h.receiver_id, h.created_at);
      }
    });

    if (profiles) {
      const merged = profiles.map(p => ({
        ...p,
        received_count: countMap[p.id] || 0,
        last_received_at: historyMap.get(p.id) || null
      }));
      merged.sort((a, b) => b.received_count - a.received_count);
      if (isMounted.current) setMemberList(merged);
    }
  }, [user]);

  // ----------------------------------------
  // 🚀 初期化 & リアルタイム
  // ----------------------------------------
  useEffect(() => {
    isMounted.current = true;
    fetchRanking();
    if (user) fetchUserData();

    const channel = supabase.channel('realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchRanking();
        if (user) fetchUserData(); // ここは軽量なので叩いてOK
      })
      .subscribe();

    return () => { isMounted.current = false; supabase.removeChannel(channel); };
  }, [user]); // userが変わるたびに再実行（これが重要）

  // ----------------------------------------
  // 🎮 アクション
  // ----------------------------------------
  const isCooldown = (lastDateStr?: string) => {
    if (!lastDateStr) return false;
    return (new Date().getTime() - new Date(lastDateStr).getTime()) / (1000 * 60) < 15;
  };

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedUsers);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedUsers(newSet);
  };

  const handleClickUser = (targetId: string) => {
    if (!user) return alert("ログインしてください");
    if (targetId === user.id) return alert("自分には贈れません");
    
    const target = memberList.find(m => m.id === targetId) || rankingList.find(r => r.id === targetId);
    // ランキングリストからのクリックの場合、履歴情報(last_received_at)が欠けている可能性があるのでmemberListから補完
    const detailInfo = memberList.find(m => m.id === targetId);
    
    if (detailInfo && isCooldown(detailInfo.last_received_at)) {
      return alert("15分休憩しましょう！");
    }
    handleToggleSelect(targetId);
  };

  const handleSend = async () => {
    if (!user || selectedUsers.size === 0) return;
    
    // オプティミスティック更新（見た目だけ先に成功させる）
    alert(`💝 ${selectedUsers.size}人にチョコを贈りました！`);
    setSelectedUsers(new Set());

    const updates = Array.from(selectedUsers).map(rid => ({ sender_id: user.id, receiver_id: rid }));
    // バックグラウンド送信
    await supabase.from('chocolates').insert(updates);
    fetchRanking();
    fetchUserData();
  };

  const handleUpdateName = async () => {
    if (!user || !myProfileName) return;
    setIsActionLoading(true);
    await supabase.from('profiles').upsert({ id: user.id, display_name: myProfileName });
    setTimeout(() => setIsActionLoading(false), 500);
  };

  const signIn = () => supabase.auth.signInWithOAuth({ provider: 'discord', options: { queryParams: { prompt: 'consent' } } });
  const signOut = async () => { await supabase.auth.signOut(); };

  // ----------------------------------------
  // 🎨 表示パーツ
  // ----------------------------------------
  const filteredMembers = memberList.filter(m => m.display_name.toLowerCase().includes(searchText.toLowerCase()));

  const RankBadge = ({ index }: { index: number }) => {
    const colors = ["text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] scale-125", "text-gray-300 scale-110", "text-orange-400 scale-105"];
    return <span className={`font-black text-xl ${colors[index] || "text-[#8d6e63] opacity-70"}`}>{index + 1}</span>;
  };

  const UserCard = ({ profile, index = -1, isRanking = false }: { profile: Profile, index?: number, isRanking?: boolean }) => {
    const isSelected = selectedUsers.has(profile.id);
    const isMe = user && profile.id === user.id;
    // クールダウン判定のために詳細情報を参照
    const detail = memberList.find(m => m.id === profile.id); 
    const cooldown = isCooldown(detail?.last_received_at);

    return (
      <div 
        onClick={() => !isMe && !cooldown && handleClickUser(profile.id)}
        className={`
          relative flex items-center justify-between p-4 mb-3 rounded-2xl transition-all duration-300 border-2 select-none
          ${isMe ? 'bg-[#3e2723]/20 border-[#5d4037]/20 cursor-default' : 'cursor-pointer'}
          ${!isMe && cooldown ? 'opacity-50 grayscale cursor-not-allowed bg-[#0a0403] border-transparent' : ''}
          ${!isMe && !cooldown && isSelected 
            ? 'bg-gradient-to-r from-[#9f1239] to-[#be123c] border-[#be123c] scale-[1.02]' 
            : !isMe && !cooldown 
              ? 'bg-[#2b120a] border-[#3e2723]/50 hover:bg-[#3e2723]/80' 
              : ''
          }
        `}
      >
        <div className="flex items-center gap-4 overflow-hidden w-full">
          <div className="flex-shrink-0 w-8 text-center flex justify-center">
            {isRanking ? <RankBadge index={index} /> : (
               <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-white border-white' : 'border-[#5d4037]'}`}>
                 {isSelected && <span className="text-[#be123c] font-bold text-xs">✓</span>}
               </div>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className={`font-bold text-base truncate ${isSelected ? 'text-white' : 'text-[#eaddcf]'} ${isMe ? 'opacity-50' : ''}`}>
              {profile.display_name} {isMe && <span className="text-xs opacity-50 ml-1">(You)</span>}
            </p>
            {isRanking && !isMe && <p className="text-[10px] text-[#8d6e63] mt-0.5 opacity-70">{profile.received_count} Chocolates</p>}
            {cooldown && !isMe && <p className="text-[10px] text-[#ef4444] font-mono tracking-wider mt-1">WAIT 15 MIN</p>}
          </div>
          <div className="flex-shrink-0">
             {!isMe && !cooldown && !isSelected && (
               <span className={`text-xs px-3 py-1 rounded-full border transition-all ${isRanking ? 'bg-[#be123c] text-white border-[#be123c]' : 'text-[#be123c] border-[#be123c]'}`}>🎁</span>
             )}
             {isSelected && <span className="text-xs bg-white text-[#be123c] font-bold px-3 py-1 rounded-full animate-pulse">SET</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#1a0f0d] text-[#eaddcf] flex flex-col items-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#2b120a] via-[#1a0805] to-[#0a0403] opacity-100 z-0"></div>
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#5d4037]/20 to-transparent z-0 pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10 pb-20">
        <div className="text-center mb-8 pt-10">
          <h1 className="text-4xl font-extrabold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#d7ccc8] via-[#eaddcf] to-[#d7ccc8] drop-shadow-sm mb-4">
            COSMIC<br/><span className="text-5xl text-[#be123c]">CHOCOLAT</span>
          </h1>
          <div className="bg-[#1a0805] rounded-[11px] p-4 text-center border border-[#5d4037]/30 mx-auto max-w-xs">
            <p className="text-[9px] text-[#a1887f] uppercase tracking-widest mb-1">Total Gifted</p>
            <p className="text-5xl font-serif text-[#ffecb3]">{totalChocolates.toLocaleString()}</p>
          </div>
        </div>

        {/* ランキングエリア */}
        <div className="mb-12 animate-fade-in-up">
          <h2 className="text-center text-[#be123c] font-bold text-sm tracking-[0.3em] mb-6">GALAXY RANKING</h2>
          <div className="px-2">
            {rankingList.map((ranker, index) => <UserCard key={ranker.id} profile={ranker} index={index} isRanking={true} />)}
          </div>
        </div>

        {/* ユーザー操作エリア */}
        {!user ? (
          <div className="text-center px-4 pb-20 animate-fade-in-up">
            <p className="mb-8 text-sm text-[#d7ccc8]/80 leading-7 font-serif italic">劇の余韻を、一粒のチョコに込めて。</p>
            <button onClick={signIn} className="bg-[#5865F2] text-white px-10 py-4 rounded-full font-bold shadow-lg transition-transform hover:scale-105">Discordで入場する</button>
          </div>
        ) : (
          <div className="animate-fade-in-up space-y-8">
            <div className="bg-[#2b120a]/50 p-6 rounded-2xl border border-[#5d4037]/30 backdrop-blur-md mx-2">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] text-[#8d6e63] font-bold">Your Name</label>
                <button onClick={signOut} className="text-[10px] text-[#8d6e63] underline">Logout</button>
              </div>
              <div className="flex gap-3 items-center">
                <input type="text" className="flex-1 bg-transparent font-bold text-xl text-[#eaddcf] border-b-2 border-[#5d4037]/50 focus:border-[#be123c] focus:outline-none" value={myProfileName} onChange={(e) => setMyProfileName(e.target.value)} />
                <button onClick={handleUpdateName} disabled={isActionLoading} className="text-[10px] font-bold px-4 py-2 rounded-lg bg-[#be123c] text-white hover:bg-[#9f1239] transition-colors">
                  {isActionLoading ? 'SAVING...' : 'UPDATE'}
                </button>
              </div>
            </div>

            <div>
              <div className="px-4 mb-4 flex items-center justify-between">
                <h2 className="font-bold text-[#d7ccc8] text-sm tracking-[0.2em]">CAST MEMBERS</h2>
                {selectedUsers.size > 0 && <span className="bg-[#be123c] text-white text-[10px] font-bold px-3 py-1 rounded-full">{selectedUsers.size} SELECTED</span>}
              </div>
              <div className="px-4 mb-4">
                <input type="text" placeholder="Search..." className="w-full px-4 py-3 rounded-xl bg-[#0a0403] text-[#eaddcf] text-sm border border-[#3e2723]/50 focus:outline-none focus:ring-2 focus:ring-[#be123c]" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
              </div>
              
              <div className="px-2 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#3e2723] pb-20">
                {filteredMembers.length === 0 ? <p className="text-center text-[#4e342e] py-12 text-xs">NO MEMBERS</p> : 
                  filteredMembers.map((m) => <UserCard key={m.id} profile={m} />)
                }
              </div>
            </div>

            <div className="fixed bottom-6 left-0 right-0 px-6 z-50 pointer-events-none">
              <div className="max-w-lg mx-auto pointer-events-auto">
                <button onClick={handleSend} disabled={selectedUsers.size === 0} className={`w-full py-5 rounded-2xl font-black text-base tracking-[0.2em] shadow-2xl transition-all ${selectedUsers.size === 0 ? 'bg-[#1a0805]/90 text-[#5d4037] translate-y-20 opacity-0' : 'bg-gradient-to-r from-[#9f1239] to-[#be123c] text-white'}`}>
                  SEND CHOCOLATE ({selectedUsers.size})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}