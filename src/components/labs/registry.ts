export interface LabMeta {
  id: string
  title: string
  desc: string
  moduleId: string
  icon: string
  tone: 'btc' | 'ice' | 'violet' | 'teal' | 'rose' | 'emerald'
  /** 是否为真实算法（否则为教学模拟） */
  real: boolean
}

export const LAB_LIST: LabMeta[] = [
  { id: 'hash', title: '哈希函数演示器', desc: '输入数据变化，看 SHA-256 哈希如何剧变', moduleId: '03', icon: 'Hash', tone: 'violet', real: true },
  { id: 'keypair', title: '公私钥关系演示器', desc: '真实 secp256k1：私钥如何派生公钥', moduleId: '03', icon: 'KeyRound', tone: 'teal', real: true },
  { id: 'address', title: '地址生成原理', desc: '从私钥到 1 开头地址的六步推导', moduleId: '03', icon: 'MapPin', tone: 'rose', real: true },
  { id: 'utxo', title: 'UTXO 交易模拟器', desc: 'Alice 转账给 Bob：输入、找零、手续费、确认', moduleId: '05', icon: 'ArrowLeftRight', tone: 'btc', real: false },
  { id: 'blockchain', title: '区块链结构演示器', desc: '点击区块，查看区块头与哈希链接', moduleId: '02', icon: 'Link2', tone: 'ice', real: false },
  { id: 'mining', title: 'PoW 挖矿模拟器', desc: '调整难度，亲手寻找符合条件的哈希', moduleId: '06', icon: 'Pickaxe', tone: 'emerald', real: true },
]
