import { Link } from 'react-router';
import type { Route } from './+types/home';

export default function Home({ loaderData }: Route.ComponentProps) {
  return <div className="p-8">
    <Link to="/chat" className="link">Start Chatting</Link>
  </div>
}
