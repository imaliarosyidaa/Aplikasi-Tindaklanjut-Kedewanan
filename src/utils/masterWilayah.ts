export interface KecamatanData {
  id: string
  nama: string
  kelurahan: { id: string; nama: string }[]
}

export interface KelurahanData {
  id: string;
  nama: string;
}

export interface KecamatanData {
  id: string;
  nama: string;
  kelurahan: KelurahanData[];
}

export const MASTER_WILAYAH: KecamatanData[] = [
    {
    id: 'kec-1',
    nama: 'Tebet',
    kelurahan: [
      { id: 'kel-5-1', nama: 'Bukit Duri' },
      { id: 'kel-5-2', nama: 'Kebon Baru' },
      { id: 'kel-5-3', nama: 'Manggarai' },
      { id: 'kel-5-4', nama: 'Manggarai Dalam' },
      { id: 'kel-5-5', nama: 'Manggarai Selatan' },
      { id: 'kel-5-6', nama: 'Tebet Barat' },
      { id: 'kel-5-7', nama: 'Tebet Timur' },
    ],
  },
  {
    id: 'kec-2',
    nama: 'Mampang Prapatan',
    kelurahan: [
      { id: 'kel-2-1', nama: 'Bangka' },
      { id: 'kel-2-2', nama: 'Kuningan Barat' },
      { id: 'kel-2-3', nama: 'Mampang Prapatan' },
      { id: 'kel-2-4', nama: 'Pela Mampang' },
      { id: 'kel-2-5', nama: 'Tegal Parang' },
    ],
  },
    {
    id: 'kec-3',
    nama: 'Pasar Minggu',
    kelurahan: [
      { id: 'kel-4-1', nama: 'Cilandak Timur' },
      { id: 'kel-4-2', nama: 'Jati Padang' },
      { id: 'kel-4-3', nama: 'Kebagusan' },
      { id: 'kel-4-4', nama: 'Pasar Minggu' },
      { id: 'kel-4-5', nama: 'Pejaten Barat' },
      { id: 'kel-4-6', nama: 'Pejaten Timur' },
      { id: 'kel-4-7', nama: 'Ragunan' },
    ],
  },
    {
    id: 'kec-4',
    nama: 'Pancoran',
    kelurahan: [
      { id: 'kel-3-1', nama: 'Cikoko' },
      { id: 'kel-3-2', nama: 'Duren Tiga' },
      { id: 'kel-3-3', nama: 'Kalibata' },
      { id: 'kel-3-4', nama: 'Pancoran' },
      { id: 'kel-3-5', nama: 'Pengadegan' },
      { id: 'kel-3-6', nama: 'Rawa Jati' },
    ],
  },
    {
    id: 'kec-5',
    nama: 'Jagakarsa',
    kelurahan: [
      { id: 'kel-1-1', nama: 'Ciganjur' },
      { id: 'kel-1-2', nama: 'Cipedak' },
      { id: 'kel-1-3', nama: 'Jagakarsa' },
      { id: 'kel-1-4', nama: 'Lenteng Agung' },
      { id: 'kel-1-5', nama: 'Srengseng Sawah' },
      { id: 'kel-1-6', nama: 'Tanjung Barat' },
    ],
  },
];

export function getKecamatanOptions() {
  return MASTER_WILAYAH.map((k) => ({ value: k.id, label: k.nama }))
}

export function getKelurahanByKecamatanId(kecamatanId: string) {
  const kecamatan = MASTER_WILAYAH.find((k) => k.id === kecamatanId)
  return kecamatan
    ? kecamatan.kelurahan.map((kel) => ({ value: kel.id, label: kel.nama }))
    : []
}

export function getKecamatanNameById(kecamatanId: string) {
  return MASTER_WILAYAH.find((k) => k.id === kecamatanId)?.nama ?? ''
}

export function getKelurahanNameById(kelurahanId: string) {
  for (const kec of MASTER_WILAYAH) {
    const kel = kec.kelurahan.find((k) => k.id === kelurahanId)
    if (kel) return kel.nama
  }
  return ''
}
