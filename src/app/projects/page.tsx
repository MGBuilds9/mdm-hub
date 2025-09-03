'use client';

import { useState } from 'react';
import { useProjects, useDivisions } from '@/hooks/use-database';
import { ProjectList } from '@/components/projects/project-list';
import { ProjectForm } from '@/components/projects/project-form';
import { MainLayout } from '@/components/layout/main-layout';
import { Loading } from '@/components/ui/loading';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export const dynamic = 'force-dynamic';

export default function ProjectsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [viewingProject, setViewingProject] = useState<any>(null);

  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects();
  const { data: divisions, isLoading: divisionsLoading } = useDivisions();

  if (projectsLoading || divisionsLoading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  if (projectsError) {
    return (
      <MainLayout>
        <ErrorBoundary>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Projects
            </h2>
            <p className="text-charcoal-600">{projectsError.message}</p>
          </div>
        </ErrorBoundary>
      </MainLayout>
    );
  }

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowCreateForm(true);
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setShowCreateForm(true);
  };

  const handleViewProject = (project: any) => {
    setViewingProject(project);
    // Navigate to project detail page
    window.location.href = `/projects/${project.id}`;
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setEditingProject(null);
  };

  const handleFormCancel = () => {
    setShowCreateForm(false);
    setEditingProject(null);
  };

  if (showCreateForm) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <ProjectForm
            initialData={editingProject}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <ErrorBoundary>
          <ProjectList
            projects={projects || []}
            divisions={divisions || []}
            onCreateProject={handleCreateProject}
            onViewProject={handleViewProject}
            onEditProject={handleEditProject}
          />
        </ErrorBoundary>
      </div>
    </MainLayout>
  );
}
