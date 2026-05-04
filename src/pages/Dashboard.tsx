import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import NewsView from '../components/news/NewsView';
import NewsCategoriesView from '../components/categories/NewsCategoriesView';
import ProjectsView from '../components/projects/ProjectsView';
import ProjectCategoriesView from '../components/projects/ProjectCategoriesView';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('news');

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-7xl">
          {activeTab === 'news' && <NewsView />}
          {activeTab === 'news-categories' && <NewsCategoriesView />}
          {activeTab === 'projects' && <ProjectsView />}
          {activeTab === 'project-categories' && <ProjectCategoriesView />}
        </div>
      </main>
    </div>
  );
}
