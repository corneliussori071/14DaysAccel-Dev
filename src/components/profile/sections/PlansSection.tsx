"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTokenWallet } from "@/services/tokenService";
import type { TokenWallet } from "@/types/softwarePlan";

export default function PlansSection() {
  const [wallet, setWallet] = useState<TokenWallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getTokenWallet();
      setWallet(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-sm text-zinc-500">Loading plan details...</p>
      </div>
    );
  }

  const balance = wallet?.balance_tokens ?? 0;
  const memberSince = wallet?.created_at
    ? new Date(wallet.created_at).toLocaleDateString()
    : "N/A";

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-zinc-900">Plans</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Your current subscription and token balance.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            Current Plan
          </p>
          <p className="mt-2 text-lg font-semibold text-zinc-900">Free Tier</p>
          <p className="mt-1 text-sm text-zinc-500">
            1,000 tokens on signup
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            Token Balance
          </p>
          <p className="mt-2 text-lg font-semibold text-zinc-900">
            {balance.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-zinc-500">tokens remaining</p>
          <Link
            href="/subscriptions"
            className="mt-3 inline-block rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Buy Tokens
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            Member Since
          </p>
          <p className="mt-2 text-lg font-semibold text-zinc-900">
            {memberSince}
          </p>
          <p className="mt-1 text-sm text-zinc-500">account created</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-900">Plan Details</h2>
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Plan type</span>
            <span className="text-zinc-900">Free</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Starting tokens</span>
            <span className="text-zinc-900">1,000</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Tokens remaining</span>
            <span className="text-zinc-900">{balance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Tokens used</span>
            <span className="text-zinc-900">
              {(1000 - balance).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
