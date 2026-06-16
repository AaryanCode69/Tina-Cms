import Link from "next/link";

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero__content">
          <h1 className="hero__title">
            Terraform Configuration
            <span className="hero__title-accent"> Builder</span>
          </h1>
          <p className="hero__subtitle">
            Generate schema-compliant JSON configurations through a guided form
            interface. No manual JSON editing required.
          </p>
          <div className="hero__actions">
            <Link href="/subscriptions/new" className="hero__cta">
              <span className="hero__cta-icon">+</span>
              Create Subscription
            </Link>
          </div>
        </div>

        <div className="hero__features">
          <div className="feature-card">
            <div className="feature-card__icon">📋</div>
            <h3 className="feature-card__title">Form-Driven</h3>
            <p className="feature-card__desc">
              Fill out guided forms instead of editing raw JSON files.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon">✓</div>
            <h3 className="feature-card__title">Schema Validated</h3>
            <p className="feature-card__desc">
              Every configuration is validated against the JSON Schema before submission.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon">⎇</div>
            <h3 className="feature-card__title">Git Integrated</h3>
            <p className="feature-card__desc">
              Automatically creates a branch, commits the file, and opens a Pull Request.
            </p>
          </div>
        </div>
      </section>

      <section className="resource-types">
        <h2 className="resource-types__title">Available Resource Types</h2>
        <div className="resource-types__grid">
          <Link href="/subscriptions/new" className="resource-type-card resource-type-card--active">
            <div className="resource-type-card__icon">☁</div>
            <h3 className="resource-type-card__title">Subscriptions</h3>
            <p className="resource-type-card__desc">
              Create Azure subscription configurations with location, alias, and management group details.
            </p>
            <span className="resource-type-card__badge">Available</span>
          </Link>

          <div className="resource-type-card resource-type-card--disabled">
            <div className="resource-type-card__icon">📦</div>
            <h3 className="resource-type-card__title">Resource Groups</h3>
            <p className="resource-type-card__desc">
              Define resource groups with tags and role assignments.
            </p>
            <span className="resource-type-card__badge resource-type-card__badge--coming">Coming Soon</span>
          </div>

          <div className="resource-type-card resource-type-card--disabled">
            <div className="resource-type-card__icon">🔐</div>
            <h3 className="resource-type-card__title">Role Assignments</h3>
            <p className="resource-type-card__desc">
              Configure role-based access control assignments.
            </p>
            <span className="resource-type-card__badge resource-type-card__badge--coming">Coming Soon</span>
          </div>

          <div className="resource-type-card resource-type-card--disabled">
            <div className="resource-type-card__icon">👥</div>
            <h3 className="resource-type-card__title">User Groups</h3>
            <p className="resource-type-card__desc">
              Manage user groups with owners, members, and role assignments.
            </p>
            <span className="resource-type-card__badge resource-type-card__badge--coming">Coming Soon</span>
          </div>
        </div>
      </section>
    </div>
  );
}
