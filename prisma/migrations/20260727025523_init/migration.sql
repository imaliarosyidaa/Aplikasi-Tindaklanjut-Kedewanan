-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'user') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kotas` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `kotas_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kecamatans` (
    `id` VARCHAR(191) NOT NULL,
    `kota_id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `kecamatans_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kelurahans` (
    `id` VARCHAR(191) NOT NULL,
    `kecamatan_id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kunjungans` (
    `id` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `jam` VARCHAR(191) NOT NULL,
    `jalan` VARCHAR(191) NOT NULL,
    `kelurahan_id` VARCHAR(191) NOT NULL,
    `kecamatan_id` VARCHAR(191) NOT NULL,
    `kota_id` VARCHAR(191) NOT NULL,
    `link_gmaps` VARCHAR(191) NULL DEFAULT '',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aspirasis` (
    `id` VARCHAR(191) NOT NULL,
    `id_laporan` VARCHAR(191) NULL DEFAULT '',
    `nik` VARCHAR(191) NULL DEFAULT '',
    `sumber` ENUM('LEMBAR_ASPIRASI_RESES', 'LEMBAR_ASPIRASI_SOSPERDA', 'ASPIRASI_PROPOSAL_LANGSUNG', 'KOORDINASI_DINAS_TERKAIT', 'USULAN_MUSRENBANG_DEWAN', 'CALL_CENTER') NOT NULL,
    `deskripsi` VARCHAR(191) NOT NULL,
    `status` ENUM('BELUM_DITINDAKLANJUTI', 'SEDANG_DITINDAKLANJUTI', 'SUDAH_DITINDAKLANJUTI', 'TIDAK_BISA_DITINDAKLANJUTI') NOT NULL,
    `pelapor_nama` VARCHAR(191) NOT NULL,
    `pelapor_email` VARCHAR(191) NULL DEFAULT '',
    `pelapor_telepon` VARCHAR(191) NOT NULL,
    `lampiran` JSON NULL,
    `kategori_usulan` VARCHAR(191) NOT NULL,
    `jenis_usulan` VARCHAR(191) NOT NULL,
    `jenis_reses` VARCHAR(191) NOT NULL,
    `tindak_lanjut` VARCHAR(191) NOT NULL,
    `tanggal_dibuat` DATETIME(3) NOT NULL,
    `kota_id` VARCHAR(191) NULL,
    `kecamatan_id` VARCHAR(191) NULL,
    `kelurahan_id` VARCHAR(191) NULL,
    `alamat` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tracking_aspirasis` (
    `id` VARCHAR(191) NOT NULL,
    `aspirasi_id` VARCHAR(191) NOT NULL,
    `status` ENUM('BELUM_DITINDAKLANJUTI', 'SEDANG_DITINDAKLANJUTI', 'SUDAH_DITINDAKLANJUTI', 'TIDAK_BISA_DITINDAKLANJUTI') NOT NULL,
    `catatan` VARCHAR(191) NULL,
    `lampiran` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `relawans` (
    `id` VARCHAR(191) NOT NULL,
    `nik` VARCHAR(191) NULL,
    `nama` VARCHAR(191) NOT NULL,
    `no_telepon` VARCHAR(191) NULL,
    `jenis_kelamin` ENUM('LAKI_LAKI', 'PEREMPUAN') NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `domisili_sekarang` VARCHAR(191) NULL,
    `posisi` ENUM('KOORDINATOR_RW', 'KOORDINATOR_RT', 'KOORDINATOR_KELURAHAN', 'KOORDINATOR_KECAMATAN', 'FKDM', 'LMK', 'TOKOH_MASYARAKAT', 'PROFESIONAL') NOT NULL,
    `foto` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `kota_id` VARCHAR(191) NOT NULL,
    `kecamatan_id` VARCHAR(191) NOT NULL,
    `kelurahan_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `relawans_nik_key`(`nik`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kegiatans` (
    `id` VARCHAR(191) NOT NULL,
    `jenis_kegiatan` VARCHAR(191) NOT NULL DEFAULT '',
    `kunjungan_id` VARCHAR(191) NOT NULL,
    `isi` VARCHAR(191) NULL,
    `hari` VARCHAR(191) NULL,
    `tanggal` DATETIME(3) NULL,
    `foto` VARCHAR(191) NULL,
    `nama_kegiatan` VARCHAR(191) NOT NULL,
    `link_gmaps` VARCHAR(191) NULL,
    `tempat` VARCHAR(191) NULL,
    `alamat` VARCHAR(191) NULL,
    `rt` VARCHAR(191) NULL,
    `rw` VARCHAR(191) NULL,
    `jumlah_peserta` INTEGER NULL,
    `catatan` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_KelurahanToKota` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_KelurahanToKota_AB_unique`(`A`, `B`),
    INDEX `_KelurahanToKota_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `kecamatans` ADD CONSTRAINT `kecamatans_kota_id_fkey` FOREIGN KEY (`kota_id`) REFERENCES `kotas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kelurahans` ADD CONSTRAINT `kelurahans_kecamatan_id_fkey` FOREIGN KEY (`kecamatan_id`) REFERENCES `kecamatans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kunjungans` ADD CONSTRAINT `kunjungans_kelurahan_id_fkey` FOREIGN KEY (`kelurahan_id`) REFERENCES `kelurahans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kunjungans` ADD CONSTRAINT `kunjungans_kecamatan_id_fkey` FOREIGN KEY (`kecamatan_id`) REFERENCES `kecamatans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kunjungans` ADD CONSTRAINT `kunjungans_kota_id_fkey` FOREIGN KEY (`kota_id`) REFERENCES `kotas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirasis` ADD CONSTRAINT `aspirasis_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirasis` ADD CONSTRAINT `aspirasis_kota_id_fkey` FOREIGN KEY (`kota_id`) REFERENCES `kotas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirasis` ADD CONSTRAINT `aspirasis_kecamatan_id_fkey` FOREIGN KEY (`kecamatan_id`) REFERENCES `kecamatans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aspirasis` ADD CONSTRAINT `aspirasis_kelurahan_id_fkey` FOREIGN KEY (`kelurahan_id`) REFERENCES `kelurahans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tracking_aspirasis` ADD CONSTRAINT `tracking_aspirasis_aspirasi_id_fkey` FOREIGN KEY (`aspirasi_id`) REFERENCES `aspirasis`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relawans` ADD CONSTRAINT `relawans_kota_id_fkey` FOREIGN KEY (`kota_id`) REFERENCES `kotas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relawans` ADD CONSTRAINT `relawans_kecamatan_id_fkey` FOREIGN KEY (`kecamatan_id`) REFERENCES `kecamatans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relawans` ADD CONSTRAINT `relawans_kelurahan_id_fkey` FOREIGN KEY (`kelurahan_id`) REFERENCES `kelurahans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kegiatans` ADD CONSTRAINT `kegiatans_kunjungan_id_fkey` FOREIGN KEY (`kunjungan_id`) REFERENCES `kunjungans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_KelurahanToKota` ADD CONSTRAINT `_KelurahanToKota_A_fkey` FOREIGN KEY (`A`) REFERENCES `kelurahans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_KelurahanToKota` ADD CONSTRAINT `_KelurahanToKota_B_fkey` FOREIGN KEY (`B`) REFERENCES `kotas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
