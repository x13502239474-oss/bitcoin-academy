import type { MapNode, MapEdge } from '../types'

/**
 * 比特币知识地图
 * 把密码学、钱包、交易、区块链、挖矿、共识等知识点串联成体系
 * 每个节点可点击跳转到对应课程或实验室
 * 坐标为百分比布局（0-100），用于响应式定位
 */
export const KNOWLEDGE_NODES: MapNode[] = [
  // 密码学基础层
  { id: 'hash', label: '哈希函数', moduleId: '03', target: { kind: 'lesson', id: '03-01' }, x: 14, y: 12, tone: 'ice' },
  { id: 'privkey', label: '私钥', moduleId: '03', target: { kind: 'lab', id: 'keypair' }, x: 38, y: 12, tone: 'btc' },
  { id: 'pubkey', label: '公钥', moduleId: '03', target: { kind: 'lab', id: 'keypair' }, x: 62, y: 12, tone: 'btc' },
  { id: 'sig', label: '数字签名', moduleId: '03', target: { kind: 'lesson', id: '03-03' }, x: 80, y: 12, tone: 'ice' },

  // 地址与钱包层
  { id: 'address', label: '地址生成', moduleId: '03', target: { kind: 'lab', id: 'address' }, x: 62, y: 30, tone: 'btc' },
  { id: 'seed', label: '助记词与种子', moduleId: '04', target: { kind: 'lesson', id: '04-02' }, x: 20, y: 30, tone: 'plain' },
  { id: 'wallet', label: 'HD 钱包', moduleId: '04', target: { kind: 'lesson', id: '04-03' }, x: 38, y: 30, tone: 'plain' },

  // 交易层
  { id: 'utxo', label: 'UTXO 模型', moduleId: '05', target: { kind: 'lab', id: 'utxo' }, x: 30, y: 50, tone: 'btc' },
  { id: 'tx', label: '比特币交易', moduleId: '05', target: { kind: 'lab', id: 'utxo' }, x: 56, y: 50, tone: 'btc' },
  { id: 'mempool', label: '交易池', moduleId: '05', target: { kind: 'lesson', id: '05-03' }, x: 78, y: 50, tone: 'ice' },

  // 区块与链层
  { id: 'block', label: '区块', moduleId: '02', target: { kind: 'lab', id: 'blockchain' }, x: 30, y: 70, tone: 'ice' },
  { id: 'chain', label: '区块链', moduleId: '02', target: { kind: 'lab', id: 'blockchain' }, x: 56, y: 70, tone: 'ice' },
  { id: 'pow', label: '工作量证明', moduleId: '06', target: { kind: 'lab', id: 'mining' }, x: 78, y: 70, tone: 'btc' },

  // 共识与网络层
  { id: 'consensus', label: '去中心化共识', moduleId: '06', target: { kind: 'lesson', id: '06-03' }, x: 30, y: 90, tone: 'plain' },
  { id: 'network', label: 'P2P 网络', moduleId: '07', target: { kind: 'lesson', id: '07-01' }, x: 56, y: 90, tone: 'plain' },
  { id: 'nodes', label: '全节点与验证', moduleId: '07', target: { kind: 'lesson', id: '07-02' }, x: 78, y: 90, tone: 'plain' },
]

export const KNOWLEDGE_EDGES: MapEdge[] = [
  { from: 'privkey', to: 'pubkey', label: '椭圆曲线乘法' },
  { from: 'pubkey', to: 'address', label: 'HASH160 + Base58' },
  { from: 'seed', to: 'wallet', label: '推导' },
  { from: 'wallet', to: 'privkey', label: '派生' },
  { from: 'hash', to: 'pow', label: '哈希计算' },
  { from: 'hash', to: 'address', label: '生成指纹' },
  { from: 'sig', to: 'tx', label: '授权花费' },
  { from: 'privkey', to: 'sig', label: '签名' },
  { from: 'utxo', to: 'tx', label: '消费与创造' },
  { from: 'address', to: 'tx', label: '收款脚本' },
  { from: 'tx', to: 'mempool', label: '广播' },
  { from: 'mempool', to: 'block', label: '矿工打包' },
  { from: 'block', to: 'chain', label: '哈希链接' },
  { from: 'pow', to: 'block', label: '争夺记账权' },
  { from: 'chain', to: 'consensus', label: '最长链规则' },
  { from: 'network', to: 'consensus', label: '传播' },
  { from: 'nodes', to: 'consensus', label: '独立验证' },
  { from: 'consensus', to: 'chain', label: '达成一致' },
]

/** 学习主线（用于展示推荐路径） */
export const LEARNING_PATH = [
  'hash', 'privkey', 'pubkey', 'sig', 'utxo', 'tx', 'block', 'chain', 'pow', 'consensus',
]
