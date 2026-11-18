/**
 * 真实密码学工具（基于浏览器 Web Crypto API）
 * 仅使用 SHA-256（真实实现）。椭圆曲线等复杂算法在教学中以"模拟"呈现并明确标注。
 */

/** 真实 SHA-256，返回十六进制字符串 */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data.slice().buffer as ArrayBuffer)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** 真实 SHA-256，返回字节数组（用于挖矿模拟） */
export async function sha256Bytes(input: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data.slice().buffer as ArrayBuffer)
  return new Uint8Array(digest)
}

/** 统计前导零位数（bit 级） */
export function leadingZeroBits(bytes: Uint8Array): number {
  let count = 0
  for (const b of bytes) {
    if (b === 0) {
      count += 8
      continue
    }
    // 计算该字节二进制的前导 0 个数
    let n = 0
    for (let bit = 7; bit >= 0; bit--) {
      if ((b >> bit) & 1) break
      n++
    }
    return count + n
  }
  return count
}

/** 字节数组转十六进制 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** 十六进制转字节数组 */
export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, '')
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

/** 比较哈希是否小于目标（按字节，模拟 PoW 目标值判断） */
export function hashBelowTarget(hash: Uint8Array, targetLeadingZeros: number): boolean {
  return leadingZeroBits(hash) >= targetLeadingZeros
}

/** Base58 字符集 */
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

/** Base58Check 编码（教学演示用：对任意 payload 加校验和并编码） */
export function base58CheckEncode(payload: Uint8Array): string {
  // 双层 SHA-256 取前 4 字节为校验和
  const syncSha256 = (data: Uint8Array): Uint8Array => {
    // Web Crypto 是异步的；这里用同步 SHA-256 实现仅供 Base58Check 教学演示
    return sha256Sync(data)
  }
  const checksum = syncSha256(syncSha256(payload)).slice(0, 4)
  const full = new Uint8Array(payload.length + 4)
  full.set(payload, 0)
  full.set(checksum, payload.length)

  // 转 BigInt
  let num = 0n
  for (const b of full) num = num * 256n + BigInt(b)
  let encoded = ''
  while (num > 0n) {
    const mod = Number(num % 58n)
    encoded = BASE58[mod] + encoded
    num = num / 58n
  }
  // 处理前导零
  let leadingZeros = 0
  for (const b of full) {
    if (b === 0) leadingZeros++
    else break
  }
  return '1'.repeat(leadingZeros) + encoded
}

/** 同步 SHA-256 纯实现（仅用于 Base58Check 校验和，教学演示） */
function sha256Sync(data: Uint8Array): Uint8Array {
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ])
  let H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ])
  const bitLen = data.length * 8
  const withOne = data.length + 1
  const padLen = (withOne % 64 <= 56) ? 64 - (withOne % 64) : 128 - (withOne % 64)
  const padded = new Uint8Array(withOne + padLen)
  padded.set(data)
  padded[data.length] = 0x80
  const view = new DataView(padded.buffer)
  view.setUint32(padded.length - 4, Math.floor(bitLen / 0x100000000))
  view.setUint32(padded.length - 8, bitLen >>> 0)

  const w = new Uint32Array(64)
  for (let i = 0; i < padded.length; i += 64) {
    for (let j = 0; j < 16; j++) w[j] = view.getUint32(i + j * 4)
    for (let j = 16; j < 64; j++) {
      const s0 = rotr(w[j - 15], 7) ^ rotr(w[j - 15], 18) ^ (w[j - 15] >>> 3)
      const s1 = rotr(w[j - 2], 17) ^ rotr(w[j - 2], 19) ^ (w[j - 2] >>> 10)
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0
    }
    let [a, b, c, d, e, f, g, h] = H
    for (let j = 0; j < 64; j++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)
      const ch = (e & f) ^ (~e & g)
      const t1 = (h + S1 + ch + K[j] + w[j]) >>> 0
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const t2 = (S0 + maj) >>> 0
      h = g; g = f; f = e; e = (d + t1) >>> 0
      d = c; c = b; b = a; a = (t1 + t2) >>> 0
    }
    H = new Uint32Array([H[0] + a, H[1] + b, H[2] + c, H[3] + d, H[4] + e, H[5] + f, H[6] + g, H[7] + h].map((x) => x >>> 0))
  }
  const out = new Uint8Array(32)
  const outView = new DataView(out.buffer)
  H.forEach((v, i) => outView.setUint32(i * 4, v))
  return out
}

function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n))
}

/** 生成随机十六进制（用于生成教学用假私钥，明确标注非真实资金用途） */
export function randomHex(bytes = 32): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return bytesToHex(arr)
}
