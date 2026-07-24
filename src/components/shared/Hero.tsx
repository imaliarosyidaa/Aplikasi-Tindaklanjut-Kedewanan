interface HeroProps {
  title: string
  highlight?: string
  subtitle?: string
  badge?: string
  children?: React.ReactNode
}

export default function Hero({
  title,
  highlight,
  subtitle,
  badge,
  children,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-blue-200 blur-3xl" />
        <div className="absolute right-10 top-40 h-72 w-72 rounded-full bg-purple-200 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-pink-200 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {badge && (
          <span className="inline-flex rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
            {badge}
          </span>
        )}

        <h1 className="mt-6 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
          {title}

          {highlight && (
            <>
              {" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {highlight}
              </span>
            </>
          )}
        </h1>

        {subtitle && (
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            {subtitle}
          </p>
        )}

        {children && (
          <div className="mt-8 flex justify-center gap-4">
            {children}
          </div>
        )}
      </div>
    </section>
  )
}