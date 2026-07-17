import { PrismaClient } from "./src/generated/prisma/client"
async function main() {
  const prisma = new PrismaClient()
  try {
    const total = await prisma.relawan.count()
    console.log("total relawan:", total)
    const search = "rosyida"
    const r1 = await prisma.relawan.findMany({ where: { OR: [{ nama: { contains: search, mode: "insensitive" } }] }, take: 5 })
    console.log("insensitive result:", JSON.stringify(r1.map(x => ({ id: x.id, nama: x.nama }))))
    const r2 = await prisma.relawan.findMany({
      where: { OR: [{ nama: { contains: "imalia", mode: "insensitive" } }] },
      take: 5,
    })
    console.log("imalia result:", JSON.stringify(r2.map(x => ({ id: x.id, nama: x.nama }))))
    const r3 = await prisma.relawan.findMany({
      where: { OR: [{ nik: { contains: search, mode: "insensitive" } }] },
      take: 5,
    })
    console.log("nik result:", JSON.stringify(r3.map(x => ({ id: x.id, nik: x.nik }))))
  } catch(e) { console.error("ERR:", e) }
  await prisma.$disconnect()
}
main()
