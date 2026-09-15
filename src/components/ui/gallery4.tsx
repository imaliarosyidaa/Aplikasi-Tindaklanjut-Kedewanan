'use client'

import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'

export interface Gallery4Item {
  id: string
  title: string
  description: string
  href: string
  image: string
}

export interface Gallery4Props {
  title?: string
  description?: string
  items: Gallery4Item[]
}

const Gallery4 = ({ items }: Gallery4Props) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // State untuk mengontrol Modal / Lightbox
  const [selectedItem, setSelectedItem] = useState<Gallery4Item | null>(null)

  useEffect(() => {
    if (!carouselApi) {
      return
    }
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev())
      setCanScrollNext(carouselApi.canScrollNext())
      setCurrentSlide(carouselApi.selectedScrollSnap())
    }
    updateSelection()
    carouselApi.on('select', updateSelection)
    return () => {
      carouselApi.off('select', updateSelection)
    }
  }, [carouselApi])

  // Menutup modal dengan tombol ESC pada keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedItem(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!items || items.length === 0) return null

  return (
    <section className="pb-8">
      <div className="container mx-auto">
        <div className="mb-8 flex items-end justify-end md:mb-10 lg:mb-12">
          <div className="hidden shrink-0 gap-2 md:flex">
            <button
              type="button"
              aria-label="Scroll previous"
              onClick={() => {
                carouselApi?.scrollPrev()
              }}
              disabled={!canScrollPrev}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg-secondary)] disabled:pointer-events-none disabled:opacity-50"
            >
              <ArrowLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Scroll next"
              onClick={() => {
                carouselApi?.scrollNext()
              }}
              disabled={!canScrollNext}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg-secondary)] disabled:pointer-events-none disabled:opacity-50"
            >
              <ArrowRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="w-full">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            breakpoints: {
              '(max-width: 768px)': {
                dragFree: true,
              },
            },
          }}
        >
          <CarouselContent className="ml-0 2xl:ml-[max(8rem,calc(50vw-700px))] 2xl:mr-[max(0rem,calc(50vw-700px))]">
            {items.map((item) => (
              <CarouselItem key={item.id} className="max-w-[320px] pl-[20px] lg:max-w-[360px]">
                {/* Ketika card/foto diklik, buka modal */}
                <div onClick={() => setSelectedItem(item)} className="group cursor-pointer rounded-xl">
                  <div className="group relative h-full min-h-[27rem] max-w-full overflow-hidden rounded-xl md:aspect-[5/4] lg:aspect-[16/9]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-6 text-white md:p-8">
                      <div className="mb-2 text-xl font-semibold md:mb-3">{item.title}</div>
                      <div className="mb-8 line-clamp-2 md:mb-12 lg:mb-9">{item.description}</div>
                      <div className="flex items-center text-sm">
                        Lihat Foto <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="mt-8 flex justify-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                currentSlide === index ? 'bg-primary' : 'bg-primary/20'
              }`}
              onClick={() => carouselApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Modal / Lightbox dengan Caption di Samping */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Close */}
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              aria-label="Close modal"
            >
              <X className="size-5" />
            </button>

            {/* Bagian Foto */}
            <div className="relative flex-1 bg-black flex items-center justify-center max-h-[60vh] md:max-h-none">
              <img src={selectedItem.image} alt={selectedItem.title} className="h-full w-full object-contain" />
            </div>

            {/* Bagian Caption di Samping */}
            <div className="flex w-full flex-col justify-between p-6 md:w-80 lg:w-96">
              <div>
                <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Detail Galeri
                </span>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 md:text-2xl">{selectedItem.title}</h3>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {selectedItem.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export { Gallery4 }
