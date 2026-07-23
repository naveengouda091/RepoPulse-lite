export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          RepoPulse Lite
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
          Repository intelligence for technical and executive review.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
          Analyze GitHub repository activity, complexity, and health without a
          database or persistent application state.
        </p>
      </section>
    </main>
  );
}
