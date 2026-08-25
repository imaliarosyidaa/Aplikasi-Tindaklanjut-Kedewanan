interface HeroClassicProps {
  title: string
  highlight?: string
  subtitle?: string
  badge?: string
  children?: React.ReactNode
}

export default function HeroClassic({ title, highlight, subtitle, badge, children }: HeroClassicProps) {
  return (
    <section className="relative w-full overflow-hidden bg-[var(--color-bg)] pb-44 text-center text-sm">
      {/* Grid background */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 39px,
              var(--color-grid) 39px,
              var(--color-grid) 40px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 39px,
              var(--color-grid) 39px,
              var(--color-grid) 40px
            )
          `,
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6">
        {badge && (
          <div className="mx-auto mt-16 flex w-max items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 md:mt-24">
            <span className="text-sm text-[var(--color-text-secondary)]">{badge}</span>
          </div>
        )}

        <h1 className="mx-auto mt-8 max-w-[850px] text-4xl font-semibold leading-tight text-[var(--color-text)] md:text-7xl">
          {title}

          {highlight && (
            <>
              {' '}
              <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] bg-clip-text text-transparent">
                {highlight}
              </span>
            </>
          )}
        </h1>

        {subtitle && (
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)] md:text-base">
            {subtitle}
          </p>
        )}

        {children && <div className="mx-auto mt-4 flex w-full items-center justify-center gap-3">{children}</div>}
      </div>
    </section>
  )
}
