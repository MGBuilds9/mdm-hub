import { ClientGeneric } from '@/components/pages/client-generic';

export default function TestPage() {
  return (
    <ClientGeneric title="Test Page" description="Testing and development page">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-charcoal-600">Test functionality coming soon...</p>
      </div>
    </ClientGeneric>
  );
}
