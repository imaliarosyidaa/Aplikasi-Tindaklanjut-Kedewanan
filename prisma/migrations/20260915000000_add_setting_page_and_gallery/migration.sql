-- CreateTable
CREATE TABLE "setting_page" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "hero_image" TEXT NOT NULL DEFAULT '',
    "hero_title" TEXT NOT NULL DEFAULT '',
    "hero_highlight" TEXT NOT NULL DEFAULT '',
    "hero_subtitle" TEXT NOT NULL DEFAULT '',
    "hero_badge" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "setting_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "caption" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gallery_items_sort_order_idx" ON "gallery_items"("sort_order");