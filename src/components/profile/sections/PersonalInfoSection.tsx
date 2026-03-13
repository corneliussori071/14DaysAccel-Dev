"use client";

import { useState, useEffect } from "react";
import { getProfile, updateProfile, changePassword } from "@/services/profileService";
import { supabase } from "@/lib/supabase";

export default function PersonalInfoSection() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    async function load() {
      const profile = await getProfile();
      if (profile) {
        setFullName(profile.full_name);
        setPhoneNumber(profile.phone_number);
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setEmail(session.user.email);
      }
    }
    load();
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateProfile({ full_name: fullName, phone_number: phoneNumber });
      setMessage("Profile updated successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage("");

    if (newPassword.length < 8) {
      setPasswordMessage("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("Passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(newPassword);
      setPasswordMessage("Password changed successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMessage(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-zinc-900">
        Personal Information
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Update your name, phone number, or password.
      </p>

      <form onSubmit={handleSaveProfile} className="mt-6 max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm text-zinc-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        {message && (
          <p className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <hr className="my-8 border-zinc-200" />

      <h2 className="text-lg font-semibold text-zinc-900">Change Password</h2>

      <form onSubmit={handleChangePassword} className="mt-4 max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
            placeholder="Min. 8 characters"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
            placeholder="Re-enter password"
          />
        </div>

        {passwordMessage && (
          <p className={`text-sm ${passwordMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {passwordMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={changingPassword}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
        >
          {changingPassword ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
