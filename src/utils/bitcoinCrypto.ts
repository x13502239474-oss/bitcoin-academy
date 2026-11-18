/**
 * 比特币核心密码学 —— 纯 TypeScript 实现（BigInt + Web Crypto），无第三方依赖
 * 提供真实的 secp256k1 公钥派生、HASH160（SHA256 + RIPEMD160）与 Base58Check 地址
 * SHA-256 使用浏览器原生 Web Crypto（真实算法），RIPEMD-160 为经标准向量验证的纯 TS 实现
 * 用于教学演示，生成的密钥/地址关系与真实比特币一致
 */

// ===== secp256k1 =====
const P = BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f')
const N = BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141')
const Gx = BigInt('0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798')
const Gy = BigInt('0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8')

type Point = { x: bigint; y: bigint } | null

const mod = (a: bigint, m: bigint = P): bigint => {
  const r = a % m
  return r >= 0n ? r : r + m
}

function inv(a: bigint): bigint {
  let base = mod(a)
  let result = 1n
  let e = P - 2n
  while (e > 0n) {
    if (e & 1n) result = (result * base) % P
    base = (base * base) % P
    e >>= 1n
  }
  return result
}

function pointAdd(p1: Point, p2: Point): Point {
  if (p1 === null) return p2
  if (p2 === null) return p1
  if (p1.x === p2.x && mod(p1.y + p2.y) === 0n) return null
  let slope: bigint
  if (p1.x === p2.x && p1.y === p2.y) {
    slope = (mod(3n * p1.x * p1.x) * inv(mod(2n * p1.y))) % P
  } else {
    slope = (mod(p2.y - p1.y) * inv(mod(p2.x - p1.x))) % P
  }
  const x3 = mod(slope * slope - p1.x - p2.x)
  const y3 = mod(slope * (p1.x - x3) - p1.y)
  return { x: x3, y: y3 }
}

function pointMul(k: bigint, point: Point): Point {
  let result: Point = null
  let addend = point
  let scalar = k
  while (scalar > 0n) {
    if (scalar & 1n) result = pointAdd(result, addend)
    addend = pointAdd(addend, addend)
    scalar >>= 1n
  }
  return result
}

/** 由私钥（32 字节十六进制）派生公钥，返回压缩/未压缩格式 */
export function privateToPublic(privHex: string): { x: string; y: string; compressed: string; uncompressed: string } {
  let k = BigInt('0x' + privHex.replace(/^0x/, ''))
  k = mod(k, N)
  if (k === 0n) k = 1n
  const pub = pointMul(k, { x: Gx, y: Gy })!
  const xHex = pub.x.toString(16).padStart(64, '0')
  const yHex = pub.y.toString(16).padStart(64, '0')
  const prefix = pub.y % 2n === 0n ? '02' : '03'
  return { x: xHex, y: yHex, compressed: prefix + xHex, uncompressed: '04' + xHex + yHex }
}

// ===== 真实 SHA-256（Web Crypto） =====
const sha256 = async (data: Uint8Array): Promise<Uint8Array> =>
  new Uint8Array(await crypto.subtle.digest('SHA-256', data.slice().buffer as ArrayBuffer))

// ===== RIPEMD-160（纯 TS，经标准向量验证） =====
function ripemd160(data: Uint8Array): Uint8Array {
  const r = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,
    7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,
    3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,
    1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,
    4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13]
  const rp = [5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,
    6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,
    15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,
    8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,
    12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11]
  const s = [11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,
    7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,
    11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,
    11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,
    9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6]
  const sp = [8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,
    9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,
    9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,
    15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,
    8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]

  const rotl = (x: number, n: number) => ((x << n) | (x >>> (32 - n))) >>> 0
  const f = (j: number, x: number, y: number, z: number): number => {
    if (j < 16) return (x ^ y ^ z) >>> 0
    if (j < 32) return ((x & y) | (~x & z)) >>> 0
    if (j < 48) return ((x | ~y) ^ z) >>> 0
    if (j < 64) return ((x & z) | (y & ~z)) >>> 0
    return (x ^ (y | ~z)) >>> 0
  }
  const fp = (j: number, x: number, y: number, z: number): number => {
    if (j < 16) return (x ^ (y | ~z)) >>> 0
    if (j < 32) return ((x & z) | (y & ~z)) >>> 0
    if (j < 48) return ((x | ~y) ^ z) >>> 0
    if (j < 64) return ((x & y) | (~x & z)) >>> 0
    return (x ^ y ^ z) >>> 0
  }
  const K = [0x00000000,0x5a827999,0x6ed9eba1,0x8f1bbcdc,0xa953fd4e]
  const Kp = [0x50a28be6,0x5c4dd124,0x6d703ef3,0x7a6d76e9,0x00000000]

  const bitLen = data.length * 8
  const padded = new Uint8Array((((data.length + 9) >> 6) + 1) << 6)
  padded.set(data)
  padded[data.length] = 0x80
  const dv = new DataView(padded.buffer)
  dv.setUint32(padded.length - 8, bitLen >>> 0, true)
  dv.setUint32(padded.length - 4, Math.floor(bitLen / 0x100000000), true)

  let h0=0x67452301, h1=0xefcdab89, h2=0x98badcfe, h3=0x10325476, h4=0xc3d2e1f0
  const X = new Uint32Array(16)
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) X[i] = dv.getUint32(off + i * 4, true)
    let a=h0,b=h1,c=h2,d=h3,e=h4, ap=h0,bp=h1,cp=h2,dp=h3,ep=h4
    for (let j = 0; j < 80; j++) {
      const t = (rotl((a + f(j,b,c,d) + X[r[j]] + K[j>>4]) >>> 0, s[j]) + e) >>> 0
      a=e; e=d; d=rotl(c,10); c=b; b=t
      const tp = (rotl((ap + fp(j,bp,cp,dp) + X[rp[j]] + Kp[j>>4]) >>> 0, sp[j]) + ep) >>> 0
      ap=ep; ep=dp; dp=rotl(cp,10); cp=bp; bp=tp
    }
    const T=(h1+c+dp)>>>0
    h1=(h2+d+ep)>>>0; h2=(h3+e+ap)>>>0; h3=(h4+a+bp)>>>0; h4=(h0+b+cp)>>>0; h0=T
  }
  const out = new Uint8Array(20)
  const ov = new DataView(out.buffer)
  ov.setUint32(0,h0,true); ov.setUint32(4,h1,true); ov.setUint32(8,h2,true); ov.setUint32(12,h3,true); ov.setUint32(16,h4,true)
  return out
}

/** HASH160 = RIPEMD160(SHA256(data)) */
export async function hash160(data: Uint8Array): Promise<Uint8Array> {
  return ripemd160(await sha256(data))
}

const hexToU8 = (hex: string): Uint8Array => {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return out
}

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
async function base58Check(payload: Uint8Array): Promise<string> {
  const first = await sha256(payload)
  const sum = (await sha256(first)).slice(0, 4)
  const full = new Uint8Array(payload.length + 4)
  full.set(payload); full.set(sum, payload.length)
  let num = 0n
  for (const b of full) num = num * 256n + BigInt(b)
  let out = ''
  while (num > 0n) { out = B58[Number(num % 58n)] + out; num /= 58n }
  let zeros = 0
  for (const b of full) { if (b === 0) zeros++; else break }
  return '1'.repeat(zeros) + out
}

/** 由压缩公钥（hex）生成主网 P2PKH 地址（1 开头），真实算法 */
export async function publicToAddress(compressedPubHex: string): Promise<string> {
  const h160 = await hash160(hexToU8(compressedPubHex))
  const payload = new Uint8Array(21)
  payload[0] = 0x00
  payload.set(h160, 1)
  return base58Check(payload)
}
