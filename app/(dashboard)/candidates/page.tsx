'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import {
  Users, Search, Download, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  FileSpreadsheet, FileText, Eye, SlidersHorizontal, X, Loader2
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
import { DEGREES, DEPARTMENTS, COLLEGE_CATEGORIES } from '@/constants';
import type { Candidate, CandidateStatus } from '@/types';

type SortKey = 'name' | 'degree' | 'cgpa' | 'experience' | 'score';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

export default function CandidatesPage() {
  const { data: candidatesData, isLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => api.getCandidates({ size: 100 }), // Fetch a large chunk for local filtering/sorting
  });

  const candidates = candidatesData?.content || [];
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [degreeFilter, setDegreeFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [collegeFilter, setCollegeFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let result = [...candidates];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c: any) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.institution?.toLowerCase().includes(q) ||
          (c.skills && c.skills.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'all') result = result.filter((c: any) => c.status === statusFilter);
    if (degreeFilter !== 'all') result = result.filter((c: any) => c.degree === degreeFilter);
    if (deptFilter !== 'all') result = result.filter((c: any) => c.department === deptFilter);
    if (collegeFilter !== 'all') result = result.filter((c: any) => c.collegeCategory === collegeFilter);

    result.sort((a: any, b: any) => {
      let av: string | number, bv: string | number;
      switch (sortKey) {
        case 'name': av = a.name || ''; bv = b.name || ''; break;
        case 'degree': av = a.degree || ''; bv = b.degree || ''; break;
        case 'cgpa': av = a.cgpa || 0; bv = b.cgpa || 0; break;
        case 'experience': av = a.totalExperienceMonths || 0; bv = b.totalExperienceMonths || 0; break;
        case 'score': av = a.score || 0; bv = b.score || 0; break;
        default: av = a.score || 0; bv = b.score || 0; break;
      }
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

    return result;
  }, [candidates, search, statusFilter, degreeFilter, deptFilter, collegeFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Degree', 'College', 'CGPA', 'Experience (months)', 'Score', 'Status'];
    const rows = filtered.map((c: any) => [
      c.name, c.email, c.degree || '', c.institution || '',
      c.cgpa || '', c.totalExperienceMonths || 0, c.score || 0, c.status || 'pending',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidates.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const exportExcel = () => {
    const headers = ['Name', 'Email', 'Degree', 'College', 'CGPA', 'Experience (months)', 'Score', 'Status'];
    const rows = filtered.map((c: any) => [
      c.name, c.email, c.degree || '', c.institution || '',
      c.cgpa || '', c.totalExperienceMonths || 0, c.score || 0, c.status || 'pending',
    ]);
    const html = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidates.xls';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Excel exported successfully');
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDegreeFilter('all');
    setDeptFilter('all');
    setCollegeFilter('all');
    setPage(0);
  };

  const hasActiveFilters = search || statusFilter !== 'all' || degreeFilter !== 'all' || deptFilter !== 'all' || collegeFilter !== 'all';

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronUp className="h-3.5 w-3.5 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />;
  };

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
        title="Candidates"
        description={`${filtered.length} candidate${filtered.length !== 1 ? 's' : ''} found`}
        icon={Users}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <FileText className="mr-1.5 h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportExcel}>
              <FileSpreadsheet className="mr-1.5 h-4 w-4" /> Excel
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, college, or skill..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={degreeFilter} onValueChange={(v) => { setDegreeFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[120px]"><SelectValue placeholder="Degree" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Degrees</SelectItem>
                  {DEGREES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={collegeFilter} onValueChange={(v) => { setCollegeFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="College Tier" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  {COLLEGE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="mr-1 h-3.5 w-3.5" /> Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        {pageData.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No candidates found"
            description="Try adjusting your filters or search query."
            action={<Button variant="outline" onClick={resetFilters}>Clear filters</Button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('name')}>
                        Candidate <SortIcon k="name" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('degree')}>
                        Degree <SortIcon k="degree" />
                      </button>
                    </TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('cgpa')}>
                        CGPA <SortIcon k="cgpa" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('experience')}>
                        Experience <SortIcon k="experience" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('score')}>
                        Score <SortIcon k="score" />
                      </button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageData.map((c: any, i: number) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="group"
                    >
                      <TableCell>
                        <Link href={`/candidates/${c.id}`} className="flex items-center gap-3 hover:underline">
                          <CandidateAvatar name={c.name || 'Unknown'} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{c.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{c.degree}</TableCell>
                      <TableCell className="text-sm">{c.institution}</TableCell>
                      <TableCell className="text-sm font-medium tabular-nums">{c.cgpa?.toFixed(1)}</TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {(c.totalExperienceMonths || 0) < 12 ? `${c.totalExperienceMonths || 0}m` : `${((c.totalExperienceMonths || 0) / 12).toFixed(1)}y`}
                      </TableCell>
                      <TableCell><ScoreBadge score={c.score || 0} /></TableCell>
                      <TableCell><StatusBadge status={c.status || 'pending'} /></TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/candidates/${c.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 border-t p-4 sm:flex-row">
              <p className="text-xs text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8 text-xs"
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button variant="outline" size="icon" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
