import { Navigate, useSearchParams } from 'react-router-dom';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();

  return <Navigate to={`/browse${query ? `?${query}` : ''}`} replace />;
}
