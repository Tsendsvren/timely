import Dashboard from './pages/Dashboard.jsx';
import Authenticate from './pages/Authenticate.jsx';
import Planner from './pages/Planner.jsx';
import TaskNew from './pages/TaskNew.jsx';
import TaskEdit from './pages/TaskEdit.jsx';
import Commitments from './pages/Commitments.jsx';
import FocusTimer from './pages/FocusTimer.jsx';
import Grades from './pages/Grades.jsx';
import GpaGoal from './pages/GpaGoal.jsx';
import Shop from './pages/Shop.jsx';
import Profile from './pages/Profile.jsx';
import AdminShop from './pages/AdminShop.jsx';

// team-spec.json-ийн routes-той таарна. access: guest | member | admin
// testId: page root-ийн data-testid (team-spec.json-д бүртгэлтэй)
export const routes = [
  { path: '/', testId: 'page-dashboard', access: 'member', Page: Dashboard },
  { path: '/authenticate', testId: 'page-authenticate', access: 'guest', Page: Authenticate },
  { path: '/planner', testId: 'page-planner', access: 'member', Page: Planner },
  { path: '/tasks/new', testId: 'page-task-new', access: 'member', Page: TaskNew },
  { path: '/tasks/:id', testId: 'page-task-edit', access: 'member', Page: TaskEdit },
  { path: '/commitments', testId: 'page-commitments', access: 'member', Page: Commitments },
  { path: '/focus-timer', testId: 'page-focus-timer', access: 'member', Page: FocusTimer },
  { path: '/grades', testId: 'page-grades', access: 'member', Page: Grades },
  { path: '/gpa-goal', testId: 'page-gpa-goal', access: 'member', Page: GpaGoal },
  { path: '/gamification/shop', testId: 'page-shop', access: 'member', Page: Shop },
  { path: '/profile', testId: 'page-profile', access: 'member', Page: Profile },
  { path: '/admin/shop', testId: 'page-admin-shop', access: 'admin', Page: AdminShop },
];
