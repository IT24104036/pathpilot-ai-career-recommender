import { useEffect, useRef, useState } from "react";
import {
  Pencil,
  Save,
  X,
  Trash2,
  AlertTriangle,
  Mail,
  GraduationCap,
  Briefcase,
  Linkedin,
  Github,
  Globe,
  BadgeCheck,
  Loader2,
  Check,
  Upload,
  Camera,
} from "lucide-react";
import {
  fetchProfile,
  updateProfile,
  deleteAccount,
  uploadPhoto,
  clearUserSession,
  type UserProfile,
  type UserSession,
} from "@/lib/auth-api";

const inputCls =
  "w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";
const labelCls =
  "block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground mb-1.5";

interface FormState {
  name: string;
  avatarUrl: string;
  university: string;
  degree: string;
  specialization: string;
  yearStatus: string;
  careerInterests: string; // comma-separated in the form
  skills: string; // comma-separated in the form
  bio: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

function toForm(p: UserProfile): FormState {
  return {
    name: p.name ?? "",
    avatarUrl: p.avatarUrl ?? "",
    university: p.university ?? "",
    degree: p.degree ?? "",
    specialization: p.specialization ?? "",
    yearStatus: p.yearStatus ?? "",
    careerInterests: (p.careerInterests ?? []).join(", "),
    skills: (p.skills ?? []).join(", "),
    bio: p.bio ?? "",
    linkedinUrl: p.linkedinUrl ?? "",
    githubUrl: p.githubUrl ?? "",
    portfolioUrl: p.portfolioUrl ?? "",
  };
}

const splitList = (s: string) =>
  s
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, 30);

export function ProfilePanel({
  session,
  onUpdated,
  onDeleted,
}: {
  session: UserSession;
  onUpdated?: (p: UserProfile) => void;
  onDeleted: () => void;
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteAck, setDeleteAck] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProfile().then((p) => {
      if (cancelled) return;
      // Fall back to a minimal profile from the session if the request fails.
      const resolved: UserProfile = p ?? {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        createdAt: session.createdAt,
        avatarUrl: "",
        university: "",
        degree: "",
        specialization: "",
        yearStatus: "",
        careerInterests: [],
        skills: [],
        bio: "",
        linkedinUrl: "",
        githubUrl: "",
        portfolioUrl: "",
      };
      setProfile(resolved);
      setForm(toForm(resolved));
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function handleSave() {
    if (!form) return;
    if (!form.name.trim()) {
      setError("Full name is required.");
      return;
    }
    setSaving(true);
    setError("");
    const result = await updateProfile({
      name: form.name,
      avatarUrl: form.avatarUrl,
      university: form.university,
      degree: form.degree,
      specialization: form.specialization,
      yearStatus: form.yearStatus,
      careerInterests: splitList(form.careerInterests),
      skills: splitList(form.skills),
      bio: form.bio,
      linkedinUrl: form.linkedinUrl,
      githubUrl: form.githubUrl,
      portfolioUrl: form.portfolioUrl,
    });
    setSaving(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setProfile(result.profile);
    setForm(toForm(result.profile));
    onUpdated?.(result.profile);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleUpload(file: File) {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("Image must be under 3 MB.");
      return;
    }
    setUploading(true);
    const result = await uploadPhoto(file);
    setUploading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    // Photo is saved server-side; reflect it everywhere immediately.
    setProfile(result.profile);
    setForm((f) => (f ? { ...f, avatarUrl: result.profile.avatarUrl } : f));
    onUpdated?.(result.profile);
  }

  async function handleDelete() {
    setDeleting(true);
    const ok = await deleteAccount();
    if (ok) {
      clearUserSession();
      onDeleted();
    } else {
      setDeleting(false);
      setError("Could not delete your account. Please try again.");
      setDeleteOpen(false);
    }
  }

  if (!profile || !form) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const initial = profile.name.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Saved toast */}
      {saved && (
        <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary animate-fade-up">
          <Check className="h-4 w-4" /> Profile saved.
        </div>
      )}
      {error && !deleteOpen && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* ── Header card ── */}
      <div className="rounded-[1.75rem] premium-panel p-7">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <Avatar url={profile.avatarUrl} initial={initial} />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-semibold tracking-tight">{profile.name}</h2>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-accent/60 px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
              <BadgeCheck className="h-3 w-3" /> {profile.role}
            </span>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> {profile.email}
            </p>
          </div>
          {!editing && (
            <button
              onClick={() => {
                setForm(toForm(profile));
                setEditing(true);
                setError("");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit profile
            </button>
          )}
        </div>
      </div>

      {/* ── View mode ── */}
      {!editing ? (
        <>
          <Section icon={GraduationCap} title="Education">
            <Field label="University / Institute" value={profile.university} />
            <Field label="Degree" value={profile.degree} />
            <Field label="Specialization" value={profile.specialization} />
            <Field label="Year / Status" value={profile.yearStatus} />
          </Section>

          <Section icon={Briefcase} title="Career">
            <ChipField label="Target career interests" items={profile.careerInterests} />
            <ChipField label="Current skills" items={profile.skills} />
            <div>
              <p className={labelCls}>Bio / Career goal</p>
              <p className="text-sm leading-relaxed text-foreground">
                {profile.bio || <span className="text-muted-foreground/60">—</span>}
              </p>
            </div>
          </Section>

          <Section icon={Globe} title="Links">
            <LinkRow icon={Linkedin} label="LinkedIn" url={profile.linkedinUrl} />
            <LinkRow icon={Github} label="GitHub" url={profile.githubUrl} />
            <LinkRow icon={Globe} label="Portfolio" url={profile.portfolioUrl} />
          </Section>

          {/* ── Danger zone ── */}
          <div className="rounded-[1.75rem] border border-destructive/30 bg-destructive/[0.03] p-7">
            <h3 className="font-display text-lg font-semibold tracking-tight text-destructive">
              Danger zone
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Permanently delete your account and all of your saved assessments. This cannot be
              undone.
            </p>
            <button
              onClick={() => {
                setDeleteAck(false);
                setError("");
                setDeleteOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-destructive/40 px-4 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete account
            </button>
          </div>
        </>
      ) : (
        /* ── Edit mode ── */
        <div className="space-y-6">
          {/* Profile photo control */}
          <div className="rounded-[1.75rem] premium-panel p-7">
            <div className="mb-5 flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-semibold tracking-tight">Profile photo</h3>
              <div className="ml-3 h-px flex-1 bg-border" />
            </div>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <Avatar url={form.avatarUrl} initial={initial} />
              <div className="w-full flex-1 space-y-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                    e.target.value = "";
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload photo
                  </button>
                  {form.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => set("avatarUrl", "")}
                      className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  )}
                </div>
                <Input
                  label="…or paste an image URL"
                  value={form.avatarUrl}
                  onChange={(v) => set("avatarUrl", v)}
                  placeholder="https://…/photo.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Upload a JPG/PNG (max 3 MB) from your device, or paste a link. The preview updates
                  instantly.
                </p>
              </div>
            </div>
          </div>

          <EditSection icon={GraduationCap} title="Basics & Education">
            <Input label="Full name" value={form.name} onChange={(v) => set("name", v)} />
            <Input
              label="University / Institute"
              value={form.university}
              onChange={(v) => set("university", v)}
            />
            <Input
              label="Degree"
              value={form.degree}
              onChange={(v) => set("degree", v)}
              placeholder="e.g. BSc Computer Science"
            />
            <Input
              label="Specialization"
              value={form.specialization}
              onChange={(v) => set("specialization", v)}
              placeholder="e.g. Data Science"
            />
            <Input
              label="Year / Status"
              value={form.yearStatus}
              onChange={(v) => set("yearStatus", v)}
              placeholder="e.g. Final year / Graduate"
            />
          </EditSection>

          <EditSection icon={Briefcase} title="Career">
            <Input
              label="Target career interests (comma-separated)"
              value={form.careerInterests}
              onChange={(v) => set("careerInterests", v)}
              placeholder="Data Scientist, ML Engineer"
            />
            <Input
              label="Current skills (comma-separated)"
              value={form.skills}
              onChange={(v) => set("skills", v)}
              placeholder="Python, SQL, React"
            />
            <div className="sm:col-span-2">
              <label className={labelCls}>Bio / Career goal</label>
              <textarea
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="A sentence about where you want to go in tech…"
                className={inputCls}
              />
            </div>
          </EditSection>

          <EditSection icon={Globe} title="Links">
            <Input
              label="LinkedIn URL"
              value={form.linkedinUrl}
              onChange={(v) => set("linkedinUrl", v)}
              placeholder="https://linkedin.com/in/…"
            />
            <Input
              label="GitHub URL"
              value={form.githubUrl}
              onChange={(v) => set("githubUrl", v)}
              placeholder="https://github.com/…"
            />
            <Input
              label="Portfolio URL"
              value={form.portfolioUrl}
              onChange={(v) => set("portfolioUrl", v)}
              placeholder="https://…"
            />
          </EditSection>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save changes
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setError("");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setDeleteOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-[1.5rem] border border-border bg-card p-7 shadow-card animate-fade-up">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="font-display text-xl font-semibold tracking-tight">
              Delete your account?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              This is <span className="font-semibold text-destructive">permanent</span>. Your
              account, profile, and all saved assessment results will be erased from our database.
              You can't undo this.
            </p>

            <label className="mt-5 flex items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={deleteAck}
                onChange={(e) => setDeleteAck(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[oklch(0.6_0.22_27)]"
              />
              I understand this action is permanent.
            </label>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteOpen(false)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!deleteAck || deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small presentational helpers ──────────────────────────────────────────────

function Avatar({ url, initial }: { url: string; initial: string }) {
  return url ? (
    <img
      src={url}
      alt="Profile"
      className="h-24 w-24 flex-shrink-0 rounded-full border border-border object-cover shadow-card"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  ) : (
    <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-gradient-primary text-3xl font-bold text-primary-foreground shadow-glow">
      {initial}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Mail;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] premium-panel p-7">
      <div className="mb-5 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
        <div className="ml-3 h-px flex-1 bg-border" />
      </div>
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function EditSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Mail;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] premium-panel p-7">
      <div className="mb-5 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
        <div className="ml-3 h-px flex-1 bg-border" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className={labelCls}>{label}</p>
      <p className="text-sm text-foreground">
        {value || <span className="text-muted-foreground/60">—</span>}
      </p>
    </div>
  );
}

function ChipField({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="sm:col-span-2">
      <p className={labelCls}>{label}</p>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((it) => (
            <span
              key={it}
              className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium"
            >
              {it}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground/60">—</span>
      )}
    </div>
  );
}

function LinkRow({ icon: Icon, label, url }: { icon: typeof Mail; label: string; url: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{label}</span>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto max-w-[60%] truncate text-sm font-medium text-primary hover:underline"
        >
          {url.replace(/^https?:\/\//, "")}
        </a>
      ) : (
        <span className="ml-auto text-sm text-muted-foreground/60">—</span>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );
}
