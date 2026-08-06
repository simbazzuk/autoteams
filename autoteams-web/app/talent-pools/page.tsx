import {PageShell} from '@/components/Site'; import {ProtectedRoute} from '@/components/ProtectedRoute'; import {TalentPoolsPanel} from '@/components/workspaces/TalentPoolsPanel';
export default function Page(){return <PageShell><ProtectedRoute><TalentPoolsPanel/></ProtectedRoute></PageShell>}
