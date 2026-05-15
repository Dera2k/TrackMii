"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useUpdateProfile, useUpdatePreferences, useUpdatePassword } from "@/hooks/queries/useUser"
import { useLogout } from "@/hooks/queries/useAuth"
import { useTheme } from "next-themes"
import { Moon, Sun, Download, LogOut } from "lucide-react"
import { CURRENCY_SYMBOLS } from "@/lib/constants"
import type { Currency } from "@/lib/types"

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const logout = useLogout()

  const updateProfile = useUpdateProfile()
  const updatePreferences = useUpdatePreferences()
  const updatePassword = useUpdatePassword()

  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [currency, setCurrency] = useState<Currency>(user?.currency ?? "NGN")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setCurrency(user.currency)
    }
  }, [user])

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-sm font-semibold">Profile</h2>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <button
          onClick={() => updateProfile.mutate({ name, email })}
          disabled={updateProfile.isPending}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {updateProfile.isPending ? "Saving..." : "Update Profile"}
        </button>
      </div>

      {/* Preferences */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-sm font-semibold">Preferences</h2>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Default Currency</label>
          <div className="flex gap-3">
            {(Object.keys(CURRENCY_SYMBOLS) as Currency[]).map((c) => (
              <button key={c}
                onClick={() => { setCurrency(c); updatePreferences.mutate({ currency: c }) }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${currency === c ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
              >
                {CURRENCY_SYMBOLS[c]} {c}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dark Mode</p>
            <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
          </div>
          <button
            onClick={() => {
              const next = theme === "dark" ? "light" : "dark"
              setTheme(next)
              updatePreferences.mutate({ dark_mode: next === "dark" })
            }}
            className={`w-12 h-7 rounded-full relative transition-colors ${theme === "dark" ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow transition-transform flex items-center justify-center ${theme === "dark" ? "translate-x-5" : "translate-x-0.5"}`}>
              {theme === "dark" ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
            </span>
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-sm font-semibold">Change Password</h2>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Current Password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" placeholder="••••••••" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">New Password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" placeholder="••••••••" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" placeholder="••••••••" />
        </div>
        {newPassword && confirmPassword && newPassword !== confirmPassword && (
          <p className="text-xs text-destructive">Passwords do not match</p>
        )}
        <button
          onClick={() => {
            if (newPassword !== confirmPassword) return
            updatePassword.mutate({ current_password: currentPassword, new_password: newPassword })
            setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
          }}
          disabled={updatePassword.isPending || !currentPassword || !newPassword || newPassword !== confirmPassword}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {updatePassword.isPending ? "Updating..." : "Update Password"}
        </button>
      </div>

      {/* Export */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold mb-2">Data Export</h2>
        <p className="text-sm text-muted-foreground mb-4">Download all your expense data as CSV</p>
        <button
          onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/export/csv`, "_blank")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
        >
          <Download className="w-4 h-4" /> Export to CSV
        </button>
      </div>

      {/* Logout */}
      <button onClick={logout}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors">
        <LogOut className="w-4 h-4" /> Log out
      </button>
    </div>
  )
}