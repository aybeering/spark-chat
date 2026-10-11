import React, { useState, useEffect } from 'react';
import { 
  X, 
  Coins, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Lock,
  Wallet,
  RefreshCw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SolanaWalletState } from '../types/profile';
import { 
  requestAirdrop, 
  connectInjectedWallet, 
  getAvailableWallets,
  fetchOnChainBalance,
  switchToSimulatedWallet,
  DetectedWallet
} from '../services/solanaService';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletState: SolanaWalletState;
  setWalletState: React.Dispatch<React.SetStateAction<SolanaWalletState>>;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  walletState,
  setWalletState,
}) => {
  const [copied, setCopied] = useState(false);
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<DetectedWallet[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      try {
        setAvailableWallets(getAvailableWallets());
      } catch (err) {
        console.warn('Error reading installed wallet list:', err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyAddress = () => {
    if (walletState.publicKey) {
      navigator.clipboard.writeText(walletState.publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefreshBalance = async () => {
    if (!walletState.publicKey) return;
    setIsRefreshingBalance(true);
    setStatusMessage(null);

    if (walletState.isSimulated) {
      setTimeout(() => {
        setIsRefreshingBalance(false);
        setStatusMessage('当前处于沙盒模拟模式，余额已同步');
      }, 400);
      return;
    }

    try {
      const realBal = await fetchOnChainBalance(walletState.publicKey, walletState.network);
      if (realBal !== null) {
        setWalletState(prev => ({ ...prev, balance: realBal }));
        setStatusMessage(`链上最新余额已同步: ${realBal.toFixed(4)} SOL`);
      } else {
        setStatusMessage('未能从 Solana Devnet 节点获取余额，请稍后重试');
      }
    } catch {
      setStatusMessage('RPC 节点请求超时，请重试');
    } finally {
      setIsRefreshingBalance(false);
    }
  };

  const handleFaucet = async () => {
    setIsAirdropping(true);
    setStatusMessage(null);
    try {
      const updated = await requestAirdrop(walletState, 1.0);
      setWalletState(updated);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
      setStatusMessage(
        walletState.isSimulated 
          ? '沙盒测试币 +1.0 SOL 充值成功！' 
          : '已成功申领 +1.0 SOL 测试币！（Solana Devnet 出块确认中）'
      );
    } catch {
      setStatusMessage('空投请求未完成，请访问官方水龙头领取');
    } finally {
      setIsAirdropping(false);
    }
  };

  const handleConnectWallet = async (walletId: string = 'phantom') => {
    setIsConnectingWallet(true);
    setStatusMessage(null);
    try {
      const result = await connectInjectedWallet(walletId);
      if (result && result.publicKey) {
        setWalletState(prev => ({
          ...prev,
          publicKey: result.publicKey,
          balance: result.balance !== undefined ? result.balance : prev.balance,
          isSimulated: false,
          connected: true
        }));
        setStatusMessage('已成功连接真实 Phantom 钱包并切换为链上模式！');
        try {
          confetti({
            particleCount: 80,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      } else {
        setStatusMessage('未能连接钱包插件，请确认已解锁或允许本站授权');
      }
    } catch {
      setStatusMessage('连接钱包失败，可继续使用免插件沙盒模式');
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleSwitchToSimulated = () => {
    const sandboxState = switchToSimulatedWallet();
    setWalletState(sandboxState);
    setStatusMessage('已切回模拟沙盒模式 (无需真插件，零门槛体验)');
  };

  const hasInjected = availableWallets.some(w => w.isInstalled);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Solana 钱包与撮合账户
                </h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  walletState.isSimulated 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  {walletState.isSimulated ? '沙盒模拟' : '真实链上'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                公平微支付反垃圾机制 · 商业灵感通话诚意金托管
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Status feedback message if any */}
          {statusMessage && (
            <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Wallet Mode & Connection Quick Bar */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                walletState.isSimulated ? 'bg-amber-400 ring-4 ring-amber-400/20' : 'bg-emerald-400 ring-4 ring-emerald-400/20'
              }`} />
              <div className="min-w-0">
                <div className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                  <span>{walletState.isSimulated ? '沙盒演示钱包' : 'Phantom 链上钱包'}</span>
                  {!walletState.isSimulated && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      已连接
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {walletState.isSimulated ? '本地独立秘钥沙盒，免插件体验' : 'Solana Devnet 测试网络'}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {walletState.isSimulated ? (
                <button
                  type="button"
                  onClick={() => handleConnectWallet('phantom')}
                  disabled={isConnectingWallet}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium shadow-sm transition-all text-xs disabled:opacity-50 cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-amber-300" />
                  <span>{isConnectingWallet ? '连接中...' : (hasInjected ? '连接真实 Phantom' : '唤起 Phantom 插件')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSwitchToSimulated}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors text-xs cursor-pointer"
                >
                  切回沙盒模式
                </button>
              )}
            </div>
          </div>

          {/* Balance & Address Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/30 relative overflow-hidden shadow-lg shadow-indigo-950/30">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">当前可用钱包余额</span>
                  <button
                    onClick={handleRefreshBalance}
                    disabled={isRefreshingBalance}
                    className="p-1 rounded-md text-slate-500 hover:text-indigo-400 hover:bg-slate-800/80 transition-colors"
                    title="刷新链上余额"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingBalance ? 'animate-spin text-indigo-400' : ''}`} />
                  </button>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {walletState.balance.toFixed(4)}
                  </span>
                  <span className="text-sm font-bold text-indigo-400">SOL</span>
                  <span className="text-xs text-slate-400 ml-1.5">
                    (≈ ${(walletState.balance * 185).toFixed(2)} USD)
                  </span>
                </div>
              </div>

              {/* Faucet action */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleFaucet}
                  disabled={isAirdropping}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Zap className={`w-3.5 h-3.5 ${isAirdropping ? 'animate-spin' : 'text-amber-300'}`} />
                  <span>{isAirdropping ? '申领中...' : '申领 1.0 SOL 测试币'}</span>
                </button>

                {!walletState.isSimulated && (
                  <a
                    href="https://faucet.solana.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors flex items-center justify-center"
                    title="官方 Solana 水龙头网站"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Public Key Address Row */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden text-xs">
                <span className="text-slate-500 shrink-0">公钥地址:</span>
                <span className="font-mono text-slate-300 truncate">
                  {walletState.publicKey}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleCopyAddress}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="复制公钥地址"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={`https://explorer.solana.com/address/${walletState.publicKey}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                  title="在 Solana 区块链浏览器查看"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Decentralized Mechanism Rules (Compact & Clear) */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90 space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>去中心化撮合与经济模型说明</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                <div className="w-4 h-4 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                  1
                </div>
                <div>
                  <span className="font-semibold text-slate-200">防骚扰公平撮合:</span>
                  <p className="mt-0.5 text-[11px] text-slate-400 leading-snug">每次每周合作批次刷新消耗 0.02 SOL，阻绝垃圾爬虫，保证推荐池真实严肃。</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                <div className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                  2
                </div>
                <div>
                  <span className="font-semibold text-slate-200">诚意定金智能托管:</span>
                  <p className="mt-0.5 text-[11px] text-slate-400 leading-snug">预约通话需锁定微额定金，通话履约后自动全额退还，守约率达99.2%。</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <div className="flex items-center justify-between mb-2.5 px-0.5">
              <h4 className="text-xs font-semibold text-slate-300">
                撮合交易记录 (Solana Devnet)
              </h4>
              <span className="text-[11px] text-slate-500">共 {walletState.txHistory.length} 笔记录</span>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto">
              {walletState.txHistory.length === 0 ? (
                <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 text-center text-xs text-slate-500">
                  暂无交易记录
                </div>
              ) : (
                walletState.txHistory.map((tx, idx) => (
                  <div
                    key={tx.signature + idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.type === 'AIRDROP' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {tx.type === 'AIRDROP' ? <Zap className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-200 truncate text-[11px] sm:text-xs">
                          {tx.type === 'MATCH_UNLOCK' 
                            ? '每周合作画像匹配刷新' 
                            : tx.type === 'INVITE_STAKE'
                            ? 'Phone Chat 诚意定金托管'
                            : 'Devnet 测试代币水龙头'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {new Date(tx.timestamp).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`font-mono font-semibold text-xs ${
                        tx.type === 'AIRDROP' ? 'text-emerald-400' : 'text-indigo-300'
                      }`}>
                        {tx.type === 'AIRDROP' ? `+${tx.amount.toFixed(3)}` : `-${tx.amount.toFixed(3)}`} SOL
                      </div>
                      <a
                        href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-indigo-400 transition-colors"
                      >
                        <span>{tx.signature.substring(0, 6)}...</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Solana Devnet 链上测试网 · 交易即时广播确认</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
