const PageHeader = ({ title, description }) => (
  <div className="mb-6">
    <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
    {description && (
      <p className="mt-1 text-sm text-text-secondary">{description}</p>
    )}
  </div>
);

export default PageHeader;
