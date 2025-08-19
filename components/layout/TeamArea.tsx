"use client";

export default function TeamArea() {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-5">
        <h2 className="text-xl font-semibold text-[#0b1220] dark:text-white">
          Team (Coming Soon)
        </h2>
        <p className="mt-1 text-sm text-[#0b1220]/70 dark:text-[#dbe7ff]/70">
          Soon you will be able to add team members, assign roles, and manage
          email notifications. This feature is under development. 🚧
        </p>

        <div className="mt-4 flex items-center gap-3">
          <button
            disabled
            aria-disabled
            title="Coming soon"
            className="px-4 py-2 rounded-lg bg-white/20 text-[#0b1220]/60 dark:text-[#dbe7ff]/60
                       border border-white/20 cursor-not-allowed"
          >
            Invite member
          </button>

          <span className="text-xs text-[#0b1220]/60 dark:text-[#dbe7ff]/60">
            (Button will be active soon)
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-5">
        <h3 className="font-medium text-[#0b1220] dark:text-white">Planned features</h3>
        <ul className="mt-2 list-disc pl-5 text-sm text-[#0b1220]/70 dark:text-[#dbe7ff]/70 space-y-1">
          <li>Invite members via email</li>
          <li>Roles: Owner, Admin, Read&nbsp;&amp;&nbsp;Action, Read</li>
          <li>Mail access permissions and notification settings</li>
          <li>Activity history and security audit logs</li>
        </ul>
      </div>
    </section>
  );
}
