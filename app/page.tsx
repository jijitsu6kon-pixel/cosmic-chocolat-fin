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
// 🌠 星空生成コンポーネント
// ==========================================
const StarBackground = () => {
  const generateStars = (count: number) => {
    let value = '';
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * 2000);
      const y = Math.floor(Math.random() * 2000);
      value += `${x}px ${y}px #FFF, `;
    }
    return value.slice(0, -2);
  };
  const [starsSmall] = useState(() => generateStars(700));
  const [starsMedium] = useState(() => generateStars(200));
  const [starsLarge] = useState(() => generateStars(100));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <style jsx>{`
        @keyframes animStar { from { transform: translateY(0px); } to { transform: translateY(-2000px); } }
        .star-layer { width: 1px; height: 1px; background: transparent; }
      `}</style>
      <div className="star-layer absolute top-0 left-0" style={{ boxShadow: starsSmall, animation: 'animStar 100s linear infinite' }} />
      <div className="star-layer absolute top-0 left-0" style={{ boxShadow: starsSmall, animation: 'animStar 100s linear infinite', transform: 'translateY(2000px)' }} />
      <div className="star-layer absolute top-0 left-0" style={{ width: '2px', height: '2px', boxShadow: starsMedium, animation: 'animStar 50s linear infinite' }} />
      <div className="star-layer absolute top-0 left-0" style={{ width: '3px', height: '3px', boxShadow: starsLarge, animation: 'animStar 25s linear infinite' }} />
    </div>
  );
};

// ==========================================
// 🧱 メインコンポーネント
// ==========================================
export default function CosmicChocolatApp() {
  const [session, setSession] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const isRedirecting = window.location.hash.includes('access_token');
    if (isRedirecting) { setIsAuthChecking(true); }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAuthChecking(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center overflow-hidden relative">
        <StarBackground />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1033] via-[#0a0e1a] to-black opacity-80 z-0"></div>
        <div className="text-center relative z-10">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ffd700] to-[#ff3366] rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-[#ffd700] to-[#ff3366] rounded-full animate-pulse blur-md opacity-40"></div>
            <div className="absolute inset-0 flex items-center justify-center"><span className="text-4xl">🛸</span></div>
          </div>
          <h1 className="text-3xl font-black tracking-[0.3em] mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#e6e6fa] via-[#ffd700] to-[#e6e6fa] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">COSMIC CHOCOLAT</h1>
          <p className="text-xs text-[#ffd700] tracking-[0.5em] animate-pulse">INITIALIZING WARDROBE...</p>
        </div>
      </div>
    );
  }

  return <GameContent session={session} />;
}

// ==========================================
// 🎮 ゲーム本体コンポーネント
// ==========================================
function GameContent({ session }: { session: any }) {
  const user = session?.user ?? null;
  const [rankingList, setRankingList] = useState<Profile[]>([]);
  const [totalChocolates, setTotalChocolates] = useState<number>(0);
  
  const [myProfileName, setMyProfileName] = useState('');
  const [memberList, setMemberList] = useState<Profile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');
  
  const [isActionLoading, setIsActionLoading] = useState(false);
  const isMounted = useRef(true);

  // ----------------------------------------
  // 🔄 データ取得
  // ----------------------------------------
  const fetchRanking = useCallback(async () => {
    const { count } = await supabase.from('chocolates').select('*', { count: 'exact', head: true });
    if (isMounted.current) setTotalChocolates(count || 0);
    const { data } = await supabase.from('galaxy_ranking').select('*');
    if (isMounted.current && data) setRankingList(data);
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!user) return;
    let name = user.user_metadata.full_name || '劇団員';
    const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle();
    if (profile) { name = profile.display_name; } else { await supabase.from('profiles').insert({ id: user.id, display_name: name }); }
    if (isMounted.current) setMyProfileName(name);

    const { data: profiles } = await supabase.from('profiles').select('*').neq('id', user.id);
    const { data: myHistory } = await supabase.from('chocolates').select('receiver_id, created_at').eq('sender_id', user.id);
    const { data: ranks } = await supabase.from('galaxy_ranking').select('*');
    
    const countMap: Record<string, number> = {};
    ranks?.forEach((r: any) => countMap[r.id] = r.received_count);
    const historyMap = new Map();
    myHistory?.forEach((h: any) => {
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

  useEffect(() => {
    isMounted.current = true;
    fetchRanking();
    if (user) fetchUserData();
    const channel = supabase.channel('realtime').on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchRanking(); if (user) fetchUserData();
      }).subscribe();
    return () => { isMounted.current = false; supabase.removeChannel(channel); };
  }, [user]);

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
    const detailInfo = memberList.find(m => m.id === targetId);
    if (detailInfo && isCooldown(detailInfo.last_received_at)) { return alert("15分休憩しましょう！"); }
    handleToggleSelect(targetId);
  };
  const handleSend = async () => {
    if (!user || selectedUsers.size === 0) return;
    alert(`💝 ${selectedUsers.size}人にチョコを贈りました！`);
    setSelectedUsers(new Set());
    const updates = Array.from(selectedUsers).map(rid => ({ sender_id: user.id, receiver_id: rid }));
    await supabase.from('chocolates').insert(updates);
    fetchRanking(); fetchUserData();
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
    const styles = [
      "text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#e6b800] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] scale-125", 
      "text-transparent bg-clip-text bg-gradient-to-b from-[#e6e6fa] to-[#c0c0c0] drop-shadow-[0_0_5px_rgba(230,230,250,0.6)] scale-110", 
      "text-transparent bg-clip-text bg-gradient-to-b from-[#ffab91] to-[#d84315] drop-shadow-[0_0_5px_rgba(255,171,145,0.5)] scale-105"
    ];
    return <span className={`font-black text-xl ${styles[index] || "text-[#8d6e63] opacity-70"}`}>{index + 1}</span>;
  };

  // 🆕 空席カード (高さ固定 h-[104px])
  const EmptyCard = ({ index }: { index: number }) => (
    <div className="relative flex items-center justify-between p-4 mb-3 rounded-2xl border-2 border-dashed border-[#e6e6fa]/10 bg-[#1a1033]/20 select-none h-[104px]">
       <div className="flex items-center gap-4 w-full opacity-30">
          <div className="w-8 text-center font-black text-xl text-[#8d6e63]">{index + 1}</div>
          <div className="flex-1">
             <p className="font-bold text-base text-[#e6e6fa] tracking-widest text-xs">NO DATA</p>
          </div>
       </div>
    </div>
  );

  // 🆕 ユーザーカード (高さ固定 h-[104px] で統一)
  const UserCard = ({ profile, index = -1, isRanking = false }: { profile: Profile, index?: number, isRanking?: boolean }) => {
    const isSelected = selectedUsers.has(profile.id);
    const isMe = user && profile.id === user.id;
    const detail = memberList.find(m => m.id === profile.id); 
    const cooldown = isCooldown(detail?.last_received_at);

    return (
      <div 
        onClick={() => !isMe && !cooldown && handleClickUser(profile.id)}
        className={`
          relative flex items-center justify-between p-4 mb-3 rounded-2xl transition-all duration-500 border select-none backdrop-blur-md overflow-hidden group h-[104px]
          ${isMe ? 'bg-[#1a1033]/40 border-[#ffd700]/20 cursor-default' : 'cursor-pointer'}
          ${!isMe && cooldown ? 'opacity-50 grayscale cursor-not-allowed bg-[#0a0e1a]/80 border-white/5' : ''}
          ${!isMe && !cooldown && isSelected 
            ? 'bg-gradient-to-r from-[#ff3366]/80 to-[#ffd700]/80 border-[#ffd700] shadow-[0_0_20px_rgba(255,51,102,0.5)] scale-[1.02]' 
            : !isMe && !cooldown 
              ? 'bg-[#1a1033]/60 border-white/10 hover:border-[#ffd700]/50 hover:bg-[#1a1033]/80 hover:shadow-[0_0_15px_rgba(26,16,51,0.8)]' 
              : ''
          }
        `}
      >
        {isSelected && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ffd700]/20 to-transparent opacity-50 animate-pulse"></div>}
        
        <div className="flex items-center gap-4 overflow-hidden w-full relative z-10">
          <div className="flex-shrink-0 w-8 text-center flex justify-center">
            {isRanking ? <RankBadge index={index} /> : (
               <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#ffd700] border-[#ffd700] shadow-[0_0_10px_#ffd700]' : 'border-white/20 group-hover:border-[#ffd700]/50'}`}>
                 {isSelected && <span className="text-[#1a1033] font-bold text-xs">✓</span>}
               </div>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className={`font-bold text-base truncate transition-colors ${isSelected ? 'text-[#1a1033]' : 'text-[#e6e6fa]'} ${isMe ? 'opacity-80' : ''}`}>
              {profile.display_name} {isMe && <span className="text-xs font-normal ml-1 text-[#ffd700] border border-[#ffd700]/30 px-1 rounded">(You)</span>}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border ${isSelected ? 'bg-[#1a1033]/20 border-[#1a1033]/30' : 'bg-[#ffd700]/10 border-[#ffd700]/30'}`}>
                <span className="text-xs">🍫</span>
                <span className={`text-sm font-black ${isSelected ? 'text-[#1a1033]' : 'text-[#ffd700]'}`}>{profile.received_count}</span>
              </div>
              {cooldown && !isMe && (
                <span className="text-[10px] text-[#ff3366] font-mono tracking-wider flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-[#ff3366] rounded-full animate-ping"></span>WAIT 15m
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
             {!isMe && !cooldown && !isSelected && <span className={`text-xl transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 inline-block drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]`}>🪐</span>}
             {isSelected && <span className="text-xs bg-[#1a1033] text-[#ffd700] font-black px-3 py-1 rounded-full shadow-sm animate-bounce">LOCKED</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#0a0e1a] text-[#e6e6fa] flex flex-col items-center p-4 font-sans relative overflow-hidden">
      <StarBackground />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1033] via-[#0a0e1a] to-black opacity-100 z-0"></div>
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#ffd700]/10 via-[#ff3366]/5 to-transparent z-0 pointer-events-none blur-3xl"></div>

      <div className="w-full max-w-4xl relative z-10 pb-20">
        <div className="text-center mb-10 pt-12">
          <h1 className="text-4xl font-extrabold tracking-[0.2em] mb-6 relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e6e6fa] to-[#a0a0c0]">COSMIC</span><br/>
            <span className="text-6xl text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-[#ff3366] to-[#ffd700] drop-shadow-[0_0_15px_rgba(255,51,102,0.6)]">CHOCOLAT</span>
          </h1>
          <div className="relative group mx-auto max-w-xs">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ffd700] to-[#ff3366] rounded-2xl blur-md opacity-50 group-hover:opacity-80 transition-opacity duration-500 animate-pulse"></div>
            <div className="bg-[#1a1033]/90 rounded-xl p-5 text-center border border-[#ffd700]/30 relative backdrop-blur-xl">
              <p className="text-[10px] text-[#ffd700] uppercase tracking-[0.3em] mb-1">Total Stardust Gifted</p>
              <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#ff6b6b] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {totalChocolates.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-12 animate-fade-in-up relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#ffd700]/5 to-transparent blur-xl -z-10 rounded-full"></div>
          <h2 className="text-center text-[#ffd700] font-bold text-sm tracking-[0.4em] mb-8 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#ffd700]"></span>
            GALAXY RANKING
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#ffd700]"></span>
          </h2>
          <div className="px-2">
            {/* ▼ 10枠固定・左右分割レイアウト */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
               {/* 左カラム（1-5位） */}
               <div className="w-full md:w-1/2 flex flex-col gap-3">
                  <div className="hidden md:block text-center text-[#ffd700] text-xs tracking-widest mb-2 opacity-70">- TOP 5 STARS -</div>
                  {Array.from({ length: 5 }).map((_, i) => {
                     const ranker = rankingList[i];
                     return ranker ? <UserCard key={ranker.id} profile={ranker} index={i} isRanking={true} /> : <EmptyCard key={`empty-${i}`} index={i} />;
                  })}
               </div>
               
               {/* 右カラム（6-10位） */}
               <div className="w-full md:w-1/2 flex flex-col gap-3">
                  <div className="hidden md:block text-center text-[#e6e6fa] text-xs tracking-widest mb-2 opacity-50">- RISING STARS -</div>
                  {Array.from({ length: 5 }).map((_, i) => {
                     const rankIndex = i + 5;
                     const ranker = rankingList[rankIndex];
                     return ranker ? <UserCard key={ranker.id} profile={ranker} index={rankIndex} isRanking={true} /> : <EmptyCard key={`empty-${rankIndex}`} index={rankIndex} />;
                  })}
               </div>
            </div>
          </div>
        </div>

        {!user ? (
          <div className="text-center px-4 pb-20 animate-fade-in-up relative z-20">
            <p className="mb-10 text-base text-[#e6e6fa]/80 leading-8 font-serif italic drop-shadow-md">
              銀河の彼方へ、想いを乗せて。<br/>コマンダーとしてログインし、<br/>キャストにエネルギーを贈りましょう。
            </p>
            <button onClick={signIn} className="group relative inline-flex items-center justify-center px-12 py-4 font-bold text-white transition-all duration-300 bg-[#5865F2] rounded-full hover:bg-[#4752c4] hover:scale-105 shadow-[0_0_30px_rgba(88,101,242,0.5)] overflow-hidden">
               <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
               <span className="relative z-10 flex items-center gap-2">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.6853-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0323 1.5864 4.0079 2.5543 5.9429 3.1686a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 00.0306-.0557c3.9437 1.8038 8.1798 1.8038 12.0583 0a.0739.0739 0 00.0305.0557c.1202.099.246.1981.3719.2914a.077.077 0 01-.0077.1277c-.5979.3428-1.2194.6447-1.8721.8923a.0756.0756 0 00-.0416.1057c.3529.699.7644 1.3638 1.226 1.9942a.0773.0773 0 00.0842.0276c1.9349-.6143 3.9106-1.5822 5.9429-3.1686a.0824.0824 0 00.0312-.0561c.493-5.4786-.6425-9.998-3.0808-13.6603a.0718.0718 0 00-.032-.0277zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z"/></svg>
                 Discordで入場する
               </span>
            </button>
          </div>
        ) : (
          <div className="animate-fade-in-up space-y-8 relative z-20 max-w-lg mx-auto">
            <div className="bg-[#1a1033]/60 p-6 rounded-2xl border border-[#ffd700]/30 backdrop-blur-xl mx-2 shadow-[0_0_30px_rgba(26,16,51,0.5)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ffd700]/10 via-transparent to-[#ff3366]/10 opacity-50 pointer-events-none"></div>
              <div className="flex justify-between items-center mb-4 relative z-10">
                <label className="text-[10px] text-[#ffd700] uppercase tracking-wider block font-bold flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-[#ffd700] rounded-full animate-pulse"></span>Commander Name
                </label>
                <button onClick={signOut} className="text-[10px] text-[#e6e6fa]/60 hover:text-[#ff3366] transition-colors underline decoration-dotted">ABORT SESSION</button>
              </div>
              <div className="flex gap-3 items-center relative z-10">
                <input type="text" className="flex-1 bg-[#0a0e1a]/50 font-bold text-xl text-[#e6e6fa] border-b-2 border-[#ffd700]/30 focus:border-[#ff3366] focus:outline-none transition-all pb-2 px-2 rounded-t-lg focus:bg-[#0a0e1a]/80" value={myProfileName} onChange={(e) => setMyProfileName(e.target.value)} />
                <button onClick={handleUpdateName} disabled={isActionLoading} className={`text-[10px] font-bold px-6 py-3 rounded-lg transition-all shadow-lg relative overflow-hidden group ${isActionLoading ? 'bg-[#1a1033] text-[#e6e6fa]/50 cursor-wait' : 'bg-gradient-to-r from-[#ff3366] to-[#ffd700] text-[#1a1033] hover:shadow-[0_0_15px_#ff3366]'}`}>
                  <span className="relative z-10">{isActionLoading ? 'SYNCING...' : 'UPDATE'}</span>
                  {!isActionLoading && <span className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>}
                </button>
              </div>
            </div>

            <div>
              <div className="px-4 mb-4 flex items-center justify-between">
                <h2 className="font-bold text-[#ffd700] text-sm tracking-[0.2em] flex items-center gap-2">
                  <span className="text-xl">👾</span> CAST MEMBERS
                </h2>
                {selectedUsers.size > 0 && <span className="bg-[#ff3366] text-white text-[10px] font-bold px-4 py-1 rounded-full shadow-[0_0_10px_#ff3366] animate-bounce">{selectedUsers.size} TARGETS LOCKED</span>}
              </div>
              <div className="px-4 mb-6 relative">
                <input type="text" placeholder="Search members..." className="w-full px-5 py-4 rounded-2xl bg-[#1a1033]/80 text-[#e6e6fa] placeholder-[#e6e6fa]/30 text-sm focus:outline-none border-2 border-[#ffd700]/20 focus:border-[#ffd700]/80 focus:shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all backdrop-blur-md" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[#ffd700]/50">🔍</span>
              </div>
              
              <div className="px-2 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#ffd700]/30 scrollbar-track-[#0a0e1a]/50 pb-24">
                {filteredMembers.length === 0 ? <p className="text-center text-[#e6e6fa]/40 py-12 text-xs tracking-widest">NO LIFEFORMS DETECTED</p> : 
                  filteredMembers.map((m) => <UserCard key={m.id} profile={m} />)
                }
              </div>
            </div>

            <div className="fixed bottom-6 left-0 right-0 px-6 z-50 pointer-events-none">
              <div className="max-w-lg mx-auto pointer-events-auto">
                <button onClick={handleSend} disabled={selectedUsers.size === 0} className={`w-full py-6 rounded-3xl font-black text-lg tracking-[0.2em] shadow-2xl transition-all relative overflow-hidden group border-2 ${selectedUsers.size === 0 ? 'bg-[#1a1033]/90 border-white/5 text-[#e6e6fa]/30 backdrop-blur-sm cursor-not-allowed translate-y-20 opacity-0' : 'bg-gradient-to-r from-[#ff3366] via-[#ffd700] to-[#ff3366] bg-[length:200%_auto] animate-gradient border-[#ffd700] text-[#1a1033] hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_30px_rgba(255,51,102,0.8)]'}`}>
                  <span className="relative z-10 flex items-center justify-center gap-2">LAUNCH CHOCOLATE ({selectedUsers.size}) 🚀</span>
                  {selectedUsers.size > 0 && <div className="absolute inset-0 bg-white/40 mix-blend-overlay translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {user && <p className="text-center text-[10px] text-[#ffd700]/50 mt-8 font-mono tracking-widest absolute bottom-2 left-0 right-0">VOICE NOVA × COSMIC CHOCOLAT SYSTEM</p>}
    </main>
  );
}
