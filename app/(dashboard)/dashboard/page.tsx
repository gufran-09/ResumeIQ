'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  FileText, Users, CheckCircle2, XCircle, Clock,
  PieChart, GraduationCap, Wrench, TrendingUp, Briefcase, ArrowRight, Trophy,
  Loader2
} from 'lucide-react';
import {
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Area, AreaChart,
} from 'recharts';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { ChartCard } from '@/components/shared/chart-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { CandidateAvatar } from '@/components/shared/candidate-avatar';
import { ScoreBadge } from '@/components/shared/score-badge';
import { api } from '@/services/api';
import { COLLEGE_CATEGORIES } from '@/constants';

const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => api.getDashboardStats(),
  });

  const { data: candidatesData, isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => api.getCandidates({ size: 100 }), // fetch enough for charts
  });

  const { data: topRankedData, isLoading: topRankedLoading } = useQuery({
    queryKey: ['topRanked', 5],
    queryFn: () => api.getTopRanked(5),
  });

  const candidates = candidatesData?.content || [];
  const topRanked = topRankedData || [];

  const statusData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Shortlisted', value: stats.shortlisted },
      { name: 'Rejected', value: stats.rejected },
      { name: 'Pending', value: stats.pendingReview },
    ];
  }, [stats]);

  const collegeData = useMemo(
    () =>
      COLLEGE_CATEGORIES.map((cat) => ({
        name: cat,
        value: candidates.filter((c: any) => c.collegeCategory === cat).length,
      })),
    [candidates]
  );

  const skillsData = useMemo(() => {
    const counts = new Map<string, number>();
    candidates.forEach((c: any) => {
      let skillsList = [];
      try {
         skillsList = JSON.parse(c.skills || '[]');
      } catch (e) {}
      skillsList.forEach((s: string) => counts.set(s, (counts.get(s) ?? 0) + 1));
    });
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [candidates]);

  const cgpaData = useMemo(() => {
    const buckets = [
      { name: '6.0-7.0', min: 6, max: 7 },
      { name: '7.0-8.0', min: 7, max: 8 },
      { name: '8.0-9.0', min: 8, max: 9 },
      { name: '9.0-10.0', min: 9, max: 10 },
    ];
    return buckets.map((b) => ({
      name: b.name,
      value: candidates.filter((c: any) => c.cgpa >= b.min && c.cgpa < b.max + 0.01).length,
    }));
  }, [candidates]);

  const expData = useMemo(() => {
    const buckets = [
      { name: '0-6m', min: 0, max: 6 },
      { name: '6-12m', min: 6, max: 12 },
      { name: '1-2y', min: 12, max: 24 },
      { name: '2-3y', min: 24, max: 36 },
    ];
    return buckets.map((b) => ({
      name: b.name,
      value: candidates.filter((c: any) => {
        const m = c.totalExperienceMonths;
        return m >= b.min && m < b.max;
      }).length,
    }));
  }, [candidates]);

  const isLoading = statsLoading || candidatesLoading || topRankedLoading;

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
        title="Dashboard"
        description="Overview of resume shortlisting activity and outcomes."
        icon={FileText}
        actions={
          <Button asChild>
            <Link href="/upload"><FileText className="mr-1.5 h-4 w-4" />Upload Resumes</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Resumes" value={stats?.totalResumes || 0} icon={FileText} variant="primary" delay={0} />
        <StatCard title="Candidates" value={stats?.totalCandidates || 0} icon={Users} variant="info" delay={0.05} />
        <StatCard title="Shortlisted" value={stats?.shortlisted || 0} icon={CheckCircle2} variant="success" delay={0.1} />
        <StatCard title="Rejected" value={stats?.rejected || 0} icon={XCircle} variant="destructive" delay={0.15} />
        <StatCard title="Pending Review" value={stats?.pendingReview || 0} icon={Clock} variant="warning" delay={0.2} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Candidate Distribution" description="By shortlisting status" icon={PieChart}>
          <ResponsiveContainer width="100%" height={260}>
            <RePieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
            </RePieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4">
            {statusData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                <span className="text-xs text-muted-foreground">{s.name}: {s.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="College Category" description="Distribution by tier" icon={GraduationCap}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={collegeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
              <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Skills Distribution" description="Top skills across candidates" icon={Wrench} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={skillsData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
              <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="CGPA Distribution" description="By CGPA range" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={cgpaData}>
              <defs>
                <linearGradient id="cgpaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#cgpaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Experience Distribution" description="By duration" icon={Briefcase}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={expData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
              <Bar dataKey="value" fill="hsl(var(--chart-3))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Recent Uploads</CardTitle>
                <p className="text-xs text-muted-foreground">Latest candidate resumes</p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/candidates">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {candidates.slice(0, 5).map((c: any, i: number) => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/candidates/${c.id}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors">
                  <CandidateAvatar name={c.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.institution}</p>
                  </div>
                  <ScoreBadge score={c.score} />
                  <StatusBadge status={c.status} />
                </Link>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-warning/10 p-1.5">
              <Trophy className="h-4 w-4 text-warning" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Top Ranked Candidates</CardTitle>
              <p className="text-xs text-muted-foreground">Highest scoring candidates</p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/rankings">View rankings <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topRanked.map((c: any, i: number) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/candidates/${c.id}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <CandidateAvatar name={c.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.degree} &middot; {c.institution}</p>
                  </div>
                  <div className="hidden items-center gap-1.5 sm:flex">
                    {(() => {
                      let parsedSkills = [];
                      try { parsedSkills = JSON.parse(c.skills || '[]'); } catch(e){}
                      return parsedSkills.slice(0, 3).map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                      ));
                    })()}
                  </div>
                  <ScoreBadge score={c.score} />
                </Link>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
