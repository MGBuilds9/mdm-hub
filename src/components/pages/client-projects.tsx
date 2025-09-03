'use client';

import { useState } from 'react';
import { useProjects, useDivisions } from '@/hooks/use-database';
import { ProjectList } from '@/components/projects/project-list';
import { ProjectForm } from '@/components/projects/project-form';
import { MainLayout } from '@/components/layout/main-layout';
import { Loading } from '@/components/ui/loading';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export function ClientProjects() {
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-charcoal-950">Projects</h1>
            <p className="text-charcoal-600 mt-2">
              Manage your construction projects
            </p>
          </div>
          <button
            onClick={handleCreateProject}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Project
          </button>
        </div>

        {showCreateForm && (
          <ProjectForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            initialData={editingProject}
          />
        )}

        <ProjectList
          projects={projects || []}
          divisions={divisions || []}
          onEditProject={handleEditProject}
          onViewProject={handleViewProject}
        />
      </div>
    </MainLayout>
  );
}
