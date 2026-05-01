const AdminAccessNotice = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="bg-white border border-black/5 shadow-sm p-8 md:p-10 space-y-4">
        <p className="text-[10px] uppercase tracking-[0.35em] opacity-50">Admin Access Required</p>
        <h1 className="text-3xl md:text-4xl font-serif">This section is reserved for the studio owner.</h1>
        <p className="text-sm leading-relaxed opacity-65">
          Sign in through the dedicated admin login, then mark that user's record as
          <code className="mx-1">role: "admin"</code>
          in Firebase. Super admin remains your recovery path, and new sign-ins are created as customers by default for safety.
        </p>
      </div>
    </div>
  );
};

export default AdminAccessNotice;
