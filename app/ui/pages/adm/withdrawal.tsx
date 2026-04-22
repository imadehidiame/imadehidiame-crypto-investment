'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, DollarSign, Mail, User, Hash, Info } from 'lucide-react';
import SectionWrapper from '../../components/section-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminWithdrawal } from '@/types';
import { Toasting } from '../../lib/loader/loading-anime';

interface AdminWithdrawalTableProps {
  withdrawals: AdminWithdrawal[];
}

export default function AdminWithdrawalPage({ withdrawals }: AdminWithdrawalTableProps) {
  const [loading, setLoading] = useState(false);
  const [pageWithdrawals, setPageWithdrawals] = useState<AdminWithdrawal[]>(withdrawals);

  const getStatusBadge = (stage: number) => {
    const configs: Record<number, { label: string; className: string; variant: "outline" | "default" | "destructive" }> = {
      4: { label: "Completed", className: "bg-green-600 text-white", variant: "default" },
      3: { label: "Withdrawal Pending", className: "border-blue-500 text-blue-500", variant: "outline" },
      1: { label: "Upgrade Fee Pending", className: "border-amber-500 text-amber-500", variant: "outline" },
      5: { label: "Cancelled", className: "", variant: "destructive" },
    };

    const config = configs[stage] || { label: "Withdrawal Fee Pending", className: "border-amber-500 text-amber-500", variant: "outline" };
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  async function upgradeWithdrawal(userId: string, withdrawalId: string) {
    if (!userId || !withdrawalId) return;
    setLoading(true);
    try {
      const served = await fetch(`/api/withdrawal/adm/withdrawal/${withdrawalId}/user/${userId}`, {
        method: 'PATCH',
        headers: {
          'X-WITH-ID': withdrawalId,
          'X-USE-ID': userId,
          'X-STA-ID': '1',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stage: 1 })
      });

      if (served.ok) {
        const response = await served.json();
        Toasting.success(response.message, 10000);
        setPageWithdrawals(prev => prev.map(e => (e._id === withdrawalId && e.userId === userId ? { ...e, stage: 2 } : e)));
      } else {
        const response = await served.json();
        Toasting.error(response.error || 'An error occurred', 10000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionWrapper animationType='fadeInUp' padding='4' md_padding='4'>
      <div className="space-y-6">
        <CardTitle className="text-2xl font-bold text-amber-300 px-2">Withdrawals</CardTitle>

        <Card className="bg-gray-900 border-amber-300/30 overflow-hidden">
          <CardHeader className="border-b border-amber-400/10 bg-gray-800/50">
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6 text-amber-400" />
              <CardTitle className="text-lg font-bold text-amber-300">Management Console</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* --- DESKTOP TABLE VIEW (Hidden on Mobile) --- */}
            <div className="hidden md:block">
              <Table>
                <TableHeader className="bg-zinc-950">
                  <TableRow className="border-amber-400/20 hover:bg-transparent">
                    <TableHead className="text-amber-400">User</TableHead>
                    <TableHead className="text-amber-400">Amount</TableHead>
                    <TableHead className="text-amber-400">Code</TableHead>
                    <TableHead className="text-amber-400">Status</TableHead>
                    <TableHead className="text-amber-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageWithdrawals.map((w) => (
                    <TableRow key={w._id} className="border-amber-400/10 hover:bg-zinc-900/50">
                      <TableCell>
                        <div className="font-medium text-white">{w.customer}</div>
                        <div className="text-xs text-gray-400">{w.email}</div>
                      </TableCell>
                      <TableCell className="text-amber-400 font-bold">${w.amount.toLocaleString()}</TableCell>
                      <TableCell><code className="bg-black px-2 py-1 rounded text-amber-500">{w.withdrawalCode}</code></TableCell>
                      <TableCell>{getStatusBadge(w.stage)}</TableCell>
                      <TableCell className="text-right">
                        <ActionButton withdrawal={w} loading={loading} onUpgrade={upgradeWithdrawal} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* --- MOBILE CARD VIEW (Hidden on Desktop) --- */}
            <div className="block md:hidden divide-y divide-amber-400/10">
              {pageWithdrawals.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No requests found</div>
              ) : (
                pageWithdrawals.map((w) => (
                  <div key={w._id} className="p-4 space-y-4 bg-zinc-950/30">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                          <User className="h-4 w-4 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-white font-bold">{w.customer}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {w.email}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-black text-amber-400">${w.amount.toLocaleString()}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-2 border-y border-white/5">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 flex items-center gap-1">
                          <Hash className="h-3 w-3" /> Code
                        </p>
                        <code className="text-amber-200 text-sm">{w.withdrawalCode}</code>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 flex items-center gap-1">
                          <Info className="h-3 w-3" /> Status
                        </p>
                        <div className="scale-90 origin-left">{getStatusBadge(w.stage)}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="text-xs text-gray-500 bg-black/40 p-2 rounded border border-white/5">
                            <span className="font-bold text-gray-400">Payment:</span> {w.paymentDetails || 'None'}
                        </div>
                        <ActionButton withdrawal={w} loading={loading} onUpgrade={upgradeWithdrawal} isMobile />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionWrapper>
  );
}

// Sub-component to prevent code duplication
function ActionButton({ withdrawal, loading, onUpgrade, isMobile }: any) {
  if (withdrawal.stage === 1) {
    return (
      <Button
        size={isMobile ? "default" : "sm"}
        onClick={() => onUpgrade(withdrawal.userId, withdrawal._id)}
        disabled={loading}
        className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/20"
      >
        <CheckCircle className="mr-2 h-4 w-4" /> Confirm Upgrade
      </Button>
    );
  }
  if (withdrawal.stage === 3) {
    return (
      <Button
        size={isMobile ? "default" : "sm"}
        disabled={loading}
        className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
      >
        <CheckCircle className="mr-2 h-4 w-4" /> Complete
      </Button>
    );
  }
  return null;
}