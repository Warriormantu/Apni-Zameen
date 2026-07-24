const HomePage = () => {
  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-16 text-white shadow-xl">
        <h1 className="text-4xl font-semibold sm:text-5xl">Find your ideal home in India</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-200">
          Search premium listings, compare properties, and connect with owners or agents seamlessly.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">For Buyers</h2>
          <p className="mt-3 text-slate-600">Browse verified apartments, villas, homes, and commercial spaces with local insights.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">For Tenants</h2>
          <p className="mt-3 text-slate-600">Find rental homes, PGs, and co-living with easy scheduling and favorites.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">For Owners & Agents</h2>
          <p className="mt-3 text-slate-600">List properties quickly, manage inquiries, and track leads with confidence.</p>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
