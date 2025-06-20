import React from 'react';
import { supabase } from '../lib/supabase';

interface Project {
  id: number;
  project_name: string;
}

interface ProjectContextType {
  project: Project | null;
  loading: boolean;
  refreshProject: () => Promise<void>;
  updateProject: (projectData: Project) => void;
  updateProjectName: (newName: string) => void;
}

const ProjectContext = React.createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = React.useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: React.ReactNode;
  userId?: string;
  isUserLoaded?: boolean;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ 
  children, 
  userId, 
  isUserLoaded 
}) => {
  const [project, setProject] = React.useState<Project | null>(null);
  const [loading, setLoading] = React.useState(false);

  const fetchProject = React.useCallback(async () => {
    if (!isUserLoaded || !userId) return;
    
    setLoading(true);
    try {
      const { data } = await supabase
        .from("projects")
        .select("id, project_name")
        .eq("user_id", userId)
        .single();
      setProject(data || null);
    } catch (error) {
      console.error('Error fetching project:', error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [isUserLoaded, userId]);

  const refreshProject = async () => {
    await fetchProject();
  };

  const updateProject = (projectData: Project) => {
    setProject(projectData);
  };

  const updateProjectName = (newName: string) => {
    if (project) {
      setProject({ ...project, project_name: newName });
    }
  };

  // Fetch project when user is loaded
  React.useEffect(() => {
    fetchProject();
  }, [isUserLoaded, userId, fetchProject]);

  const value: ProjectContextType = {
    project,
    loading,
    refreshProject,
    updateProject,
    updateProjectName,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}; 