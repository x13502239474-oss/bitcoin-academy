import type { MapNode, MapEdge } from '../types'

/**
 * 比特币知识地图
 * 按「密码学 → 密钥与地址 → 交易 → 区块 → 网络共识 → 扩展经济」六层组织
 * 每个节点可点击跳转到对应课程或实验室；坐标为百分比布局（0-100），用于响应式定位
 * 注意：x 控制在 12~80 之间、每层不超过 4 个节点，保证 390px 窄屏不溢出
 */
export const KNOWLEDGE_NODES: MapNode[] = [
  // 第 1 层：密码学
  { id: 'hash', label: '哈希函数', moduleId: '03', target: { kind: 'lesson', id: '03-01' }, x: 14, y: 6, tone: 'ice' },
  { id: 'privkey', label: '私钥', moduleId: '03', target: { kind: 'lab', id: 'keypair' }, x: 38, y: 6, tone: 'btc' },
  { id: 'pubkey', label: '公钥', moduleId: '03', target: { kind: 'lab', id: 'keypair' }, x: 62, y: 6, tone: 'btc' },
  { id: 'sig', label: '数字签名', moduleId: '03', target: { kind: 'lesson', id: '03-03' }, x: 80, y: 6, tone: 'ice' },

  // 第 2 层：助记词、钱包、地址、脚本
  { id: 'seed', label: '助记词种子', moduleId: '03', target: { kind: 'lesson', id: '03-06' }, x: 14, y: 22, tone: 'plain' },
  { id: 'wallet', label: 'HD 钱包', moduleId: '04', target: { kind: 'lesson', id: '04-02' }, x: 38, y: 22, tone: 'plain' },
  { id: 'address', label: '地址生成', moduleId: '05', target: { kind: 'lab', id: 'address' }, x: 62, y: 22, tone: 'btc' },
  { id: 'script', label: 'Script 脚本', moduleId: '08', target: { kind: 'lesson', id: '08-04' }, x: 80, y: 22, tone: 'ice' },

  // 第 3 层：交易
  { id: 'utxo', label: 'UTXO 模型', moduleId: '05', target: { kind: 'lab', id: 'utxo' }, x: 14, y: 38, tone: 'btc' },
  { id: 'tx', label: '交易结构', moduleId: '05', target: { kind: 'lesson', id: '05-04' }, x: 38, y: 38, tone: 'btc' },
  { id: 'fee', label: '手续费', moduleId: '05', target: { kind: 'lesson', id: '05-03' }, x: 62, y: 38, tone: 'plain' },
  { id: 'mempool', label: '内存池', moduleId: '07', target: { kind: 'lesson', id: '07-05' }, x: 80, y: 38, tone: 'ice' },

  // 第 4 层：区块与链
  { id: 'merkle', label: 'Merkle 树', moduleId: '02', target: { kind: 'lesson', id: '02-05' }, x: 14, y: 54, tone: 'ice' },
  { id: 'block', label: '区块结构', moduleId: '02', target: { kind: 'lesson', id: '02-04' }, x: 38, y: 54, tone: 'ice' },
  { id: 'chain', label: '区块链', moduleId: '02', target: { kind: 'lab', id: 'blockchain' }, x: 62, y: 54, tone: 'ice' },
  { id: 'pow', label: '工作量证明', moduleId: '06', target: { kind: 'lab', id: 'mining' }, x: 80, y: 54, tone: 'btc' },

  // 第 5 层：网络与共识
  { id: 'network', label: 'P2P 网络', moduleId: '07', target: { kind: 'lesson', id: '07-01' }, x: 14, y: 70, tone: 'plain' },
  { id: 'nodes', label: '全节点验证', moduleId: '07', target: { kind: 'lesson', id: '07-02' }, x: 38, y: 70, tone: 'plain' },
  { id: 'consensus', label: '共识形成', moduleId: '06', target: { kind: 'lesson', id: '06-05' }, x: 62, y: 70, tone: 'plain' },

  // 第 6 层：扩展与经济
  { id: 'taproot', label: 'Taproot', moduleId: '08', target: { kind: 'lesson', id: '08-06' }, x: 14, y: 88, tone: 'plain' },
  { id: 'lightning', label: '闪电网络', moduleId: '09', target: { kind: 'lesson', id: '09-04' }, x: 38, y: 88, tone: 'plain' },
  { id: 'economics', label: '2100 万上限', moduleId: '09', target: { kind: 'lesson', id: '09-01' }, x: 62, y: 88, tone: 'plain' },
  { id: 'security', label: '密钥安全', moduleId: '10', target: { kind: 'lesson', id: '10-01' }, x: 80, y: 88, tone: 'plain' },
]

export const KNOWLEDGE_EDGES: MapEdge[] = [
  // 密码学内部
  { from: 'privkey', to: 'pubkey', label: '椭圆曲线标量乘法' },
  { from: 'privkey', to: 'sig', label: '签名' },
  { from: 'hash', to: 'address', label: '生成指纹' },
  { from: 'hash', to: 'pow', label: '反复哈希' },
  { from: 'hash', to: 'merkle', label: '两两归并' },
  // 密钥与地址
  { from: 'seed', to: 'wallet', label: 'BIP-39 种子' },
  { from: 'wallet', to: 'privkey', label: 'BIP-32 派生' },
  { from: 'pubkey', to: 'address', label: 'HASH160 + 编码' },
  { from: 'address', to: 'script', label: '锁定脚本' },
  // 交易
  { from: 'address', to: 'tx', label: '收款输出' },
  { from: 'utxo', to: 'tx', label: '消费与创造' },
  { from: 'sig', to: 'tx', label: '授权花费' },
  { from: 'tx', to: 'fee', label: '输入减输出' },
  { from: 'tx', to: 'mempool', label: '广播' },
  // 区块
  { from: 'mempool', to: 'block', label: '矿工打包' },
  { from: 'tx', to: 'merkle', label: '叶子节点' },
  { from: 'merkle', to: 'block', label: '写入区块头' },
  { from: 'block', to: 'chain', label: 'prev_hash 链接' },
  { from: 'pow', to: 'block', label: '争夺记账权' },
  // 网络与共识
  { from: 'network', to: 'mempool', label: '交易传播' },
  { from: 'nodes', to: 'chain', label: '独立验证' },
  { from: 'chain', to: 'consensus', label: '累积工作量最大' },
  { from: 'network', to: 'consensus', label: '区块广播' },
  // 扩展
  { from: 'script', to: 'taproot', label: '脚本能力演进' },
  { from: 'chain', to: 'lightning', label: '链上容量有限' },
  { from: 'consensus', to: 'economics', label: '减半与总量' },
  { from: 'sig', to: 'security', label: '密钥即所有权' },
]

/** 学习主线（用于展示推荐路径） */
export const LEARNING_PATH = [
  'hash', 'privkey', 'pubkey', 'sig', 'utxo', 'tx', 'merkle', 'block', 'chain', 'pow', 'consensus',
]
