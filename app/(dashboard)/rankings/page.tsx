'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy, Search, Medal, ChevronLeft, ChevronRight, X, SlidersHorizontal, Loader2
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { CandidateAvatar } from '@/components/shared/candidate-avatar';
import { StatusBadge } from '@/components/shared/status-badge';
import { ScoreBadge } from '@/components/shared/score-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { api } from '@/services/api';
import { DEGREES, DEPARTMENTS, COLLEGE_CATEGORIES, SKILL_OPTIONS } from '@/constants';

const PAGE_SIZE = 15;

function getMedalColor(rank: number) {
  if (rank === 1) return 'bg-warning/20 text-warning border-warning/30';
  if (rank === 2) return 'bg-muted text-muted-foreground border-border';
  if (rank === 3) return 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20';
  return 'bg-muted/50 text-muted-foreground border-border';
}

export default function RankingsPage() {
  const { data: candidatesData, isLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => api.getCandidates({ size: 100 }), // large page for local filtering/ranking
  });

  const candidates = candidatesData?.content || [];
  
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [degreeFilter, setDegreeFilter] = useState('all');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [minCgpa, setMinCgpa] = useState('0');
  const [minExp, setMinExp] = useState('0');
  const [page, setPage] = useState(0);

  const ranked = useMemo(() => {
    let result = [...candidates].sort((a: any, b: any) => (b.score || 0) - (a.score || 0));

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c: any) => c.name?.toLowerCase().includes(q) || c.institution?.toLowerCase().includes(q));
    }
    if (deptFilter !== 'all') result = result.filter((c: any) => c.department === deptFilter);
    if (degreeFilter !== 'all') result = result.filter((c: any) => c.degree === degreeFilter);
    if (collegeFilter !== 'all') result = result.filter((c: any) => c.collegeCategory === collegeFilter);
    if (skillFilter !== 'all') {
      result = result.filter((c: any) => {
        try {
          const skillsList = JSON.parse(c.skills || '[]');
          return skillsList.includes(skillFilter);
        } catch(e) {
          return false;
        }
      });
    }
    if (minCgpa && parseFloat(minCgpa) > 0) result = result.filter((c: any) => (c.cgpa ?? 0) >= parseFloat(minCgpa));
    if (minExp && parseInt(minExp) > 0) result = result.filter((c: any) => (c.totalExperienceMonths || 0) >= parseInt(minExp));

    return result;
  }, [candidates, search, deptFilter, degreeFilter, collegeFilter, skillFilter, minCgpa, minExp]);

  const totalPages = Math.ceil(ranked.length / PAGE_SIZE);
  const pageData = ranked.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const resetFilters = () => {
    setSearch(''); setDeptFilter('all'); setDegreeFilter('all');
    setCollegeFilter('all'); setSkillFilter('all');
    setMinCgpa('0'); setMinExp('0'); setPage(0);
  };

  const hasActiveFilters = search || deptFilter !== 'all' || degreeFilter !== 'all' || collegeFilter !== 'all' || skillFilter !== 'all' || (minCgpa && parseFloat(minCgpa) > 0) || (minExp && parseInt(minExp) > 0);

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
        title="Rankings"
        description={`${ranked.length} candidate${ranked.length !== 1 ? 's' : ''} ranked by score`}
        icon={Trophy}
      />

      {/* Top 3 Podium */}
      {ranked.length >= 3 && page === 0 && !hasActiveFilters && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 0, 2].map((podiumIdx) => {
            const c = ranked[podiumIdx];
            const rank = podiumIdx + 1;
            const heights = ['h-32', 'h-40', 'h-28'];
            const order = ['sm:order-2', 'sm:order-1', 'sm:order-3'];
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: podiumIdx * 0.1 }} className={order[podiumIdx]}>
                <Link href={`/candidates/${c.id}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="flex flex-col items-center p-5">
                      <div className={`flex w-full items-center justify-center rounded-t-xl ${getMedalColor(rank)} border-b py-2`}>
                        <Medal className="h-5 w-5" />
                        <span className="ml-1.5 text-sm font-bold">Rank {rank}</span>
                      </div>
                      <div className="mt-3"><CandidateAvatar name={c.name} size="lg" /></div>
                      <p className="mt-2 text-sm font-bold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.institution}</p>
                      <div className="mt-2"><ScoreBadge score={c.score} /></div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search candidates..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Departments</SelectItem>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={degreeFilter} onValueChange={(v) => { setDegreeFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[120px]"><SelectValue placeholder="Degree" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Degrees</SelectItem>{DEGREES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={collegeFilter} onValueChange={(v) => { setCollegeFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Tier" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Tiers</SelectItem>{COLLEGE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={skillFilter} onValueChange={(v) => { setSkillFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Skill" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Skills</SelectItem>{SKILL_OPTIONS.slice(0, 12).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" placeholder="Min CGPA" value={minCgpa} onChange={(e) => { setMinCgpa(e.target.value); setPage(0); }} className="w-[110px]" />
              <Input type="number" placeholder="Min Exp (m)" value={minExp} onChange={(e) => { setMinExp(e.target.value); setPage(0); }} className="w-[120px]" />
              {hasActiveFilters && <Button variant="ghost" size="sm" onClick={resetFilters}><X className="mr-1 h-3.5 w-3.5" />Clear</Button>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        {pageData.length === 0 ? (
          <EmptyState icon={Trophy} title="No candidates found" description="Try adjusting your filters." action={<Button variant="outline" onClick={resetFilters}>Clear filters</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Rank</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Degree</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageData.map((c: any, i: number) => {
                    const rank = page * PAGE_SIZE + i + 1;
                    return (
                      <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                        <TableCell>
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${getMedalColor(rank)}`}>
                            {rank}
                          </div>
                        </TableCell>
                        <TableCell><ScoreBadge score={c.score} /></TableCell>
                        <TableCell>
                          <Link href={`/candidates/${c.id}`} className="flex items-center gap-3 hover:underline">
                            <CandidateAvatar name={c.name} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{c.name}</p>
                              <p className="truncate text-xs text-muted-foreground">{c.department}</p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">{c.institution}</TableCell>
                        <TableCell className="text-sm">{c.degree}</TableCell>
                        <TableCell className="text-sm tabular-nums">
                          {(c.totalExperienceMonths || 0) < 12 ? `${c.totalExperienceMonths || 0}m` : `${((c.totalExperienceMonths || 0) / 12).toFixed(1)}y`}
                        </TableCell>
                        <TableCell><StatusBadge status={c.status} /></TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t p-4 sm:flex-row">
              <p className="text-xs text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, ranked.length)} of {ranked.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
                  <Button key={i} variant={page === i ? 'default' : 'outline'} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(i)}>{i + 1}</Button>
                ))}
                <Button variant="outline" size="icon" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
