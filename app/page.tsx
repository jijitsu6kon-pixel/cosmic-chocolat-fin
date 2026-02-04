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
// 🎨 デザインシステム & 演出コンポーネント
// ==========================================

// 🌌 背景: 星空 + うごめく星雲 (Aurora)
const CosmicBackground = () => {
  const [stars, setStars] = useState('');
  
  useEffect(() => {
    let value = '';
    for (let i = 0; i < 300; i++) {
      const x = Math.floor(Math.random() * 3000);
      const y = Math.floor(Math.random() * 2000);
      const size = Math.random() * 2;
      const opacity = Math.random();
      value += `${x}px ${y}px 0px ${size}px rgba(255, 255, 255, ${opacity}), `;
    }
    setStars(value.slice(0, -2));
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#030014]">
      {/* うごめく星雲 */}
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-aurora opacity-30 blur-[100px] bg-gradient-to-r from-[#4f46e5] via-[#ff00ff] to-[#4f46e5]"></div>
      
      {/* 星屑 */}
      <div className="absolute inset-0 animate-twinkle" style={{ boxShadow: stars }}></div>
      
      {/* 走査線ノイズ */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

      <style jsx>{`
        @keyframes aurora {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.8; transform: translateY(0); }
          50% { opacity: 0.4; transform: translateY(-20px); }
        }
        .animate-aurora { animation: aurora 60s linear infinite; }
        .animate-twinkle { animation: twinkle 10s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

// 🔮 マウスに追従するスポットライト効果
const SpotlightEffect = () => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (divRef.current) {
        divRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(255,215,0,0.06), transparent 40%)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return <div ref={divRef} className="fixed inset-0 z-[1] pointer-events-none transition duration-300"></div>;
};

// 🚀 ロケット演出
const RocketLayer = ({ isActive, onComplete }: { isActive: boolean, onComplete: () => void }) => {
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(onComplete, 2500);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);
  if (!isActive) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden flex items-end justify-center backdrop-blur-sm bg-black/20 transition-all duration-500">
      <style jsx>{` @keyframes flyUp { 0% { transform: translateY(100vh) scale(0.5); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-120vh) scale(1.5); opacity: 0; } } `}</style>
      <div className="text-8xl animate-[flyUp_2s_ease-in-out_forwards] drop-shadow-[0_0_50px_rgba(255,51,102,1)] filter brightness-150">🚀</div>
      <div className="absolute text-5xl animate-[flyUp_2.2s_ease-in-out_forwards] left-[35%] drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]" style={{ animationDelay: '0.1s' }}>🍫</div>
      <div className="absolute text-5xl animate-[flyUp_2.1s_ease-in-out_forwards] right-[35%] drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]" style={{ animationDelay: '0.2s' }}>🍫</div>
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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#030014]">
        <CosmicBackground />
        <div className="text-center relative z-10 p-12 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_0_100px_rgba(79,70,229,0.3)] animate-pulse">
          <div className="text-6xl mb-4 animate-bounce">🛸</div>
          <h1 className="text-4xl font-black tracking-[0.5em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">LOADING</h1>
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
      if (profile.avatar_url !== avatar) await supabase.from('profiles').update({ avatar_url: avatar }).eq('id', user.id);
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
    // 🛠️ 修正: 依存配列にfetch関数を追加してWarningを解消
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
    if (detailInfo && isCooldown(detailInfo.last_received_at)) return alert("15分休憩しましょう！");
    handleToggleSelect(targetId);
  };
  const handleSend = async () => {
    if (!user || selectedUsers.size === 0) return;
    setIsRocketFlying(true); 
    const meteorConfig = appConfig.lucky_meteor_config || { enabled: false, probability: 0, multiplier: 1 };
    const isLucky = meteorConfig.enabled && Math.random() < meteorConfig.probability;
    const quantity = isLucky ? meteorConfig.multiplier : 1;
    if (isLucky) setTimeout(() => alert(`☄️ LUCKY METEOR!!\n奇跡が起きました！\n${quantity}倍のチョコが降り注ぎます！`), 500);
    else setTimeout(() => alert(`💝 ${selectedUsers.size}人のクルーメイトにチョコを贈りました！`), 500);
    const targets = Array.from(selectedUsers);
    setSelectedUsers(new Set()); 
    const updates = targets.map(rid => ({ sender_id: user.id, receiver_id: rid, quantity: quantity }));
    await supabase.from('chocolates').insert(updates);
    fetchRanking(); fetchUserData();
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
  // 🎨 パーツ: ホログラフィック・カード
  // ----------------------------------------
  const filteredMembers = memberList.filter(m => m.display_name.toLowerCase().includes(searchText.toLowerCase()));

  const UserCard = ({ profile, index = -1, isRanking = false }: { profile: Profile, index?: number, isRanking?: boolean }) => {
    const isSelected = selectedUsers.has(profile.id);
    const isMe = user && profile.id === user.id;
    const detail = memberList.find(m => m.id === profile.id); 
    const cooldown = isCooldown(detail?.last_received_at);
    const avatar = profile.avatar_url || "https://www.gravatar.com/avatar?d=mp";

    // ランクごとの色定義
    const rankColors = ["border-[#ffd700] bg-[#ffd700]/10", "border-[#c0c0c0] bg-[#c0c0c0]/10", "border-[#cd7f32] bg-[#cd7f32]/10", "border-white/10 bg-white/5"];
    const cardStyle = isRanking ? (rankColors[index] || rankColors[3]) : rankColors[3];

    return (
      <div 
        onClick={() => !isMe && !cooldown && handleClickUser(profile.id)}
        className={`
          relative flex items-center justify-between p-4 mb-3 rounded-2xl transition-all duration-500 border backdrop-blur-md overflow-hidden group h-[104px]
          ${cardStyle}
          ${isMe ? 'opacity-60 cursor-default' : 'cursor-pointer hover:border-white/40 hover:bg-white/10 hover:scale-[1.02]'}
          ${!isMe && cooldown ? 'grayscale opacity-40 cursor-not-allowed' : ''}
          ${isSelected ? 'border-[#ff3366] bg-[#ff3366]/20 shadow-[0_0_30px_rgba(255,51,102,0.4)]' : ''}
        `}
      >
        {!isMe && !cooldown && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>}
        
        <div className="flex items-center gap-4 w-full relative z-10">
          <div className="flex-shrink-0 w-10 text-center font-black text-xl italic tracking-tighter">
            {isRanking ? (
              <span className={`drop-shadow-glow ${index === 0 ? 'text-[#ffd700] text-3xl' : 'text-white/80'}`}>{index + 1}</span>
            ) : (
               <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#ff3366] border-[#ff3366]' : 'border-white/30'}`}>
                 {isSelected && <span className="text-white font-bold text-xs">✓</span>}
               </div>
            )}
          </div>
          
          <div className="relative group-hover:scale-110 transition-transform duration-500">
             <div className={`absolute -inset-1 rounded-full blur opacity-40 ${isRanking && index < 3 ? 'bg-gradient-to-r from-yellow-400 to-pink-600' : 'bg-blue-600'}`}></div>
             {/* 🛠️ 修正: alt属性を追加 */}
             <img src={avatar} alt="User Avatar" className="relative w-12 h-12 rounded-full border border-white/50 object-cover" />
          </div>

          <div className="flex-1 overflow-hidden">
            <p className="font-bold text-base truncate text-white/90 drop-shadow-md">
              {profile.display_name} {isMe && <span className="text-[10px] ml-1 text-cyan-300 border border-cyan-500/50 px-1 rounded tracking-wider">YOU</span>}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-white/10 bg-black/20">
                <span className="text-xs">🍫</span>
                <span className={`text-sm font-mono font-bold ${isSelected ? 'text-[#ff3366]' : 'text-[#ffd700]'}`}>{profile.received_count.toLocaleString()}</span>
              </div>
              {cooldown && !isMe && <span className="text-[10px] text-[#ff3366] font-mono animate-pulse">RECHARGING...</span>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // 📐 メインレイアウト
  // ==========================================
  return (
    <main className="min-h-screen text-[#e6e6fa] font-sans relative overflow-x-hidden selection:bg-[#ff3366] selection:text-white">
      <CosmicBackground />
      <SpotlightEffect />
      <RocketLayer isActive={isRocketFlying} onComplete={() => setIsRocketFlying(false)} />
      
      {/* ログパネル (スライドイン) */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-[#0a0a20]/90 backdrop-blur-2xl border-l border-white/10 z-[90] transform transition-transform duration-500 ease-out shadow-2xl ${isLogOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-cyan-400 font-bold tracking-[0.2em] text-xs flex items-center gap-2"><span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span> SIGNAL LOG</h3>
          <button onClick={() => setIsLogOpen(false)} className="text-white/50 hover:text-white text-2xl transition-colors">×</button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 h-[calc(100%-60px)]">
          {activityLogs.map((log) => (
            <div key={log.id} className="bg-white/5 p-3 rounded-lg border border-white/5 text-xs hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-2 opacity-70">
                <span className="font-mono text-[10px]">{new Date(log.created_at).toLocaleTimeString('ja-JP')}</span>
                {log.quantity > 1 && <span className="text-[#ffd700] font-bold">☄️ x{log.quantity}</span>}
              </div>
              <div className="flex items-center gap-2">
                {/* 🛠️ 修正: alt属性を追加 */}
                <img src={log.sender_avatar || 'https://www.gravatar.com/avatar?d=mp'} alt="Sender" className="w-5 h-5 rounded-full" />
                <span className="text-cyan-300 font-bold truncate max-w-[70px]">{log.sender_name}</span>
                <span className="text-white/30">➜</span>
                <img src={log.receiver_avatar || 'https://www.gravatar.com/avatar?d=mp'} alt="Receiver" className="w-5 h-5 rounded-full" />
                <span className="text-pink-300 font-bold truncate max-w-[70px]">{log.receiver_name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => setIsLogOpen(true)} className="fixed top-6 right-0 z-50 bg-white/5 border-l border-y border-white/20 text-cyan-400 p-3 pl-4 rounded-l-full backdrop-blur-md hover:bg-cyan-400 hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.2)] group">
        <span className="font-mono text-xs font-bold tracking-widest group-hover:hidden">LOG</span>
        <span className="hidden group-hover:inline text-xs font-bold">OPEN</span>
      </button>

      <div className="w-full max-w-3xl mx-auto relative z-10 pb-20 pt-16 px-4">
        
        {/* 🏆 タイトルエリア */}
        <div className="text-center mb-12">
          <div className="inline-block relative group cursor-default">
            <div className="absolute -inset-10 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-20 blur-3xl group-hover:opacity-40 transition duration-1000"></div>
            <h1 className="text-5xl md:text-7xl font-black tracking-[0.1em] mb-2 relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">COSMIC</span><br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff3366] via-[#ff00ff] to-[#ff3366] animate-gradient bg-[length:200%_auto] drop-shadow-[0_0_20px_rgba(255,0,255,0.5)]">CHOCOLAT</span>
            </h1>
          </div>
          <div className="mt-6 inline-flex items-center gap-4 px-6 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] text-cyan-400 tracking-[0.3em] uppercase">Total Gifted</span>
            <span className="text-2xl font-mono font-bold text-white text-shadow-glow">{totalChocolates.toLocaleString()}</span>
          </div>
        </div>

        {/* 🎮 コックピット (操作エリア) */}
        {!user ? (
          <div className="text-center mb-20 animate-fade-in-up">
            <p className="mb-8 text-sm text-cyan-100/70 tracking-widest leading-loose font-light">
              これよりボイスノヴァ宙域へ進入します。<br/>クルーIDを確認してください。
            </p>
            <button onClick={signIn} className="relative group inline-flex items-center justify-center px-16 py-5 overflow-hidden font-bold text-white rounded-full transition-all duration-300 bg-[#5865F2] hover:scale-105 hover:shadow-[0_0_40px_rgba(88,101,242,0.6)]">
               <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
               <span className="relative flex items-center gap-3">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.6853-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0323 1.5864 4.0079 2.5543 5.9429 3.1686a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 00.0306-.0557c3.9437 1.8038 8.1798 1.8038 12.0583 0a.0739.0739 0 00.0305.0557c.1202.099.246.1981.3719.2914a.077.077 0 01-.0077.1277c-.5979.3428-1.2194.6447-1.8721.8923a.0756.0756 0 00-.0416.1057c.3529.699.7644 1.3638 1.226 1.9942a.0773.0773 0 00.0842.0276c1.9349-.6143 3.9106-1.5822 5.9429-3.1686a.0824.0824 0 00.0312-.0561c.493-5.4786-.6425-9.998-3.0808-13.6603a.0718.0718 0 00-.032-.0277zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z"/></svg>
                 DISCORD AUTHENTICATION
               </span>
            </button>
          </div>
        ) : (
          <div className="animate-fade-in-up space-y-8 mb-24">
            <div className="bg-black/40 p-1 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              
              {/* スターログ・パネル */}
              <div className="bg-[#0f0f2d]/80 rounded-[20px] p-6 text-center border border-white/5 relative z-10">
                 <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                   <div className="text-left">
                     <p className="text-[10px] text-cyan-400/70 uppercase tracking-widest mb-1">CURRENT RANK</p>
                     <p className="text-xl font-bold text-white drop-shadow-glow">{myRankTitle}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] text-pink-400/70 uppercase tracking-widest mb-1">TOTAL SENT</p>
                     <p className="text-3xl font-black font-mono text-pink-500">{myTotalSent}</p>
                   </div>
                 </div>

                 <div className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/10">
                   <input type="text" className="flex-1 bg-transparent font-bold text-lg text-center text-white focus:outline-none placeholder-white/20" value={myProfileName} onChange={(e) => setMyProfileName(e.target.value)} />
                   <button onClick={handleUpdateName} className="text-[10px] font-bold bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors">{isActionLoading ? '...' : 'UPDATE'}</button>
                 </div>
                 <button onClick={signOut} className="text-[10px] text-white/30 hover:text-white mt-3 underline decoration-dotted transition-colors">ABORT SESSION (LOGOUT)</button>
              </div>
            </div>

            {/* キャスト選択エリア */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xs font-bold text-cyan-300 tracking-[0.3em] flex items-center gap-2"><span className="animate-pulse">●</span> TARGET SELECTION</h2>
                {selectedUsers.size > 0 && <span className="bg-[#ff3366] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-[0_0_15px_#ff3366] animate-bounce">{selectedUsers.size} SELECTED</span>}
              </div>
              
              <div className="relative group">
                <input type="text" placeholder="SEARCH CREWMATE..." className="w-full px-6 py-4 rounded-xl bg-black/40 text-white placeholder-white/30 text-sm focus:outline-none border border-white/10 focus:border-cyan-500/50 focus:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-all backdrop-blur-md font-mono" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-cyan-500/50 group-focus-within:text-cyan-400">⚡</span>
              </div>
              
              <div className="custom-scrollbar px-1 max-h-[400px] overflow-y-auto space-y-2 pb-4">
                {filteredMembers.length === 0 ? <p className="text-center text-white/20 py-8 font-mono text-xs">NO SIGNAL FOUND</p> : 
                  filteredMembers.map((m) => <UserCard key={m.id} profile={m} />)
                }
              </div>
            </div>

            {/* 発射ボタン */}
            <div className="fixed bottom-8 left-0 right-0 px-6 z-50 pointer-events-none">
              <div className="max-w-xl mx-auto pointer-events-auto">
                <button onClick={handleSend} disabled={selectedUsers.size === 0} className={`w-full py-5 rounded-2xl font-black text-lg tracking-[0.2em] shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 relative overflow-hidden group border border-white/10 ${selectedUsers.size === 0 ? 'bg-gray-800/80 text-white/20 cursor-not-allowed backdrop-blur-sm' : 'bg-gradient-to-r from-[#ff3366] via-[#ff00ff] to-[#ff3366] bg-[length:200%_auto] animate-gradient text-white hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(255,0,255,0.6)]'}`}>
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    LAUNCH CHOCOLAT <span className="font-mono text-sm opacity-80">({selectedUsers.size})</span> 🚀
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🏆 ギャラクシーランキング */}
        <div className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-cyan-500 to-transparent opacity-50"></div>
          <h2 className="text-center text-cyan-300 font-bold text-xs tracking-[0.5em] mb-12 mt-8 pt-8 border-t border-white/5">
            GALAXY RANKING
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-3">
                {/* 🛠️ 修正: スラッシュをクォートで囲む */}
                <div className="text-center text-[#ffd700]/50 text-[10px] tracking-widest mb-2 font-mono">{'/// TOP SQUADRON ///'}</div>
                {Array.from({ length: 5 }).map((_, i) => {
                   const ranker = rankingList[i];
                   return ranker ? <UserCard key={ranker.id} profile={ranker} index={i} isRanking={true} /> : <div key={i} className="h-[104px] rounded-2xl border border-white/5 bg-white/5 animate-pulse"></div>;
                })}
             </div>
             <div className="space-y-3">
                {/* 🛠️ 修正: スラッシュをクォートで囲む */}
                <div className="text-center text-white/30 text-[10px] tracking-widest mb-2 font-mono">{'/// RISING STARS ///'}</div>
                {Array.from({ length: 5 }).map((_, i) => {
                   const rankIndex = i + 5;
                   const ranker = rankingList[rankIndex];
                   return ranker ? <UserCard key={ranker.id} profile={ranker} index={rankIndex} isRanking={true} /> : <div key={rankIndex} className="h-[104px] rounded-2xl border border-white/5 bg-white/5 opacity-50"></div>;
                })}
             </div>
          </div>
        </div>

      </div>
      <p className="text-center text-[10px] text-white/20 mt-12 pb-8 font-mono tracking-widest">VOICE NOVA SYSTEM // TERMINAL v2.0</p>
    </main>
  );
}