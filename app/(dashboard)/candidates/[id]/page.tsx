'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Mail, Phone, Download, GraduationCap, Briefcase, Wrench,
  Award, FileText, CheckCircle2, XCircle, ExternalLink, Calendar, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CandidateAvatar } from '@/components/shared/candidate-avatar';
import { StatusBadge } from '@/components/shared/status-badge';
import { ScoreBadge } from '@/components/shared/score-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { api } from '@/services/api';
import { CRITERIA_LABELS } from '@/constants';

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: candidate, isLoading, error } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => api.getCandidateById(id),
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <EmptyState
        icon={FileText}
        title="Candidate not found"
        description="The candidate you're looking for doesn't exist or an error occurred."
        action={<Button asChild><Link href="/candidates"><ArrowLeft className="mr-1.5 h-4 w-4" />Back to candidates</Link></Button>}
      />
    );
  }

  const breakdown = candidate.scoringBreakdown;
  const positiveReasons = candidate.selectionReasons.filter((r: any) => r.type === 'positive');
  const negativeReasons = candidate.selectionReasons.filter((r: any) => r.type === 'negative');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/candidates"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{candidate.name}</h1>
          <p className="text-sm text-muted-foreground">Candidate Profile & Scoring Breakdown</p>
        </div>
      </div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <CandidateAvatar name={candidate.name} size="lg" />
                <div>
                  <h2 className="text-lg font-bold">{candidate.name}</h2>
                  <p className="text-sm text-muted-foreground">{candidate.education[0]?.degree} in {candidate.department}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={candidate.status} />
                    <ScoreBadge score={candidate.score} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="mr-1.5 h-4 w-4" /> Email
                </Button>
                <Button size="sm">
                  <Download className="mr-1.5 h-4 w-4" /> Download Resume
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium truncate">{candidate.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{candidate.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Uploaded:</span>
                <span className="font-medium">{new Date(candidate.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="scoring">Scoring Breakdown</TabsTrigger>
          <TabsTrigger value="resume">Resume Preview</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <GraduationCap className="h-4 w-4 text-primary" /> Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidate.education.map((edu: any) => (
                  <div key={edu.id} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{edu.degree} — {edu.department}</p>
                    <p className="text-xs text-muted-foreground">{edu.institution}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <Badge variant="secondary">{edu.collegeCategory}</Badge>
                      <span className="text-muted-foreground">CGPA: <span className="font-medium text-foreground">{edu.cgpa.toFixed(1)}</span></span>
                      <span className="text-muted-foreground">Graduated: {edu.graduationYear}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Briefcase className="h-4 w-4 text-primary" /> Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.experience.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No experience listed.</p>
                ) : (
                  <div className="space-y-3">
                    {candidate.experience.map((exp: any) => (
                      <div key={exp.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{exp.role}</p>
                          <Badge variant="outline" className="text-[10px]">{exp.durationMonths}m</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{exp.company}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wrench className="h-4 w-4 text-primary" /> Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((s: any) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="h-4 w-4 text-primary" /> Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.certifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No certifications listed.</p>
                ) : (
                  <div className="space-y-2">
                    {candidate.certifications.map((cert: any) => (
                      <div key={cert.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="text-sm font-medium">{cert.name}</p>
                          <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{cert.year}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Projects */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-primary" /> Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No projects listed.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {candidate.projects.map((proj: any) => (
                      <div key={proj.id} className="rounded-lg border p-3">
                        <p className="text-sm font-medium">{proj.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{proj.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {proj.technologies.map((t: any) => (
                            <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scoring Tab */}
        <TabsContent value="scoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scoring Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(['cgpa', 'skills', 'experience', 'projects', 'collegeCategory'] as const).map((key) => {
                const score = breakdown[key];
                return (
                  <div key={key}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium">{CRITERIA_LABELS[key]}</span>
                      <span className="tabular-nums text-muted-foreground">{score.toFixed(1)} / 100</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                );
              })}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Total Score</span>
                <ScoreBadge score={breakdown.total} className="text-base" />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-4 w-4 text-success" /> Reasons for Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {positiveReasons.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No positive factors identified.</p>
                ) : (
                  positiveReasons.map((r: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg border border-success/20 bg-success/5 p-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <div>
                        <p className="text-sm font-medium">{r.criterion}</p>
                        <p className="text-xs text-muted-foreground">{r.detail}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <XCircle className="h-4 w-4 text-destructive" /> Reasons for Rejection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {negativeReasons.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No negative factors identified.</p>
                ) : (
                  negativeReasons.map((r: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      <div>
                        <p className="text-sm font-medium">{r.criterion}</p>
                        <p className="text-xs text-muted-foreground">{r.detail}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resume Tab */}
        <TabsContent value="resume">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Resume Preview</span>
                <Button variant="outline" size="sm">
                  <Download className="mr-1.5 h-4 w-4" /> Download
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16">
                <div className="rounded-2xl bg-muted p-5">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm font-medium">{candidate.resumeFileName}</p>
                <p className="mt-1 text-xs text-muted-foreground">Resume preview will be available once the parsing service is connected.</p>
                <Button variant="outline" size="sm" className="mt-4">
                  <ExternalLink className="mr-1.5 h-4 w-4" /> Open in new tab
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
