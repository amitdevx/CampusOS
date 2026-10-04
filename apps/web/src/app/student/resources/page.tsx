'use client';
import ResourceBookingList from '@/components/ResourceBookingList';

export default function StudentResourcesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#09090B] tracking-tight mb-8">Campus Resources</h1>
      <ResourceBookingList />
    </div>
  );
}
