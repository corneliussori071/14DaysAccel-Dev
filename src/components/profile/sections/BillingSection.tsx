"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTokenTransactions } from "@/services/tokenService";
import { getTokenBalance } from "@/services/tokenService";
import type { TokenTransaction } from "@/types/softwarePlan";

export default function BillingSection() {
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const [txData, bal] = await Promise.all([
        getTokenTransactions(),
        getTokenBalance().catch(() => 0),
      ]);
      setTransactions(txData);
      setBalance(bal);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-6 sm:p-8">
        <p className="text-sm text-zinc-500">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:p-8">
      <h1 className="text-xl font-semibold text-zinc-900">Billing</h1>
      <p className="mt-1 text-sm text-zinc-500">
        View your token transaction history.
      </p>

      {balance !== null && (
        <div className="mt-4 flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex-1">
            <p className="text-sm text-zinc-500">Current balance</p>
            <p className="text-lg font-semibold text-zinc-900">
              {balance.toLocaleString()} tokens
            </p>
          </div>
          <Link
            href="/subscriptions"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Buy Tokens
          </Link>
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            No transactions yet. Use the Software Designer to generate plans.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  Operation
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  Description
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-600">
                  Tokens
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-zinc-100 last:border-b-0"
                >
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 capitalize">
                    {tx.operation_type.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {tx.description}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-zinc-900">
                    -{tx.tokens_used}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
