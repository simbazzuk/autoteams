import {PageShell} from '@/components/Site'; import {ProtectedRoute} from '@/components/ProtectedRoute'; import {WorkspacesPanel} from '@/components/workspaces/WorkspacesPanel';
export default function Page(){return <PageShell><ProtectedRoute><WorkspacesPanel/></ProtectedRoute></PageShell>}
