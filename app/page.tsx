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
// 🌠 星空生成コンポーネント
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
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-[#050510]">
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
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(26, 16, 51, 0.5); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 215, 0, 0.3); border-radius: 4px; }
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
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden flex items-end justify-center">
      <style jsx>{` @keyframes flyUp { 0% { transform: translateY(100vh) scale(0.5); opacity: 1; } 50% { transform: translateY(-50vh) scale(1.2); } 100% { transform: translateY(-150vh) scale(0.5); opacity: 0; } } `}</style>
      <div className="text-6xl animate-[flyUp_1.5s_ease-in_forwards] drop-shadow-[0_0_20px_rgba(255,51,102,0.8)]">🚀</div>
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
      <div className={`fixed inset-0 bg-black/50 z-[80] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
      <div className={`fixed top-0 right-0 h-full w-80 bg-[#1a1033]/95 backdrop-blur-xl border-l border-[#ffd700]/30 z-[90] transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-[#ffd700]/20 flex justify-between items-center">
          <h3 className="text-[#ffd700] font-bold tracking-widest flex items-center gap-2"><span className="animate-pulse">📡</span> LOG RECORD</h3>
          <button onClick={onClose} className="text-[#e6e6fa] hover:text-[#ff3366] text-xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {logs.length === 0 ? <p className="text-center text-[#e6e6fa]/30 text-xs">通信ログなし</p> : logs.map((log) => (
            <div key={log.id} className="bg-[#0a0e1a]/50 p-3 rounded-lg border border-[#e6e6fa]/10 text-sm">
              <div className="flex items-center gap-2 mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={log.sender_avatar || 'https://www.gravatar.com/avatar?d=mp'} alt="sender" className="w-6 h-6 rounded-full border border-[#ffd700]/30" />
                <span className="text-[#ffd700] font-bold text-xs truncate max-w-[80px]">{log.sender_name}</span>
                <span className="text-[#e6e6fa]/50 text-[10px]">▶</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={log.receiver_avatar || 'https://www.gravatar.com/avatar?d=mp'} alt="receiver" className="w-6 h-6 rounded-full border border-[#ff3366]/30" />
                <span className="text-[#e6e6fa] font-bold text-xs truncate max-w-[80px]">{log.receiver_name}</span>
              </div>
              <p className="text-[#e6e6fa]/80 text-xs text-center bg-[#1a1033] py-1 rounded border border-[#ffd700]/10">
                {log.quantity > 1 ? `☄️ ラッキーメテオ！ ${log.quantity}個` : `💝 チョコを1個`} 贈りました
              </p>
              <p className="text-right text-[10px] text-[#e6e6fa]/30 mt-1">{new Date(log.created_at).toLocaleTimeString('ja-JP')}</p>
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1033]/40 via-[#0a0e1a]/60 to-black/80 z-0"></div>
        <div className="text-center relative z-10">
          <div className="relative w-24 h-24 mx-auto mb-8 animate-bounce"><span className="text-6xl">🛸</span></div>
          <h1 className="text-3xl font-black tracking-[0.3em] mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#e6e6fa] via-[#ffd700] to-[#e6e6fa]">COSMIC CHOCOLAT</h1>
          <p className="text-xs text-[#ffd700] tracking-[0.5em] animate-pulse">システム起動中...</p>
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
  const [inputName, setInputName] = useState(''); 
  const [myAvatarUrl, setMyAvatarUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false); // 編集モード

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

  const fetchUserData = useCallback(async (skipNameUpdate = false) => {
    if (!user) return;
    let name = user.user_metadata.full_name || 'クルー';
    let avatar = user.user_metadata.avatar_url || 'https://www.gravatar.com/avatar?d=mp';

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (profile) { 
      name = profile.display_name; 
      if (profile.avatar_url) avatar = profile.avatar_url;
      else if (user.user_metadata.avatar_url) {
         await supabase.from('profiles').update({ avatar_url: user.user_metadata.avatar_url }).eq('id', user.id);
      }
    } else { 
      await supabase.from('profiles').insert({ id: user.id, display_name: name, avatar_url: avatar }); 
    }
    
    if (isMounted.current) {
        if (!skipNameUpdate) {
          setMyProfileName(name);
          setInputName(name); 
        }
        setMyAvatarUrl(avatar);
    }

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
    return () => { isMounted.current = false; };
  }, [user, fetchConfig, fetchLogs, fetchRanking, fetchUserData]);

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
    fetchUserData(true);
  };

  const handleUpdateName = async () => {
    if (!user || !inputName.trim()) return;
    setIsActionLoading(true);
    await supabase.from('profiles').update({ display_name: inputName }).eq('id', user.id);
    setMyProfileName(inputName);
    setIsEditing(false); // 更新完了で編集モード終了
    setTimeout(() => setIsActionLoading(false), 500);
  };
  const signIn = () => supabase.auth.signInWithOAuth({ provider: 'discord', options: { queryParams: { prompt: 'consent' } } });
  const signOut = async () => { await supabase.auth.signOut(); };

  // 🆕 文字サイズ調整関数
  const getNameSize = (name: string) => {
    if (name.length > 20) return 'text-xs';
    if (name.length > 10) return 'text-sm';
    return 'text-xl';
  };

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

  const EmptyCard = ({ index }: { index: number }) => (
    <div className="relative flex items-center justify-between p-4 mb-3 rounded-2xl border-2 border-dashed border-[#e6e6fa]/10 bg-[#1a1033]/20 select-none h-[96px]">
       <div className="flex items-center gap-4 w-full opacity-30">
          <div className="w-8 text-center font-black text-xl text-[#8d6e63]">{index + 1}</div>
          <div className="flex-1"><p className="font-bold text-base text-[#e6e6fa] tracking-widest text-xs">データなし</p></div>
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
        onClick={() => handleClickUser(profile.id)}
        className={`
          relative flex items-center justify-between p-3 mb-2 rounded-xl transition-all duration-500 border select-none backdrop-blur-md overflow-hidden group
          ${isRanking ? 'h-[96px] mb-3 p-4 rounded-2xl' : 'h-[80px]'}
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
        <div className="flex items-center gap-3 overflow-hidden w-full relative z-10">
          <div className="flex-shrink-0 w-6 text-center flex justify-center items-center">
            {isRanking ? <RankBadge index={index} /> : (
               <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#ffd700] border-[#ffd700] shadow-[0_0_10px_#ffd700]' : 'border-white/20 group-hover:border-[#ffd700]/50'}`}>
                 {isSelected && <span className="text-[#1a1033] font-bold text-[10px]">✓</span>}
               </div>
            )}
          </div>
          
          <div className="flex-shrink-0">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={avatar} alt="icon" className={`${isRanking ? 'w-12 h-12' : 'w-10 h-10'} rounded-full border-2 border-[#e6e6fa]/20 object-cover shadow-lg`} />
          </div>

          <div className="flex-1 overflow-hidden">
            <p className={`font-bold ${isRanking ? 'text-base' : 'text-sm'} truncate transition-colors ${isSelected ? 'text-[#1a1033]' : 'text-[#e6e6fa]'} ${isMe ? 'opacity-80' : ''}`}>
              {profile.display_name} {isMe && <span className="text-[10px] font-normal ml-1 text-[#ffd700] border border-[#ffd700]/30 px-1 rounded">(あなた)</span>}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border ${isSelected ? 'bg-[#1a1033]/20 border-[#1a1033]/30' : 'bg-[#ffd700]/10 border-[#ffd700]/30'}`}>
                <span className="text-[10px]">🍫</span>
                <span className={`text-xs font-black ${isSelected ? 'text-[#1a1033]' : 'text-[#ffd700]'}`}>{profile.received_count}</span>
              </div>
              {cooldown && !isMe && (
                <span className="text-[9px] text-[#ff3366] font-mono tracking-wider flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-[#ff3366] rounded-full animate-ping"></span>あと15分
                </span>
              )}
            </div>
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
        className="fixed top-24 right-0 z-50 bg-[#1a1033]/80 border-l border-t border-b border-[#ffd700]/30 text-[#ffd700] p-3 rounded-l-xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:bg-[#1a1033] hover:pl-5 transition-all duration-300 group"
      >
        <span className="text-xl group-hover:animate-ping">📡</span>
        <span className="hidden group-hover:inline ml-2 text-xs font-bold tracking-widest">LOG</span>
      </button>

      <StarBackground />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1033]/30 via-[#0a0e1a]/80 to-black z-0"></div>
      
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#ffd700]/5 via-[#ff3366]/5 to-transparent z-0 pointer-events-none blur-3xl"></div>

      <div className="w-full max-w-4xl relative z-10 pb-20">
        <div className="text-center mb-6 pt-12">
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

        {!user ? (
          <div className="text-center px-4 pb-12 animate-fade-in-up relative z-20">
            <p className="mb-10 text-base text-[#e6e6fa]/80 leading-8 font-serif italic drop-shadow-md">
              銀河の彼方へ、想いを乗せて。<br/>クルーとしてログインし、<br/>仲間にショコラを届けよう。
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
          <div className="animate-fade-in-up space-y-8 relative z-20 w-full max-w-4xl mx-auto mb-20">
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
              
              {/* Star Log (名刺サイズ) */}
              <div className="w-full md:w-5/12 bg-[#1a1033]/60 p-6 rounded-2xl border border-[#ffd700]/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-center min-h-[220px] shadow-[0_0_30px_rgba(26,16,51,0.5)]">
                 <div className="absolute inset-0 bg-gradient-to-br from-[#ffd700]/10 via-transparent to-[#ff3366]/10 opacity-50 pointer-events-none"></div>
                 
                 {/* 上部: アイコンと名前（編集機能付き） */}
                 <div className="relative z-10 flex items-center gap-4 mb-4">
                   <div className="relative">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={myAvatarUrl} alt="my icon" className="w-16 h-16 rounded-full border-2 border-[#ffd700] shadow-lg object-cover" />
                   </div>
                   <div className="flex-1">
                     <p className="text-[10px] text-[#e6e6fa]/60 uppercase tracking-widest mb-1">CREW NAME</p>
                     
                     {/* 🆕 名前表示 / 編集モードの切り替え */}
                     <div className={`flex items-center gap-2 rounded-xl p-1.5 transition-colors border ${isEditing ? 'bg-black/40 border-[#ff3366]/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                        {isEditing ? (
                          <input 
                            autoFocus
                            type="text" 
                            className={`flex-1 bg-transparent outline-none text-white font-bold ${getNameSize(inputName)}`}
                            value={inputName} 
                            onChange={(e) => setInputName(e.target.value)} 
                          />
                        ) : (
                          <span className={`flex-1 text-[#e6e6fa] font-bold truncate ${getNameSize(myProfileName)}`}>{myProfileName}</span>
                        )}
                        
                        <button 
                          onClick={() => isEditing ? handleUpdateName() : setIsEditing(true)} 
                          disabled={isActionLoading}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a1033] hover:bg-[#2a2040] text-[#ffd700] transition-all"
                        >
                          {isActionLoading ? '...' : isEditing ? '🔄' : '✏️'}
                        </button>
                     </div>
                   </div>
                 </div>

                 {/* 下部: ステータスと合計数 */}
                 <div className="relative z-10 border-t border-[#ffd700]/20 pt-4 flex justify-between items-end">
                   {/* 🆕 ランクをここに移動 */}
                   <div>
                     <p className="text-[10px] text-[#e6e6fa]/60 uppercase tracking-widest mb-1">RANK</p>
                     <p className="text-sm font-bold text-[#ffd700] bg-[#ffd700]/10 px-2 py-1 rounded border border-[#ffd700]/30">{myRankTitle}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] text-[#ffd700] uppercase tracking-widest mb-1">TOTAL GIFTED</p>
                     <p className="text-3xl font-black text-[#ffd700]">{myTotalSent}</p>
                   </div>
                 </div>
                 <button onClick={signOut} className="absolute bottom-2 left-6 text-[9px] text-[#e6e6fa]/40 hover:text-[#ff3366] transition-colors underline decoration-dotted">LOGOUT</button>
              </div>

              {/* Right: Search Only (PC版ではここに検索のみ配置) */}
              <div className="w-full md:w-7/12 flex flex-col justify-center">
                 <div className="relative w-full h-full bg-[#1a1033]/60 rounded-2xl border border-[#ffd700]/30 p-6 flex flex-col justify-center">
                    <h3 className="text-[#ffd700] font-bold text-sm tracking-[0.2em] mb-4 flex items-center gap-2">
                      <span className="text-lg">🔍</span> SEARCH CREWMATES
                    </h3>
                    <div className="relative">
                      <input type="text" placeholder="クルーメイトを検索..." className="w-full px-5 py-4 rounded-xl bg-[#0a0e1a]/50 text-[#e6e6fa] placeholder-[#e6e6fa]/30 text-sm focus:outline-none border border-[#ffd700]/20 focus:border-[#ffd700]/80 transition-all backdrop-blur-md" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#ffd700]/50">⚡</span>
                    </div>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 pb-4">
              {filteredMembers.length === 0 ? <p className="col-span-full text-center text-[#e6e6fa]/40 py-12 text-xs tracking-widest">クルーメイトが見つかりません</p> : 
                filteredMembers.map((m) => <UserCard key={m.id} profile={m} />)
              }
            </div>

            <div className="fixed bottom-6 left-0 right-0 px-6 z-50 pointer-events-none">
              <div className="max-w-lg mx-auto pointer-events-auto">
                <button onClick={handleSend} disabled={selectedUsers.size === 0} className={`w-full py-6 rounded-3xl font-black text-lg tracking-[0.2em] shadow-2xl transition-all relative overflow-hidden group border-2 ${selectedUsers.size === 0 ? 'bg-[#1a1033]/90 border-white/5 text-[#e6e6fa]/30 backdrop-blur-sm cursor-not-allowed translate-y-20 opacity-0' : 'bg-gradient-to-r from-[#ff3366] via-[#ffd700] to-[#ff3366] bg-[length:200%_auto] animate-gradient border-[#ffd700] text-[#1a1033] hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_30px_rgba(255,51,102,0.8)]'}`}>
                  <span className="relative z-10 flex items-center justify-center gap-2">チョコを贈る ({selectedUsers.size}) 🚀</span>
                  {selectedUsers.size > 0 && <div className="absolute inset-0 bg-white/40 mix-blend-overlay translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-12 animate-fade-in-up relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#ffd700]/5 to-transparent blur-xl -z-10 rounded-full"></div>
          
          <div className="origin-top">
            <h2 className="text-center text-[#ffd700] font-bold text-sm tracking-[0.4em] mb-8 flex items-center justify-center gap-4">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#ffd700]"></span>
              GALAXY RANKING
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#ffd700]"></span>
            </h2>
            
            <div className="px-2">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                 <div className="w-full md:w-1/2 flex flex-col gap-3">
                    <div className="hidden md:block text-center text-[#ffd700] text-xs tracking-widest mb-2 opacity-70">{'/// TOP STARS ///'}</div>
                    {Array.from({ length: 5 }).map((_, i) => {
                       const ranker = rankingList[i];
                       return ranker ? <UserCard key={ranker.id} profile={ranker} index={i} isRanking={true} /> : <EmptyCard key={`empty-${i}`} index={i} />;
                    })}
                 </div>
                 
                 <div className="w-full md:w-1/2 flex flex-col gap-3">
                    <div className="hidden md:block text-center text-[#e6e6fa] text-xs tracking-widest mb-2 opacity-50">{'/// RISING STARS ///'}</div>
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
      {user && <p className="text-center text-[10px] text-[#ffd700]/50 mt-8 font-mono tracking-widest absolute bottom-2 left-0 right-0">VOICE NOVA × COSMIC CHOCOLAT SYSTEM</p>}
    </main>
  );
}