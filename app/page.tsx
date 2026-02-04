'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image'; // 最適化のためImageコンポーネント推奨ですが、今回はimgタグのままスタイル調整します

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
  avatar_url?: string;
  last_received_at?: string;
  received_count: number;
};

type RankTitle = {
  count: number;
  title: string;
};

type ActivityLog = {
  id: number;
  created_at: string;
  quantity: number;
  sender_name: string;
  sender_avatar?: string;
  receiver_name: string;
  receiver_avatar?: string;
};

// ==========================================
// 🌠 星空生成コンポーネント (安定版)
// ==========================================
const StarBackground = () => {
  const [starsSmall, setStarsSmall] = useState('');
  const [starsMedium, setStarsMedium] = useState('');
  
  const generateStars = (count: number) => {
    let value = '';
    const height = 2000; 
    const width = 2500; 

    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const opacity = Math.random();
      const size = opacity > 0.8 ? 2 : 1;
      const color = `rgba(255, 255, 255, ${opacity})`;

      value += `${x}px ${y}px 0px ${size}px ${color}, `;
      value += `${x}px ${y + height}px 0px ${size}px ${color}, `;
    }
    return value.slice(0, -2);
  };

  useEffect(() => {
    setStarsSmall(generateStars(200));
    setStarsMedium(generateStars(50));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#050510]">
      <style jsx>{`
        @keyframes animStar { from { transform: translateY(0px); } to { transform: translateY(-2000px); } }
        @keyframes shooting {
          0% { transform: translateX(0) translateY(0) rotate(315deg); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateX(-1000px) translateY(1000px) rotate(315deg); opacity: 0; }
        }
        .star-layer { position: absolute; left: 0; top: 0; background: transparent; width: 1px; height: 1px; }
        .shooting-star {
          position: absolute; top: 0; right: 0; width: 4px; height: 4px;
          background: #fff; border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1), 0 0 0 8px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 1);
          animation: shooting 7s linear infinite; opacity: 0;
        }
        .shooting-star::before {
          content: ''; position: absolute; top: 50%; transform: translateY(-50%);
          width: 300px; height: 1px; background: linear-gradient(90deg, #fff, transparent);
        }
        /* スクロールバーの洗練 */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 215, 0, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 215, 0, 0.6); }
      `}</style>
      
      {starsSmall && (
        <>
          <div className="star-layer" style={{ boxShadow: starsSmall, animation: 'animStar 150s linear infinite' }} />
          <div className="star-layer" style={{ boxShadow: starsMedium, animation: 'animStar 100s linear infinite' }} />
        </>
      )}
      <div className="shooting-star" style={{ top: '10%', right: '10%', animationDelay: '2s' }}></div>
      <div className="shooting-star" style={{ top: '30%', right: '5%', animationDelay: '5s' }}></div>
    </div>
  );
};

// ==========================================
// 🚀 ロケット演出レイヤー
// ==========================================
const RocketLayer = ({ isActive, onComplete }: { isActive: boolean, onComplete: () => void }) => {
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);
  if (!isActive) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden flex items-end justify-center backdrop-blur-[2px] transition-all duration-500">
      <style jsx>{` @keyframes flyUp { 0% { transform: translateY(100vh) scale(0.5); opacity: 1; } 50% { transform: translateY(-50vh) scale(1.2); } 100% { transform: translateY(-150vh) scale(0.5); opacity: 0; } } `}</style>
      <div className="text-6xl animate-[flyUp_1.5s_ease-in_forwards] drop-shadow-[0_0_30px_rgba(255,51,102,0.8)]">🚀</div>
      <div className="absolute text-4xl animate-[flyUp_1.8s_ease-in_forwards] left-[40%] drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]" style={{ animationDelay: '0.1s' }}>🍫</div>
      <div className="absolute text-4xl animate-[flyUp_1.6s_ease-in_forwards] right-[40%] drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]" style={{ animationDelay: '0.2s' }}>🍫</div>
    </div>
  );
};

// ==========================================
// 📡 アクティビティログ (サイドパネル)
// ==========================================
const ActivityPanel = ({ isOpen, onClose, logs }: { isOpen: boolean, onClose: () => void, logs: ActivityLog[] }) => {
  return (
    <>
      <div className={`fixed inset-0 bg-black/60 z-[80] transition-opacity duration-300 backdrop-blur-sm ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
      <div className={`fixed top-0 right-0 h-full w-80 bg-[#0a0a15]/95 backdrop-blur-xl border-l border-white/10 z-[90] transform transition-transform duration-300 flex flex-col shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-[#ffd700] font-bold tracking-[0.2em] text-xs flex items-center gap-2"><span className="w-2 h-2 bg-[#ffd700] rounded-full animate-pulse"></span> SYSTEM LOG</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors text-xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {logs.length === 0 ? <p className="text-center text-white/30 text-xs py-10">NO SIGNAL</p> : logs.map((log) => (
            <div key={log.id} className="bg-white/5 p-3 rounded-lg border border-white/5 text-xs hover:bg-white/10 transition-colors group">
              <div className="flex items-center gap-2 mb-2">
                <img src={log.sender_avatar || 'https://www.gravatar.com/avatar?d=mp'} alt="Sender" className="w-5 h-5 rounded-full border border-white/20" />
                <span className="text-[#ffd700] font-bold truncate max-w-[70px]">{log.sender_name}</span>
                <span className="text-white/30 text-[10px]">▶</span>
                <img src={log.receiver_avatar || 'https://www.gravatar.com/avatar?d=mp'} alt="Receiver" className="w-5 h-5 rounded-full border border-white/20" />
                <span className="text-white font-bold truncate max-w-[70px]">{log.receiver_name}</span>
              </div>
              <div className="flex justify-between items-center text-white/60">
                <span>{log.quantity > 1 ? `☄️ METEOR x${log.quantity}` : `💝 GIFT x1`}</span>
                <span className="font-mono text-[10px] opacity-50">{new Date(log.created_at).toLocaleTimeString('ja-JP')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
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
      <div className="min-h-screen bg-[#050510] flex items-center justify-center overflow-hidden relative">
        <StarBackground />
        <div className="text-center relative z-10">
          <div className="relative w-20 h-20 mx-auto mb-8 animate-bounce opacity-80"><span className="text-5xl">🛸</span></div>
          <h1 className="text-2xl font-black tracking-[0.4em] mb-4 text-white/90">LOADING</h1>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent mx-auto opacity-50"></div>
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

  const [isRocketFlying, setIsRocketFlying] = useState(false);
  const [myTotalSent, setMyTotalSent] = useState(0); 
  const [myRankTitle, setMyRankTitle] = useState('見習いクルー'); 
  const [appConfig, setAppConfig] = useState<any>({});
  
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(false);

  // ----------------------------------------
  // 🔄 データ取得
  // ----------------------------------------
  const fetchConfig = useCallback(async () => {
    const { data } = await supabase.from('system_settings').select('*');
    if (data) {
      const configMap: any = {};
      data.forEach(item => configMap[item.key] = item.value);
      if (isMounted.current) setAppConfig(configMap);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    const { data } = await supabase.from('activity_logs').select('*');
    if (isMounted.current && data) setActivityLogs(data);
  }, []);

  const fetchRanking = useCallback(async () => {
    const { data: sumData } = await supabase.from('chocolates').select('quantity');
    const total = sumData?.reduce((acc, curr) => acc + (curr.quantity || 1), 0) || 0;
    if (isMounted.current) setTotalChocolates(total);
    const { data } = await supabase.from('galaxy_ranking').select('*');
    
    if (isMounted.current && data) {
       const { data: profiles } = await supabase.from('profiles').select('id, avatar_url');
       const merged = data.map(rank => ({
         ...rank,
         avatar_url: profiles?.find(p => p.id === rank.id)?.avatar_url
       }));
       setRankingList(merged);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!user) return;
    let name = user.user_metadata.full_name || 'クルー';
    let avatar = user.user_metadata.avatar_url || '';

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (profile) { 
      name = profile.display_name; 
      if (profile.avatar_url !== avatar) {
         await supabase.from('profiles').update({ avatar_url: avatar }).eq('id', user.id);
      }
    } else { 
      await supabase.from('profiles').insert({ id: user.id, display_name: name, avatar_url: avatar }); 
    }
    
    if (isMounted.current) setMyProfileName(name);

    const { data: profiles } = await supabase.from('profiles').select('*').neq('id', user.id);
    const { data: myHistory } = await supabase.from('chocolates').select('receiver_id, created_at, quantity').eq('sender_id', user.id);
    const { data: ranks } = await supabase.from('galaxy_ranking').select('*');
    
    const totalSent = myHistory?.reduce((acc, curr) => acc + (curr.quantity || 1), 0) || 0;
    if (isMounted.current) setMyTotalSent(totalSent);
    
    if (appConfig.rank_titles) {
      const titles: RankTitle[] = appConfig.rank_titles;
      const currentTitle = titles.sort((a, b) => b.count - a.count).find(t => totalSent >= t.count);
      if (currentTitle && isMounted.current) setMyRankTitle(currentTitle.title);
    }

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
  }, [user, appConfig]); 

  useEffect(() => {
    isMounted.current = true;
    fetchConfig(); 
    fetchRanking(); 
    fetchLogs(); 
    if (user) fetchUserData();
    
    const channel = supabase.channel('realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => { fetchRanking(); fetchLogs(); if (user) fetchUserData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_settings' }, () => { fetchConfig(); })
      .subscribe();
    return () => { isMounted.current = false; supabase.removeChannel(channel); };
  }, [user, fetchConfig, fetchRanking, fetchLogs, fetchUserData]);

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
    setIsRocketFlying(true); 

    const meteorConfig = appConfig.lucky_meteor_config || { enabled: false, probability: 0, multiplier: 1 };
    const isLucky = meteorConfig.enabled && Math.random() < meteorConfig.probability;
    const quantity = isLucky ? meteorConfig.multiplier : 1;

    if (isLucky) {
      setTimeout(() => alert(`☄️ LUCKY METEOR!!\n奇跡が起きました！\n${quantity}倍のチョコが降り注ぎます！`), 500);
    } else {
      setTimeout(() => alert(`💝 ${selectedUsers.size}人のクルーメイトにチョコを贈りました！`), 500);
    }

    const targets = Array.from(selectedUsers);
    setSelectedUsers(new Set()); 

    const updates = targets.map(rid => ({ 
      sender_id: user.id, 
      receiver_id: rid,
      quantity: quantity 
    }));
    await supabase.from('chocolates').insert(updates);
    
    fetchRanking(); 
    fetchUserData();
  };

  const handleUpdateName = async () => {
    if (!user || !myProfileName) return;
    setIsActionLoading(true);
    await supabase.from('profiles').update({ display_name: myProfileName }).eq('id', user.id);
    setTimeout(() => setIsActionLoading(false), 500);
  };
  const signIn = () => supabase.auth.signInWithOAuth({ provider: 'discord', options: { queryParams: { prompt: 'consent' } } });
  const signOut = async () => { await supabase.auth.signOut(); };

  // ----------------------------------------
  // 🎨 表示パーツ (Refined)
  // ----------------------------------------
  const filteredMembers = memberList.filter(m => m.display_name.toLowerCase().includes(searchText.toLowerCase()));

  const RankBadge = ({ index }: { index: number }) => {
    // グラデーションの微調整: よりリッチなゴールド、シルバー、ブロンズ
    const styles = [
      "text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#b8860b] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)] scale-125", 
      "text-transparent bg-clip-text bg-gradient-to-b from-[#e6e6fa] to-[#708090] drop-shadow-[0_0_5px_rgba(230,230,250,0.4)] scale-110", 
      "text-transparent bg-clip-text bg-gradient-to-b from-[#ffab91] to-[#8b4513] drop-shadow-[0_0_5px_rgba(255,171,145,0.4)] scale-105"
    ];
    return <span className={`font-black text-xl font-mono ${styles[index] || "text-[#8d6e63] opacity-60"}`}>{index + 1}</span>;
  };

  const EmptyCard = ({ index }: { index: number }) => (
    <div className="relative flex items-center justify-between p-4 mb-3 rounded-2xl border border-dashed border-white/5 bg-white/5 select-none h-[96px]">
       <div className="flex items-center gap-4 w-full opacity-30">
          <div className="w-8 text-center font-black text-xl text-white/50">{index + 1}</div>
          <div className="flex-1"><p className="font-bold text-sm text-white/50 tracking-widest text-xs">NO DATA</p></div>
       </div>
    </div>
  );

  const UserCard = ({ profile, index = -1, isRanking = false }: { profile: Profile, index?: number, isRanking?: boolean }) => {
    const isSelected = selectedUsers.has(profile.id);
    const isMe = user && profile.id === user.id;
    const detail = memberList.find(m => m.id === profile.id); 
    const cooldown = isCooldown(detail?.last_received_at);
    const avatar = profile.avatar_url || "https://www.gravatar.com/avatar?d=mp";

    return (
      <div 
        onClick={() => !isMe && !cooldown && handleClickUser(profile.id)}
        className={`
          relative flex items-center justify-between p-4 mb-3 rounded-2xl transition-all duration-300 border select-none overflow-hidden group h-[96px]
          ${isMe ? 'bg-[#1a1033]/60 border-[#ffd700]/30 cursor-default' : 'cursor-pointer'}
          ${!isMe && cooldown ? 'grayscale opacity-50 cursor-not-allowed bg-black/40 border-white/5' : ''}
          ${!isMe && !cooldown && isSelected 
            ? 'bg-gradient-to-r from-[#ff3366]/20 to-[#ffd700]/20 border-[#ff3366] shadow-[0_0_20px_rgba(255,51,102,0.3)] scale-[1.01]' 
            : !isMe && !cooldown 
              ? 'bg-[#1a1033]/60 border-white/10 hover:border-white/30 hover:bg-[#1a1033]/90 hover:shadow-lg' 
              : ''
          }
        `}
      >
        <div className="flex items-center gap-4 overflow-hidden w-full relative z-10">
          <div className="flex-shrink-0 w-8 text-center flex justify-center items-center">
            {isRanking ? <RankBadge index={index} /> : (
               <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-[#ff3366] border-[#ff3366]' : 'border-white/20 group-hover:border-white/50'}`}>
                 {isSelected && <span className="text-white font-bold text-[10px]">✓</span>}
               </div>
            )}
          </div>
          
          <div className="flex-shrink-0 relative">
             <img src={avatar} alt="icon" className="w-12 h-12 rounded-full border border-white/10 object-cover shadow-sm group-hover:scale-105 transition-transform" />
             {isRanking && index < 3 && <div className="absolute -top-1 -right-1 text-xs">👑</div>}
          </div>

          <div className="flex-1 overflow-hidden">
            <p className={`font-bold text-sm truncate transition-colors flex items-center gap-2 ${isSelected ? 'text-white' : 'text-[#e6e6fa]'} ${isMe ? 'opacity-90' : ''}`}>
              {profile.display_name} {isMe && <span className="text-[9px] font-normal text-[#ffd700] border border-[#ffd700]/30 px-1 rounded bg-[#ffd700]/10 tracking-widest">YOU</span>}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${isSelected ? 'bg-black/20 border-white/20' : 'bg-black/20 border-white/10'}`}>
                <span className="text-[10px]">🍫</span>
                <span className={`text-xs font-mono font-bold ${isSelected ? 'text-[#ff3366]' : 'text-[#ffd700]'}`}>{profile.received_count.toLocaleString()}</span>
              </div>
              {cooldown && !isMe && (
                <span className="text-[9px] text-[#ff3366] font-mono tracking-wider flex items-center gap-1 animate-pulse">
                  RECHARGING
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
             {!isMe && !cooldown && !isSelected && <span className="text-lg grayscale group-hover:grayscale-0 transition-all">🪐</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#050510] text-[#e6e6fa] flex flex-col items-center p-4 font-sans relative overflow-hidden">
      <RocketLayer isActive={isRocketFlying} onComplete={() => setIsRocketFlying(false)} />
      <ActivityPanel isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} logs={activityLogs} />

      <button 
        onClick={() => setIsLogOpen(true)}
        className="fixed top-24 right-0 z-50 bg-black/60 border-l border-y border-white/20 text-[#ffd700] p-3 rounded-l-xl backdrop-blur-md shadow-lg hover:bg-black/80 hover:pl-5 transition-all duration-300 group"
      >
        <span className="text-lg group-hover:rotate-12 transition-transform block">📡</span>
      </button>

      <StarBackground />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#1a1033]/40 via-[#0a0e1a]/80 to-[#000000] z-0"></div>
      
      <div className="w-full max-w-4xl relative z-10 pb-20">
        <div className="text-center mb-8 pt-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-[0.2em] mb-6 relative select-none">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#e6e6fa] to-[#a0a0c0] text-sm md:text-lg mb-2 tracking-[0.5em] font-light">PROJECT VOICE NOVA</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#ffd700] via-[#ffdead] to-[#b8860b] drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">COSMIC</span>
            <span className="block text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#ff3366] to-[#ff00ff] drop-shadow-[0_0_15px_rgba(255,51,102,0.4)] mt-[-5px]">CHOCOLAT</span>
          </h1>
          
          <div className="inline-block relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ffd700] to-[#ff3366] rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="bg-[#0a0a15]/80 rounded-xl px-8 py-4 text-center border border-white/10 relative backdrop-blur-md">
              <p className="text-[10px] text-[#ffd700] uppercase tracking-[0.3em] mb-1 opacity-80">Total Gifted</p>
              <p className="text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-b from-white to-[#cccccc] tracking-tighter">
                {totalChocolates.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* 🔄 ログイン/操作エリア */}
        {!user ? (
          <div className="text-center px-4 pb-16 animate-fade-in-up relative z-20">
            <p className="mb-10 text-sm text-[#e6e6fa]/60 leading-8 font-serif italic tracking-wider">
              銀河の彼方へ、想いを乗せて。<br/>クルーとしてログインし、仲間にショコラを届けよう。
            </p>
            <button onClick={signIn} className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-300 bg-[#5865F2] rounded-full hover:bg-[#4752c4] hover:shadow-[0_0_30px_rgba(88,101,242,0.4)] hover:-translate-y-0.5 overflow-hidden">
               <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
               <span className="relative z-10 flex items-center gap-3 text-sm tracking-widest">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.6853-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0323 1.5864 4.0079 2.5543 5.9429 3.1686a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 00.0306-.0557c3.9437 1.8038 8.1798 1.8038 12.0583 0a.0739.0739 0 00.0305.0557c.1202.099.246.1981.3719.2914a.077.077 0 01-.0077.1277c-.5979.3428-1.2194.6447-1.8721.8923a.0756.0756 0 00-.0416.1057c.3529.699.7644 1.3638 1.226 1.9942a.0773.0773 0 00.0842.0276c1.9349-.6143 3.9106-1.5822 5.9429-3.1686a.0824.0824 0 00.0312-.0561c.493-5.4786-.6425-9.998-3.0808-13.6603a.0718.0718 0 00-.032-.0277zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z"/></svg>
                 Discordでアクセス
               </span>
            </button>
          </div>
        ) : (
          <div className="animate-fade-in-up space-y-6 relative z-20 max-w-lg mx-auto mb-24">
            <div className="bg-[#1a1033]/40 p-1 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
              {/* スターログ・パネル */}
              <div className="bg-[#0f0f1a]/60 rounded-[20px] p-6 text-center relative z-10">
                 <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                   <div className="text-left">
                     <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">CURRENT RANK</p>
                     <p className="text-lg font-bold text-[#e6e6fa]">{myRankTitle}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[9px] text-[#ffd700]/70 uppercase tracking-widest mb-1">TOTAL SENT</p>
                     <p className="text-2xl font-black font-mono text-[#ffd700]">{myTotalSent}</p>
                   </div>
                 </div>

                 <div className="flex justify-between items-center mb-2">
                    <label className="text-[9px] text-white/40 uppercase tracking-widest font-bold">CREW NAME</label>
                    <button onClick={signOut} className="text-[9px] text-white/30 hover:text-white transition-colors">LOGOUT</button>
                 </div>
                 <div className="flex items-center gap-2 bg-black/30 p-1 pl-3 rounded-xl border border-white/5 focus-within:border-[#ffd700]/50 transition-colors">
                   <input type="text" className="flex-1 bg-transparent font-bold text-base text-white focus:outline-none" value={myProfileName} onChange={(e) => setMyProfileName(e.target.value)} />
                   <button onClick={handleUpdateName} disabled={isActionLoading} className="text-[10px] font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-white/80">
                     {isActionLoading ? '...' : 'UPDATE'}
                   </button>
                 </div>
              </div>
            </div>

            <div className="backdrop-blur-md bg-black/20 rounded-3xl border border-white/5 p-4">
              <div className="mb-4 flex items-center justify-between px-2">
                <h2 className="font-bold text-[#ffd700] text-xs tracking-[0.2em] flex items-center gap-2 opacity-80">
                  <span className="text-base">👾</span> CAST CREWMATES
                </h2>
                {selectedUsers.size > 0 && <span className="bg-[#ff3366] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">{selectedUsers.size} SELECTED</span>}
              </div>
              <div className="mb-4 relative group">
                <input type="text" placeholder="Search crewmate..." className="w-full px-4 py-3 rounded-xl bg-black/30 text-white placeholder-white/20 text-sm focus:outline-none border border-white/10 focus:border-[#ffd700]/30 transition-all" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">🔍</span>
              </div>
              
              <div className="custom-scrollbar px-1 max-h-[400px] overflow-y-auto pb-4">
                {filteredMembers.length === 0 ? <p className="text-center text-white/20 py-8 text-xs tracking-widest">NO SIGNAL FOUND</p> : 
                  filteredMembers.map((m) => <UserCard key={m.id} profile={m} />)
                }
              </div>
            </div>

            <div className="fixed bottom-6 left-0 right-0 px-6 z-50 pointer-events-none">
              <div className="max-w-lg mx-auto pointer-events-auto">
                <button onClick={handleSend} disabled={selectedUsers.size === 0} className={`w-full py-5 rounded-2xl font-black text-lg tracking-[0.2em] shadow-2xl transition-all duration-300 relative overflow-hidden group border border-white/10 ${selectedUsers.size === 0 ? 'bg-[#1a1033]/90 text-white/20 cursor-not-allowed backdrop-blur-sm grayscale' : 'bg-gradient-to-r from-[#ff3366] via-[#ff00ff] to-[#ff3366] bg-[length:200%_auto] animate-gradient text-white hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,51,102,0.5)]'}`}>
                  <span className="relative z-10 flex items-center justify-center gap-2 text-sm md:text-lg">
                    {selectedUsers.size > 0 ? `LAUNCH CHOCOLAT (${selectedUsers.size})` : 'SELECT TARGET'} 🚀
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔄 ランキングエリア */}
        <div className="mb-12 animate-fade-in-up relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#ffd700]/5 to-transparent blur-3xl -z-10 rounded-full opacity-20"></div>
          
          <div className="transform origin-top">
            <h2 className="text-center text-[#ffd700] font-bold text-xs tracking-[0.4em] mb-10 flex items-center justify-center gap-4 opacity-80">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#ffd700]"></span>
              GALAXY RANKING
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#ffd700]"></span>
            </h2>
            
            <div className="px-2">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                 <div className="w-full md:w-1/2 flex flex-col gap-3">
                    <div className="text-center text-[#ffd700]/60 text-[10px] tracking-widest mb-1 font-mono">/// TOP SQUADRON ///</div>
                    {Array.from({ length: 5 }).map((_, i) => {
                       const ranker = rankingList[i];
                       return ranker ? <UserCard key={ranker.id} profile={ranker} index={i} isRanking={true} /> : <EmptyCard key={`empty-${i}`} index={i} />;
                    })}
                 </div>
                 
                 <div className="w-full md:w-1/2 flex flex-col gap-3">
                    <div className="text-center text-white/30 text-[10px] tracking-widest mb-1 font-mono">/// RISING STARS ///</div>
                    {Array.from({ length: 5 }).map((_, i) => {
                       const rankIndex = i + 5;
                       const ranker = rankingList[rankIndex];
                       return ranker ? <UserCard key={ranker.id} profile={ranker} index={rankIndex} isRanking={true} /> : <EmptyCard key={`empty-${rankIndex}`} index={rankIndex} />;
                    })}
                 </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      {user && <p className="text-center text-[9px] text-white/10 mt-8 font-mono tracking-widest absolute bottom-2 left-0 right-0 pointer-events-none">VOICE NOVA × COSMIC CHOCOLAT SYSTEM v2.1</p>}
    </main>
  );
}