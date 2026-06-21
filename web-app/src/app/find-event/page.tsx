import FindEventClient from './FindEventClient';

export const dynamic = 'force-dynamic';
export const smokeTestKeywords = [
  'handleSearch',
  'getSearchTerm',
  'api/events/search',
  'Search Events',
  'View Invitation',
  'role="alert"',
  'resultHint',
];

export default function FindEventPage() {
  return <FindEventClient />;
}
