export type Theme = 'light' | 'dark' | 'yellow' | 'ramadan' | 'valentine'

export type AspirasiStatus = 'BELUM_DITINDAKLANJUTI' | 'SEDANG_DITINDAKLANJUTI' | 'SUDAH_DITINDAKLANJUTI' | 'TIDAK_BISA_DITINDAKLANJUTI'

export type SumberAspirasi =
  | 'LEMBAR_ASPIRASI_RESES'
  | 'LEMBAR_ASPIRASI_SOSPERDA'
  | 'ASPIRASI_PROPOSAL_LANGSUNG'
  | 'KOORDINASI_DINAS_TERKAIT'
  | 'USULAN_MUSRENBANG_DEWAN'
  | 'CALL_CENTER'

export interface Kunjungan {
  id: string
  jenis_kegiatan?: string
  tanggal: string
  jam: string
  jalan: string
  kelurahan: string
  kecamatan: string
  kota: string
  link_gmaps?: string
  created_at: string
  updated_at: string
}

export interface Aspirasi {
  id: string
  nik?: string
  sumber: SumberAspirasi
  deskripsi: string
  status: AspirasiStatus
  pelapor_nama: string
  pelapor_email: string
  pelapor_telepon: string
  lampiran: string[]
  bukti_tindak_lanjut: string[]
  catatan_tindak_lanjut: string
  kategori_usulan: string
  jenis_usulan: string
  jenis_reses: string
  tindak_lanjut: string
  tanggal_dibuat: string
  created_at: string
  updated_at: string
  kota?: string
  kecamatan?: string
  kelurahan?: string
  lokasi?: string
}

export interface MasterKecamatan {
  id: string
  nama: string
}

export interface MasterKelurahan {
  id: string
  kecamatan_id: string
  nama: string
}

export interface KecamatanStat {
  kecamatan: string
  jumlah_kunjungan: number
  jumlah_kelurahan: number
  kelurahan_dikunjungi: number
}

export interface DashboardStats {
  total_kunjungan: number
  total_aspirasi: number
  kunjungan_per_bulan: { bulan: string; jumlah: number }[]
  aspirasi_per_bulan: { bulan: string; jumlah: number }[]
  aspirasi_per_status: { status: AspirasiStatus; jumlah: number }[]
  aspirasi_per_sumber: { sumber: SumberAspirasi; jumlah: number }[]
  kelurahan_dikunjungi: number
  kelurahan_belum_dikunjungi: number
  total_kelurahan: number
  kunjungan_per_kecamatan: KecamatanStat[]
}

export type JenisKelamin = 'LAKI_LAKI' | 'PEREMPUAN'

export type PosisiRelawan =
  | 'KOORDINATOR_RW'
  | 'KOORDINATOR_RT'
  | 'KOORDINATOR_KELURAHAN'
  | 'KOORDINATOR_KECAMATAN'
  | 'FKDM'
  | 'LMK'
  | 'TOKOH_MASYARAKAT'
  | 'PROFESIONAL'

export interface Relawan {
  id: string
  nik: string
  nama: string
  no_telepon: string
  jenis_kelamin: JenisKelamin
  kota_kabupaten: string
  kecamatan: string
  kelurahan: string
  alamat: string
  posisi: PosisiRelawan
  created_at: string
  updated_at: string
}

export interface Kegiatan {
  id: string
  kunjungan_id: string
  isi: string
  hari: string
  tanggal: string
  lokasi: string
  foto: string
  jenis_kegiatan: string
  nama_kegiatan: string
  link_gmaps: string
  rt: string
  rw: string
  jumlah_peserta: number
  catatan: string
}