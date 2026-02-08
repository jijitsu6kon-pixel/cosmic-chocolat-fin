'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState, useRef, useCallback, memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// ==========================================
// ⚙️ 設定
// ==========================================
const supabaseUrl = 'https://cghuhjiwbjtvgulmldgv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnaHVoaml3Ymp0dmd1bG1sZGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODUwMzEsImV4cCI6MjA4NTQ2MTAzMX0.qW8lkhppWdRf3k-1o3t4QdR7RJCMwLW7twX37RrSDQQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// 📝 型定義
// ==========================================
type CrewStats = {
  id: string;
  display_name: string;
  avatar_url?: string;
  received_count: number;
  sent_count: number;
  last_received_at?: string;
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
// 🌠 背景の星空 (静的・ワープ移動)
// ==========================================
const StarBackground = memo(() => {
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
        .star-layer { position: absolute; left: 0; top: 0; background: transparent; width: 1px; height: 1px; }
      `}</style>
      {starsSmall && (
        <>
          <div className="star-layer" style={{ boxShadow: starsSmall, animation: 'animStar 150s linear infinite' }} />
          <div className="star-layer" style={{ boxShadow: starsMedium, animation: 'animStar 100s linear infinite' }} />
        </>
      )}
    </div>
  );
});
StarBackground.displayName = 'StarBackground';

// ==========================================
// 💫 流れ星演出レイヤー (ピンク・フェードアウト・低頻度)
// ==========================================
const ShootingStarLayer = memo(() => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
      <style jsx>{`
        /* 頻度調整: 12秒サイクル、最初の3秒だけ表示 */
        .shooting_star {
          position: absolute;
          height: 2px;
          background: linear-gradient(-45deg, rgba(255, 51, 153, 1), rgba(255, 0, 100, 0));
          border-radius: 999px;
          filter: drop-shadow(0 0 6px rgba(255, 51, 153, 1));
          animation: tail 12000ms ease-in-out infinite, shooting 12000ms ease-in-out infinite;
          opacity: 0;
        }

        /* 流れ星の先端（円形の核・ピンク） */
        .shooting_star::before {
          content: '';
          position: absolute;
          top: 50%;
          right: -1px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(255, 51, 153, 1);
          box-shadow: 0 0 4px rgba(255, 51, 153, 0.8), 0 0 8px rgba(255, 51, 153, 0.4);
          animation: shrinkHead 12000ms ease-in-out infinite;
        }
        
        @keyframes tail {
          0% { width: 0; }
          10% { width: 100px; }
          25% { width: 0; }
          100% { width: 0; }
        }

        @keyframes shooting {
          0% { transform: translateX(0) translateY(0) rotateZ(45deg); opacity: 1; }
          20% { opacity: 1; }
          25% { transform: translateX(400px) translateY(400px) rotateZ(45deg); opacity: 0; }
          100% { transform: translateX(400px) translateY(400px) rotateZ(45deg); opacity: 0; }
        }

        @keyframes shrinkHead {
          0% { transform: translateY(-50%) scale(1); }
          15% { transform: translateY(-50%) scale(1); }
          25% { transform: translateY(-50%) scale(0); }
          100% { transform: translateY(-50%) scale(0); }
        }

        .star-1 { top: -5%; left: 50%; animation-delay: 0ms; }
        .star-2 { top: 25%; left: 85%; animation-delay: 2400ms; }
        .star-3 { top: -15%; left: 15%; animation-delay: 4800ms; }
        .star-4 { top: 50%; left: 5%;   animation-delay: 7200ms; }
        .star-5 { top: 5%; left: 95%;   animation-delay: 9600ms; }
      `}</style>
      <div className="shooting_star star-1"></div>
      <div className="shooting_star star-2"></div>
      <div className="shooting_star star-3"></div>
      <div className="shooting_star star-4"></div>
      <div className="shooting_star star-5"></div>
    </div>
  );
});
ShootingStarLayer.displayName = 'ShootingStarLayer';

// ==========================================
// 🎆 バレンタイン爆発演出レイヤー (🆕 新演出)
// ==========================================
const ValentineExplosionLayer = memo(({ isActive, onComplete }: { isActive: boolean, onComplete: () => void }) => {
  const generateParticles = useCallback(() => {
    const count = 50; 
    return Array.from({ length: count }, (_, i) => {
      const isRocket = Math.random() > 0.8; 
      const emoji = isRocket ? '🚀' : '🍫';
      const angle = Math.random() * 360; 
      const distance = 300 + Math.random() * 500; 
      const rotation = Math.random() * 720 - 360; 
      const delay = Math.random() * 0.8; 
      const scale = 0.5 + Math.random() * 1.5; 

      return { id: i, emoji, angle, distance, rotation, delay, scale };
    });
  }, []);

  const particles = useMemo(() => isActive ? generateParticles() : [], [isActive, generateParticles]);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(onComplete, 3500);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden flex items-center justify-center">
      <style jsx>{`
        @keyframes popInCenter {
          0% { transform: scale(0); opacity: 0; }
          40% { transform: scale(1.1); opacity: 1; }
          50% { transform: scale(1); }
          90% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0; }
        }
        
        @keyframes explodeOut {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 1;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) 
                       rotate(var(--angle)) 
                       translateY(calc(var(--distance) * -1px)) 
                       rotate(var(--rotation)) 
                       scale(var(--scale));
            opacity: 0;
          }
        }

        .center-image-container {
          position: absolute;
          width: min(90vw, 600px); 
          height: auto;
          aspect-ratio: 1 / 1;
          animation: popInCenter 3s ease-in-out forwards;
          z-index: 10;
        }

        .particle {
          position: absolute;
          top: 50%;
          left: 50%;
          font-size: 2rem;
          --angle: 0deg;
          --distance: 0;
          --rotation: 0deg;
          --scale: 1;
          animation: explodeOut 3s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
          filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
        }
      `}</style>

      {/* 中央のバレンタイン画像 */}
      <div className="center-image-container">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/valentine_center.png" alt="Valentine Gift" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,51,102,0.6)]" />
      </div>

      {/* 爆発する絵文字たち */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            '--angle': `${p.angle}deg`,
            '--distance': `${p.distance}`,
            '--rotation': `${p.rotation}deg`,
            '--scale': `${p.scale}`,
            animationDelay: `${p.delay}s`
          } as React.CSSProperties}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
});
ValentineExplosionLayer.displayName = 'ValentineExplosionLayer';

// ==========================================
// 📡 アクティビティログ パネル
// ==========================================
const ActivityPanel = memo(({ isOpen, onClose, logs }: { isOpen: boolean, onClose: () => void, logs: ActivityLog[] }) => {
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
});
ActivityPanel.displayName = 'ActivityPanel';

// ==========================================
// 👥 参加者リスト パネル
// ==========================================
const MemberPanel = memo(({ isOpen, onClose, members, getRankTitle }: { isOpen: boolean, onClose: () => void, members: CrewStats[], getRankTitle: (count: number) => string }) => {
  return (
    <>
      <div className={`fixed inset-0 bg-black/50 z-[80] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
      <div className={`fixed top-0 right-0 h-full w-80 bg-[#1a1033]/95 backdrop-blur-xl border-l border-[#ffd700]/30 z-[90] transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-[#ffd700]/20 flex justify-between items-center">
          <h3 className="text-[#ffd700] font-bold tracking-widest flex items-center gap-2"><span className="text-xl">👥</span> CREW LIST</h3>
          <button onClick={onClose} className="text-[#e6e6fa] hover:text-[#ff3366] text-xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          <p className="text-right text-[10px] text-[#e6e6fa]/50 mb-2">Total Crew: {members.length}名</p>
          {members.length === 0 ? <p className="text-center text-[#e6e6fa]/30 text-xs">データなし</p> : members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0e1a]/40 border border-[#e6e6fa]/10 select-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.avatar_url || 'https://www.gravatar.com/avatar?d=mp'} alt="icon" className="w-10 h-10 rounded-full border border-[#ffd700]/20" />
              <div className="flex-1 overflow-hidden">
                <p className="text-[#e6e6fa] font-bold text-sm truncate">{m.display_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-[#ffd700] bg-[#ffd700]/10 px-1.5 py-0.5 rounded border border-[#ffd700]/20">
                    {getRankTitle(m.sent_count)}
                  </span>
                  <span className="text-[10px] text-[#e6e6fa]/50">💝 {m.sent_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
});
MemberPanel.displayName = 'MemberPanel';

// ==========================================
// 🎨 UIパーツ
// ==========================================
const RankBadge = memo(({ index }: { index: number }) => {
  const styles = [
    "text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#e6b800] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] scale-125", 
    "text-transparent bg-clip-text bg-gradient-to-b from-[#e6e6fa] to-[#c0c0c0] drop-shadow-[0_0_5px_rgba(230,230,250,0.6)] scale-110", 
    "text-transparent bg-clip-text bg-gradient-to-b from-[#ffab91] to-[#d84315] drop-shadow-[0_0_5px_rgba(255,171,145,0.5)] scale-105"
  ];
  return <span className={`font-black text-xl ${styles[index] || "text-[#8d6e63] opacity-70"}`}>{index + 1}</span>;
});
RankBadge.displayName = 'RankBadge';

const EmptyCard = memo(({ index }: { index: number }) => (
  <div className="relative flex items-center justify-between p-4 mb-3 rounded-2xl border-2 border-dashed border-[#e6e6fa]/10 bg-[#1a1033]/20 select-none h-[96px]">
     <div className="flex items-center gap-4 w-full opacity-30">
        <div className="w-8 text-center font-black text-xl text-[#8d6e63]">{index + 1}</div>
        <div className="flex-1"><p className="font-bold text-base text-[#e6e6fa] tracking-widest text-xs">データなし</p></div>
     </div>
  </div>
));
EmptyCard.displayName = 'EmptyCard';

const SkeletonCard = memo(() => (
  <div className="relative flex items-center justify-between p-4 mb-3 rounded-2xl border border-white/5 bg-[#1a1033]/30 h-[96px] animate-pulse">
     <div className="flex items-center gap-4 w-full">
        <div className="w-8 h-8 rounded-full bg-white/10"></div>
        <div className="w-12 h-12 rounded-full bg-white/10"></div>
        <div className="flex-1 space-y-2">
           <div className="h-4 w-3/4 bg-white/10 rounded"></div>
           <div className="h-3 w-1/2 bg-white/10 rounded"></div>
        </div>
     </div>
  </div>
));
SkeletonCard.displayName = 'SkeletonCard';

interface UserCardProps {
  profile: CrewStats;
  index?: number;
  isRanking?: boolean;
  isSelected?: boolean;
  isMe?: boolean;
  isCooldown?: boolean;
  rankTitle?: string;
  onSelect: (id: string) => void;
}

const UserCard = memo(({ profile, index = -1, isRanking = false, isSelected, isMe, isCooldown, rankTitle, onSelect }: UserCardProps) => {
  const avatar = profile.avatar_url || "https://www.gravatar.com/avatar?d=mp";

  const getRemainingMinutes = () => {
    if (!profile.last_received_at) return 0;
    const lastTime = new Date(profile.last_received_at).getTime();
    const now = new Date().getTime();
    const diff = now - lastTime;
    const fifteenMins = 15 * 60 * 1000;
    const remaining = fifteenMins - diff;
    return Math.max(0, Math.ceil(remaining / 60000));
  };

  const remainingMinutes = getRemainingMinutes();

  return (
    <div 
      onClick={() => onSelect(profile.id)}
      className={`
        relative flex items-center justify-between p-3 mb-2 rounded-xl transition-all duration-200 border select-none overflow-hidden group
        ${isRanking ? 'h-[96px] mb-3 p-4 rounded-2xl' : 'h-[80px]'}
        ${isMe ? 'bg-[#1a1033]/40 border-[#ffd700]/20 cursor-default' : 'cursor-pointer'}
        ${!isMe && isCooldown ? 'opacity-50 grayscale cursor-not-allowed bg-[#0a0e1a]/80 border-white/5' : ''}
        ${!isMe && !isCooldown && isSelected 
          ? 'bg-gradient-to-r from-[#ff3366]/80 to-[#ffd700]/80 border-[#ffd700] shadow-[0_0_20px_rgba(255,51,102,0.5)] scale-[1.01]' 
          : !isMe && !isCooldown 
            ? 'bg-[#1a1033]/80 border-white/10 hover:border-[#ffd700]/50 hover:bg-[#1a1033] hover:shadow-[0_0_15px_rgba(26,16,51,0.8)]' 
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
          <div className="flex flex-col">
            <p className={`font-bold ${isRanking ? 'text-base' : 'text-sm'} truncate transition-colors ${isSelected ? 'text-[#1a1033]' : 'text-[#e6e6fa]'} ${isMe ? 'opacity-80' : ''}`}>
              {profile.display_name} {isMe && <span className="text-[10px] font-normal ml-1 text-[#ffd700] border border-[#ffd700]/30 px-1 rounded">(あなた)</span>}
            </p>
            {rankTitle && (
              <span className={`text-[9px] font-bold mt-0.5 truncate ${isSelected ? 'text-[#1a1033]/70' : 'text-[#ffd700]/70'}`}>{rankTitle}</span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            {isRanking && index < 5 && (
               <span className="text-[9px] text-[#ffd700] bg-[#ffd700]/10 px-1.5 py-0.5 rounded border border-[#ffd700]/20">TOP STAR</span>
            )}
            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border ${isSelected ? 'bg-[#1a1033]/20 border-[#1a1033]/30' : 'bg-[#ffd700]/10 border-[#ffd700]/30'}`}>
              <span className="text-[10px]">🍫</span>
              <span className={`text-xs font-black ${isSelected ? 'text-[#1a1033]' : 'text-[#ffd700]'}`}>{profile.received_count}</span>
            </div>
            {isCooldown && !isMe && (
              <span className="text-[9px] text-[#ff3366] font-mono tracking-wider flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-[#ff3366] rounded-full animate-ping"></span>
                あと{remainingMinutes}分
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
UserCard.displayName = 'UserCard';

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
        <ShootingStarLayer />
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
  const router = useRouter(); 
  const user = session?.user ?? null;
  
  const [rankingList, setRankingList] = useState<CrewStats[]>([]);
  const [memberList, setMemberList] = useState<CrewStats[]>([]);
  
  const [totalChocolates, setTotalChocolates] = useState<number>(0);
  const [isRankingLoading, setIsRankingLoading] = useState(true);
  const [isMemberLoading, setIsMemberLoading] = useState(true);

  const [myProfileName, setMyProfileName] = useState(''); 
  const [inputName, setInputName] = useState(''); 
  const [myAvatarUrl, setMyAvatarUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false); 

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
  const [isMemberOpen, setIsMemberOpen] = useState(false);

  // ----------------------------------------
  // 🔄 データ取得 (イベント駆動型)
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

  const getRankTitle = useCallback((sentCount: number) => {
    if (!appConfig.rank_titles) return '見習いクルー';
    const titles: RankTitle[] = appConfig.rank_titles;
    const currentTitle = titles.sort((a, b) => b.count - a.count).find(t => sentCount >= t.count);
    return currentTitle ? currentTitle.title : '見習いクルー';
  }, [appConfig]);

  const fetchData = useCallback(async (isBackground = false) => {
    if (!user) return;
    
    if (!isBackground) {
      setIsMemberLoading(true);
      setIsRankingLoading(true);
    }

    const { data: me } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    let currentName = me?.display_name || user.user_metadata.full_name || 'クルー';
    let currentAvatar = me?.avatar_url || user.user_metadata.avatar_url;

    if (!me) {
       const { error: insertError } = await supabase.from('profiles').insert({ id: user.id, display_name: currentName, avatar_url: currentAvatar });
       if (insertError) {
         console.error("Profile creation failed (User deleted?):", insertError);
         await supabase.auth.signOut();
         router.refresh();
         return;
       }
    } else if (!me.avatar_url && currentAvatar) {
       await supabase.from('profiles').update({ avatar_url: currentAvatar }).eq('id', user.id);
    }

    if (isMounted.current && !isBackground) {
      setMyProfileName(currentName);
      setInputName(currentName);
      setMyAvatarUrl(currentAvatar || 'https://www.gravatar.com/avatar?d=mp');
    }

    const { data: allStats, error } = await supabase
      .from('view_crew_stats')
      .select('*')
      .order('received_count', { ascending: false });

    if (error) { console.error(error); return; }
    if (!allStats) return;

    const members = allStats.filter((p: any) => p.id !== user.id);
    const ranking = allStats.slice(0, 10);
    const total = allStats.reduce((acc: number, curr: any) => acc + (curr.received_count || 0), 0);

    const myStats = allStats.find((p: any) => p.id === user.id);
    const totalSent = myStats?.sent_count || 0;

    if (isMounted.current) {
      setMemberList(members);
      setRankingList(ranking);
      setTotalChocolates(total);
      setMyTotalSent(totalSent);
      
      if (!isBackground) {
        setIsRankingLoading(false);
        setIsMemberLoading(false);
      }

      setMyRankTitle(getRankTitle(totalSent));
    }
  }, [user, appConfig, getRankTitle, router]);

  useEffect(() => {
    isMounted.current = true;
    if (user) {
      fetchConfig(); 
      fetchLogs(); 
      fetchData(false);
    }
    return () => { isMounted.current = false; };
  }, [user]); 

  // 🆕 生存確認（60秒ごとにチェック）
  useEffect(() => {
    if (!user) return;
    const survivalCheck = setInterval(async () => {
      const { error } = await supabase.auth.getUser();
      if (error) {
        console.warn("Survival check failed. Forcing logout.");
        await supabase.auth.signOut();
        router.refresh(); 
      }
    }, 60000); // 60秒
    return () => clearInterval(survivalCheck);
  }, [user, router]);

  // ----------------------------------------
  // 🎮 アクション
  // ----------------------------------------
  const isCooldown = useCallback((lastDateStr?: string) => {
    if (!lastDateStr) return false;
    return (new Date().getTime() - new Date(lastDateStr).getTime()) / (1000 * 60) < 15;
  }, []);

  const handleClickUser = useCallback((targetId: string) => {
    if (!user) return alert("ログインしてください");
    if (targetId === user.id) return alert("自分には贈れません");
    
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      newSet.has(targetId) ? newSet.delete(targetId) : newSet.add(targetId);
      return newSet;
    });
  }, [user]);

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
    
    fetchData(true);
  };

  const handleUpdateName = async () => {
    if (!user || !inputName.trim()) return;
    setIsActionLoading(true);
    await supabase.from('profiles').update({ display_name: inputName }).eq('id', user.id);
    setMyProfileName(inputName);
    setIsEditing(false);
    fetchData(true);
    setTimeout(() => setIsActionLoading(false), 500);
  };
  const signIn = () => supabase.auth.signInWithOAuth({ provider: 'discord', options: { queryParams: { prompt: 'consent' } } });
  
  const signOut = async () => { 
    await supabase.auth.signOut();
    router.refresh();
  };

  const getNameSize = (name: string) => {
    if (name.length > 20) return 'text-xs';
    if (name.length > 10) return 'text-sm';
    return 'text-xl';
  };

  const filteredMembers = useMemo(() => {
    return memberList.filter(m => m.display_name.toLowerCase().includes(searchText.toLowerCase()));
  }, [memberList, searchText]);

  return (
    <main className="min-h-screen bg-[#050510] text-[#e6e6fa] flex flex-col items-center p-4 font-sans relative overflow-hidden">
      
      {/* 🆕 ロケット演出を新しい爆発演出に置き換え */}
      <ValentineExplosionLayer isActive={isRocketFlying} onComplete={() => setIsRocketFlying(false)} />
      
      <ActivityPanel isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} logs={activityLogs} />
      
      <MemberPanel 
        isOpen={isMemberOpen} 
        onClose={() => setIsMemberOpen(false)} 
        members={memberList} 
        getRankTitle={getRankTitle}
      />

      <div className="fixed top-24 right-0 z-50 flex flex-col items-end gap-2">
        <button 
          onClick={() => setIsLogOpen(true)}
          className="bg-[#1a1033]/80 border-l border-t border-b border-[#ffd700]/30 text-[#ffd700] p-3 rounded-l-xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:bg-[#1a1033] hover:pl-5 transition-all duration-300 group"
        >
          <span className="text-xl group-hover:animate-ping">📡</span>
          <span className="hidden group-hover:inline ml-2 text-xs font-bold tracking-widest">LOG</span>
        </button>

        <button 
          onClick={() => setIsMemberOpen(true)}
          className="bg-[#1a1033]/80 border-l border-t border-b border-[#ffd700]/30 text-[#e6e6fa] p-3 rounded-l-xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:bg-[#1a1033] hover:pl-5 transition-all duration-300 group"
        >
          <span className="text-xl group-hover:animate-bounce">👥</span>
          <span className="hidden group-hover:inline ml-2 text-xs font-bold tracking-widest">CREW</span>
        </button>
      </div>

      <StarBackground />
      <ShootingStarLayer />
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
              <p className="text-[10px] text-[#ffd700] uppercase tracking-[0.3em] mb-1">Total Chocolat</p>
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
              
              {/* Star Log */}
              <div className="w-full md:w-5/12 bg-[#1a1033]/60 p-6 rounded-2xl border border-[#ffd700]/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-center min-h-[220px] shadow-[0_0_30px_rgba(26,16,51,0.5)]">
                 <div className="absolute inset-0 bg-gradient-to-br from-[#ffd700]/10 via-transparent to-[#ff3366]/10 opacity-50 pointer-events-none"></div>
                 
                 <div className="relative z-10 flex items-center gap-4 mb-4">
                   <div className="relative">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={myAvatarUrl} alt="my icon" className="w-16 h-16 rounded-full border-2 border-[#ffd700] shadow-lg object-cover" />
                   </div>
                   <div className="flex-1">
                     <p className="text-[10px] text-[#e6e6fa]/60 uppercase tracking-widest mb-1">CREW NAME</p>
                     
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

                 <div className="relative z-10 border-t border-[#ffd700]/20 pt-4 flex justify-between items-end">
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

              {/* Right: Search Only */}
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
              {isMemberLoading ? (
                Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={`skel-mem-${i}`} />)
              ) : filteredMembers.length === 0 ? (
                <p className="col-span-full text-center text-[#e6e6fa]/40 py-12 text-xs tracking-widest">クルーメイトが見つかりません</p>
              ) : (
                filteredMembers.map((m) => (
                  <UserCard 
                    key={m.id} 
                    profile={m} 
                    isSelected={selectedUsers.has(m.id)} 
                    // 🛠️ 修正: user.id -> user?.id に変更してクラッシュを防止
                    isMe={user?.id === m.id}
                    isCooldown={isCooldown(m.last_received_at)}
                    rankTitle={getRankTitle(m.sent_count)}
                    onSelect={handleClickUser}
                  />
                ))
              )}
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
                    {isRankingLoading ? (
                      Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={`skel-top-${i}`} />)
                    ) : (
                      Array.from({ length: 5 }).map((_, i) => {
                         const ranker = rankingList[i];
                         return ranker ? (
                           <UserCard 
                             key={ranker.id} 
                             profile={ranker} 
                             index={i} 
                             isRanking={true} 
                             isSelected={selectedUsers.has(ranker.id)} 
                             // 🛠️ 修正: user.id -> user?.id に変更してクラッシュを防止
                             isMe={user?.id === ranker.id}
                             isCooldown={isCooldown(ranker.last_received_at)}
                             rankTitle={getRankTitle(ranker.sent_count)}
                             onSelect={handleClickUser}
                           />
                         ) : <EmptyCard key={`empty-${i}`} index={i} />;
                      })
                    )}
                 </div>
                 
                 <div className="w-full md:w-1/2 flex flex-col gap-3">
                    <div className="hidden md:block text-center text-[#e6e6fa] text-xs tracking-widest mb-2 opacity-50">{'/// RISING STARS ///'}</div>
                    {isRankingLoading ? (
                      Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={`skel-rise-${i}`} />)
                    ) : (
                      Array.from({ length: 5 }).map((_, i) => {
                         const rankIndex = i + 5;
                         const ranker = rankingList[rankIndex];
                         return ranker ? (
                           <UserCard 
                             key={ranker.id} 
                             profile={ranker} 
                             index={rankIndex} 
                             isRanking={true} 
                             isSelected={selectedUsers.has(ranker.id)}
                             // 🛠️ 修正: user.id -> user?.id に変更してクラッシュを防止
                             isMe={user?.id === ranker.id}
                             isCooldown={isCooldown(ranker.last_received_at)}
                             rankTitle={getRankTitle(ranker.sent_count)}
                             onSelect={handleClickUser}
                           />
                         ) : <EmptyCard key={`empty-${rankIndex}`} index={rankIndex} />;
                      })
                    )}
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