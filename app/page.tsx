'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState, useRef, useCallback } from 'react';

// ==========================================
// ⚙️ 設定 & クライアント作成
// ==========================================
const supabaseUrl = 'https://cghuhjiwbjtvgulmldgv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnaHVoaml3Ymp0dmd1bG1sZGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODUwMzEsImV4cCI6MjA4NTQ2MTAzMX0.qW8lkhppWdRf3k-1o3t4QdR7RJCMwLW7twX37RrSDQQ';

// 競合エラーを防ぐためのオプション設定
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // ローカルストレージの読み書きの競合を防ぐ設定
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// ==========================================
// 📝 型定義
// ==========================================
type Profile = {
  id: string;
  display_name: string;
  last_received_at?: string;
  received_count: number;
};

export default function CosmicChocolat() {
  // --- State ---
  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState<string>('');
  const [totalChocolates, setTotalChocolates] = useState<number>(0);
  
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]); 
  const [rankingList, setRankingList] = useState<Profile[]>([]);
  
  const [searchText, setSearchText] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  
  const [loading, setLoading] = useState(true); 
  const [userLoading, setUserLoading] = useState(false);
  const [updatingName, setUpdatingName] = useState(false);

  const isMounted = useRef(true);

  // ==========================================
  // 🔄 データ取得ロジック
  // ==========================================

  // A. 【誰でも見れるデータ】ランキングと合計数
  const fetchPublicData = useCallback(async () => {
    try {
      const countRes = await supabase.from('chocolates').select('*', { count: 'exact', head: true });
      if (isMounted.current) setTotalChocolates(countRes.count || 0);

      const { data: profiles } = await supabase.from('profiles').select('id, display_name');
      const { data: allChocos } = await supabase.from('chocolates').select('receiver_id');

      if (profiles && allChocos) {
        const countMap: Record<string, number> = {};
        allChocos.forEach((c: any) => {
          countMap[c.receiver_id] = (countMap[c.receiver_id] || 0) + 1;
        });

        const ranked = profiles.map(p => ({
          ...p,
          received_count: countMap[p.id] || 0,
        }));

        ranked.sort((a, b) => b.received_count - a.received_count);
        if (isMounted.current) setRankingList(ranked.slice(0, 20));
      }
    } catch (e) {
      // エラーは無視
    }
  }, []);

  // B. 【ログイン者専用データ】
  const fetchUserData = useCallback(async (currentUser: any) => {
    try {
      if (!isMounted.current) return;
      
      // プロフィール確保
      let myName = currentUser.user_metadata.full_name || '劇団員';
      const { data: myProfile } = await supabase.from('profiles').select('display_name').eq('id', currentUser.id).maybeSingle();
      
      if (myProfile) {
        myName = myProfile.display_name;
      } else {
        await supabase.from('profiles').insert({ id: currentUser.id, display_name: myName });
      }
      if (isMounted.current) setProfileName(myName);

      // リスト取得
      const [profilesRes, allChocosRes, myHistoryRes] = await Promise.all([
        supabase.from('profiles').select('id, display_name').neq('id', currentUser.id),
        supabase.from('chocolates').select('receiver_id'),
        supabase.from('chocolates').select('receiver_id, created_at').eq('sender_id', currentUser.id).order('created_at', { ascending: false })
      ]);

      if (profilesRes.data) {
        const countMap: Record<string, number> = {};
        allChocosRes.data?.forEach((c: any) => { countMap[c.receiver_id] = (countMap[c.receiver_id] || 0) + 1; });

        const lastSentMap = new Map();
        myHistoryRes.data?.forEach((h: any) => {
          if (!lastSentMap.has(h.receiver_id)) lastSentMap.set(h.receiver_id, h.created_at);
        });

        const merged = profilesRes.data.map(p => ({
          ...p,
          received_count: countMap[p.id] || 0,
          last_received_at: lastSentMap.get(p.id) || null
        }));

        merged.sort((a, b) => b.received_count - a.received_count);
        if (isMounted.current) setAllProfiles(merged);
      }
    } catch (e) {
      // エラーは無視
    }
  }, []);

  // ==========================================
  // 🚀 初期化 & 監視（ここをシンプルに変更！）
  // ==========================================
  useEffect(() => {
    isMounted.current = true;

    // 1. 公開データ取得
    fetchPublicData();

    // 2. 認証監視（これ一本に絞る！）
    // getSession()を自分から呼ばないことで、locks.jsの競合エラーを回避します。
    // Supabaseは起動時に必ず INITIAL_SESSION イベントを発行するので、それを待てばOKです。
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted.current) return;

      console.log("Auth Event:", event); // デバッグ用

      const currentUser = session?.user ?? null;
      
      // ユーザー状態の更新
      setUser(currentUser);

      if (currentUser) {
        // ログイン状態ならデータ取得開始
        if (allProfiles.length === 0) setUserLoading(true);
        
        await fetchUserData(currentUser);
        
        if (isMounted.current) {
          setUserLoading(false);
          setLoading(false); // データ取得完了でロード終了
        }
      } else {
        // 未ログインなら即座にロード終了
        setLoading(false);
      }
    });

    // 3. リアルタイム更新
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chocolates' }, () => {
        if (!isMounted.current) return;
        fetchPublicData();
        if (user) fetchUserData(user);
      })
      .subscribe();

    return () => {
      isMounted.current = false;
      authListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  // ==========================================
  // 🎮 アクション
  // ==========================================

  const isCooldown = (lastDateStr?: string) => {
    if (!lastDateStr) return false;
    const diff = new Date().getTime() - new Date(lastDateStr).getTime();
    return diff / (1000 * 60) < 15;
  };

  const toggleSelectUser = (id: string) => {
    const newSet = new Set(selectedUsers);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedUsers(newSet);
  };

  const handleRankingClick = (targetId: string) => {
    if (!user) return alert("チョコを贈るにはログインしてください！");
    if (targetId === user.id) return alert("自分自身には贈れません");

    const profileWithHistory = allProfiles.find(p => p.id === targetId);
    if (profileWithHistory && isCooldown(profileWithHistory.last_received_at)) {
      return alert("この相手には15分以内に贈っています。少し休憩しましょう！");
    }
    toggleSelectUser(targetId);
  };

  const sendBatchChocolates = async () => {
    if (selectedUsers.size === 0 || !user) return;
    
    const updates = Array.from(selectedUsers).map(receiverId => ({
      sender_id: user.id,
      receiver_id: receiverId
    }));

    const { error } = await supabase.from('chocolates').insert(updates);

    if (error) {
      alert('エラー：送信できませんでした（15分ルールなどを確認してください）');
    } else {
      alert(`💝 ${selectedUsers.size}人にチョコを贈りました！`);
      setSelectedUsers(new Set());
      fetchPublicData();
      fetchUserData(user);
    }
  };

  const handleUpdateName = async () => {
    if (!user || !profileName.trim()) return;
    setUpdatingName(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, display_name: profileName });

      if (error) throw error;
      setTimeout(() => { if (isMounted.current) setUpdatingName(false); }, 500);

    } catch (e) {
      alert('保存に失敗しました。');
      setUpdatingName(false);
    }
  };

  const signIn = () => supabase.auth.signInWithOAuth({ provider: 'discord', options: { queryParams: { prompt: 'consent' } } });
  
  const signOut = async () => { 
    await supabase.auth.signOut(); 
    if (isMounted.current) { 
      setUser(null); 
      setProfileName(''); 
      setSelectedUsers(new Set()); 
      setAllProfiles([]);
    } 
  };

  const filteredProfiles = allProfiles.filter(p => 
    p.display_name.toLowerCase().includes(searchText.toLowerCase())
  );

  const getRankStyle = (index: number) => {
    if (index === 0) return "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] scale-125"; 
    if (index === 1) return "text-gray-300 drop-shadow-[0_0_5px_rgba(209,213,219,0.5)] scale-110"; 
    if (index === 2) return "text-orange-400 drop-shadow-[0_0_5px_rgba(251,146,60,0.5)] scale-105"; 
    return "text-[#8d6e63] opacity-70";
  };

  const CardItem = ({ profile, index = -1, isRanking = false }: { profile: Profile, index?: number, isRanking?: boolean }) => {
    const isSelected = selectedUsers.has(profile.id);
    const isMe = user && profile.id === user.id;
    const profileWithHistory = allProfiles.find(p => p.id === profile.id);
    const cooldown = isCooldown(profileWithHistory?.last_received_at);

    const handleClick = () => {
      if (isMe) return;
      if (cooldown) return alert("この相手には15分以内に贈っています。少し休憩しましょう！");
      if (isRanking) handleRankingClick(profile.id);
      else toggleSelectUser(profile.id);
    };

    return (
      <div 
        onClick={handleClick}
        className={`
          relative flex items-center justify-between p-4 mb-3 rounded-2xl transition-all duration-300 border-2 select-none
          ${isMe ? 'bg-[#3e2723]/20 border-[#5d4037]/20 cursor-default' : 'cursor-pointer'}
          ${!isMe && cooldown ? 'opacity-50 grayscale cursor-not-allowed bg-[#0a0403] border-transparent' : ''}
          ${!isMe && !cooldown && isSelected 
            ? 'bg-gradient-to-r from-[#9f1239] to-[#be123c] border-[#be123c] shadow-[0_5px_15px_rgba(190,18,60,0.4)] transform scale-[1.02]' 
            : !isMe && !cooldown 
              ? 'bg-[#2b120a] border-[#3e2723]/50 hover:border-[#8d6e63] hover:bg-[#3e2723]/80' 
              : ''
          }
        `}
      >
        <div className="flex items-center gap-4 overflow-hidden w-full">
          <div className="flex-shrink-0 w-8 text-center flex justify-center">
            {isRanking ? (
              <span className={`font-black text-xl ${getRankStyle(index)}`}>{index + 1}</span>
            ) : (
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-white border-white' : 'border-[#5d4037]'}`}>
                {isSelected && <span className="text-[#be123c] font-bold text-xs">✓</span>}
              </div>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className={`font-bold text-base truncate ${isSelected ? 'text-white' : 'text-[#eaddcf]'} ${isMe ? 'opacity-50' : ''}`}>
              {profile.display_name} {isMe && <span className="text-xs opacity-50 ml-1">(You)</span>}
            </p>
            {isRanking && !isMe && !cooldown && <p className="text-[10px] text-[#8d6e63] mt-0.5 opacity-70">{profile.received_count} Chocolates</p>}
            {cooldown && !isMe && <p className="text-[10px] text-[#ef4444] font-mono tracking-wider mt-1">WAIT 15 MIN</p>}
            {isSelected && <p className="text-[10px] text-white/80 font-mono tracking-wider mt-1">Ready to send!</p>}
          </div>
          <div className="flex-shrink-0">
            {isMe ? (
              <span className="text-xs bg-[#3e2723] text-[#8d6e63] px-3 py-1 rounded-full border border-[#5d4037]">YOU</span>
            ) : cooldown ? (
              <span className="text-xs bg-[#2b120a] text-[#5d4037] px-3 py-1 rounded-full">REST</span>
            ) : isSelected ? (
              <span className="text-xs bg-white text-[#be123c] font-bold px-3 py-1 rounded-full shadow-sm animate-pulse">✅ 選択中</span>
            ) : (
              <span className={`text-xs px-3 py-1 rounded-full border transition-all ${isRanking ? 'bg-[#be123c] text-white border-[#be123c] shadow-md hover:bg-[#9f1239]' : 'bg-transparent text-[#be123c] border-[#be123c] group-hover:bg-[#be123c] group-hover:text-white'}`}>
                🎁 贈る
              </span>
            )}
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
          <div className="inline-block mb-4">
            <h1 className="text-4xl font-extrabold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#d7ccc8] via-[#eaddcf] to-[#d7ccc8] drop-shadow-sm">
              COSMIC<br/><span className="text-5xl text-[#be123c] drop-shadow-[0_2px_10px_rgba(190,18,60,0.5)]">CHOCOLAT</span>
            </h1>
          </div>
          <p className="text-[10px] text-[#8d6e63] tracking-[0.4em] font-medium uppercase mb-6">Voice Nova Edition</p>
          <div className="bg-gradient-to-b from-[#3e2723] to-[#2b120a] p-px rounded-xl shadow-xl mx-auto max-w-xs">
            <div className="bg-[#1a0805] rounded-[11px] p-4 text-center border border-[#5d4037]/30">
              <p className="text-[9px] text-[#a1887f] uppercase tracking-widest mb-1">Total Gifted</p>
              <p className="text-5xl font-serif text-[#ffecb3] drop-shadow-[0_2px_8px_rgba(255,236,179,0.3)]">
                {loading && totalChocolates === 0 ? '...' : totalChocolates.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-12 animate-fade-in-up">
          <h2 className="text-center text-[#be123c] font-bold text-sm tracking-[0.3em] mb-6 flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-[#be123c]/50"></span>GALAXY RANKING<span className="h-px w-8 bg-[#be123c]/50"></span>
          </h2>
          <div className="px-2">
            {rankingList.length === 0 ? (
              <p className="text-center text-xs text-[#5d4037] py-8">{loading ? 'Loading Ranking...' : 'No data available yet'}</p>
            ) : (
              rankingList.map((ranker, index) => <CardItem key={ranker.id} profile={ranker} index={index} isRanking={true} />)
            )}
          </div>
        </div>

        {!user ? (
          <div className="text-center animate-fade-in-up px-4 pb-20">
            {loading ? <div className="py-10 animate-pulse"><p className="text-[#8d6e63] text-xs tracking-[0.3em]">CONNECTING...</p></div> : (
              <>
                <p className="mb-8 text-sm text-[#d7ccc8]/80 leading-7 font-serif italic">劇の余韻を、一粒のチョコに込めて。<br/>ログインして劇団員に感謝を贈りましょう。</p>
                <button onClick={signIn} className="bg-[#5865F2] text-white px-10 py-4 rounded-full font-bold shadow-[0_10px_30px_rgba(88,101,242,0.4)] transition-all hover:scale-105 active:scale-95 text-base tracking-wide">Discordで入場する</button>
              </>
            )}
          </div>
        ) : (
          <div className="animate-fade-in-up space-y-8">
            <div className="bg-[#2b120a]/50 p-6 rounded-2xl border border-[#5d4037]/30 backdrop-blur-md mx-2">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] text-[#8d6e63] uppercase tracking-wider block font-bold">Your Name</label>
                <button onClick={signOut} className="text-[10px] text-[#8d6e63] hover:text-[#d7ccc8] underline">Logout</button>
              </div>
              <div className="flex gap-3 items-center">
                <input type="text" className="flex-1 bg-transparent font-bold text-xl text-[#eaddcf] border-b-2 border-[#5d4037]/50 focus:border-[#be123c] focus:outline-none transition-colors pb-2" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                <button onClick={handleUpdateName} disabled={updatingName} className={`text-[10px] font-bold px-4 py-2 rounded-lg transition-all shadow-lg ${updatingName ? 'bg-[#3e2723] text-[#8d6e63]' : 'bg-[#be123c] text-white hover:bg-[#9f1239]'}`}>{updatingName ? 'SAVING...' : 'UPDATE'}</button>
              </div>
            </div>

            <div>
              <div className="px-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-[#d7ccc8] text-sm flex items-center gap-2 tracking-[0.2em]"><span>CAST MEMBERS</span></h2>
                  {selectedUsers.size > 0 && <span className="bg-[#be123c] text-white text-[10px] font-bold px-3 py-1 rounded-full animate-bounce shadow-[0_0_15px_rgba(190,18,60,0.6)]">{selectedUsers.size} SELECTED</span>}
                </div>
                <input type="text" placeholder="Search member..." className="w-full px-4 py-3 rounded-xl bg-[#0a0403] text-[#eaddcf] placeholder-[#4e342e] text-sm focus:outline-none focus:ring-2 focus:ring-[#be123c] border border-[#3e2723]/50 transition-all" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
              </div>
              <div className="px-2 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#3e2723] pb-20">
                {filteredProfiles.length === 0 ? (
                  <p className="text-center text-[#4e342e] py-12 text-xs italic tracking-widest">NO MEMBERS FOUND</p>
                ) : (
                  filteredProfiles.map((profile) => <CardItem key={profile.id} profile={profile} />)
                )}
              </div>
              <div className="fixed bottom-6 left-0 right-0 px-6 z-50 pointer-events-none">
                <div className="max-w-lg mx-auto pointer-events-auto">
                  <button onClick={sendBatchChocolates} disabled={selectedUsers.size === 0} className={`w-full py-5 rounded-2xl font-black text-base tracking-[0.2em] shadow-2xl transition-all relative overflow-hidden group border border-white/10 ${selectedUsers.size === 0 ? 'bg-[#1a0805]/90 text-[#5d4037] backdrop-blur-sm cursor-not-allowed translate-y-20 opacity-0' : 'bg-gradient-to-r from-[#9f1239] to-[#be123c] text-white active:scale-[0.98] translate-y-0 opacity-100'}`}>
                    <span className="relative z-10 drop-shadow-md">SEND CHOCOLATE ({selectedUsers.size})</span>
                    {selectedUsers.size > 0 && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-center text-[10px] text-[#5d4037] mt-8 font-mono tracking-widest opacity-50 pb-20">VOICE NOVA × COSMIC CHOCOLAT</p>
          </div>
        )}
      </div>
    </main>
  );
}