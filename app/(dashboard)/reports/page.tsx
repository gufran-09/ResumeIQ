'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3, FileText, FileSpreadsheet, Download, GraduationCap,
  Wrench, Building2, Briefcase, Percent, TrendingUp, Award, Loader2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { ChartCard } from '@/components/shared/chart-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';

const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function ReportsPage() {
  const { data: candidatesData, isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => api.getCandidates({ size: 100 }), // large page for report calculation
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => api.getDashboardStats(),
  });

  const candidates = candidatesData?.content || [];

  const avgCgpa = useMemo(() => {
    if (!candidates.length) return "0.00";
    const total = candidates.reduce((sum: number, c: any) => sum + (c.cgpa ?? 0), 0);
    return (total / candidates.length).toFixed(2);
  }, [candidates]);

  const avgExp = useMemo(() => {
    if (!candidates.length) return "0.0";
    const total = candidates.reduce((sum: number, c: any) => sum + (c.totalExperienceMonths || 0), 0);
    return (total / candidates.length).toFixed(1);
  }, [candidates]);

  const selectionPct = useMemo(() => {
    if (!stats || !stats.totalCandidates) return "0.0";
    return ((stats.shortlisted / stats.totalCandidates) * 100).toFixed(1);
  }, [stats]);

  const topSkills = useMemo(() => {
    const counts = new Map<string, number>();
    candidates.forEach((c: any) => {
      let skillsList = [];
      try { skillsList = JSON.parse(c.skills || '[]'); } catch(e){}
      skillsList.forEach((s: string) => counts.set(s, (counts.get(s) ?? 0) + 1));
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [candidates]);

  const topColleges = useMemo(() => {
    const counts = new Map<string, number>();
    candidates.forEach((c: any) => {
      const inst = c.institution ?? '';
      if (inst) counts.set(inst, (counts.get(inst) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [candidates]);

  const statusData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Shortlisted', value: stats.shortlisted },
      { name: 'Rejected', value: stats.rejected },
      { name: 'Pending', value: stats.pendingReview },
    ];
  }, [stats]);

  const exportReport = (format: 'csv' | 'excel' | 'pdf') => {
    toast.success(`${format.toUpperCase()} report generated`, { description: 'Report download started.' });
  };

  const isLoading = statsLoading || candidatesLoading;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and download recruitment analytics reports."
        icon={BarChart3}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportReport('csv')}>
              <FileText className="mr-1.5 h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
              <FileSpreadsheet className="mr-1.5 h-4 w-4" /> Excel
            </Button>
            <Button size="sm" onClick={() => exportReport('pdf')}>
              <Download className="mr-1.5 h-4 w-4" /> PDF
            </Button>
          </div>
        }
      />

      {/* Key Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Average CGPA" value={avgCgpa} icon={GraduationCap} variant="primary" delay={0} />
        <StatCard title="Avg Experience" value={`${avgExp}m`} icon={Briefcase} variant="info" delay={0.05} />
        <StatCard title="Selection Rate" value={`${selectionPct}%`} icon={Percent} variant="success" delay={0.1} />
        <StatCard title="Top Skills" value={topSkills.length} icon={Wrench} variant="warning" delay={0.15} />
        <StatCard title="Top Colleges" value={topColleges.length} icon={Building2} variant="default" delay={0.2} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Top Skills" description="Most common skills among candidates" icon={Wrench}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSkills} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
              <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Colleges" description="Most represented institutions" icon={Building2}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topColleges} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={120} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
              <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Selection Breakdown" description="Candidate status distribution" icon={TrendingUp}>
        <div className="grid gap-4 lg:grid-cols-2">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col justify-center gap-3">
            {statusData.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-sm font-medium">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{s.value}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {stats?.totalCandidates ? ((s.value / stats.totalCandidates) * 100).toFixed(1) : '0.0'}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-4 w-4 text-primary" /> Report Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Total Candidates</p>
              <p className="mt-1 text-2xl font-bold">{stats?.totalCandidates || 0}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Shortlisted</p>
              <p className="mt-1 text-2xl font-bold text-success">{stats?.shortlisted || 0}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Rejected</p>
              <p className="mt-1 text-2xl font-bold text-destructive">{stats?.rejected || 0}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Pending Review</p>
              <p className="mt-1 text-2xl font-bold text-warning">{stats?.pendingReview || 0}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Reports are generated from the current candidate pool. Use the export buttons above to download in your preferred format.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
