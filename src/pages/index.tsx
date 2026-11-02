import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home(): ReactNode {
  return (
    <Layout
      title="PS5 Linux Wiki"
      description="Documentation and guides for Linux on PlayStation 5">
      <main className="container margin-vert--xl">
        <div className="hero hero--primary">
          <div className="container">
            <h1 className="hero__title">PS5 Linux Wiki</h1>
            <p className="hero__subtitle">
              Documentation, guides and resources for Linux on PlayStation 5.
            </p>
            <Link
              className="button button--secondary button--lg"
              to="/docs/intro">
              Get started
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}